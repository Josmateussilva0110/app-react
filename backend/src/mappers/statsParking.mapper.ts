import { type KpiParkings } from "../types/stats/parkings" 

export interface StatsKpiParkingResponse {
  occupied: number
  vacanciesAvailable: number
  entriesToday: number
  totalSpots: number
  occupancyPct: number   
}

export function mapStatsKpiParking(row: KpiParkings): StatsKpiParkingResponse {
  return {
    occupied: row.total_occupied,
    vacanciesAvailable: row.total_vacancies_available,
    entriesToday: row.total_entries_today,
    totalSpots: row.total_spots_all,
    occupancyPct: row.occupancy_pct
  }
}
