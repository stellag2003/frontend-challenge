import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasUnavailableItems, isUnavailable } from "../domain/cart";
import type { Quote, QuoteChange } from "../domain/quote";
import { checkoutSession, confirmPurchaseUseCase, startReviewUseCase } from "../di";
import { ChangeNotices, describeEditionChange } from "./change-notices";
import { RealtimeStatus } from "./realtime-status";
import { SummaryList } from "./summary-list";
import { eth, useCartQuery, useCheckoutSession, useNftRealtime } from "./use-checkout";

export function describeQuoteChange(change: QuoteChange): string {
  switch (change.kind) {
    case "price":
      return `Preço da edição ${change.editionLabel} (${change.title}): de ${eth(change.from)} para ${eth(change.to)}`;
    case "availability":
      return `Disponibilidade da edição ${change.editionLabel} (${change.title}): de ${change.from} para ${change.to}`;
    case "quantity":
      return `Quantidade da edição ${change.editionLabel} (${change.title}): de ${change.from} para ${change.to}`;
    case "item-added":
      return `Edição ${change.editionLabel} (${change.title}) entrou no pedido`;
    case "item-removed":
      return `Edição ${change.editionLabel} (${change.title}) saiu do pedido`;
    case "coupon":
      return `Cupom: de ${change.from ?? "nenhum"} para ${change.to ?? "nenhum"}`;
    case "network-fee":
      return `Taxa de rede: de ${eth(change.from)} para ${eth(change.to)}`;
    case "total":
      return `Total: de ${eth(change.from)} para ${eth(change.to)}`;
  }
}

export function PaymentPage() {
  const status = useNftRealtime();
  const { notices, review } = useCheckoutSession();
  // Mantém as versões conhecidas das edições do carrinho sincronizadas com a API.
  useCartQuery();

  const startReview = useMutation({ mutationFn: () => startReviewUseCase.execute() });
  const confirm = useMutation({ mutationFn: () => confirmPurchaseUseCase.execute() });
  const { mutate: beginReview } = startReview;

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const current = checkoutSession.getState().review;
    if (current.status === "idle" || current.status === "placed") beginReview();
  }, [beginReview]);

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <Link to="/carrinho" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              ← Voltar ao carrinho
            </Link>
            <h1 className="mt-2 font-display text-3xl text-foreground">Revisão do pagamento</h1>
          </div>
          <RealtimeStatus status={status} />
        </header>

        {review.status !== "placed" && <ChangeNotices notices={notices} />}

        {startReview.isError && (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível obter a cotação. Tente novamente.
          </p>
        )}
        {confirm.isError && (
          <p role="alert" className="text-sm text-destructive">
            Não foi possível confirmar agora. Nenhum pedido foi enviado.
          </p>
        )}

        {review.status === "idle" && <p className="text-sm text-muted-foreground">Obtendo cotação…</p>}

        {review.status === "placed" && (
          <section aria-label="Pedido confirmado" className="rounded-lg border border-success/60 bg-success/10 p-5">
            <h2 className="font-medium text-foreground">Pedido confirmado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pedido {review.order.orderId} no total de {eth(review.order.total)}.
            </p>
          </section>
        )}

        {review.status === "stale" && (
          <section
            role="alert"
            aria-label="Cotação desatualizada"
            className="rounded-lg border border-destructive/60 bg-destructive/10 p-4"
          >
            <h2 className="text-sm font-medium text-foreground">Cotação desatualizada</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Algo mudou desde a sua última revisão. Revise a nova cotação antes de confirmar.
            </p>
            <ul className="mt-2 space-y-0.5 text-sm text-foreground">
              {review.reasons.flatMap((reason) =>
                reason.changes.map((change) => (
                  <li key={`${reason.id}-${change.field}`}>
                    Edição {reason.editionLabel}: {describeEditionChange(change)}
                  </li>
                )),
              )}
            </ul>
          </section>
        )}

        {review.status === "reviewing" && review.changes.length > 0 && (
          <section
            role="alert"
            aria-label="A cotação mudou"
            className="rounded-lg border border-destructive/60 bg-destructive/10 p-4"
          >
            <h2 className="text-sm font-medium text-foreground">A cotação mudou — nenhum pedido foi enviado</h2>
            <ul className="mt-2 space-y-0.5 text-sm text-foreground">
              {review.changes.map((change, index) => (
                <li key={index}>{describeQuoteChange(change)}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-muted-foreground">Confira os novos valores e confirme de novo.</p>
          </section>
        )}

        {(review.status === "reviewing" || review.status === "stale") && (
          <QuoteReview
            quote={review.quote}
            stale={review.status === "stale"}
            reconfirm={review.status === "reviewing" && review.changes.length > 0}
            pending={confirm.isPending}
            onConfirm={() => confirm.mutate()}
          />
        )}
      </div>
    </main>
  );
}

function QuoteReview(props: {
  quote: Quote;
  stale: boolean;
  reconfirm: boolean;
  pending: boolean;
  onConfirm: () => void;
}) {
  const { quote, stale, reconfirm, pending, onConfirm } = props;
  const blocked = hasUnavailableItems(quote.items);

  const label = stale
    ? "Revisar nova cotação"
    : reconfirm
      ? `Confirmar nova cotação de ${eth(quote.total)}`
      : `Confirmar compra de ${eth(quote.total)}`;

  return (
    <section aria-label="Cotação em revisão" className={cn("space-y-4 rounded-lg border border-border bg-card p-5", stale && "opacity-70")}>
      <ul className="space-y-2">
        {quote.items.map((item) => (
          <li key={item.editionId} className="flex justify-between text-sm">
            <span className="text-foreground">
              {item.title} · Edição {item.editionLabel} × {item.quantity}
              {isUnavailable(item) && <span className="ml-2 text-destructive">Indisponível — fora do total</span>}
            </span>
            <span className="text-muted-foreground">{eth(item.unitPrice)}</span>
          </li>
        ))}
      </ul>

      <SummaryList summary={quote} label="Valores da cotação" />

      {blocked && (
        <p className="text-sm text-destructive">
          Há edições indisponíveis. <Link to="/carrinho" className="underline">Remova-as no carrinho</Link> para confirmar.
        </p>
      )}

      <Button className="w-full" onClick={onConfirm} disabled={pending || blocked}>
        {pending ? "Revalidando cotação…" : label}
      </Button>
    </section>
  );
}
