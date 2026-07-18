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
