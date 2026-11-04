import type { EthAmount } from "./cart";
import { sameEthAmount } from "./eth-amount";

/** Evento de tempo real: identidade, recurso afetado e versão do NFT. */
export interface NftUpdatedEvent {
  eventId: string;
  type: "nft.updated";
  resource: { type: "nft"; nftId: string; editionId: string };
  version: number;
  data: { price?: EthAmount; available?: number };
  occurredAt: string;
}

/** O que o Checkout sabe de uma edição que está no carrinho. */
export interface KnownEdition {
  editionId: string;
  title: string;
  editionLabel: string;
  version: number;
  unitPrice: EthAmount;
  available: number;
}

export type EditionChange =
  | { field: "price"; from: EthAmount; to: EthAmount }
  | { field: "availability"; from: number; to: number };

/** Aviso persistente de que uma edição do carrinho mudou. */
export interface EditionChangeNotice {
  id: string;
  editionId: string;
  title: string;
  editionLabel: string;
  version: number;
  changes: EditionChange[];
}

export type NftUpdateDecision =
  | { kind: "ignore"; reason: "not-in-cart" | "stale-version" }
  | { kind: "apply"; next: KnownEdition; notice: EditionChangeNotice | null };

/**
 * Decide o que fazer com um `nft.updated`. Só versões maiores que a conhecida,
 * de edições no carrinho, são aplicadas; duplicatas e atrasados são ignorados.
 */
export function evaluateNftUpdate(known: KnownEdition | undefined, event: NftUpdatedEvent): NftUpdateDecision {
  if (!known) return { kind: "ignore", reason: "not-in-cart" };
  if (event.version <= known.version) return { kind: "ignore", reason: "stale-version" };

  const changes: EditionChange[] = [];
  const next: KnownEdition = { ...known, version: event.version };

  if (event.data.price !== undefined && !sameEthAmount(event.data.price, known.unitPrice)) {
    changes.push({ field: "price", from: known.unitPrice, to: event.data.price });
    next.unitPrice = event.data.price;
  }
  if (event.data.available !== undefined && event.data.available !== known.available) {
    changes.push({ field: "availability", from: known.available, to: event.data.available });
    next.available = event.data.available;
  }

  const notice: EditionChangeNotice | null =
    changes.length === 0
      ? null
      : {
          id: `${known.editionId}@v${event.version}`,
          editionId: known.editionId,
          title: known.title,
          editionLabel: known.editionLabel,
          version: event.version,
          changes,
        };

  return { kind: "apply", next, notice };
}
