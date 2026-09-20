import { Request, Response, NextFunction } from "express"
import { env } from "../config/env"

export interface AppError extends Error {
    statusCode?: number
    code?: string
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const statusCode = err.statusCode ?? 500
    const isProd = env.NODE_ENV === "production"

    console.error(`[${statusCode}] ${err.message}`, isProd ? "" : err.stack)

    // Mesmo envelope de sendFailure ({ success, message }): o app lê `message`
    // do topo (services/request.ts), e com `{ status, error: { message } }`
    // toda exceção chegava na tela como "Erro ao processar solicitação.".
    // A mensagem interna do 500 continua escondida em produção.
    res.status(statusCode).json({
        success: false,
        message: isProd && statusCode === 500 ? "Erro interno do servidor." : err.message,
        ...(isProd ? {} : { stack: err.stack }),
    })
}
