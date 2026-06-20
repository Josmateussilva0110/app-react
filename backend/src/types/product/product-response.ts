import { ProductRow } from "./product-row";

export type ProductResponse = Omit<ProductRow, "user_id">;
