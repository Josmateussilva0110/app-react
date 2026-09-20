import { Request, Response } from "express"
import UserService from "../services/UserService"
import { userErrorHttpStatusMap } from "../errors/userErrorHttpMapper"
import { sendFailure } from "../utils/sendFailure"

class UserController {
  async register(request: Request, response: Response): Promise<Response> {
    const result = await UserService.register(request.body)

    if (!result.status) {
      return sendFailure(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso",
      data: result.data,
    })
  }

  async login(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body
    const result = await UserService.login(email, password)
    if (!result.status) {
      return sendFailure(response, result.error, userErrorHttpStatusMap)
    }


    return response.status(200).json({
      success: true,
      message: "Login Realizado com sucesso",
      data: result.data,
    })
  }

  async logout(request: Request, response: Response): Promise<Response> {

    const result = await UserService.logout(request.accessToken!)

    if (!result.status) {
      return sendFailure(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Logout realizado com sucesso",
    })
  }

  async refresh(request: Request, response: Response): Promise<Response> {
    const { refreshToken } = request.body

    const result = await UserService.refresh(refreshToken)

    if (!result.status) {
      return sendFailure(response, result.error, userErrorHttpStatusMap, { exposeCode: true })
    }

    return response.status(200).json({
      success: true,
      message: "Sessão renovada com sucesso.",
      data: result.data,
    })
  }

  async getProfile(request: Request, response: Response): Promise<Response> {
    const userId = request.user.id

    const result = await UserService.getProfile(userId)

    if (!result.status) {
      return sendFailure(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      data: result.data,
    })
  }

  async updateProfile(request: Request, response: Response): Promise<Response> {
    const userId = request.user.id
    const { username } = request.body

    const result = await UserService.updateProfile(userId, { username })

    if (!result.status) {
      return sendFailure(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Perfil atualizado com sucesso.",
      data: result.data,
    })
  }

  async changePassword(request: Request, response: Response): Promise<Response> {
    const userId = request.user.id
    const result = await UserService.changePassword(userId, request.body, request.accessToken)

    if (!result.status) {
      return sendFailure(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Senha atualizada com sucesso.",
      data: result.data,
    })
  }

  async requestPasswordReset(request: Request, response: Response): Promise<Response> {
    const { identifier } = request.body
    const result = await UserService.requestPasswordReset(identifier)

    if (!result.status) {
      return sendFailure(response, result.error, userErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Solicitação registrada.",
    })
  }
}

export default new UserController()
