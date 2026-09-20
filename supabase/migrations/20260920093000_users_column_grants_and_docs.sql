-- ================================================================
-- BLINDAGEM: controle por coluna em users, fecho do anon, e o
-- registro de por que a ausência de policy de escrita é intencional.
--
-- Premissa (igual à do hotfix 20260920090000): o app carrega o
-- access_token emitido pelo Supabase, então o usuário alcança o
-- PostgREST direto. GRANT e policy são defesa ativa.
--
-- Nada aqui é visível para o backend, que usa service_role.
-- ================================================================


-- ----------------------------------------------------------------
-- A. users — controle por COLUNA
--
-- A policy "Usuário atualiza apenas seu perfil" é row-level: ela
-- autoriza a LINHA inteira. RLS não sabe distinguir coluna.
--
-- Sem o grant abaixo, um usuário com o próprio token faz
--   UPDATE users SET must_change_password = false WHERE id = auth.uid()
-- via PostgREST e fura o portão de troca forçada de senha
-- (scripts/reset-user-password.ts liga a flag; o portão do app é
-- src/app/(protected)/_layout.tsx). O mesmo vale para `email`, que
-- é o identificador usado em UserService.changePassword para
-- revalidar a senha atual.
--
-- Invisível para o backend: as cinco escritas em users
-- (UserService.ts:226,266,345,421,431) são todas supabaseAdmin.
--
-- Reversível: GRANT UPDATE ON public.users TO authenticated;
-- ----------------------------------------------------------------
REVOKE UPDATE ON public.users FROM authenticated;
GRANT UPDATE (username) ON public.users TO authenticated;


-- ----------------------------------------------------------------
-- B. Fecho do anon — defense in depth
--
-- Todas as policies são TO authenticated, então anon já não passa
-- por elas. Isto remove também o privilégio de tabela, para o caso
-- de a anon key vazar por algum canal (CI, log, cliente antigo).
--
-- Seguro: supabaseAuth (anon key) só toca endpoints do GoTrue
-- (signUp, signInWithPassword, refreshSession, updateUser), que não
-- passam por GRANT de tabela em public. O INSERT em public.users no
-- registro é feito pelo trigger handle_new_user, que é SECURITY
-- DEFINER e roda como o dono.
-- ----------------------------------------------------------------
REVOKE ALL ON public.products         FROM anon;
REVOKE ALL ON public.users            FROM anon;
REVOKE ALL ON public.goals            FROM anon;
REVOKE ALL ON public.groups           FROM anon;
REVOKE ALL ON public.group_members    FROM anon;
REVOKE ALL ON public.group_invites    FROM anon;
REVOKE ALL ON public.group_products   FROM anon;


-- ----------------------------------------------------------------
-- C. Por que NÃO existe policy de escrita nestas tabelas
--
-- Decisão explícita, não esquecimento. Deny-by-default é o estado
-- mais seguro, e como o usuário alcança o PostgREST direto, cada
-- policy nova é uma porta que passa a existir de verdade. Elas
-- entram no dia de uma migração para cliente-por-usuário, junto do
-- código que precisar delas — não antes.
-- ----------------------------------------------------------------
COMMENT ON TABLE public.group_members IS
  'Linka usuários a grupos. ESCRITA EXCLUSIVA via RPC SECURITY DEFINER '
  '(create_group_with_owner, join_group_with_products, leave_group). '
  'A ausência de policy de INSERT/UPDATE/DELETE é INTENCIONAL: entrar num '
  'grupo depende de apresentar um convite válido, condição que RLS não sabe '
  'expressar. Um INSERT WITH CHECK (user_id = auth.uid()) deixaria qualquer '
  'um se auto-adicionar a qualquer grupo — e é a linha aqui que DEFINE o '
  'escopo em resolveProductScope, ou seja, dá leitura dos produtos de todo '
  'o grupo. Não adicionar policy de escrita.';

COMMENT ON TABLE public.group_invites IS
  'Convites de grupo. SELECT: só o dono (owners_select_group_invites). '
  'ESCRITA via backend em service_role (createInvite) e via RPC '
  'join_group_with_products (UPDATE status=accepted). A ausência de policy '
  'de escrita é INTENCIONAL: quem aceita um convite ainda não é membro nem '
  'dono, logo nenhum predicado baseado em is_group_owner poderia autorizá-lo.';

COMMENT ON TABLE public.goals IS
  'Metas mensais, escopo user ou group. SELECT por users_select_goals. '
  'ESCRITA só pelo backend em service_role (GoalService), que aplica '
  'denyIfNotGroupOwner no escopo de grupo. Ausência de policy de escrita é '
  'INTENCIONAL — ver COMMENT de group_members.';

COMMENT ON TABLE public.groups IS
  'Grupos. SELECT por members_select_group. Criação e remoção via RPC '
  'SECURITY DEFINER; renomeio pelo backend em service_role, que valida '
  'role=owner. Ausência de policy de escrita é INTENCIONAL.';


-- ----------------------------------------------------------------
-- D. users — policies com alvo explícito
--
-- As duas policies originais (20260707234334) foram criadas sem
-- cláusula TO, então o alvo é PUBLIC, o que inclui anon. É
-- cosmético — anon tem auth.uid() NULL e nunca satisfaz
-- auth.uid() = id — mas o alvo explícito evita ruído na auditoria.
--
-- O WITH CHECK é redundante (o Postgres reusa o USING quando ele é
-- omitido num UPDATE), e está escrito de propósito: protege de quem
-- mais tarde alargar o USING sem perceber que alarga o WITH CHECK
-- junto.
--
-- ATENÇÃO: esta é a única parte do plano NÃO reversível por um
-- GRANT. A volta exige recriar as policies com os nomes acentuados
-- originais.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Usuário vê apenas seu perfil" ON public.users;
CREATE POLICY "users_select_own_profile"
ON public.users FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário atualiza apenas seu perfil" ON public.users;
CREATE POLICY "users_update_own_profile"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
