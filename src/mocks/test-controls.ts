import { checkoutDb, type OrderRecord } from "./checkout/db";
import { connectedClients, emitNftUpdated } from "./checkout/realtime";

/**
 * Gancho de controle do "servidor" simulado, exposto em `window.__mocks` só quando
 * os mocks estão ligados. Os testes E2E o usam para mudar o estado do servidor e
 * publicar `nft.updated` — o evento chega à aplicação pelo `socket.io-client`.
 */
export interface MockControls {
  /**
   * Publica `nft.updated` como o servidor faria. Se a versão for mais nova que a do
   * servidor, o estado da edição é atualizado; versões repetidas/antigas são só
   * reentregues (simulam duplicata ou atraso na rede), sem regredir o servidor.
   */
  publishNftUpdate(update: { editionId: string; version: number; price?: string; available?: number }): Promise<void>;
  /** Muda preço/disponibilidade no servidor sem publicar evento (evento perdido). */
  changeEditionSilently(editionId: string, change: { price?: string; available?: number }): void;
  setNetworkFee(fee: string): void;
  orders(): OrderRecord[];
  connectedClients(): number;
}

declare global {
  interface Window {
    __mocks?: MockControls;
  }
}

export const mockControls: MockControls = {
  async publishNftUpdate(update) {
    checkoutDb.applyEditionUpdate(update);
    const edition = checkoutDb.getEdition(update.editionId);
    const data: { price?: string; available?: number } = {};
    if (update.price !== undefined) data.price = update.price;
    if (update.available !== undefined) data.available = update.available;

    await emitNftUpdated({
      // Identidade estável por (recurso, versão): a reentrega repete o mesmo id.
      eventId: `nft.updated:${update.editionId}:v${update.version}`,
      type: "nft.updated",
      resource: { type: "nft", nftId: edition.nftId, editionId: edition.editionId },
      version: update.version,
      data,
      occurredAt: new Date().toISOString(),
    });
  },

  changeEditionSilently(editionId, change) {
    checkoutDb.bumpEdition(editionId, change);
  },

  setNetworkFee(fee) {
    checkoutDb.setNetworkFee(fee);
  },

  orders() {
    return checkoutDb.orders();
  },

  connectedClients,
};

export function exposeMockControls() {
  window.__mocks = mockControls;
}
