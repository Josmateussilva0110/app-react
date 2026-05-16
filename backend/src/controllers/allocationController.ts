import { Request, Response } from "express"
import AllocationService from "../services/AllocationService"
import { allocationErrorHttpStatusMap } from "../errors/allocationErrorHttpMapper" 
import { SpotServiceErrorHttpStatusMap } from "../errors/allocationParkingErrorMapper"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"

class AllocationController {
    async getSpots(request: Request, response: Response): Promise<Response> {
        const { user_id } = request.params
        const result = await AllocationService.findSpots(user_id)
        if (!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            SpotServiceErrorHttpStatusMap
            )

            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})   
    }

    async allocation(request: Request, response: Response): Promise<Response> {
        const result = await AllocationService.allocation(request.body)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(result.error!.code, allocationErrorHttpStatusMap)
            return response.status(httpStatus).json({success: false, message: result.error?.message})
        }

        return response.status(201).json({success: true, data: {allocationId: result.data?.id}, message: "Alocação cadastrada com sucesso"})
    }

    async listAllocations(request: Request, response: Response): Promise<Response> {
        const { user_id } = request.params
        const page = Number(request.query.page ?? 1)
        const limit = Number(request.query.limit ?? 3) 
        const result = await AllocationService.getAllocations(user_id, page, limit)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            allocationErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error?.message,
            })
        }
        return response.status(200).json({success: true, data: result.data})
    }

    async getStats(request: Request, response: Response) {
        const { user_id } = request.params
        const result = await AllocationService.allocationStats(user_id)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            allocationErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})
    }

    async removeAllocation(request: Request, response: Response) {
        const { id } = request.params
        const result = await AllocationService.removeAllocation(id)
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            allocationErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, message: "Alocação removido com sucesso", data: {allocationId: result.data?.allocation_id}})
    }
}


export default new AllocationController()
