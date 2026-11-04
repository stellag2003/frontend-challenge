import { hasUnavailableItems } from "../domain/cart";
import { QuoteOutdatedError } from "../domain/checkout-errors";
import type { PlacedOrder, QuoteRepository } from "../domain/checkout-ports";
import { compareQuotes, type QuoteChange } from "../domain/quote";
import type { CheckoutSession } from "./checkout-session";

export class StartReviewUseCase {
  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly session: CheckoutSession,
  ) {}

  async execute(): Promise<void> {
    const quote = await this.quoteRepository.requestQuote();
    this.session.startReview(quote);
  }
}

export type ConfirmPurchaseResult =
  | { outcome: "placed"; order: PlacedOrder }
  | { outcome: "changed"; changes: QuoteChange[] }
  | { outcome: "blocked-unavailable" };

/**
 * Confirmação do colecionador. Sempre revalida (nova cotação da API) e só envia o
 * pedido se a nova cotação for igual à aceita e nenhuma mudança tiver sido avisada.
 */
export class ConfirmPurchaseUseCase {
  constructor(
    private readonly quoteRepository: QuoteRepository,
    private readonly session: CheckoutSession,
  ) {}

  async execute(): Promise<ConfirmPurchaseResult> {
    const review = this.session.getState().review;
    if (review.status !== "reviewing" && review.status !== "stale") {
      throw new Error("Não há cotação em revisão para confirmar.");
    }
    const accepted = review.quote;

    const fresh = await this.quoteRepository.requestQuote();
    const changes = compareQuotes(accepted, fresh);
    const staleNow = this.session.getState().review.status === "stale";

    if (staleNow || changes.length > 0) {
      this.session.requireReconfirmation(fresh, changes);
      return { outcome: "changed", changes };
    }

    if (hasUnavailableItems(fresh.items)) {
      this.session.requireReconfirmation(fresh, []);
      return { outcome: "blocked-unavailable" };
    }

    try {
      const order = await this.quoteRepository.placeOrder(fresh.id);
      this.session.markPlaced(order);
      return { outcome: "placed", order };
    } catch (error) {
      if (!(error instanceof QuoteOutdatedError)) throw error;
      const latest = await this.quoteRepository.requestQuote();
      const latestChanges = compareQuotes(accepted, latest);
      this.session.requireReconfirmation(latest, latestChanges);
      return { outcome: "changed", changes: latestChanges };
    }
  }
}
