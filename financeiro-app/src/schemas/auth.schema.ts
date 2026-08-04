import { z } from "zod";

const USERNAME_PATTERN = /^[a-zA-ZÀ-ÿ0-9._ -]+$/;

const usernameField = z
  .string()
  .trim()
  .min(3, "O nome deve ter no mínimo 3 caracteres")
  .max(50, "O nome deve ter no máximo 50 caracteres")
  .regex(USERNAME_PATTERN, "O nome contém caracteres inválidos");

const passwordComplexity = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .max(128, "A senha é muito longa")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um caractere especial");

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um e-mail válido"),

  password: z
    .string()
    .min(1, "A senha é obrigatória")
    .max(128, "A senha é muito longa"),
});

export const registerSchema = z
  .object({
    username: usernameField,

    email: z
      .string()
      .min(1, "O e-mail é obrigatório")
      .email("Digite um e-mail válido"),

    password: passwordComplexity,

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

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um e-mail válido"),
});

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Informe a senha atual")
      .max(128, "A senha é muito longa"),
    new_password: passwordComplexity,
    confirm_password: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "As senhas não coincidem",
    path: ["confirm_password"],
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: "A nova senha deve ser diferente da senha atual",
    path: ["new_password"],
  });

export const requiredChangePasswordSchema = z
  .object({
    new_password: passwordComplexity,
    confirm_password: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "As senhas não coincidem",
    path: ["confirm_password"],
  });

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type RequiredChangePasswordFormData = z.infer<
  typeof requiredChangePasswordSchema
>;
