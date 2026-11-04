# Spec Delta

## Purpose

Permite que o colecionador aplique e remova um cupom no carrinho e veja o desconto refletido no resumo do carrinho, com os valores calculados pela API e a recusa de cupom expirado ou inválido.

## ADDED Requirements

### Requirement: Aplicar cupom válido
O sistema SHALL permitir que o colecionador aplique um cupom válido ao carrinho. Ao aplicar, o resumo do carrinho MUST exibir o desconto e o total devolvidos pela API (strings decimais em ETH, sem recálculo no cliente) e o cupom MUST aparecer como aplicado.

#### Scenario: Aplicar cupom válido
- **GIVEN** o colecionador "ana.ravache@example.com" está autenticado
- **AND** o carrinho tem 2 unidades da edição 3 do NFT "Neon Ape" a "0.50" ETH cada
- **AND** a taxa de rede é "0.002" ETH
- **AND** o resumo do carrinho mostra subtotal "1.00" ETH e total "1.002" ETH
- **AND** o cupom "NEON10" é válido e dá 10% de desconto
- **WHEN** o colecionador aplica o cupom "NEON10"
- **THEN** o resumo do carrinho mostra desconto "0.10" ETH
- **AND** o resumo do carrinho mostra total "0.902" ETH
- **AND** o cupom "NEON10" aparece como aplicado

### Requirement: Um cupom por carrinho
O carrinho MUST ter no máximo um cupom aplicado por vez.

#### Scenario: Apenas o cupom aplicado aparece como aplicado
- **GIVEN** o carrinho do `Contexto` sem cupom aplicado
- **WHEN** o colecionador aplica o cupom "NEON10"
- **THEN** exatamente um cupom aparece como aplicado, e ele é "NEON10"

### Requirement: Recusar cupom expirado
O sistema SHALL recusar um cupom expirado (existiu, venceu), informando "Cupom expirado" no carrinho. Uma tentativa recusada MUST NOT alterar o resumo do carrinho nem o cupom aplicado.

#### Scenario: Cupom expirado não altera o resumo
- **GIVEN** o carrinho do `Contexto` sem cupom aplicado (desconto "0" ETH, total "1.002" ETH)
- **AND** o cupom "VERAO2025" expirou em 31/03/2026
- **WHEN** o colecionador aplica o cupom "VERAO2025"
- **THEN** o carrinho informa "Cupom expirado"
- **AND** o resumo do carrinho continua com desconto "0" ETH e total "1.002" ETH
- **AND** nenhum cupom aparece como aplicado

### Requirement: Recusar cupom inválido
O sistema SHALL recusar um cupom inválido (código que não existe), informando "Cupom inválido" no carrinho. Uma tentativa recusada MUST NOT alterar o resumo do carrinho nem o cupom aplicado.

#### Scenario: Cupom inválido não altera o resumo
- **GIVEN** o carrinho do `Contexto` sem cupom aplicado (desconto "0" ETH, total "1.002" ETH)
- **AND** não existe cupom com o código "NAOEXISTE"
- **WHEN** o colecionador aplica o cupom "NAOEXISTE"
- **THEN** o carrinho informa "Cupom inválido"
- **AND** o resumo do carrinho continua com desconto "0" ETH e total "1.002" ETH
- **AND** nenhum cupom aparece como aplicado

### Requirement: Remover cupom aplicado
O sistema SHALL permitir que o colecionador remova o cupom aplicado. Ao remover, o resumo do carrinho MUST voltar a exibir desconto "0" ETH e o total sem desconto devolvido pela API, e os itens do carrinho MUST permanecer inalterados.

#### Scenario: Remover cupom devolve o total original
- **GIVEN** o carrinho do `Contexto`
- **AND** o cupom "NEON10" está aplicado e o total é "0.902" ETH
- **WHEN** o colecionador remove o cupom
- **THEN** o resumo do carrinho mostra desconto "0" ETH e total "1.002" ETH
- **AND** o carrinho continua com 2 unidades da edição 3 do NFT "Neon Ape"
- **AND** nenhum cupom aparece como aplicado
