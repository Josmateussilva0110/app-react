import { ProductErrorCode } from "../types/code/productCode"

export const productErrorHttpStatusMap: Record<ProductErrorCode, number> = {
    [ProductErrorCode.PRODUCT_CREATE_FAILED]: 500,   
    [ProductErrorCode.PRODUCT_FETCH_FAILED]: 500,
    [ProductErrorCode.PRODUCT_NOT_FOUND]: 404,
}
    