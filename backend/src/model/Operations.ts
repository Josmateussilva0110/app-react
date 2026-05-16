import Model from "./Model"
import db from "../database/connection/connection"
import { PgRawResult } from "../types/database/BdResult"
import { type SpotsRow } from "../types/allocation/spots"
import { type SpotResponse } from "../mappers/spots.mapper"
import { mapSpotsList } from "../mappers/spots.mapper"


export interface OperationsData {
  id?: number
  parking_id: number
  total_spots: number
  car_spots: number
  moto_spots?: number
  truck_spots?: number
  pcd_spots?: number
  elderly_spots?: number
  has_cameras: boolean
  has_washing: boolean
  area_type: number
  created_at?: string
  updated_at?: string
}

class ParkingOperations extends Model<OperationsData> {
  constructor() {
    super("parking_operations")
  }

  async getSpotsByUser(parking_id: number): Promise<SpotResponse[]> {
    try {
      const result = await db.raw<PgRawResult<SpotsRow>>(
        `
          SELECT
            po.parking_id,
            po.car_spots   - COALESCE(COUNT(*) FILTER (WHERE a.vehicle_type = 1), 0) AS car_spots,
            po.moto_spots  - COALESCE(COUNT(*) FILTER (WHERE a.vehicle_type = 2), 0) AS moto_spots,
            po.truck_spots - COALESCE(COUNT(*) FILTER (WHERE a.vehicle_type = 3), 0) AS truck_spots,
            po.pcd_spots   - COALESCE(COUNT(*) FILTER (WHERE a.vehicle_type = 4), 0) AS pcd_spots,
            po.elderly_spots - COALESCE(COUNT(*) FILTER (WHERE a.vehicle_type = 5), 0) AS elderly_spots

          FROM parking_operations po
          LEFT JOIN allocations a
            ON a.parking_id = po.parking_id
          WHERE po.parking_id = ?
          GROUP BY
            po.parking_id,
            po.car_spots,
            po.moto_spots,
            po.truck_spots,
            po.pcd_spots,
            po.elderly_spots;
        `,
        [parking_id]
      )

      if (!result.rows.length) {
        return []
      }

      return mapSpotsList(result.rows)

    } catch (err) {
      console.error(
        `Erro ao buscar vagas da tabela: ${this.tableName}`,
        err
      )
      return []
    }
  }


}

export default new ParkingOperations()
