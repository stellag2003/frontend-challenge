# Tasks

> Antes de implementar, confirmar com a autora as "Perguntas em aberto" de `proposal.md` (principalmente 1, 2, 3 e 9). As tarefas abaixo usam as suposições registradas lá.

## 1. Domínio do cupom (`src/modules/cart/domain/`)

- [ ] 1.1 Criar o contrato tipado (zod) do resumo do carrinho (subtotal, desconto, taxa de rede, total como strings decimais) e do cupom aplicado; verificar com teste unitário que o schema aceita a resposta do cenário "Aplicar cupom válido" e rejeita valores numéricos
- [ ] 1.2 Criar `CouponExpiredError` (`COUPON_EXPIRED`) e `CouponInvalidError` (`COUPON_INVALID`) e a porta `CartRepository` com `applyCoupon(code)` e `removeCoupon()`; verificar com `npm run typecheck` (ou `tsc -b`) sem erros

## 2. Mocks MSW do cupom (`src/mocks/handlers/cart.ts`)

- [ ] 2.1 Criar fixture do carrinho do `Contexto` (2 unidades da edição 3 do NFT "Neon Ape" a "0.50" ETH, taxa de rede "0.002" ETH) e os cupons `NEON10` (válido, 10%) e `VERAO2025` (expirado em 31/03/2026); verificar com teste que a fixture produz subtotal "1.00" e total "1.002"
- [ ] 2.2 Implementar os handlers de aplicar e remover cupom (respostas 200 e 422 com `COUPON_EXPIRED`/`COUPON_INVALID`), registrá-los em `handlers/index.ts`; verificar com testes de handler que `NEON10` devolve desconto "0.10" e total "0.902", `VERAO2025` e `NAOEXISTE` devolvem 422 sem mudar o estado, e remover devolve desconto "0" e total "1.002"

## 3. Infraestrutura e aplicação

- [ ] 3.1 Implementar `CartHttpRepository` (Axios via `apiClient`) mapeando 422 para os erros de domínio; verificar com teste contra o MSW que cada código vira o erro correto
- [ ] 3.2 Implementar os use cases de aplicar e remover cupom (código com espaços removidos nas pontas) e registrá-los em `src/modules/cart/di.ts`; verificar com testes unitários usando um repositório fake

## 4. Apresentação

- [ ] 4.1 Criar as mutations TanStack Query de aplicar/remover cupom que gravam o resumo do carrinho no cache e não alteram o cache em caso de recusa; verificar com teste de hook
- [ ] 4.2 Criar o campo de cupom e o resumo do carrinho (desconto, total, cupom aplicado, mensagens "Cupom expirado" e "Cupom inválido", botão de remover, estado de carregamento); verificar com testes de componente que reproduzem os 5 cenários de `specs/carrinho/cupom/spec.md`

## 5. Verificação integrada

- [ ] 5.1 Rodar os 5 cenários de `specs/carrinho/cupom/spec.md` de ponta a ponta (Playwright com MSW) e verificar que todos passam com `npx playwright test`
