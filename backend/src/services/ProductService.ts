import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
import {
    CreateProductInput,
    UpdateProductInput,
    PaginationParams,
    PaginatedResult,
    ProductResponse,
    StatsQuery,
    DashboardStats,
} from "@app/shared"
import { ProductErrorCode } from "../types/code/productCode"
import { PRODUCT_SELECT_FIELDS } from "../constants/product-select-fields"

/** Extrai ano e mês (1-12) de uma data ISO (YYYY-MM-DD) ou DD/MM/YYYY. */
function parseYearMonth(date: string): { year: number; month: number } | null {
    if (!date) return null
    const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return { year: Number(iso[1]), month: Number(iso[2]) }
    const br = date.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    if (br) return { year: Number(br[3]), month: Number(br[2]) }
    const d = new Date(date)
    if (!isNaN(d.getTime())) return { year: d.getFullYear(), month: d.getMonth() + 1 }
    return null
}

function isTruthyFlag(value: unknown): boolean {
    return value === true || value === "true" || value === 1 || value === "t"
}

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
                .select(`${PRODUCT_SELECT_FIELDS}, users:user_id(username)`, { count: "exact" })
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

            const items: ProductResponse[] = rows.map((p: any) => {
                const { users, user_id, ...rest } = p
                return { ...rest, user_id, user_name: users?.username ?? "" }
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

    async getStats(
        query: StatsQuery
    ): Promise<ServiceResult<DashboardStats, ProductErrorCode>> {
        try {
            const { month, year, userId } = query

            const { data: products, error } = await supabaseAdmin
                .from("products")
                .select(`${PRODUCT_SELECT_FIELDS}, users:user_id(username)`)
                .limit(10000)

            if (error) {
                console.error("[ProductService.getStats] Supabase error:", error)
                return {
                    status: false,
                    error: {
                        code: ProductErrorCode.PRODUCT_FETCH_FAILED,
                        message: "Não foi possível calcular as estatísticas.",
                    },
                }
            }

            const rows = (products ?? []) as any[]

            // Usuários (para o filtro).
            const usersMap = new Map<string, string>()
            for (const p of rows) {
                if (p.user_id) usersMap.set(p.user_id, p.users?.username ?? "")
            }

            // Métricas do mês/ano (e usuário, se filtrado).
            let total = 0
            let monthListTotal = 0
            let itemsCount = 0
            let pendingCount = 0
            const categoryMap = new Map<string, { total: number; count: number }>()
            const paymentMap = new Map<string, number>()

            // Evolução do ano por usuário (ignora o filtro de usuário p/ comparar).
            const evoByUser = new Map<string, number[]>()

            for (const p of rows) {
                const ym = parseYearMonth(p.date)
                if (!ym) continue
                const price = Number(p.price) || 0

                if (ym.year === year) {
                    if (!evoByUser.has(p.user_id)) evoByUser.set(p.user_id, new Array(12).fill(0))
                    evoByUser.get(p.user_id)![ym.month - 1] += price
                }

                const matchesUser = !userId || p.user_id === userId
                if (ym.year !== year || ym.month !== month || !matchesUser) continue

                total += price
                itemsCount += 1
                if (isTruthyFlag(p.month_list)) monthListTotal += price
                if (!isTruthyFlag(p.finished)) pendingCount += 1

                const cat = p.category ?? "outros"
                const prev = categoryMap.get(cat) ?? { total: 0, count: 0 }
                categoryMap.set(cat, { total: prev.total + price, count: prev.count + 1 })

                const pay = p.payment_type ?? "outros"
                paymentMap.set(pay, (paymentMap.get(pay) ?? 0) + price)
            }

            const byCategory = Array.from(categoryMap.entries())
                .map(([category, v]) => ({ category, total: v.total, count: v.count }))
                .sort((a, b) => b.total - a.total)

            const byPayment = Array.from(paymentMap.entries())
                .map(([paymentType, t]) => ({ paymentType, total: t }))
                .sort((a, b) => b.total - a.total)

            const series = Array.from(evoByUser.entries())
                .map(([id, data]) => ({
                    userId: id,
                    userName: usersMap.get(id) ?? "",
                    data,
                }))
                .sort((a, b) => a.userName.localeCompare(b.userName))

            const users = Array.from(usersMap.entries())
                .map(([id, name]) => ({ id, name }))
                .sort((a, b) => a.name.localeCompare(b.name))

            return {
                status: true,
                data: {
                    total,
                    monthListTotal,
                    itemsCount,
                    pendingCount,
                    byCategory,
                    byPayment,
                    evolution: {
                        months: Array.from({ length: 12 }, (_, i) => i + 1),
                        series,
                    },
                    users,
                },
            }
        } catch (error) {
            console.error("[ProductService.getStats] error:", error)
            return {
                status: false,
                error: {
                    code: ProductErrorCode.PRODUCT_FETCH_FAILED,
                    message: "Não foi possível calcular as estatísticas.",
                },
            }
        }
    }
}

export default new ProductService()
