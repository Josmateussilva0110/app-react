import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

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
