import { Request, Response } from "express"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"
import { productErrorHttpStatusMap } from "../errors/productErrorHttpMapper"
import ProductService from "../services/ProductService"

class ProductController {
  async create(request: Request, response: Response) {
    const userId = request.user.id 
    const result = await ProductService.create({ ...request.body, userId })

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error!.code,
        productErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error?.message,
      })
    }

    return response.status(201).json({
      success: true,
      message: "Produto cadastrado com sucesso",
      data: result.data,
    })
  }
}

export default new ProductController()
