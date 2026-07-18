import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
import { GroupErrorCode } from "../types/code/groupCode"
import type { GroupInviteResponse, GroupMeResponse, GroupResponse } from "@app/shared"
import { logGroupEvent } from "../utils/structuredLog"
import { parseGroupRpcResult, resolveGroupRpcError } from "../utils/groupRpc"
import { invalidateProductScopeCache } from "../utils/productScope"

const INVITE_TTL_DAYS = 7
const INVITE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

type MemberRow = {
    user_id: string
    role: "owner" | "member"
    users?: { username?: string | null } | null
}

function generateInviteCode(): string {
    let code = ""
    for (let i = 0; i < 6; i++) {
        code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]
    }
    return code
}

class GroupService {
    private async fetchMembers(groupId: string): Promise<MemberRow[]> {
        const { data: members, error } = await supabaseAdmin
            .from("group_members")
            .select("user_id, role, users:user_id(username)")
            .eq("group_id", groupId)
            .order("joined_at", { ascending: true })

        if (error) throw error
        return (members ?? []) as MemberRow[]
    }

    private mapGroup(groupId: string, name: string, role: "owner" | "member", members: MemberRow[]): GroupResponse {
        return {
            id: groupId,
            name,
            role,
            members: members.map((m) => ({
                id: m.user_id,
                name: m.users?.username?.trim() || "Sem nome",
                role: m.role,
            })),
        }
    }

    private async getMembership(userId: string) {
        const { data, error } = await supabaseAdmin
            .from("group_members")
            .select("group_id, role, groups:group_id(id, name)")
            .eq("user_id", userId)
            .maybeSingle()

        if (error) throw error
        return data as {
            group_id: string
            role: "owner" | "member"
            groups: { id: string; name: string } | { id: string; name: string }[] | null
        } | null
    }

    async getMe(userId: string): Promise<ServiceResult<GroupMeResponse, GroupErrorCode>> {
        try {
            const membership = await this.getMembership(userId)
            if (!membership?.groups) {
                return { status: true, data: { group: null } }
            }

            const groupInfo = Array.isArray(membership.groups)
                ? membership.groups[0]
                : membership.groups
            if (!groupInfo) {
                return { status: true, data: { group: null } }
            }

            const members = await this.fetchMembers(membership.group_id)
            return {
                status: true,
                data: {
                    group: this.mapGroup(
                        groupInfo.id,
                        groupInfo.name,
                        membership.role,
                        members
                    ),
                },
            }
        } catch (error) {
            console.error("[GroupService.getMe] error:", error)
            return {
                status: false,
                error: { code: GroupErrorCode.GROUP_FETCH_FAILED, message: "Não foi possível carregar o grupo." },
            }
        }
    }

    async create(userId: string, name: string): Promise<ServiceResult<GroupResponse, GroupErrorCode>> {
        try {
            const { data, error } = await supabaseAdmin.rpc("create_group_with_owner", {
                p_user_id: userId,
                p_name: name,
            })

            if (error) {
                console.error("[GroupService.create] rpc error:", error)
                return {
                    status: false,
                    error: {
                        code: GroupErrorCode.GROUP_CREATE_FAILED,
                        message: "Não foi possível criar o grupo.",
                    },
                }
            }

            const result = parseGroupRpcResult(data)
            if (!result.ok || !result.group_id || !result.group_name) {
                const rpcError = resolveGroupRpcError(result, GroupErrorCode.GROUP_CREATE_FAILED)
                return { status: false, error: rpcError }
            }

            const members = await this.fetchMembers(result.group_id)
            invalidateProductScopeCache(userId)
            logGroupEvent("group.create", {
                userId,
                groupId: result.group_id,
                groupName: result.group_name,
                memberCount: members.length,
                productsLinked: result.products_linked ?? 0,
            })
            return {
                status: true,
                data: this.mapGroup(result.group_id, result.group_name, "owner", members),
            }
        } catch (error) {
            console.error("[GroupService.create] error:", error)
            return {
                status: false,
                error: { code: GroupErrorCode.GROUP_CREATE_FAILED, message: "Não foi possível criar o grupo." },
            }
        }
    }

    /** Apenas o dono pode renomear o grupo. */
    async update(userId: string, name: string): Promise<ServiceResult<GroupResponse, GroupErrorCode>> {
        try {
            const membership = await this.getMembership(userId)
            if (!membership?.groups) {
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_NOT_IN_GROUP, message: "Você não está em um grupo." },
                }
            }

            if (membership.role !== "owner") {
                return {
                    status: false,
                    error: {
                        code: GroupErrorCode.GROUP_FORBIDDEN,
                        message: "Apenas o dono do grupo pode editar o nome.",
                    },
                }
            }

            const groupInfo = Array.isArray(membership.groups)
                ? membership.groups[0]
                : membership.groups
            if (!groupInfo) {
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_NOT_FOUND, message: "Grupo não encontrado." },
                }
            }

            const trimmedName = name.trim()
            const { error } = await supabaseAdmin
                .from("groups")
                .update({ name: trimmedName, updated_at: new Date().toISOString() })
                .eq("id", membership.group_id)

            if (error) {
                console.error("[GroupService.update] error:", error)
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_UPDATE_FAILED, message: "Não foi possível salvar o nome." },
                }
            }

            const members = await this.fetchMembers(membership.group_id)
            return {
                status: true,
                data: this.mapGroup(groupInfo.id, trimmedName, membership.role, members),
            }
        } catch (error) {
            console.error("[GroupService.update] error:", error)
            return {
                status: false,
                error: { code: GroupErrorCode.GROUP_UPDATE_FAILED, message: "Não foi possível salvar o nome." },
            }
        }
    }

    /** Apenas o dono do grupo pode gerar convites. */
    async createInvite(userId: string): Promise<ServiceResult<GroupInviteResponse, GroupErrorCode>> {
        try {
            const membership = await this.getMembership(userId)
            if (!membership?.groups) {
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_NOT_IN_GROUP, message: "Você não está em um grupo." },
                }
            }

            if (membership.role !== "owner") {
                return {
                    status: false,
                    error: {
                        code: GroupErrorCode.GROUP_FORBIDDEN,
                        message: "Apenas o dono do grupo pode enviar convites.",
                    },
                }
            }

            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS)

            let lastError: unknown = null
            for (let attempt = 0; attempt < 5; attempt++) {
                const code = generateInviteCode()
                const { data, error } = await supabaseAdmin
                    .from("group_invites")
                    .insert({
                        group_id: membership.group_id,
                        code,
                        created_by: userId,
                        expires_at: expiresAt.toISOString(),
                    })
                    .select("code, expires_at")
                    .single()

                if (!error && data) {
                    logGroupEvent("group.invite", {
                        userId,
                        groupId: membership.group_id,
                        expiresAt: data.expires_at,
                    })
                    return {
                        status: true,
                        data: { code: data.code, expiresAt: data.expires_at },
                    }
                }
                lastError = error
                if ((error as { code?: string })?.code !== "23505") break
            }

            console.error("[GroupService.createInvite] error:", lastError)
            return {
                status: false,
                error: { code: GroupErrorCode.GROUP_INVITE_FAILED, message: "Não foi possível gerar o convite." },
            }
        } catch (error) {
            console.error("[GroupService.createInvite] error:", error)
            return {
                status: false,
                error: { code: GroupErrorCode.GROUP_INVITE_FAILED, message: "Não foi possível gerar o convite." },
            }
        }
    }

    async join(userId: string, code: string): Promise<ServiceResult<GroupResponse, GroupErrorCode>> {
        try {
            const { data, error } = await supabaseAdmin.rpc("join_group_with_products", {
                p_user_id: userId,
                p_code: code,
            })

            if (error) {
                console.error("[GroupService.join] rpc error:", error)
                return {
                    status: false,
                    error: {
                        code: GroupErrorCode.GROUP_JOIN_FAILED,
                        message: "Não foi possível entrar no grupo.",
                    },
                }
            }

            const result = parseGroupRpcResult(data)
            if (!result.ok || !result.group_id || !result.group_name) {
                const rpcError = resolveGroupRpcError(result, GroupErrorCode.GROUP_JOIN_FAILED)
                if (rpcError.code === GroupErrorCode.GROUP_ALREADY_IN_GROUP) {
                    rpcError.message = "Saia do grupo atual antes de entrar em outro."
                }
                return { status: false, error: rpcError }
            }

            const members = await this.fetchMembers(result.group_id)
            invalidateProductScopeCache(userId)
            logGroupEvent("group.join", {
                userId,
                groupId: result.group_id,
                groupName: result.group_name,
                memberCount: members.length,
                productsLinked: result.products_linked ?? 0,
            })
            return {
                status: true,
                data: this.mapGroup(result.group_id, result.group_name, "member", members),
            }
        } catch (error) {
            console.error("[GroupService.join] error:", error)
            return {
                status: false,
                error: { code: GroupErrorCode.GROUP_JOIN_FAILED, message: "Não foi possível entrar no grupo." },
            }
        }
    }

    async leave(userId: string): Promise<ServiceResult<null, GroupErrorCode>> {
        try {
            const membership = await this.getMembership(userId)
            const role = membership?.role ?? "member"

            const { data, error } = await supabaseAdmin.rpc("leave_group", {
                p_user_id: userId,
            })

            if (error) {
                console.error("[GroupService.leave] rpc error:", error)
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_LEAVE_FAILED, message: "Não foi possível sair do grupo." },
                }
            }

            const result = parseGroupRpcResult(data)
            if (!result.ok) {
                const rpcError = resolveGroupRpcError(result, GroupErrorCode.GROUP_LEAVE_FAILED)
                return { status: false, error: rpcError }
            }

            logGroupEvent("group.leave", {
                userId,
                groupId: result.group_id,
                role,
                groupDeleted: result.group_deleted ?? false,
                productsMovedToSolo: true,
                productsUnlinked: result.products_unlinked ?? 0,
            })
            invalidateProductScopeCache(userId)
            return { status: true, data: null }
        } catch (error) {
            console.error("[GroupService.leave] error:", error)
            return {
                status: false,
                error: { code: GroupErrorCode.GROUP_LEAVE_FAILED, message: "Não foi possível sair do grupo." },
            }
        }
    }
}

export default new GroupService()
