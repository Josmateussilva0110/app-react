import { z } from "zod"

export const UpdateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Nome deve ter no mínimo 3 caracteres.")
    .max(50, "Nome deve ter no máximo 50 caracteres."),
})

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>
