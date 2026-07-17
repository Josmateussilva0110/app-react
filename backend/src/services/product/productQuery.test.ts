import { describe, expect, it, vi } from "vitest"
import { buildProductListQuery } from "./productQuery.js"
import type { ProductScope } from "../../utils/productScope.js"

type CapturedCall = { method: string; column: string; value: unknown }

function createCaptureQuery() {
    const calls: CapturedCall[] = []
    const chain = {
        select() {
            return chain
        },
        order() {
            return chain
        },
        eq(column: string, value: unknown) {
            calls.push({ method: "eq", column, value })
            return chain
        },
        is(column: string, value: null) {
            calls.push({ method: "is", column, value })
            return chain
        },
        gte(column: string, value: unknown) {
            calls.push({ method: "gte", column, value })
            return chain
        },
        lt(column: string, value: unknown) {
            calls.push({ method: "lt", column, value })
            return chain
        },
        range: vi.fn(),
    }
    return { chain, calls }
}

vi.mock("../../database/supabase/supabase.js", () => ({
    supabaseAdmin: {
        from: vi.fn(),
    },
}))

import { supabaseAdmin } from "../../database/supabase/supabase.js"

describe("buildProductListQuery", () => {
    it("aplica filtro solo: user_id do viewer e group_id nulo", () => {
        const { chain, calls } = createCaptureQuery()
        vi.mocked(supabaseAdmin.from).mockReturnValue(chain as never)

        const scope: ProductScope = { mode: "solo", userId: "user-a" }
        buildProductListQuery({ page: 1, limit: 20, status: "todos" }, scope)

        expect(calls).toContainEqual({ method: "eq", column: "user_id", value: "user-a" })
        expect(calls).toContainEqual({ method: "is", column: "group_id", value: null })
    })

    it("aplica filtro de grupo por group_id", () => {
        const { chain, calls } = createCaptureQuery()
        vi.mocked(supabaseAdmin.from).mockReturnValue(chain as never)

        const scope: ProductScope = { mode: "group", userId: "user-a", groupId: "group-1" }
        buildProductListQuery({ page: 1, limit: 20, status: "todos" }, scope)

        expect(calls).toContainEqual({ method: "eq", column: "group_id", value: "group-1" })
        expect(calls.some((c) => c.column === "user_id" && c.method === "eq")).toBe(false)
    })

    it("aplica filtro opcional de membro em grupo", () => {
        const { chain, calls } = createCaptureQuery()
        vi.mocked(supabaseAdmin.from).mockReturnValue(chain as never)

        const scope: ProductScope = { mode: "group", userId: "user-a", groupId: "group-1" }
        buildProductListQuery({ page: 1, limit: 20, status: "todos", userId: "user-b" }, scope)

        expect(calls).toContainEqual({ method: "eq", column: "group_id", value: "group-1" })
        expect(calls).toContainEqual({ method: "eq", column: "user_id", value: "user-b" })
    })
})
