# Modo solo + grupo — próximas etapas

Este documento descreve o que já foi implementado e o passo a passo do que falta para concluir a mudança de estratégia (uso individual por padrão, compartilhamento opcional via grupo).

---

## O que já está no código

### Banco (migration pronta, ainda não aplicada em produção)
- Arquivo: `supabase/migrations/20260717100000_groups_solo_scope.sql`
- Tabelas: `groups`, `group_members`, `group_invites`, `goals`, `group_products`
- Vínculo produto↔grupo: `group_products(group_id, product_id)` — **sem** `group_id` em `products`
- RLS de produtos: pessoais (dono) ou compartilhados via `group_products`

### Backend
- `GroupService` — criar, entrar, sair, convite (**somente o dono** gera convite)
- Ao sair: remove linhas em `group_products` dos produtos do usuário (permanecem em `products.user_id`)
- Ao cadastrar em grupo: insere em `products` + `group_products`
- `ProductService` — listagem e stats escopados por solo/grupo
- `GoalService` — meta pessoal ou meta do grupo
- Rotas: `/groups/me`, `/groups`, `/groups/invites`, `/groups/join`, `/groups/leave`

### Frontend
- `ProfileGroupCard` no perfil
- Telas `group/create` e `group/join`
- Dashboard com subtitle dinâmico e filtro por usuário só em grupo
- Meta: "pessoal" vs "do grupo"

---

## Etapa 1 — Ativar no ambiente (obrigatório)

### 1.1 Rodar a migration no Supabase

```bash
# Opção A: Supabase CLI
supabase db push

# Opção B: SQL Editor no dashboard Supabase
# Cole e execute o conteúdo de:
# supabase/migrations/20260717100000_groups_solo_scope.sql
```

**Checklist após migration:**
- [ ] Tabelas `groups`, `group_members`, `group_invites`, `goals` existem
- [ ] Coluna `products.group_id` existe
- [ ] Policy `users_select_scoped_products` substituiu `authenticated_select_products`

### 1.2 Rebuild do pacote shared e restart do backend

```bash
npm run build --workspace=@app/shared
# reiniciar o container/processo do backend
```

### 1.3 Smoke test manual

| # | Ação | Resultado esperado |
|---|------|-------------------|
| 1 | Login usuário A | Vê só produtos próprios (solo) |
| 2 | A cria grupo "Família" | Perfil mostra grupo; A é dono |
| 3 | A gera convite | Código de 6 caracteres (só dono vê botão) |
| 4 | B entra com código | B vê produtos do grupo |
| 5 | A cria produto | B também vê |
| 6 | B sai do grupo | Produtos de B voltam ao solo de B; de A ficam no grupo |
| 7 | Meta no solo vs grupo | Valores independentes |

---

## Etapa 2 — Dados existentes (produção) ✅

Migration dedicada: `supabase/migrations/20260717110000_production_preserve_products.sql`

### O que ela faz

| Cenário | Comportamento |
|---------|---------------|
| **Nenhum produto é apagado** | `user_id` de cada registro permanece intacto |
| **1 usuário** | Produtos ficam pessoais (`group_id` NULL) — cada um vê os seus |
| **2+ usuários** | Cria grupo **"Lista compartilhada"** com todos os usuários; associa os produtos existentes ao grupo para manter a visão compartilhada anterior |

### Ordem de execução no Supabase

```bash
# 1. Schema + RLS
supabase/migrations/20260717100000_groups_solo_scope.sql

# 2. Preservar produtos (produção)
supabase/migrations/20260717110000_production_preserve_products.sql
```

### Validar após migration

```sql
-- Total de produtos (deve ser igual ao anterior)
SELECT COUNT(*) AS total_produtos FROM public.products;

-- Produtos por dono (ninguém perde o que cadastrou)
SELECT user_id, COUNT(*) FROM public.products GROUP BY user_id;

-- Produtos órfãos (deve ser 0)
SELECT COUNT(*) FROM public.products p
  LEFT JOIN public.users u ON u.id = p.user_id
  WHERE u.id IS NULL;
```

### Se quiser só modo solo (sem grupo legado)

Comente o bloco `DO $$` em `20260717110000_production_preserve_products.sql` antes de rodar. Os produtos continuam no banco; cada usuário verá apenas os próprios.

### Deprecar `app_settings` (pendente)

- [ ] Confirmar que `goals` tem meta para todos os usuários
- [ ] Migration futura: `DROP TABLE app_settings` (só após validação)

---

## Etapa 3 — Performance e stats (RPC) ✅

Migration: `supabase/migrations/20260717120000_get_product_stats_scope.sql`

- Função `stats_scope_predicate` (solo/grupo)
- RPC `get_product_stats` com `p_viewer_user_id`, `p_group_id`, `p_filter_user_id`
- Índice `idx_products_scope`
- `ProductService.getStats` tenta RPC primeiro; fallback Node se indisponível

**Ordem no Supabase:** rodar após `20260717110000_production_preserve_products.sql`

---

## Etapa 4 — UX e telas ✅

Módulo `financeiro-app/src/features/group/`:

| Arquivo | Função |
|---------|--------|
| `constants/group-mode.constants.ts` | Labels solo/grupo |
| `hooks/use-group-mode.ts` | Estado derivado do grupo |
| `components/group-mode-badge.tsx` | Badge reutilizável (compact/default) |
| `components/group-mode-tab-indicator.tsx` | Indicador acima da tab bar |
| `index.ts` | Barrel export |

- [x] Subtitles dinâmicos (`useProductListLabels` → `useGroupMode`)
- [x] Filtro por usuário só em grupo
- [x] "Cadastrado por" no detalhe só em grupo
- [x] Deep link `group/join?code=XXXXXX`
- [x] Welcome atualizado
- [x] Badge modo pessoal / nome do grupo nas tabs

**Edge cases (backend):**
- Dono sai com outros membros → promove novo dono
- Membro em grupo não pode criar outro
- Entrar em segundo grupo → exige sair do atual

---

## Etapa 5 — Segurança e qualidade ✅

### 5.1 Backend (crítico)

O backend usa `supabaseAdmin` (bypass RLS). Toda rota que lê produtos **deve** usar `resolveProductScope(userId)`.

- [x] Revisar `ProductService.getAll`, `getStats`, `create`
- [x] Garantir que nenhuma rota aceita `groupId` vindo do client sem validar membership
- [x] `resolveScopedUserFilter` — filtro `userId` só em grupo e só para membros
- [x] Teste: usuário A não acessa produtos solo de B via API (`productMatchesScope`)

### 5.2 Testes automatizados

```bash
npm run test --workspace=backend
```

- [x] `GroupService.leave` — produtos do usuário saem do grupo
- [x] `GroupService.createInvite` — membro recebe 403
- [x] `buildProductListQuery` — filtro solo vs grupo
- [ ] E2E: fluxo criar → convidar → entrar → sair (requer ambiente com DB)

### 5.3 Observabilidade

- [x] Log estruturado em join/leave/create/invite group (`structuredLog.ts`)
- [ ] Métrica de grupos ativos (opcional)

---

## Etapa 6 — Evoluções futuras (backlog)

| Item | Descrição |
|------|-----------|
| Múltiplos grupos | Hoje: 1 grupo por usuário (`UNIQUE` em `group_members.user_id`) |
| Expulsar membro | Só dono; produtos do expulso voltam ao solo |
| Renomear grupo | `PATCH /groups` (owner) |
| Notificações | "X entrou no grupo" |
| Convite por link/e-mail | Além do código de 6 chars |
| Transferir ownership | Dono passa grupo para outro membro |
| Produto pessoal + compartilhado | Hoje: produto é solo OU do grupo, não ambos |

---

## Ordem sugerida de execução

```
1. Rodar migration + smoke test          ← fazer agora
2. Validar dados existentes (Etapa 2)    ← se já tem produção
3. Ajustes de UX (Etapa 4)               ← concluído
4. RPC stats (Etapa 3)                   ← concluído
5. Testes + segurança (Etapa 5)          ← concluído
6. Backlog (Etapa 6)                     ← conforme demanda
```

---

## Referência rápida de arquivos

| Área | Arquivos principais |
|------|---------------------|
| Migration | `supabase/migrations/20260717100000_groups_solo_scope.sql` |
| Grupo (backend) | `backend/src/services/GroupService.ts` |
| Escopo produtos | `backend/src/utils/productScope.ts`, `product/productQuery.ts` |
| Logs grupo | `backend/src/utils/structuredLog.ts` |
| Testes backend | `backend/src/**/*.test.ts` (`npm run test --workspace=backend`) |
| Metas | `backend/src/services/GoalService.ts` |
| Rotas | `backend/src/routes/groupRoutes.ts` |
| Perfil | `financeiro-app/src/features/profile/components/profile-group-card.tsx` |
| Grupo (frontend) | `financeiro-app/src/features/group/` |
| Hooks API grupo | `financeiro-app/src/hooks/use-group.ts` |
| Dashboard | `financeiro-app/src/app/(protected)/dashboard.tsx` |
| Schemas | `packages/shared/src/schemas/group.schema.ts` |

---

## Regras de negócio (resumo)

- **Padrão:** modo pessoal — vê produtos próprios sem vínculo em `group_products`
- **Grupo:** vê produtos ligados ao grupo via `group_products`
- **Cadastro em grupo:** produto fica do usuário e é vinculado automaticamente ao grupo
- **Sair:** remove vínculos do usuário em `group_products`; produtos continuam dele
- **Convite:** apenas o **dono** gera código (válido 7 dias)
- **Sair:** produtos que você criou voltam ao seu solo; dos outros permanecem no grupo
- **Edição:** só quem criou edita/apaga (independente do grupo)
- **Meta:** pessoal no solo; compartilhada no grupo
