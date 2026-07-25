import rateLimit from "express-rate-limit"

/**
 * MemoryStore: contadores resetam a cada deploy/restart.
 * Para produção multi-instância, configure REDIS_URL e use rate-limit-redis.
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,              
  message: {
    success: false,
    message: "Muitas requisições. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})
