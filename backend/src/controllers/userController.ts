import { Request, Response } from "express"
import UserService from "../services/UserService"
import { userErrorHttpStatusMap } from "../errors/userErrorHttpMapper"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"

class UserController {
  async register(request: Request, response: Response): Promise<Response> {
    const result = await UserService.register(request.body)

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

    request.session.user = result.data

    return response.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso",
      data: result.data,
    })
  }

  async login(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body
    const result = await UserService.login(email, password)
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

    request.session.user = result.data

    return response.status(200).json({
      success: true,
      message: "Login Realizado com sucesso",
      data: result.data,
    })
  }


  async getById(request: Request, response: Response): Promise<Response> {
    const { id } = request.params
    const result = await UserService.findById(id)
    if(!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error!.code,
        userErrorHttpStatusMap
      )
      return response.status(httpStatus).json({success: false, message: result.error?.message})
    }

    return response.status(200).json({success: true, data: result.data})
  }

  async session(request: Request, response: Response): Promise<Response> {
    if (request.session && request.session.user) {
        return response.status(200).json({ success: true, data: request.session.user })
    } else {
        return response.status(401).json({ success: false, message: "Usuário não autenticado" })
    }
  }

  async logout(request: Request, response: Response): Promise<Response> {
    if (!request.session) {
      return response
        .status(400)
        .json({ success: false, message: "Nenhuma sessão ativa" })
    }

    return new Promise((resolve) => {
      request.session.destroy(err => {
        if (err) {
          resolve(
            response
              .status(500)
              .json({ success: false, message: "Erro ao sair" })
          )
          return
        }

        response.clearCookie("connect.sid")
        resolve(
          response
            .status(200)
            .json({ success: true, message: "Logout feito com sucesso" })
        )
      })
    })
  }
}

export default new UserController()
