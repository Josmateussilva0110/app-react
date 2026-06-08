import { ServiceResult } from "../types/serviceResults/ServiceResult"
import { supabase } from "../database/supabase/supabase"
import { CreateProductDTO } from "@app/shared"
import { ProductErrorCode } from "../types/code/productCode"

export interface CreateProductInput extends CreateProductDTO {
  userId: string
}

class ProductService {
    async create(data: CreateProductInput): Promise<ServiceResult<{ id: string }, ProductErrorCode>> {
        try {
            const { name, price, priority, paymentType, category, date, finished, monthList } = data

            const [day, month, year] = date.split("/")
            const isoDate = `${year}-${month}-${day}`

            const { data: product, error } = await supabase
                .from("products")
                .insert({
                    user_id: data.userId,  // snake_case
                    name,
                    price,
                    priority,
                    payment_type: paymentType,  // camelCase → snake_case
                    category,
                    date: isoDate,
                    finished,
                    month_list: monthList,    // camelCase → snake_case
                })
                .select("id")
                .single()

            if (error) {
                console.error("[ProductService.register] Supabase error:", error)
                return {
                    status: false,
                    error: {
                        code: ProductErrorCode.PRODUCT_CREATE_FAILED,
                        message: "Não foi possível cadastrar o produto. Tente novamente.",
                    },
                }
            }

            return {
                status: true,
                data: { id: product.id },
            }

        } catch (error) {
            console.error("[ProductService.register] error:", error)
            return {
                status: false,
                error: {
                    code: ProductErrorCode.PRODUCT_CREATE_FAILED,
                    message: "Não foi possível cadastrar o produto. Tente novamente.",
                },
            }
        }
    }
}

export default new ProductService()
