import { env } from "./config/env"
import { app } from "./app"

const server = app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🔥 Servidor rodando na porta ${env.PORT} [${env.NODE_ENV}]`)
})

function shutdown(signal: string): void {
    console.log(`${signal} recebido — encerrando servidor...`)
    server.close(() => {
        console.log("Servidor encerrado.")
        process.exit(0)
    })
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))
