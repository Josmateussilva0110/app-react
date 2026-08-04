/**
 * Script de suporte: gera senha temporária e força troca no próximo login.
 *
 * Uso:
 *   npx ts-node scripts/reset-user-password.ts usuario@email.com
 *   npx ts-node scripts/reset-user-password.ts usuario@email.com MinhaSenhaTemp1!
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env (backend ou raiz).
 */

import crypto from "crypto"
import path from "path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: path.resolve(__dirname, "../../.env") })
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
})

function generateTempPassword(): string {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    const lower = "abcdefghijkmnopqrstuvwxyz"
    const digits = "23456789"
    const special = "!@#$%&*"
    const all = upper + lower + digits + special

    const pick = (chars: string) => chars[crypto.randomInt(chars.length)]

    const required = [pick(upper), pick(lower), pick(digits), pick(special)]
    const rest = Array.from({ length: 8 }, () => pick(all))

    return [...required, ...rest]
        .sort(() => crypto.randomInt(3) - 1)
        .join("")
}

async function main(): Promise<void> {
    const emailArg = process.argv[2]
    const passwordArg = process.argv[3]

    if (!emailArg) {
        console.error("Uso: npx ts-node scripts/reset-user-password.ts <email> [senha-temporaria]")
        process.exit(1)
    }

    const email = emailArg.trim().toLowerCase()
    const tempPassword = passwordArg ?? generateTempPassword()

    const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, email")
        .ilike("email", email)
        .maybeSingle()

    if (userError || !user) {
        console.error(`Usuário não encontrado: ${email}`)
        process.exit(1)
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
        password: tempPassword,
    })

    if (authError) {
        console.error("Erro ao atualizar senha no Auth:", authError.message)
        process.exit(1)
    }

    const { error: flagError } = await supabase
        .from("users")
        .update({ must_change_password: true })
        .eq("id", user.id)

    if (flagError) {
        console.error("Erro ao marcar must_change_password:", flagError.message)
        process.exit(1)
    }

    const now = new Date().toISOString()

    const { error: resolveError } = await supabase
        .from("password_reset_requests")
        .update({
            status: "resolved",
            resolved_at: now,
            resolved_by: "support-script",
        })
        .eq("user_id", user.id)
        .eq("status", "pending")

    if (resolveError) {
        console.error("Aviso: não foi possível atualizar solicitações pendentes:", resolveError.message)
    }

    console.log("")
    console.log("Senha temporária definida com sucesso.")
    console.log(`Usuário: ${user.email}`)
    console.log(`Senha:   ${tempPassword}`)
    console.log("")
    console.log("Oriente o usuário a fazer login e definir uma nova senha.")
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
