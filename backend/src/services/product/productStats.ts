import { DashboardStats, StatsQuery } from "@app/shared"
import { supabaseAdmin } from "../../database/supabase/supabase"
import {
    isTruthyFlag,
    matchesStatus,
    parseYearMonth,
} from "../../utils/productUtils"
import type { ProductScope } from "../../utils/productScope"
import { productMatchesScope } from "../../utils/productScope"
import { getUserSharedProductIds } from "../../utils/groupProducts"

/** PostgREST exige UUIDs entre aspas duplas dentro de listas `in`. */
function formatUuidInList(ids: string[]): string {
    return `(${ids.map((id) => `"${id}"`).join(",")})`
}

export type ProductStatsRow = {
    user_id: string
    shared_group_id?: string | null
    price: unknown
    category?: string
    payment_type?: string
    date: string
    finished: unknown
    month_list: unknown
    users?: { username?: string } | null
}

type StatsAccumulator = {
    total: number
    monthListTotal: number
    itemsCount: number
    pendingCount: number
    categoryMap: Map<string, { total: number; count: number }>
    paymentMap: Map<string, number>
    evoByUser: Map<string, number[]>
}

function createEmptyAccumulator(): StatsAccumulator {
    return {
        total: 0,
        monthListTotal: 0,
        itemsCount: 0,
        pendingCount: 0,
        categoryMap: new Map(),
        paymentMap: new Map(),
        evoByUser: new Map(),
    }
}

type ProductStatsDbRow = {
    user_id: string
    price: unknown
    category?: string
    payment_type?: string
    date: string
    finished: unknown
    month_list: unknown
    users?: { username?: string } | null
    group_products?: { group_id: string }[] | { group_id: string } | null
}

function mapStatsRow(row: ProductStatsDbRow): ProductStatsRow {
    const groupProducts = row.group_products
    const sharedGroupId = Array.isArray(groupProducts)
        ? groupProducts[0]?.group_id ?? null
        : groupProducts?.group_id ?? null

    return {
        user_id: row.user_id,
        shared_group_id: sharedGroupId,
        price: row.price,
        category: row.category,
        payment_type: row.payment_type,
        date: row.date,
        finished: row.finished,
        month_list: row.month_list,
        users: row.users,
    }
}

export function normalizeDashboardStats(data: unknown): DashboardStats {
    const raw = data as DashboardStats
    return {
        total: Number(raw.total) || 0,
        monthListTotal: Number(raw.monthListTotal) || 0,
        itemsCount: Number(raw.itemsCount) || 0,
        pendingCount: Number(raw.pendingCount) || 0,
        byCategory: Array.isArray(raw.byCategory) ? raw.byCategory : [],
        byPayment: Array.isArray(raw.byPayment) ? raw.byPayment : [],
        evolution: {
            months: raw.evolution?.months ?? Array.from({ length: 12 }, (_, i) => i + 1),
            series: Array.isArray(raw.evolution?.series)
                ? raw.evolution.series.map((s) => ({
                      userId: String(s.userId),
                      userName: s.userName ?? "",
                      data: Array.isArray(s.data)
                          ? s.data.map((n) => Number(n) || 0)
                          : new Array(12).fill(0),
                  }))
                : [],
        },
        users: Array.isArray(raw.users)
            ? raw.users.map((u) => ({
                  id: String(u.id),
                  name: u.name ?? "",
              }))
            : [],
    }
}

export async function fetchProductsForYearStats(year: number, scope: ProductScope) {
    const yearStart = `${year}-01-01`
    const yearEnd = `${year + 1}-01-01`

    if (scope.mode === "group") {
        return supabaseAdmin
            .from("products")
            .select(
                "user_id, price, category, payment_type, date, finished, month_list, users:user_id(username), group_products!inner(group_id)"
            )
            .eq("group_products.group_id", scope.groupId)
            .gte("date", yearStart)
            .lt("date", yearEnd)
            .limit(10000)
    }

    const sharedIds = await getUserSharedProductIds(scope.userId)
    let query = supabaseAdmin
        .from("products")
        .select(
            "user_id, price, category, payment_type, date, finished, month_list, users:user_id(username), group_products(group_id)"
        )
        .eq("user_id", scope.userId)
        .gte("date", yearStart)
        .lt("date", yearEnd)
        .limit(10000)

    if (sharedIds.length > 0) {
        query = query.not("id", "in", formatUuidInList(sharedIds))
    }

    return query
}

function buildUsersMap(rows: ProductStatsRow[]): Map<string, string> {
    const usersMap = new Map<string, string>()
    for (const row of rows) {
        if (row.user_id) usersMap.set(row.user_id, row.users?.username ?? "")
    }
    return usersMap
}

function matchesMonthList(
    row: ProductStatsRow,
    monthList: StatsQuery["monthList"]
): boolean {
    if (!monthList) return true
    const flag = isTruthyFlag(row.month_list)
    return monthList === "true" ? flag : !flag
}

function accumulateEvolution(
    acc: StatsAccumulator,
    row: ProductStatsRow,
    year: number,
    status: StatsQuery["status"],
    monthList: StatsQuery["monthList"]
): void {
    const ym = parseYearMonth(row.date)
    if (
        !ym ||
        ym.year !== year ||
        !matchesStatus(row.finished, status ?? "todos") ||
        !matchesMonthList(row, monthList)
    ) {
        return
    }

    const price = Number(row.price) || 0
    if (!acc.evoByUser.has(row.user_id)) {
        acc.evoByUser.set(row.user_id, new Array(12).fill(0))
    }
    acc.evoByUser.get(row.user_id)![ym.month - 1] += price
}

function accumulateMonthStats(acc: StatsAccumulator, row: ProductStatsRow): void {
    const price = Number(row.price) || 0

    acc.total += price
    acc.itemsCount += 1
    if (isTruthyFlag(row.month_list)) acc.monthListTotal += price
    if (!isTruthyFlag(row.finished)) acc.pendingCount += 1

    const cat = row.category ?? "outros"
    const prevCat = acc.categoryMap.get(cat) ?? { total: 0, count: 0 }
    acc.categoryMap.set(cat, { total: prevCat.total + price, count: prevCat.count + 1 })

    const pay = row.payment_type ?? "outros"
    acc.paymentMap.set(pay, (acc.paymentMap.get(pay) ?? 0) + price)
}

function toDashboardStats(acc: StatsAccumulator, usersMap: Map<string, string>): DashboardStats {
    const byCategory = Array.from(acc.categoryMap.entries())
        .map(([category, v]) => ({ category, total: v.total, count: v.count }))
        .sort((a, b) => b.total - a.total)

    const byPayment = Array.from(acc.paymentMap.entries())
        .map(([paymentType, total]) => ({ paymentType, total }))
        .sort((a, b) => b.total - a.total)

    const series = Array.from(acc.evoByUser.entries())
        .map(([userId, data]) => ({
            userId,
            userName: usersMap.get(userId) ?? "",
            data,
        }))
        .sort((a, b) => a.userName.localeCompare(b.userName))

    const users = Array.from(usersMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name))

    return {
        total: acc.total,
        monthListTotal: acc.monthListTotal,
        itemsCount: acc.itemsCount,
        pendingCount: acc.pendingCount,
        byCategory,
        byPayment,
        evolution: {
            months: Array.from({ length: 12 }, (_, i) => i + 1),
            series,
        },
        users,
    }
}

export function aggregateDashboardStats(
    rows: ProductStatsRow[],
    query: StatsQuery,
    scope: ProductScope
): DashboardStats {
    const { month, year, userId, status = "todos", monthList } = query
    const acc = createEmptyAccumulator()
    const scopedRows = rows.filter((row) => productMatchesScope(row, scope))
    const usersMap = buildUsersMap(scopedRows)

    for (const row of scopedRows) {
        const ym = parseYearMonth(row.date)
        if (!ym) continue

        accumulateEvolution(acc, row, year, status, monthList)

        const matchesUser = !userId || row.user_id === userId
        const matchesFinished = matchesStatus(row.finished, status)
        if (
            ym.year !== year ||
            ym.month !== month ||
            !matchesUser ||
            !matchesFinished ||
            !matchesMonthList(row, monthList)
        ) {
            continue
        }

        accumulateMonthStats(acc, row)
    }

    return toDashboardStats(acc, usersMap)
}

export { mapStatsRow }
