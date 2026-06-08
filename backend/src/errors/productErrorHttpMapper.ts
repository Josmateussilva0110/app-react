import { ProductErrorCode } from "../types/code/productCode"

export const productErrorHttpStatusMap: Record<ProductErrorCode, number> = {
    [ProductErrorCode.PRODUCT_CREATE_FAILED]: 500,   
}
