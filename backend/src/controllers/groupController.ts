import { Request, Response } from "express"
import { createGroupSchema, joinGroupSchema, updateGroupSchema } from "@app/shared"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"
import { groupErrorHttpStatusMap } from "../errors/groupErrorHttpMapper"
import GroupService from "../services/GroupService"

class GroupController {
    async getMe(request: Request, response: Response) {
        const userId = request.user.id
        const result = await GroupService.getMe(userId)

        if (!result.status) {
            const httpStatus = getHttpStatusFromError(result.error.code, groupErrorHttpStatusMap)
            return response.status(httpStatus).json({ success: false, message: result.error.message })
        }

        return response.status(200).json({ success: true, data: result.data })
    }

    async create(request: Request, response: Response) {
        const parsed = createGroupSchema.safeParse(request.body)
        if (!parsed.success) {
            return response.status(422).json({
                success: false,
                message: "Dados inválidos.",
                errors: parsed.error.issues,
            })
        }

        const userId = request.user.id
        const result = await GroupService.create(userId, parsed.data.name)

        if (!result.status) {
            const httpStatus = getHttpStatusFromError(result.error.code, groupErrorHttpStatusMap)
            return response.status(httpStatus).json({ success: false, message: result.error.message })
        }

        return response.status(201).json({
            success: true,
            message: "Grupo criado com sucesso.",
            data: result.data,
        })
    }

    async update(request: Request, response: Response) {
        const parsed = updateGroupSchema.safeParse(request.body)
        if (!parsed.success) {
            return response.status(422).json({
                success: false,
                message: "Dados inválidos.",
                errors: parsed.error.issues,
            })
        }

        const userId = request.user.id
        const result = await GroupService.update(userId, parsed.data.name)

        if (!result.status) {
            const httpStatus = getHttpStatusFromError(result.error.code, groupErrorHttpStatusMap)
            return response.status(httpStatus).json({ success: false, message: result.error.message })
        }

        return response.status(200).json({
            success: true,
            message: "Grupo atualizado com sucesso.",
            data: result.data,
        })
    }

    async createInvite(request: Request, response: Response) {
        const userId = request.user.id
        const result = await GroupService.createInvite(userId)

        if (!result.status) {
            const httpStatus = getHttpStatusFromError(result.error.code, groupErrorHttpStatusMap)
            return response.status(httpStatus).json({ success: false, message: result.error.message })
        }

        return response.status(201).json({
            success: true,
            message: "Convite gerado com sucesso.",
            data: result.data,
        })
    }

    async join(request: Request, response: Response) {
        const parsed = joinGroupSchema.safeParse(request.body)
        if (!parsed.success) {
            return response.status(422).json({
                success: false,
                message: "Código inválido.",
                errors: parsed.error.issues,
            })
        }

        const userId = request.user.id
        const result = await GroupService.join(userId, parsed.data.code)

        if (!result.status) {
            const httpStatus = getHttpStatusFromError(result.error.code, groupErrorHttpStatusMap)
            return response.status(httpStatus).json({ success: false, message: result.error.message })
        }

        return response.status(200).json({
            success: true,
            message: "Você entrou no grupo.",
            data: result.data,
        })
    }

    async leave(request: Request, response: Response) {
        const userId = request.user.id
        const result = await GroupService.leave(userId)

        if (!result.status) {
            const httpStatus = getHttpStatusFromError(result.error.code, groupErrorHttpStatusMap)
            return response.status(httpStatus).json({ success: false, message: result.error.message })
        }

        return response.status(200).json({ success: true, message: "Você saiu do grupo." })
    }
}

export default new GroupController()
