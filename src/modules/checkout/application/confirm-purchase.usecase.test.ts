import { describe, expect, it, vi } from "vitest";

import { QuoteOutdatedError } from "../domain/checkout-errors";
import type { PlacedOrder, QuoteRepository } from "../domain/checkout-ports";
import type { Cart } from "../domain/cart";
import type { Quote } from "../domain/quote";
import { CheckoutSession } from "./checkout-session";
import { ConfirmPurchaseUseCase } from "./checkout.usecases";

const accepted: Quote = {
  id: "q-1",
  items: [{ editionId: "ed-1", title: "Maré Alta", editionLabel: "1 de 5", quantity: 1, unitPrice: "0.50", available: 3 }],
  coupon: null,
  subtotal: "0.50",
  discount: "0.00",
  networkFee: "0.01",
  total: "0.51",
};

const raised: Quote = {
  ...accepted,
  id: "q-2",
  items: [{ ...accepted.items[0], unitPrice: "0.55" }],
  subtotal: "0.55",
  total: "0.56",
};

const order: PlacedOrder = { orderId: "PED-0001", quoteId: "q-x", total: "0.51", placedAt: "2026-11-04T12:00:00Z" };

const cart: Cart = {
  items: [
    {
      editionId: "ed-1",
      nftId: "nft-1",
      title: "Maré Alta",
      editionLabel: "1 de 5",
      quantity: 1,
      unitPrice: "0.50",
      available: 3,
      nftVersion: 2,
    },
  ],
  coupon: null,
  summary: { subtotal: "0.50", discount: "0.00", networkFee: "0.01", total: "0.51" },
};

function setup(quotes: Quote[], placeOrder: QuoteRepository["placeOrder"] = vi.fn(async () => order)) {
  const repository: QuoteRepository = {
    requestQuote: vi.fn(async () => {
      const next = quotes.shift();
      if (!next) throw new Error("sem cotação");
      return next;
    }),
    placeOrder: vi.fn(placeOrder),
  };
  const session = new CheckoutSession();
  session.syncFromCart(cart);
  session.startReview(accepted);
  return { repository, session, useCase: new ConfirmPurchaseUseCase(repository, session) };
}

describe("ConfirmPurchaseUseCase", () => {
  it("envia o pedido quando a revalidação devolve a mesma cotação", async () => {
    const { repository, session, useCase } = setup([{ ...accepted, id: "q-fresh" }]);
    const result = await useCase.execute();
    expect(result.outcome).toBe("placed");
    expect(repository.placeOrder).toHaveBeenCalledWith("q-fresh");
    expect(session.getState().review.status).toBe("placed");
  });

  it("não envia o pedido se a revalidação mudou e exige nova confirmação", async () => {
    const { repository, session, useCase } = setup([raised]);
    const result = await useCase.execute();
    expect(result.outcome).toBe("changed");
    expect(repository.placeOrder).not.toHaveBeenCalled();
    const review = session.getState().review;
    expect(review.status === "reviewing" && review.quote.total).toBe("0.56");
    expect(review.status === "reviewing" && review.changes.map((c) => c.kind)).toEqual(["price", "total"]);
  });

  it("não envia o pedido enquanto um evento marcou a cotação como desatualizada", async () => {
    const { repository, session, useCase } = setup([{ ...accepted, id: "q-fresh" }]);
    session.applyNftUpdated({
      eventId: "e-1",
      type: "nft.updated",
      resource: { type: "nft", nftId: "nft-1", editionId: "ed-1" },
      version: 3,
      data: { price: "0.55" },
      occurredAt: "2026-11-04T12:00:00Z",
    });
    expect(session.getState().review.status).toBe("stale");

    const result = await useCase.execute();
    expect(result.outcome).toBe("changed");
    expect(repository.placeOrder).not.toHaveBeenCalled();
  });

  it("não envia com edição indisponível", async () => {
    const soldOut: Quote = { ...accepted, items: [{ ...accepted.items[0], available: 0 }] };
    const { repository, session, useCase } = setup([soldOut, soldOut]);
    expect((await useCase.execute()).outcome).toBe("changed");
    expect((await useCase.execute()).outcome).toBe("blocked-unavailable");
    expect(repository.placeOrder).not.toHaveBeenCalled();
    expect(session.getState().review.status).toBe("reviewing");
  });

  it("se o servidor recusar a cotação, pede outra e exige nova confirmação", async () => {
    const { session, useCase } = setup([{ ...accepted, id: "q-fresh" }, raised], async () => {
      throw new QuoteOutdatedError();
    });
    const result = await useCase.execute();
    expect(result.outcome).toBe("changed");
    const review = session.getState().review;
    expect(review.status === "reviewing" && review.quote.id).toBe("q-2");
  });
});

describe("CheckoutSession", () => {
  it("não gera aviso duplicado nem regride a versão com resposta antiga da API", () => {
    const session = new CheckoutSession();
    session.syncFromCart(cart);
    const update = {
      eventId: "e-1",
      type: "nft.updated" as const,
      resource: { type: "nft" as const, nftId: "nft-1", editionId: "ed-1" },
      version: 3,
      data: { price: "0.55" },
      occurredAt: "2026-11-04T12:00:00Z",
    };
    session.applyNftUpdated(update);
    session.applyNftUpdated(update);
    session.syncFromCart(cart); // resposta com versão 2 chegando depois
    expect(session.getState().notices).toHaveLength(1);
    expect(session.getState().known["ed-1"]).toMatchObject({ version: 3, unitPrice: "0.55" });
  });
});
