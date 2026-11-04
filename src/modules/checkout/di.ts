import { CheckoutSession } from "./application/checkout-session";
import { GetCartUseCase, HandleNftUpdatedUseCase, RemoveCartItemUseCase } from "./application/cart.usecases";
import { ConfirmPurchaseUseCase, StartReviewUseCase } from "./application/checkout.usecases";
import { CartHttpRepository, QuoteHttpRepository } from "./infrastructure/checkout-http-repository";
import { SocketIoNftEventsSource } from "./infrastructure/socket-io-nft-events";
import { realtimeSocketUrl } from "@/shared/realtime/socket-url";

const cartRepository = new CartHttpRepository();
const quoteRepository = new QuoteHttpRepository();

export const checkoutSession = new CheckoutSession();

export const nftEventsSource = new SocketIoNftEventsSource(realtimeSocketUrl);

export const getCartUseCase = new GetCartUseCase(cartRepository, checkoutSession);
export const removeCartItemUseCase = new RemoveCartItemUseCase(cartRepository, checkoutSession);
export const handleNftUpdatedUseCase = new HandleNftUpdatedUseCase(checkoutSession);
export const startReviewUseCase = new StartReviewUseCase(quoteRepository, checkoutSession);
export const confirmPurchaseUseCase = new ConfirmPurchaseUseCase(quoteRepository, checkoutSession);
