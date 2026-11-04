import { describe, expect, it } from "vitest";

import { accountRegistrationSpec } from "./account-registration.spec-contract";

const validInput = {
  fullName: "Ana Ravache",
  email: "ana.ravache@example.com",
  password: "Senha123",
  confirmPassword: "Senha123",
  acceptsTerms: true as const,
};

describe("accountRegistrationSpec", () => {
  it("aceita um cadastro válido", () => {
    expect(accountRegistrationSpec.safeParse(validInput).success).toBe(true);
  });

  it("rejeita nome muito curto", () => {
    const result = accountRegistrationSpec.safeParse({ ...validInput, fullName: "An" });
    expect(result.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const result = accountRegistrationSpec.safeParse({ ...validInput, email: "não-é-email" });
    expect(result.success).toBe(false);
  });

  it("rejeita senha sem número ou maiúscula", () => {
    expect(accountRegistrationSpec.safeParse({ ...validInput, password: "senhasenha", confirmPassword: "senhasenha" }).success).toBe(false);
  });

  it("rejeita quando a confirmação de senha não coincide", () => {
    const result = accountRegistrationSpec.safeParse({ ...validInput, confirmPassword: "Outra123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });

  it("rejeita quando os termos não são aceitos", () => {
    const result = accountRegistrationSpec.safeParse({ ...validInput, acceptsTerms: false });
    expect(result.success).toBe(false);
  });
});
