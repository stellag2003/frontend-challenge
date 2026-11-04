import { AccountHttpRepository } from "./infrastructure/account-http-repository";
import { RegisterAccountUseCase } from "./application/register-account.usecase";

export const registerAccountUseCase = new RegisterAccountUseCase(new AccountHttpRepository());
