import { env } from "./config/env"
import { app } from "./app"

app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🔥 Servidor rodando na porta ${env.PORT} [${env.NODE_ENV}]`)
})
