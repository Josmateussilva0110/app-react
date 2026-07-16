import { PaginationMeta, ProductResponse } from "@app/shared"

export type ProductStatusFilter = "todos" | "pendente" | "finalizado"

export type ProductRowWithUser = {
    users?: { username?: string } | null
    user_id: string
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

export function isTruthyFlag(value: unknown): boolean {
    return value === true || value === "true" || value === 1 || value === "t"
}

export function matchesStatus(finished: unknown, status: ProductStatusFilter): boolean {
    if (status === "todos") return true
    if (status === "finalizado") return isTruthyFlag(finished)
    return !isTruthyFlag(finished)
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

export function mapProductRow(row: ProductRowWithUser): ProductResponse {
    const { users, user_id, ...rest } = row
    return { ...rest, user_id, user_name: users?.username ?? "" } as ProductResponse
}
