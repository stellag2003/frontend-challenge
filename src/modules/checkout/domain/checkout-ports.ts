import type { Cart } from "./cart";
import type { NftUpdatedEvent } from "./nft-updated";
import type { Quote } from "./quote";

export interface PlacedOrder {
  orderId: string;
  quoteId: string;
  total: string;
  placedAt: string;
}

/** Portas de domínio: a aplicação depende delas, nunca do Axios/Socket.IO diretamente. */
export interface CartRepository {
  getCart(): Promise<Cart>;
  removeItem(editionId: string): Promise<Cart>;
}

export interface QuoteRepository {
  requestQuote(): Promise<Quote>;
  /** Lança `QuoteOutdatedError` se o servidor recusar a cotação. */
  placeOrder(quoteId: string): Promise<PlacedOrder>;
}

export type RealtimeStatus = "connecting" | "connected" | "disconnected";

export interface NftEventsSource {
  subscribe(listener: (event: NftUpdatedEvent) => void): () => void;
  getStatus(): RealtimeStatus;
  subscribeStatus(listener: (status: RealtimeStatus) => void): () => void;
}
