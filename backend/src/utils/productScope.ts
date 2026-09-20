import { supabaseAdmin } from "../database/supabase/supabase"

export type ProductScope =
    | { mode: "solo"; userId: string }
    | { mode: "group"; userId: string; groupId: string; memberIds: string[] }

const SCOPE_CACHE_TTL_MS = 60_000
const SCOPE_CACHE_MAX_SIZE = 1000
const scopeCache = new Map<string, { scope: ProductScope; expiresAt: number }>()

/**
 * Resoluções em andamento, por usuário. O boot do app dispara várias requisições
 * ao mesmo tempo e todas encontram o cache vazio quando o processo acabou de
 * subir — sem isto, cada uma refaz a mesma consulta em vez de esperar a primeira.
 */
const inFlightScope = new Map<string, Promise<ProductScope>>()

export function invalidateProductScopeCache(userId: string): void {
    scopeCache.delete(userId)
    inFlightScope.delete(userId)
}

function setScopeCache(userId: string, scope: ProductScope): void {
    if (scopeCache.size >= SCOPE_CACHE_MAX_SIZE) {
        const oldestKey = scopeCache.keys().next().value
        if (oldestKey) scopeCache.delete(oldestKey)
    }

    scopeCache.set(userId, { scope, expiresAt: Date.now() + SCOPE_CACHE_TTL_MS })
}

type GroupMemberRow = { user_id: string }

/** Lista de membros do grupo — usada só quando o embed não trouxe as linhas. */
async function fetchGroupMemberIds(groupId: string): Promise<string[] | null> {
    const { data, error } = await supabaseAdmin
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId)

    if (error) {
        console.error("[resolveProductScope] members error:", error)
        return null
    }

    return (data ?? []).map((member) => member.user_id)
}

async function resolveProductScopeFromDb(userId: string): Promise<ProductScope> {
    // Uma consulta só: o embed aninhado traz o grupo do usuário e os membros dele
    // juntos. Em duas consultas dependentes isto custava um round trip a mais em
    // toda requisição que passa pelo scopeMiddleware.
    const { data, error } = await supabaseAdmin
        .from("group_members")
        .select("group_id, groups!inner(id, group_members(user_id))")
        .eq("user_id", userId)
        .maybeSingle()

    if (error) {
        console.error("[resolveProductScope] error:", error)
        return { mode: "solo", userId }
    }

    if (!data?.group_id) {
        return { mode: "solo", userId }
    }

    const group = Array.isArray(data.groups) ? data.groups[0] : data.groups
    const embedded = (group?.group_members ?? []) as GroupMemberRow[]

    // O próprio usuário é membro, então lista vazia significa embed não resolvido.
    // Cair na consulta separada evita um escopo de grupo sem membro nenhum, que
    // desligaria em silêncio o filtro por membro.
    const memberIds =
        embedded.length > 0
            ? embedded.map((member) => member.user_id)
            : await fetchGroupMemberIds(data.group_id)

    if (!memberIds) {
        return { mode: "solo", userId }
    }

    return {
        mode: "group",
        userId,
        groupId: data.group_id,
        memberIds,
    }
}

export async function resolveProductScope(userId: string): Promise<ProductScope> {
    const cached = scopeCache.get(userId)
    if (cached && cached.expiresAt > Date.now()) {
        return cached.scope
    }

    const pending = inFlightScope.get(userId)
    if (pending) return pending

    // O cache guarda a promessa, não só o valor: quem chegar durante a resolução
    // espera esta, em vez de abrir outra. O finally limpa também em erro, senão
    // uma falha transitória ficaria presa aqui para sempre.
    const promise = resolveProductScopeFromDb(userId)
        .then((scope) => {
            setScopeCache(userId, scope)
            return scope
        })
        .finally(() => {
            inFlightScope.delete(userId)
        })

    inFlightScope.set(userId, promise)
    return promise
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
