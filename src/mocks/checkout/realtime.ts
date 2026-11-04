import { ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";

import { realtimeSocketUrl, toWebSocketUrl } from "@/shared/realtime/socket-url";

/**
 * Servidor Socket.IO simulado. O MSW intercepta o WebSocket aberto pelo
 * `socket.io-client` da aplicação e o binding cuida do protocolo do Socket.IO
 * (handshake, codificação dos pacotes).
 * Obs.: o MSW descarta o caminho "/socket.io/" ao comparar, por isso o link é a origem.
 */
const socketIoLink = ws.link(toWebSocketUrl(realtimeSocketUrl));

type SocketIoConnection = ReturnType<typeof toSocketIo>;

const connections = new Set<SocketIoConnection>();

export interface NftUpdatedPayload {
  eventId: string;
  type: "nft.updated";
  resource: { type: "nft"; nftId: string; editionId: string };
  version: number;
  data: { price?: string; available?: number };
  occurredAt: string;
}

export const realtimeHandlers = [
  socketIoLink.addEventListener("connection", (connection) => {
    const io = toSocketIo(connection);
    connections.add(io);

    // Mantém a conexão viva: o cliente encerra se não receber ping do Engine.IO.
    const heartbeat = window.setInterval(() => connection.client.send("2"), 20_000);

    connection.client.addEventListener("close", () => {
      window.clearInterval(heartbeat);
      connections.delete(io);
    });
  }),
];

export function connectedClients(): number {
  return connections.size;
}

/** Envia `nft.updated` a todos os clientes conectados e espera a entrega. */
export async function emitNftUpdated(payload: NftUpdatedPayload): Promise<void> {
  if (connections.size === 0) {
    throw new Error("Nenhum cliente Socket.IO conectado ao servidor simulado.");
  }
  for (const io of connections) io.client.emit("nft.updated", payload);
  // A entrega no cliente interceptado é assíncrona; dá alguns ciclos ao event loop.
  for (let i = 0; i < 3; i++) await new Promise((resolve) => setTimeout(resolve, 0));
}
