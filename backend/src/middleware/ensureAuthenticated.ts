import { Request, Response, NextFunction } from "express"

export function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
  if (!request.session.user) {
    return response.status(401).json({
      status: false,
      message: "Usuário não autenticado"
    })
  }

  return next()
}
