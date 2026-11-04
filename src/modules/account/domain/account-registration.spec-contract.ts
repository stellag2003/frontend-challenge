import { z } from "zod";

/**
 * Contrato de domínio (spec) para criação de conta de colecionador.
 * Esta é a fonte única de verdade das regras de validação: UI, use case
 * e testes consomem o mesmo schema, evitando divergência entre camadas.
 */
export const accountRegistrationSpec = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Informe seu nome completo.")
      .max(120, "Nome muito longo."),
    email: z
      .string()
      .trim()
      .min(1, "Informe seu e-mail.")
      .email("Informe um e-mail válido."),
    password: z
      .string()
      .min(8, "A senha deve ter no mínimo 8 caracteres.")
      .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
      .regex(/[0-9]/, "A senha deve conter ao menos um número."),
    confirmPassword: z.string().min(1, "Confirme sua senha."),
    acceptsTerms: z.boolean().refine((value) => value === true, {
      message: "Você precisa aceitar os termos de uso.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type AccountRegistrationInput = z.infer<typeof accountRegistrationSpec>;

export type NewCollectorAccount = Omit<AccountRegistrationInput, "confirmPassword" | "acceptsTerms">;
