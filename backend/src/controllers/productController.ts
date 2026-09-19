import { Request, Response } from "express"
import { sendFailure } from "../utils/sendFailure"
import { productErrorHttpStatusMap } from "../errors/productErrorHttpMapper"
import ProductService from "../services/ProductService"
import { productListQuerySchema, statsQuerySchema } from "@app/shared"


class ProductController {
  async create(request: Request, response: Response) {
    const userId = request.user.id
    const result = await ProductService.create({ ...request.body, userId }, request.scope)

    if (!result.status) {
      return sendFailure(response, result.error, productErrorHttpStatusMap)
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
      return sendFailure(response, result.error, productErrorHttpStatusMap);
    }

    return response.status(200).json({
      success: true,
      data: result.data,
    });
  }

  async getPeriods(request: Request, response: Response) {
    const result = await ProductService.getPeriods(request.scope)

    if (!result.status) {
      return sendFailure(response, result.error, productErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      data: result.data,
    })
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
      return sendFailure(response, result.error, productErrorHttpStatusMap);
    }

    return response.status(200).json({
      success: true,
      data: result.data,
    });
  }

  async update(request: Request, response: Response) {
    const userId = request.user.id
    const id = String(request.params.id)

    const result = await ProductService.update({ ...request.body, id, userId }, request.scope)

    if (!result.status) {
      return sendFailure(response, result.error, productErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Produto atualizado com sucesso",
      data: result.data,
    })
  }

  async delete(request: Request, response: Response) {
    const userId = request.user.id
    const id = String(request.params.id)

    const result = await ProductService.delete(id, userId, request.scope)

    if (!result.status) {
      return sendFailure(response, result.error, productErrorHttpStatusMap)
    }

    return response.status(200).json({
      success: true,
      message: "Produto removido com sucesso",
    })
  }
}


export default new ProductController()
