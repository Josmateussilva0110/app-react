import { PaginationMeta, ProductResponse } from "@app/shared"

export type ProductRowWithUser = {
    id: string
    name: string
    user_id: string
    price: number
    priority: ProductResponse["priority"]
    payment_type: ProductResponse["payment_type"]
    category: ProductResponse["category"]
    date: string
    finished: boolean
    month_list: boolean | string
    users?: { username?: string } | null
    [key: string]: unknown
}

/** Extrai ano e mês (1-12) de uma data ISO (YYYY-MM-DD) ou DD/MM/YYYY. */
export function parseYearMonth(date: string): { year: number; month: number } | null {
    if (!date) return null
    const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return { year: Number(iso[1]), month: Number(iso[2]) }
    const br = date.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    if (br) return { year: Number(br[3]), month: Number(br[2]) }
    const d = new Date(date)
    if (!isNaN(d.getTime())) return { year: d.getFullYear(), month: d.getMonth() + 1 }
    return null
}

function monthBounds(year: number, month: number): { start: string; end: string } {
    const start = `${year}-${String(month).padStart(2, "0")}-01`
    const endMonth = month === 12 ? 1 : month + 1
    const endYear = month === 12 ? year + 1 : year
    const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`
    return { start, end }
}

export function getDateRange(
    year?: number,
    month?: number
): { start: string; end: string } | null {
    if (year !== undefined && month !== undefined) {
        return monthBounds(year, month)
    }
    if (year !== undefined) {
        return { start: `${year}-01-01`, end: `${year + 1}-01-01` }
    }
    if (month !== undefined) {
        const currentYear = new Date().getFullYear()
        return monthBounds(currentYear, month)
    }
    return null
}

export function getPaginationRange(page: number, limit: number): { from: number; to: number } {
    const from = (page - 1) * limit
    return { from, to: from + limit - 1 }
}

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
    return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    }
}

/**
 * Campo a campo, não `...rest`: o spread entregava ao cliente toda coluna que
 * aparecesse no select — `group_products` entre elas — sem ninguém decidir
 * isso, e a API não valida a própria resposta contra productResponseSchema.
 */
export function mapProductRow(row: ProductRowWithUser): ProductResponse {
    return {
        id: row.id,
        name: row.name,
        user_id: row.user_id,
        price: row.price,
        priority: row.priority,
        payment_type: row.payment_type,
        category: row.category,
        date: row.date,
        finished: row.finished,
        month_list: row.month_list,
        user_name: row.users?.username ?? "",
    }
}
