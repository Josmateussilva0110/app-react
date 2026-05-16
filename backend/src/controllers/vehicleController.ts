import { Request, Response } from "express"
import VehicleService from "../services/VehicleService"
import { vehicleErrorHttpStatusMap } from "../errors/vehicleErrorHttpMapper"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"
import { VehicleEditDTO } from "../dtos/VehicleEditDTO"

class VehicleController {
    async registerVehicle(request: Request, response: Response): Promise<Response> {
        const result = await VehicleService.registerVehicle(request.body)
        if (!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            vehicleErrorHttpStatusMap
            )

            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(201).json({
            success: true,
            message: "Veiculo cadastrado com sucesso",
            data: result.data
        })
    }


    async listVehicle(request: Request, response: Response): Promise<Response> {
        const { user_id } = request.params
        const page = Number(request.query.page ?? 1)
        const limit = Number(request.query.limit ?? 3) 
        const result = await VehicleService.listVehicles(user_id, page, limit)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            vehicleErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error?.message,
            })
        }
        return response.status(200).json({success: true, data: result.data})
    }


    async removeVehicle(request: Request, response: Response): Promise<Response> {
        const { id } = request.params
        const result = await VehicleService.removeVehicle(id)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            vehicleErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error?.message,
            })
        }
        return response.status(200).json({success: true, message: "Veículo removido com sucesso", data: {vehicleId: result.data?.vehicle_id}})
    }


    async getVehicleDetail(request: Request, response: Response): Promise<Response> {
        const { id } = request.params
        const result = await VehicleService.vehicleDetail(id)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            vehicleErrorHttpStatusMap
          )
          return response.status(httpStatus).json({success: false, message: result.error?.message})
        }
        return response.status(200).json({success: true, data: result.data})
    }

    async editVehicle(request: Request, response: Response): Promise<Response> {
        const { id } = request.params
        const data: VehicleEditDTO = request.body
        const result = await VehicleService.editVehicle(id, data)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            vehicleErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error?.message,
            })
        }
        return response.status(200).json({success: true, message: "Veículo atualizado com sucesso", data: {vehicleId: result.data?.vehicle_id}})
    }
}


export default new VehicleController()
