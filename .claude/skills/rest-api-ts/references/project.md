# Projeto: app-react (API do app Financeiro)

Escolhas concretas deste repositório. O `SKILL.md` ao lado tem o porquê de cada
padrão; aqui ficam os caminhos, os nomes e as armadilhas já vividas.

## Monorepo

npm workspaces, Node 22:

```
packages/shared/   # @app/shared — schemas zod e tipos compartilhados com o app
backend/           # a API Express
financeiro-app/    # app Expo (o cliente)
supabase/          # migrations SQL
```

## Backend — estrutura real

```
backend/src/
├── app.ts                  # helmet, cors, compression, rate limit, json 10kb, /api
├── server.ts
├── config/
│   └── env.ts              # zod + process.exit(1) se faltar variável
├── database/supabase/supabase.ts   # supabaseAdmin e supabaseAuth
├── routes/                 # <domínio>Routes.ts, agregados em routes.ts sob /api
├── controllers/            # <domínio>Controller.ts  (camelCase)
├── services/               # <Domínio>Service.ts     (PascalCase)
│   └── product/            # acesso a dados extraído: productQuery, productStats
├── schemas/                # só o que não sai do servidor (auth, senha, perfil)
├── middleware/
├── errors/                 # <domínio>ErrorHttpMapper.ts
├── types/
│   ├── code/               # enum <Domínio>ErrorCode
│   ├── http/HttpResponse.ts
│   ├── serviceResults/ServiceResult.ts
│   └── express-session/session.d.ts   # request.user, request.accessToken, request.scope
├── constants/              # PRODUCT_SELECT_FIELDS
└── utils/                  # 8 arquivos, plano — ver nota abaixo
```

Controllers e services são **instâncias**: `export default new GoalController()`.

`utils/` está no limite do que o SKILL manda manter plano. Ao adicionar o
próximo helper, divida por domínio: `productScope.ts` e `productUtils.ts` vão
para `utils/product/`, `groupRpc.ts` e `groupProducts.ts` para `utils/group/`,
`tokenRevocation.ts` para `utils/auth/`; `getHttpStatusFromError.ts`,
`structuredLog.ts` e `sendFailure.ts` ficam na raiz por serem transversais.

Erro novo entra em `types/code/<domínio>Code.ts` (valor prefixado pelo domínio:
`PRODUCT_NOT_FOUND`, `GOAL_FORBIDDEN`) **e** em
`errors/<domínio>ErrorHttpMapper.ts`, que exporta
`<domínio>ErrorHttpStatusMap: Record<<Domínio>ErrorCode, number>`.

## Schemas moram em dois lugares

- **`packages/shared/src/schemas/<domínio>.schema.ts`** — quando o app também
  valida o mesmo dado ou consome o tipo da resposta. Exporte em
  `packages/shared/src/index.ts` e importe como `@app/shared`. Nomes em
  camelCase: `productSchema`, `goalSchema`, `createGroupSchema`, e os tipos de
  resposta (`GoalResponse`, `ProductResponse`) saem junto.
- **`backend/src/schemas/<nome>Schema.ts`** — só o que nunca sai do servidor:
  `RegisterSchema`, `LoginSchema`, `ChangePasswordSchema`,
  `UpdateProfileSchema`, `RefreshSchema`, `PasswordResetRequestSchema`. Export
  em PascalCase, pasta plana.

Os construtores de campo reaproveitados ficam em `passwordSchema.ts`
(`passwordField`, `loginPasswordField`) e `usernameSchema.ts`
(`usernameField`) — é o papel do `fields/` descrito no SKILL, sem a pasta.

Existe um schema fora do lugar em `types/product/product-id-param.ts`
(`productIdParamSchema`). Não siga esse caminho: schema novo vai para
`schemas/` ou para o shared.

**Depois de mexer no shared, rebuild.** O typecheck resolve `./src` pelos
`types` do package, mas o runtime resolve `./dist`:

```bash
npm run build -w packages/shared
```

## Escopo solo/grupo — a regra que mais importa aqui

Todo produto e toda meta existem em um de dois escopos. `scopeMiddleware`
resolve isso uma vez por request e entrega `request.scope`:

```ts
type ProductScope =
  | { mode: "solo";  userId: string }
  | { mode: "group"; userId: string; groupId: string; memberIds: string[] }
```

Consequências práticas, todas em `utils/productScope.ts`:

- **Toda query filtra pelo escopo.** `supabaseAdmin` usa a service role e
  ignora a RLS, então a separação entre contas é o filtro que você escreve —
  não existe rede de segurança no banco.
- Antes de alterar ou remover produto: `assertProductMutableInScope(id, userId, scope)`.
  Só o dono muta, e só dentro do escopo atual.
- Filtro por membro vem de `resolveScopedUserFilter(scope, filterUserId)`, que
  descarta id de quem não está no grupo. Não filtre por `userId` do cliente
  direto.
- O escopo é cacheado 60s por usuário. Entrar ou sair de grupo tem que chamar
  `invalidateProductScopeCache(userId)`, senão o usuário continua vendo o
  escopo antigo por até um minuto.
- O dono sai de `request.user.id` (token). Id no corpo ou na URL diz no máximo
  *qual* registro.

Rotas de produto e de meta precisam de `scopeMiddleware`; as de grupo e de
usuário não usam.

## Clientes do banco

- `supabaseAdmin` (service role) — todo acesso a dados. Bypassa RLS.
- `supabaseAuth` (anon) — apenas fluxos de auth (login, register, refresh).

Não existe cliente por usuário aqui. Onde o SKILL fala de "menor privilégio",
neste projeto leia: **o filtro explícito por escopo é a única proteção**.

## Ordem dos middlewares

`rateLimiter` global fica em `app.ts`, antes do parser JSON. Na rota:

```ts
router.put("/goal", authMiddleware, scopeMiddleware, validate(goalSchema), GoalController.update)
router.post("/login", loginRateLimiter, validate(LoginSchema), UserController.login)
```

Limitadores por rota: `loginRateLimiter` (login, register, reset de senha),
`refreshRateLimiter`, `joinGroupRateLimiter`, `healthRateLimiter`.

Métodos vão soltos para o roteador, então `this` é `undefined` dentro deles. A
única exceção é `UserController.refresh.bind(UserController)`.

## Autenticação

`authMiddleware` verifica o JWT do Supabase **localmente** (HS256 com
`SUPABASE_JWT_SECRET`) e só cai para `supabaseAdmin.auth.getUser(token)` se a
verificação local falhar. Revogação de token e de sessão fica em
`utils/tokenRevocation.ts` (em memória — reseta a cada deploy).

## Migrations e RPC

`supabase/migrations/<YYYYMMDDHHMMSS>_nome.sql`. Operação de grupo que toca
várias tabelas vai como RPC SQL (ver `20260718103000_group_transaction_rpcs.sql`)
e o service trata o retorno com `utils/groupRpc.ts` — o RPC devolve
`{ ok, error, message }` e `resolveGroupRpcError` traduz para `GroupErrorCode`.
Estatísticas também são RPC (`get_product_stats`).

## Variáveis de ambiente

Schema em `config/env.ts`. Variável nova entra lá **e** em `render.yaml`
(`envVars`) e em `env-exemple`. `.env` da raiz do monorepo e `backend/.env` são
ambos carregados, nessa ordem.

## Sem documentação de API

O Swagger foi removido em 19/09/2026: as anotações cobriam 4 das 22 rotas e
duas delas apontavam para caminhos que não existiam mais. Não há documentação
de API no servidor hoje. As dependências `swagger-jsdoc` e `swagger-ui-express`
continuam no `package.json` do backend, sem uso.

## Typecheck antes de encerrar

```bash
npm run build -w packages/shared && npx tsc --noEmit -p backend/tsconfig.json
```

## Lado do cliente (financeiro-app)

- O parser único que o SKILL menciona é `src/services/request.ts` (`requestData`).
  Ele lê `message` do topo da resposta — endpoint que responde fora do envelope
  cai na mensagem genérica.
- Endpoint novo vira função em `src/services/<domínio>.service.ts` (padrão de
  `auth.service.ts`, `profile.service.ts`) ou, quando é cache de react-query,
  um hook em `src/hooks/use-*.ts` com `queryKey` exportada.
- Constantes de rota: `src/config/api-routes.ts` — hoje só `AUTH_ROUTES`; os
  outros caminhos estão inline nos hooks.
- Os tipos de resposta vêm de `@app/shared`, não redeclarados no app.

## Divergências conhecidas

Não copie estes trechos como modelo; corrija se passar por perto.

1. **`notFound` e `errorHandler` respondem fora do envelope** —
   `{ status: false, error: { message } }` em vez de `{ success, message }`.
   O cliente lê `data.message`, então 404 de rota inexistente e erro não
   tratado chegam no app como mensagem genérica.
2. **`ProductController.getAll` e `getStats` validam a query dentro do
   controller** e devolvem `errors: result.error.issues` — issues crus do zod,
   não `{ field, message }`. O cliente não consegue marcar o campo.
   `validate(schema, "query")` não está em uso em nenhuma rota; antes de
   adotá-lo, confirme que o Express 5 aceita a atribuição
   `request.query = result.data` que o middleware faz (em Express 5 `query` é
   getter). Enquanto isso, ao menos mapeie os issues para `{ field, message }`.
3. **Seis respostas 200 saem sem `message`** (`GoalController.get`,
   `ProductController.getAll`, `getPeriods`, `getStats`,
   `GroupController.getMe`, `UserController.getProfile`), embora
   `HttpResponse.message` seja obrigatório. Não há erro de compilação porque
   os controllers não tipam `Response<HttpResponse>` — só `Response`. Em
   handler novo, tipe `Response<HttpResponse<T>>` e mande a `message`.
4. **Casing de arquivo é inconsistente entre pastas**: controller em camelCase
   (`goalController.ts`), service em PascalCase (`GoalService.ts`). Siga o
   padrão da pasta em que você está.
