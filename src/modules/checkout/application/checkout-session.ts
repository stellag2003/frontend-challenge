import type { Cart } from "../domain/cart";
import type { PlacedOrder } from "../domain/checkout-ports";
import {
  evaluateNftUpdate,
  type EditionChangeNotice,
  type KnownEdition,
  type NftUpdateDecision,
  type NftUpdatedEvent,
} from "../domain/nft-updated";
import type { Quote, QuoteChange } from "../domain/quote";

export type ReviewState =
  | { status: "idle" }
  /** Cotação em revisão; `changes` lista o que mudou desde a revisão anterior. */
  | { status: "reviewing"; quote: Quote; changes: QuoteChange[] }
  /** Um evento indicou mudança depois da revisão: a cotação está desatualizada. */
  | { status: "stale"; quote: Quote; reasons: EditionChangeNotice[] }
  | { status: "placed"; order: PlacedOrder };

export interface CheckoutSessionState {
  known: Record<string, KnownEdition>;
  notices: EditionChangeNotice[];
  review: ReviewState;
}

const initialState: CheckoutSessionState = { known: {}, notices: [], review: { status: "idle" } };

/**
 * Estado do Checkout no cliente: versões conhecidas por edição, avisos persistentes
 * e a cotação em revisão. Não calcula valores — só guarda o que a API e os eventos dizem.
 */
export class CheckoutSession {
  private state: CheckoutSessionState = initialState;
  private readonly listeners = new Set<() => void>();

  getState = (): CheckoutSessionState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Atualiza o que é conhecido a partir da API, sem nunca regredir a versão. */
  syncFromCart(cart: Cart): void {
    const known: Record<string, KnownEdition> = {};
    for (const item of cart.items) {
      const previous = this.state.known[item.editionId];
      known[item.editionId] =
        previous && previous.version >= item.nftVersion
          ? previous
          : {
              editionId: item.editionId,
              title: item.title,
              editionLabel: item.editionLabel,
              version: item.nftVersion,
              unitPrice: item.unitPrice,
              available: item.available,
            };
    }
    this.setState({ ...this.state, known });
  }

  applyNftUpdated(event: NftUpdatedEvent): NftUpdateDecision {
    const decision = evaluateNftUpdate(this.state.known[event.resource.editionId], event);
    if (decision.kind === "ignore") return decision;

    const known = { ...this.state.known, [decision.next.editionId]: decision.next };
    const { notice } = decision;
    if (!notice) {
      this.setState({ ...this.state, known });
      return decision;
    }

    const notices = this.state.notices.some((n) => n.id === notice.id)
      ? this.state.notices
      : [...this.state.notices, notice];

    const review = this.state.review;
    const nextReview: ReviewState =
      review.status === "reviewing"
        ? { status: "stale", quote: review.quote, reasons: [notice] }
        : review.status === "stale"
          ? { ...review, reasons: [...review.reasons, notice] }
          : review;

    this.setState({ known, notices, review: nextReview });
    return decision;
  }

  acknowledgeNotice(noticeId: string): void {
    this.setState({ ...this.state, notices: this.state.notices.filter((n) => n.id !== noticeId) });
  }

  startReview(quote: Quote): void {
    this.setState({ ...this.state, review: { status: "reviewing", quote, changes: [] } });
  }

  /** A nova cotação passa a ser a revisada; o colecionador precisa confirmar de novo. */
  requireReconfirmation(quote: Quote, changes: QuoteChange[]): void {
    this.setState({ ...this.state, review: { status: "reviewing", quote, changes } });
  }

  markPlaced(order: PlacedOrder): void {
    // A nova cotação foi aprovada e virou pedido: os avisos cumpriram seu papel.
    this.setState({ ...this.state, notices: [], review: { status: "placed", order } });
  }

  reset(): void {
    this.setState(initialState);
  }

  private setState(next: CheckoutSessionState) {
    this.state = next;
    for (const listener of this.listeners) listener();
  }
}
