import Stats from "../model/Stats"
import Allocation from "../model/Allocation"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { StatsErrorCode } from "../types/code/statsCode"
import { calculateAllocationValue } from "../utils/calculatePrices"
import { type KpiParkingsResponse } from "../types/stats/parkingStatsResponse"
import { type StatsVehicleCount } from "../mappers/vehicleCount.mapper"
import { type AllocationPrinces } from "../types/allocation/allocationData"
import { type Occupied } from "../types/stats/occupied"
import { type RevenueGroupDay } from "../types/stats/revenueGroupDay"
import { type CountVehicleTypeResponse } from "../types/stats/countVehicleTypeResponse"
import { type RecentsAllocationsResponse } from "../mappers/recentsAllocations.mapper"
import { RevenueByPaymentTypeDTO } from "../dtos/RevenueByPayment"


class StatsService {

  private groupRevenueByType(allocationData: AllocationPrinces[]): { revenueByType: Record<string, number>; totalRevenue: number } {
    const revenueByType: Record<string, number> = {}
    let totalRevenue = 0

    for (const allocation of allocationData) {
      const value = calculateAllocationValue(allocation)
      const type = allocation.payment_type

      if (!revenueByType[type]) {
        revenueByType[type] = 0
      }

      revenueByType[type] += value
      totalRevenue += value
    }

    return { revenueByType, totalRevenue }
  }

  private formatHourBrazil(dateString: string): string {
    const date = new Date(dateString)
    
    const hour = date.getUTCHours() - 3
    
    const adjustedHour = (hour + 24) % 24

    return `${adjustedHour}h`
  }

  private groupOccupiedByHour(occupiedData: Occupied[]) {
    const grouped: Record<string, number> = {}

    for (const item of occupiedData) {
      const time = this.formatHourBrazil(item.time)
      const occupiedValue = Number(item.occupied) || 0

      if (!grouped[time]) {
        grouped[time] = 0
      }

      grouped[time] += occupiedValue
    }

    return Object.entries(grouped)
      .map(([time, occupied]) => ({
        time,
        occupied
      }))
      .sort((a, b) => {
        const hourA = Number(a.time.replace("h", ""))
        const hourB = Number(b.time.replace("h", ""))
        return hourA - hourB
      })
  }

  private getWeekDay(date: Date): string {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    return days[date.getDay()]
  }

  private groupRevenueByWeekDay(allocationData: AllocationPrinces[], occupiedData: Occupied[]) {
    const revenueByDay: Record<string, number> = {}
    const occupiedByDay: Record<string, number> = {}

    // 🔹 Agrupar revenue
    for (const allocation of allocationData) {
      const value = calculateAllocationValue(allocation)
      const day = this.getWeekDay(new Date(allocation.entry_date))

      if (!revenueByDay[day]) {
        revenueByDay[day] = 0
      }

      revenueByDay[day] += value
    }


    for (const item of occupiedData) {
      const day = this.getWeekDay(new Date(item.time))
      const occupiedValue = Number(item.occupied) || 0

      if (!occupiedByDay[day]) {
        occupiedByDay[day] = 0
      }

      occupiedByDay[day] += occupiedValue
    }

  
    const allDays = new Set([
      ...Object.keys(revenueByDay),
      ...Object.keys(occupiedByDay),
    ])

    return Array.from(allDays).map((day) => ({
      day,
      revenue: Number((revenueByDay[day] || 0).toFixed(2)),
      occupied: occupiedByDay[day] || 0,
    }))
  }

  private buildRevenueDTO(
    vehicleCount: StatsVehicleCount[],
    revenueByType: Record<string, number>,
    totalRevenue: number
  ): RevenueByPaymentTypeDTO[] {

    const grouped: Record<string, RevenueByPaymentTypeDTO> = {}

    for (const vc of vehicleCount) {
      const type = vc.paymentType
      const vehicle = vc.vehicleType

      if (!grouped[type]) {
        const revenue = revenueByType[type] || 0

        grouped[type] = {
          paymentType: type,
          revenue: Number(revenue.toFixed(2)),
          vehicleCount: 0,
          vehicleType: vehicle,
          pct: totalRevenue > 0
            ? Number(((revenue / totalRevenue) * 100).toFixed(2))
            : 0
        }
      }
      grouped[type].vehicleCount += Number(vc.countVehicles)
    }

    return Object.values(grouped)
  }

  private groupVehicleCountByType(data: StatsVehicleCount[]): CountVehicleTypeResponse {
    const grouped: Record<string, number> = {}
    let total: number = 0

    for (const item of data) {
      const type = item.vehicleType
      const count = item.countVehicles

      if (!grouped[type]) {
        grouped[type] = 0
      }

      grouped[type] += count
      total += count
    }

    return {
      total,
      data: Object.entries(grouped).map(([vehicleType, countVehicles]) => ({
        vehicleType,
        countVehicles
      }))
    }
  }

  async parkingStats(user_id: string): Promise<ServiceResult<KpiParkingsResponse | null, StatsErrorCode>> {
    try {
      const statsKpi = await Stats.getKpiParkings(user_id)
      const allocationData = await Allocation.getAllocationData(user_id)
      if (!statsKpi || allocationData.length === 0) {
        return {
          status: false,
          error: {
            code: StatsErrorCode.PARKING_KPI_NOT_FOUND,
            message: "Nenhuma estatística do estacionamento"
          }
        }
      }

      let total_revenue = 0

      for (const allocation of allocationData) {
        const value = calculateAllocationValue(allocation)
        total_revenue += value
      }

      return { status: true, data: { kpis: statsKpi, totalRevenue: Number(total_revenue.toFixed(2)) } }

    } catch (error) {
      console.error("StatsService.getStats: ", error)
      return {
        status: false,
        error: {
          code: StatsErrorCode.STATS_FETCH_FAILED,
          message: "Erro interno ao buscar Estatísticas de estacionamento",
        }
      }
    }
  }

  async revenueCard(user_id: string): Promise<ServiceResult<RevenueByPaymentTypeDTO[], StatsErrorCode>> {
    try {
      const allocationData = await Allocation.getAllocationData(user_id)
      const vehicleCount = await Stats.getVehicles(user_id)

      if (allocationData.length === 0 || vehicleCount.length === 0) {
        return {
          status: false,
          error: {
            code: StatsErrorCode.PARKING_KPI_NOT_FOUND,
            message: "Nenhuma estatística do estacionamento"
          }
        }
      }

      const { revenueByType, totalRevenue } = this.groupRevenueByType(allocationData)

      const data = this.buildRevenueDTO(vehicleCount, revenueByType, totalRevenue)

      return {
        status: true,
        data
      }

    } catch (error) {
      console.error("StatsService.getStats: ", error)
      return {
        status: false,
        error: {
          code: StatsErrorCode.STATS_FETCH_FAILED,
          message: "Erro interno ao buscar Estatísticas de estacionamento",
        }
      }
    }
  }

  async countOccupied(user_id: string): Promise<ServiceResult<Occupied[], StatsErrorCode>> {
    try {
      const occupied = await Stats.getOccupiedParking(user_id)
      if(occupied.length === 0) {
        return {
          status: false,
          error: {
            code: StatsErrorCode.PARKING_KPI_NOT_FOUND,
            message: "Nenhuma estatística do estacionamento"
          }
        }
      }

      const groupOccupied = this.groupOccupiedByHour(occupied) 

      return { status: true, data: groupOccupied}

    } catch(error) {
      console.error("StatsService.countOccupied: ", error)
      return {
        status: false,
        error: {
          code: StatsErrorCode.STATS_FETCH_FAILED,
          message: "Erro interno ao buscar ocupação de estacionamento",
        }
      }
    }
  }

  async revenueByDay(user_id: string): Promise<ServiceResult<RevenueGroupDay[], StatsErrorCode>> {
    try {
      const allocationData = await Allocation.getAllocationData(user_id)
      const occupied = await Stats.getOccupiedParking(user_id)

      if (allocationData.length === 0 || occupied.length === 0) {
        return {
          status: false,
          error: {
            code: StatsErrorCode.PARKING_KPI_NOT_FOUND,
            message: "Nenhuma estatística do estacionamento"
          }
        }
      }

      const revenueByDay = this.groupRevenueByWeekDay(allocationData, occupied)

      return {
        status: true,
        data: revenueByDay
      }

    } catch (error) {
      console.error("StatsService.revenueByDay: ", error)
      return {
        status: false,
        error: {
          code: StatsErrorCode.STATS_FETCH_FAILED,
          message: "Erro interno ao buscar faturamento por dia de estacionamento",
        }
      }
    }
  }


  async countVehicleType(user_id: string): Promise<ServiceResult<CountVehicleTypeResponse, StatsErrorCode>> {
    try {
      const vehicleCount = await Stats.getVehicles(user_id)

      if (vehicleCount.length === 0) {
        return {
          status: false,
          error: {
            code: StatsErrorCode.PARKING_KPI_NOT_FOUND,
            message: "Nenhuma estatística do estacionamento"
          }
        }
      }

      const grouped = this.groupVehicleCountByType(vehicleCount)

      return {
        status: true,
        data: grouped
      }

    } catch (error) {
      console.error("StatsService.countVehicleType: ", error)
      return {
        status: false,
        error: {
          code: StatsErrorCode.STATS_FETCH_FAILED,
          message: "Erro interno ao buscar conatgem de veiculos por tipo",
        }
      }
    }
  }

  async recents(user_id: string): Promise<ServiceResult<RecentsAllocationsResponse[], StatsErrorCode>> {
    try {
      const recentsAllocations = await Stats.getRecentsAllocations(user_id)

      if (recentsAllocations.length === 0) {
        return {
          status: false,
          error: {
            code: StatsErrorCode.PARKING_KPI_NOT_FOUND,
            message: "Nenhuma estatística do estacionamento"
          }
        }
      }

      return {
        status: true,
        data: recentsAllocations
      }

    } catch (error) {
      console.error("StatsService.recents: ", error)
      return {
        status: false,
        error: {
          code: StatsErrorCode.STATS_FETCH_FAILED,
          message: "Erro interno ao buscar alocações recentes",
        }
      }
    }
  }

}

export default new StatsService()
