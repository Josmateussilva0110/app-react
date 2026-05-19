import { z } from "zod"

export const RegisterSchema = z.object({
  id: z
    .number()
    .int()
    .positive("ID inválido.")
    .optional(),

  username: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres.")
    .max(50, "Nome deve ter no máximo 50 caracteres."),

  email: z
    .string()
    .email("Email inválido."),

  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres."),

  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Senhas precisam ser iguais.",
  path: ["confirmPassword"],
})
