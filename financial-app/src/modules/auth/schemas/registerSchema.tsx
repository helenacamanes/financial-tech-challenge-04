import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Digite seu nome completo")
      .max(120, "Nome muito longo"),
    email: z
      .string()
      .min(1, "O e-mail é obrigatório")
      .email("Digite um e-mail válido"),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres")
      .max(128, "Senha muito longa"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "Você precisa aceitar os termos",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
