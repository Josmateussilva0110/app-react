# Fluxo de troca de senha

Documentação completa do fluxo de senha no app **loja-joias**: troca voluntária no perfil, recuperação via suporte e troca obrigatória após reset administrativo.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Fluxo 1 — Alterar senha no perfil](#fluxo-1--alterar-senha-no-perfil)
4. [Fluxo 2 — Esqueci a senha](#fluxo-2--esqueci-a-senha)
5. [Fluxo 3 — Troca obrigatória](#fluxo-3--troca-obrigatória)
6. [Fluxo do suporte (admin)](#fluxo-do-suporte-admin)
7. [Estados da solicitação de reset](#estados-da-solicitação-de-reset)
8. [Banco de dados](#banco-de-dados)
9. [Endpoints](#endpoints)
10. [Segurança](#segurança)
11. [Referência de arquivos](#referência-de-arquivos)

---

## Visão geral

Existem **três cenários** distintos. Não há envio automático de e-mail ou link mágico — a recuperação de conta é **manual pelo suporte**.

| # | Cenário | Usuário | Resumo |
|---|---------|---------|--------|
| 1 | **Alterar senha** | Logado | Perfil → senha atual + nova senha |
| 2 | **Esqueci a senha** | Deslogado | Solicita ajuda → suporte reseta manualmente |
| 3 | **Troca obrigatória** | Logado c/ senha temp. | App bloqueia até definir senha definitiva |

### Mapa dos três fluxos

```mermaid
flowchart TB
    subgraph C1["Fluxo 1 — Perfil"]
        A1[Usuário logado] --> A2[Perfil → Alterar senha]
        A2 --> A3[Informa senha atual + nova]
        A3 --> A4[Backend reautentica e atualiza]
        A4 --> A5[Continua usando o app]
    end

    subgraph C2["Fluxo 2 — Esqueci a senha"]
        B1[Usuário deslogado] --> B2[Login → Solicitar ajuda]
        B2 --> B3[Informa e-mail]
        B3 --> B4[Solicitação pending no banco]
        B4 --> B5[Suporte confirma identidade]
        B5 --> B6[Script gera senha temporária]
        B6 --> C3
    end

    subgraph C3["Fluxo 3 — Troca obrigatória"]
        D1[Login com senha temporária] --> D2{must_change_password?}
        D2 -->|Sim| D3[Tela: Defina nova senha]
        D3 --> D4[Senha definitiva salva]
        D4 --> D5[App liberado]
        D2 -->|Não| D5
    end

    B6 -.-> D1
```

---

## Arquitetura

```mermaid
flowchart LR
    subgraph App["App (React Native / Expo)"]
        Login["/login"]
        Forgot["/forgot-password"]
        Profile["/profile"]
        Required["/change-password-required"]
        Guard["Protected Layout Guard"]
    end

    subgraph API["Backend (Express)"]
        EP1["PUT /profile/password"]
        EP2["POST /auth/password-reset-request"]
        EP3["GET /profile"]
        US["UserService"]
    end

    subgraph Supabase["Supabase"]
        Auth["Auth (senhas)"]
        Users["users"]
        Requests["password_reset_requests"]
    end

    subgraph Admin["Suporte"]
        Studio["Supabase Studio"]
        Script["reset-user-password.ts"]
    end

    Login --> Forgot
    Forgot --> EP2
    Profile --> EP1
    Required --> EP1
    Guard --> EP3
    EP1 --> US
    EP2 --> US
    EP3 --> US
    US --> Auth
    US --> Users
    US --> Requests
    Studio --> Requests
    Script --> Auth
    Script --> Users
    Script --> Requests
```

---

## Fluxo 1 — Alterar senha no perfil

Usuário **já autenticado** troca a senha voluntariamente.

### Jornada no app

```mermaid
flowchart TD
    Start([Usuário logado]) --> Home[Acessa Perfil]
    Home --> Card[Card Alterar senha]
    Card --> Form[Preenche formulário]
    Form --> F1[Senha atual]
    Form --> F2[Nova senha]
    Form --> F3[Confirmar nova senha]
    F1 & F2 & F3 --> Submit[Toca Atualizar senha]
    Submit --> Valid{Validação local OK?}
    Valid -->|Não| Err1[Toast com erro de validação]
    Err1 --> Form
    Valid -->|Sim| API[PUT /profile/password]
    API --> Resp{Resposta}
    Resp -->|Senha atual incorreta| Err2[Toast: Senha atual incorreta]
    Resp -->|Erro| Err3[Toast com mensagem do servidor]
    Resp -->|Sucesso| Ok[Toast: Senha atualizada]
    Err2 --> Form
    Err3 --> Form
    Ok --> End([Continua no perfil])
```

### Sequência técnica (backend)

```mermaid
sequenceDiagram
    actor U as Usuário
    participant App as App
    participant API as Backend
    participant SB as Supabase Auth
    participant DB as users

    U->>App: Preenche senha atual + nova
    App->>API: PUT /profile/password (Bearer token)
    API->>DB: Busca perfil (email, must_change_password)
    API->>SB: signInWithPassword (reautenticação)
    alt Senha atual incorreta
        SB-->>API: Erro
        API-->>App: 401 Senha atual incorreta
    else Senha atual correta
        SB-->>API: Sessão fresca
        API->>SB: updateUser({ password: nova })
        SB-->>API: OK
        API->>DB: getProfile (atualizado)
        API-->>App: 200 Senha atualizada
        App-->>U: Toast de sucesso
    end
```

### Requisitos da nova senha

| Regra | Detalhe |
|-------|---------|
| Tamanho | Mínimo 8, máximo 128 caracteres |
| Maiúscula | Pelo menos 1 letra maiúscula |
| Número | Pelo menos 1 dígito |
| Especial | Pelo menos 1 caractere especial |
| Diferente | Não pode ser igual à senha atual |

### API

```http
PUT /api/profile/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_password": "senha-atual",
  "new_password": "NovaSenha1!",
  "confirm_password": "NovaSenha1!"
}
```

| Situação | HTTP | Mensagem |
|----------|------|----------|
| Sucesso | 200 | Senha atualizada com sucesso. |
| Senha atual errada | 401 | Senha atual incorreta. |
| Senhas não coincidem | 422 | As senhas não coincidem. |
| Nova senha igual à atual | 422 | A nova senha deve ser diferente da senha atual. |

### Telas e arquivos

| Etapa | Caminho |
|-------|---------|
| Tela | Perfil → card **Alterar senha** |
| Componente | `app/src/features/profile/components/profile-change-password-card.tsx` |
| Hook | `app/src/hooks/use-profile.ts` → `useChangePassword()` |
| Service | `app/src/services/profile.service.ts` |

---

## Fluxo 2 — Esqueci a senha

Usuário **deslogado** solicita ajuda. O suporte trata manualmente.

### Jornada no app (usuário)

```mermaid
flowchart TD
    Start([Tela de Login]) --> Link[Toca Solicitar ajuda]
    Link --> Forgot[Tela Esqueci a senha]
    Forgot --> Email[Informa e-mail]
    Email --> Send[Enviar solicitação]
    Send --> API[POST /auth/password-reset-request]
    API --> Always[Mensagem genérica de sucesso]
    Always --> Back[Redireciona para Login]
    Back --> Wait([Aguarda contato do suporte])

    note1[/"Mesma mensagem mesmo se o e-mail<br/>não existir no sistema"/]
    Always -.- note1
```

### Sequência técnica (solicitação)

```mermaid
sequenceDiagram
    actor U as Usuário
    participant App as App
    participant API as Backend
    participant DB as users
    participant REQ as password_reset_requests

    U->>App: Informa e-mail
    App->>API: POST /auth/password-reset-request
    API->>DB: Busca user_id pelo e-mail
    alt E-mail existe
        API->>REQ: INSERT status = pending
    else E-mail não existe
        Note over API: Não insere registro
    end
    API-->>App: 200 Mensagem genérica
    App-->>U: Solicitação enviada. Equipe entrará em contato...
```

### Fluxo completo (usuário + suporte)

```mermaid
flowchart TD
    subgraph Usuario["👤 Usuário"]
        U1[Esqueci a senha no app] --> U2[Informa e-mail]
        U2 --> U3[Recebe confirmação genérica]
        U3 --> U4[Aguarda contato]
        U4 --> U5[Confirma identidade c/ suporte]
        U5 --> U6[Recebe senha temporária]
        U6 --> U7[Login no app]
        U7 --> Fluxo3[Fluxo 3 — Troca obrigatória]
    end

    subgraph Suporte["🛠 Suporte"]
        S1[Vê solicitação pending] --> S2[Contata usuário]
        S2 --> S3{Identidade confirmada?}
        S3 -->|Não| S4[Marca rejected ou encerra]
        S3 -->|Sim| S5[Roda script de reset]
        S5 --> S6[Envia senha temp. pelo canal seguro]
    end

    U2 -.->|Registro no banco| S1
    S6 -.-> U6
```

### API

```http
POST /api/auth/password-reset-request
Content-Type: application/json

{
  "identifier": "usuario@email.com"
}
```

Resposta sempre genérica (não revela se o e-mail existe):

```json
{
  "success": true,
  "message": "Solicitação registrada."
}
```

### Telas e arquivos

| Etapa | Caminho |
|-------|---------|
| Link na login | `app/src/features/auth/components/login-footer.tsx` |
| Tela | `app/src/app/forgot-password.tsx` |
| Formulário | `app/src/features/auth/components/forgot-password-form.tsx` |
| Service | `app/src/services/auth.service.ts` → `requestPasswordReset()` |

---

## Fluxo 3 — Troca obrigatória

Ativado quando `must_change_password = true` (após reset pelo suporte).

### Jornada no app

```mermaid
flowchart TD
    Start([Login com senha temporária]) --> Auth[Autenticação OK]
    Auth --> Protected[Entra no layout protegido]
    Protected --> Load[Carrega GET /profile]
    Load --> Check{must_change_password?}

    Check -->|false| Normal([Home / app normal])
    Check -->|true| Redirect[Redirect → change-password-required]

    Redirect --> Block[Navegação bloqueada]
    Block --> Screen[Tela: Defina uma nova senha]
    Screen --> Form[Nova senha + confirmar]
    Form --> API[PUT /profile/password<br/>sem current_password]
    API --> Ok{Sucesso?}
    Ok -->|Não| Err[Toast de erro]
    Err --> Form
    Ok -->|Sim| Flag[must_change_password = false]
    Flag --> Home([Redireciona para Home])
```

### Guard de navegação

```mermaid
flowchart LR
    subgraph Layout["(protected)/_layout.tsx"]
        A[signed?] -->|Não| Login[/login]
        A -->|Sim| B[profile carregado?]
        B --> C{must_change_password<br/>AND não está na tela de troca?}
        C -->|Sim| D[/change-password-required]
        C -->|Não| E[Stack normal<br/>home, clientes, perfil...]
    end
```

### Sequência técnica (troca obrigatória)

```mermaid
sequenceDiagram
    actor U as Usuário
    participant App as App
    participant API as Backend
    participant Admin as Supabase Admin
    participant DB as users

    U->>App: Nova senha + confirmar
    App->>API: PUT /profile/password (sem current_password)
    API->>DB: must_change_password = true
    API->>Admin: admin.updateUserById (nova senha)
    Admin-->>API: OK
    API->>DB: must_change_password = false
    API-->>App: 200 Perfil atualizado
    App->>App: Redirect → Home
    App-->>U: App liberado
```

> **Diferença do Fluxo 1:** aqui não exige senha atual; o backend usa Admin API porque é senha temporária definida pelo suporte.

### Telas e arquivos

| Etapa | Caminho |
|-------|---------|
| Tela | `app/src/app/(protected)/change-password-required.tsx` |
| Guard | `app/src/app/(protected)/_layout.tsx` |
| Flag no perfil | `must_change_password` em `GET /profile` |

---

## Fluxo do suporte (admin)

### Diagrama de decisão

```mermaid
flowchart TD
    Start([Nova solicitação pending]) --> View[Consultar password_reset_requests]
    View --> Contact[Contatar usuário<br/>WhatsApp / telefone]
    Contact --> Verify{Identidade confirmada?}

    Verify -->|Não| Reject[status = rejected<br/>resolved_at, resolved_by]
    Reject --> End1([Encerrar])

    Verify -->|Sim| Optional[Opcional: status = contacted]
    Optional --> Script[Executar reset-user-password.ts]
    Script --> Steps

    subgraph Steps["O script executa"]
        S1[Admin API: nova senha temp.]
        S2[users.must_change_password = true]
        S3[password_reset_requests → resolved]
    end

    Steps --> Send[Enviar senha ao usuário<br/>pelo canal seguro]
    Send --> Instruct[Orientar: logar e trocar senha]
    Instruct --> End2([Aguardar login do usuário → Fluxo 3])
```

### Sequência do script de reset

```mermaid
sequenceDiagram
    actor Admin as Suporte
    participant Script as reset-user-password.ts
    participant Auth as Supabase Auth (Admin)
    participant DB as users
    participant REQ as password_reset_requests

    Admin->>Script: npx ts-node scripts/... email [senha]
    Script->>DB: SELECT id, email FROM users
    alt Usuário não encontrado
        Script-->>Admin: Erro — usuário não encontrado
    else Usuário encontrado
        Script->>Auth: admin.updateUserById (senha temp.)
        Script->>DB: UPDATE must_change_password = true
        Script->>REQ: UPDATE status = resolved
        Script-->>Admin: Imprime senha temporária no terminal
        Admin->>Admin: Envia senha ao usuário
    end
```

### Consultar solicitações pendentes

Supabase Studio → Table Editor → `password_reset_requests`:

```sql
SELECT id, user_id, identifier, status, requested_at
FROM password_reset_requests
WHERE status = 'pending'
ORDER BY requested_at DESC;
```

### Criar senha temporária

Requer `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env` do backend.

```bash
cd backend

# Senha gerada automaticamente
npx ts-node scripts/reset-user-password.ts usuario@email.com

# Senha definida manualmente
npx ts-node scripts/reset-user-password.ts usuario@email.com MinhaSenhaTemp1!
```

| Passo | Ação |
|-------|------|
| 1 | Define senha temporária no Supabase Auth |
| 2 | Marca `must_change_password = true` |
| 3 | Marca solicitações `pending` como `resolved` |
| 4 | Imprime senha no terminal |

---

## Estados da solicitação de reset

```mermaid
stateDiagram-v2
    [*] --> pending: Usuário envia solicitação no app

    pending --> contacted: Suporte iniciou contato
    pending --> rejected: Identidade não confirmada
    pending --> resolved: Script de reset executado

    contacted --> resolved: Identidade confirmada + reset
    contacted --> rejected: Não confirmou identidade

    resolved --> [*]
    rejected --> [*]

    note right of pending
        Estado inicial ao criar
        password_reset_requests
    end note

    note right of resolved
        resolved_at e resolved_by
        preenchidos pelo script ou manualmente
    end note
```

| Status | Significado |
|--------|-------------|
| `pending` | Solicitação criada, aguardando suporte |
| `contacted` | Suporte entrou em contato (opcional) |
| `resolved` | Senha resetada, caso encerrado |
| `rejected` | Identidade não confirmada |

---

## Banco de dados

Migration: `supabase/migrations/20260803120000_password_flow.sql`

### Modelo de dados

```mermaid
erDiagram
    users ||--o{ password_reset_requests : "user_id"
    users {
        uuid id PK
        text email
        text username
        boolean must_change_password
    }
    password_reset_requests {
        uuid id PK
        uuid user_id FK
        text identifier
        text status
        timestamptz requested_at
        timestamptz resolved_at
        text resolved_by
    }
```

### Coluna `users.must_change_password`

| Valor | Quando |
|-------|--------|
| `false` | Padrão — usuário com senha normal |
| `true` | Após reset pelo suporte; força Fluxo 3 |
| `false` | Após troca bem-sucedida na tela obrigatória |

### Tabela `password_reset_requests`

| Coluna | Descrição |
|--------|-----------|
| `id` | UUID da solicitação |
| `user_id` | Referência ao usuário (null se e-mail não existir*) |
| `identifier` | E-mail informado no app |
| `status` | `pending` · `contacted` · `resolved` · `rejected` |
| `requested_at` | Data da solicitação |
| `resolved_at` | Data da resolução |
| `resolved_by` | Quem tratou (ex.: `support-script`) |

\*Quando o e-mail não existe, nenhum registro é inserido (resposta genérica ao usuário).

**RLS:** tabela inacessível pelo app autenticado — apenas `service_role` (backend/scripts).

---

## Endpoints

```mermaid
flowchart LR
    subgraph Public["Rotas públicas"]
        P1["POST /auth/password-reset-request"]
    end

    subgraph Protected["Rotas autenticadas"]
        P2["GET /profile"]
        P3["PUT /profile/password"]
    end

    Client[App] --> Public
    Client --> Protected
```

| Método | Rota | Auth | Descrição |
|--------|------|:----:|-----------|
| `POST` | `/api/auth/password-reset-request` | Não | Solicita reset manual |
| `GET` | `/api/profile` | Sim | Retorna `must_change_password` |
| `PUT` | `/api/profile/password` | Sim | Troca de senha (perfil ou obrigatória) |

---

## Segurança

```mermaid
mindmap
  root((Segurança))
    Segredos
      service_role só no backend
      Nunca no app ou Git
    Privacidade
      Resposta genérica no esqueci senha
      Sem enumeração de e-mails
    Senha temporária
      must_change_password obrigatório
      Uso único até troca
    Troca no perfil
      Reautenticação com senha atual
      Sessão fresca no Supabase
    Suporte
      Confirmação manual de identidade
      Senha enviada por canal seguro
```

| Regra | Detalhe |
|-------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Só backend, Render e script local de suporte |
| Esqueci a senha | Resposta idêntica exista ou não o e-mail |
| Senha temporária | Sempre com `must_change_password = true` |
| Perfil | Exige senha atual + reauth antes de `updateUser` |
| Suporte | Confirmar identidade antes de rodar o script |

---

## Referência de arquivos

| Área | Arquivo | Função |
|------|---------|--------|
| **Backend** | `backend/src/services/UserService.ts` | `changePassword`, `requestPasswordReset` |
| **Backend** | `backend/src/routes/userRoutes.ts` | Rotas da API |
| **Backend** | `backend/scripts/reset-user-password.ts` | Reset manual pelo suporte |
| **App** | `app/src/features/profile/components/profile-change-password-card.tsx` | Card no perfil |
| **App** | `app/src/app/forgot-password.tsx` | Tela esqueci a senha |
| **App** | `app/src/app/(protected)/change-password-required.tsx` | Troca obrigatória |
| **App** | `app/src/app/(protected)/_layout.tsx` | Guard de redirecionamento |
| **App** | `app/src/schemas/auth.schema.ts` | Validação de senhas |
| **DB** | `supabase/migrations/20260803120000_password_flow.sql` | Migration |

---

## Resumo visual — ciclo de vida completo

```mermaid
flowchart TB
    subgraph F2["Esqueci a senha"]
        direction TB
        E1[Solicitação no app] --> E2[(password_reset_requests)]
    end

    subgraph Admin["Suporte"]
        direction TB
        A1[Confirma identidade] --> A2[Script reset]
        A2 --> A3[(users.must_change_password = true)]
        A2 --> E2
    end

    subgraph F3["Login + troca obrigatória"]
        direction TB
        L1[Login senha temp.] --> L2[Tela nova senha]
        L2 --> L3[(must_change_password = false)]
        L3 --> OK([Acesso normal])
    end

    subgraph F1["Uso contínuo"]
        direction TB
        P1[Perfil → alterar senha] --> P2[Reauth + nova senha]
    end

    E2 --> A1
    A3 --> L1
    OK --> F1
    OK --> P1
```

---

## Documentação relacionada

- [Fluxo de notificações](./FLUXO_NOTIFICACOES.md)
- [Backend — API Express](./BACKEND.md)
- [App — Expo / React Native](./APP.md)
