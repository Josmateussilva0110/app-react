import { z } from "zod";                   
import { productSchema } from "@app/shared";

export const productFormSchema = productSchema.extend({
  price: z
    .string()
    .min(1, "O preço é obrigatório")
    .transform((value) => {
      const normalized = value.replace(/\./g, "").replace(",", ".");
      return Number(normalized);
    })
    .refine((value: number) => !isNaN(value), "O preço deve ser um número válido"), 

  priority:    productSchema.shape.priority.catch("media"),
  paymentType: productSchema.shape.paymentType.catch("nao_comprado"),
  category:    productSchema.shape.category.catch("compras"),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormData  = z.output<typeof productFormSchema>;
