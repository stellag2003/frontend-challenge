import { expect, type Page } from "@playwright/test";

/** Formato do gancho exposto pela camada de mocks em `window.__mocks`. */
interface MockControls {
  publishNftUpdate(update: { editionId: string; version: number; price?: string; available?: number }): Promise<void>;
  changeEditionSilently(editionId: string, change: { price?: string; available?: number }): void;
  orders(): Array<{ orderId: string; total: string }>;
}

type MockWindow = Window & { __mocks: MockControls; __MOCK_SCENARIO__?: string; __pageInstance?: string };

/** Escolhe a massa do servidor simulado antes de a aplicação carregar e abre a página. */
export async function openWithScenario(page: Page, scenario: string, path: string) {
  await page.addInitScript((name) => {
    (window as unknown as MockWindow).__MOCK_SCENARIO__ = name;
  }, scenario);
  await page.goto(path);
  await expect(page.getByRole("status").filter({ hasText: "Tempo real: conectado" })).toBeVisible();
}

/** O "servidor" publica `nft.updated`; o evento chega pelo socket.io-client da aplicação. */
export async function publishNftUpdate(
  page: Page,
  update: { editionId: string; version: number; price?: string; available?: number },
) {
  await page.evaluate((u) => (window as unknown as MockWindow).__mocks.publishNftUpdate(u), update);
}

/** Muda o preço no servidor sem publicar evento (como se o evento tivesse se perdido). */
export async function changeEditionSilently(page: Page, editionId: string, change: { price?: string }) {
  await page.evaluate(
    ({ id, c }) => (window as unknown as MockWindow).__mocks.changeEditionSilently(id, c),
    { id: editionId, c: change },
  );
}

export async function placedOrders(page: Page) {
  return page.evaluate(() => (window as unknown as MockWindow).__mocks.orders());
}

/** Marca a página atual; se ela for recarregada, a marca some. */
export async function markPageInstance(page: Page) {
  await page.evaluate(() => {
    (window as unknown as MockWindow).__pageInstance = "original";
  });
}

export async function pageWasNotReloaded(page: Page) {
  return page.evaluate(() => (window as unknown as MockWindow).__pageInstance === "original");
}

/** Valor exibido para um termo (Subtotal, Total…) dentro de um bloco nomeado da tela. */
export function summaryValue(page: Page, blockName: string, term: string) {
  return page
    .getByRole("complementary", { name: blockName })
    .or(page.getByRole("region", { name: blockName }))
    .locator(`dt:text-is("${term}") + dd`);
}
