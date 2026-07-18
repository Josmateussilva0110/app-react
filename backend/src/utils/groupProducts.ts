import { supabaseAdmin } from "../database/supabase/supabase"

export async function linkProductToGroup(productId: string, groupId: string): Promise<void> {
    const { error } = await supabaseAdmin
        .from("group_products")
        .insert({ product_id: productId, group_id: groupId })

    if (error) {
        console.error("[linkProductToGroup] error:", error)
        throw error
    }
}

/** IDs de produtos do usuário que estão compartilhados em algum grupo. */
export async function getUserSharedProductIds(userId: string): Promise<string[]> {
    const { data: products, error: productsError } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("user_id", userId)

    if (productsError) {
        console.error("[getUserSharedProductIds] products error:", productsError)
        throw productsError
    }

    const productIds = (products ?? []).map((row) => row.id)
    if (!productIds.length) return []

    const { data: links, error: linksError } = await supabaseAdmin
        .from("group_products")
        .select("product_id")
        .in("product_id", productIds)

    if (linksError) {
        console.error("[getUserSharedProductIds] links error:", linksError)
        throw linksError
    }

    return (links ?? []).map((row) => row.product_id)
}
