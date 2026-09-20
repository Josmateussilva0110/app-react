import { Request, Response } from "express"

/**
 * Mesmo envelope de sendFailure ({ success, message }): o app lê `message` do
 * topo (services/request.ts) e, com `{ status, error: { message } }`, todo 404
 * chegava na tela como o genérico "Erro ao processar solicitação.".
 */
export const notFound = (_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Rota não encontrada.",
    })
}
