import { ProductListQuery } from "@app/shared"
import { supabaseAdmin } from "../../database/supabase/supabase"
import { PRODUCT_SELECT_FIELDS } from "../../constants/product-select-fields"
import { getDateRange } from "../../utils/productUtils"

// Supabase filter builders widen/narrow types per chained call; keep loose for composable filters.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProductListDbQuery = any

function applyStatusFilter(
    dbQuery: ProductListDbQuery,
    status: ProductListQuery["status"]
): ProductListDbQuery {
    if (status === "finalizado") return dbQuery.eq("finished", true)
    if (status === "pendente") return dbQuery.eq("finished", false)
    return dbQuery
}

function applyMonthListFilter(
    dbQuery: ProductListDbQuery,
    monthList: ProductListQuery["monthList"]
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

export function buildProductListQuery(query: ProductListQuery): ProductListDbQuery {
    const { category, userId, status = "todos", monthList, year, month } = query

    let dbQuery = supabaseAdmin
        .from("products")
        .select(`${PRODUCT_SELECT_FIELDS}, users:user_id(username)`, { count: "exact" })
        .order("date", { ascending: false })

    if (category) dbQuery = dbQuery.eq("category", category)
    if (userId) dbQuery = dbQuery.eq("user_id", userId)

    dbQuery = applyStatusFilter(dbQuery, status)
    dbQuery = applyMonthListFilter(dbQuery, monthList)
    dbQuery = applyDateRangeFilter(dbQuery, year, month)

    return dbQuery
}
