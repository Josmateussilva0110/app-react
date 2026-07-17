import { Request, Response } from "express"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"
import { goalErrorHttpStatusMap } from "../errors/goalErrorHttpMapper"
import GoalService from "../services/GoalService"

class GoalController {
    async get(request: Request, response: Response) {
        const userId = request.user.id
        const result = await GoalService.get(userId)

        if (!result.status) {
            const httpStatus = getHttpStatusFromError(
                result.error.code,
                goalErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error.message,
            })
        }

        return response.status(200).json({
            success: true,
            data: result.data,
        })
    }

    async update(request: Request, response: Response) {
        const userId = request.user.id
        const { monthlyGoal } = request.body

        const result = await GoalService.update(monthlyGoal, userId)

        if (!result.status) {
            const httpStatus = getHttpStatusFromError(
                result.error.code,
                goalErrorHttpStatusMap
            )
            return response.status(httpStatus).json({
                success: false,
                message: result.error.message,
            })
        }

        return response.status(200).json({
            success: true,
            message: "Meta atualizada com sucesso",
            data: result.data,
        })
    }
}

export default new GoalController()
