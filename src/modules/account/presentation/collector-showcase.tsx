export function CollectorShowcase() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-card px-16 py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <a href="/" className="relative font-display text-xl tracking-tight text-foreground">
        Provenance
      </a>

      <div className="relative flex flex-1 items-center">
        <div className="flex w-full max-w-md flex-col gap-6">
          <figure
            className="relative mx-auto aspect-[4/5] w-full max-w-[340px] rounded-sm border border-border/80 p-3"
            style={{ background: "linear-gradient(155deg, hsl(230 9% 15%), hsl(230 11% 10%))" }}
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[2px] bg-gradient-to-br from-[hsl(38_45%_24%)] via-[hsl(230_14%_16%)] to-[hsl(170_30%_18%)]">
              <svg viewBox="0 0 200 200" className="h-2/3 w-2/3 opacity-90" aria-hidden>
                <path
                  d="M100 20 C140 20 170 55 170 100 C170 145 140 180 100 180 C60 180 30 145 30 100 C30 55 60 20 100 20 Z"
                  fill="none"
                  stroke="hsl(38 55% 68%)"
                  strokeWidth="1.4"
                />
                <path
                  d="M100 45 C128 45 150 70 150 100 C150 130 128 155 100 155 C72 155 50 130 50 100 C50 70 72 45 100 45 Z"
                  fill="none"
                  stroke="hsl(40 20% 90%)"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
                <circle cx="100" cy="100" r="6" fill="hsl(38 55% 68%)" />
              </svg>
            </div>
          </figure>

          <figcaption className="mx-auto flex max-w-[340px] flex-col gap-1 text-left">
            <p className="font-display text-lg text-foreground">Órbita em Âmbar</p>
            <p className="text-sm text-muted-foreground">
              Cássia Monte, edição 14 de 180. Cunhada nesta coleção em março de 2026.
            </p>
          </figcaption>
        </div>
      </div>

      <p className="relative max-w-sm text-sm leading-relaxed text-muted-foreground">
        Cadastre-se para acompanhar a proveniência das suas peças, favoritar coleções e concluir compras
        com carteiras verificadas.
      </p>
    </div>
  );
}
