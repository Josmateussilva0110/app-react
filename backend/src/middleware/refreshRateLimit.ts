import rateLimit from "express-rate-limit"

export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Muitas tentativas. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
