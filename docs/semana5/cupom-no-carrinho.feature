# language: pt
# Cenários escritos antes de abrir OpenSpec/TLC, com os termos do GLOSSARIO.md.
# Contexto: Carrinho (src/modules/cart/)

Funcionalidade: Cupom no carrinho
  Como colecionador
  Quero aplicar um cupom ao meu carrinho
  Para pagar menos pela edição que escolhi

  Contexto:
    Dado que o colecionador "ana.ravache@example.com" está autenticado
    E o carrinho tem 2 unidades da edição 3 do NFT "Neon Ape" a "0.50" ETH cada
    E a taxa de rede é "0.002" ETH
    E o resumo do carrinho mostra subtotal "1.00" ETH e total "1.002" ETH

  Cenário: Aplicar cupom válido
    Quando o colecionador aplica o cupom "NEON10" de 10% de desconto
    Então o resumo do carrinho mostra desconto "0.10" ETH
    E o resumo do carrinho mostra total "0.902" ETH
    E o cupom "NEON10" aparece como aplicado

  Cenário: Cupom expirado não altera o resumo
    Quando o colecionador aplica o cupom "VERAO2025", que expirou em 31/03/2026
    Então o carrinho informa "Cupom expirado"
    E o resumo do carrinho continua com desconto "0" ETH e total "1.002" ETH
    E nenhum cupom aparece como aplicado

  Cenário: Remover cupom devolve o total original
    Dado que o cupom "NEON10" está aplicado e o total é "0.902" ETH
    Quando o colecionador remove o cupom
    Então o resumo do carrinho mostra desconto "0" ETH e total "1.002" ETH
    E o carrinho continua com 2 unidades da edição 3 do NFT "Neon Ape"
