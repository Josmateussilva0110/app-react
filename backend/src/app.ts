import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import swaggerUi from "swagger-ui-express"
import { env } from "./config/env"
import { rateLimiter } from "./middleware/rateLimiter"
import { errorHandler } from "./middleware/errorHandler"
import { notFound } from "./middleware/notFound"
import { swaggerSpec } from "./config/swagger"
import router from "./routes/routes"

export const app = express()

// ── Segurança ────────────────────────────────────────────
app.set("trust proxy", 1)

app.use(helmet()) // cabeçalhos de segurança HTTP
app.use(compression())

app.use(cors({
    origin: env.ALLOWED_ORIGINS,  // whitelist por ambiente
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

// ── Rotas ────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: env.NODE_ENV })
})


// ── Rate limit ANTES do parse do body ───────────────────
app.use(rateLimiter)

// ── Parse ────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }))   // limita tamanho do body
app.use(express.urlencoded({ extended: true }))


app.use("/api", router)

// Swagger apenas fora de produção
if (env.NODE_ENV !== "production") {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    console.log("📄 Swagger disponível em /api/docs")
}

// ── Handlers globais (sempre por último) ────────────────
app.use(notFound)       // 404
app.use(errorHandler)   // erros não tratados
