import { ProductListQuery } from "@app/shared"
import { supabaseAdmin } from "../../database/supabase/supabase"
import { PRODUCT_SELECT_FIELDS } from "../../constants/product-select-fields"
import { getDateRange } from "../../utils/productUtils"
import type { ProductScope } from "../../utils/productScope"

type StatusFilter = "todos" | "pendente" | "finalizado"
type MonthListFilter = "true" | "false" | undefined

function applyStatusFilter<T extends { eq: (column: string, value: unknown) => T }>(
    dbQuery: T,
    status: StatusFilter
): T {
    if (status === "finalizado") return dbQuery.eq("finished", true)
    if (status === "pendente") return dbQuery.eq("finished", false)
    return dbQuery
}

function applyMonthListFilter<T extends { eq: (column: string, value: unknown) => T }>(
    dbQuery: T,
    monthList: MonthListFilter
): T {
    if (monthList === "true") return dbQuery.eq("month_list", true)
    if (monthList === "false") return dbQuery.eq("month_list", false)
    return dbQuery
}

function applyDateRangeFilter<
    T extends {
        gte: (column: string, value: unknown) => T
        lt: (column: string, value: unknown) => T
    },
>(dbQuery: T, year?: number, month?: number): T {
    const range = getDateRange(year, month)
    if (!range) return dbQuery
    return dbQuery.gte("date", range.start).lt("date", range.end)
}

export function buildProductListQuery(
    query: ProductListQuery,
    scope: ProductScope,
    from: number,
    to: number
) {
    const { category, userId, status = "todos", monthList, year, month } = query

    let dbQuery

    if (scope.mode === "group") {
        dbQuery = supabaseAdmin
            .from("products")
            .select(`${PRODUCT_SELECT_FIELDS}, users:user_id(username), group_products!inner(group_id)`, {
                count: "exact",
            })
            .eq("group_products.group_id", scope.groupId)
    } else {
        dbQuery = supabaseAdmin
            .from("products")
            .select(`${PRODUCT_SELECT_FIELDS}, users:user_id(username), group_products(group_id)`, {
                count: "exact",
            })
            .eq("user_id", scope.userId)
            .is("group_products.group_id", null)
    }

    if (category) dbQuery = dbQuery.eq("category", category)
    if (userId) dbQuery = dbQuery.eq("user_id", userId)

    dbQuery = applyStatusFilter(dbQuery, status)
    dbQuery = applyMonthListFilter(dbQuery, monthList)
    dbQuery = applyDateRangeFilter(dbQuery, year, month)

    return dbQuery.order("date", { ascending: false }).range(from, to)
}
