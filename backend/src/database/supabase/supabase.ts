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

/** Fluxos de auth (login/register/refresh) — não pode dividir sessão com o supabaseAdmin. */
export const supabaseAuth = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    clientOptions
)
