import { Request, Response } from "express"
import ClientService from "../services/ClientService"
import { userErrorHttpStatusMap } from "../errors/userErrorHttpMapper"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"
import { ClientEditDTO } from "../dtos/ClientEditDTO"

class ClientController {
    async register(request: Request, response: Response): Promise<Response> {
        const result = await ClientService.register(request.body)

        if (!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            userErrorHttpStatusMap
            )

            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(201).json({
            success: true,
            message: "Cliente cadastrado com sucesso",
            data: result.data,
        })
    }


    async getClients(request: Request, response: Response): Promise<Response> {
        const { user_id } = request.params
        const result = await ClientService.findClientsByIdUser(user_id)
        if (!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            userErrorHttpStatusMap
            )

            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})   
    }

    async getClientAndVehicle(request: Request, response: Response): Promise<Response> {
        const { user_id } = request.params
        const result = await ClientService.findClientsAndVehicle(user_id)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            userErrorHttpStatusMap
            )

            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})
    }

    async listClients(request: Request, response: Response): Promise<Response> {
        const { user_id } = request.params
        const page = Number(request.query.page ?? 1)
        const limit = Number(request.query.limit ?? 3)
        const result = await ClientService.listClients(user_id, page, limit)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            userErrorHttpStatusMap
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
        const result = await ClientService.removeClient(id)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            userErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error?.message,
            })
        }
        return response.status(200).json({success: true, message: "Cliente removido com sucesso", data: {clientId: result.data?.client_id}})
    }


    async edit(request: Request, response: Response): Promise<Response> {
        const { id } = request.params
        const data: ClientEditDTO = request.body
        const result = await ClientService.edit(id, data)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            userErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error?.message,
            })
        }
        return response.status(200).json({success: true, message: "Cliente atualizado com sucesso", data: {ClientId: result.data?.client_id}})
    }

    async getById(request: Request, response: Response): Promise<Response> {
        const { id } = request.params
        const result = await ClientService.findById(id)
        if(!result.status) {
          const httpStatus = getHttpStatusFromError(
            result.error!.code,
            userErrorHttpStatusMap
          )
          return response.status(httpStatus).json({success: false, message: result.error?.message})
        }
    
        return response.status(200).json({success: true, data: result.data})
    }
}


export default new ClientController()
