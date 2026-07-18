import { describe, expect, it, vi, beforeEach } from "vitest"
import {
    getScopeFilterDescriptor,
    productMatchesScope,
    resolveScopedUserFilter,
    type ProductScope,
} from "./productScope.js"

vi.mock("../database/supabase/supabase.js", () => ({
    supabaseAdmin: {
        from: vi.fn(),
    },
}))

import { supabaseAdmin } from "../database/supabase/supabase.js"

function mockMemberLookup(result: { data: { user_id: string } | null; error: unknown }) {
    const maybeSingle = vi.fn().mockResolvedValue(result)
    const eq2 = vi.fn().mockReturnValue({ maybeSingle })
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
    const select = vi.fn().mockReturnValue({ eq: eq1 })
    vi.mocked(supabaseAdmin.from).mockReturnValue({ select } as never)
}

describe("productMatchesScope", () => {
    const soloScope: ProductScope = { mode: "solo", userId: "user-a" }
    const groupScope: ProductScope = { mode: "group", userId: "user-a", groupId: "group-1" }

    it("permite produto pessoal do próprio usuário", () => {
        expect(productMatchesScope({ user_id: "user-a", shared_group_id: null }, soloScope)).toBe(true)
    })

    it("bloqueia produto pessoal de outro usuário", () => {
        expect(productMatchesScope({ user_id: "user-b", shared_group_id: null }, soloScope)).toBe(false)
    })

    it("bloqueia produto compartilhado no modo pessoal", () => {
        expect(productMatchesScope({ user_id: "user-a", shared_group_id: "group-1" }, soloScope)).toBe(false)
    })

    it("permite produto do grupo no modo grupo", () => {
        expect(productMatchesScope({ user_id: "user-b", shared_group_id: "group-1" }, groupScope)).toBe(true)
    })

    it("bloqueia produto de outro grupo", () => {
        expect(productMatchesScope({ user_id: "user-b", shared_group_id: "group-2" }, groupScope)).toBe(false)
    })
})

describe("getScopeFilterDescriptor", () => {
    it("retorna filtro pessoal por user_id", () => {
        expect(getScopeFilterDescriptor({ mode: "solo", userId: "user-a" })).toEqual({
            kind: "solo",
            userId: "user-a",
        })
    })

    it("retorna filtro de grupo por group_id", () => {
        expect(
            getScopeFilterDescriptor({ mode: "group", userId: "user-a", groupId: "group-1" })
        ).toEqual({
            kind: "group",
            groupId: "group-1",
        })
    })
})

describe("resolveScopedUserFilter", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("ignora filtro no modo pessoal", async () => {
        const result = await resolveScopedUserFilter({ mode: "solo", userId: "user-a" }, "user-b")
        expect(result).toBeUndefined()
        expect(supabaseAdmin.from).not.toHaveBeenCalled()
    })

    it("aceita membro válido do grupo", async () => {
        mockMemberLookup({ data: { user_id: "user-b" }, error: null })

        const result = await resolveScopedUserFilter(
            { mode: "group", userId: "user-a", groupId: "group-1" },
            "user-b"
        )

        expect(result).toBe("user-b")
        expect(supabaseAdmin.from).toHaveBeenCalledWith("group_members")
    })

    it("ignora usuário fora do grupo", async () => {
        mockMemberLookup({ data: null, error: null })

        const result = await resolveScopedUserFilter(
            { mode: "group", userId: "user-a", groupId: "group-1" },
            "outsider"
        )

        expect(result).toBeUndefined()
    })
})
