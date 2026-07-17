import { ProductListQuery } from "@app/shared"
import { supabaseAdmin } from "../../database/supabase/supabase"
import { PRODUCT_SELECT_FIELDS } from "../../constants/product-select-fields"
import { getDateRange } from "../../utils/productUtils"
import { getScopeFilterDescriptor, type ProductScope } from "../../utils/productScope"

type StatusFilter = "todos" | "pendente" | "finalizado"
type MonthListFilter = "true" | "false" | undefined

type ProductListRangeResult = {
    data: unknown[] | null
    error: { message: string } | null
    count: number | null
}

type ProductListDbQuery = {
    eq: (column: string, value: unknown) => ProductListDbQuery
    is: (column: string, value: null) => ProductListDbQuery
    gte: (column: string, value: unknown) => ProductListDbQuery
    lt: (column: string, value: unknown) => ProductListDbQuery
    range: (from: number, to: number) => Promise<ProductListRangeResult>
}

function applyScopeFilter(dbQuery: ProductListDbQuery, scope: ProductScope): ProductListDbQuery {
    const descriptor = getScopeFilterDescriptor(scope)
    if (descriptor.kind === "solo") {
        return dbQuery.eq("user_id", descriptor.userId).is("group_id", null)
    }
    return dbQuery.eq("group_id", descriptor.groupId)
}

function applyStatusFilter(dbQuery: ProductListDbQuery, status: StatusFilter): ProductListDbQuery {
    if (status === "finalizado") return dbQuery.eq("finished", true)
    if (status === "pendente") return dbQuery.eq("finished", false)
    return dbQuery
}

function applyMonthListFilter(
    dbQuery: ProductListDbQuery,
    monthList: MonthListFilter
): ProductListDbQuery {
    if (monthList === "true") return dbQuery.eq("month_list", true)
    if (monthList === "false") return dbQuery.eq("month_list", false)
    return dbQuery
}

function applyDateRangeFilter(
    dbQuery: ProductListDbQuery,
    year?: number,
    month?: number
): ProductListDbQuery {
    const range = getDateRange(year, month)
    if (!range) return dbQuery
    return dbQuery.gte("date", range.start).lt("date", range.end)
}

export function buildProductListQuery(
    query: ProductListQuery,
    scope: ProductScope
): ProductListDbQuery {
    const { category, userId, status = "todos", monthList, year, month } = query

    let dbQuery = supabaseAdmin
        .from("products")
        .select(`${PRODUCT_SELECT_FIELDS}, users:user_id(username)`, { count: "exact" })
        .order("date", { ascending: false }) as unknown as ProductListDbQuery

    dbQuery = applyScopeFilter(dbQuery, scope)
    if (category) dbQuery = dbQuery.eq("category", category)
    if (userId) dbQuery = dbQuery.eq("user_id", userId)

    dbQuery = applyStatusFilter(dbQuery, status)
    dbQuery = applyMonthListFilter(dbQuery, monthList)
    dbQuery = applyDateRangeFilter(dbQuery, year, month)

    return dbQuery
}
