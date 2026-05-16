import { z } from "zod"

export const UserIdParamSchema = z.object({
  user_id: z
    .string()
    .regex(/^\d+$/, "Usuário não autenticado")
    .transform(Number)
})
