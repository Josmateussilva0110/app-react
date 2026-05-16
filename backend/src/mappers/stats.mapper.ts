import { type StatsAllocations } from "../types/allocation/statsAllocations" 

export interface StatsAllocationsResponse {
    actives: number
    totalSpots: number
    occupancyRate: number
    availableSpots: number
}

export function mapStatsAllocations(row: StatsAllocations): StatsAllocationsResponse {
  return {
    actives: row.actives,
    totalSpots: row.total_spots,
    occupancyRate: row.occupancy_rate,
    availableSpots: row.available_spots
  }
}
