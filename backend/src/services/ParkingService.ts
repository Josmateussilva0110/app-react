import db from "../database/connection/connection"
import Parking from "../model/Parking"
import Contact from "../model/Contact"
import Address from "../model/Address"
import Operations from "../model/Operations"
import Prices from "../model/Prices"
import { ParkingRegisterDTO } from "../dtos/ParkingRegisterDTO"
import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { ParkingErrorCode } from "../types/code/parkingCode"
import { type PaginatedParkingResult } from "../types/parking/PaginatedParkingResult"
import { ParkingEditDTO } from "../dtos/ParkingEditDTO"
import { type ParkingResponse } from "../mappers/parking.mapper"
import { mapAreaTypeToNumber } from "../utils/mapAreaType"


class ParkingService {
  async register(
    data: ParkingRegisterDTO,
    userId: number
  ): Promise<ServiceResult<{ parkingId: number }, ParkingErrorCode>> {

    const emailExist = await Contact.emailExist(data.contacts.email)
    if(emailExist) {
      return {
        status: false,
        error: {
          code: ParkingErrorCode.EMAIL_ALREADY_EXISTS,
          message: "Email de contato já existe"
        }
      }
    }


    try {
      const parkingId = await db.transaction(async (trx) => {

        const createdParkingId = await Parking.save(
          {
            parking_name: data.parkingName,
            manager_name: data.managerName,
            created_by: userId,
          },
          { trx }
        )

        await Address.save({
          parking_id: createdParkingId,
          street: data.address.street,
          number: data.address.number,
          complement: data.address.complement,
          district: data.address.district,
          city: data.address.city,
          state: data.address.state,
          zip_code: data.address.zipCode
        },
          { trx }
        )

        await Contact.save(
          {
            parking_id: createdParkingId,
            phone: data.contacts.phone,
            whatsapp: data.contacts.whatsapp,
            email: data.contacts.email,
            open_hours: {
              start: data.contacts.openingHours.start,
              end: data.contacts.openingHours.end,
            },
          },
          { trx }
        )

        await Operations.save({
          parking_id: createdParkingId,
          total_spots: data.operations.totalSpots,
          car_spots: data.operations.carSpots,
          moto_spots: data.operations.motoSpots,
          truck_spots: data.operations.truckSpots,
          pcd_spots: data.operations.pcdSpots,
          elderly_spots: data.operations.elderlySpots,
          has_cameras: data.operations.hasCameras,
          has_washing: data.operations.hasWashing,
          area_type: mapAreaTypeToNumber(data.operations.areaType)
        },
          { trx }
        )

        await Prices.save({
          parking_id: createdParkingId,
          price_hour: data.prices.priceHour,
          price_extra_hour: data.prices.priceExtraHour,
          daily_rate: data.prices.dailyRate,
          night_period: data.prices.nightPeriod
            ? {
                start: data.prices.nightPeriod.start ?? null,
                end: data.prices.nightPeriod.end ?? null,
              }
            : undefined,
          night_rate: data.prices.nightRate,
          monthly_rate: data.prices.monthlyRate,
          car_price: data.prices.carPrice,
          moto_price: data.prices.motoPrice,
          truck_price: data.prices.truckPrice
        },
          { trx }
        )
        return createdParkingId
      })

      return {
        status: true,
        data: { parkingId },
      }
    } catch (error) {
      console.error("ParkingService.register:", error)

      return {
        status: false,
        error: {
          code: ParkingErrorCode.PARKING_CREATE_FAILED,
          message: "Erro ao criar estacionamento",
        },
      }
    }
  }

  async list(id: string, page: number, limit: number): Promise<ServiceResult<PaginatedParkingResult | null, ParkingErrorCode>> {
    try {
      const parking = await Parking.findByIdUser(id, page, limit)
      if (parking?.total === 0) {
          return {
              status: false,
              error: {
                  code: ParkingErrorCode.PARKING_NOT_FOUND,
                  message: "Nenhum estacionamento encontrado",
              },
          }
      }

      return {
        status: true,
        data: parking
      }
    } catch (error) {
        console.error("ParkingService.list error:", error)

        return {
            status: false,
            error: {
                code: ParkingErrorCode.PARKING_FETCH_FAILED,
                message: "Erro interno ao buscar estacionamento",
            },
        }
    }
  }

  async delete(id: string): Promise<ServiceResult<{id: string }, ParkingErrorCode>> {
    try {
      const parkingExist = await Parking.findById(id) 
      if(!parkingExist) {
        return {
            status: false,
            error: {
                code: ParkingErrorCode.PARKING_NOT_FOUND,
                message: "Estacionamento não encontrado",
            },
        }
      }

      const deleted = await Parking.delete(id) 
      if (!deleted) {
        return {
          status: false,
          error: {
            code: ParkingErrorCode.PARKING_REMOVE_FAILED,
            message: "Erro ao remover estacionamento"
          }
        }
      }

      return { status: true, data: {id}}

    } catch (error) {
        console.error("ParkingService.delete error:", error)

        return {
            status: false,
            error: {
                code: ParkingErrorCode.PARKING_REMOVE_FAILED,
                message: "Erro interno ao deletar estacionamento",
            },
        }
    }
  }

  async getById(id: string): Promise<ServiceResult<ParkingEditDTO | null, ParkingErrorCode>> {
    try {
      const parking = await Parking.getParkingById(id)
      if (!parking) {
        return {
          status: false,
          error: {
            code: ParkingErrorCode.PARKING_NOT_FOUND,
            message: "Estacionamento não encontrado"
          }
        }
      }

      return { status: true, data: parking}

    } catch (error) {
        console.error("ParkingService.getById error:", error)

        return {
            status: false,
            error: {
                code: ParkingErrorCode.PARKING_INTERNAL_SERVER_ERROR,
                message: "Erro interno ao buscar estacionamento",
            },
        }
    }
  }

  async update(
  data: ParkingRegisterDTO,
  userId: number,
  id: string
): Promise<ServiceResult<{ parkingId: number }, ParkingErrorCode>> {

  const emailExist = await Contact.emailExist(
    data.contacts.email, id
  )

  if (emailExist) {
    return {
      status: false,
      error: {
        code: ParkingErrorCode.EMAIL_ALREADY_EXISTS,
        message: "Email de contato já existe",
      },
    }
  }

  try {
    await db.transaction(async (trx) => {

      await Parking.update(
        id,
        {
          parking_name: data.parkingName,
          manager_name: data.managerName,
          created_by: userId,
        },
        { trx }
      )

      await Address.update(
      id,
      {
        street: data.address.street,
        number: data.address.number,
        complement: data.address.complement,
        district: data.address.district,
        city: data.address.city,
        state: data.address.state,
        zip_code: data.address.zipCode,
      },
        {
          idField: "parking_id",
          trx,
        }
      )

      await Contact.update(id, {
        phone: data.contacts.phone,
        whatsapp: data.contacts.whatsapp,
        email: data.contacts.email,
        open_hours: data.contacts.openingHours ?? null,
      }, { idField: "parking_id", trx })

      await Operations.update(id, {
        total_spots: data.operations.totalSpots,
        car_spots: data.operations.carSpots,
        moto_spots: data.operations.motoSpots,
        truck_spots: data.operations.truckSpots,
        pcd_spots: data.operations.pcdSpots,
        elderly_spots: data.operations.elderlySpots,
        has_cameras: data.operations.hasCameras,
        has_washing: data.operations.hasWashing,
        area_type: mapAreaTypeToNumber(data.operations.areaType),
      }, { idField: "parking_id", trx })

      await Prices.update(id, {
        price_hour: data.prices.priceHour,
        price_extra_hour: data.prices.priceExtraHour,
        daily_rate: data.prices.dailyRate,
        night_period: data.prices.nightPeriod,
        night_rate: data.prices.nightRate,
        monthly_rate: data.prices.monthlyRate,
        car_price: data.prices.carPrice,
        moto_price: data.prices.motoPrice,
        truck_price: data.prices.truckPrice,
      }, { idField: "parking_id", trx })
    })

    return {
      status: true,
      data: {parkingId: Number(id)},
    }

  } catch (error) {
    console.error("ParkingService.update:", error)

    return {
      status: false,
      error: {
        code: ParkingErrorCode.PARKING_UPDATE_FAILED,
        message: "Erro ao editar estacionamento",
      },
    }
  }
}

  async parkingNames(user_id: string): Promise<ServiceResult<ParkingResponse[], ParkingErrorCode>> {
    try {
      const parking = await Parking.getNames(user_id)
      if (parking.length === 0) {
          return {
              status: false,
              error: {
                  code: ParkingErrorCode.PARKING_NOT_FOUND,
                  message: "Nenhum estacionamento encontrado",
              },
          }
      }

      return {
        status: true,
        data: parking
      }
    } catch (error) {
        console.error("ParkingService.names error:", error)

        return {
            status: false,
            error: {
                code: ParkingErrorCode.PARKING_FETCH_FAILED,
                message: "Erro interno ao buscar estacionamento",
            },
        }
    }
  }
}

export default new ParkingService()
