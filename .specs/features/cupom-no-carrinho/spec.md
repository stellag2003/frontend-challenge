# Cupom no carrinho Specification

> Rascunho aguardando aprovação da usuária. As perguntas em **Assumptions & Open Questions**
> bloqueiam a aprovação; os defaults ali são recomendações, não decisões.

**Bounded context**: Carrinho (`src/modules/cart/`) · **Escopo (auto-sizing)**: Medium, com
discuss acionado (estado do carrinho, chamada à API, transições aplicado/não aplicado).

## Problem Statement

O colecionador quer pagar menos pela edição que escolheu aplicando um cupom ao carrinho. Hoje o
carrinho não aceita cupom, e o README exige aplicar e remover cupom, com tratamento de cupom
inválido ou expirado, e um resumo do carrinho coerente com a resposta da API.

## Goals

- [ ] O colecionador aplica um cupom válido e o resumo do carrinho mostra o desconto e o total devolvidos pela API.
- [ ] Um cupom expirado ou inválido não altera o resumo do carrinho e é informado com uma mensagem exata.
- [ ] O colecionador remove o cupom e o resumo do carrinho volta ao total sem desconto, sem tocar nos itens do carrinho.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Revalidação do cupom na cotação e na confirmação do pedido | Pertence ao contexto Checkout (cotação, cotação desatualizada, revalidação) |
| Cálculo de desconto e total no cliente | O resumo do carrinho é calculado pela API (glossário); o carrinho só mostra |
| Mais de um cupom por carrinho | Glossário: "Um cupom por carrinho" |
| Cupom aplicado pelo visitante | Os 3 cenários tratam só do colecionador autenticado; fica fora até a resposta da pergunta Q6 |
| Cadastro, regras e vigência dos cupons | O cupom existe ou não, vale ou expirou, segundo a API simulada (fixtures MSW) |

---

## Assumptions & Open Questions

Nenhuma linha abaixo foi confirmada pela usuária (`n`). As linhas Q1-Q8 são perguntas de produto
feitas à usuária; o default é o que esta spec usa até a resposta. As linhas A1-A5 são defaults que
o glossário, o README ou os próprios cenários já resolvem, registrados para correção.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Q1. Qual mensagem o carrinho informa para cupom inválido (não existe)? Os cenários só cobrem o expirado. | "Cupom inválido" | O glossário distingue inválido de expirado e o README exige tratar os dois; o texto segue o padrão de "Cupom expirado" | n |
| Q2. Com um cupom já aplicado, o colecionador pode aplicar outro? (a) não: precisa remover antes; (b) o novo substitui o atual se for válido | (a) o controle de aplicar fica indisponível enquanto há cupom aplicado | Garante "um cupom por carrinho" sem regra de substituição e mantém verdadeiro o "nenhum cupom aparece como aplicado" do cenário de cupom expirado | n |
| Q3. Desconto zero aparece como "0" (como no cenário) ou como "0.00", no mesmo formato do subtotal "1.00"? Ou a linha de desconto some sem cupom? | Mostrar a string que a API devolver; a fixture devolve "0" | O README exige strings decimais com precisão; o cenário escreve "0"; o carrinho não reformata | n |
| Q4. O cupom aplicado continua aplicado depois de refresh e depois do login? | Sim: o cupom faz parte do carrinho na API e volta na consulta do carrinho | O glossário diz que o carrinho sobrevive a refresh e ao login | n |
| Q5. Que mensagem o carrinho mostra quando a API falha (erro de rede, timeout, 5xx) ao aplicar ou remover? | Aplicar: "Não foi possível aplicar o cupom. Tente novamente." Remover: "Não foi possível remover o cupom. Tente novamente." | O README exige feedback de erro e recuperação sem duplicar operações; o texto é recomendação | n |
| Q6. O visitante pode aplicar cupom? | Fora do escopo desta spec (ver Out of Scope) | Os 3 cenários partem de colecionador autenticado; aceitar visitante exige decidir o que acontece com o cupom ao autenticar | n |
| Q7. Se um cupom aplicado expira, ou o preço de uma edição muda (`nft.updated`), enquanto o carrinho está aberto, o carrinho avisa o colecionador? | Não avisa: o resumo do carrinho é recarregado da API pelas regras já existentes do carrinho e mostra o desconto que a API devolver | Avisar seria uma mensagem nova que nenhum cenário pede; a revalidação definitiva é da cotação (Checkout) | n |
| Q8. O código digitado é normalizado? ("neon10", " NEON10 ") | O carrinho remove espaços nas pontas e envia o resto como digitado; maiúsculas/minúsculas são decididas pela API | Remover espaços evita "Cupom inválido" por erro de digitação; mudar a caixa seria uma regra de negócio no cliente | n |
| A1. Base do desconto | O desconto incide sobre o subtotal, não sobre a taxa de rede | Os cenários fixam: 10% de "1.00" = "0.10", e o total "0.902" = 1.00 − 0.10 + 0.002 (fórmula do total no glossário) | n |
| A2. Quem decide se o cupom expirou | A API; o carrinho não compara datas com o relógio do navegador | O resumo do carrinho é calculado pela API; "31/03/2026" no cenário é dado da fixture | n |
| A3. O percentual "10%" do NEON10 | É dado da fixture da API, não algo que o colecionador informa | O colecionador digita só o cupom; ver "Changes to the hand-written scenarios" | n |
| A4. Cliques repetidos em aplicar/remover | O controle fica desabilitado enquanto a chamada está em andamento | README: recuperação de falhas sem duplicar operações | n |
| A5. Campo de cupom vazio | O controle de aplicar fica desabilitado e nada é enviado | Uma chamada sem cupom só produziria "Cupom inválido" | n |

**Open questions:** Q1-Q8 acima, aguardando resposta da usuária. A spec não deve ser aprovada antes delas.

---

## User Stories

### P1: Aplicar cupom válido ⭐ MVP

**User Story**: Como colecionador, quero aplicar um cupom ao meu carrinho para pagar menos pela edição que escolhi.

**Why P1**: É o valor da feature; cobre o cenário "Aplicar cupom válido".

Exemplo (Contexto dos cenários): carrinho com 2 unidades da edição 3 do NFT "Neon Ape" a "0.50" ETH,
taxa de rede "0.002" ETH, resumo do carrinho com subtotal "1.00" ETH e total "1.002" ETH; a fixture
da API define "NEON10" como cupom válido de 10% de desconto.

**Acceptance Criteria**:

1. WHEN o colecionador aplica o cupom "NEON10" THEN o carrinho SHALL mostrar no resumo do carrinho o desconto "0.10" ETH devolvido pela API  <!-- CUPOM-01 -->
2. WHEN o colecionador aplica o cupom "NEON10" THEN o carrinho SHALL mostrar no resumo do carrinho o total "0.902" ETH devolvido pela API  <!-- CUPOM-02 -->
3. WHEN a API aceita o cupom "NEON10" THEN o carrinho SHALL mostrar o cupom "NEON10" como aplicado  <!-- CUPOM-03 -->
4. WHEN a API devolve o resumo do carrinho THEN o carrinho SHALL mostrar subtotal, desconto, taxa de rede e total com as strings decimais devolvidas, sem recalcular nem arredondar  <!-- CUPOM-04 -->

**Independent Test**: Com a fixture do Contexto, digitar "NEON10", aplicar e ver desconto "0.10", total "0.902" e "NEON10" como aplicado.

---

### P1: Cupom expirado ou inválido não altera o resumo ⭐ MVP

**User Story**: Como colecionador, quero saber por que um cupom não foi aceito, sem que o resumo do carrinho mude.

**Why P1**: Cobre o cenário "Cupom expirado não altera o resumo" e o tratamento de cupom inválido que o README exige.

**Acceptance Criteria**:

1. IF a API responde que o cupom "VERAO2025" está expirado THEN o carrinho SHALL informar "Cupom expirado"  <!-- CUPOM-05 -->
2. IF a API responde que o cupom está expirado THEN o carrinho SHALL manter no resumo do carrinho o desconto e o total anteriores à tentativa (no Contexto: desconto "0" ETH e total "1.002" ETH)  <!-- CUPOM-06 -->
3. IF a API responde que o cupom está expirado THEN o carrinho SHALL mostrar nenhum cupom como aplicado  <!-- CUPOM-07 -->
4. IF a API responde que o cupom não existe THEN o carrinho SHALL informar "Cupom inválido"  <!-- CUPOM-08 (Q1) -->
5. IF a API responde que o cupom não existe THEN o carrinho SHALL manter no resumo do carrinho o desconto e o total anteriores à tentativa  <!-- CUPOM-09 -->
6. IF a API responde que o cupom não existe THEN o carrinho SHALL mostrar nenhum cupom como aplicado  <!-- CUPOM-10 -->

**Independent Test**: Com a fixture do Contexto, aplicar "VERAO2025" e ver "Cupom expirado", desconto "0", total "1.002" e nenhum cupom aplicado; repetir com um cupom que não existe e ver "Cupom inválido".

---

### P1: Remover cupom ⭐ MVP

**User Story**: Como colecionador, quero remover o cupom aplicado e ver o total original, sem perder os itens do carrinho.

**Why P1**: Cobre o cenário "Remover cupom devolve o total original".

**Acceptance Criteria**:

1. WHEN o colecionador remove o cupom "NEON10" aplicado THEN o carrinho SHALL mostrar no resumo do carrinho o desconto "0" ETH e o total "1.002" ETH devolvidos pela API  <!-- CUPOM-11 -->
2. WHEN o colecionador remove o cupom THEN o carrinho SHALL manter os mesmos itens do carrinho com as mesmas quantidades (no Contexto: 2 unidades da edição 3 do NFT "Neon Ape")  <!-- CUPOM-12 -->
3. WHEN a API confirma a remoção do cupom THEN o carrinho SHALL mostrar nenhum cupom como aplicado  <!-- CUPOM-13 -->

**Independent Test**: Com "NEON10" aplicado e total "0.902", remover o cupom e ver desconto "0", total "1.002" e as 2 unidades da edição 3 do NFT "Neon Ape" ainda no carrinho.

---

### P2: Um cupom por carrinho, sem chamadas duplicadas e com falhas recuperáveis

**User Story**: Como colecionador, quero que aplicar e remover cupom se comporte de forma previsível quando já há cupom, quando clico duas vezes ou quando a rede falha.

**Why P2**: Não aparece nos 3 cenários, mas vem do glossário ("um cupom por carrinho") e do README (feedback de erro, sem duplicar operações, persistência após refresh/login).

**Acceptance Criteria**:

1. WHILE um cupom está aplicado ao carrinho o carrinho SHALL manter o controle de aplicar cupom desabilitado  <!-- CUPOM-14 (Q2) -->
2. WHILE a chamada de aplicar ou remover cupom aguarda a API o carrinho SHALL manter desabilitado o controle que a disparou  <!-- CUPOM-15 (A4) -->
3. IF a chamada de aplicar cupom falha por erro de rede, timeout ou resposta 5xx THEN o carrinho SHALL informar "Não foi possível aplicar o cupom. Tente novamente."  <!-- CUPOM-16 (Q5) -->
4. IF a chamada de aplicar cupom falha por erro de rede, timeout ou resposta 5xx THEN o carrinho SHALL manter no resumo do carrinho o desconto e o total anteriores à tentativa  <!-- CUPOM-17 -->
5. IF a chamada de remover cupom falha por erro de rede, timeout ou resposta 5xx THEN o carrinho SHALL informar "Não foi possível remover o cupom. Tente novamente."  <!-- CUPOM-18 (Q5) -->
6. IF a chamada de remover cupom falha por erro de rede, timeout ou resposta 5xx THEN o carrinho SHALL manter o cupom como aplicado  <!-- CUPOM-19 -->
7. WHILE o campo de cupom está vazio ou só tem espaços o carrinho SHALL manter o controle de aplicar cupom desabilitado  <!-- CUPOM-20 (A5) -->
8. WHEN o colecionador aplica um cupom com espaços nas pontas THEN o carrinho SHALL enviar à API o cupom sem esses espaços  <!-- CUPOM-21 (Q8) -->
9. WHEN o colecionador recarrega a página com o cupom "NEON10" aplicado THEN o carrinho SHALL mostrar o cupom "NEON10" como aplicado  <!-- CUPOM-22 (Q4) -->

**Independent Test**: Com "NEON10" aplicado, ver o controle de aplicar desabilitado; recarregar e ver "NEON10" ainda aplicado; com o cenário MSW de falha 5xx, aplicar e ver a mensagem de falha com o resumo inalterado.

---

## Edge Cases

- IF a API responde que o cupom está expirado enquanto outro cupom já estava aplicado THEN o carrinho SHALL manter o cupom anterior (não alcançável com o default de Q2; vale se Q2 for respondida com (b))
- WHEN o colecionador aplica um cupom em minúsculas ("neon10") THEN o carrinho SHALL enviá-lo como digitado e mostrar o que a API responder (Q8)
- WHEN o resumo do carrinho é recarregado com um cupom aplicado THEN o carrinho SHALL mostrar o desconto que a API devolver, sem aviso próprio (Q7)

---

## Requirement Traceability

| Requirement ID | Story | Cenário de origem | Phase | Status |
| -------------- | ----- | ----------------- | ----- | ------ |
| CUPOM-01 | P1: Aplicar cupom válido | Aplicar cupom válido | Specify | Pending |
| CUPOM-02 | P1: Aplicar cupom válido | Aplicar cupom válido | Specify | Pending |
| CUPOM-03 | P1: Aplicar cupom válido | Aplicar cupom válido | Specify | Pending |
| CUPOM-04 | P1: Aplicar cupom válido | acrescentado (glossário: resumo calculado pela API; README: strings decimais) | Specify | Pending |
| CUPOM-05 | P1: Expirado ou inválido | Cupom expirado não altera o resumo | Specify | Pending |
| CUPOM-06 | P1: Expirado ou inválido | Cupom expirado não altera o resumo | Specify | Pending |
| CUPOM-07 | P1: Expirado ou inválido | Cupom expirado não altera o resumo | Specify | Pending |
| CUPOM-08 | P1: Expirado ou inválido | acrescentado (glossário e README: cupom inválido) | Specify | Pending |
| CUPOM-09 | P1: Expirado ou inválido | acrescentado (glossário e README: cupom inválido) | Specify | Pending |
| CUPOM-10 | P1: Expirado ou inválido | acrescentado (glossário e README: cupom inválido) | Specify | Pending |
| CUPOM-11 | P1: Remover cupom | Remover cupom devolve o total original | Specify | Pending |
| CUPOM-12 | P1: Remover cupom | Remover cupom devolve o total original | Specify | Pending |
| CUPOM-13 | P1: Remover cupom | acrescentado (simétrico a CUPOM-03) | Specify | Pending |
| CUPOM-14 | P2: Regras e falhas | acrescentado (glossário: um cupom por carrinho) | Specify | Pending |
| CUPOM-15 | P2: Regras e falhas | acrescentado (README: sem duplicar operações) | Specify | Pending |
| CUPOM-16 | P2: Regras e falhas | acrescentado (README: feedback de erro) | Specify | Pending |
| CUPOM-17 | P2: Regras e falhas | acrescentado (README: recuperação de falhas) | Specify | Pending |
| CUPOM-18 | P2: Regras e falhas | acrescentado (README: feedback de erro) | Specify | Pending |
| CUPOM-19 | P2: Regras e falhas | acrescentado (README: recuperação de falhas) | Specify | Pending |
| CUPOM-20 | P2: Regras e falhas | acrescentado (validação de entrada) | Specify | Pending |
| CUPOM-21 | P2: Regras e falhas | acrescentado (validação de entrada) | Specify | Pending |
| CUPOM-22 | P2: Regras e falhas | acrescentado (glossário: carrinho sobrevive a refresh) | Specify | Pending |

**Coverage:** 22 total, 0 mapped to tasks, 22 unmapped ⚠️ (Tasks ainda não rodou). Os 3 cenários estão cobertos por CUPOM-01 a CUPOM-03, CUPOM-05 a CUPOM-07 e CUPOM-11 a CUPOM-12.

### Implicit-requirement dimensions (Medium: só as presentes)

| Dimension | Onde está |
| --------- | --------- |
| Input validation & bounds | CUPOM-20, CUPOM-21, Q8 |
| Failure / partial-failure states | CUPOM-16 a CUPOM-19, Q5 |
| Idempotency / retry / duplicate handling | CUPOM-15 |
| State-transition integrity (sem cupom → aplicado → sem cupom) | CUPOM-03, CUPOM-07, CUPOM-10, CUPOM-13, CUPOM-14, Q2 |
| Data lifecycle / expiry | CUPOM-05 a CUPOM-07, CUPOM-22, A2, Q4, Q7 |
| Auth boundaries | Q6 |

Remaining dimensions N/A for this scope (observabilidade, concorrência entre abas, falha de dependência externa além da própria API simulada).

---

## Changes to the hand-written scenarios

Os 3 cenários de `docs/semana5/cupom-no-carrinho.feature` continuam cobertos. O que mudou na
passagem para EARS, e por quê:

| Cenário original | Mudança | Por quê |
| ---------------- | ------- | ------- |
| Aplicar cupom válido: "aplica o cupom "NEON10" de 10% de desconto" | O "10%" saiu da ação e virou dado da fixture da API (A3) | O colecionador informa só o cupom; o percentual é regra do cupom na API |
| Aplicar cupom válido: desconto "0.10" e total "0.902" | Os valores são os "devolvidos pela API", e CUPOM-04 proíbe recalcular no cliente | O resumo do carrinho é calculado pela API (glossário); um teste que só confere a conta no cliente não prova o requisito |
| Cupom expirado: "que expirou em 31/03/2026" | A data saiu do critério; quem decide "expirado" é a API (A2) | O critério não pode depender do relógio do navegador |
| Cupom expirado: "continua com desconto "0" ETH e total "1.002" ETH" | Generalizado para "o desconto e o total anteriores à tentativa", com os valores do Contexto como exemplo | Sem isso, o critério fica ambíguo quando já havia cupom aplicado (Q2) |
| Cupom expirado: as três consequências num cenário só | Divididas em CUPOM-05, 06 e 07 | EARS: um comportamento por critério |
| Remover cupom: "continua com 2 unidades da edição 3" | Generalizado para "os mesmos itens do carrinho com as mesmas quantidades", com o exemplo do Contexto | Remover o cupom não pode tocar em nenhum item, não só nesse |
| Remover cupom: não dizia nada sobre o estado do cupom | Acrescentado CUPOM-13 (nenhum cupom como aplicado) | Simétrico ao "aparece como aplicado" do primeiro cenário |
| Desconto zero escrito "0" e subtotal "1.00" | Mantido "0", mas perguntado (Q3) | Os dois formatos convivem no mesmo resumo |

---

## Sources

- `docs/semana5/cupom-no-carrinho.feature` - os 3 cenários escritos à mão (Contexto, Aplicar cupom válido, Cupom expirado não altera o resumo, Remover cupom devolve o total original)
- `CLAUDE.md` (Glossário) - termos Cupom, Resumo do carrinho, Subtotal, Desconto, Taxa de rede, Total, Item do carrinho, Edição; "um cupom por carrinho"; resumo calculado pela API
- `README.md` seção 3 "Carrinho" - aplicar e remover cupom, cupom inválido ou expirado, resumo coerente com a API, strings decimais
- `README.md` seção 6 - fixture de cupom inválido ou expirado; cenários de falha de rede

---

## Success Criteria

- [ ] Os 3 cenários de `docs/semana5/cupom-no-carrinho.feature` passam como testes contra a API simulada (MSW).
- [ ] Nenhum valor do resumo do carrinho é calculado no cliente (CUPOM-04).
- [ ] Cupom expirado, cupom inválido e falha de rede deixam o resumo do carrinho idêntico ao anterior à tentativa.
