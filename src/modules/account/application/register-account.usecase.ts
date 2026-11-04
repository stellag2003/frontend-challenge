import type { AccountRepository, RegisteredAccount } from "../domain/account-repository";
import {
  accountRegistrationSpec,
  type AccountRegistrationInput,
} from "../domain/account-registration.spec-contract";

export class RegisterAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: AccountRegistrationInput): Promise<RegisteredAccount> {
    const { fullName, email, password } = accountRegistrationSpec.parse(input);

    return this.accountRepository.register({ fullName, email, password });
  }
}
