import { supabaseAdmin } from "../database/supabase/supabase"

export type ProductScope =
    | { mode: "solo"; userId: string }
    | { mode: "group"; userId: string; groupId: string }

export async function resolveProductScope(userId: string): Promise<ProductScope> {
    const { data, error } = await supabaseAdmin
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId)
        .maybeSingle()

    if (error) {
        console.error("[resolveProductScope] error:", error)
        return { mode: "solo", userId }
    }

    if (data?.group_id) {
        return { mode: "group", userId, groupId: data.group_id }
    }

    return { mode: "solo", userId }
}

export function productMatchesScope(
    row: { user_id: string; group_id?: string | null },
    scope: ProductScope
): boolean {
    if (scope.mode === "solo") {
        return row.user_id === scope.userId && (row.group_id == null || row.group_id === "")
    }
    return row.group_id === scope.groupId
}

export type ScopeFilterDescriptor =
    | { kind: "solo"; userId: string }
    | { kind: "group"; groupId: string }

export function getScopeFilterDescriptor(scope: ProductScope): ScopeFilterDescriptor {
    if (scope.mode === "solo") return { kind: "solo", userId: scope.userId }
    return { kind: "group", groupId: scope.groupId }
}

/** Filtro de membro só vale em modo grupo e para usuários do grupo. */
export async function resolveScopedUserFilter(
    scope: ProductScope,
    filterUserId?: string
): Promise<string | undefined> {
    if (!filterUserId || scope.mode === "solo") return undefined

    const { data, error } = await supabaseAdmin
        .from("group_members")
        .select("user_id")
        .eq("group_id", scope.groupId)
        .eq("user_id", filterUserId)
        .maybeSingle()

    if (error) {
        console.error("[resolveScopedUserFilter] error:", error)
        return undefined
    }

    return data ? filterUserId : undefined
}
