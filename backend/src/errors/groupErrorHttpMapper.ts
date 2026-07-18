import { GroupErrorCode } from "../types/code/groupCode"

export const groupErrorHttpStatusMap: Record<GroupErrorCode, number> = {
    [GroupErrorCode.GROUP_FETCH_FAILED]: 500,
    [GroupErrorCode.GROUP_CREATE_FAILED]: 500,
    [GroupErrorCode.GROUP_ALREADY_IN_GROUP]: 409,
    [GroupErrorCode.GROUP_NOT_IN_GROUP]: 400,
    [GroupErrorCode.GROUP_NOT_FOUND]: 404,
    [GroupErrorCode.GROUP_FORBIDDEN]: 403,
    [GroupErrorCode.GROUP_INVITE_FAILED]: 500,
    [GroupErrorCode.GROUP_INVITE_INVALID]: 422,
    [GroupErrorCode.GROUP_JOIN_FAILED]: 500,
    [GroupErrorCode.GROUP_LEAVE_FAILED]: 500,
    [GroupErrorCode.GROUP_UPDATE_FAILED]: 500,
}
