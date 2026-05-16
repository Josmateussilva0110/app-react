import { z } from "zod"

const requiredSelect = (message: string) =>
  z
    .number()
    .refine((val) => Number.isInteger(val) && val > 0, {
      message,
    })


export const AllocationSchema = z.object({
  client_id: requiredSelect("Selecione um cliente"),

  parking_id: requiredSelect("Selecione um estacionamento"),

  vehicle_id: requiredSelect("Selecione um veículo"),

  vehicle_type: requiredSelect("Selecione uma vaga"),

  entry_date: z
    .string()
    .min(1, "Data de entrada é obrigatória")
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), {
      message: "Data de entrada inválida",
    }),

  payment_type: z
  .string()
  .min(1, "Selecione a forma de pagamento"),


  observations: z
    .string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),
})
