# Proposal

## Why

O README exige que o colecionador possa aplicar e remover um cupom no carrinho, com tratamento de código inválido ou expirado, e que o resumo do carrinho (subtotal, desconto, taxa de rede e total) seja coerente com a resposta da API. O bounded context Carrinho (`src/modules/cart/`) ainda não existe no código, e esta change define o comportamento do cupom antes da implementação, a partir de 3 cenários Gherkin escritos à mão (`docs/semana5/cupom-no-carrinho.feature`).

## What Changes

- Nova capability `carrinho/cupom`: aplicar um cupom ao carrinho, remover o cupom aplicado e refletir o desconto no resumo do carrinho.
- O desconto e o total são **calculados pela API** (o resumo do carrinho é informativo); o cliente só exibe os valores recebidos, como strings decimais em ETH.
- Cupom expirado é recusado com a mensagem "Cupom expirado" e não altera o resumo do carrinho.
- **Acréscimo** em relação aos 3 cenários: cupom inválido (não existe) é recusado com a mensagem "Cupom inválido" e não altera o resumo do carrinho. Motivo: o README ("tratamento de código inválido ou expirado") e o glossário (cupom "válido, inválido ou expirado") exigem esse caso, e nenhum dos 3 cenários o cobre.
- **Acréscimo**: requisito explícito de "um cupom por carrinho" (glossário), verificado no cenário de cupom válido (exatamente um cupom aparece como aplicado).
- **Mudança de redação** nos cenários (sem mudar o comportamento): os dados do cupom ("de 10% de desconto", "que expirou em 31/03/2026") saíram do passo `Quando` e viraram pré-condições (`Dado`), porque descrevem o estado da API e não a ação do colecionador. Ver detalhes em `design.md`.

## Capabilities

### New Capabilities
- `carrinho/cupom`: aplicação e remoção do cupom no carrinho do colecionador e o efeito do cupom (desconto) no resumo do carrinho, incluindo a recusa de cupom expirado ou inválido.

### Modified Capabilities
(nenhuma — não há specs existentes em `openspec/specs/`)

## Impact

- Código futuro em `src/modules/cart/` (domínio, aplicação, infraestrutura e apresentação), seguindo a mesma organização em camadas de `src/modules/account/`.
- Contrato REST do recurso Carrinho/Cotação: operações de aplicar e remover cupom que devolvem o resumo do carrinho recalculado.
- Mocks MSW em `src/mocks/handlers/`: fixtures determinísticas para os cupons `NEON10` (válido, 10%), `VERAO2025` (expirado em 31/03/2026) e um código inexistente.
- Fora do escopo desta change: cotação e revalidação no checkout, visitante aplicando cupom, efeito de `nft.updated` sobre o desconto, falhas transitórias de rede (ver perguntas abaixo).

## Perguntas em aberto

Cada pergunta traz a suposição adotada até que a autora responda.

1. **Base do desconto percentual.** Os 10% incidem só sobre o subtotal (1.00 → desconto 0.10) ou sobre subtotal + taxa de rede? *Suposição:* só sobre o subtotal; a taxa de rede não recebe desconto (é o que bate com os números do cenário: 1.00 − 0.10 + 0.002 = 0.902). De qualquer forma, o cálculo é da API.
2. **Cupom inválido.** Os 3 cenários não cobrem cupom inexistente, mas o README exige. Posso acrescentar? Qual a mensagem exata? *Suposição:* acrescentei o cenário com a mensagem "Cupom inválido", por simetria com "Cupom expirado".
3. **Aplicar um segundo cupom com um já aplicado.** "Um cupom por carrinho": o novo cupom substitui o anterior, ou é recusado até o colecionador remover o atual? *Suposição:* não especifiquei esse comportamento; o requisito só garante que nunca há mais de um cupom aplicado. Fica pendente.
4. **Falha ao aplicar quando já há cupom aplicado.** Se "NEON10" está aplicado e o colecionador tenta "VERAO2025" (expirado), o "NEON10" continua aplicado? *Suposição:* sim — uma tentativa recusada não altera o resumo do carrinho nem o cupom aplicado. Não escrevi cenário para isso; depende da resposta à pergunta 3.
5. **Visitante.** O visitante pode aplicar cupom, ou só o colecionador autenticado? *Suposição:* esta change cobre só o colecionador autenticado (como no `Contexto` dos cenários).
6. **Persistência do cupom.** O cupom aplicado sobrevive a refresh e ao login, como o carrinho? *Suposição:* sim, porque o cupom é guardado pela API junto com o carrinho; não escrevi cenário.
7. **Quem decide a expiração.** A data de expiração é avaliada pela API (relógio do servidor/mock) ou pelo cliente? *Suposição:* pela API; o cliente não compara datas.
8. **Mudança de preço com cupom aplicado.** Quando um `nft.updated` altera o preço de uma edição no carrinho, o desconto é recalculado? E se o cupom expirar enquanto está aplicado? *Suposição:* a API recalcula o resumo do carrinho; fora do escopo desta change.
9. **Formato dos valores.** O cenário usa "0" para desconto zero, "1.00" para subtotal e "1.002" para total. O cliente formata (casas decimais) ou exibe a string da API como veio? *Suposição:* exibe a string decimal da API sem reformatar.
10. **Normalização do código.** "neon10" ou " NEON10 " devem ser aceitos? *Suposição:* o cliente remove espaços nas pontas e envia; maiúsculas/minúsculas são decididas pela API.
11. **Falha transitória (timeout/5xx) ao aplicar ou remover.** Qual o comportamento esperado? *Suposição:* fora do escopo desta change; o resumo do carrinho não deve mudar em caso de falha.
