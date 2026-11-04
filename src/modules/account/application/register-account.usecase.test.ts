import { describe, expect, it } from "vitest";

import type { AccountRepository, RegisteredAccount } from "../domain/account-repository";
import type { NewCollectorAccount } from "../domain/account-registration.spec-contract";
import { EmailAlreadyInUseError } from "../domain/account-errors";
import { RegisterAccountUseCase } from "./register-account.usecase";

const validInput = {
  fullName: "Ana Ravache",
  email: "ana.ravache@example.com",
  password: "Senha123",
  confirmPassword: "Senha123",
  acceptsTerms: true as const,
};

class FakeAccountRepository implements AccountRepository {
  constructor(private readonly behavior: (account: NewCollectorAccount) => Promise<RegisteredAccount>) {}

  register(account: NewCollectorAccount): Promise<RegisteredAccount> {
    return this.behavior(account);
  }
}

describe("RegisterAccountUseCase", () => {
  it("registra uma conta válida através do repositório", async () => {
    const repository = new FakeAccountRepository(async (account) => ({
      id: "acc_1",
      fullName: account.fullName,
      email: account.email,
    }));
    const useCase = new RegisterAccountUseCase(repository);

    const result = await useCase.execute(validInput);

    expect(result).toEqual({ id: "acc_1", fullName: "Ana Ravache", email: "ana.ravache@example.com" });
  });

  it("não chama o repositório quando a entrada viola a spec de domínio", async () => {
    let called = false;
    const repository = new FakeAccountRepository(async (account) => {
      called = true;
      return { id: "acc_1", fullName: account.fullName, email: account.email };
    });
    const useCase = new RegisterAccountUseCase(repository);

    await expect(useCase.execute({ ...validInput, confirmPassword: "diferente" })).rejects.toThrow();
    expect(called).toBe(false);
  });

  it("propaga conflito de e-mail já cadastrado", async () => {
    const repository = new FakeAccountRepository(async (account) => {
      throw new EmailAlreadyInUseError(account.email);
    });
    const useCase = new RegisterAccountUseCase(repository);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(EmailAlreadyInUseError);
  });
});
