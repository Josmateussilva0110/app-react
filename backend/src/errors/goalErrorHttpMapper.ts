import { GoalErrorCode } from "../types/code/goalCode"

export const goalErrorHttpStatusMap: Record<GoalErrorCode, number> = {
    [GoalErrorCode.GOAL_FETCH_FAILED]: 500,
    [GoalErrorCode.GOAL_UPDATE_FAILED]: 500,
}
