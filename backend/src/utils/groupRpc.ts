import { GroupErrorCode } from "../types/code/groupCode"

export type GroupRpcResult = {
    ok: boolean
    error?: string
    message?: string
    group_id?: string
    group_name?: string
    products_linked?: number
    group_deleted?: boolean
    products_unlinked?: number
}

const GROUP_ERROR_MESSAGES: Partial<Record<GroupErrorCode, string>> = {
    [GroupErrorCode.GROUP_ALREADY_IN_GROUP]: "Você já participa de um grupo. Saia antes de criar outro.",
    [GroupErrorCode.GROUP_NOT_IN_GROUP]: "Você não está em um grupo.",
    [GroupErrorCode.GROUP_INVITE_INVALID]: "Código de convite inválido.",
    [GroupErrorCode.GROUP_CREATE_FAILED]: "Não foi possível criar o grupo.",
    [GroupErrorCode.GROUP_JOIN_FAILED]: "Não foi possível entrar no grupo.",
    [GroupErrorCode.GROUP_LEAVE_FAILED]: "Não foi possível sair do grupo.",
}

export function parseGroupRpcResult(data: unknown): GroupRpcResult {
    if (!data || typeof data !== "object") {
        return { ok: false, error: GroupErrorCode.GROUP_FETCH_FAILED }
    }
    return data as GroupRpcResult
}

export function resolveGroupRpcError(
    result: GroupRpcResult,
    fallback: GroupErrorCode
): { code: GroupErrorCode; message: string } {
    const code =
        result.error && Object.values(GroupErrorCode).includes(result.error as GroupErrorCode)
            ? (result.error as GroupErrorCode)
            : fallback

    const message =
        result.message ??
        GROUP_ERROR_MESSAGES[code] ??
        GROUP_ERROR_MESSAGES[fallback] ??
        "Não foi possível concluir a operação."

    return { code, message }
}
