import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um e-mail válido"),

  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "O nome é obrigatório")
      .min(3, "O nome deve ter no mínimo 3 caracteres"),

    email: z
      .string()
      .min(1, "O e-mail é obrigatório")
      .email("Digite um e-mail válido"),

    password: z
      .string()
      .min(6, "A senha deve ter no mínimo 6 caracteres")
      .max(50, "A senha é muito longa"),

    confirmPassword: z
      .string()
      .min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

