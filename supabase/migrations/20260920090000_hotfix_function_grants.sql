-- ================================================================
-- HOTFIX: privilégio de EXECUTE em funções SECURITY DEFINER
--
-- Contexto: UserService.login devolve ao app o access_token emitido
-- pelo próprio Supabase (role: authenticated, iss com a URL do
-- projeto). Todo usuário logado alcança o PostgREST direto, sem
-- passar pelo backend — então GRANT de função é defesa ativa, não
-- documentação.
--
-- O default do Postgres é EXECUTE para PUBLIC em toda função criada.
-- Quem não recebeu REVOKE está exposto a qualquer usuário do app.
--
-- Nada aqui altera o comportamento do backend, que usa service_role:
-- REVOKE FROM PUBLIC não remove concessão nominal, e as funções sem
-- GRANT nominal não são chamadas em lugar nenhum.
--
-- Só REVOKE e CREATE OR REPLACE. Nenhum DROP, nenhuma policy nova,
-- nada tocando service_role.
-- ================================================================


-- ----------------------------------------------------------------
-- 1. CRÍTICO — unlink_user_group_products
--
-- Criada em 20260717210000 com GRANT a service_role e SEM o
-- "REVOKE ALL ... FROM PUBLIC" que todas as outras RPCs receberam.
-- É SECURITY DEFINER, não consulta auth.uid() e aceita p_user_id e
-- p_group_id arbitrários: qualquer authenticated desvinculava os
-- produtos de qualquer usuário, de qualquer grupo.
--
-- Revogar não quebra nada — o backend não a chama. As quatro RPCs
-- usadas são get_product_stats, create_group_with_owner,
-- join_group_with_products e leave_group, e o DELETE equivalente é
-- inline dentro de leave_group.
-- ----------------------------------------------------------------
REVOKE ALL ON FUNCTION public.unlink_user_group_products(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.unlink_user_group_products(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.unlink_user_group_products(uuid, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.unlink_user_group_products(uuid, uuid) TO service_role;


-- ----------------------------------------------------------------
-- 2. Funções órfãs — SECURITY DEFINER, EXECUTE para PUBLIC, e
--    nenhuma policy final nem arquivo .ts as referencia.
--
-- is_product_in_group e is_product_personal permitiam sondar "o
-- produto X está no grupo Y" / "o produto X é pessoal do usuário Z"
-- para ids arbitrários.
--
-- REVOKE e não DROP: revogadas são inofensivas, e dropar não é
-- reversível com um GRANT. A remoção fica para depois que este
-- hotfix provar estar estável.
-- ----------------------------------------------------------------
REVOKE ALL ON FUNCTION public.is_product_in_group(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_product_in_group(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_product_in_group(uuid, uuid) FROM authenticated;

REVOKE ALL ON FUNCTION public.is_product_personal(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_product_personal(uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_product_personal(uuid, uuid) FROM authenticated;

REVOKE ALL ON FUNCTION public.current_user_group_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_group_id() FROM anon;
REVOKE ALL ON FUNCTION public.current_user_group_id() FROM authenticated;


-- ----------------------------------------------------------------
-- 3. stats_scope_predicate
--
-- Perdeu a ACL no DROP + CREATE de 20260717210000 e nunca foi
-- revogada. É chamada só de dentro de get_product_stats, que é
-- SECURITY DEFINER e roda como o dono — e o dono mantém EXECUTE
-- depois do REVOKE FROM PUBLIC, porque a ACL de uma função nasce
-- {owner=X/owner, =X/owner} e o revoke apaga só a segunda entrada.
-- get_product_stats continua funcionando igual.
--
-- NÃO transformar em SECURITY DEFINER: hoje ela roda sob a RLS de
-- quem chama; como DEFINER passaria a bypassar e viraria vazamento.
-- ----------------------------------------------------------------
REVOKE ALL ON FUNCTION public.stats_scope_predicate(uuid, uuid, uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.stats_scope_predicate(uuid, uuid, uuid, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.stats_scope_predicate(uuid, uuid, uuid, uuid) FROM authenticated;


-- ----------------------------------------------------------------
-- 4. handle_new_user — search_path fixo
--
-- Única SECURITY DEFINER do schema sem SET search_path
-- (20260707234334_user_table.sql:49). Com search_path mutável, a
-- resolução de nomes dentro da função depende de quem dispara o
-- trigger.
--
-- Corpo idêntico ao original. CREATE OR REPLACE preserva o oid, e
-- por isso o trigger on_auth_user_created continua apontando para
-- ela e a ACL é mantida.
--
-- Por último de propósito: é o único comando que exige ser dono da
-- função. Se falhar aqui, o bloco 1 já foi aplicado — mas como o
-- arquivo roda numa transação, uma falha desfaz tudo; nesse caso
-- aplique o bloco 1 isolado.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$;


-- ----------------------------------------------------------------
-- NÃO TOCAR: is_group_member e is_group_owner
--
-- Elas têm EXECUTE para PUBLIC, mas as policies de grupo dependem
-- disso — uma policy é avaliada com os privilégios de quem consulta.
-- Revogar sem conceder a authenticated quebraria todas as policies
-- de grupo de uma vez, e o ganho seria nulo: devolvem booleano
-- sobre auth.uid().
-- ----------------------------------------------------------------
