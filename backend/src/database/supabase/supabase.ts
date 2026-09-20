import { createClient } from "@supabase/supabase-js"
import { env } from "../../config/env"

const clientOptions = {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
} as const

/** Ignora a RLS — use só no acesso a dados do servidor e nas APIs admin de auth. */
export const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    clientOptions
)

/**
 * Fluxos de auth (login/register/refresh) — não pode dividir sessão com o supabaseAdmin.
 *
 * É singleton de módulo, compartilhado por todas as requisições: use só em
 * chamadas que leem o **valor de retorno** (login, register, refresh). Operação
 * que dependa da sessão gravada no cliente precisa de uma instância própria —
 * ver `createIsolatedAuthClient`.
 */
export const supabaseAuth = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    clientOptions
)

/**
 * Cliente de auth descartável, para uma requisição só.
 *
 * `signInWithPassword` grava a sessão no cliente que o executou. Num singleton
 * compartilhado isso vira corrida: duas requisições concorrentes sobrescrevem
 * a sessão uma da outra, e a que ler depois age em nome do usuário errado.
 * Quando a operação precisa da sessão — e não só do retorno — crie uma
 * instância aqui e descarte ao fim.
 */
export function createIsolatedAuthClient() {
    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, clientOptions)
}
