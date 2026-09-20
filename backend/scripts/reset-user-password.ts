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

/**
 * A auth-js só expõe `admin.signOut(jwt, scope)`, e ali o primeiro parâmetro
 * precisa ser um access token do próprio usuário — passar o id falha com
 * "token is malformed". Aqui não existe sessão para reaproveitar, então o
 * caminho é o endpoint admin do GoTrue, que aceita user id e a service role.
 */
async function revokeAllSessions(userId: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const response = await fetch(`${resolvedSupabaseUrl}/auth/v1/admin/users/${userId}/logout`, {
      method: "POST",
      headers: {
        apikey: resolvedServiceRoleKey,
        Authorization: `Bearer ${resolvedServiceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    })

    if (!response.ok) {
      const body = await response.text()
      return { ok: false, message: `GoTrue ${response.status}: ${body.slice(0, 200)}` }
    }

    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) }
  }
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

  // A senha já está trocada neste ponto. Ela é impressa ANTES dos passos
  // seguintes porque qualquer falha depois daqui não pode deixar a conta com
  // uma senha que ninguém conhece.
  console.log(`Senha temporária definida para ${userRow.email}`)
  console.log(`Senha: ${temporaryPassword}`)

  let incomplete = false

  const { error: flagError } = await supabaseAdmin
    .from("users")
    .update({ must_change_password: true })
    .eq("id", userRow.id)

  if (flagError) {
    console.error("⚠️  Falhou ao marcar must_change_password:", flagError.message)
    console.error("    O app NÃO vai exigir a troca no próximo login. Rode o script de novo.")
    incomplete = true
  } else {
    console.log("O usuário será obrigado a trocar a senha no próximo login.")
  }

  // Este script roda justamente quando a conta pode estar comprometida: sem
  // encerrar as sessões, quem já tem o refresh token continua dentro depois
  // do reset.
  const revoked = await revokeAllSessions(userRow.id)

  if (!revoked.ok) {
    console.error("⚠️  Falhou ao encerrar as sessões existentes:", revoked.message)
    console.error("    Sessões antigas podem continuar válidas.")
    incomplete = true
  } else {
    console.log("Sessões existentes encerradas (refresh tokens revogados no GoTrue).")
    console.log(
      "Obs.: access tokens já emitidos seguem aceitos pela API até expirarem (1h) — " +
        "este script roda fora do processo da API e não alcança a lista de revogação em memória."
    )
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

  if (incomplete) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
