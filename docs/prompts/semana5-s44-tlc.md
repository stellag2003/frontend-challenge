# Prompt S44 (reconstruído) — TLC

> O slide S44 da aula 9 não estava disponível localmente; este prompt foi reconstruído a
> partir do enunciado da atividade.

Você vai especificar uma feature pequena com TLC (skill `tlc-spec-driven` em `.claude/skills/tlc-spec-driven/`) neste repositório
(o glossário do projeto está no fim do `CLAUDE.md`).

Feature: **Cupom no carrinho** — bounded context **Carrinho** (`src/modules/cart/`).

Cenários que eu escrevi à mão (Gherkin, termos do glossário):

```gherkin
{{CENARIOS}}
```

Regras:
1. Rode só a fase **Specify** da skill para a feature `cupom-no-carrinho`, gerando `.specs/features/cupom-no-carrinho/spec.md` com critérios EARS.
2. Use **apenas** os termos do glossário. Não invente sinônimos.
3. Os requisitos devem cobrir os meus 3 cenários. Se você mudar ou acrescentar algo,
   deixe explícito o que mudou e por quê.
4. Se algo estiver ambíguo, **pergunte** em vez de assumir. Liste as perguntas no fim.
5. Não escreva código de aplicação. Só artefatos em `.specs/`.
6. No fim, rode `python .claude/skills/tlc-spec-driven/scripts/validate_spec.py .specs/features/cupom-no-carrinho` e corrija até passar.
