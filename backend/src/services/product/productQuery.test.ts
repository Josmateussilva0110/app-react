import { describe, expect, it, vi, beforeEach } from "vitest"
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
        not(column: string, operator: string, value: unknown) {
            calls.push({ method: "not", column, value: `${operator}:${value}` })
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

vi.mock("../../utils/groupProducts.js", () => ({
    getUserSharedProductIds: vi.fn(),
}))

import { supabaseAdmin } from "../../database/supabase/supabase.js"
import { getUserSharedProductIds } from "../../utils/groupProducts.js"

describe("buildProductListQuery", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(getUserSharedProductIds).mockResolvedValue([])
    })

    it("aplica filtro pessoal: produtos do usuário sem vínculo no grupo", async () => {
        const { chain, calls } = createCaptureQuery()
        vi.mocked(supabaseAdmin.from).mockReturnValue(chain as never)

        const scope: ProductScope = { mode: "solo", userId: "user-a" }
        await buildProductListQuery({ page: 1, limit: 20, status: "todos" }, scope)

        expect(calls).toContainEqual({ method: "eq", column: "user_id", value: "user-a" })
        expect(calls.some((c) => c.column === "group_products.group_id")).toBe(false)
    })

    it("exclui produtos compartilhados no modo pessoal", async () => {
        vi.mocked(getUserSharedProductIds).mockResolvedValue(["prod-1", "prod-2"])
        const { chain, calls } = createCaptureQuery()
        vi.mocked(supabaseAdmin.from).mockReturnValue(chain as never)

        const scope: ProductScope = { mode: "solo", userId: "user-a" }
        await buildProductListQuery({ page: 1, limit: 20, status: "todos" }, scope)

        expect(calls).toContainEqual({
            method: "not",
            column: "id",
            value: "in:(prod-1,prod-2)",
        })
    })

    it("aplica filtro de grupo via group_products", async () => {
        const { chain, calls } = createCaptureQuery()
        vi.mocked(supabaseAdmin.from).mockReturnValue(chain as never)

        const scope: ProductScope = { mode: "group", userId: "user-a", groupId: "group-1" }
        await buildProductListQuery({ page: 1, limit: 20, status: "todos" }, scope)

        expect(calls).toContainEqual({ method: "eq", column: "group_products.group_id", value: "group-1" })
    })

    it("aplica filtro opcional de membro em grupo", async () => {
        const { chain, calls } = createCaptureQuery()
        vi.mocked(supabaseAdmin.from).mockReturnValue(chain as never)

        const scope: ProductScope = { mode: "group", userId: "user-a", groupId: "group-1" }
        await buildProductListQuery({ page: 1, limit: 20, status: "todos", userId: "user-b" }, scope)

        expect(calls).toContainEqual({ method: "eq", column: "group_products.group_id", value: "group-1" })
        expect(calls).toContainEqual({ method: "eq", column: "user_id", value: "user-b" })
    })
})
