import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabase } from "../database/supabase/supabase"
import { CreateProductInput } from "@app/shared"
import { ProductErrorCode } from "../types/code/productCode"
import { PRODUCT_SELECT_FIELDS } from "../constants/product-select-fields"
import { ProductResponse } from "../types/product/product-response"
import { PaginationParams, PaginatedProducts } from "../types/pagination/pagination-schema"





class ProductService {
    async create(data: CreateProductInput): Promise<ServiceResult<{ id: string }, ProductErrorCode>> {
        try {
            const { name, price, priority, paymentType, category, date, finished, monthList } = data

            const [day, month, year] = date.split("/")
            const isoDate = `${year}-${month}-${day}`

            const { data: product, error } = await supabase
                .from("products")
                .insert({
                    user_id: data.userId,  // snake_case
                    name,
                    price,
                    priority,
                    payment_type: paymentType,  // camelCase → snake_case
                    category,
                    date: isoDate,
                    finished,
                    month_list: monthList,    // camelCase → snake_case
                })
                .select("id")
                .single()

            if (error) {
                console.error("[ProductService.register] Supabase error:", error)
                return {
                    status: false,
                    error: {
                        code: ProductErrorCode.PRODUCT_CREATE_FAILED,
                        message: "Não foi possível cadastrar o produto. Tente novamente.",
                    },
                }
            }

            return {
                status: true,
                data: { id: product.id },
            }

        } catch (error) {
            console.error("[ProductService.register] error:", error)
            return {
                status: false,
                error: {
                    code: ProductErrorCode.PRODUCT_CREATE_FAILED,
                    message: "Não foi possível cadastrar o produto. Tente novamente.",
                },
            }
        }
    }

    async getAll({ page, limit }: PaginationParams): Promise<ServiceResult<PaginatedProducts, ProductErrorCode>> {
        try {
            const from = (page - 1) * limit
            const to = from + limit - 1

            const { data: products, error, count } = await supabase
                .from("products")
                .select<string, ProductResponse>(PRODUCT_SELECT_FIELDS, { count: "exact" })
                .order("date", { ascending: false })
                .range(from, to)

            if (error) {
                console.error("[ProductService.getAll] Supabase error:", error)
                return {
                    status: false,
                    error: {
                        code: ProductErrorCode.PRODUCT_FETCH_FAILED,
                        message: "Não foi possível buscar os produtos.",
                    },
                }
            }

            const total = count ?? 0

            return {
                status: true,
                data: {
                    items: products ?? [],
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            }
        } catch (error) {
            console.error("[ProductService.getAll] error:", error)
            return {
                status: false,
                error: {
                    code: ProductErrorCode.PRODUCT_FETCH_FAILED,
                    message: "Não foi possível buscar os produtos.",
                },
            }
        }
    }
}

export default new ProductService()
