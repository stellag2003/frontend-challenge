export class EmailAlreadyInUseError extends Error {
  readonly code = "EMAIL_ALREADY_IN_USE" as const;

  constructor(email: string) {
    super(`O e-mail "${email}" já está em uso.`);
    this.name = "EmailAlreadyInUseError";
  }
}

export class AccountRegistrationFailedError extends Error {
  readonly code = "REGISTRATION_FAILED" as const;

  constructor(message = "Não foi possível concluir o cadastro. Tente novamente.") {
    super(message);
    this.name = "AccountRegistrationFailedError";
  }
}
