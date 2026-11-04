/**
 * Massas de dados do "servidor" simulado. O teste escolhe uma definindo
 * `window.__MOCK_SCENARIO__` antes de a página carregar (ex.: `page.addInitScript`).
 */
export interface EditionSeed {
  editionId: string;
  nftId: string;
  title: string;
  editionLabel: string;
  price: string;
  available: number;
  version: number;
}

export interface ScenarioSeed {
  editions: EditionSeed[];
  cart: Array<{ editionId: string; quantity: number }>;
  networkFee: string;
  coupon: { code: string; discount: string } | null;
}

const farolOutsideCart: EditionSeed = {
  editionId: "ed-farol-1-de-3",
  nftId: "nft-farol",
  title: "Farol Submerso",
  editionLabel: "1 de 3",
  price: "2.40",
  available: 1,
  version: 2,
};

export const scenarios: Record<string, ScenarioSeed> = {
  padrao: {
    editions: [
      {
        editionId: "ed-aurora-3-de-10",
        nftId: "nft-aurora",
        title: "Aurora Boreal #12",
        editionLabel: "3 de 10",
        price: "0.85",
        available: 5,
        version: 4,
      },
      {
        editionId: "ed-mare-1-de-5",
        nftId: "nft-mare",
        title: "Maré Alta",
        editionLabel: "1 de 5",
        price: "0.50",
        available: 3,
        version: 2,
      },
      farolOutsideCart,
    ],
    cart: [
      { editionId: "ed-aurora-3-de-10", quantity: 2 },
      { editionId: "ed-mare-1-de-5", quantity: 1 },
    ],
    networkFee: "0.01",
    coupon: null,
  },

  /** Cenário BDD 1 — Preço sobe com a edição no carrinho. */
  "preco-sobe": {
    editions: [
      {
        editionId: "ed-aurora-3-de-10",
        nftId: "nft-aurora",
        title: "Aurora Boreal #12",
        editionLabel: "3 de 10",
        price: "0.85",
        available: 5,
        version: 4,
      },
      farolOutsideCart,
    ],
    cart: [{ editionId: "ed-aurora-3-de-10", quantity: 2 }],
    networkFee: "0.01",
    coupon: null,
  },

  /** Cenário BDD 2 — Confirmação barrada por mudança durante a revisão do pagamento. */
  "revisao-pagamento": {
    editions: [
      {
        editionId: "ed-mare-1-de-5",
        nftId: "nft-mare",
        title: "Maré Alta",
        editionLabel: "1 de 5",
        price: "0.50",
        available: 3,
        version: 2,
      },
    ],
    cart: [{ editionId: "ed-mare-1-de-5", quantity: 1 }],
    networkFee: "0.01",
    coupon: null,
  },

  /** Cenário BDD 3 — Evento duplicado e evento atrasado. Começa na versão 6 a 0.90 ETH. */
  "eventos-repetidos": {
    editions: [
      {
        editionId: "ed-vento-7-de-20",
        nftId: "nft-vento",
        title: "Vento Norte",
        editionLabel: "7 de 20",
        price: "0.90",
        available: 4,
        version: 6,
      },
    ],
    cart: [{ editionId: "ed-vento-7-de-20", quantity: 1 }],
    networkFee: "0.01",
    coupon: null,
  },
};
