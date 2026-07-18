import { Request, Response } from "express"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"
import { productErrorHttpStatusMap } from "../errors/productErrorHttpMapper"
import ProductService from "../services/ProductService"
import { productListQuerySchema, statsQuerySchema } from "@app/shared"
import { ProductIdParam } from "../types/product/product-id-param"


class ProductController {
  async create(request: Request, response: Response) {
    const userId = request.user.id
    const result = await ProductService.create({ ...request.body, userId }, request.scope)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(201).json({
      success: true,
      message: "Produto cadastrado com sucesso",
      data: result.data,
    })
  }

  async getAll(request: Request, response: Response) {
    const parsedQuery = productListQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      return response.status(422).json({
        success: false,
        message: "Parâmetros de listagem inválidos.",
        errors: parsedQuery.error.issues,
      });
    }

    const result = await ProductService.getAll(parsedQuery.data, request.scope)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
      );

      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      });
    }

    return response.status(200).json({
      success: true,
      data: result.data,
    });
  }

  async getStats(request: Request, response: Response) {
    const parsedQuery = statsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      return response.status(422).json({
        success: false,
        message: "Parâmetros de estatísticas inválidos.",
        errors: parsedQuery.error.issues,
      });
    }

    const result = await ProductService.getStats(parsedQuery.data, request.scope)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
      );

      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      });
    }

    return response.status(200).json({
      success: true,
      data: result.data,
    });
  }

  async update(request: Request, response: Response) {
    const userId = request.user.id
    const { id } = request.params as ProductIdParam

    const result = await ProductService.update({ ...request.body, id, userId })

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Produto atualizado com sucesso",
      data: result.data,
    })
  }

  async delete(request: Request, response: Response) {
    const userId = request.user.id
    const { id } = request.params as ProductIdParam

    const result = await ProductService.delete(id, userId)

    if (!result.status) {
      const httpStatus = getHttpStatusFromError(
        result.error.code,
        productErrorHttpStatusMap
      )
      return response.status(httpStatus).json({
        success: false,
        message: result.error.message,
      })
    }

    return response.status(200).json({
      success: true,
      message: "Produto removido com sucesso",
    })
  }
}


export default new ProductController()
