# 🔍 Auditoria de Segurança e Qualidade de Código

**Projeto:** Financeiro App (Backend + Frontend React Native)  
**Data:** 2026-07-25  
**Escopo:** Backend Express/Supabase + Frontend Expo/React Native

---

## Resumo Executivo

A aplicação apresenta uma **base sólida de segurança** com boas práticas já implementadas. Há, no entanto, alguns pontos que merecem atenção, organizados por severidade abaixo.

---

## ✅ Pontos Positivos (O que já está bem feito)

| Área | Detalhe |
|------|---------|
| **Helmet** | Configurado globalmente — protege contra clickjacking, XSS via headers, MIME sniffing |
| **CORS** | Whitelist de origins explícita, não usa `*` |
| **Rate Limiting** | Rate limiter global (100 req/15min), específico para login (5), refresh (30), join group (10) |
| **Validação de Input** | Zod em todas as rotas com middleware `validate()` — previne injection e dados malformados |
| **Autenticação JWT** | Verificação local com `HS256` + fallback para Supabase; revogação de token por hash SHA-256 |
| **Revogação de Sessão** | `revokeAccessToken()` + `revokeUserSessions()` no logout com TTL e pruning automático |
| **Senha Forte** | Requisitos de complexidade (8+ chars, maiúscula, número, especial) no registro |
| **Service Role Key** | Separação correta de `supabaseAdmin` (service_role) e `supabaseAuth` (anon_key) |
| **Error Handler** | Em produção, oculta stack traces e mensagens internas de erro 500 |
| **JSON-Only API** | `express.json({ limit: "10kb" })` — sem `urlencoded`, reduz superfície de Prototype Pollution |
| **Graceful Shutdown** | Handlers para SIGTERM/SIGINT com `server.close()` |
| **Token Seguro no Mobile** | `expo-secure-store` para persistir tokens (criptografia nativa do device) |
| **Refresh Token Rotation** | Rotação implementada corretamente; detecção de reuso de refresh token |
| **Cache Limpo no Logout** | `clearPersistedQueryCache()` ao deslogar — previne data leakage entre usuários |
| **Scope/Authorization** | `scopeMiddleware` + `assertProductMutableInScope()` — multi-tenancy com isolamento de dados |
| **Swagger só em Dev** | `/api/docs` exposto apenas quando `NODE_ENV === "development"` |
| **Env Validation** | Schema Zod rígido para variáveis de ambiente — falha rápida se configuração estiver errada |
| **.gitignore** | `.env` está no `.gitignore` — secretas não vão para o repositório |

---

## 🔴 Problemas Críticos

### Nenhum encontrado

A aplicação não apresenta vulnerabilidades críticas que permitam acesso não autorizado direto, execução remota de código ou exposição massiva de dados.

---

## 🟠 Problemas de Severidade Alta

### 1. Ausência de `try-catch` em Controllers Async

**Arquivos:** [userController.ts](file:///home/mateus/projetos/app-react/backend/src/controllers/userController.ts), [productController.ts](file:///home/mateus/projetos/app-react/backend/src/controllers/productController.ts), [groupController.ts](file:///home/mateus/projetos/app-react/backend/src/controllers/groupController.ts), [goalController.ts](file:///home/mateus/projetos/app-react/backend/src/controllers/goalController.ts)

**Problema:** Os controllers são funções `async` mas **não possuem `try-catch`**. Se um service jogar uma exceção inesperada (que não foi tratada internamente), o Express **5.x** captura automaticamente rejeições de promises em rotas async, MAS esse comportamento é diferente do Express 4.x. Como vocês estão no Express `^5.2.1`, isso é seguro **por enquanto**. Porém:

- Se houver downgrade para Express 4, o servidor crashará com `UnhandledPromiseRejection`
- Melhor prática é sempre envolver com `try-catch` ou usar wrapper

**Risco:** Se o service lançar erro não capturado, a resposta pode expor detalhes internos.

> [!WARNING]
> Express 5 captura rejeições automaticamente, mas é uma boa prática proteger os controllers com `try-catch` explícito ou um wrapper `asyncHandler`.

---

### 2. Rate Limiter com MemoryStore (Produção Multi-Instância)

**Arquivo:** [rateLimiter.ts](file:///home/mateus/projetos/app-react/backend/src/middleware/rateLimiter.ts)

**Problema:** Todos os rate limiters usam `MemoryStore` (in-memory). Em deploy com **múltiplas instâncias** (horizontal scaling), cada instância tem seu próprio contador — um atacante pode distribuir requests entre instâncias e ultrapassar o limite.

**Risco:** Em instância única (Render free tier), impacto é baixo. Se escalar, o rate limit se torna ineficaz.

> [!IMPORTANT]
> O próprio comentário no código já reconhece isso: *"Para produção multi-instância, configure REDIS_URL e use rate-limit-redis"*. Implementar quando escalar.

---

### 3. Revogação de Token In-Memory (Perda em Restart)

**Arquivo:** [tokenRevocation.ts](file:///home/mateus/projetos/app-react/backend/src/utils/tokenRevocation.ts)

**Problema:** `revokedTokenHashes` e `revokedUsers` são `Map` em memória. A cada deploy/restart, **todos os tokens revogados são perdidos**. Um token de logout pode voltar a ser válido até expirar naturalmente.

**Risco:** Médio-alto. Tokens revogados por logout são "desrevogados" em restarts do servidor.

**Mitigação atual:** O Supabase também invalida as sessões via `admin.signOut()`, então o fallback na auth middleware (`supabaseAdmin.auth.getUser()`) eventualmente rejeita tokens. A janela de vulnerabilidade existe apenas para tokens cacheados localmente.

---

## 🟡 Problemas de Severidade Média

### 4. CORS Permite `null` Origin

**Arquivo:** [app.ts](file:///home/mateus/projetos/app-react/backend/src/app.ts#L30-L33)

```typescript
if (!origin) return callback(null, true)
```

**Problema:** Quando `origin` é `undefined` ou `null`, a requisição é permitida. Isso é **necessário** para apps mobile (React Native não envia Origin), mas também permite requisições de:
- Arquivos locais (`file://`)
- Redirecionamentos
- Ferramentas como Postman/cURL

**Risco:** Baixo em API autenticada por JWT. Mas se alguém obtiver um token válido, não há restrição de origin.

**Recomendação:** Aceitar como trade-off para mobile. Documentar a decisão.

---

### 5. Health Endpoints Sem Rate Limit

**Arquivo:** [app.ts](file:///home/mateus/projetos/app-react/backend/src/app.ts#L44-L48)

```typescript
app.get("/", sendHealth)
app.get("/health", sendHealth)
app.get("/api/health", sendHealth)
// app.use(rateLimiter) ← Rate limiter vem DEPOIS
```

**Problema:** Os 3 endpoints de health check são registrados **antes** do rate limiter. Podem ser abusados em DDoS básico sem limitação.

**Risco:** Baixo. Endpoints de health retornam payloads mínimos. A maioria dos provedores de cloud já tem proteção DDoS na camada de rede.

---

### 6. Scope Cache Sem Bound de Memória Rigoroso

**Arquivo:** [productScope.ts](file:///home/mateus/projetos/app-react/backend/src/utils/productScope.ts#L8-L9)

```typescript
const SCOPE_CACHE_MAX_SIZE = 1000
```

**Problema:** O cache de scope tem um limite de 1000 entradas com eviction FIFO simples. Se houver mais de 1000 usuários ativos, o cache vai "thrash" constantemente. Não é um vazamento de memória, mas é ineficiente.

**Risco:** Baixo. Para o tamanho atual da aplicação, 1000 é adequado.

---

### 7. `start.sh` Expõe Informações de Infraestrutura

**Arquivo:** [start.sh](file:///home/mateus/projetos/app-react/backend/start.sh)

```bash
DB_HOST=db
# ...
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
```

**Problema:** O script referencia `$DB_PORT` e `$DB_USER` sem defaults seguros. Se executado fora do Docker sem essas variáveis, `pg_isready` pode emitir erros revelando detalhes de config. Além disso, o host `db` está hardcoded.

**Risco:** Baixo. Esse script é usado apenas no Docker Compose local.

---

## 🟢 Problemas de Severidade Baixa / Informativos

### 8. Ausência de Validação no Body de `groups/update` e `groups/create` via Middleware

**Arquivo:** [groupRoutes.ts](file:///home/mateus/projetos/app-react/backend/src/routes/groupRoutes.ts)

**Observação:** As rotas `POST /groups` e `PATCH /groups` fazem validação **dentro do controller** com `safeParse()` em vez de usar o middleware `validate()`. Funciona, mas quebra a consistência do padrão usado em outras rotas. Não é uma falha de segurança (a validação existe), mas é inconsistência arquitetural.

---

### 9. `username` no Schema de Registro Não Sanitiza HTML

**Arquivo:** [registerSchema.ts](file:///home/mateus/projetos/app-react/backend/src/schemas/registerSchema.ts)

**Problema:** O campo `username` aceita quaisquer caracteres entre 3-50 chars. Um usuário poderia inserir `<script>alert(1)</script>` como username. Como a API é JSON-only e o frontend é React Native (que não interpreta HTML), o risco de XSS é **mínimo**. Mas se futuramente houver um painel web, isso pode se tornar um problema.

**Recomendação:** Adicionar `.regex()` ou `.trim()` e sanitizar caracteres HTML.

---

### 10. `api-url.generated.ts` Está no `.gitignore` Mas Existe Localmente

**Arquivo:** [api-url.generated.ts](file:///home/mateus/projetos/app-react/financeiro-app/src/config/api-url.generated.ts)

**Observação:** Contém a URL de produção hardcoded. Está no `.gitignore`, então não vai para o repositório. Correto.

---

### 11. Frontend Não Faz Pinning de Certificado (SSL Pinning)

**Problema:** O app React Native não implementa certificate pinning. Isso significa que um atacante com acesso ao dispositivo pode instalar um certificado de CA customizado e interceptar tráfego HTTPS (MITM).

**Risco:** Baixo para um app financeiro pessoal. Alto para um app bancário.

**Recomendação:** Para o escopo atual, é aceitável. Se evoluir para transações financeiras reais, implementar SSL pinning.

---

### 12. Ausência de Testes Automatizados

**Problema:** Não há testes unitários ou de integração no projeto. Mudanças futuras podem introduzir regressões de segurança sem detecção.

---

### 13. Supabase RLS (Row Level Security)

**Observação:** O backend usa `supabaseAdmin` (service_role key) que **bypassa RLS**. Toda a lógica de autorização está no código do backend (scope middleware, `assertProductMutableInScope`, etc.). Isso é uma decisão arquitetural válida, mas significa que:
- A segurança depende 100% do backend estar correto
- Não há "segunda linha de defesa" no banco de dados

**Recomendação:** Considerar adicionar políticas RLS como camada adicional de defesa em profundidade.

---

## 📊 Resumo por Categoria

| Categoria | Status |
|-----------|--------|
| **Autenticação** | ✅ Sólido — JWT com verificação local, fallback Supabase, revogação |
| **Autorização** | ✅ Bom — scope middleware, verificação de ownership |
| **Validação de Input** | ✅ Excelente — Zod em todas as rotas |
| **Proteção contra Injection** | ✅ Bom — Supabase client usa queries parametrizadas |
| **Rate Limiting** | ⚠️ Bom para instância única, insuficiente para multi-instância |
| **Error Handling** | ⚠️ Funcional mas sem try-catch explícito nos controllers |
| **Gestão de Segredos** | ✅ Bom — .env no .gitignore, SecureStore no mobile |
| **CORS** | ✅ Whitelist com trade-off documentável para mobile |
| **Headers de Segurança** | ✅ Helmet configurado |
| **Criptografia** | ✅ HTTPS em produção, SecureStore no device |
| **Token Lifecycle** | ✅ Rotação de refresh, revogação de access |
| **Arquitetura** | ✅ Separação clara (routes → controllers → services → database) |
| **Testes** | ❌ Ausentes |

---

## 🏆 Nota Final

# 7.5 / 10

### Justificativa

| Aspecto | Nota | Peso |
|---------|------|------|
| Segurança de Autenticação | 8.5 | Alto |
| Validação e Sanitização | 8.0 | Alto |
| Autorização / Multi-tenancy | 8.0 | Alto |
| Rate Limiting | 6.5 | Médio |
| Error Handling | 6.0 | Médio |
| Resiliência (revogação persistente) | 5.5 | Médio |
| Testes | 2.0 | Alto |
| Arquitetura e Organização | 9.0 | Médio |
| Headers e Transport Security | 8.5 | Médio |
| Frontend Security | 7.5 | Médio |

**Para chegar a 9+:**
1. Adicionar `try-catch` wrapper nos controllers (ou manter a dependência explícita do Express 5)
2. Migrar rate limiting para Redis (quando escalar)
3. Persistir token revocation em Redis/DB
4. Sanitizar `username` contra HTML
5. Adicionar suite de testes (pelo menos para auth e authorization)
6. Considerar RLS no Supabase como defesa em profundidade

> [!TIP]
> A aplicação está **acima da média** para projetos pessoais/MVP. As recomendações acima são melhorias incrementais para quando o projeto escalar. Nenhuma vulnerabilidade crítica foi encontrada.
