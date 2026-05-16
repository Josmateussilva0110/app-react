import Model from "./Model"
import db from "../database/connection/connection"
import { PgRawResult } from "../types/database/BdResult"
import { type AllocationDetail } from "../types/allocation/allocationDetail"
import { type PaginatedAllocationsResult } from "../types/allocation/paginatedAllocationsResult"
import { type StatsAllocations } from "../types/allocation/statsAllocations"
import { type StatsAllocationsResponse } from "../mappers/stats.mapper"
import { type AllocationPrinces } from "../types/allocation/allocationData"
import { mapStatsAllocations } from "../mappers/stats.mapper"

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

class Allocation extends Model<AllocationData> {
    constructor() {
        super("allocations")
    }

    async vehicleExists(vehicle_id: number): Promise<boolean> {
        try {
            const result = await db(this.tableName)
            .select("id")
            .where({ vehicle_id })
            .first()

            return !!result
        } catch (err) {
            console.error(`Erro ao verificar veiculo na tabela ${this.tableName}:`, err)
            return false
        }
    }

    async getAllocationByUser(user_id: string, page: number, limit: number): Promise<PaginatedAllocationsResult | null> {
        const offset = (page - 1) * limit
        try {
            const result = await db.raw<PgRawResult<AllocationDetail>>(
                `
                    select 
                       a.id as allocation_id, a.entry_date, a.observations, a.payment_type,
                       c.username as client_name, c.phone,
                       v.plate, v.brand, 
                       CASE
                            when v.vehicle_type = 1 then 'carro'
                            when v.vehicle_type = 2 then 'moto'
                            when v.vehicle_type = 3 then 'caminhonete'
                            else 'desconhecido'
                       end as vehicle_type,
                       p.parking_name,
                       FLOOR(EXTRACT(EPOCH FROM (NOW() - a.entry_date)) / 60)::int as current_duration,
                       pp.price_hour as price_per_hour,
                       pp.night_rate as night_price_per_hour,
                       pp.night_period,
                       pp.daily_rate,
                       pp.monthly_rate,
                       CASE
                            WHEN v.vehicle_type = 1 THEN pp.car_price
                            WHEN v.vehicle_type = 2 THEN pp.moto_price
                            WHEN v.vehicle_type = 3 THEN pp.truck_price
                            ELSE 0
                        END AS vehicle_fixed_price,
                       count(*) over() as total
                    from allocations a
                    inner join clients c
                        on c.id = a.client_id
                    inner join vehicles v
                        on v.id = a.vehicle_id
                    inner join parking p
                        on p.id = a.parking_id
                    inner join parking_prices pp
                        on pp.parking_id = p.id
                    where p.created_by = ?
                    order by a.created_at desc
                    limit ?
                    offset ?
                `,
                [user_id, limit, offset]
            )

            const rows = result.rows
            if(!rows.length) {
                return { rows: [], total: 0}
            }

            const total = Number(rows[0].total)

            return { rows: result.rows, total: total}


        } catch(err) {
            console.log(`Erro ao buscar alocações na tabela ${this.tableName}:, err`)
            return null
        }
    }

    async getStats(user_id: string): Promise<StatsAllocationsResponse | null> {
        try {   
            const result = await db.raw<PgRawResult<StatsAllocations>>(
                `
                    with total_spots_cte as (
                        select coalesce(sum(po.total_spots), 0) as total_spots
                        from parking p
                        inner join parking_operations po 
                            on po.parking_id = p.id
                        where p.created_by = ?
                    ),
                    active_allocations_cte as (
                        select count(*) as actives
                        from allocations a
                        inner join parking p 
                            on p.id = a.parking_id
                        where p.created_by = ?
                    )

                    select
                        t.total_spots,
                        a.actives,                        
                        case 
                            when t.total_spots = 0 then 0
                            else round((a.actives::decimal / t.total_spots) * 100, 2)
                        end as occupancy_rate,

                        (t.total_spots - a.actives) as available_spots

                    from total_spots_cte t
                    cross join active_allocations_cte a;
                `,
                [user_id, user_id]
            )


            if(!result.rows[0]) {
                return null
            }

            return mapStatsAllocations(result.rows[0])


        } catch(err) {
            console.error(`Erro ao buscar estatísticas estacionamento tabela ${this.tableName}:, err`)
            return null
        }
    }

    async getAllocationData(user_id: string): Promise<AllocationPrinces[]> {
        try {
            const result = await db.raw<PgRawResult<AllocationPrinces>>(
                `
                    select 
                       a.id as allocation_id, a.entry_date, a.payment_type,
                       pp.price_hour as price_per_hour,
                       pp.night_rate as night_price_per_hour,
                       pp.night_period,
                       pp.daily_rate,
                       pp.monthly_rate,
                       CASE
                            WHEN v.vehicle_type = 1 THEN pp.car_price
                            WHEN v.vehicle_type = 2 THEN pp.moto_price
                            WHEN v.vehicle_type = 3 THEN pp.truck_price
                            ELSE 0
                        END AS vehicle_fixed_price
                    from allocations a
                    inner join vehicles v
                        on v.id = a.vehicle_id
                    inner join parking p
                        on p.id = a.parking_id
                    inner join parking_prices pp
                        on pp.parking_id = p.id
                    where p.created_by = ?
                `,
                [user_id]
            )

            const rows = result.rows
            if(!rows.length) {
                return []
            }

            return rows

        } catch(err) {
            console.log(`Erro ao buscar dados de alocações na tabela ${this.tableName}:, err`)
            return []
        }
    }

}


export default new Allocation()
