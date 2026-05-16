import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import session from "express-session"
import PgSession from "connect-pg-simple"
import { Pool } from "pg"
import router from "../src/routes/routes"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"

dotenv.config()

const app = express()


const pgPool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  ssl: false
})



const PostgresSession = PgSession(session)

app.use(cors({
  origin: "http://localhost:4000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))



app.use(express.json())


const TIME_IN_SECONDS = 60 * 60 * 24 * 5 // 5 dias 
const TIME_IN_MS = TIME_IN_SECONDS * 1000 // 5 dias

app.use(
  session({
    store: new PostgresSession({
      pool: pgPool,
      tableName: "session",
      createTableIfMissing: true,
      ttl: TIME_IN_SECONDS,
      pruneSessionInterval: 60 * 30,
    }),
    secret: process.env.SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: TIME_IN_MS,
    },
  })
)

app.get("/", (request: Request, response: Response) => {
  response.json({ status: "API rodando com TypeScript 🚀" })
})

app.use("/", router)
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const PORT = 3001

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`)
})
