import crypto from "crypto"
import jwt from "jsonwebtoken"

const revokedTokenHashes = new Map<string, number>()

/**
 * Revogação por usuário: `cutoffMs` é o instante da revogação, e só os
 * tokens emitidos antes dele caem. Guardar apenas um prazo derrubaria
 * também os tokens emitidos depois — o usuário ficava sem entrar até o
 * TTL vencer, mesmo tendo acabado de fazer login.
 */
type UserRevocation = { cutoffMs: number; expiresAtMs: number }

const revokedUsers = new Map<string, UserRevocation>()

const DEFAULT_USER_REVOKE_TTL_MS = 60 * 60 * 1000

function pruneExpired(): void {
    const now = Date.now()

    for (const [hash, expMs] of revokedTokenHashes) {
        if (expMs <= now) revokedTokenHashes.delete(hash)
    }

    for (const [userId, entry] of revokedUsers) {
        if (entry.expiresAtMs <= now) revokedUsers.delete(userId)
    }
}

function hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
}

export function revokeAccessToken(token: string): void {
    const payload = jwt.decode(token) as { exp?: number } | null
    if (!payload?.exp) return

    revokedTokenHashes.set(hashToken(token), payload.exp * 1000)
    pruneExpired()
}

export function revokeUserSessions(userId: string, ttlMs = DEFAULT_USER_REVOKE_TTL_MS): void {
    const now = Date.now()
    revokedUsers.set(userId, { cutoffMs: now, expiresAtMs: now + ttlMs })
    pruneExpired()
}

export function isAccessTokenRevoked(token: string): boolean {
    pruneExpired()
    const expMs = revokedTokenHashes.get(hashToken(token))
    if (!expMs) return false
    return Date.now() < expMs
}

/**
 * `issuedAtSeconds` é o `iat` do token. Sem ele a resposta é "revogado":
 * não há como provar que o token nasceu depois da revogação.
 */
export function isUserSessionRevoked(userId: string, issuedAtSeconds?: number): boolean {
    pruneExpired()
    const entry = revokedUsers.get(userId)
    if (!entry) return false
    if (Date.now() >= entry.expiresAtMs) return false
    if (issuedAtSeconds === undefined) return true

    // `iat` tem granularidade de segundo: comparar contra o início do
    // segundo da revogação evita derrubar um token emitido nesse mesmo
    // segundo (o login imediatamente posterior à troca de senha).
    const cutoffSecondMs = Math.floor(entry.cutoffMs / 1000) * 1000
    return issuedAtSeconds * 1000 < cutoffSecondMs
}
