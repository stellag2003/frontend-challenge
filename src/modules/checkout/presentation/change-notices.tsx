import { Button } from "@/components/ui/button";
import type { EditionChange, EditionChangeNotice } from "../domain/nft-updated";
import { checkoutSession } from "../di";
import { eth } from "./use-checkout";

export function describeEditionChange(change: EditionChange): string {
  if (change.field === "price") return `Preço: de ${eth(change.from)} para ${eth(change.to)}`;
  return `Disponibilidade: de ${availabilityLabel(change.from)} para ${availabilityLabel(change.to)}`;
}

function availabilityLabel(available: number): string {
  return available <= 0 ? "esgotada" : `${available} disponíveis`;
}

/** Avisos persistentes: ficam até o colecionador reconhecê-los ou aprovar a nova cotação. */
export function ChangeNotices({ notices }: { notices: EditionChangeNotice[] }) {
  if (notices.length === 0) return null;

  return (
    <section aria-label="Alterações nas edições do carrinho" className="space-y-3">
      {notices.map((notice) => (
        <article
          key={notice.id}
          role="alert"
          aria-label={`Aviso da edição ${notice.editionLabel}`}
          className="flex items-start justify-between gap-4 rounded-lg border border-primary/50 bg-primary/10 p-4"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              A edição {notice.editionLabel} de {notice.title} mudou
            </p>
            <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
              {notice.changes.map((change) => (
                <li key={change.field}>{describeEditionChange(change)}</li>
              ))}
            </ul>
          </div>
          <Button variant="ghost" size="sm" onClick={() => checkoutSession.acknowledgeNotice(notice.id)}>
            Entendi
          </Button>
        </article>
      ))}
    </section>
  );
}
