import { Request, Response } from "express"
import { getHttpStatusFromError } from "../utils/getHttpStatusFromError"
import { productErrorHttpStatusMap } from "../errors/productErrorHttpMapper"
import ProductService from "../services/ProductService"
import { z } from "zod"


const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})



class ProductController {
  async create(request: Request, response: Response) {
    const userId = request.user.id
    const result = await ProductService.create({ ...request.body, userId })

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
    const parsedQuery = paginationSchema.safeParse(request.query);

    if (!parsedQuery.success) {
      return response.status(422).json({
        success: false,
        message: "Parâmetros de paginação inválidos.",
        errors: parsedQuery.error.issues,
      });
    }

    const { page, limit } = parsedQuery.data;

    const result = await ProductService.getAll({ page, limit,});

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
      data: result.data.items,
      meta: result.data.meta,
    });
  }
}


export default new ProductController()
