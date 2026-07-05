export {
  paginationSchema,
  type PaginationParams,
  type PaginationMeta,
  type PaginatedResult,
} from "@app/shared";

import type { ProductResponse, PaginatedResult } from "@app/shared";

export type PaginatedProducts = PaginatedResult<ProductResponse>;
