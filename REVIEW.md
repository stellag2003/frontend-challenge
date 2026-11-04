# REVIEW — Sessão de Plan (cotação desatualizada)

> Transparência: os materiais da aula (template S24, prompt S44, `prompts-rpi.md`,
> `RESEARCH-template.md`) não estavam disponíveis e foram reconstruídos; todos os prompts
> usados estão em `docs/prompts/`. Cada "sessão nova" foi um subagente de contexto limpo, que
> recebeu só o material permitido pela etapa. Glossário, cenários Gherkin da semana 5 e esta
> revisão foram redigidos pelo agente a pedido da autora.

## O que eu pedi na sessão de Plan

Prompt: `docs/prompts/sessao2-plan.md`. Entradas: só o `RESEARCH.md`, o bounded context
**Checkout** e 15 termos do glossário (Checkout e vizinhos: edição, preço, disponibilidade,
versão do NFT, resumo do carrinho, cotação, cotação desatualizada, revalidação, confirmação do
pedido × confirmação do colecionador…). Pedi uma ADR e uma spec com exatamente 5 EARS e 3
cenários BDD, pelo menos 1 de erro ou limite.

Cortei o escopo antes de pedir: o RESEARCH saiu como tamanho **G** (15 casos-limite, 10
perguntas). Para caber em **M**, mantive só a cadeia do cenário da seção 7 do README e deixei
fora estoque parcial, reconexão, troca de usuário, cupom invalidado, recibo e pedidos duplicados.

## O que o agente devolveu

- `docs/adr/0001-cotacao-desatualizada.md`: duas camadas, (1) aviso + novo resumo por
  `nft.updated` versionado e (2) revalidação obrigatória ao acionar "confirmar". Rejeitou
  "só eventos", "só revalidação", "recalcular no cliente" e "reservar preço".
- `docs/cotacao-desatualizada-spec.md`: 5 EARS, 3 cenários (caminho feliz, erro na
  confirmação e limite de eventos duplicado/atrasado) e decisões para 8 das 10 perguntas
  em aberto do RESEARCH.

## O que eu rejeitei ou reescrevi, e por quê

| Onde | O que o agente escreveu | O que ficou | Por quê |
| --- | --- | --- | --- |
| EARS-5 | "**Where** o carrinho contiver uma edição com disponibilidade zero…" | "**While** o carrinho contiver…" | Em EARS, *Where* é para feature opcional; "esgotada" é um estado do sistema, então o padrão certo é *While*. |
| EARS-2 | "deve pedir à API um novo resumo do carrinho" | "deve atualizar o resumo do carrinho com os valores da API" | O critério descrevia o mecanismo, não o resultado. A seção 9 do README pede que as verificações observem a interface. |
| EARS-4 | "inclusive quando o preço caiu", com rastreio só para o RESEARCH | Mantido, com a origem anotada no README §3 | O RESEARCH §6.2 só diz que a queda "precisa ser informada"; quem exige nova confirmação sem distinguir a direção é o README ("Mudanças devem exigir nova confirmação do usuário"). Sem essa origem, o critério não entraria. |
| Todos os EARS | Tabela de rastreabilidade com números de parágrafo (§5.1, §8.6…) | Ao lado de cada critério, a **frase** do RESEARCH e a **seção** do README | A atividade pede a frase e a seção. Um número de parágrafo não deixa conferir se a origem diz mesmo aquilo. |
| BDD 1 | "E o resumo do carrinho é pedido novamente à API" | Removido; o passo seguinte ("subtotal de 1.84 ETH, sem recarregar a página") já prova o resultado | É um passo não observável pelo colecionador. |
| BDD 3 | "E o resumo do carrinho não é pedido novamente à API" | "E o resumo do carrinho continua com subtotal de 0.95 ETH" | Mesmo motivo: verificar a interface, não a chamada. |
| BDD | 3 cenários: feliz, erro e limite | Mantido | Atende ao "pelo menos 1 de erro ou limite". O cenário 2 é erro e o 3 é limite. |
| EARS-5 | Sem cenário BDD | Mantido sem cenário e registrado na spec | A atividade pede 3 cenários. Esgotado fica coberto só pelo critério nesta entrega. |

Nenhum EARS foi apagado: os cinco têm frase de origem no RESEARCH e seção no README.

## Implementação (Sessão 3)

A sessão recebeu só a ADR e a spec revisadas (`docs/prompts/sessao3-implement.md`). Os três
cenários BDD viraram testes Playwright em `e2e/cotacao-desatualizada.spec.ts`:
`npx playwright test` → **3 passed**; `npm run typecheck` sem erros; `npm test` → 24 passed.

Desvios que a sessão registrou e eu aceitei:
- O socket aponta para `VITE_SOCKET_URL` (padrão `http://localhost:3001`), porque na mesma
  origem do Vite o mock também capturaria o WebSocket de HMR.
- A cotação "aceita" é a que está na tela quando o colecionador clica "Confirmar compra de X
  ETH". O rótulo do botão traz o total, e não existe um passo separado de aceite.
- EARS-5 (esgotada) foi implementada com teste unitário, mas sem E2E, porque a spec não tem
  cenário BDD para ela.
- O cenário 3 espera 500 ms fixos antes das verificações negativas, porque não há sinal na
  interface de que um evento foi ignorado.
