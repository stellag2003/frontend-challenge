# ADR 0001 — Bloquear a confirmação com cotação desatualizada

- **Status:** Proposta
- **Data:** 2026-11-04
- **Bounded context:** Checkout (`src/modules/checkout/`)
- **Spec relacionada:** [`docs/cotacao-desatualizada-spec.md`](../cotacao-desatualizada-spec.md)

## Contexto

O colecionador decide comprar olhando o preço e a disponibilidade de cada edição, mas esses
valores mudam em tempo real (`nft.updated`) enquanto a edição está no carrinho ou na tela de
pagamento. Hoje ele pode confirmar uma compra diferente da que achou que estava fazendo, sem
ser avisado (RESEARCH §2 e §4: dinheiro, confiança, clareza, controle).

O enunciado define as regras que a solução precisa cumprir (RESEARCH §5):

- refletir alterações de preço e disponibilidade enquanto o carrinho estiver aberto (§5.1);
- o resumo do carrinho (subtotal, desconto, taxa de rede, total) é **calculado pela API**
  e os valores em ETH trafegam como strings decimais; a cotação da API é a referência para
  finalizar o pedido (§5.3, §5.4);
- revalidar preço, disponibilidade, cupom e taxas antes de confirmar; mudanças exigem nova
  confirmação do colecionador (§5.5);
- eventos carregam identidade, recurso e versão; o cliente tolera duplicatas e eventos
  antigos sem regredir estado (§5.11);
- cadeia alvo (§5.13): NFT no carrinho → preço ou disponibilidade muda → a interface
  informa e atualiza o resumo → o checkout impede a confirmação com cotação desatualizada.

O glossário fixa que o **resumo do carrinho é informativo e não trava preço**, e que uma
**cotação desatualizada** não pode confirmar pedido.

## Decisão

Adotamos duas camadas complementares, ambas sem cálculo de valores no cliente:

1. **Invalidação local por evento versionado.** Ao receber `nft.updated` de uma edição que
   está no carrinho com versão do NFT maior que a conhecida, o cliente:
   - registra a alteração (valor antigo → valor novo) e exibe um aviso que identifica a
     edição;
   - pede um novo resumo do carrinho à API e exibe os valores retornados;
   - se houver uma cotação aprovada no Checkout, marca-a como **cotação desatualizada**.
   Eventos com versão menor ou igual à conhecida são ignorados (sem aviso, sem novo resumo).

2. **Revalidação obrigatória no momento da confirmação.** Ao acionar "confirmar", o
   Checkout sempre faz uma revalidação (nova cotação à API) e só envia o pedido se a nova
   cotação for igual à que o colecionador aprovou. Se diferir em preço, disponibilidade,
   cupom ou taxa de rede, o pedido não é enviado: o Checkout mostra o que mudou e exige uma
   nova confirmação do colecionador.

A camada 1 dá feedback imediato; a camada 2 é a garantia, porque não depende de nenhum
evento ter chegado.

### Decisões sobre perguntas em aberto (RESEARCH §9)

| # | Pergunta | Decisão | Por quê |
| --- | --- | --- | --- |
| 2 | Edição esgotada sai sozinha do carrinho? | Não. Fica visível como indisponível, fora do total, e bloqueia a confirmação até o colecionador removê-la. | §8.4 pede que fique "claramente marcado como indisponível e não entra no total"; remover sozinho apagaria a informação (§4.4 Clareza). |
| 3 | Queda de preço também exige nova confirmação? | Sim. | O enunciado diz "mudanças devem exigir nova confirmação" sem distinguir direção (§5.5); o glossário considera desatualizada qualquer cotação que não corresponde ao estado atual; §4.5 e §6.2 pedem que a queda seja informada. |
| 4 | O aviso some sozinho? | Não. Permanece até o colecionador reconhecê-lo ou até ele aprovar a nova cotação. | §8.5: ao voltar ao carrinho ele deve **encontrar** o aviso. |
| 5 | Avisar em outra tela (catálogo)? | Não nesta entrega: o aviso aparece ao voltar ao carrinho ou ao pagamento. | §8.5 só exige o aviso ao voltar; mantém o tamanho M. |
| 7 | Variação mínima para avisar? | Não há. Toda mudança de preço é avisada. | §6.14 e §8.11 proíbem arredondamento silencioso; qualquer limiar seria um requisito inventado. |
| 8 | Taxa de rede conta como cotação desatualizada? | Sim, mas só é detectada pela revalidação (camada 2). | O glossário inclui "taxa" na definição de cotação desatualizada; §5.5 manda revalidar taxas. Não há evento de taxa no escopo. |
| 9 | Por quanto tempo uma cotação aprovada vale? | Sem prazo no cliente: toda confirmação passa por revalidação. | Elimina a necessidade de um temporizador sem origem no RESEARCH. |
| 10 | Carrinho do visitante? | Fora do escopo; a feature cobre o colecionador. | §1.3: o visitante não sente a dor diretamente. |

As perguntas 1 (estoque parcial) e 6 (cupom invalidado) ficam fora do escopo desta entrega.

## Alternativas consideradas

1. **Confiar só nos eventos `nft.updated`** (sem revalidação na confirmação). Rejeitada:
   eventos podem se perder (§6.12) e a taxa de rede não tem evento; a confirmação poderia
   passar com valor antigo, violando §5.5.
2. **Revalidar só na confirmação** (sem reagir a eventos). Rejeitada: o colecionador só
   descobriria a mudança no último clique, contrariando §5.1, §8.1 e §8.2.
3. **Recalcular o resumo no cliente** a partir do novo preço. Rejeitada: o resumo é
   calculado pela API (glossário, §5.3) e o cálculo local arrisca divergência de precisão
   (§6.14) e de desconto.
4. **Reservar preço/estoque para o colecionador.** Rejeitada: explicitamente fora do problema
   (§7.2).
5. **Exigir nova confirmação só em aumento de preço ou queda de estoque.** Rejeitada pela
   decisão da pergunta 3.

## Consequências

**Positivas**

- Nenhum pedido é enviado com uma cotação que o colecionador não aprovou (§4.6, §8.6, §8.7).
- O aviso identifica a edição e mostra valor antigo e novo (§8.1).
- Duplicatas e eventos antigos não geram aviso nem alteram o resumo (§8.8, §8.9).
- Todos os valores exibidos vêm da API como strings decimais, sem arredondamento (§8.11).

**Negativas / custos**

- Uma chamada extra de cotação em cada confirmação, mesmo sem mudança.
- Cada evento relevante gera uma chamada de resumo à API.
- Queda de preço também interrompe a confirmação, adicionando um passo ao colecionador.
- O Checkout precisa guardar a cotação aprovada e a versão do NFT conhecida por edição.

**Dívidas registradas (próximas entregas)**

- Estoque parcial (3 → 2), reconciliação após reconexão, troca de usuário, cupom invalidado
  pela mudança, recibo e pedidos duplicados.
