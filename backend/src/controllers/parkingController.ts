import { Request, Response } from "express"
import { ParkingRegisterDTO } from "../dtos/ParkingRegisterDTO"
import ParkingService from "../services/ParkingService"
import { ParkingErrorHttpStatusMap } from "../errors/parkingErrorHttpMapper"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"

class ParkingController {
  async register(request: Request, response: Response): Promise<Response> {
      const data: ParkingRegisterDTO = request.body

      const userId = request.session.user?.id
      if (!userId) {
        return response.status(401).json({
          success: false,
          message: "Usuário não autenticado",
        })
      }

      const result = await ParkingService.register(data, userId)

      if (!result.status) {
          const httpStatus = getHttpStatusFromError(
            result.error!.code,
            ParkingErrorHttpStatusMap
          )
        return response.status(httpStatus).json({
          success: false,
          message: result.error!.message ?? "Erro ao processar requisição",
        })
      }

      return response.status(201).json({
        success: true,
        message: "Estacionamento cadastrado com sucesso",
        data: {parkingId: result.data?.parkingId}
      })
  }

  async list(request: Request, response: Response): Promise<Response> {
    const { id } = request.params
    const page = Number(request.query.page ?? 1)
    const limit = Number(request.query.limit ?? 3)
    const result = await ParkingService.list(id, page, limit)

      if (!result.status) {
          const httpStatus = getHttpStatusFromError(
            result.error!.code,
            ParkingErrorHttpStatusMap
          )
        return response.status(httpStatus).json({
          success: false,
          message: result.error?.message,
        })
      }

      return response.status(200).json({
        success: true,
        data: result.data
      })
  }

  async remove(request: Request, response: Response): Promise<Response> {
    const { id } = request.params
    const result = await ParkingService.delete(id)
    if(!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error!.code,
        ParkingErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error?.message,
      })
    }
    
    return response.status(200).json({
      success: true,
      message: "Estacionamento removido com sucesso",
      data: {parkingId: result.data?.id}
    })
  }

  async getParking(request: Request, response: Response): Promise<Response> {
    const { id } = request.params
    const result = await ParkingService.getById(id)
    if(!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error!.code,
        ParkingErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error?.message,
      })
    }
    return response.status(200).json({
      success: true,
      data: result.data
    })
  }

  async edit(request: Request, response: Response): Promise<Response> {
    const data: ParkingRegisterDTO = request.body
    const { id } = request.params

    const userId = request.session.user?.id
    if (!userId) {
      return response.status(401).json({
        success: false,
        message: "Usuário não autenticado",
      })
    }

    const result = await ParkingService.update(data, userId, id)

    if (!result.status) {
        const httpStatus = getHttpStatusFromError(
          result.error!.code,
          ParkingErrorHttpStatusMap
        )
      return response.status(httpStatus).json({
        success: false,
        message: result.error!.message ?? "Erro ao processar requisição",
      })
    }

    return response.status(201).json({
      success: true,
      message: "Estacionamento editado com sucesso",
      data: {parkingId: result.data?.parkingId}
    })
  }

  async getParkingNames(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.params
    const result = await ParkingService.parkingNames(user_id)

      if (!result.status) {
          const httpStatus = getHttpStatusFromError(
            result.error!.code,
            ParkingErrorHttpStatusMap
          )
        return response.status(httpStatus).json({
          success: false,
          message: result.error?.message,
        })
      }

      return response.status(200).json({
        success: true,
        data: result.data
      })
  }
}


export default new ParkingController()
