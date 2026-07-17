import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabaseAdmin } from "../database/supabase/supabase"
import { GroupErrorCode } from "../types/code/groupCode"
import type { GroupInviteResponse, GroupMeResponse, GroupResponse } from "@app/shared"
import { logGroupEvent } from "../utils/structuredLog"

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
        const { data, error } = await supabaseAdmin
            .from("group_members")
            .select("user_id, role, users:user_id(username)")
            .eq("group_id", groupId)
            .order("joined_at", { ascending: true })

        if (error) throw error
        return (data ?? []) as MemberRow[]
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
            const existing = await this.getMembership(userId)
            if (existing) {
                return {
                    status: false,
                    error: {
                        code: GroupErrorCode.GROUP_ALREADY_IN_GROUP,
                        message: "Você já participa de um grupo. Saia antes de criar outro.",
                    },
                }
            }

            const { data: group, error: groupError } = await supabaseAdmin
                .from("groups")
                .insert({ name: name.trim(), created_by: userId })
                .select("id, name")
                .single()

            if (groupError || !group) {
                console.error("[GroupService.create] group error:", groupError)
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_CREATE_FAILED, message: "Não foi possível criar o grupo." },
                }
            }

            const { error: memberError } = await supabaseAdmin.from("group_members").insert({
                group_id: group.id,
                user_id: userId,
                role: "owner",
            })

            if (memberError) {
                console.error("[GroupService.create] member error:", memberError)
                await supabaseAdmin.from("groups").delete().eq("id", group.id)
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_CREATE_FAILED, message: "Não foi possível criar o grupo." },
                }
            }

            await supabaseAdmin.from("goals").insert({
                scope: "group",
                group_id: group.id,
                user_id: null,
                monthly_goal: 0,
                updated_by: userId,
            })

            const members = await this.fetchMembers(group.id)
            logGroupEvent("group.create", {
                userId,
                groupId: group.id,
                groupName: group.name,
                memberCount: members.length,
            })
            return {
                status: true,
                data: this.mapGroup(group.id, group.name, "owner", members),
            }
        } catch (error) {
            console.error("[GroupService.create] error:", error)
            return {
                status: false,
                error: { code: GroupErrorCode.GROUP_CREATE_FAILED, message: "Não foi possível criar o grupo." },
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
            const existing = await this.getMembership(userId)
            if (existing) {
                return {
                    status: false,
                    error: {
                        code: GroupErrorCode.GROUP_ALREADY_IN_GROUP,
                        message: "Saia do grupo atual antes de entrar em outro.",
                    },
                }
            }

            const { data: invite, error: inviteError } = await supabaseAdmin
                .from("group_invites")
                .select("id, group_id, status, expires_at, groups:group_id(id, name)")
                .eq("code", code.toUpperCase())
                .maybeSingle()

            if (inviteError || !invite) {
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_INVITE_INVALID, message: "Código de convite inválido." },
                }
            }

            if (invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_INVITE_INVALID, message: "Convite expirado ou inválido." },
                }
            }

            const groupRaw = invite.groups as { id: string; name: string } | { id: string; name: string }[] | null
            const groupData = Array.isArray(groupRaw) ? groupRaw[0] : groupRaw
            if (!groupData) {
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_NOT_FOUND, message: "Grupo não encontrado." },
                }
            }

            const { error: memberError } = await supabaseAdmin.from("group_members").insert({
                group_id: invite.group_id,
                user_id: userId,
                role: "member",
            })

            if (memberError) {
                console.error("[GroupService.join] member error:", memberError)
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_JOIN_FAILED, message: "Não foi possível entrar no grupo." },
                }
            }

            await supabaseAdmin
                .from("group_invites")
                .update({ status: "accepted" })
                .eq("id", invite.id)

            const members = await this.fetchMembers(invite.group_id)
            logGroupEvent("group.join", {
                userId,
                groupId: invite.group_id,
                groupName: groupData.name,
                memberCount: members.length,
            })
            return {
                status: true,
                data: this.mapGroup(groupData.id, groupData.name, "member", members),
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
            if (!membership?.groups) {
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_NOT_IN_GROUP, message: "Você não está em um grupo." },
                }
            }

            const groupId = membership.group_id
            const members = await this.fetchMembers(groupId)

            // Produtos do usuário voltam ao modo pessoal (mantém user_id, remove group_id).
            const { error: productsError } = await supabaseAdmin
                .from("products")
                .update({ group_id: null })
                .eq("group_id", groupId)
                .eq("user_id", userId)

            if (productsError) {
                console.error("[GroupService.leave] products error:", productsError)
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_LEAVE_FAILED, message: "Não foi possível sair do grupo." },
                }
            }

            if (members.length === 1) {
                await supabaseAdmin.from("goals").delete().eq("group_id", groupId)
                await supabaseAdmin.from("group_invites").delete().eq("group_id", groupId)
                await supabaseAdmin.from("group_members").delete().eq("group_id", groupId)
                await supabaseAdmin.from("groups").delete().eq("id", groupId)
                logGroupEvent("group.leave", {
                    userId,
                    groupId,
                    role: membership.role,
                    groupDeleted: true,
                    productsMovedToSolo: true,
                })
                return { status: true, data: null }
            }

            if (membership.role === "owner") {
                const nextOwner = members.find((m) => m.user_id !== userId)
                if (nextOwner) {
                    await supabaseAdmin
                        .from("group_members")
                        .update({ role: "owner" })
                        .eq("group_id", groupId)
                        .eq("user_id", nextOwner.user_id)
                }
            }

            const { error } = await supabaseAdmin
                .from("group_members")
                .delete()
                .eq("group_id", groupId)
                .eq("user_id", userId)

            if (error) {
                console.error("[GroupService.leave] error:", error)
                return {
                    status: false,
                    error: { code: GroupErrorCode.GROUP_LEAVE_FAILED, message: "Não foi possível sair do grupo." },
                }
            }

            logGroupEvent("group.leave", {
                userId,
                groupId,
                role: membership.role,
                groupDeleted: false,
                productsMovedToSolo: true,
            })
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
