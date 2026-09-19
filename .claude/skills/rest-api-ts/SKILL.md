---
name: rest-api-ts
description: Padrões de API REST em TypeScript com camadas route/controller/service, envelope de resposta único, ServiceResult em vez de exceções, validação com zod no middleware, escopo solo/grupo no Supabase e mapa de código de erro para status HTTP. Use sempre que a tarefa envolver criar ou alterar endpoint, rota, controller, service, schema de validação, middleware, código de erro ou tratamento de erro na API do backend, mesmo que o pedido não use essas palavras — inclui frases como "cria um endpoint de X", "adiciona validação em Y", "esse endpoint está retornando erro", "preciso salvar isso no servidor", ou pedidos que chegam pelo lado do app e exigem mudança na API.
---

# API REST em TypeScript — padrões de camadas e contrato

Este é o conjunto de convenções da API deste monorepo, onde o cliente
(o app Expo em `financeiro-app/`) tem **um único parser de resposta**
(`src/services/request.ts`). Nesse arranjo, uma rota que foge do formato não dá
erro de compilação nem de teste: a chamada "funciona" e o app mostra erro
genérico. As regras abaixo existem para tornar esse tipo de quebra impossível,
não por estilo.

**Leia `references/project.md` junto com este arquivo**: é onde estão os
caminhos reais, a regra de escopo solo/grupo, o rebuild do `@app/shared`, o
comando de typecheck e as divergências já conhecidas do código atual.

## Camadas

O fluxo é sempre o mesmo:

```
routes -> controller -> service -> supabase
```

```
backend/src/
├── routes/        # caminho + middlewares. Zero lógica.
├── controllers/   # resultado do service -> HTTP. Zero regra de negócio.
├── services/      # regra de negócio. Nunca lança.
│   └── <domínio>/ # acesso a dados extraído, quando cresce (ver adiante)
├── schemas/       # zod do que não sai do servidor (auth, senha, perfil)
├── middleware/    # auth, scope, validate, rate limit, errorHandler, notFound
├── types/         # ServiceResult, HttpResponse, enums de código de erro
├── errors/        # mapa código -> status HTTP, um por domínio
├── constants/     # listas de colunas, valores fixos
├── config/        # env validado
├── database/      # clientes supabase
└── utils/         # helpers puros e helpers de controller
```

Schemas compartilhados com o app moram fora do backend, em
`packages/shared/src/schemas/` (pacote `@app/shared`) — ver a seção adiante.

O teste que mantém as camadas honestas: **se você precisa do objeto
`response` dentro de um service, ou do cliente supabase dentro de um
controller, a lógica está na camada errada.**

### Onde vai cada schema

Duas casas, e a escolha é objetiva:

- **`packages/shared/src/schemas/<domínio>.schema.ts`** quando o app também
  precisa da mesma regra ou do tipo da resposta. Exporte no `index.ts` do
  pacote e importe no backend como `@app/shared`. É o que vale para produto,
  meta, grupo, paginação e estatísticas.
- **`backend/src/schemas/<nome>Schema.ts`** quando o payload não sai do
  servidor: registro, login, refresh, troca de senha, perfil.

Campo reaproveitado vira um construtor exportado (`passwordField`,
`usernameField`) que os payloads compõem. Extrair vale a pena quando dois
schemas precisam do mesmo limite — é o que impede que eles divirjam sem
ninguém notar.

Duplicar um schema do shared dentro do backend é o erro caro aqui: o app passa
a validar uma regra e a API outra, e a divergência só aparece como "salvou no
app e o servidor recusou".

### Quando extrair o acesso a dados

Não existe camada `models/` neste projeto. Para um CRUD simples, o service
falar direto com o supabase é mais claro do que atravessar uma camada que só
repassa a chamada.

Extraia para `services/<domínio>/` (como `services/product/productQuery.ts` e
`productStats.ts`) quando aparecer um destes sinais:

- a mesma consulta é usada por mais de um método ou service;
- o service começa a ter mais linhas de montagem de query do que de regra de
  negócio;
- o mapeamento de linha para tipo ficou complexo o bastante para ter casos
  (esse mapeamento em si vai para `utils/`, como `mapProductRow`).

Nesse ponto a extração passa a pagar o próprio custo: a regra de negócio volta
a caber na cabeça, e mudar a consulta vira mudança local.

## Nomenclatura e comentários

**Identificadores em inglês** — funções, variáveis, tipos, arquivos.
**Comentários em português**, curtos e só quando fazem falta.

A divisão tem motivo: o vocabulário em volta já é inglês (`request`,
`response`, `next`, `data`, `error`), e misturar idiomas produz coisas como
`buscarUserById`. Comentário é outra coisa — é conversa entre pessoas do
time, e ali o português comunica melhor e mais rápido.

Comentário bom explica **por quê**, não **o quê**. O código já diz o quê:

```ts
// Ruim: repete o que a linha abaixo já mostra
// Incrementa o contador
attempts += 1

// Bom: explica a decisão, que o código não consegue mostrar
// Só tentativas que falharam contam, para não punir quem acerta a senha
attempts += 1
```

Quando o código precisa de um comentário para ser entendido, considere antes
renomear ou extrair — costuma resolver melhor que a explicação.

## Envelope de resposta

Todo endpoint responde a mesma forma (`types/http/HttpResponse.ts`):

```ts
interface HttpResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}
```

```ts
{ success: true,  message: "Perfil atualizado com sucesso.", data: {...} }
{ success: false, message: "Usuário não encontrado." }
{ success: false, message: "Erro de validação", errors: [{ field, message }] }
```

O `field` em `errors` não é decorativo: o app usa ele para marcar o input
correspondente na tela. Renomear um campo no schema muda onde a mensagem
aparece para o usuário — é mudança de contrato, não refactor interno.

Tipar o handler como `Response<HttpResponse<T>>` faz o compilador cobrar a
`message`. Vale fazer em handler novo — boa parte dos atuais usa `Response`
solto e por isso responde sem `message` sem ninguém reclamar.

## ServiceResult em vez de exceção

```ts
export type ServiceResult<T = void, E extends string = string> =
  | { status: true;  data: T }
  | { status: false; error: { code: E; message?: string } }
```

O motivo de não lançar: a tradução de erro para status HTTP acontece num
lugar só. Se cada service lançasse, todo `catch` teria que decidir de novo se
aquilo é 404, 409 ou 500 — e eles divergiriam. Com o resultado tipado, o
controller vira um tradutor de seis linhas e o compilador cobra os casos.

## Controller — sempre esta forma

```ts
async metodo(request: Request, response: Response): Promise<Response> {
  const userId = request.user.id
  const result = await Service.metodo(..., request.scope)

  if (!result.status) {
    return sendFailure(response, result.error, dominioErrorHttpStatusMap)
  }

  return response.status(200).json({
    success: true,
    message: "...",
    data: result.data,
  })
}
```

**`create` e `update` respondem só com o `id`**, não com o recurso inteiro. O
cliente acabou de enviar os demais campos, então devolvê-los é tráfego sem
uso — e no banco significa um `select("id")` em vez de todas as colunas. As
leituras (`GET`) é que trazem o recurso completo.

### O caminho de erro sai sempre por `sendFailure`

O bloco de falha é o mesmo em todo controller: traduzir código para status e
montar o corpo. Escrito à mão, ele diverge — um esquece a `message`, outro
inventa um status. Então ele mora em `utils/sendFailure.ts` e o controller só
o chama:

```ts
import { Response } from "express"

import { getHttpStatusFromError } from "./getHttpStatusFromError"

type SendFailureOptions = {
  /**
   * Inclui o `code` no corpo. Use só quando o cliente precisa distinguir o
   * motivo do erro, não apenas mostrá-lo: o app, por exemplo, só apaga a
   * sessão local quando o refresh falha com SESSION_REVOKED — uma falha de
   * rede tem que preservá-la. Fora esses casos o código fica no servidor.
   */
  exposeCode?: boolean
}

/**
 * Traduz o erro de um service em resposta HTTP, no formato do envelope.
 *
 * O mapa de status vem por parâmetro para a função servir a qualquer domínio:
 * cada recurso tem seu enum de códigos e seu `Record<Código, number>`, e o
 * genérico amarra os dois — passar o mapa de outro domínio não compila.
 *
 * ```ts
 * if (!result.status) return sendFailure(response, result.error, purchaseErrorHttpStatusMap)
 * ```
 */
export function sendFailure<Code extends string>(
  response: Response,
  error: { code: Code; message?: string },
  statusMap: Record<Code, number>,
  options: SendFailureOptions = {}
): Response {
  const httpStatus = getHttpStatusFromError(error.code, statusMap)

  return response.status(httpStatus).json({
    success: false,
    ...(options.exposeCode ? { code: error.code } : {}),
    message: error.message,
  })
}
```

Dois detalhes que o desenho protege:

- **O mapa entra por parâmetro, e o genérico amarra enum e mapa.** Passar
  `goalErrorHttpStatusMap` junto com um `ProductErrorCode` não compila — o
  erro aparece na hora de escrever, não como status errado em produção.
- **`exposeCode` é opt-in.** Expor o código por padrão transformaria todo
  código interno em contrato público, e renomear um deles passaria a quebrar
  o app. Ligue a opção quando o cliente precisar *decidir* algo com o motivo —
  e, a partir daí, trate aquele código como contrato: mudá-lo muda o
  comportamento do app.

Chamada com o código exposto:

```ts
if (!result.status) {
  return sendFailure(response, result.error, userErrorHttpStatusMap, { exposeCode: true })
}
```

`getHttpStatusFromError` continua existindo para os casos fora do envelope de
falha; no controller, prefira sempre o `sendFailure`.

### Onde colocam-se os helpers de cada camada

Métodos de controller são passados soltos para o roteador
(`router.get(..., Controller.list)`), então **`this` é `undefined` dentro
deles**. A consequência prática importa: helper de controller vai para
`utils/`, nunca para método privado — o método privado compila normalmente e
quebra só em runtime, no primeiro request. Se precisar mesmo de `this`, a
rota tem que passar `Controller.metodo.bind(Controller)` (é o que
`UserController.refresh` faz).

Em service é o contrário: eles são sempre chamados como `Service.metodo()`,
então `this` funciona. Lógica que só aquele service usa pertence a um método
privado dele (ver `ProductService.toIsoDate`); o que serve a vários vira
helper em `utils/`.

O objetivo dos dois lados é o mesmo: arquivos de controller e service com
imports e a classe, sem funções soltas no topo.

### Quando `utils/` cresce, divida por subpasta

`utils/` é a pasta que mais atrai arquivo: tudo que não tem casa óbvia cai
nela. **Passando de mais ou menos oito arquivos, agrupe por domínio em
subpastas** — o mesmo movimento que `services/<domínio>/` faz quando um
service cresce.

```
utils/
├── sendFailure.ts            # transversal: serve a todos os domínios
├── getHttpStatusFromError.ts
├── product/                  # helpers de um domínio só
│   ├── scope.ts
│   ├── date.ts
│   └── row.ts
└── group/
    └── rpc.ts
```

O critério da divisão é **quem usa**, não o que o helper faz:

- helper que só um domínio usa vai para `utils/<domínio>/`;
- helper que vários domínios usam fica na raiz de `utils/`.

Quando o arquivo desce para a subpasta, **o nome dele para de repetir o
domínio**: `utils/productUtils.ts` vira `utils/product/date.ts`, porque o
caminho já disse "product". Nome repetido vira `product/productDate.ts`, que
não informa mais nada e só alonga o import.

Dois motivos práticos para não deixar passar:

- **O caminho do import é a primeira pista do que o helper faz.**
  `utils/product/scope.ts` se explica; num `utils/` plano com quinze arquivos,
  você precisa abrir o arquivo para saber.
- **A subpasta mostra o acoplamento.** Um helper que só um domínio importa e
  mesmo assim vive na raiz parece transversal e acaba sendo reusado onde não
  cabe. Descer ele para a pasta do domínio torna esse escopo explícito — e
  quando ele realmente passar a servir a dois domínios, subir de volta para a
  raiz é a mudança que registra o fato.

A regra vale para qualquer pasta que engorde do mesmo jeito (`services/`,
`middleware/`, `constants/`). O que não vale é criar a subpasta vazia
antecipando: divida quando a pasta já estiver difícil de varrer com os olhos.

## Service — sempre esta forma

```ts
async metodo(...): Promise<ServiceResult<Tipo, DominioErrorCode>> {
  try {
    const { data, error } = await supabaseAdmin...

    if (error || !data) {
      console.error("[DominioService.metodo]", error)
      return { status: false, error: { code: DominioErrorCode.X, message: "Mensagem para o usuário." } }
    }

    return { status: true, data: mapear(data) }
  } catch (error) {
    console.error("[DominioService.metodo] error:", error)
    return { status: false, error: { code: DominioErrorCode.X_FAILED, message: "Erro ao ..." } }
  }
}
```

Pontos que importam:

- **O log recebe o erro cru; a resposta leva mensagem genérica.** Detalhe de
  banco no log do servidor, nunca na tela — mensagem de erro do Postgres
  costuma revelar nome de tabela, coluna e às vezes o próprio dado.
- **O prefixo do log é `[Classe.metodo]`** e tem que acompanhar renomeação:
  log com nome de método que não existe mais custa tempo na próxima
  investigação.
- **Desfecho esperado não é `console.error`.** Nome já em uso, registro não
  encontrado, credencial errada: são respostas normais da API (409, 404,
  401), não falhas. Registrá-los como erro faz o uso corriqueiro do app
  poluir o log e, em produção, disparar alerta à toa. Trate esses casos
  *antes* da linha de log.
- **Nunca logar token, senha ou credencial.** É o vazamento mais fácil de
  cometer sem perceber, e o mais difícil de auditar depois.
- **Sempre mapear a linha do banco para um tipo próprio** antes de devolver.
  Retornar a linha crua vaza colunas internas para o cliente na primeira vez
  que alguém adicionar um campo na tabela.

## Funções pequenas e sem repetição

Quando um método faz mais de uma coisa — valida, transforma, consulta e
formata — extraia as partes. O sinal prático: **se você precisou de um
comentário para separar "seções" dentro da função, cada seção provavelmente é
uma função.** Nomeie a extração pelo que ela decide, não pelo passo do
processo (`mapPasswordUpdateError` diz mais que `step2`).

Isso não é estética. Função que faz uma coisa só é a que dá para testar
isoladamente, reaproveitar e ler sem rolar a tela.

Nesta arquitetura a duplicação aparece quase sempre nos mesmos três lugares —
vale extrair já na segunda ocorrência:

- **o bloco de erro do controller** — já resolvido pelo `sendFailure` acima.
  Se você se pegar montando `response.status(...).json({ success: false, ... })`
  num controller, é sinal de que passou reto pelo helper;
- **o mapeamento de linha do banco para tipo**, repetido entre `get` e
  `update` do mesmo recurso;
- **listas de colunas de `select`**, que devem morar em `constants/` (como
  `PRODUCT_SELECT_FIELDS`), senão divergem entre as consultas do mesmo
  recurso.

Duplicação que ainda não se repetiu não é duplicação: duas coisas parecidas
que mudam por razões diferentes devem continuar separadas. Abstrair cedo
demais custa mais caro que copiar uma vez.

## Rota

```ts
router.post("/login", loginRateLimiter, validate(LoginSchema), UserController.login)
router.put("/goal", authMiddleware, scopeMiddleware, validate(goalSchema), GoalController.update)
```

Ordem dos middlewares: **rate limit → auth → scope → validate → controller**.
Da verificação mais barata para a mais cara — não faz sentido validar o corpo
de uma requisição que será recusada por falta de token.

`scopeMiddleware` entra em toda rota cujo dado pertence ao escopo solo/grupo
(produto, meta). Sem ele, `request.scope` é `undefined` e o service silencia
ou quebra em runtime.

Rota nova vai no `routes/<domínio>Routes.ts` do domínio, e o arquivo precisa
estar registrado em `routes/routes.ts` — tudo fica sob o prefixo `/api`.

Rotas de autenticação precisam de rate limiter. Prefira contar apenas as
tentativas que falham (`skipSuccessfulRequests: true`), para não punir quem
acerta a senha.

## Validação com zod

**Todo dado vindo do cliente passa por um schema zod** — corpo, query e
params — antes de chegar ao controller. Sem exceção. Endpoint que confia no
formato enviado pelo cliente é por onde entra dado malformado, e depois
payload construído de propósito.

A validação mora no middleware `validate(Schema, target?)`, nunca dentro do
controller. Ele responde **422** com a lista de `errors` no formato do
envelope e só chama `next()` com os dados já convertidos.

```ts
// packages/shared/src/schemas/card.schema.ts
export const createCardSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do cartão.").max(60, "Nome muito longo."),
})

export type CreateCardDTO = z.infer<typeof createCardSchema>
```

Três detalhes que fazem diferença:

- **Mensagens em português**, porque elas chegam ao usuário final pelo campo
  `errors[].message`.
- **O tipo sai do schema com `z.infer`**, nunca declarado à mão em paralelo.
  Assim o schema é a única fonte da verdade e não existe o caso de o tipo
  dizer uma coisa e a validação aceitar outra.
- **Normalize na validação** (`trim`, `toLowerCase`), não no controller — o
  resto do código recebe o dado já limpo.

Query string tem uma ressalva neste projeto: nenhuma rota usa
`validate(schema, "query")` hoje, e os controllers de produto validam a query
à mão. Antes de adotar o middleware em query, leia a divergência registrada em
`references/project.md`. O que não muda: se validar no controller, os `errors`
ainda têm que sair no formato `{ field, message }`.

Manter isso fora do controller é o que garante que toda rota falhe da mesma
maneira, e o app só precisa entender um formato de erro de validação.

## Códigos de erro

Todo erro novo entra em dois lugares:

1. O enum do domínio, em `types/code/<domínio>Code.ts` (`GoalErrorCode`,
   `ProductErrorCode`, ...), com o valor prefixado pelo domínio
2. O mapa de status HTTP, em `errors/<domínio>ErrorHttpMapper.ts`

```ts
export const goalErrorHttpStatusMap: Record<GoalErrorCode, number> = {
  [GoalErrorCode.GOAL_FETCH_FAILED]: 500,
  [GoalErrorCode.GOAL_FORBIDDEN]: 403,
  // ...
}
```

Tipar o mapa como `Record<<Domínio>ErrorCode, number>` é intencional:
adicionar um código sem definir o status **quebra a compilação**, em vez de
virar um 400 silencioso em produção.

## Acesso ao banco

Todo acesso a dados usa `supabaseAdmin`, que roda com a service role e
**ignora a RLS**. Isso muda onde está a proteção: ela não está no banco, está
no filtro que você escreve. Duas consequências que não são negociáveis:

- **Toda query filtra pelo escopo** (`request.scope`) — ver
  `references/project.md` para as funções de escopo e a checagem antes de
  mutar. Um filtro esquecido não vira bug de listagem: vira dado de outra
  conta na tela.
- **Nunca decida de quem é o dado por um id vindo do cliente.** O dono sai do
  token autenticado (`request.user.id`); o id do corpo ou da URL serve no
  máximo para dizer *qual* registro, e ainda assim filtrado pelo dono.

`supabaseAuth` (chave anon) é só para os fluxos de autenticação e não deve
aparecer em service de dado.

Ao mexer numa lista de colunas de `select`, confira contra as migrations em
`supabase/migrations/`. O Postgres rejeita a **query inteira** quando uma
coluna não existe, então um campo errado não derruba um campo: derruba o
endpoint.

## Desempenho

Antes de otimizar, meça — mas estes quatro erros são caros e fáceis de evitar
desde o início:

- **Chamadas independentes vão em paralelo** (`Promise.all`). `await`
  encadeado soma latências que poderiam correr juntas; num endpoint que faz
  três consultas, isso é a diferença entre 90ms e 270ms.
- **Filtre, ordene e pagine no banco**, não em JavaScript. Trazer mil linhas
  para descartar novecentas gasta rede, memória e tempo de serialização.
- **Selecione só as colunas que usa.** Além de mais leve, evita vazar coluna
  nova sem querer.
- **Cuidado com N+1**: consulta dentro de laço vira N consultas. Busque em
  lote e junte na memória. Agregação pesada já vive como RPC no Postgres
  (`get_product_stats`) — considere o mesmo caminho antes de somar em JS.

## Passo a passo para um endpoint novo

1. Migration em `supabase/migrations/`, se envolver coluna ou tabela nova
2. Schema zod: em `packages/shared/src/schemas/` se o app também usa (e
   exportado no `index.ts` do pacote), senão em `backend/src/schemas/`; DTO
   saindo de `z.infer`
3. Acesso a dados: no service mesmo, ou extraído para `services/<domínio>/`
   se algum dos sinais acima aparecer
4. Método no service, devolvendo `ServiceResult`, sempre filtrando por escopo
5. Código novo no enum de `types/code/` + no mapa de `errors/`, se houver erro
   novo
6. Método no controller, na forma acima
7. Rota no `routes/<domínio>Routes.ts`, com os middlewares na ordem certa
8. Typecheck antes de encerrar (comando em `references/project.md`)
9. Do lado do app: a função de serviço ou o hook react-query correspondente

## Higiene de configuração

O `app.ts` e o `config/env.ts` já implementam os itens abaixo — o que importa
é não desfazê-los sem querer:

- Variáveis de ambiente validadas na subida, com **falha cedo** se faltar algo
  — descobrir chave ausente no primeiro request de produção é caro. Variável
  nova entra no schema de `env.ts` e no `render.yaml`.
- Parsers não usados ficam desligados. `express.urlencoded`, por exemplo, é
  superfície de prototype pollution numa API que só fala JSON.
- Corpo limitado (`express.json({ limit: "10kb" })`).
- CORS por allowlist (`ALLOWED_ORIGINS`). Requisições sem `Origin` (app
  nativo) passam; clientes web precisam entrar na lista explicitamente.
