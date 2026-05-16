import Operations from "../model/Operations"
import Parking from "../model/Parking"
import Allocation from "../model/Allocation"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { AllocationErrorCode } from "../types/code/allocationCode"
import { ParkingErrorCode } from "../types/code/parkingCode"
import { type SpotResponse } from "../mappers/spots.mapper" 
import { AllocationDetailDTO } from "../dtos/AllocationDetailDTO"
import { type PaginatedAllocationsServiceResult } from "../types/allocation/paginatedAllocationServiceResult"
import { calculateHourlyStayValue } from "../utils/calculateHourCost"
import { calculateDailyStayValue } from "../utils/calculateDailyCost"
import { calculateMonthlyStayValue } from "../utils/calculateMonthCost"
import { parseOpeningHours } from "../utils/parseOpeningHours"
import { calculateAllocationValue } from "../utils/calculatePrices"
import { type StatsAllocationCost } from "../types/allocation/allocationStatsWithCost"
import { type SpotServiceError } from "../types/allocation/SpotsService"

class AllocationService {

    async findSpots(user_id: string): Promise<ServiceResult<SpotResponse[], SpotServiceError>> {
        try {
            const parking = await Parking.findById(user_id, "created_by")
            if (!parking || !parking.id) {
                return {
                    status: false,
                    error: {
                    code: ParkingErrorCode.PARKING_NOT_FOUND,
                    message: "Estacionamento não encontrado",
                    },
                }
            }

            const spots = await Operations.getSpotsByUser(parking.id)
            if (spots.length === 0) {
                return {
                    status: false,
                    error: {
                    code: AllocationErrorCode.SPOTS_NOT_FOUND,
                    message: "Vagas não encontradas",
                    },
                }
            }


            return {status: true, data: spots}

        } catch(error) {
            console.error("AllocationService.findSpots error:", error)

            return {
                status: false,
                error: {
                    code: AllocationErrorCode.SPOTS_FETCH_FAILED,
                    message: "Erro interno ao buscar vagas",
                },
            }
        }
    }

    async allocation(data: {
        client_id: number,
        parking_id: number,
        vehicle_id: number,
        vehicle_type: number,
        payment_type: string,
        entry_date: string,
        observations: string
    }): Promise<ServiceResult<{ id: number}, AllocationErrorCode>> {
        try {
            const vehicleExist = await Allocation.vehicleExists(data.vehicle_id)
            if(vehicleExist) {
                return {
                    status: false,
                    error: {
                        code: AllocationErrorCode.VEHICLE_ALREADY_EXISTS,
                        message: "Veiculo já tem vaga alocada"
                    }
                }
            }

            const success = await Allocation.save(data)
            if (!success) {
                return {
                    status: false,
                    error: {
                    code: AllocationErrorCode.ALLOCATION_CREATE_FAILED,
                    message: "Erro ao cadastrar alocação",
                    },
                }
            }

            return { status: true, data: {
                id: success
            }}

        } catch(error) {
            console.error("AllocationService.allocation: ", error)
            return {
                status: false,
                error: {
                    code: AllocationErrorCode.ALLOCATION_CREATE_FAILED,
                    message: "Erro interno ao cadastrar alocação"
                }
            }
        }
    }

    async getAllocations(user_id: string, page: number, limit: number): Promise<ServiceResult<PaginatedAllocationsServiceResult | null, AllocationErrorCode>> {
        try {
            const result = await Allocation.getAllocationByUser(user_id, page, limit)
            if(!result || result.total === 0) {
                return {
                    status: false,
                    error: {
                        code: AllocationErrorCode.ALLOCATION_NOT_FOUND,
                        message: "Nenhuma alocação encontrada"
                    }
                }
            }

            const now = new Date()
            const mapped: AllocationDetailDTO[] = result.rows.map((row) => {
            const nightPeriod: { start: string; end: string } | null = parseOpeningHours(row.night_period ?? null);

            const calculators = {
                hour: () =>
                    calculateHourlyStayValue({
                        entryAt: new Date(row.entry_date),
                        exitAt: now,
                        pricePerHour: row.price_per_hour,
                        nightPricePerHour: row.night_price_per_hour,
                        vehicleFixedPrice: row.vehicle_fixed_price,
                        nightPeriod,
                    }),
                day: () =>
                    calculateDailyStayValue({
                        entryAt: new Date(row.entry_date),
                        exitAt: now,
                        dailyRate: row.daily_rate,
                        vehicleFixedPrice: row.vehicle_fixed_price,
                    }),
                month: () =>
                    calculateMonthlyStayValue({
                        entryAt: new Date(row.entry_date),
                        exitAt: now,
                        monthlyRate: row.monthly_rate,
                        vehicleFixedPrice: row.vehicle_fixed_price,
                    }),
            } as const;

            const calculator = calculators[row.payment_type as keyof typeof calculators];
            if (!calculator) {
                throw new Error(`Tipo de pagamento inválido: ${row.payment_type}`);
            }

            const estimatedCost = calculator();

            return {
                id: row.allocation_id,
                clientName: row.client_name,
                phone: row.phone,
                parkingName: row.parking_name,
                plate: row.plate,
                brand: row.brand,
                vehicleType: row.vehicle_type,
                entryDate: row.entry_date,
                observations: row.observations,
                paymentType: row.payment_type,
                currentDuration: row.current_duration,
                estimatedCost,
            };
        });

            return {status: true, data: {rows: mapped, total: result.total}}

        } catch(error) {
            console.error("AllocationService.getAllocations: ", error)
            return {
                status: false,
                error: {
                    code: AllocationErrorCode.ALLOCATION_FETCH_FAILED,
                    message: "Erro interno ao buscar alocações"
                }
            }
        }
    }

    async allocationStats(user_id: string): Promise<ServiceResult<StatsAllocationCost, AllocationErrorCode>> {
      try {
        const statsAllocations = await Allocation.getStats(user_id)
        const allocationData = await Allocation.getAllocationData(user_id)
        if(!statsAllocations || allocationData.length === 0) {
            return {
                status: false,
                error: {
                    code: AllocationErrorCode.ALLOCATION_STATS_NOT_FOUND,
                    message: "Nenhuma estatística encontrada"
                }
            }
        }

        let total_revenue = 0

        for(const allocation of allocationData) {
            const value = calculateAllocationValue(allocation)
            total_revenue += value
        }

        return { status: true, data: {...statsAllocations, totalRevenue: Number(total_revenue.toFixed(2))}}

      } catch(error) {
        console.error("AllocationService.getStats: ", error)
        return {
          status: false,
          error: {
            code: AllocationErrorCode.ALLOCATION_STATS_FAILED,
            message: "Erro interno ao buscar Estatísticas de alocações",
          }
        }
      }
    }

    async removeAllocation(allocation_id: string): Promise<ServiceResult<{allocation_id: string}, AllocationErrorCode>> {
        try {
            const allocationId = await Allocation.delete(allocation_id)
            if(!allocationId) {
                return {
                    status: false,
                    error: {
                        code: AllocationErrorCode.ALLOCATION_NOT_FOUND,
                        message: "Alocação não encontrada"
                    }
                }
            }

            return { status: true, data: {allocation_id}}
        } catch(error) {
            console.error("AllocationService.removeAllocation: ", error)
            return {
                status: false,
                error: {
                    code: AllocationErrorCode.ALLOCATION_DELETE_FAILED,
                    message: "Erro interno ao remover a alocação"
                }
            }
        }
    }
}

export default new AllocationService()
