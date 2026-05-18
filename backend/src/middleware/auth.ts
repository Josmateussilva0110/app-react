import { Request, Response, NextFunction } from "express"
import { supabase } from "../database/supabase/supabase"

export async function authMiddleware(request: Request, response: Response, next: NextFunction): Promise<void> {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    response.status(401).json({ success: false, message: "Token não fornecido" })
    return
  }

  const token = authHeader.split(" ")[1]

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    response.status(401).json({ success: false, message: "Token inválido ou expirado" })
    return
  }

  request.user = data.user 
  next()
}
