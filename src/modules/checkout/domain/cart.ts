/** Valor em ETH como string decimal, exatamente como a API devolveu. */
export type EthAmount = string;

export interface CartItem {
  editionId: string;
  nftId: string;
  title: string;
  editionLabel: string;
  quantity: number;
  unitPrice: EthAmount;
  available: number;
  /** Versão do NFT conhecida pela API no momento da resposta. */
  nftVersion: number;
}

/** Resumo do carrinho calculado pela API. Informativo: não trava preço. */
export interface CartSummary {
  subtotal: EthAmount;
  discount: EthAmount;
  networkFee: EthAmount;
  total: EthAmount;
}

export interface Cart {
  items: CartItem[];
  coupon: string | null;
  summary: CartSummary;
}

export function isUnavailable(item: { available: number }): boolean {
  return item.available <= 0;
}

export function hasUnavailableItems(items: Array<{ available: number }>): boolean {
  return items.some(isUnavailable);
}
