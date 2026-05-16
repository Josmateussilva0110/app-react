import Model from "./Model"
import db from "../database/connection/connection"
import { ParkingDetailsDTO } from "../dtos/ParkingDetailsDTO"
import { ParkingEditDTO } from "../dtos/ParkingEditDTO"
import { type PaginatedParkingResult } from "../types/parking/PaginatedParkingResult"
import { type ParkingDetailsRow } from "../types/parking/ParkingDetailsRow"
import { type PgRawResult } from "../types/database/BdResult"
import { parseOpeningHours } from "../utils/parseOpeningHours"
import { type ParkingEditRow } from "../types/parking/ParkingEdit"
import { type ParkingRow } from "../types/parking/parking"
import { mapParkingRowList } from "../mappers/parking.mapper"
import { type ParkingResponse } from "../mappers/parking.mapper"

export interface ParkingData {
  id?: number
  parking_name: string
  manager_name: string
  created_by: number
  created_at?: string
  updated_at?: string
}

class Parking extends Model<ParkingData> {
  constructor() {
    super("parking")
  }

  async findByIdUser(id: string, page: number, limit: number): Promise<PaginatedParkingResult | null> {
    const offset = (page - 1) * limit
    try {
      const result = await db.raw<PgRawResult<ParkingDetailsRow>>(
        `
        select 
          p.id as id,
          p.parking_name as "parkingName",
          p.manager_name as "managerName",

          pa.street as address_street,
          pa.number as address_number,
          pa.district as address_district,
          pa.city as address_city,
          pa.state as address_state,

          pc.phone as contact_phone,
          pc.open_hours as "openingHours",

          po.total_spots as ops_total,
          po.car_spots as ops_car,
          po.moto_spots as ops_moto,
          po.has_cameras as ops_cameras,
          po.has_washing as ops_washing,

          pp.price_hour as price_hour
        from parking p
        inner join parking_address pa on pa.parking_id = p.id
        inner join parking_contact pc on pc.parking_id = p.id
        inner join parking_operations po on po.parking_id = p.id
        inner join parking_prices pp on pp.parking_id = p.id
        where p.created_by = ?
        order by p.created_at desc
        limit ?
        offset ?
        `,
        [id, limit, offset]
      )

      const countResult = await db.raw<PgRawResult<{ total: string }>>(
        `
        select count(*) as total
        from parking
        where created_by = ?
        `,
        [id]
      )

      const total = Number(countResult.rows[0].total)

      const rows = result.rows
      const mapped: ParkingDetailsDTO[] = rows.map((row) => ({
        id: row.id,
        parkingName: row.parkingName,
        managerName: row.managerName,

        address: {
          street: row.address_street,
          number: row.address_number,
          district: row.address_district,
          city: row.address_city,
          state: row.address_state,
        },

        contacts: {
          phone: row.contact_phone,
          openingHours: parseOpeningHours(row.openingHours),
        },

        operations: {
          totalSpots: row.ops_total,
          carSpots: row.ops_car,
          motoSpots: row.ops_moto,
          hasCameras: Boolean(row.ops_cameras),
          hasWashing: Boolean(row.ops_washing),
        },

        prices: {
          priceHour: row.price_hour,
        },
      }))

      return {
        rows: mapped,
        total,
      }

    } catch (err) {
      console.error(
        `Erro ao buscar estacionamentos tabela: ${this.tableName}`,
        err
      )
      return null
    }
  }

  async getParkingById(id: string): Promise<ParkingEditDTO | null> {
    try {
      const result = await db.raw<PgRawResult<ParkingEditRow>>(
        `SELECT 
          p.id as parking_id, p.parking_name, p.manager_name,
          pa.street, pa.number, pa.district, pa.city, pa.state, pa.zip_code, pa.complement,
          pc.phone, pc.whatsapp, pc.email, pc.open_hours,
          po.total_spots, po.car_spots, po.moto_spots, po.truck_spots, po.pcd_spots, po.elderly_spots, 
          po.has_cameras, po.has_washing, po.area_type,
          pp.car_price, pp.moto_price, pp.truck_price, pp.price_hour, pp.price_extra_hour, 
          pp.daily_rate, pp.monthly_rate, pp.night_rate, pp.night_period
        FROM parking p
        INNER JOIN parking_address pa ON pa.parking_id = p.id
        INNER JOIN parking_contact pc ON pc.parking_id = p.id
        INNER JOIN parking_operations po ON po.parking_id = p.id
        INNER JOIN parking_prices pp ON pp.parking_id = p.id
        WHERE p.id = ?`,
        [id]
      )

      if (!result.rows.length) {
        return null
      }

      const row = result.rows[0]
      const mapped: ParkingEditDTO = {
      id: row.parking_id,
      parkingName: row.parking_name,
      managerName: row.manager_name,

      address: {
        street: row.street,
        number: row.number,
        district: row.district,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        complement: row.complement,
      },

      contacts: {
        phone: row.phone,
        whatsapp: row.whatsapp,
        email: row.email,
        openingHours: parseOpeningHours(row.open_hours),
      },

      operations: {
        totalSpots: row.total_spots,
        carSpots: row.car_spots,
        motoSpots: row.moto_spots,
        truckSpots: row.truck_spots,
        pcdSpots: row.pcd_spots,
        elderlySpots: row.elderly_spots,
        hasCameras: Boolean(row.has_cameras),
        hasWashing: Boolean(row.has_washing),
        areaType: row.area_type,
      },

      prices: {
        carPrice: row.car_price,
        motoPrice: row.moto_price,
        truckPrice: row.truck_price,
        priceHour: row.price_hour,
        priceExtraHour: row.price_extra_hour,
        dailyRate: row.daily_rate,
        monthlyRate: row.monthly_rate,
        nightRate: row.night_rate,
        nightPeriod: parseOpeningHours(row.night_period),
      },
    }

      return mapped

    } catch (err) {
      console.error(
        `Erro ao buscar estacionamentos tabela: ${this.tableName}`,
        err
      )
      return null
    }
  }

  async getNames(user_id: string): Promise<ParkingResponse[]> {
    try {
      const result = await db.raw<PgRawResult<ParkingRow>>(
        `
        select 
            p.id as parking_id, 
            p.parking_name,
            p.manager_name,
            p.created_by,
            p.updated_at
        from parking p
        where p.created_by = ?
        `,
        [user_id]
        )

        if (!result.rows.length) {
        return []
        }

        return mapParkingRowList(result.rows)

    } catch (err) {
        console.error(
        `Erro ao buscar nomes de estacionamentos da tabela: ${this.tableName}`,
        err
        )
        return []
    }
  }
}

export default new Parking()
