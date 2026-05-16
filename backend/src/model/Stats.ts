import Model from "./Model"
import db from "../database/connection/connection"
import { PgRawResult } from "../types/database/BdResult"
import { type KpiParkings } from "../types/stats/parkings"
import { type VehicleCount } from "../types/stats/revenue"
import { type StatsKpiParkingResponse, mapStatsKpiParking } from "../mappers/statsParking.mapper"
import { type StatsVehicleCount, mapVehicleCount } from "../mappers/vehicleCount.mapper"
import { type RecentsAllocationsResponse, mapRecentsAllocations } from "../mappers/recentsAllocations.mapper"
import { type Occupied } from "../types/stats/occupied"
import { type RecentsAllocations } from "../types/stats/recentsAllocations"

export interface AllocationData {
  id?: number
  parking_id: number
  client_id: number
  vehicle_id: number
  vehicle_type: number
  entry_date: string
  observations: string
  created_at?: string
  updated_at?: string
}

class Stats extends Model<AllocationData> {
    constructor() {
        super("allocations")
    }

    async getKpiParkings(user_id: string): Promise<StatsKpiParkingResponse | null> {
        try {
            const result = await db.raw<PgRawResult<KpiParkings>>(
            `
            SELECT 
                SUM(po.total_spots) AS total_spots_all,
                SUM(COALESCE(a_count.occupied, 0)) AS total_occupied,
                SUM(po.total_spots - COALESCE(a_count.occupied, 0)) AS total_vacancies_available,
                SUM(COALESCE(today_count.entries_today, 0)) AS total_entries_today,
                ROUND(SUM(COALESCE(a_count.occupied,0))::numeric / NULLIF(SUM(po.total_spots),0) * 100, 2) AS occupancy_pct
            FROM parking p
            INNER JOIN parking_operations po
                ON po.parking_id = p.id
            LEFT JOIN (
                SELECT parking_id, COUNT(*) AS occupied
                FROM allocations
                GROUP BY parking_id
            ) a_count
                ON a_count.parking_id = p.id
            LEFT JOIN (
                SELECT parking_id, COUNT(*) AS entries_today
                FROM allocations
                WHERE DATE(entry_date) = CURRENT_DATE
                GROUP BY parking_id
            ) today_count
                ON today_count.parking_id = p.id
            WHERE p.created_by = ?;
            `,
            [user_id]
            )

            const rows = result.rows[0]
            if(!rows) {
                return null
            }

            return mapStatsKpiParking(rows)

        } catch(err) {
            console.log(`Erro ao buscar dados de alocações na tabela ${this.tableName}:, err`)
            return null
        }
    }

    async getVehicles(user_id: string): Promise<StatsVehicleCount[]> {
        try {
            const result = await db.raw<PgRawResult<VehicleCount>>(
            `
                SELECT a.parking_id, COUNT(*) AS count_vehicles, a.payment_type,
                case 
                    when a.vehicle_type = 1 then 'Carro'
                    when a.vehicle_type = 2 then 'Moto'
                    when a.vehicle_type = 3 then 'Caminhonete'
                    else 'PCD / Idoso'
                end as vehicle_type
                FROM allocations a
                inner join parking p
                    on p.id = a.parking_id
                WHERE p.created_by = ?
                group by a.parking_id, a.payment_type, vehicle_type;
            `,
            [user_id]
            )

            if(result.rows.length === 0) {
                return []
            }

            const rows = result.rows

            return mapVehicleCount(rows)

        } catch(err) {
            console.log(`Erro ao buscar contagem de veiculos na tabela ${this.tableName}:, err`)
            return []
        }
    }

    async getOccupiedParking(user_id: string): Promise<Occupied[]> {
        try {
            const result = await db.raw<PgRawResult<Occupied>>(
            `
                SELECT 
                    a.created_at AS time,
                    COUNT(*) AS occupied
                FROM allocations a
                INNER JOIN parking p
                    ON p.id = a.parking_id
                WHERE p.created_by = ?
                GROUP BY a.created_at
                ORDER BY a.created_at;
            `,
            [user_id]
            )

            if(result.rows.length === 0) {
                return []
            }

            const rows = result.rows

            return rows

        } catch(err) {
            console.log(`Erro ao buscar contagem de ocupação ${this.tableName}:, err`)
            return []
        }
    }

    async getRecentsAllocations(user_id: string): Promise<RecentsAllocationsResponse[]> {
        try {
            const result = await db.raw<PgRawResult<RecentsAllocations>>(
            `
                SELECT
                    c.username as client_name,
                    v.plate as plate,
                    case 
                        when a.vehicle_type = 1 then 'carro'
                        when a.vehicle_type = 2 then 'moto'
                        when a.vehicle_type = 3 then 'caminhonete'
                        else 'PCD / Idoso'
                    end as vehicle_type,
                    FLOOR(EXTRACT(EPOCH FROM (NOW() - a.entry_date)) / 60)::int as time,
                    a.created_at as date
                from allocations a
                inner join parking p
                    on p.id = a.parking_id
                inner join clients c 
                    on c.id = a.client_id
                inner join vehicles v
                    on v.id = a.vehicle_id
                where p.created_by = ?
                order by a.created_at desc
                limit 3
            `,
            [user_id]
            )

            if(result.rows.length === 0) {
                return []
            }

            const rows = result.rows

            return mapRecentsAllocations(rows)

        } catch(err) {
            console.log(`Erro ao buscar alocações recentes na tabela ${this.tableName}:, err`)
            return []
        }
    }

}


export default new Stats()
