export {
  paginationSchema,
  productListQuerySchema,
  type PaginationParams,
  type ProductListQuery,
  type PaginationMeta,
  type PaginatedResult,
} from "@app/shared";

import type { ProductResponse, PaginatedResult } from "@app/shared";

export type PaginatedProducts = PaginatedResult<ProductResponse>;
