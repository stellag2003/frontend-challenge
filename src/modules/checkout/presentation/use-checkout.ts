import { useEffect, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { checkoutSession, getCartUseCase, handleNftUpdatedUseCase, nftEventsSource } from "../di";

export const checkoutKeys = {
  cart: ["checkout", "cart"] as const,
};

export function useCheckoutSession() {
  return useSyncExternalStore(checkoutSession.subscribe, checkoutSession.getState);
}

export function useCartQuery() {
  return useQuery({ queryKey: checkoutKeys.cart, queryFn: () => getCartUseCase.execute() });
}

const subscribeStatus = (onChange: () => void) => nftEventsSource.subscribeStatus(onChange);
const getStatus = () => nftEventsSource.getStatus();

/**
 * Liga a tela aos eventos `nft.updated`: um evento relevante gera aviso (na sessão)
 * e um novo pedido de resumo à API, via invalidação do cache do TanStack Query.
 */
export function useNftRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return nftEventsSource.subscribe((event) => {
      if (handleNftUpdatedUseCase.execute(event)) {
        void queryClient.invalidateQueries({ queryKey: checkoutKeys.cart });
      }
    });
  }, [queryClient]);

  return useSyncExternalStore(subscribeStatus, getStatus);
}

export function eth(amount: string): string {
  return `${amount} ETH`;
}
