# Sessão 1 — Research (reconstruído)

> O arquivo `aula11-diagnostico-documentos-rpi/starter/prompts-rpi.md` e o
> `RESEARCH-template.md` não estavam disponíveis localmente; prompt e template foram
> reconstruídos a partir do enunciado da atividade.

Você é um pesquisador de produto. Não escreva código, não proponha arquitetura e não cite
nomes de tecnologia, biblioteca ou framework.

**Domínio:** marketplace de NFTs do Desafio Frontend.

**Quem sente a dor:** o colecionador que está comprando.

**Problema (trecho do README):**

> ### Carrinho (seção 3)
> - Refletir alterações de preço e disponibilidade recebidas enquanto o carrinho estiver aberto.
>
> Valores em ETH devem trafegar como strings decimais e manter precisão nos cálculos e na
> apresentação. Quantidades são inteiras. A cotação da API é a referência para finalizar o pedido.
>
> ### Pagamento e confirmação (seção 3)
> - Revalidar preço, disponibilidade, cupom e taxas antes de confirmar a compra. Mudanças
>   devem exigir nova confirmação do usuário.
>
> ### Tempo real (seção 7)
> | `nft.updated` | Atualizar preço e disponibilidade no catálogo, detalhe e carrinho |
>
> Os eventos devem carregar identidade estável, recurso afetado e versão. O cliente deve
> tolerar duplicatas e eventos antigos, sem regredir um estado mais recente nem reaplicar efeitos.
>
> Implemente o cenário:
> 1. Um NFT está no carrinho.
> 2. Seu preço ou disponibilidade muda durante a navegação.
> 3. A interface informa a alteração e atualiza o resumo.
> 4. O checkout impede a confirmação com uma cotação desatualizada.

**Tarefa:** investigue essa dor e escreva `RESEARCH.md` na raiz do repositório seguindo
exatamente este template:

```markdown
# RESEARCH — <título curto da dor>

## 1. Quem sente a dor
## 2. A dor, em uma frase
## 3. Quando acontece (gatilhos)
## 4. O que o colecionador perde hoje (impacto)
## 5. Evidências no enunciado
(cite cada trecho do README entre aspas, com a seção)
## 6. Variações e casos-limite
## 7. O que NÃO é o problema (fora do escopo)
## 8. Como saberemos que a dor sumiu (sinais observáveis pelo colecionador)
## 9. Perguntas em aberto
## 10. Tamanho estimado (P / M / G) e por quê
```

Regras: linguagem de quem compra, frases numeradas ou em lista para que possam ser citadas
depois, números concretos nos exemplos (preços em ETH, quantidades). Nada de nomes de
tecnologia. Você pode ler o `README.md` para confirmar as seções, mas não leia o código em `src/`.
