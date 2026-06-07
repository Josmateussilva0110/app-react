import { Request, Response } from "express"
import UserService from "../services/UserService"
import { userErrorHttpStatusMap } from "../errors/userErrorHttpMapper"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"

class ProductController {
  async create(request: Request, response: Response) {
    console.log("ProductController.create called with body:", request.body);
    /*const result = await UserService.register(request.body)

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
      message: "Usuário cadastrado com sucesso",
      data: result.data,
    })*/
  }
}

export default new ProductController()
