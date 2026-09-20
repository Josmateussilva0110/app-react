/**
 * Script de suporte: reseta senha temporária e exige troca no próximo login.
 *
 * Uso:
 *   cd backend
 *   npx ts-node scripts/reset-user-password.ts <email> [nova-senha-temporaria]
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
 */
import { createClient } from "@supabase/supabase-js"
import { randomInt } from "node:crypto"
import { config } from "dotenv"
import path from "path"

const backendRoot = path.resolve(__dirname, "..")
const monorepoRoot = path.resolve(backendRoot, "..")

config({ path: path.join(monorepoRoot, ".env") })
config({ path: path.join(backendRoot, ".env") })

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env")
  process.exit(1)
}

const resolvedSupabaseUrl = supabaseUrl
const resolvedServiceRoleKey = serviceRoleKey

const supabaseAdmin = createClient(resolvedSupabaseUrl, resolvedServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

interface ResolvedUser {
  id: string
  email: string
}

// randomInt (CSPRNG), não Math.random(): isto é credencial, mesmo que
// temporária. Igual ao GroupService.generateInviteCode.
function generateTemporaryPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%"
  let password = "Aa1!"

  for (let index = password.length; index < 12; index += 1) {
    password += chars[randomInt(chars.length)]
  }

  return password
}

async function findUserByEmail(email: string): Promise<ResolvedUser | null> {
  const { data: publicUser, error: publicError } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle()

  if (publicError) {
    console.error("Erro ao consultar public.users:", publicError.message)
  }

  if (publicUser) {
    return publicUser
  }

  const { data: authUser, error: authError } = await supabaseAdmin
    .schema("auth")
    .from("users")
    .select("id, email")
    .ilike("email", email)
    .maybeSingle()

  if (authError) {
    console.error("Erro ao consultar auth.users:", authError.message)
    return null
  }

  if (!authUser) {
    return null
  }

  const username =
    authUser.email?.split("@")[0] ?? "usuario"

  const { error: syncError } = await supabaseAdmin.from("users").upsert(
    {
      id: authUser.id,
      email: authUser.email,
      username,
    },
    { onConflict: "id" }
  )

  if (syncError) {
    console.warn(
      "Usuário encontrado em auth.users, mas falhou ao sincronizar public.users:",
      syncError.message
    )
  }

  return authUser
}

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  const temporaryPassword = process.argv[3] ?? generateTemporaryPassword()

  if (!email) {
    console.error("Uso: npx ts-node scripts/reset-user-password.ts <email> [nova-senha-temporaria]")
    process.exit(1)
  }

  const userRow = await findUserByEmail(email)

  if (!userRow) {
    console.error("Usuário não encontrado para o e-mail informado.")
    console.error(`Projeto Supabase: ${new URL(resolvedSupabaseUrl).host}`)
    console.error("Verifique se o e-mail está correto e se o .env aponta para o projeto certo.")
    process.exit(1)
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userRow.id, {
    password: temporaryPassword,
  })

  if (authError) {
    console.error("Falha ao resetar senha:", authError.message)
    process.exit(1)
  }

  // Este script roda justamente quando a conta pode estar comprometida:
  // sem encerrar as sessões, quem já tem o refresh token continua dentro
  // depois do reset.
  const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(userRow.id, "global")

  if (signOutError) {
    console.error(
      "ATENÇÃO: senha resetada, mas falhou ao encerrar as sessões existentes:",
      signOutError.message
    )
    console.error("Sessões antigas podem continuar válidas. Repita o signOut antes de entregar a senha.")
    process.exit(1)
  }

  const { error: flagError } = await supabaseAdmin
    .from("users")
    .update({ must_change_password: true })
    .eq("id", userRow.id)

  if (flagError) {
    console.error("Senha resetada, mas falhou ao marcar must_change_password:", flagError.message)
    process.exit(1)
  }

  await supabaseAdmin
    .from("password_reset_requests")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolved_by: "support-script",
    })
    .eq("user_id", userRow.id)
    .eq("status", "pending")

  console.log(`Senha temporária definida para ${userRow.email}`)
  console.log(`Senha: ${temporaryPassword}`)
  console.log("O usuário será obrigado a trocar a senha no próximo login.")
  console.log("Sessões existentes encerradas (refresh tokens revogados no GoTrue).")
  console.log(
    "Obs.: access tokens já emitidos seguem aceitos pela API até expirarem (1h) — " +
      "este script roda fora do processo da API e não alcança a lista de revogação em memória."
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
