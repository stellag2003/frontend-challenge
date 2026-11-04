import { describe, expect, it } from "vitest";

import { sameEthAmount } from "./eth-amount";
import { evaluateNftUpdate, type KnownEdition, type NftUpdatedEvent } from "./nft-updated";
import { compareQuotes, type Quote } from "./quote";

const known: KnownEdition = {
  editionId: "ed-1",
  title: "Aurora Boreal #12",
  editionLabel: "3 de 10",
  version: 4,
  unitPrice: "0.85",
  available: 5,
};

function event(version: number, data: NftUpdatedEvent["data"], editionId = "ed-1"): NftUpdatedEvent {
  return {
    eventId: `e-${editionId}-${version}`,
    type: "nft.updated",
    resource: { type: "nft", nftId: "nft-1", editionId },
    version,
    data,
    occurredAt: "2026-11-04T12:00:00.000Z",
  };
}

const quote: Quote = {
  id: "q-1",
  items: [{ editionId: "ed-1", title: "Maré Alta", editionLabel: "1 de 5", quantity: 1, unitPrice: "0.50", available: 3 }],
  coupon: null,
  subtotal: "0.50",
  discount: "0.00",
  networkFee: "0.01",
  total: "0.51",
};

describe("sameEthAmount", () => {
  it("compara pelo valor escrito, sem ponto flutuante", () => {
    expect(sameEthAmount("0.5", "0.50")).toBe(true);
    expect(sameEthAmount("0.10000000000000000001", "0.1")).toBe(false);
    expect(sameEthAmount("1.70", "1.7")).toBe(true);
  });
});

describe("evaluateNftUpdate", () => {
  it("aplica versão maior e gera aviso com valor antigo e novo", () => {
    const decision = evaluateNftUpdate(known, event(5, { price: "0.92" }));
    expect(decision.kind).toBe("apply");
    if (decision.kind !== "apply") return;
    expect(decision.next).toMatchObject({ version: 5, unitPrice: "0.92" });
    expect(decision.notice?.changes).toEqual([{ field: "price", from: "0.85", to: "0.92" }]);
  });

  it("ignora versão igual (duplicata) e menor (atrasada)", () => {
    expect(evaluateNftUpdate(known, event(4, { price: "0.99" }))).toEqual({ kind: "ignore", reason: "stale-version" });
    expect(evaluateNftUpdate(known, event(3, { price: "0.80" }))).toEqual({ kind: "ignore", reason: "stale-version" });
  });

  it("ignora edição fora do carrinho", () => {
    expect(evaluateNftUpdate(undefined, event(9, { price: "1.00" }, "outra"))).toEqual({
      kind: "ignore",
      reason: "not-in-cart",
    });
  });

  it("registra esgotamento como mudança de disponibilidade", () => {
    const decision = evaluateNftUpdate(known, event(5, { available: 0 }));
    expect(decision.kind === "apply" && decision.notice?.changes).toEqual([
      { field: "availability", from: 5, to: 0 },
    ]);
  });
});

describe("compareQuotes", () => {
  it("cotação idêntica não tem mudanças", () => {
    expect(compareQuotes(quote, { ...quote, id: "q-2" })).toEqual([]);
  });

  it("aponta preço e total quando o preço sobe", () => {
    const fresh: Quote = {
      ...quote,
      id: "q-2",
      items: [{ ...quote.items[0], unitPrice: "0.55" }],
      subtotal: "0.55",
      total: "0.56",
    };
    expect(compareQuotes(quote, fresh)).toEqual([
      { kind: "price", editionId: "ed-1", title: "Maré Alta", editionLabel: "1 de 5", from: "0.50", to: "0.55" },
      { kind: "total", from: "0.51", to: "0.56" },
    ]);
  });

  it("queda de preço e taxa de rede também contam", () => {
    const fresh: Quote = {
      ...quote,
      items: [{ ...quote.items[0], unitPrice: "0.45" }],
      networkFee: "0.02",
      total: "0.47",
    };
    const kinds = compareQuotes(quote, fresh).map((change) => change.kind);
    expect(kinds).toEqual(["price", "network-fee", "total"]);
  });

  it("aponta mudança de cupom e de disponibilidade", () => {
    const fresh: Quote = { ...quote, items: [{ ...quote.items[0], available: 0 }], coupon: "PROMO" };
    const kinds = compareQuotes(quote, fresh).map((change) => change.kind);
    expect(kinds).toEqual(["availability", "coupon"]);
  });
});
