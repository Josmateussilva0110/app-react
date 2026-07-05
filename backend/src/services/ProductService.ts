import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
import {
    CreateProductInput,
    UpdateProductInput,
    PaginationParams,
    PaginatedResult,
    ProductResponse,
} from "@app/shared"
import { ProductErrorCode } from "../types/code/productCode"
import { PRODUCT_SELECT_FIELDS } from "../constants/product-select-fields"

class ProductService {
    private toIsoDate(date: string): string {
        const [day, month, year] = date.split("/")
        return `${year}-${month}-${day}`
    }

    private async assertProductOwner(
        id: string,
        userId: string
    ): Promise<ServiceResult<{ user_id: string }, ProductErrorCode>> {
        const { data, error } = await supabaseAdmin
            .from("products")
            .select("user_id")
            .eq("id", id)
            .maybeSingle()

        if (error) {
            console.error("[ProductService.assertProductOwner] Supabase error:", error)
            return {
                status: false,
                error: {
                    code: ProductErrorCode.PRODUCT_FETCH_FAILED,
                    message: "Não foi possível verificar o produto.",
                },
            }
        }

        if (!data) {
            return {
                status: false,
                error: {
                    code: ProductErrorCode.PRODUCT_NOT_FOUND,
                    message: "Produto não encontrado.",
                },
            }
        }

        if (data.user_id !== userId) {
            return {
                status: false,
                error: {
                    code: ProductErrorCode.PRODUCT_FORBIDDEN,
                    message: "Você não tem permissão para alterar este produto.",
                },
            }
        }

        return { status: true, data }
    }

    async create(data: CreateProductInput): Promise<ServiceResult<{ id: string }, ProductErrorCode>> {
        try {
            const { name, price, priority, paymentType, category, date, finished, monthList } = data

            const isoDate = this.toIsoDate(date)

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

    async update(data: UpdateProductInput): Promise<ServiceResult<{ id: string }, ProductErrorCode>> {
        try {
            const ownership = await this.assertProductOwner(data.id, data.userId)
            if (!ownership.status) return ownership

            const { id, userId, name, price, priority, paymentType, category, date, finished, monthList } = data
            const isoDate = this.toIsoDate(date)

            const { data: product, error } = await supabaseAdmin
                .from("products")
                .update({
                    name,
                    price,
                    priority,
                    payment_type: paymentType,
                    category,
                    date: isoDate,
                    finished,
                    month_list: monthList,
                })
                .eq("id", id)
                .eq("user_id", userId)
                .select("id")
                .single()

            if (error) {
                console.error("[ProductService.update] Supabase error:", error)
                return {
                    status: false,
                    error: {
                        code: ProductErrorCode.PRODUCT_UPDATE_FAILED,
                        message: "Não foi possível atualizar o produto. Tente novamente.",
                    },
                }
            }

            return {
                status: true,
                data: { id: product.id },
            }
        } catch (error) {
            console.error("[ProductService.update] error:", error)
            return {
                status: false,
                error: {
                    code: ProductErrorCode.PRODUCT_UPDATE_FAILED,
                    message: "Não foi possível atualizar o produto. Tente novamente.",
                },
            }
        }
    }

    async delete(id: string, userId: string): Promise<ServiceResult<null, ProductErrorCode>> {
        try {
            const ownership = await this.assertProductOwner(id, userId)
            if (!ownership.status) return ownership

            const { error } = await supabaseAdmin
                .from("products")
                .delete()
                .eq("id", id)
                .eq("user_id", userId)

            if (error) {
                console.error("[ProductService.delete] Supabase error:", error)
                return {
                    status: false,
                    error: {
                        code: ProductErrorCode.PRODUCT_DELETE_FAILED,
                        message: "Não foi possível remover o produto. Tente novamente.",
                    },
                }
            }

            return { status: true, data: null }
        } catch (error) {
            console.error("[ProductService.delete] error:", error)
            return {
                status: false,
                error: {
                    code: ProductErrorCode.PRODUCT_DELETE_FAILED,
                    message: "Não foi possível remover o produto. Tente novamente.",
                },
            }
        }
    }

    async getAll({ page, limit }: PaginationParams): Promise<ServiceResult<PaginatedResult<ProductResponse>, ProductErrorCode>> {
        try {
            const from = (page - 1) * limit
            const to = from + limit - 1

            const { data: products, error, count } = await supabaseAdmin
                .from("products")
                .select(PRODUCT_SELECT_FIELDS, { count: "exact" })
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
                return { ...rest, user_id, user_name: userMap.get(user_id) ?? "" }
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
