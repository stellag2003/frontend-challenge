import { expect, test } from "@playwright/test";

import {
  changeEditionSilently,
  markPageInstance,
  openWithScenario,
  pageWasNotReloaded,
  placedOrders,
  publishNftUpdate,
  summaryValue,
} from "./support";

test.describe("Funcionalidade: Cotação desatualizada no carrinho e no checkout", () => {
  test("Cenário: Preço sobe com a edição no carrinho", async ({ page }) => {
    // Dado que o colecionador tem no carrinho 2 unidades da edição "3 de 10" a 0.85 ETH
    await openWithScenario(page, "preco-sobe", "/carrinho");
    const item = page.getByRole("listitem", { name: /Edição 3 de 10/ });
    await expect(item).toContainText("Quantidade: 2");
    await expect(item.getByTestId("unit-price")).toHaveText("0.85 ETH");

    // E o resumo do carrinho mostra subtotal de 1.70 ETH
    const subtotal = summaryValue(page, "Resumo do carrinho", "Subtotal");
    await expect(subtotal).toHaveText("1.70 ETH");
    await markPageInstance(page);

    // E a versão do NFT conhecida é 4 (massa "preco-sobe" do servidor simulado)
    // Quando chega um evento nft.updated da edição "3 de 10" com versão 5 e preço 0.92 ETH
    await publishNftUpdate(page, { editionId: "ed-aurora-3-de-10", version: 5, price: "0.92" });

    // Então o colecionador vê um aviso da edição "3 de 10" de "0.85 ETH" para "0.92 ETH"
    const notice = page.getByRole("alert", { name: "Aviso da edição 3 de 10" });
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("A edição 3 de 10");
    await expect(notice).toContainText("de 0.85 ETH para 0.92 ETH");

    // E o resumo do carrinho passa a mostrar subtotal de 1.84 ETH, sem recarregar a página
    await expect(subtotal).toHaveText("1.84 ETH");
    await expect(item.getByTestId("unit-price")).toHaveText("0.92 ETH");
    expect(await pageWasNotReloaded(page)).toBe(true);
  });

  test("Cenário: Confirmação barrada por mudança durante a revisão do pagamento", async ({ page }) => {
    // Dado que o colecionador aceitou uma cotação de 1 unidade a 0.50 ETH com taxa de rede de 0.01 ETH e total de 0.51 ETH
    await openWithScenario(page, "revisao-pagamento", "/pagamento");
    const quote = page.getByRole("region", { name: "Cotação em revisão" });
    await expect(quote).toContainText("Edição 1 de 5 × 1");
    await expect(quote).toContainText("0.50 ETH");
    await expect(summaryValue(page, "Cotação em revisão", "Taxa de rede")).toHaveText("0.01 ETH");
    await expect(summaryValue(page, "Cotação em revisão", "Total")).toHaveText("0.51 ETH");
    const confirm = quote.getByRole("button", { name: "Confirmar compra de 0.51 ETH" });
    await expect(confirm).toBeEnabled();

    // E o preço da edição passa a 0.55 ETH antes de ele confirmar
    // (sem evento de tempo real: quem percebe é a revalidação na confirmação)
    await changeEditionSilently(page, "ed-mare-1-de-5", { price: "0.55" });

    // Quando o colecionador aciona "confirmar"
    await confirm.click();

    // E a revalidação retorna total de 0.56 ETH
    const changed = page.getByRole("alert", { name: "A cotação mudou" });
    await expect(changed).toBeVisible();
    await expect(summaryValue(page, "Cotação em revisão", "Total")).toHaveText("0.56 ETH");

    // Então nenhum pedido é enviado
    await expect(changed).toContainText("nenhum pedido foi enviado");
    await expect(page.getByRole("region", { name: "Pedido confirmado" })).toHaveCount(0);
    expect(await placedOrders(page)).toHaveLength(0);

    // E o colecionador vê que o preço mudou de "0.50 ETH" para "0.55 ETH" e o total de "0.51 ETH" para "0.56 ETH"
    await expect(changed).toContainText("Preço da edição 1 de 5 (Maré Alta): de 0.50 ETH para 0.55 ETH");
    await expect(changed).toContainText("Total: de 0.51 ETH para 0.56 ETH");

    // E o Checkout exige uma nova confirmação do colecionador para o total de 0.56 ETH
    await expect(quote.getByRole("button", { name: "Confirmar compra de 0.51 ETH" })).toHaveCount(0);
    const reconfirm = quote.getByRole("button", { name: "Confirmar nova cotação de 0.56 ETH" });
    await expect(reconfirm).toBeEnabled();

    // (complemento) com a nova confirmação e a cotação inalterada, o pedido é enviado
    await reconfirm.click();
    await expect(page.getByRole("region", { name: "Pedido confirmado" })).toContainText("0.56 ETH");
    expect(await placedOrders(page)).toHaveLength(1);
  });

  test("Cenário: Evento duplicado e evento atrasado são ignorados", async ({ page }) => {
    // Dado que o colecionador tem no carrinho 1 unidade de uma edição a 0.95 ETH
    // E a versão do NFT conhecida é 7
    // E um aviso de "0.90 ETH" para "0.95 ETH" já foi exibido
    // (preparação: a massa começa na versão 6 a 0.90 ETH e o servidor publica a versão 7)
    await openWithScenario(page, "eventos-repetidos", "/carrinho");
    const item = page.getByRole("listitem", { name: /Edição 7 de 20/ });
    const subtotal = summaryValue(page, "Resumo do carrinho", "Subtotal");
    await expect(item.getByTestId("unit-price")).toHaveText("0.90 ETH");
    await publishNftUpdate(page, { editionId: "ed-vento-7-de-20", version: 7, price: "0.95" });

    const notices = page.getByRole("alert", { name: /^Aviso da edição/ });
    await expect(notices).toHaveCount(1);
    await expect(notices).toContainText("de 0.90 ETH para 0.95 ETH");
    await expect(item).toContainText("Quantidade: 1");
    await expect(item.getByTestId("unit-price")).toHaveText("0.95 ETH");
    await expect(subtotal).toHaveText("0.95 ETH");

    // Quando chega novamente o evento nft.updated com versão 7 e preço 0.95 ETH
    await publishNftUpdate(page, { editionId: "ed-vento-7-de-20", version: 7, price: "0.95" });
    // E chega um evento nft.updated com versão 6 e preço 0.90 ETH
    await publishNftUpdate(page, { editionId: "ed-vento-7-de-20", version: 6, price: "0.90" });
    // Margem para que uma reação indevida (novo aviso, novo resumo) chegasse à tela.
    await page.waitForTimeout(500);

    // Então o preço exibido continua 0.95 ETH
    await expect(item.getByTestId("unit-price")).toHaveText("0.95 ETH");
    // E nenhum novo aviso é exibido
    await expect(notices).toHaveCount(1);
    await expect(page.getByText("de 0.95 ETH para 0.90 ETH")).toHaveCount(0);
    // E o resumo do carrinho continua com subtotal de 0.95 ETH
    await expect(subtotal).toHaveText("0.95 ETH");
  });
});
