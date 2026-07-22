import express, { type Request, type Response } from "express"
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

function healthPayload() {
    return { status: "ok", env: env.NODE_ENV }
}

export const app = express()

// ── Segurança ────────────────────────────────────────────
app.set("trust proxy", 1)

app.use(helmet()) // cabeçalhos de segurança HTTP
app.use(compression())

app.use(cors({
    origin(origin, callback) {
        // Requisições sem Origin (apps nativos, curl, Postman) → libera
        if (!origin) return callback(null, true)
        // Browser com origem na whitelist → libera
        if (env.ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
        // Browser com origem desconhecida → bloqueia
        callback(new Error(`CORS: origem "${origin}" não permitida`))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

// ── Rotas ────────────────────────────────────────────────
// Belmo/Coolify costumam usar "/" ou "/health" no health check — todas respondem 200.
const sendHealth = (_req: Request, res: Response) => {
    res.json(healthPayload())
}

app.get("/", sendHealth)
app.get("/health", sendHealth)
app.get("/api/health", sendHealth)


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
