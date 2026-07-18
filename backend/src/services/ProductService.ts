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
import { resolveScopedUserFilter, type ProductScope } from "../utils/productScope"
import { linkProductToGroup } from "../utils/groupProducts"
import { normalizeDashboardStats } from "./product/productStats"

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

    private notFoundError(): ServiceResult<never, ProductErrorCode> {
        return {
            status: false,
            error: {
                code: ProductErrorCode.PRODUCT_NOT_FOUND,
                message: "Produto não encontrado.",
            },
        }
    }

    async create(
        data: CreateProductInput,
        scope: ProductScope
    ): Promise<ServiceResult<{ id: string }, ProductErrorCode>> {
        try {
            const { name, price, priority, paymentType, category, date, finished, monthList } = data
            const isoDate = this.toIsoDate(date)

            const { data: product, error } = await supabaseAdmin
                .from("products")
                .insert({
                    user_id: data.userId,
                    name,
                    price,
                    priority,
                    payment_type: paymentType,
                    category,
                    date: isoDate,
                    finished,
                    month_list: monthList,
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

            if (scope.mode === "group") {
                try {
                    await linkProductToGroup(product.id, scope.groupId)
                } catch (linkError) {
                    console.error("[ProductService.register] group link error:", linkError)
                    await supabaseAdmin.from("products").delete().eq("id", product.id)
                    return {
                        status: false,
                        error: {
                            code: ProductErrorCode.PRODUCT_CREATE_FAILED,
                            message: "Não foi possível compartilhar o produto com o grupo.",
                        },
                    }
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
                .maybeSingle()

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

            if (!product) {
                return this.notFoundError()
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
            const { data: deleted, error } = await supabaseAdmin
                .from("products")
                .delete()
                .eq("id", id)
                .eq("user_id", userId)
                .select("id")
                .maybeSingle()

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

            if (!deleted) {
                return this.notFoundError()
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
        query: ProductListQuery,
        scope: ProductScope
    ): Promise<ServiceResult<PaginatedResult<ProductResponse>, ProductErrorCode>> {
        try {
            const { page, limit } = query
            const { from, to } = getPaginationRange(page, limit)
            const scopedUserId = resolveScopedUserFilter(scope, query.userId)
            const scopedQuery = { ...query, userId: scopedUserId }

            const { data, error, count } = await buildProductListQuery(scopedQuery, scope, from, to)

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
        query: StatsQuery,
        scope: ProductScope
    ): Promise<ServiceResult<DashboardStats, ProductErrorCode>> {
        try {
            const scopedUserId = resolveScopedUserFilter(scope, query.userId)
            const scopedQuery = { ...query, userId: scopedUserId }
            const pGroupId = scope.mode === "group" ? scope.groupId : null

            const { data, error } = await supabaseAdmin.rpc("get_product_stats", {
                p_month: scopedQuery.month,
                p_year: scopedQuery.year,
                p_viewer_user_id: scope.userId,
                p_group_id: pGroupId,
                p_filter_user_id: scopedQuery.userId ?? null,
                p_status: query.status ?? "todos",
                p_month_list:
                    query.monthList === "true"
                        ? true
                        : query.monthList === "false"
                          ? false
                          : null,
            })

            if (error || !data) {
                console.error("[ProductService.getStats] RPC error:", error?.message ?? "empty response")
                return this.productFetchError("Não foi possível calcular as estatísticas.")
            }

            return { status: true, data: normalizeDashboardStats(data) }
        } catch (error) {
            console.error("[ProductService.getStats] error:", error)
            return this.productFetchError("Não foi possível calcular as estatísticas.")
        }
    }
}

export default new ProductService()
