import { z } from "zod"
import { passwordField } from "./passwordSchema"
import { usernameField } from "./usernameSchema"

export const RegisterSchema = z.object({
  username: usernameField,

  email: z.string().email("Email inválido."),

  password: passwordField,
})
