import { z } from "zod"

export const HoursSchema = z.object({
  start: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário inicial inválido"),
  end: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Horário final inválido"),
})
