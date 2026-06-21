import path from "path"
import { config } from "dotenv"
import { z } from "zod"

config({ path: path.resolve(__dirname, "../../../.env") }) 

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3001),
    SUPABASE_URL: z.url("SUPABASE_URL inválida"),
    SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY ausente").optional(),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY ausente"),
    ALLOWED_ORIGINS: z
        .string()
        .default("http://localhost:8081")
        .transform((val) => val.split(",").map((s) => s.trim())),
}).transform((data) => {
    const anonKey = data.SUPABASE_ANON_KEY ?? data.EXPO_PUBLIC_SUPABASE_ANON_KEY
    if (!anonKey) {
        throw new z.ZodError([{
            code: "custom",
            path: ["SUPABASE_ANON_KEY"],
            message: "Defina SUPABASE_ANON_KEY ou EXPO_PUBLIC_SUPABASE_ANON_KEY",
        }])
    }
    const { EXPO_PUBLIC_SUPABASE_ANON_KEY: _, ...rest } = data
    return { ...rest, SUPABASE_ANON_KEY: anonKey }
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error("❌ Variáveis de ambiente inválidas:")
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
}

export const env = parsed.data
