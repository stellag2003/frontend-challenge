export class QuoteOutdatedError extends Error {
  readonly code = "QUOTE_OUTDATED" as const;

  constructor(message = "A cotação não corresponde mais ao estado atual.") {
    super(message);
    this.name = "QuoteOutdatedError";
  }
}

export class CheckoutRequestFailedError extends Error {
  readonly code = "CHECKOUT_REQUEST_FAILED" as const;

  constructor(message = "Não foi possível falar com o checkout. Tente novamente.") {
    super(message);
    this.name = "CheckoutRequestFailedError";
  }
}
