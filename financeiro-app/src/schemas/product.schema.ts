import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "O nome do produto é obrigatório")
    .min(3, "O nome deve ter no mínimo 3 caracteres"),

  price: z
    .string()
    .min(1, "O preço é obrigatório")
    .refine((value) => !isNaN(parseFloat(value)), "O preço deve ser um número válido")
    .transform((value) => parseFloat(value)),

  priority: z
    .enum(["alta", "media", "baixa"])
    .catch("media"),

  paymentType: z
    .enum(["debito", "credito", "pix", "dinheiro", "nao_comprado"])
    .catch("nao_comprado"),

  category: z
    .enum(["compras", "alimentacao", "lazer", "esporte", "investimento", "saude", "presentes"])
    .catch("compras"),

  date: z
    .string()
    .min(1, "A data é obrigatória")
    .refine(
      (value) => {
        // Validar formato DD/MM/YYYY
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!regex.test(value)) return false;

        const [, day, month, year] = value.match(regex) || [];
        const date = new Date(`${year}-${month}-${day}`);

        return date instanceof Date && !isNaN(date.getTime());
      },
      "Data inválida (use o formato DD/MM/YYYY)"
    ),

  finished: z.boolean(),

  monthList: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;
