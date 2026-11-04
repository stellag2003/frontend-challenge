import { io, type Socket } from "socket.io-client";
import { z } from "zod";

import type { NftEventsSource, RealtimeStatus } from "../domain/checkout-ports";
import type { NftUpdatedEvent } from "../domain/nft-updated";

const nftUpdatedSchema = z.object({
  eventId: z.string().min(1),
  type: z.literal("nft.updated"),
  resource: z.object({ type: z.literal("nft"), nftId: z.string(), editionId: z.string() }),
  version: z.number().int().nonnegative(),
  data: z.object({
    price: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    available: z.number().int().nonnegative().optional(),
  }),
  occurredAt: z.string(),
});

/**
 * Adaptador Socket.IO para `nft.updated`. Conecta na primeira inscrição e
 * valida o payload na borda: eventos malformados são descartados.
 */
export class SocketIoNftEventsSource implements NftEventsSource {
  private socket: Socket | null = null;
  private status: RealtimeStatus = "disconnected";
  private readonly listeners = new Set<(event: NftUpdatedEvent) => void>();
  private readonly statusListeners = new Set<(status: RealtimeStatus) => void>();

  constructor(private readonly url: string) {}

  subscribe(listener: (event: NftUpdatedEvent) => void): () => void {
    this.ensureConnected();
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStatus(): RealtimeStatus {
    return this.status;
  }

  subscribeStatus(listener: (status: RealtimeStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private ensureConnected() {
    if (this.socket) return;
    this.setStatus("connecting");
    const socket = io(this.url, { path: "/socket.io", transports: ["websocket"] });
    socket.on("connect", () => this.setStatus("connected"));
    socket.on("disconnect", () => this.setStatus("disconnected"));
    socket.on("nft.updated", (payload: unknown) => {
      const parsed = nftUpdatedSchema.safeParse(payload);
      if (!parsed.success) return;
      for (const listener of this.listeners) listener(parsed.data);
    });
    this.socket = socket;
  }

  private setStatus(status: RealtimeStatus) {
    this.status = status;
    for (const listener of this.statusListeners) listener(status);
  }
}
