import { supabaseAdmin } from "../database/supabase/supabase"

export type ProductScope =
    | { mode: "solo"; userId: string }
    | { mode: "group"; userId: string; groupId: string; memberIds: string[] }

const SCOPE_CACHE_TTL_MS = 60_000
const SCOPE_CACHE_MAX_SIZE = 1000
const scopeCache = new Map<string, { scope: ProductScope; expiresAt: number }>()

export function invalidateProductScopeCache(userId: string): void {
    scopeCache.delete(userId)
}

function setScopeCache(userId: string, scope: ProductScope): void {
    if (scopeCache.size >= SCOPE_CACHE_MAX_SIZE) {
        const oldestKey = scopeCache.keys().next().value
        if (oldestKey) scopeCache.delete(oldestKey)
    }

    scopeCache.set(userId, { scope, expiresAt: Date.now() + SCOPE_CACHE_TTL_MS })
}

async function resolveProductScopeFromDb(userId: string): Promise<ProductScope> {
    const { data, error } = await supabaseAdmin
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId)
        .maybeSingle()

    if (error) {
        console.error("[resolveProductScope] error:", error)
        return { mode: "solo", userId }
    }

    if (!data?.group_id) {
        return { mode: "solo", userId }
    }

    const { data: members, error: membersError } = await supabaseAdmin
        .from("group_members")
        .select("user_id")
        .eq("group_id", data.group_id)

    if (membersError) {
        console.error("[resolveProductScope] members error:", membersError)
        return { mode: "solo", userId }
    }

    return {
        mode: "group",
        userId,
        groupId: data.group_id,
        memberIds: (members ?? []).map((member) => member.user_id),
    }
}

export async function resolveProductScope(userId: string): Promise<ProductScope> {
    const cached = scopeCache.get(userId)
    if (cached && cached.expiresAt > Date.now()) {
        return cached.scope
    }

    const scope = await resolveProductScopeFromDb(userId)
    setScopeCache(userId, scope)
    return scope
}

type GroupProductLink = { group_id: string }

function extractGroupIds(links: GroupProductLink[] | GroupProductLink | null): string[] {
    if (!links) return []
    if (Array.isArray(links)) return links.map((link) => link.group_id)
    return [links.group_id]
}

/** Valida que o produto pertence ao escopo atual e ao usuário autenticado (somente dono pode mutar). */
export async function assertProductMutableInScope(
    productId: string,
    userId: string,
    scope: ProductScope
): Promise<boolean> {
    const { data: product, error } = await supabaseAdmin
        .from("products")
        .select("id, user_id, group_products(group_id)")
        .eq("id", productId)
        .eq("user_id", userId)
        .maybeSingle()

    if (error || !product) return false

    const groupIds = extractGroupIds(
        product.group_products as GroupProductLink[] | GroupProductLink | null
    )

    if (scope.mode === "solo") {
        return groupIds.length === 0
    }

    return groupIds.includes(scope.groupId)
}

export function productMatchesScope(
    row: { user_id: string; shared_group_id?: string | null },
    scope: ProductScope
): boolean {
    if (scope.mode === "solo") {
        return row.user_id === scope.userId && (row.shared_group_id == null || row.shared_group_id === "")
    }
    return row.shared_group_id === scope.groupId
}

export type ScopeFilterDescriptor =
    | { kind: "solo"; userId: string }
    | { kind: "group"; groupId: string }

export function getScopeFilterDescriptor(scope: ProductScope): ScopeFilterDescriptor {
    if (scope.mode === "solo") return { kind: "solo", userId: scope.userId }
    return { kind: "group", groupId: scope.groupId }
}

/** Filtro de membro só vale em modo grupo e para usuários do grupo. */
export function resolveScopedUserFilter(
    scope: ProductScope,
    filterUserId?: string
): string | undefined {
    if (!filterUserId || scope.mode === "solo") return undefined
    return scope.memberIds.includes(filterUserId) ? filterUserId : undefined
}
