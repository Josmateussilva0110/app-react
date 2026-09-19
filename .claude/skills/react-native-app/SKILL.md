---
name: react-native-app
description: Padrões do app Expo deste monorepo — camadas rota/tela/hook/rede, estado de servidor em react-query com a queryKey como contrato, camada axios que devolve envelope em vez de lançar, sessão em SecureStore com refresh único, schemas compartilhados via @app/shared e componentes com tokens de tema. Use sempre que a tarefa tocar qualquer arquivo em financeiro-app/, mesmo que o pedido não cite React Native — criar ou alterar tela, formulário, componente, hook, cache, chamada de API, rota, tema ou sessão. Vale também para pedidos que chegam pelo lado visual ("a tela tal está estranha", "adiciona um campo no formulário") e para os que chegam pelo backend e precisam aparecer no app.
---

# App Expo — camadas, estado e rede

O app (`financeiro-app/`) consome a API descrita na skill `rest-api-ts`, do
mesmo monorepo, e compartilha com ela os schemas zod do pacote `@app/shared`.
Uma regra validada num lado e não no outro é a origem mais comum de "salvou no
app e o servidor recusou".

**Leia `references/project.md` junto com este arquivo**: é onde estão os
caminhos reais, as chaves de cache, o fluxo de sessão, os comandos e as
divergências já conhecidas do código atual.

## Camadas

```
rota (app/) → tela (features/) → hook (react-query) → requestData → axios → API
```

```
financeiro-app/src/
├── app/         rotas expo-router — finas, só apontam para a tela
├── components/  compartilhados entre features (ui/, layout/, navigation/)
├── config/      api-routes, env e a URL gerada em build
├── constants/   tema (paletas clara e escura)
├── context/     providers globais: auth, theme, toast
├── features/    uma pasta por domínio; components/, hooks/, constants/ dentro
├── hooks/       estado de domínio: um arquivo por recurso
├── lib/         funções puras + queryClient e persister
├── schemas/     zod do que é só do formulário
├── services/    axios, envelope, sessão e funções de endpoint
├── storage/     sessão no SecureStore
└── types/       tipos locais
```

A regra que mantém isso honesto: **tela não chama `requestData` nem axios.**
Ela usa o hook do recurso, e só. Se uma tela precisa importar de `services/`,
provavelmente falta um método no hook.

O arquivo de rota é fino de propósito — ele existe para o roteador encontrar a
tela, não para conter a tela:

```tsx
// app/(protected)/group/index.tsx
import { GroupManageScreen } from "@/features/group/components/group-manage-screen";

export default GroupManageScreen;
```

Assim a tela de verdade vive em `features/<domínio>/components/`, pode ser
montada fora do roteador e trocar de navegação não reescreve a interface. Tela
protegida também precisa ser declarada como `<Stack.Screen>` no layout de
`(protected)`.

## Nomenclatura e comentários

**Identificadores em inglês** — componentes, funções, variáveis, arquivos.
**Comentários em português**, curtos e só quando fazem falta.

O vocabulário em volta já é inglês (`render`, `props`, `state`, `effect`), e
misturar idiomas produz coisas como `construirCardComponent`. Comentário é
conversa entre pessoas do time, e ali o português comunica melhor.

Texto que o usuário lê — rótulos, mensagens, títulos — é português, e mora no
componente, não em constante distante.

Arquivos em `kebab-case` (`product-detail-screen.tsx`), componentes em
`PascalCase`, hooks com prefixo `use`. Um arquivo, um componente exportado; os
pedaços privados dele podem ficar no mesmo arquivo enquanto forem pequenos.

Comentário bom explica **por quê**. O código já diz o quê.

## Estado

O estado que vem do servidor é do **react-query**, num hook por recurso
(`useProducts`, `useGoal`, `useGroup`, `useProfile`). A tela consome o hook:

```ts
const { data: products = [], isLoading, error } = useProducts();
```

Estado efêmero de uma tela só — modal aberto, texto de um campo, filtro
selecionado — fica na tela, em `useState`. Subir isso para context é o que
transforma provider em depósito.

Context é para o que é global e muda pouco: sessão, tema e toast. Três cuidados
que evitam os bugs típicos:

- **Cálculo derivado é `useMemo` sobre o dado do hook**, nunca um segundo
  `useState` para manter em sincronia. Dois estados que precisam concordar
  sempre divergem; o segundo é derivação disfarçada.
- **Ações passadas para baixo vão em `useCallback`.** Sem isso, cada render cria
  uma função nova, o `React.memo` do filho não segura nada e qualquer
  `useEffect` que dependa dela dispara de novo — o laço infinito clássico.
- **Context re-renderiza todos os consumidores** quando o valor muda. Se um dia
  o re-render virar problema, a saída aqui é fatiar o provider por frequência de
  mudança, não trazer uma biblioteca de store nova para um app que já tem
  react-query.

## Hook de recurso — sempre esta forma

Não existe camada de repositório neste app: **o contrato de dados é a
`queryKey` mais a função de fetch**, dentro do hook. Recurso novo segue o
formato dos existentes:

```ts
export const GOAL_KEY = ["goal"] as const;

export const goalQueryOptions = {
  queryKey: GOAL_KEY,
  queryFn: async () => {
    const res = await requestData<GoalResponse>({ endpoint: "/goal", method: "GET" });
    if (!res.success) throw new Error(res.message);
    return res.data as GoalResponse;
  },
  staleTime: 5 * 60 * 1000,
};

export function useGoal() { return useQuery(goalQueryOptions); }
export function prefetchGoal(client: QueryClient) { return client.prefetchQuery(goalQueryOptions); }
```

Três coisas que esse formato garante:

- **A chave é exportada** porque quem escreve precisa invalidar a dos outros:
  criar produto invalida produtos, estatísticas e períodos; entrar ou sair de
  grupo invalida tudo que depende do escopo. Chave privada vira tela que mostra
  número velho com confiança.
- **A `queryFn` é o único lugar que conhece o endpoint.** Trocar a origem do
  dado é mudar essa função, sem encostar em tela.
- **`prefetch` separado** permite aquecer o cache no login, antes de a tela
  abrir.

## Rede

**A camada de rede nunca lança.** `services/request.ts` devolve sempre um
envelope — `{ success, message, data?, error? }` — inclusive quando a falha é de
rede. Nenhum ponto do app precisa de `try/catch` para uma chamada dar errado.

A conversão para exceção acontece **dentro da `queryFn`**, e é proposital: é
assim que o react-query marca o estado como erro e a tela pode renderizar
`ErrorState`. Não é inconsistência; é a fronteira.

`services/api.ts` é a instância axios e resolve, de uma vez, o que costuma
custar horas:

- **Timeout** — sem ele, numa rede móvel ruim a promessa fica pendurada e a tela
  gira para sempre.
- **401 com renovação única** — o interceptor renova a sessão uma vez
  (`_retry`) e refaz a chamada; chamadas concorrentes esperam o mesmo refresh
  em vez de dispararem vários.
- **`_skipAuth`** para a chamada que não deve levar token.

A regra que evita o bug mais chato desta arquitetura: **quando a escrita falha,
o estado local não muda.** As mutações invalidam ou gravam o resultado
confirmado no `onSuccess` — nunca antes. Atualização otimista é o contrário
disso e só vale com **rollback escrito junto**; sem o caminho de desfazer, não
há otimismo, há bug.

Na carga inicial, falha **não pode** travar a abertura nem parecer sessão
expirada: mostre o motivo e abra o app vazio, para o usuário tentar de novo.

## Sessão

Um app que mantém o usuário logado precisa guardar o token de renovação, e o
lugar é o **armazenamento criptografado do sistema** (`expo-secure-store`),
nunca AsyncStorage, que é texto puro no disco do app. O token de acesso, curto,
vive em memória.

- **Quem decide encerrar a sessão é um lugar só.** Falha de rede no refresh
  preserva a sessão; só o código de erro que o servidor expõe derruba. Misturar
  os dois faz o usuário ser deslogado toda vez que o sinal cai.
- **Limpe o cache persistido no logout e na expiração**, senão o próximo login
  herda a tela do anterior.
- **Nada sensível em log.** Token, senha e corpo de requisição autenticada fora
  do console — log de app vai para o dispositivo e para ferramentas de crash, e
  `console.log` deixado no código roda em produção.
- **Falha de autenticação não conta detalhe.** "Email ou senha incorreto", sem
  dizer qual dos dois; a distinção confirma quais contas existem.

## Modelos e formato de rede

**Os tipos das respostas vêm de `@app/shared`** (`ProductResponse`,
`GoalResponse`, `GroupResponse`), não são redeclarados no app. Assim uma mudança
no backend aparece como erro de compilação aqui, e não como campo `undefined` na
tela.

- **O tipo não é validação.** `as Tipo` num JSON de rede é uma promessa que
  ninguém verificou; o app quebra longe da origem, ao usar o campo. Onde o dado
  é crítico, valide com o schema do `@app/shared` — é o mesmo lugar onde os
  formulários já validam.
- **A API responde em `snake_case`** (`payment_type`, `month_list`). Converta na
  borda — uma função por entidade, como `productToFormValues` em
  `lib/product.utils.ts` — em vez de espalhar `item.payment_type` pelas telas:
  é o que faz uma renomeação no backend virar caça ao tesouro.
- **Campo nulo tem significado.** Decida na borda o que ele vira e comente.
- **A escrita não manda `id`** em criação: quem o define é o servidor.
- **`create` e `update` respondem só com o `id`.** O objeto é remontado
  localmente a partir do que foi enviado, ou o cache é invalidado — nunca um
  `GET` extra para reler o que o app acabou de mandar.
- **Datas trafegam como texto** — `DD/MM/YYYY` na escrita do formulário, ISO na
  leitura — e nunca viram `Date` no estado. Guardar `Date` convida fuso horário
  e serialização a brigarem no meio do caminho.

## Componentes

**Cores, espaçamentos e raios vêm dos tokens do tema**, nunca literais no
componente. Um `#fff` cravado fica invisível no modo escuro e ninguém percebe
até alguém reclamar.

**Estilos em `StyleSheet.create`**, fora do corpo do componente. Objeto de
estilo criado no render é novo a cada passada e derruba comparação de props. O
pedaço que depende do tema vai no array:

```tsx
<View style={[styles.card, { borderColor: colors.border }]} />
```

**Componentes modularizados.** Um componente resolve uma coisa, recebe o que
precisa por props e não busca dado por conta própria. Componente usado por duas
telas vira compartilhado em `components/`; componente de uma tela só mora em
`features/<domínio>/components/`.

**Formulário é um componente só, usado por criar e editar** — é o que
`ProductForm` faz, recebendo `initialValues`. Duplicar parece mais simples no
dia, e o resultado é sempre o mesmo: um dos dois ganha um campo ou uma validação
e o outro fica para trás, sem ninguém notar até o usuário reclamar.

Quando um componente cresce, extraia **componentes**, não funções
`renderAlgo()`. Componente extraído tem `React.memo`, chave própria e reconstrói
sozinho; função privada reconstrói junto com o pai.

Detalhes de React Native que dão erro em runtime e não em compilação: texto
solto precisa estar dentro de `<Text>`; `<Image>` sem largura e altura não
aparece; toque só acontece dentro da área do componente, então `padding` resolve
alvo pequeno melhor que aumentar a fonte do ícone.

## Tema e cores

O tema é um arquivo só (`constants/theme.ts`, paletas clara e escura) exposto
pelo `useTheme()`. A preferência é persistida e lida uma vez na abertura;
espalhar `useColorScheme()` pelos componentes ignora a escolha manual e faz
metade da tela trocar de tema sozinha.

Ao escolher cores, use as relações entre elas em vez de gosto pontual:

- **Matiz carrega significado, e isso é convenção cultural.** Verde para
  entrada e confirmação, vermelho para erro e saída, âmbar para atenção.
  Contrariar isso obriga o usuário a ler o que poderia reconhecer.
- **Contraste é requisito, não estética.** O que fica elegante no claro costuma
  sumir no escuro — confira nos dois.
- **Saturação alta em área grande cansa.** Cor forte funciona em acento (botão,
  ícone, badge); fundo pede tom dessaturado.
- **Cor de categoria sai do mapa central** (`features/dashboard/constants.ts`),
  nunca escolhida na tela: é o que mantém a mesma categoria da mesma cor em
  todas as telas, e o usuário passa a reconhecer sem ler.

Espaçamento e raio seguem a mesma lógica: uma escala pequena e repetida é o que
faz telas diferentes parecerem o mesmo app.

## Fronteira de confiança

**O cliente nunca é fonte de verdade.** Ele roda no aparelho do usuário, o
bundle JavaScript pode ser extraído e lido, e as requisições podem ser forjadas.
Disso decorre:

- **Regra de negócio e validação valem no backend.** A validação no app é
  conveniência — evita ida à rede e dá erro imediato no campo certo. As duas
  existem, e a que protege é a de lá.
- **Nunca envie identificador de dono.** Quem é o usuário sai do token, no
  servidor. Se o app manda `userId` no corpo e o backend confia, trocar um
  número na requisição alcança dado alheio.
- **Filtros, ordenação e paginação vêm do backend.** Trazer tudo e filtrar em
  JavaScript quebra na primeira conta com muitos registros: gasta rede, memória
  e bateria para descartar a maior parte.
- **Cálculo que vira dinheiro ou permissão é do servidor.** O app exibe o total;
  quem confirma é quem grava.

**Tudo que é embarcado é legível.** `EXPO_PUBLIC_*` e valores em `extra` são
substituídos no bundle em tempo de build e ficam em texto no APK. Nenhuma chave
de serviço vai para o app: se a operação precisa de segredo, ela é um endpoint
no backend. Senha nunca é persistida — nem "temporariamente".

## Desempenho e cache

Meça antes de otimizar, mas estes evitam retrabalho:

- **Lista longa é `FlatList`/`SectionList`**, com `keyExtractor` estável e item
  memoizado — nunca um `ScrollView` com `map` montando tudo de uma vez. Chave
  por índice reordena errado e reaproveita o item errado na hora de animar.
- **`React.memo` no item da lista**, junto com `useCallback` nos callbacks que
  ele recebe. Um sem o outro não vale nada.
- **Trabalho pesado fora do render.** Ordenar, agrupar e formatar entram em
  `useMemo`; o render roda a cada toque.
- **Chamadas independentes em paralelo** (`Promise.all`), não em sequência.
- **Animação na UI thread** (Reanimated, `useNativeDriver`). Animar via estado
  do React trava junto com a lista.
- **Imagem custa memória na resolução original.** Peça ao backend o tamanho que
  a tela usa.

O cache do react-query é persistido, então o app abre com o último dado e
revalida em segundo plano. Duas regras que fazem isso funcionar em vez de
atrapalhar: **invalide na escrita** — cache não invalidado mostra o valor antigo
com confiança — e **limpe no logout**, para não vazar dado de um usuário para o
outro.

## Efeitos assíncronos e desmontagem

O react-query já cuida do cancelamento nas consultas. Onde ainda houver
`useEffect` com `await` seguido de `setState`, a tela pode já ter saído:

```ts
useEffect(() => {
  let active = true;

  void (async () => {
    const value = await carregar();
    if (!active) return;   // a tela saiu durante a espera
    setValor(value);
  })();

  return () => { active = false; };
}, []);
```

O mesmo vale para `setTimeout` e listeners: o que foi criado no efeito é desfeito
no retorno dele. Sem isso sobra atualização em componente desmontado e timer que
dispara depois — falhas difíceis de reproduzir.

Recarregar ao voltar para a tela usa o efeito de foco da navegação, com a função
de refresh estável (`useCallback`); dependência instável ali vira recarga em
laço, com a rede batendo sem parar.

## Configuração

O bundler **substitui as variáveis no código em tempo de build**, não lê nada em
runtime. Duas consequências práticas: **recarregar o app não relê esses
valores**, e um valor ausente vira `undefined` silencioso — a falha aparece
depois, como timeout inexplicável ou URL `undefined/api`.

Por isso a configuração é lida num **único módulo** (`config/env.ts`), que falha
na subida se a URL da API não existir. O passo a passo de como essa URL é gerada
está em `references/project.md`.

## Portões antes de encerrar

Este app **não tem testes automatizados** — não há runner instalado. Os portões
são o typecheck e o lint, e ambos precisam passar (comandos em
`references/project.md`).

Se um dia entrar teste, o que vale mais é renderizar **a tela de verdade** com
um adaptador de rede falso: exercita árvore, estado, cache e navegação juntos,
que é onde os erros moram. Cubra os fluxos (login, logout, sessão restaurada),
as costuras de formato (leitura e escrita do JSON, campo nulo) e os caminhos de
erro (credencial errada, 422 com campo, falha de rede).

## Passo a passo para uma tela nova

1. Schema e tipos: no `@app/shared` se o backend valida o mesmo dado, em
   `src/schemas/` se for só do formulário
2. Hook do recurso em `src/hooks/`: `queryKey` exportada, `queryFn` com
   `requestData`, e o `prefetch` se a tela for aquecida no login
3. Invalidação: liste, no `onSuccess` da mutação, as chaves que aquela escrita
   torna velhas
4. Tela em `features/<domínio>/components/<nome>-screen.tsx`, consumindo o hook
   e os componentes compartilhados
5. Rota fina em `app/`, e a declaração no `<Stack>` de `(protected)` se for
   protegida
6. Tema: cores e espaçamentos pelos tokens, estilos em `StyleSheet.create`
7. Typecheck e lint antes de encerrar
