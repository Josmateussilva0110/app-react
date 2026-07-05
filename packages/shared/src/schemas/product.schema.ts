import { z } from "zod";

export const priorityEnum    = z.enum(["alta", "media", "baixa"]);
export const paymentTypeEnum = z.enum(["debito", "credito", "pix", "dinheiro", "nao_comprado"]);
export const categoryEnum    = z.enum(["casa", "alimentacao", "lazer", "esporte", "vestuario", "eletronicos", "cuidados_pessoais",
                                       "investimento", "saude", "presentes"]);

export const productSchema = z.object({
  name:        z.string().min(3, "O nome deve ter no mínimo 3 caracteres").max(100, "O nome deve ter no máximo 100 caracteres"),
  price: z.number({ error: "O preço deve ser um número" }).positive("O preço deve ser positivo").max(1000000, "O preço deve ser menor que 1.000.000"),
  priority:    priorityEnum,
  paymentType: paymentTypeEnum,
  category:    categoryEnum,
  date:        z.string().refine((value) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(value)) return false;
    const [, day, month, year] = value.match(regex)!;
    const date = new Date(`${year}-${month}-${day}`);
    return !isNaN(date.getTime());
  }, "Data inválida (use DD/MM/YYYY)"),
  finished:  z.boolean(),
  monthList: z.boolean(),
});

/** Schema for the product as returned by the API */
export const productResponseSchema = z.object({
  id:           z.string(),
  name:         z.string(),
  user_id:      z.string(),
  price:        z.number(),
  priority:     priorityEnum,
  payment_type: paymentTypeEnum,
  category:     categoryEnum,
  date:         z.string(),
  finished:     z.boolean(),
  month_list:   z.union([z.boolean(), z.string()]),
  user_name:    z.string(),
  created_at:   z.string(),
  updated_at:   z.string(),
});

export type CreateProductDTO = z.infer<typeof productSchema>;
export type ProductResponse  = z.infer<typeof productResponseSchema>;

export interface CreateProductInput extends CreateProductDTO {
    userId: string
}

export interface UpdateProductInput extends CreateProductDTO {
    id: string
    userId: string
}
