import { env } from "../config/env"

/**
 * A auth-js só expõe `admin.signOut(jwt, scope)`, e o `jwt` ali precisa ser um
 * access token válido do próprio usuário — passar um userId falha com
 * "token is malformed: token contains an invalid number of segments".
 *
 * Para revogar a sessão de alguém que não é o autor da requisição (troca de
 * senha pelo suporte, ou por admin), o caminho é o endpoint admin do GoTrue,
 * que aceita user id e a service role. Não há método equivalente na auth-js.
 */
export async function revokeGoTrueSessions(
    userId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
    try {
        const response = await fetch(
            `${env.SUPABASE_URL}/auth/v1/admin/users/${userId}/logout`,
            {
                method: "POST",
                headers: {
                    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
                    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
                    "Content-Type": "application/json",
                },
                body: "{}",
            }
        )

        if (!response.ok) {
            const body = await response.text()
            return { ok: false, message: `GoTrue ${response.status}: ${body.slice(0, 200)}` }
        }

        return { ok: true }
    } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : String(error) }
    }
}
