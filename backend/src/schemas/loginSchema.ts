import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres."),
});
