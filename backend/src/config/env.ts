import { z } from "zod"

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3001),
    SUPABASE_URL: z.url("SUPABASE_URL inválida"),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY ausente"),
    // origens permitidas separadas por vírgula no .env
    // ex: ALLOWED_ORIGINS=http://localhost:8081,https://seuapp.com
    ALLOWED_ORIGINS: z
        .string()
        .transform((val) => val.split(",").map((s) => s.trim())),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error("❌ Variáveis de ambiente inválidas:")
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
}

export const env = parsed.data
