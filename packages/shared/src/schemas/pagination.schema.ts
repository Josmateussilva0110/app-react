import { z } from "zod";
import { categoryEnum } from "./product.schema";
import { statsStatusEnum } from "./stats.schema";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/** Remove string vazia de query params (Expo Router / forms). */
function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) return undefined;
  if (Array.isArray(value)) return emptyToUndefined(value[0]);
  return value;
}

export const productListQuerySchema = paginationSchema.extend({
  category: z.preprocess(emptyToUndefined, categoryEnum.optional()),
  /** Mês 1-12 */
  month: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(12).optional()
  ),
  year: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(2000).max(2100).optional()
  ),
  userId: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  status: z.preprocess(
    emptyToUndefined,
    statsStatusEnum.optional().default("todos")
  ),
  /** Filtra pela flag month_list (`true` | `false`). */
  monthList: z.preprocess(
    emptyToUndefined,
    z.enum(["true", "false"]).optional()
  ),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};
