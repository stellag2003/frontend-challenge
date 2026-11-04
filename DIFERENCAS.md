# DIFERENÇAS — cenários escritos antes × o que o agente devolveu

Feature: cupom no carrinho (contexto Carrinho). Cenários originais em `docs/semana5/cupom-no-carrinho.feature`.

## OpenSpec (change `cupom-no-carrinho`)

- **Acrescentou:** um requisito e um cenário "Recusar cupom inválido" (código `NAOEXISTE` → "Cupom inválido") e o requisito "Um cupom por carrinho", que não estavam nos meus 3 cenários.
- **Mudou:** quebrou "aplica o cupom NEON10 de 10% de desconto" em pré-condição + ação e espalhou o `Contexto` como GIVEN no 1º cenário, porque o formato do OpenSpec não tem bloco compartilhado.
- **Perguntou:** "Os 10% incidem só sobre o subtotal ou também sobre a taxa de rede?" (mais 10 perguntas no `proposal.md`; como a sessão não podia conversar, cada uma veio com a suposição adotada).

## TLC (`.specs/features/cupom-no-carrinho/spec.md`)

- **Acrescentou:** 22 critérios EARS (meus 3 cenários viraram 8), incluindo cupom inválido, controle desabilitado durante a chamada, falha de rede/timeout/5xx ao aplicar ou remover e cupom mantido após refresh.
- **Mudou:** tirou "de 10% de desconto" da ação (virou dado da fixture da API) e trocou os valores fixos "0.10" / "0.902" por "os valores devolvidos pela API", proibindo recálculo no cliente.
- **Perguntou:** "Com um cupom já aplicado, dá para aplicar outro: remover antes ou o novo substitui?" (8 perguntas no total, Q1–Q8, mais 5 suposições A1–A5; nenhuma linha de aprovação foi escrita porque ninguém aprovou).

## OpenSpec × TLC

O OpenSpec perguntou mais em número (11 perguntas contra 8), mas a maioria veio como suposição
já adotada; o TLC é o que mais insiste em perguntar, porque a skill trava a spec até a usuária
aprovar e deixa o validador avisando enquanto as perguntas estão abertas. O TLC inventou mais:
saiu de 3 cenários para 22 critérios, enquanto o OpenSpec ficou em 5 requisitos colados nos
cenários. Mas boa parte do que o TLC "inventou" tem origem no README (seção 4, "recuperação de
falhas sem duplicar operações"; seção 3, "manter o carrinho após refresh"), então é invenção
que aponta buracos reais. Neste projeto eu usaria o **TLC** nas features de carrinho e
checkout, onde falha, duplicidade e tempo real são justamente o que é avaliado, e aceitaria o
custo de cortar critérios em excesso na revisão; o OpenSpec fica melhor para features pequenas
e bem fechadas, porque o glossário no `config.yaml` entra em toda change sem esforço.

> Nota: as sessões de OpenSpec e TLC foram executadas por subagentes de contexto limpo, sem
> conversa com a autora; por isso "perguntou" significa "registrou a pergunta no artefato".
