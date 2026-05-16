import { type StatsKpiParkingResponse } from "../../mappers/statsParking.mapper"

export interface KpiParkingsResponse {
    kpis: StatsKpiParkingResponse
    totalRevenue: number
}
