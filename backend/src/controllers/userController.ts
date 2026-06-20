import { Request, Response } from "express"
import UserService from "../services/UserService"
import { userErrorHttpStatusMap } from "../errors/userErrorHttpMapper"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"

class UserController {
  async register(request: Request, response: Response): Promise<Response> {
    const result = await UserService.register(request.body)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        userErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
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
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        userErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
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
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        userErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Logout realizado com sucesso",
    })
  }

  async refresh(request: Request, response: Response): Promise<Response> {
    const { refreshToken } = request.body

    if (!refreshToken) {
      return response.status(400).json({
        success: false,
        message: "refreshToken é obrigatório.",
      })
    }

    const result = await UserService.refresh(refreshToken)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        userErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Sessão renovada com sucesso.",
      data: result.data,
    })
  }
}

export default new UserController()
