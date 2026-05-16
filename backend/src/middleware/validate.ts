import { ZodTypeAny, ZodError } from "zod"
import { Request, Response, NextFunction } from "express"
import { HttpResponse } from "../types/http/HttpResponse"

type ValidateTarget = "body" | "params" | "query"

export const validate =
  (schema: ZodTypeAny, target: ValidateTarget = "body") =>
  (request: Request, response: Response<HttpResponse>, next: NextFunction) => {
    try {
      const result = schema.parse(request[target])
      request[target] = result
      return next()
    } catch (err) {
      if (err instanceof ZodError) {
        return response.status(422).json({
          status: false,
          message: "Erro de validação",
          errors: err.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        })
      }

      console.error("Erro inesperado no validator:", err)

      return response.status(500).json({
        status: false,
        message: "Erro interno no servidor",
      })
    }
  }
