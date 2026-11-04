import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasUnavailableItems, isUnavailable, type CartItem } from "../domain/cart";
import { removeCartItemUseCase } from "../di";
import { ChangeNotices } from "./change-notices";
import { RealtimeStatus } from "./realtime-status";
import { SummaryList } from "./summary-list";
import { checkoutKeys, eth, useCartQuery, useCheckoutSession, useNftRealtime } from "./use-checkout";

export function CartPage() {
  const status = useNftRealtime();
  const { notices } = useCheckoutSession();
  const cartQuery = useCartQuery();
  const queryClient = useQueryClient();

  const removeItem = useMutation({
    mutationFn: (editionId: string) => removeCartItemUseCase.execute(editionId),
    onSuccess: (cart) => queryClient.setQueryData(checkoutKeys.cart, cart),
  });

  const cart = cartQuery.data;
  const blocked = cart ? hasUnavailableItems(cart.items) : true;

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-foreground">Seu carrinho</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Preços e disponibilidade são atualizados em tempo real.
            </p>
          </div>
          <RealtimeStatus status={status} />
        </header>

        <ChangeNotices notices={notices} />

        {cartQuery.isPending && <p className="text-sm text-muted-foreground">Carregando carrinho…</p>}
        {cartQuery.isError && (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível carregar o carrinho.
          </p>
        )}

        {cart && cart.items.length === 0 && <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>}

        {cart && cart.items.length > 0 && (
          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            <ul aria-label="Itens do carrinho" className="space-y-3">
              {cart.items.map((item) => (
                <CartLine
                  key={item.editionId}
                  item={item}
                  onRemove={() => removeItem.mutate(item.editionId)}
                  removing={removeItem.isPending && removeItem.variables === item.editionId}
                />
              ))}
            </ul>

            <aside aria-label="Resumo do carrinho" className="h-fit space-y-4 rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-medium text-foreground">Resumo do carrinho</h2>
              <SummaryList summary={cart.summary} label="Valores do resumo do carrinho" />
              <p className="text-xs text-muted-foreground">
                O resumo é informativo e não trava o preço. A cotação final é revalidada ao confirmar.
              </p>
              {blocked && (
                <p className="text-xs text-destructive">Remova as edições indisponíveis para seguir ao pagamento.</p>
              )}
              <Link
                to="/pagamento"
                disabled={blocked}
                aria-disabled={blocked}
                className={cn(buttonVariants({ className: "w-full" }), blocked && "pointer-events-none opacity-50")}
              >
                Ir para o pagamento
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function CartLine({ item, onRemove, removing }: { item: CartItem; onRemove: () => void; removing: boolean }) {
  const unavailable = isUnavailable(item);

  return (
    <li
      aria-label={`Edição ${item.editionLabel} de ${item.title}`}
      className={cn(
        "flex items-start justify-between gap-4 rounded-lg border bg-card p-4",
        unavailable ? "border-destructive/60" : "border-border",
      )}
    >
      <div className="space-y-1">
        <p className="font-medium text-foreground">{item.title}</p>
        <p className="text-sm text-muted-foreground">Edição {item.editionLabel}</p>
        <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
        {unavailable ? (
          <p className="text-sm font-medium text-destructive">Indisponível — fora do total</p>
        ) : (
          <p className="text-sm text-muted-foreground">{item.available} disponíveis</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className={cn("text-sm text-foreground", unavailable && "line-through opacity-60")}>
          <span className="sr-only">Preço unitário: </span>
          <span data-testid="unit-price">{eth(item.unitPrice)}</span>
        </p>
        <Button variant={unavailable ? "secondary" : "ghost"} size="sm" onClick={onRemove} disabled={removing}>
          Remover
        </Button>
      </div>
    </li>
  );
}
