# Design

## Context

- O bounded context Carrinho (`src/modules/cart/`) ainda não existe. O único módulo implementado é `src/modules/account/`, organizado em `domain/` (contrato zod, porta de repositório, erros com `code`), `application/` (use case), `infrastructure/` (repositório HTTP via `apiClient` do Axios) e `presentation/`, com injeção em `di.ts`. Esta change segue a mesma organização.
- Os mocks MSW ficam em `src/mocks/handlers/` e são agregados em `handlers/index.ts`; hoje só há `account.ts`.
- Pelo glossário, o resumo do carrinho é **calculado pela API**; valores em ETH trafegam como strings decimais. Ver `proposal.md` (Why) e `specs/carrinho/cupom/spec.md` para os requisitos.

## Goals / Non-Goals

**Goals:**
- Contrato tipado de aplicar/remover cupom que devolve o resumo do carrinho recalculado pela API.
- Erros de domínio distintos para cupom expirado e cupom inválido, sem confundir "cupom expirado" com expiração da sessão.
- Cenários MSW determinísticos para `NEON10`, `VERAO2025` e um código inexistente.

**Non-Goals:**
- Itens do carrinho (adicionar, alterar quantidade, remover item) além do mínimo para montar o carrinho do `Contexto` nos mocks e testes.
- Cotação, revalidação e checkout.
- Visitante, `nft.updated`, falhas transitórias e expiração da sessão durante a aplicação do cupom (ver "Perguntas em aberto" em `proposal.md`).

## Decisions

1. **A API calcula desconto e total; o cliente não faz aritmética.** O resumo do carrinho exibido vem sempre da resposta da operação de aplicar/remover cupom. *Alternativa considerada:* calcular 10% no cliente para resposta instantânea — rejeitada porque o glossário define o resumo como calculado pela API e porque cálculo com strings decimais no cliente duplicaria regra de negócio.
2. **Sem atualização otimista para o cupom.** O resumo só muda após resposta de sucesso; em recusa, o estado anterior é mantido (requisitos "Recusar cupom expirado/inválido"). *Alternativa:* otimismo com rollback — rejeitada aqui porque o desconto não é conhecido antes da API responder; o README pede otimismo em pelo menos uma interação, que pode ficar em outra (ex.: favoritos).
3. **Contrato REST proposto (a confirmar com a documentação de contratos do projeto):** `PUT /api/cart/coupon` com `{ code }` → `200` com o resumo do carrinho e o cupom aplicado; `422` com `code: "COUPON_EXPIRED"` ou `code: "COUPON_INVALID"`; `DELETE /api/cart/coupon` → `200` com o resumo do carrinho sem cupom. *Alternativa:* `POST /api/cart/coupons` — rejeitada porque há no máximo um cupom por carrinho, então o cupom é um sub-recurso único.
4. **Erros de domínio com `code`**, no padrão de `account-errors.ts`: `CouponExpiredError` (`COUPON_EXPIRED`) e `CouponInvalidError` (`COUPON_INVALID`). O nome `CouponExpired` evita colisão com a expiração da sessão (glossário: "não confundir").
5. **Estado no TanStack Query:** a mutation de aplicar/remover grava a resposta no cache da query do carrinho (`setQueryData`) e invalida a query do carrinho, para manter um único dono do resumo do carrinho.
6. **Mudanças de redação nos cenários originais** (comportamento preservado):
   - "aplica o cupom "NEON10" de 10% de desconto" → pré-condição "o cupom "NEON10" é válido e dá 10% de desconto" + ação "aplica o cupom "NEON10"". Motivo: o percentual é dado da API, não ação do colecionador.
   - "aplica o cupom "VERAO2025", que expirou em 31/03/2026" → pré-condição "o cupom "VERAO2025" expirou em 31/03/2026" + ação "aplica o cupom "VERAO2025"". Mesmo motivo; também deixa claro que a expiração é decidida pela API.
   - O `Contexto` Gherkin foi repetido como `GIVEN` no primeiro cenário e referenciado como "o carrinho do `Contexto`" nos demais, porque o formato de spec do OpenSpec não tem `Contexto` compartilhado.
   - No cenário de cupom expirado, foi explicitado "sem cupom aplicado (desconto "0" ETH)" como pré-condição, já que o `Então` usa "continua com desconto "0"".
   - No cenário de remover cupom, foi acrescentado "nenhum cupom aparece como aplicado" no `Então`, por simetria com o cenário de cupom expirado.

## Risks / Trade-offs

- [Contrato REST ainda não documentado no projeto] → Tratar a decisão 3 como proposta; ajustar specs de transporte quando os contratos forem documentados.
- [Mensagem "Cupom inválido" é suposição] → Centralizar as mensagens num único mapa por `code` para trocar sem mexer em componentes.
- [Sem otimismo, a aplicação do cupom tem latência visível] → Exibir estado de carregamento no resumo do carrinho (skeleton) e desabilitar o botão durante a mutation.
- [Data de "hoje" nos mocks influencia o cupom expirado] → O mock marca `VERAO2025` como expirado de forma fixa, sem depender do relógio.
