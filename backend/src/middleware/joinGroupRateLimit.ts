import rateLimit from "express-rate-limit"

/** Limita tentativas de adivinhar código de convite (6 chars). */
export const joinGroupRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Muitas tentativas de entrar no grupo. Tente novamente em 15 minutos.",
    },
    standardHeaders: true,
    legacyHeaders: false,
})
