# Projeto: financeiro-app (app Expo do Financeiro)

Escolhas concretas deste app. O `SKILL.md` ao lado tem o porquê de cada padrão;
aqui ficam os caminhos reais, o que já está ligado na API e as armadilhas
vividas. A API que ele consome está descrita na skill `rest-api-ts`.

## Stack

Expo 54 + expo-router 6, React 19, React Native 0.81, TypeScript strict.
Estado de servidor em **@tanstack/react-query 5** (com persistência em
AsyncStorage), rede em **axios**, formulários em **react-hook-form + zod 4**,
sessão em **expo-secure-store**, ícones em `lucide-react-native`.

O app é um workspace npm da raiz do monorepo e importa `@app/shared`
(`packages/shared`) — os mesmos schemas zod que o backend valida.

## Estrutura real

```
financeiro-app/src/
├── app/            rotas expo-router; (protected) e (tabs) como grupos
├── components/     compartilhados entre features (+ ui/, layout/, navigation/)
├── config/         api-routes.ts, env.ts e api-url.generated.ts (gerado)
├── constants/      theme.ts — paletas light/dark
├── context/        auth, theme, toast (providers globais)
├── features/       um domínio por pasta: components/, hooks/, constants/
├── hooks/          estado de domínio: um arquivo por recurso (use-products…)
├── lib/            helpers puros + query-client e query-persister
├── schemas/        zod do que é só do formulário (auth, produto)
├── services/       api.ts, request.ts, token.manager, refresh.service, *.service
├── storage/        auth.storage.ts (SecureStore)
└── types/          tipos locais (auth, formulário)
```

Arquivos em `kebab-case`, e módulo que não é componente leva **sufixo
pontuado** dizendo o papel: `auth.context.tsx`, `refresh.service.ts`,
`product.schema.ts`, `auth.types.ts`, `token.manager.ts`, `auth.storage.ts`,
`home.constants.ts`. Isso é padrão, não resíduo — siga nos arquivos novos.

Fogem dele cinco arquivos em camelCase (`useAuth.ts`, `productCard.tsx`,
`appShell.tsx`, `welcomePage.tsx`, `saveButton.tsx`) e dois que erram o
separador ou o número (`toggle.row.tsx`, `product-form.constant.ts`).

## Não existe camada de repositório

O `SKILL.md` descreve repositório atrás de interface. **Aqui não tem**, e a
troca é deliberada: quem faz esse papel é o react-query mais `requestData`.

```
tela → hook (useQuery/useMutation) → requestData → axios (api.ts) → API
```

O contrato de origem de dados é a `queryKey` + a função de fetch dentro do
hook. Não invente uma interface de repositório para um recurso novo; siga o
formato dos hooks existentes:

```ts
export const GOAL_KEY = ["goal"] as const;

export const goalQueryOptions = { queryKey: GOAL_KEY, queryFn: …, staleTime: … };
export function useGoal() { return useQuery({ ...goalQueryOptions }); }
export function prefetchGoal(client: QueryClient) { return client.prefetchQuery(goalQueryOptions); }
```

Cada hook exporta a **chave** (`PRODUCTS_KEY`, `PRODUCT_STATS_KEY`,
`PRODUCT_PERIODS_KEY`, `GOAL_KEY`, `GROUP_KEY`, `PROFILE_KEY`) porque quem
escreve precisa invalidar as chaves dos outros — criar produto invalida
produtos, stats e períodos; entrar ou sair de grupo invalida os quatro.

`services/*.service.ts` existe só para auth e perfil. Recurso novo pode ficar
no próprio hook, como produto, meta e grupo fazem.

## Rede

`services/request.ts` é o **parser único do envelope** e nunca lança: erro de
servidor e falha de rede voltam como `{ success: false, message, error }`, com
`error.reason` em `"server_error" | "network_error"`.

A conversão para exceção acontece de propósito **dentro do hook**, porque é
assim que o react-query marca o estado como erro:

```ts
const res = await requestData<GoalResponse>({ endpoint: "/goal", method: "GET" });
if (!res.success) throw new Error(res.message);
return res.data as GoalResponse;
```

`services/api.ts` é a instância axios: `baseURL` do `config/env.ts`, timeout de
**30s** (o backend no plano free hiberna e a primeira chamada acorda o serviço)
e dois interceptors — o de request espera um refresh em andamento
(`tokenManager.waitRefresh()`) antes de carimbar o `Authorization`; o de
response trata 401 renovando a sessão uma única vez (`_retry`) e refazendo a
chamada. `_skipAuth: true` marca a chamada que não deve levar token.

## Sessão

- `refresh.service.ts` garante **um refresh por vez** e é quem decide encerrar a
  sessão. Ele lê o `code` da resposta: `SESSION_REVOKED` e `INVALID_CREDENTIALS`
  derrubam a sessão; qualquer outra falha (rede, timeout) **preserva**. Esse
  `code` é contrato com o backend — é o único endpoint que o expõe, via
  `sendFailure(..., { exposeCode: true })` em `userController.refresh`.
- `token.manager.ts` guarda os dois tokens **em memória** e publica eventos
  (`onRefreshed`, `onExpired`) que o `AuthProvider` escuta para regravar ou
  apagar a sessão.
- `storage/auth.storage.ts` persiste `AuthData` no **SecureStore**, chave
  `app_auth`. Nada de sessão vai para AsyncStorage.
- No login, `auth.context.tsx` dispara prefetch de stats, meta e grupo. No
  logout e na expiração, `clearPersistedQueryCache()` limpa o cache para o
  próximo usuário não herdar a tela do anterior.

## Cache persistido

`PersistQueryClientProvider` no layout raiz, com `maxAge` de 24h; o
`queryClient` usa `staleTime` de 2min, `gcTime` de 24h e `retry: 1`. O efeito
desejado é stale-while-revalidate: o app abre com o último dado e se corrige
sozinho enquanto o servidor acorda.

**Não há atualização otimista em lugar nenhum** — as mutações invalidam ou
gravam o resultado confirmado (`setQueryData`) no `onSuccess`. Mantenha assim, a
menos que escreva o rollback junto.

## Rotas

`app/_layout.tsx` empilha os providers: persist → auth → theme → toast → Stack.

`app/(protected)/_layout.tsx` é o portão: sem sessão redireciona para `/login`;
com `profile.must_change_password` prende o usuário em
`change-password-required` até ele trocar a senha. Tela nova protegida precisa
ser declarada como `<Stack.Screen>` ali.

As tabs (`(protected)/(tabs)`) são itens, lista do mês, criar produto e perfil,
com barra customizada em `components/navigation/custom-tab-bar.tsx`.

As telas maiores moram em `features/<domínio>/components/<nome>-screen.tsx`
(`item-list-screen`, `group-manage-screen`, `category-products-screen`,
`detail/product-detail-screen`) — **não existe pasta `screens/`** como o SKILL
sugere; use `components/` do domínio.

## Tema

`constants/theme.ts` exporta `Colors.light` e `Colors.dark`; `useTheme()` vem de
`context/theme.context.tsx` e persiste a escolha em AsyncStorage (`@app:theme`),
com **dark como padrão**. Não há modo "sistema": são dois modos explícitos.

O padrão de estilo é `StyleSheet.create` fora do componente e o pedaço que
depende do tema no array: `style={[styles.card, { borderColor: colors.border }]}`.
Não existe `makeStyles` neste app.

## Validação e schemas

- Regra que o backend também valida → `@app/shared`. `schemas/product.schema.ts`
  faz certo: estende `productSchema` do pacote, só adaptando o preço (string
  com vírgula do input) e dando `.catch()` de valor padrão aos enums.
- `ProductForm` é **um componente só para criar e editar** (`initialValues`
  decide), usado pelas duas rotas. Mantenha assim.
- Mensagens de validação em português, porque o usuário as lê no campo.

## Formato de rede

O app consome o **snake_case da API direto** (`payment_type`, `month_list`,
`user_name`, `must_change_password`) — não há camada de mapper como o SKILL
pede. A única conversão que existe é `lib/product.utils.ts`
(`productToFormValues`), que traduz o produto para os campos do formulário.
Tratar isso como dado, não como exemplo: em recurso novo, converter na borda
custa pouco e evita espalhar o nome da coluna pelas telas.

## Configuração

`EXPO_PUBLIC_API_URL` (em `financeiro-app/.env`) é lida por
`scripts/write-api-url.js`, que **gera** `src/config/api-url.generated.ts` —
arquivo fora do git. Ele roda nos pré-scripts de `start`, `android` e `ios`, e
`config/env.ts` lança na subida se a URL não existir. Trocar a URL exige rodar o
script de novo (ou `npm start`), porque o valor é embutido no bundle.

`app.config.js` compõe `app.json` + versão do `package.json` +
`version.build.json`, e libera cleartext no Android só quando a API é `http://`.

Tudo em `extra` e em `EXPO_PUBLIC_*` é legível no APK: nenhum segredo aqui.

## Comandos

```bash
npx tsc --noEmit          # dentro de financeiro-app
npm run lint              # expo lint
npm start                 # gera api-url.generated.ts e sobe o bundler
```

**Não há testes** — o projeto não tem jest nem testing-library instalados, então
a seção de testes do SKILL descreve algo que ainda não existe. Os portões hoje
são o typecheck e o lint.

## Divergências conhecidas

Não copie estes trechos como modelo; corrija se passar por perto.

1. **Arquivos de rota gordos.** `(protected)/dashboard.tsx` tem 366 linhas,
   `change-password-required.tsx` 201, `edit-product/[id].tsx` 163,
   `(tabs)/month-list.tsx` 118 e `(tabs)/itens.tsx` 106 — todos com tela
   inteira dentro do arquivo de rota. O padrão bom está em
   `group/index.tsx` (3 linhas) e `create-product.tsx` (14).
2. **71 linhas com cor literal, em 30 arquivos** de `components/` e
   `features/`, apesar do tema (`productCard`, `custom-tab-bar`, `toast`,
   `date-field`, seções do formulário, entre outros). Cada uma é um ponto que
   não acompanha o modo claro.
3. **`schemas/auth.schema.ts` duplica as regras do backend.** Username e senha
   repetem regex e limites de `backend/src/schemas/usernameSchema.ts` e
   `passwordSchema.ts`, com mensagens diferentes. Como não passam pelo
   `@app/shared`, os dois lados divergem sem ninguém notar.
4. **`tsconfig.json` tem um comentário solto** (`// ← adiciona isso`) na linha
   do alias `@app/shared`.
5. **Busca por texto é filtrada no cliente** (`matchesSearch` em
   `item-list-screen`), sobre as páginas já carregadas pelo infinite query — o
   backend não tem parâmetro de busca. Resultado: o que não foi paginado ainda
   não aparece na busca.
