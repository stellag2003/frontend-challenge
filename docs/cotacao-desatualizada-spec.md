# Spec — Cotação desatualizada no carrinho e no checkout

- **Bounded context:** Checkout (`src/modules/checkout/`), consumindo Carrinho e Catálogo
- **Tamanho:** M
- **ADR:** [`docs/adr/0001-cotacao-desatualizada.md`](adr/0001-cotacao-desatualizada.md)
- **Origem:** RESEARCH §7 do enunciado (cadeia de tempo real): um NFT está no carrinho →
  seu preço ou disponibilidade muda → a interface informa a alteração e atualiza o resumo →
  o checkout impede a confirmação com uma cotação desatualizada.

## Objetivo

O colecionador nunca confirma um pedido com uma cotação que não aprovou: ele é avisado de
qual edição mudou (valor antigo e novo), vê o resumo do carrinho atualizado pela API e
precisa dar uma nova confirmação do colecionador antes de qualquer pedido ser enviado.

## Critérios de aceitação (EARS)

> Revisados pela autora: cada critério tem ao lado a frase do RESEARCH.md e a seção do
> README de onde veio. Critério sem origem não entra.

- **EARS-1 (Ubiquitous):** O Checkout deve enviar um pedido somente com a cotação aceita na
  última confirmação do colecionador, exibindo preço, taxa de rede e total exatamente como
  as strings decimais em ETH retornadas pela API, sem arredondamento.
  - *RESEARCH §4.6:* "a compra pode ser finalizada com um valor que ele não aprovou explicitamente."
  - *README §3 Carrinho:* "Valores em ETH devem trafegar como strings decimais e manter precisão
    nos cálculos e na apresentação. […] A cotação da API é a referência para finalizar o pedido."
- **EARS-2 (When):** Quando chegar um evento `nft.updated` com versão do NFT maior que a
  conhecida para uma edição presente no carrinho, o sistema deve exibir um aviso persistente
  que identifica a edição com o valor antigo e o novo de preço ou disponibilidade, e deve
  atualizar o resumo do carrinho com os valores da API; eventos com versão menor ou igual à
  conhecida, ou de edições fora do carrinho, não devem gerar aviso nem alterar o resumo.
  - *RESEARCH §8.1:* "o colecionador vê um aviso que identifica o item e mostra o valor antigo e o
    novo"; *§8.8:* "A mesma mudança nunca gera dois avisos"; *§8.9:* "O preço exibido nunca 'volta'
    para um valor mais antigo".
  - *README §7:* "Os eventos devem carregar identidade estável, recurso afetado e versão. O cliente
    deve tolerar duplicatas e eventos antigos […]"; cenário, passo 3: "A interface informa a
    alteração e atualiza o resumo."
- **EARS-3 (While):** Enquanto a cotação estiver desatualizada, o Checkout deve impedir que
  a confirmação do colecionador finalize o pedido e deve exibir o que mudou desde a última
  revisão.
  - *RESEARCH §8.6:* "o botão de confirmar não finaliza a compra com o valor antigo; ele vê o que
    mudou e precisa aprovar de novo."
  - *README §7*, cenário, passo 4: "O checkout impede a confirmação com uma cotação desatualizada."
- **EARS-4 (If-then):** Se a revalidação feita ao acionar "confirmar" retornar uma cotação
  com preço, disponibilidade, cupom ou taxa de rede diferente da cotação aceita, então o
  Checkout não deve enviar o pedido, deve marcar a cotação como desatualizada e deve exigir
  uma nova confirmação do colecionador — inclusive quando o preço caiu.
  - *RESEARCH §6.10:* "a confirmação com o valor antigo deve ser barrada e uma nova aprovação pedida."
  - *README §3 Pagamento e confirmação:* "Revalidar preço, disponibilidade, cupom e taxas antes de
    confirmar a compra. Mudanças devem exigir nova confirmação do usuário." (o "inclusive quando
    o preço caiu" vem daqui: o README não distingue direção; o RESEARCH §6.2 só pede que a
    queda seja informada).
- **EARS-5 (While):** Enquanto o carrinho contiver uma edição com disponibilidade zero, o
  sistema deve marcá-la como indisponível, mantê-la visível fora do total e impedir a
  confirmação do colecionador até que ela seja removida.
  - *RESEARCH §8.4:* "Quando a edição esgota, o item fica claramente marcado como indisponível e
    não entra no total a pagar."
  - *README §3 Carrinho:* "respeitando a disponibilidade por NFT e edição"; *§7* `nft.updated`:
    "Atualizar preço e disponibilidade no […] carrinho".
  - *Revisão:* o agente usou "Where", que em EARS é para feature opcional; esgotada é um
    estado, então virou "While".

## Cenários (BDD)

```gherkin
# language: pt
Funcionalidade: Cotação desatualizada no carrinho e no checkout

  Cenário: Preço sobe com a edição no carrinho
    Dado que o colecionador tem no carrinho 2 unidades da edição "3 de 10" a 0.85 ETH
    E o resumo do carrinho mostra subtotal de 1.70 ETH
    E a versão do NFT conhecida é 4
    Quando chega um evento nft.updated da edição "3 de 10" com versão 5 e preço 0.92 ETH
    Então o colecionador vê um aviso da edição "3 de 10" de "0.85 ETH" para "0.92 ETH"
    E o resumo do carrinho passa a mostrar subtotal de 1.84 ETH, sem recarregar a página

  Cenário: Confirmação barrada por mudança durante a revisão do pagamento
    Dado que o colecionador aceitou uma cotação de 1 unidade a 0.50 ETH com taxa de rede de 0.01 ETH e total de 0.51 ETH
    E o preço da edição passa a 0.55 ETH antes de ele confirmar
    Quando o colecionador aciona "confirmar"
    E a revalidação retorna total de 0.56 ETH
    Então nenhum pedido é enviado
    E o colecionador vê que o preço mudou de "0.50 ETH" para "0.55 ETH" e o total de "0.51 ETH" para "0.56 ETH"
    E o Checkout exige uma nova confirmação do colecionador para o total de 0.56 ETH

  Cenário: Evento duplicado e evento atrasado são ignorados
    Dado que o colecionador tem no carrinho 1 unidade de uma edição a 0.95 ETH
    E a versão do NFT conhecida é 7
    E um aviso de "0.90 ETH" para "0.95 ETH" já foi exibido
    Quando chega novamente o evento nft.updated com versão 7 e preço 0.95 ETH
    E chega um evento nft.updated com versão 6 e preço 0.90 ETH
    Então o preço exibido continua 0.95 ETH
    E nenhum novo aviso é exibido
    E o resumo do carrinho continua com subtotal de 0.95 ETH
```

## Rastreabilidade

A origem de cada critério está anotada ao lado dele, acima. Cobertura dos cenários:
cenário 1 → EARS-2; cenário 2 (erro) → EARS-3, EARS-4, EARS-1; cenário 3 (limite) → EARS-2.
EARS-5 não tem cenário BDD próprio nesta entrega.

## Decisões sobre perguntas em aberto

Detalhadas na ADR 0001. Em resumo: esgotado fica visível e bloqueia até ser removido (P2);
queda de preço também exige nova confirmação (P3); aviso persiste até ser reconhecido (P4);
aviso aparece ao voltar ao carrinho/pagamento, não em outras telas (P5); sem variação mínima
(P7); taxa de rede conta, detectada pela revalidação (P8); sem prazo de validade da cotação,
pois toda confirmação revalida (P9); visitante fora do escopo (P10).

## Fora do escopo

- Estoque parcial (ex.: 3 no carrinho, 2 disponíveis) e a decisão de reduzir ou remover (P1).
- Reconexão e reconciliação dos recursos ativos com a API REST após queda de conexão.
- Troca de usuário e eventos destinados à sessão anterior.
- Cupom invalidado pela mudança de preço (P6) e validação de cupom em si.
- Recibo e snapshot do pedido; mudanças depois da confirmação do pedido.
- Pedidos duplicados por cliques repetidos e recuperação de pedido pendente.
- Aviso em telas de catálogo e detalhe, e atualização de preço para quem não tem o NFT no
  carrinho.
- Carrinho do visitante (não autenticado).
- Reserva de preço ou estoque; definição de preço pelo vendedor.
- Escolha de carteira, rede e dados pessoais no pagamento.
