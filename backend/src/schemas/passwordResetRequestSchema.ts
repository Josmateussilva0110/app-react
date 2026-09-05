import { z } from "zod"

export const PasswordResetRequestSchema = z.object({
    identifier: z
        .string()
        .trim()
        .min(1, "Informe o e-mail.")
        .email("E-mail inválido."),
})

export type PasswordResetRequestDTO = z.infer<typeof PasswordResetRequestSchema>
