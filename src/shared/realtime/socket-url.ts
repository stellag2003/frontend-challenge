/**
 * Endereço do servidor Socket.IO. Fica separado do servidor do Vite para que o
 * WebSocket de HMR nunca seja confundido com o de tempo real.
 */
export const realtimeSocketUrl: string = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

/** Mesmo endereço no esquema ws(s)://, como o MSW enxerga a conexão. */
export function toWebSocketUrl(url: string): string {
  return url.replace(/^http/, "ws").replace(/\/$/, "");
}
