# Prompt S44 (reconstruído) — OpenSpec

> O slide S44 da aula 9 não estava disponível localmente; este prompt foi reconstruído a
> partir do enunciado da atividade.

Você vai especificar uma feature pequena com OpenSpec neste repositório
(`openspec/` já foi inicializado; o glossário do projeto está em `openspec/config.yaml`,
no campo `context`).

Feature: **Cupom no carrinho** — bounded context **Carrinho** (`src/modules/cart/`).

Cenários que eu escrevi à mão (Gherkin, termos do glossário):

```gherkin
{{CENARIOS}}
```

Regras:
1. Crie uma change OpenSpec chamada `cupom-no-carrinho` (proposal.md, design.md se fizer
   sentido, tasks.md e o delta de spec em `specs/<capability>/spec.md`), seguindo o schema
   `spec-driven` e as instruções que `openspec instructions` devolver.
2. Use **apenas** os termos do glossário. Não invente sinônimos.
3. Os requisitos devem cobrir os meus 3 cenários. Se você mudar ou acrescentar algo,
   deixe explícito o que mudou e por quê.
4. Se algo estiver ambíguo, **pergunte** em vez de assumir. Liste as perguntas no fim.
5. Não escreva código de aplicação. Só artefatos em `openspec/changes/`.
6. No fim, rode `openspec validate cupom-no-carrinho --strict` e corrija até passar.
