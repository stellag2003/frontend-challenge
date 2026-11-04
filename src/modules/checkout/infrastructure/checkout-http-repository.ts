import { isAxiosError } from "axios";

import { apiClient } from "@/shared/http/api-client";
import type { Cart } from "../domain/cart";
import { CheckoutRequestFailedError, QuoteOutdatedError } from "../domain/checkout-errors";
import type { CartRepository, PlacedOrder, QuoteRepository } from "../domain/checkout-ports";
import type { Quote } from "../domain/quote";

async function request<T>(call: () => Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await call();
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 409) throw new QuoteOutdatedError();
    throw new CheckoutRequestFailedError();
  }
}

export class CartHttpRepository implements CartRepository {
  getCart(): Promise<Cart> {
    return request(() => apiClient.get<Cart>("/cart"));
  }

  removeItem(editionId: string): Promise<Cart> {
    return request(() => apiClient.delete<Cart>(`/cart/items/${encodeURIComponent(editionId)}`));
  }
}

export class QuoteHttpRepository implements QuoteRepository {
  requestQuote(): Promise<Quote> {
    return request(() => apiClient.post<Quote>("/checkout/quotes"));
  }

  placeOrder(quoteId: string): Promise<PlacedOrder> {
    return request(() => apiClient.post<PlacedOrder>("/orders", { quoteId }));
  }
}
