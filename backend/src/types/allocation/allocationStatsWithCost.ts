import { type StatsAllocationsResponse } from "../../mappers/stats.mapper" 

export interface StatsAllocationCost extends StatsAllocationsResponse {
  totalRevenue: number
}
