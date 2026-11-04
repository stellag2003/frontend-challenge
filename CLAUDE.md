# CLAUDE.md

Projeto: Desafio Frontend — Marketplace de NFTs (ver README.md). Use a linguagem ubíqua abaixo em specs, código e testes.

---

# Glossário — Marketplace de NFTs

> Linguagem ubíqua do Desafio Frontend. Cada termo pertence a **um** bounded context e
> mora na pasta indicada. Quando o mesmo nome aparece em dois contextos, ele tem dois
> significados e precisa de dois termos.
>
> Levantamento dos substantivos feito pelo agente a partir do `README.md`; significados
> redigidos pelo agente a pedido da autora (ver `REVIEW.md`).

## Bounded contexts

| Contexto | Pasta | Responsabilidade | Seções do README |
| --- | --- | --- | --- |
| Catálogo | `src/modules/catalog/` | Descoberta de NFTs: busca, filtros, ordenação, paginação, detalhe e favoritos | 3 (Início, Detalhes), 3 "Catálogo e detalhe", 5 (NFTs, Favoritos) |
| Carrinho | `src/modules/cart/` | O que o colecionador pretende comprar e o resumo de valores antes do checkout | 3 (Carrinho), 3 "Carrinho", 5 (Carrinho) |
| Checkout | `src/modules/checkout/` | Cotação, pagamento, pedido e recibo | 3 (Pagamento, Confirmação), 3 "Pagamento e confirmação", 5 (Cotação, Pedidos), 7 |
| Conta | `src/modules/account/` | Cadastro, login, sessão e perfil do colecionador | 3 (Login, Cadastro, Perfil), 3 "Conta e sessão", 5 (Sessão e conta, Perfil) |
| Carteiras | `src/modules/wallet/` | Carteiras do colecionador, rede e conexão simulada | 3 (Carteiras, Pagamento), 5 (Carteiras) |

## Termos

| Termo | Significado | Contexto | Pasta | Não confundir com |
| --- | --- | --- | --- | --- |
| Colecionador | Pessoa autenticada que descobre, compra e coleciona NFTs. É o dono da conta, do carrinho, das carteiras e dos pedidos. | Conta | `src/modules/account/` | Visitante |
| Visitante | Pessoa não autenticada. Pode navegar no catálogo e montar um carrinho, que é preservado quando ela se autentica. | Conta | `src/modules/account/` | Colecionador |
| Sessão | Período autenticado do colecionador. Recuperável após refresh; ao expirar, o contexto em andamento é preservado para retomada. | Conta | `src/modules/account/` | Conexão (da carteira) |
| Expiração da sessão | Fim da sessão por tempo, detectado em qualquer chamada. Exige novo login sem perder o que o colecionador fazia. | Conta | `src/modules/account/` | Cupom expirado |
| Perfil | Dados pessoais do colecionador: nome, e-mail, avatar, senha. | Conta | `src/modules/account/` | — |
| NFT | Obra digital listada no catálogo, identificada por `nftId`. Tem uma ou mais edições. | Catálogo | `src/modules/catalog/` | Edição |
| **Edição** | **Tiragem numerada de um NFT** (ex.: "edição 3 de 10"), com preço e disponibilidade próprios. É o que de fato entra no carrinho. | Catálogo | `src/modules/catalog/` | **Alteração de dados** (ver abaixo) |
| Alteração de dados | Ato de modificar um registro (perfil, carteira, quantidade). O README chama isso também de "edição" ("Edição dos dados", "Edição de quantidades", "Cadastro e edição de carteiras"). No código usamos `update`/`change`, nunca `edition`. | Conta / Carteiras / Carrinho | — | Edição |
| Disponibilidade | Quantidade de unidades de uma edição que ainda pode ser comprada. Zero = esgotada. | Catálogo | `src/modules/catalog/` | — |
| Preço | Valor unitário de uma edição em ETH, trafegado como string decimal. Muda em tempo real (`nft.updated`). | Catálogo | `src/modules/catalog/` | Total, Cotação |
| Versão do NFT | Número crescente que acompanha cada mudança de preço ou disponibilidade. Eventos com versão menor ou igual à conhecida são ignorados. | Catálogo | `src/modules/catalog/` | Versão publicada (deploy) |
| Favorito | Marcação de um NFT pelo colecionador, persistida por usuário. | Catálogo | `src/modules/catalog/` | — |
| Filtros da vitrine | Busca, filtros, ordenação e paginação que compõem a URL do catálogo. | Catálogo | `src/modules/catalog/` | — |
| Carrinho | Lista de itens que o colecionador pretende comprar. Sobrevive a refresh e ao login. | Carrinho | `src/modules/cart/` | Pedido |
| Item do carrinho | Par (edição, quantidade inteira) dentro do carrinho, limitado pela disponibilidade. | Carrinho | `src/modules/cart/` | Item do pedido |
| Cupom | Código promocional aplicado ao carrinho. Pode ser válido, inválido (não existe) ou expirado (existiu, venceu). Um cupom por carrinho. | Carrinho | `src/modules/cart/` | — |
| Resumo do carrinho | Subtotal, desconto, taxa de rede e total **calculados pela API** para o carrinho atual. É informativo: não trava preço. | Carrinho | `src/modules/cart/` | Cotação |
| Subtotal | Soma de preço × quantidade dos itens. | Carrinho | `src/modules/cart/` | Total |
| Desconto | Valor abatido pelo cupom. | Carrinho | `src/modules/cart/` | — |
| Taxa de rede | Custo simulado da rede blockchain escolhida, somado ao total. | Carrinho / Checkout | `src/modules/cart/` | Condições de rede (mocks) |
| Total | Subtotal − desconto + taxa de rede. | Carrinho / Checkout | `src/modules/cart/` | Preço |
| **Cotação** | **Fotografia versionada do carrinho emitida pela API no checkout** (`quoteId` + `quoteVersion`): itens, preços, cupom, taxas e total válidos naquele instante. É a única referência aceita para confirmar o pedido. | Checkout | `src/modules/checkout/` | Resumo do carrinho |
| Cotação desatualizada | Cotação cujo preço, disponibilidade, cupom ou taxa não corresponde mais ao estado atual. Não pode confirmar pedido; exige nova confirmação do colecionador. | Checkout | `src/modules/checkout/` | — |
| Revalidação | Pedido de nova cotação à API antes de confirmar a compra. | Checkout | `src/modules/checkout/` | — |
| Pedido | Intenção de compra enviada com uma cotação e uma chave de idempotência. Estados: pendente → confirmado ou recusado (terminais). | Checkout | `src/modules/checkout/` | Carrinho |
| Chave de idempotência | Identificador de uma tentativa de compra. A mesma chave recupera o mesmo pedido; a mesma chave com conteúdo diferente gera conflito. | Checkout | `src/modules/checkout/` | — |
| **Confirmação do pedido** | Estado terminal em que a simulação aceitou o pagamento; dá acesso ao recibo. | Checkout | `src/modules/checkout/` | **Confirmação do colecionador** |
| Confirmação do colecionador | Ato de o colecionador aceitar uma cotação (inclusive uma nova, após mudança). | Checkout | `src/modules/checkout/` | Confirmação do pedido |
| Recibo | Snapshot imutável do pedido confirmado: itens, quantidades, taxas, total e referência da transação. | Checkout | `src/modules/checkout/` | Resumo do carrinho |
| Referência da transação | Identificador simulado da transação e link de exploração. | Checkout | `src/modules/checkout/` | — |
| Carteira | Endereço do colecionador usado para pagar; uma principal e uma secundária. | Carteiras | `src/modules/wallet/` | — |
| Rede | Blockchain escolhida para o pagamento (ex.: Ethereum, Polygon). Define a taxa de rede. | Carteiras | `src/modules/wallet/` | Condições de rede (mocks) |
| **Conexão da carteira** | Simulação de a carteira aceitar, recusar ou desconectar durante o pagamento. | Carteiras | `src/modules/wallet/` | **Conexão em tempo real** (socket) |
| **Recusa** | Na carteira: o colecionador nega a conexão. No pedido: estado terminal "recusado". São termos distintos: `WalletConnectionRejected` × `OrderRejected`. | Carteiras / Checkout | `src/modules/wallet/`, `src/modules/checkout/` | — |

## A palavra que muda de sentido

**Edição.** Nas seções 3 "Detalhes do NFT", 3 "Catálogo e detalhe" ("edição indisponível"),
3 "Carrinho" ("disponibilidade por NFT e edição") e 6 ("edição esgotada"), *edição* é a
**tiragem numerada de um NFT**, algo que se compra. Nas telas Carrinho ("Edição de
quantidades"), Perfil ("Edição dos dados"), Carteiras ("Cadastro e edição de carteiras") e
na seção 9 ("Edição de perfil"), *edição* é **o ato de alterar um dado**. Decisão: `Edição`
no glossário e no código (`Edition`) significa só a tiragem; o outro sentido vira
"alteração de dados" (`update`).

Outras palavras com mais de um sentido no README, resolvidas acima: **rede** (blockchain ×
condições de rede dos mocks, seção 6), **conexão** (carteira × socket, seções 3 e 7),
**confirmação** (do pedido × do colecionador, seção 3 "Pagamento e confirmação"),
**expiração** (sessão × cupom) e **versão** (do NFT na seção 7 × versão publicada na seção 12).
