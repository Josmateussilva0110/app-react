import { Request, Response } from "express"
import StatsService from "../services/StatsService"
import { statsErrorHttpStatusMap } from "../errors/statsErrorHttpMapper" 
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"


class StatsController {
    async getKpiParking(request: Request, response: Response): Promise<Response> {
        const userId = request.session.user?.id
        const result = await StatsService.parkingStats(String(userId))
        if (!result.status) {
            const httpStatus = getHttpStatusFromError(
            result.error!.code,
            statsErrorHttpStatusMap
            )

            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})   
    }

    async getRevenue(request: Request, response: Response): Promise<Response> {
        const userId = request.session.user?.id
        const result = await StatsService.revenueCard(String(userId))
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(result.error!.code, statsErrorHttpStatusMap)
            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})
    }

    async getOccupied(request: Request, response: Response): Promise<Response> {
        const userId = request.session.user?.id
        const result = await StatsService.countOccupied(String(userId))
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(result.error!.code, statsErrorHttpStatusMap)
            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})
    }

    async getRevenueByDay(request: Request, response: Response): Promise<Response> {
        const userId = request.session.user?.id
        const result = await StatsService.revenueByDay(String(userId))
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(result.error!.code, statsErrorHttpStatusMap)
            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})
    }

    async getVehiclesType(request: Request, response: Response): Promise<Response> {
        const userId = request.session.user?.id
        const result = await StatsService.countVehicleType(String(userId))
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(result.error!.code, statsErrorHttpStatusMap)
            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})
    }

    async getRecentsAllocations(request: Request, response: Response): Promise<Response> {
        const userId = request.session.user?.id
        const result = await StatsService.recents(String(userId))
        if(!result.status) {
            const httpStatus = getHttpStatusFromError(result.error!.code, statsErrorHttpStatusMap)
            return response.status(httpStatus).json({
            success: false,
            message: result.error?.message,
            })
        }

        return response.status(200).json({success: true, data: result.data})
    }
}


export default new StatsController()
