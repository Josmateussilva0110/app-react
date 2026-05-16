import { StatsErrorCode } from "../types/code/statsCode"

export const statsErrorHttpStatusMap: Record<StatsErrorCode, number> = {
  [StatsErrorCode.PARKING_KPI_NOT_FOUND]: 404, 
  [StatsErrorCode.STATS_FETCH_FAILED]: 500,
}

