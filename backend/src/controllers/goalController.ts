import { Request, Response } from "express"
import { sendFailure } from "../utils/sendFailure"
import { goalErrorHttpStatusMap } from "../errors/goalErrorHttpMapper"
import GoalService from "../services/GoalService"

class GoalController {
    async get(request: Request, response: Response) {
        const userId = request.user.id
        const result = await GoalService.get(userId, request.scope)

        if (!result.status) {
            return sendFailure(response, result.error, goalErrorHttpStatusMap)
        }

        return response.status(200).json({
            success: true,
            data: result.data,
        })
    }

    async update(request: Request, response: Response) {
        const userId = request.user.id
        const { monthlyGoal } = request.body

        const result = await GoalService.update(monthlyGoal, userId, request.scope)

        if (!result.status) {
            return sendFailure(response, result.error, goalErrorHttpStatusMap)
        }

        return response.status(200).json({
            success: true,
            message: "Meta atualizada com sucesso",
            data: result.data,
        })
    }
}

export default new GoalController()
