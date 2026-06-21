import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
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

            const { data: product, error } = await supabaseAdmin
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

            const { data: products, error, count } = await supabaseAdmin
                .from("products")
                .select(`${PRODUCT_SELECT_FIELDS}, user_id`, { count: "exact" })
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

            const rows = products ?? []

            // Resolve usernames from Supabase Auth in batch
            const uniqueUserIds = [...new Set(rows.map((p: any) => p.user_id as string))]
            const userMap = new Map<string, string>()

            await Promise.all(
                uniqueUserIds.map(async (uid) => {
                    try {
                        const { data } = await supabaseAdmin.auth.admin.getUserById(uid)
                        const username = data?.user?.user_metadata?.username ?? ""
                        userMap.set(uid, username)
                    } catch {
                        userMap.set(uid, "")
                    }
                })
            )

            const items: ProductResponse[] = rows.map((p: any) => {
                const { user_id, ...rest } = p
                return { ...rest, user_name: userMap.get(user_id) ?? "" }
            })

            const total = count ?? 0

            return {
                status: true,
                data: {
                    items,
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
