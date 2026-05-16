import { z } from "zod"

export const RegisterClientSchema = z.object({
  username: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres.")
    .max(50, "Nome deve ter no máximo 50 caracteres."),

  cpf: z 
    .string()
    .length(11, "CPF deve ter 11 caracteres."),

  phone: z 
    .string()
    .length(11, "Telefone deve ter 11 caracteres."),

  email: z
    .string()
    .email("Email inválido."),

  user_id: z
    .coerce
    .number()
    .int("Coordenador invalido")
    .positive("Id Coordenador invalido"),
})

