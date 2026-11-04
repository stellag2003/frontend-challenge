import type { EthAmount } from "./cart";
import { sameEthAmount } from "./eth-amount";

export interface QuoteItem {
  editionId: string;
  title: string;
  editionLabel: string;
  quantity: number;
  unitPrice: EthAmount;
  available: number;
}

/** Cotação emitida pela API: a referência para finalizar o pedido. */
export interface Quote {
  id: string;
  items: QuoteItem[];
  coupon: string | null;
  subtotal: EthAmount;
  discount: EthAmount;
  networkFee: EthAmount;
  total: EthAmount;
}

interface EditionRef {
  editionId: string;
  title: string;
  editionLabel: string;
}

export type QuoteChange =
  | ({ kind: "price"; from: EthAmount; to: EthAmount } & EditionRef)
  | ({ kind: "availability"; from: number; to: number } & EditionRef)
  | ({ kind: "quantity"; from: number; to: number } & EditionRef)
  | ({ kind: "item-added" } & EditionRef)
  | ({ kind: "item-removed" } & EditionRef)
  | { kind: "coupon"; from: string | null; to: string | null }
  | { kind: "network-fee"; from: EthAmount; to: EthAmount }
  | { kind: "total"; from: EthAmount; to: EthAmount };

function ref(item: QuoteItem): EditionRef {
  return { editionId: item.editionId, title: item.title, editionLabel: item.editionLabel };
}

/**
 * Lista o que mudou entre a cotação aceita e uma nova cotação da API.
 * Qualquer diferença (para cima ou para baixo) conta: lista vazia = mesma cotação.
 */
export function compareQuotes(accepted: Quote, fresh: Quote): QuoteChange[] {
  const changes: QuoteChange[] = [];
  const freshById = new Map(fresh.items.map((item) => [item.editionId, item]));
  const acceptedIds = new Set(accepted.items.map((item) => item.editionId));

  for (const before of accepted.items) {
    const after = freshById.get(before.editionId);
    if (!after) {
      changes.push({ kind: "item-removed", ...ref(before) });
      continue;
    }
    if (!sameEthAmount(before.unitPrice, after.unitPrice)) {
      changes.push({ kind: "price", ...ref(after), from: before.unitPrice, to: after.unitPrice });
    }
    if (before.available !== after.available) {
      changes.push({ kind: "availability", ...ref(after), from: before.available, to: after.available });
    }
    if (before.quantity !== after.quantity) {
      changes.push({ kind: "quantity", ...ref(after), from: before.quantity, to: after.quantity });
    }
  }

  for (const after of fresh.items) {
    if (!acceptedIds.has(after.editionId)) changes.push({ kind: "item-added", ...ref(after) });
  }

  if (accepted.coupon !== fresh.coupon) {
    changes.push({ kind: "coupon", from: accepted.coupon, to: fresh.coupon });
  }
  if (!sameEthAmount(accepted.networkFee, fresh.networkFee)) {
    changes.push({ kind: "network-fee", from: accepted.networkFee, to: fresh.networkFee });
  }
  if (!sameEthAmount(accepted.total, fresh.total)) {
    changes.push({ kind: "total", from: accepted.total, to: fresh.total });
  }

  return changes;
}
