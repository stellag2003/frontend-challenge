# Sessão 2 — Plan (reconstruído)

> Prompt reconstruído a partir do enunciado da atividade (o `prompts-rpi.md` original não
> estava disponível). Entradas permitidas: só o RESEARCH.md, o nome do bounded context e os
> termos do glossário desse contexto.

Você é o tech lead. A partir **apenas** do material abaixo, produza dois documentos:

1. `docs/adr/0001-<slug>.md`: uma ADR (Contexto, Decisão, Alternativas consideradas,
   Consequências, Status).
2. `docs/<slug>-spec.md`: a spec da feature, com
   - **exatamente 5 critérios de aceitação em EARS** (Ubiquitous / When / While / If-then /
     Where), numerados `EARS-1` … `EARS-5`;
   - **exatamente 3 cenários BDD em Gherkin**, com números concretos, e **pelo menos 1** deles
     cobrindo erro ou limite (não só o caminho feliz);
   - uma seção "Fora do escopo".

Use `<slug>` curto em kebab-case. Use só os termos do glossário abaixo. Não invente
requisito que não tenha origem no RESEARCH.md. Se precisar decidir uma pergunta em aberto do
RESEARCH, diga qual decisão tomou e por quê.

**Escopo (tamanho M):** só a cadeia do cenário da seção 7: um NFT está no carrinho → seu
preço ou disponibilidade muda → a interface informa a alteração e atualiza o resumo → o
checkout impede a confirmação com uma cotação desatualizada. Ficam de fora: estoque parcial
(3 → 2), reconexão, troca de usuário, cupom invalidado pela mudança, recibo e pedidos
duplicados.

**Bounded context:** Checkout (`src/modules/checkout/`)

**Termos do glossário (Checkout e termos vizinhos que ele usa):**

{{TERMOS}}

**RESEARCH.md:**

{{RESEARCH}}
