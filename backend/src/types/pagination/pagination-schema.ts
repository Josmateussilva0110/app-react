import { z } from "zod"
import { ProductResponse } from "../product/product-response";


export type PaginationParams = { page: number; limit: number }

export type PaginatedProducts = {
    items: ProductResponse[]
    meta: { total: number; page: number; limit: number; totalPages: number }
}


export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
