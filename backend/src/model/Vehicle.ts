import Model from "./Model"
import db from "../database/connection/connection"
import { type PaginatedVehicleListResult } from "../types/vehicles/paginationVehicleList"
import { type VehicleList } from "../types/vehicles/vehicleList"
import { VehicleListDTO } from "../dtos/VehicleListDTO"
import { type VehicleDetail } from "../types/vehicles/vehicleDetail"
import { VehicleEditDTO } from "../dtos/VehicleEditDTO"
import { PgRawResult } from "../types/database/BdResult"



export interface VehicleData {
  id?: string
  plate: string
  brand: string
  color: string
  client_id: string
  vehicle_type: number
  created_at?: string 
  updated_at?: string
}

class Vehicle extends Model<VehicleData> {
    constructor() {
        super("vehicles")
    }

    async plateExists(plate: string, ignoreVehicleId?: string): Promise<boolean> {
        try {
            const query = db(this.tableName)
                .select("id")
                .where("plate", plate)
            
            if(ignoreVehicleId) {
                query.andWhere("id", "!=", ignoreVehicleId)
            }
            const result = await query.first()
            return !!result
        } catch (err) {
            console.error(`Erro ao verificar placa na tabela ${this.tableName}:`, err)
            return false
        }
    }

    async cpfExists(cpf: string, ignoreClientId?: string): Promise<boolean> {
        try {
            const query = db(this.tableName)
                .select("id")
                .where("cpf", cpf)

            if (ignoreClientId) {
                query.andWhere("id", "!=", ignoreClientId)
            }

            const result = await query.first()
            return !!result
        } catch (err) {
            console.error(
                `Erro ao verificar cpf na tabela ${this.tableName}:`,
                err
            )
            return false
        }
    }

    async listPagination(user_id: string, page: number, limit: number): Promise<PaginatedVehicleListResult | null> {
        const offset = (page - 1) * limit
        try {
            const result = await db.raw<PgRawResult<VehicleList>>(
                `
                    select 
                        v.id,
                        v.client_id,
                        c.username as client_name,
                        v.plate,
                        v.brand,
                        v.color,
                        v.created_at,
                        case 
                            when v.vehicle_type = 1 then 'carro'
                            when v.vehicle_type = 2 then 'moto'
                            when v.vehicle_type = 3 then 'caminhonete'
                            else 'desconhecido'
                        end as vehicle_type,
                        exists (
                            select 1
                            from allocations a
                            where a.vehicle_id = v.id
                        ) as is_allocated,
                        count(*) over() as total
                    from vehicles v
                    inner join clients c
                        on c.id = v.client_id   
                    where c.user_id = ?
                    order by v.created_at desc 
                    limit ?
                    offset ?
                `
                ,[user_id, limit, offset]
            )

            const rows = result.rows
            if(!rows.length) {
                return { rows: [], total: 0}
            }

            const total = Number(rows[0].total)

            const mapped: VehicleListDTO[] = rows.map((row) => ({
                id: row.id,
                clientId: row.client_id,
                clientName: row.client_name,
                plate: row.plate,
                vehicleType: row.vehicle_type,
                brand: row.brand,
                color: row.color,
                isAllocated: row.is_allocated,
                registrationDate: row.created_at
            }))

            return { rows: mapped, total: total}

        } catch(err) {
            console.error(`Erro ao buscar lista de veículos: ${this.tableName}`, err)
            return null
        }
    }

    async vehicleDetail(vehicle_id: string): Promise<VehicleEditDTO | null> {
        try {
            const result = await db.raw<PgRawResult<VehicleDetail>>(
                `
                    select 
                        v.id as vehicle_id, v.plate, v.vehicle_type, v.brand, v.color,
                        c.id as client_id, c.username as client_name, c.cpf as client_cpf
                    from vehicles v
                    inner join clients c 
                        on c.id = v.client_id
                    where v.id = ?
                `,
                [vehicle_id]
            )
            if(result.rows.length === 0) return null
            const row = result.rows[0]

            const mapper: VehicleEditDTO = {
                vehicleId: row.vehicle_id,
                clientId: row.client_id,
                clientName: row.client_name,
                cpf: row.client_cpf,
                plate: row.plate,
                vehicleType: row.vehicle_type,
                brand: row.brand,
                color: row.color,
            }

            return mapper

        } catch(err) {
            console.error(`Erro ao buscar veículos detalhes: ${this.tableName}`, err)
            return null
        }
    }

}

export default new Vehicle()
