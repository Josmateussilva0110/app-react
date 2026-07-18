import { describe, expect, it, vi, beforeEach } from "vitest"

const mockFrom = vi.fn()
const mockUnlinkUserProductsFromGroup = vi.fn()

vi.mock("../database/supabase/supabase", () => ({
    supabaseAdmin: {
        from: (...args: unknown[]) => mockFrom(...args),
    },
}))

vi.mock("../utils/structuredLog", () => ({
    logGroupEvent: vi.fn(),
}))

vi.mock("../utils/groupProducts", () => ({
    unlinkUserProductsFromGroup: (...args: unknown[]) => mockUnlinkUserProductsFromGroup(...args),
}))

import GroupService from "./GroupService"

type QueryResult = { data: unknown; error: unknown }

function createThenableChain(resolver: () => QueryResult) {
    const chain: Record<string, unknown> = {}
    const result = () => Promise.resolve(resolver())

    for (const method of ["select", "insert", "update", "delete", "eq", "order", "in"]) {
        chain[method] = vi.fn().mockReturnValue(chain)
    }

    chain.single = vi.fn().mockImplementation(result)
    chain.maybeSingle = vi.fn().mockImplementation(result)
    chain.then = (
        onFulfilled: (value: QueryResult) => unknown,
        onRejected?: (reason: unknown) => unknown
    ) => result().then(onFulfilled, onRejected)

    return chain
}

describe("GroupService.createInvite", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("retorna 403 para membro que não é dono", async () => {
        mockFrom.mockImplementation((table: string) => {
            if (table === "group_members") {
                return createThenableChain(() => ({
                    data: {
                        group_id: "group-1",
                        role: "member",
                        groups: { id: "group-1", name: "Família" },
                    },
                    error: null,
                }))
            }
            return createThenableChain(() => ({ data: null, error: null }))
        })

        const result = await GroupService.createInvite("user-member")

        expect(result.status).toBe(false)
        if (!result.status) {
            expect(result.error.code).toBe("GROUP_FORBIDDEN")
        }
    })
})

describe("GroupService.leave", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUnlinkUserProductsFromGroup.mockResolvedValue(undefined)
    })

    it("remove vínculos group_products do usuário ao sair", async () => {
        const memberDelete = vi.fn()

        let groupMembersCalls = 0
        mockFrom.mockImplementation((table: string) => {
            if (table === "group_members") {
                const chain = createThenableChain(() => {
                    groupMembersCalls += 1
                    if (groupMembersCalls === 1) {
                        return {
                            data: {
                                group_id: "group-1",
                                role: "member",
                                groups: { id: "group-1", name: "Família" },
                            },
                            error: null,
                        }
                    }
                    return {
                        data: [
                            { user_id: "user-a", role: "owner" },
                            { user_id: "user-b", role: "member" },
                        ],
                        error: null,
                    }
                })
                chain.update = vi.fn().mockReturnValue(chain)
                chain.delete = memberDelete.mockReturnValue(
                    createThenableChain(() => ({ data: null, error: null }))
                )
                return chain
            }

            if (table === "users") {
                return createThenableChain(() => ({
                    data: [
                        { id: "user-a", username: "A" },
                        { id: "user-b", username: "B" },
                    ],
                    error: null,
                }))
            }

            return createThenableChain(() => ({ data: null, error: null }))
        })

        const result = await GroupService.leave("user-b")

        expect(result.status).toBe(true)
        expect(mockUnlinkUserProductsFromGroup).toHaveBeenCalledWith("user-b", "group-1")
        expect(memberDelete).toHaveBeenCalled()
    })
})
