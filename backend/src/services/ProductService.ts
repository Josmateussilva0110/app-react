import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
import {
    CreateProductInput,
    UpdateProductInput,
    ProductListQuery,
    PaginatedResult,
    ProductResponse,
    StatsQuery,
    DashboardStats,
} from "@app/shared"
import { ProductErrorCode } from "../types/code/productCode"
import {
    buildPaginationMeta,
    getPaginationRange,
    mapProductRow,
    ProductRowWithUser,
} from "../utils/productUtils"
import { buildProductListQuery } from "./product/productQuery"
import {
    aggregateDashboardStats,
    fetchProductsForYearStats,
    normalizeDashboardStats,
    ProductStatsRow,
} from "./product/productStats"

class ProductService {
    private toIsoDate(date: string): string {
        const [day, month, year] = date.split("/")
        return `${year}-${month}-${day}`
    }

    private productFetchError(
        message = "Não foi possível buscar os produtos."
    ): ServiceResult<never, ProductErrorCode> {
        return {
            status: false,
            error: {
                code: ProductErrorCode.PRODUCT_FETCH_FAILED,
                message,
            },
        }
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

    async getAll(
        query: ProductListQuery
    ): Promise<ServiceResult<PaginatedResult<ProductResponse>, ProductErrorCode>> {
        try {
            const { page, limit } = query
            const { from, to } = getPaginationRange(page, limit)

            const { data, error, count } = await buildProductListQuery(query).range(from, to)

            if (error) {
                console.error("[ProductService.getAll] Supabase error:", error)
                return this.productFetchError()
            }

            return {
                status: true,
                data: {
                    items: ((data ?? []) as ProductRowWithUser[]).map(mapProductRow),
                    meta: buildPaginationMeta(count ?? 0, page, limit),
                },
            }
        } catch (error) {
            console.error("[ProductService.getAll] error:", error)
            return this.productFetchError()
        }
    }

    async getStats(
        query: StatsQuery
    ): Promise<ServiceResult<DashboardStats, ProductErrorCode>> {
        try {
            const { data, error } = await supabaseAdmin.rpc("get_product_stats", {
                p_month: query.month,
                p_year: query.year,
                p_user_id: query.userId ?? null,
                p_status: query.status ?? "todos",
            })

            if (!error && data) {
                return { status: true, data: normalizeDashboardStats(data) }
            }

            if (error) {
                console.warn(
                    "[ProductService.getStats] RPC unavailable, using filtered fallback:",
                    error.message
                )
            }

            return await this.getStatsFallback(query)
        } catch (error) {
            console.error("[ProductService.getStats] error:", error)
            return this.productFetchError("Não foi possível calcular as estatísticas.")
        }
    }

    /** Fallback: busca só o ano selecionado (não a tabela inteira) e agrega em Node. */
    private async getStatsFallback(
        query: StatsQuery
    ): Promise<ServiceResult<DashboardStats, ProductErrorCode>> {
        const { data, error } = await fetchProductsForYearStats(query.year)

        if (error) {
            console.error("[ProductService.getStatsFallback] Supabase error:", error)
            return this.productFetchError("Não foi possível calcular as estatísticas.")
        }

        return {
            status: true,
            data: aggregateDashboardStats((data ?? []) as ProductStatsRow[], query),
        }
    }
}

export default new ProductService()
