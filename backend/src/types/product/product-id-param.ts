import { z } from "zod"

export const productIdParamSchema = z.object({
    id: z.uuid("ID do produto inválido"),
})

export type ProductIdParam = z.infer<typeof productIdParamSchema>
