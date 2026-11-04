import { multiply, normalize, subtract, sum, toUnits } from "./decimal";
import { scenarios, type EditionSeed, type ScenarioSeed } from "./scenarios";

/**
 * Estado em memória do "servidor" simulado de Carrinho/Checkout.
 * Toda conta (subtotal, desconto, taxa, total) é feita aqui, como faria a API real.
 */
type EditionRecord = EditionSeed;

interface QuoteRecord {
  id: string;
  items: Array<{
    editionId: string;
    title: string;
    editionLabel: string;
    quantity: number;
    unitPrice: string;
    available: number;
  }>;
  coupon: string | null;
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
}

export interface OrderRecord {
  orderId: string;
  quoteId: string;
  total: string;
  placedAt: string;
}

declare global {
  interface Window {
    __MOCK_SCENARIO__?: string;
  }
}

function pickScenario(): ScenarioSeed {
  const name = typeof window !== "undefined" ? window.__MOCK_SCENARIO__ : undefined;
  return scenarios[name ?? "padrao"] ?? scenarios.padrao;
}

const seed = pickScenario();

const state = {
  editions: new Map<string, EditionRecord>(seed.editions.map((e) => [e.editionId, { ...e }])),
  cart: seed.cart.map((line) => ({ ...line })),
  networkFee: seed.networkFee,
  coupon: seed.coupon ? { ...seed.coupon } : null,
  quotes: new Map<string, QuoteRecord>(),
  orders: [] as OrderRecord[],
};

function edition(editionId: string): EditionRecord {
  const record = state.editions.get(editionId);
  if (!record) throw new Error(`Edição desconhecida no mock: ${editionId}`);
  return record;
}

function computeSummary() {
  const items = state.cart.map((line) => {
    const e = edition(line.editionId);
    return {
      editionId: e.editionId,
      nftId: e.nftId,
      title: e.title,
      editionLabel: e.editionLabel,
      quantity: line.quantity,
      unitPrice: e.price,
      available: e.available,
      nftVersion: e.version,
    };
  });

  const payable = items.filter((item) => item.available > 0);
  const subtotal = sum(payable.map((item) => multiply(item.unitPrice, item.quantity)));
  const discount = state.coupon ? normalize(state.coupon.discount) : "0.00";
  const networkFee = payable.length > 0 ? normalize(state.networkFee) : "0.00";
  const total = sum([subtract(subtotal, discount), networkFee]);

  return {
    items,
    coupon: state.coupon?.code ?? null,
    summary: { subtotal, discount, networkFee, total },
  };
}

export const checkoutDb = {
  getCart() {
    return computeSummary();
  },

  removeCartItem(editionId: string) {
    state.cart = state.cart.filter((line) => line.editionId !== editionId);
    return computeSummary();
  },

  createQuote(): QuoteRecord {
    const { items, coupon, summary } = computeSummary();
    const quote: QuoteRecord = {
      id: crypto.randomUUID(),
      items: items.map(({ editionId, title, editionLabel, quantity, unitPrice, available }) => ({
        editionId,
        title,
        editionLabel,
        quantity,
        unitPrice,
        available,
      })),
      coupon,
      ...summary,
    };
    state.quotes.set(quote.id, quote);
    return quote;
  },

  /** Valida a cotação no servidor: só aceita se ainda corresponde ao estado atual. */
  placeOrder(quoteId: string):
    | { ok: true; order: OrderRecord }
    | { ok: false; code: "QUOTE_NOT_FOUND" | "QUOTE_OUTDATED" | "CART_HAS_UNAVAILABLE_ITEMS" } {
    const quote = state.quotes.get(quoteId);
    if (!quote) return { ok: false, code: "QUOTE_NOT_FOUND" };

    const current = computeSummary();
    if (current.items.some((item) => item.available === 0)) {
      return { ok: false, code: "CART_HAS_UNAVAILABLE_ITEMS" };
    }

    const sameItems =
      current.items.length === quote.items.length &&
      current.items.every((item, index) => {
        const quoted = quote.items[index];
        return (
          quoted.editionId === item.editionId &&
          quoted.quantity === item.quantity &&
          toUnits(quoted.unitPrice) === toUnits(item.unitPrice)
        );
      });
    const sameTotals =
      toUnits(quote.total) === toUnits(current.summary.total) &&
      toUnits(quote.networkFee) === toUnits(current.summary.networkFee) &&
      quote.coupon === current.coupon;

    if (!sameItems || !sameTotals) return { ok: false, code: "QUOTE_OUTDATED" };

    const order: OrderRecord = {
      orderId: `PED-${String(state.orders.length + 1).padStart(4, "0")}`,
      quoteId,
      total: quote.total,
      placedAt: new Date().toISOString(),
    };
    state.orders.push(order);
    state.cart = [];
    return { ok: true, order };
  },

  /**
   * Aplica uma mudança de edição vinda do "servidor" se a versão for mais nova.
   * Retorna false quando a versão é antiga ou repetida (o servidor não regride).
   */
  applyEditionUpdate(update: { editionId: string; version: number; price?: string; available?: number }) {
    const record = edition(update.editionId);
    if (update.version <= record.version) return false;
    record.version = update.version;
    if (update.price !== undefined) record.price = update.price;
    if (update.available !== undefined) record.available = update.available;
    return true;
  },

  /** Mudança silenciosa (sem evento): a próxima versão do NFT. */
  bumpEdition(editionId: string, change: { price?: string; available?: number }) {
    const record = edition(editionId);
    record.version += 1;
    if (change.price !== undefined) record.price = change.price;
    if (change.available !== undefined) record.available = change.available;
    return { ...record };
  },

  getEdition(editionId: string) {
    return { ...edition(editionId) };
  },

  setNetworkFee(fee: string) {
    state.networkFee = fee;
  },

  orders(): OrderRecord[] {
    return state.orders.map((order) => ({ ...order }));
  },
};
