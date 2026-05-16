import { z } from "zod"
import { HoursSchema } from "./hourSchema"

const numberRequired = (label: string) =>
  z.coerce
    .number({ message: `Informe ${label}` })
    .nonnegative(`${label} deve ser zero ou maior`)

const numberOptional = z
  .union([z.literal(""), z.coerce.number().nonnegative()])
  .optional()

export const ParkingRegisterSchema = z.object({

  parkingName: z.string().min(3, "Nome do estacionamento deve ter mais de 3 caracteres"),

  managerName: z.string().min(3, "Nome do responsável deve ter mais de 3 caracteres"),

  address: z.object({
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    district: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().length(2, "Estado deve ter 2 caracteres"),

    zipCode: z
      .string()
      .transform(value => value.replace(/\D/g, ""))
      .refine(value => value.length === 8, {
        message: "CEP deve conter exatamente 8 dígitos",
      }),

    complement: z.string().optional(),
  }),

  contacts: z.object({
    phone: z
      .string()
      .transform(value => value.replace(/\D/g, ""))
      .refine(value => value.length >= 10 && value.length <= 11, {
        message: "Telefone deve conter 10 ou 11 dígitos",
      }),

    whatsapp: z
      .string()
      .transform(value => value.replace(/\D/g, ""))
      .refine(value => value.length === 11, {
        message: "WhatsApp deve conter 11 dígitos (DDD + número)",
      }),

    email: z.email("Email inválido"),

    openingHours: HoursSchema,
  }),

  operations: z
    .object({

      totalSpots: z
        .coerce
        .number()
        .int("Total de vagas deve ser inteiro")
        .positive("Total de vagas deve ser maior que zero"),

      carSpots: numberRequired("vagas de carro"),

      motoSpots: numberOptional,

      truckSpots: numberOptional,

      pcdSpots: numberOptional,

      elderlySpots: numberOptional,

      hasCameras: z.boolean(),

      hasWashing: z.boolean(),

      areaType: z.enum(["coberta", "descoberta", "mista"]),
    })
    .refine((data) => {

      const moto = Number(data.motoSpots || 0)
      const truck = Number(data.truckSpots || 0)
      const pcd = Number(data.pcdSpots || 0)
      const elderly = Number(data.elderlySpots || 0)

      return (
        data.carSpots +
        moto +
        truck +
        pcd +
        elderly ===
        data.totalSpots
      )
    }, {
      message: "A soma das vagas deve ser igual ao total de vagas",
      path: ["totalSpots"],
    }),

  prices: z
    .object({

      priceHour: numberRequired("valor da hora"),

      priceExtraHour: numberRequired("valor da hora extra"),

      dailyRate: numberOptional,

      monthlyRate: numberOptional,

      carPrice: numberOptional,

      motoPrice: numberOptional,

      truckPrice: numberOptional,

      nightRate: numberOptional,

      nightPeriod: HoursSchema.optional(),
    })

    .superRefine((data, ctx) => {

      const hasNightRate =
        data.nightRate !== undefined &&
        data.nightRate !== "" &&
        data.nightRate !== 0

      const hasNightPeriod =
        data.nightPeriod &&
        data.nightPeriod.start !== "" &&
        data.nightPeriod.end !== ""

      if (hasNightRate && !hasNightPeriod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o período noturno ao definir a tarifa noturna",
          path: ["nightPeriod"],
        })
      }

      if (hasNightPeriod && !hasNightRate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe a tarifa noturna ao definir o período noturno",
          path: ["nightRate"],
        })
      }
    }),
})