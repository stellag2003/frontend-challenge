import { isAxiosError } from "axios";

import { apiClient } from "@/shared/http/api-client";
import type { AccountRepository, RegisteredAccount } from "../domain/account-repository";
import type { NewCollectorAccount } from "../domain/account-registration.spec-contract";
import { AccountRegistrationFailedError, EmailAlreadyInUseError } from "../domain/account-errors";

export class AccountHttpRepository implements AccountRepository {
  async register(account: NewCollectorAccount): Promise<RegisteredAccount> {
    try {
      const { data } = await apiClient.post<RegisteredAccount>("/auth/register", account);
      return data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        throw new EmailAlreadyInUseError(account.email);
      }

      throw new AccountRegistrationFailedError();
    }
  }
}
