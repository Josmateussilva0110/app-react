import { z } from "zod"
import { passwordField } from "./passwordSchema"

export const ChangePasswordSchema = z
    .object({
        current_password: z.string().optional(),
        new_password: passwordField,
        confirm_password: z.string().min(1, "Confirme a nova senha."),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "As senhas não coincidem.",
        path: ["confirm_password"],
    })

export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>
