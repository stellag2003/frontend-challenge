import type { CartSummary } from "../domain/cart";
import { eth } from "./use-checkout";

/** Valores exibidos exatamente como as strings da API, só com o sufixo "ETH". */
export function SummaryList({ summary, label }: { summary: CartSummary; label: string }) {
  const rows: Array<[string, string]> = [
    ["Subtotal", summary.subtotal],
    ["Desconto", summary.discount],
    ["Taxa de rede", summary.networkFee],
    ["Total", summary.total],
  ];

  return (
    <dl aria-label={label} className="space-y-2 text-sm">
      {rows.map(([term, value]) => (
        <div
          key={term}
          className={
            term === "Total"
              ? "flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground"
              : "flex justify-between text-muted-foreground"
          }
        >
          <dt>{term}</dt>
          <dd>{eth(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
