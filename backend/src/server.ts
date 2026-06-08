import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import router from "../src/routes/routes"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger"
import { rateLimiter } from "./middleware/rateLimiter"

dotenv.config()

const app = express()


app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))


app.set("trust proxy", 1);
app.use(rateLimiter);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get("/api", (request: Request, response: Response) => {
  response.json({ status: "API rodando com TypeScript 🚀" })
})

app.use("/api", router)
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const PORT = 3001

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`)
})
