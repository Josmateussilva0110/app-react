import { createClient } from "@supabase/supabase-js"
import { env } from "../../config/env"

const clientOptions = {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
} as const

/** Bypasses RLS — use only for server-side DB and admin auth APIs. */
export const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    clientOptions
)

/** Auth flows (login/register/refresh) — must not share session with supabaseAdmin. */
export const supabaseAuth = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    clientOptions
)
