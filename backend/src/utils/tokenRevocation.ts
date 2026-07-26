import crypto from "crypto"
import jwt from "jsonwebtoken"

const revokedTokenHashes = new Map<string, number>()
const revokedUsers = new Map<string, number>()

const DEFAULT_USER_REVOKE_TTL_MS = 60 * 60 * 1000

function pruneExpired(): void {
    const now = Date.now()

    for (const [hash, expMs] of revokedTokenHashes) {
        if (expMs <= now) revokedTokenHashes.delete(hash)
    }

    for (const [userId, untilMs] of revokedUsers) {
        if (untilMs <= now) revokedUsers.delete(userId)
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
    revokedUsers.set(userId, Date.now() + ttlMs)
    pruneExpired()
}

export function isAccessTokenRevoked(token: string): boolean {
    pruneExpired()
    const expMs = revokedTokenHashes.get(hashToken(token))
    if (!expMs) return false
    return Date.now() < expMs
}

export function isUserSessionRevoked(userId: string): boolean {
    pruneExpired()
    const untilMs = revokedUsers.get(userId)
    if (!untilMs) return false
    return Date.now() < untilMs
}
