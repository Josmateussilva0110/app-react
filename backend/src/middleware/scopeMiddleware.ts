import { Request, Response, NextFunction } from "express"
import { resolveProductScope } from "../utils/productScope"

export async function scopeMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    request.scope = await resolveProductScope(request.user.id)
    next()
  } catch (error) {
    console.error("[scopeMiddleware] error:", error)
    response.status(500).json({ success: false, message: "Erro ao resolver escopo do usuário." })
  }
}
