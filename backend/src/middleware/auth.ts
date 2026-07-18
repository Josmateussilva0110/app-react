import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import type { User } from "@supabase/supabase-js"
import { env } from "../config/env"

type SupabaseJwtPayload = jwt.JwtPayload & {
  sub: string
  email?: string
}

function toAuthUser(payload: SupabaseJwtPayload): User {
  const aud = payload.aud
  return {
    id: payload.sub,
    email: payload.email ?? "",
    aud: Array.isArray(aud) ? aud[0] ?? "authenticated" : aud ?? "authenticated",
    role: payload.role ?? "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: "",
  }
}

export function authMiddleware(request: Request, response: Response, next: NextFunction): void {
  const authHeader = request.headers.authorization

  if (!authHeader?.startsWith("Bearer ")) {
    response.status(401).json({ success: false, message: "Token não fornecido" })
    return
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET) as SupabaseJwtPayload
    request.user = toAuthUser(payload)
    request.accessToken = token
    next()
  } catch {
    response.status(401).json({ success: false, message: "Token inválido ou expirado" })
  }
}
