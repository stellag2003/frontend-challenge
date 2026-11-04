import type { NewCollectorAccount } from "./account-registration.spec-contract";

export interface RegisteredAccount {
  id: string;
  fullName: string;
  email: string;
}

/**
 * Porta de domínio: a aplicação depende desta interface, nunca do Axios
 * diretamente. A implementação concreta mora na camada de infraestrutura.
 */
export interface AccountRepository {
  register(account: NewCollectorAccount): Promise<RegisteredAccount>;
}
