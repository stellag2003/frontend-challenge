import { cn } from "@/lib/utils";
import type { RealtimeStatus as Status } from "../domain/checkout-ports";

const labels: Record<Status, string> = {
  connecting: "Tempo real: conectando…",
  connected: "Tempo real: conectado",
  disconnected: "Tempo real: desconectado",
};

export function RealtimeStatus({ status }: { status: Status }) {
  return (
    <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        aria-hidden
        className={cn(
          "h-2 w-2 rounded-full",
          status === "connected" ? "bg-success" : status === "connecting" ? "bg-primary" : "bg-destructive",
        )}
      />
      {labels[status]}
    </p>
  );
}
