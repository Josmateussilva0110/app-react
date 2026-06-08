import rateLimit from "express-rate-limit"

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, 
  message: {
    success: false,
    message: "Muitas tentativas. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
