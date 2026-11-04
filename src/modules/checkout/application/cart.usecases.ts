import type { Cart } from "../domain/cart";
import type { CartRepository } from "../domain/checkout-ports";
import type { NftUpdatedEvent } from "../domain/nft-updated";
import type { CheckoutSession } from "./checkout-session";

export class GetCartUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly session: CheckoutSession,
  ) {}

  async execute(): Promise<Cart> {
    const cart = await this.cartRepository.getCart();
    this.session.syncFromCart(cart);
    return cart;
  }
}

export class RemoveCartItemUseCase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly session: CheckoutSession,
  ) {}

  async execute(editionId: string): Promise<Cart> {
    const cart = await this.cartRepository.removeItem(editionId);
    this.session.syncFromCart(cart);
    return cart;
  }
}

export class HandleNftUpdatedUseCase {
  constructor(private readonly session: CheckoutSession) {}

  /** Retorna `true` quando o resumo do carrinho precisa ser pedido de novo à API. */
  execute(event: NftUpdatedEvent): boolean {
    return this.session.applyNftUpdated(event).kind === "apply";
  }
}
