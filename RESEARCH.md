# RESEARCH — Preço ou disponibilidade muda com o NFT já no carrinho

## 1. Quem sente a dor

1. O colecionador que está comprando: já escolheu um ou mais NFTs, colocou no carrinho e está a caminho de pagar.
2. Ele sente a dor com mais força quando:
   1. deixa o carrinho aberto por alguns minutos enquanto compara outras peças no catálogo;
   2. está na tela de pagamento, revisando os dados, e ainda não confirmou;
   3. compra várias unidades da mesma edição (ex.: 3 unidades), porque a falta de estoque o atinge de forma parcial.
3. Quem não sente essa dor (diretamente): o visitante que só navega no catálogo sem intenção de compra.

## 2. A dor, em uma frase

1. "Eu decido comprar olhando um preço e uma quantidade disponível, mas esses números podem mudar enquanto eu ainda estou no carrinho ou no pagamento, e eu corro o risco de confirmar uma compra diferente da que eu achei que estava fazendo — sem ser avisado."

## 3. Quando acontece (gatilhos)

1. O vendedor altera o preço de um NFT que já está no meu carrinho (ex.: de 0.85 ETH para 0.92 ETH).
2. Outro colecionador compra unidades da mesma edição e a quantidade disponível cai abaixo da que eu pus no carrinho (ex.: eu tenho 3 unidades, sobram só 2).
3. A edição esgota por completo (disponível passa de 1 para 0) enquanto a peça está no meu carrinho.
4. Eu estou navegando em outra tela (catálogo, detalhe de outra peça) e volto ao carrinho depois que a mudança aconteceu.
5. Eu já estou revisando o pedido no pagamento e a mudança chega antes de eu clicar em confirmar.
6. Minha conexão cai por alguns instantes e, ao voltar, os valores que eu vejo podem estar velhos.
7. Mudanças que me favorecem também acontecem: o preço cai (ex.: de 1.20 ETH para 1.05 ETH) ou volta a haver estoque.

## 4. O que o colecionador perde hoje (impacto)

1. **Dinheiro:** pode pagar mais do que viu no resumo. Ex.: 2 unidades a 0.85 ETH = 1.70 ETH no resumo; se o preço passou para 0.92 ETH, o valor real é 1.84 ETH — 0.14 ETH de diferença sem aviso.
2. **Confiança:** descobre a diferença só no recibo, ou nem descobre; passa a desconfiar de todos os totais exibidos pela loja.
3. **Tempo:** preenche dados de pagamento, escolhe carteira e rede e, no fim, a compra é recusada por falta de estoque, obrigando a recomeçar.
4. **Clareza:** não sabe qual item mudou, nem de quanto para quanto, se o carrinho tem vários itens.
5. **Oportunidade:** se o preço caiu e a tela não mostra, ele pode desistir de uma compra que estava mais barata do que parecia.
6. **Controle:** a compra pode ser finalizada com um valor que ele não aprovou explicitamente.

## 5. Evidências no enunciado

1. "Refletir alterações de preço e disponibilidade recebidas enquanto o carrinho estiver aberto." — Seção 3, Carrinho.
2. "Adicionar, alterar e remover itens, respeitando a disponibilidade por NFT e edição." — Seção 3, Carrinho.
3. "Exibir subtotal, desconto, taxa de rede e total coerentes com a resposta da API." — Seção 3, Carrinho.
4. "Valores em ETH devem trafegar como strings decimais e manter precisão nos cálculos e na apresentação. Quantidades são inteiras. A cotação da API é a referência para finalizar o pedido." — Seção 3, Carrinho.
5. "Revalidar preço, disponibilidade, cupom e taxas antes de confirmar a compra. Mudanças devem exigir nova confirmação do usuário." — Seção 3, Pagamento e confirmação.
6. "Preservar os itens em falhas; após confirmação, remover do carrinho apenas os itens e quantidades comprados." — Seção 3, Pagamento e confirmação.
7. "O recibo deve reproduzir o snapshot do pedido. Alterações posteriores no catálogo não podem modificar seus valores." — Seção 3, Pagamento e confirmação.
8. "Cotação | Validação de cupom, disponibilidade, descontos, taxas e total" — Seção 5, Contratos REST.
9. "As respostas devem representar erros de validação, sessão inválida, falta de permissão, recurso inexistente, conflito de disponibilidade e falha transitória." — Seção 5, Contratos REST.
10. "`nft.updated` | Atualizar preço e disponibilidade no catálogo, detalhe e carrinho" — Seção 7, Tempo real.
11. "Os eventos devem carregar identidade estável, recurso afetado e versão. O cliente deve tolerar duplicatas e eventos antigos, sem regredir um estado mais recente nem reaplicar efeitos." — Seção 7, Tempo real.
12. "Após reconexão, reconcilie os recursos ativos com a API REST." — Seção 7, Tempo real.
13. "1. Um NFT está no carrinho. 2. Seu preço ou disponibilidade muda durante a navegação. 3. A interface informa a alteração e atualiza o resumo. 4. O checkout impede a confirmação com uma cotação desatualizada." — Seção 7, Tempo real.

## 6. Variações e casos-limite

1. **Preço sobe:** 1 unidade de 0.50 ETH passa a 0.55 ETH; o total sobe 0.05 ETH e o colecionador precisa ver isso antes de pagar.
2. **Preço cai:** 1 unidade de 1.20 ETH passa a 1.05 ETH; boa notícia, mas também precisa ser informada e refletida no total.
3. **Estoque parcial:** tenho 3 unidades no carrinho e restam 2; o que acontece com a terceira? (ver perguntas em aberto).
4. **Esgotado:** a edição vai a 0 disponível; o item não pode seguir para a compra.
5. **Duas mudanças no mesmo item:** preço vai de 0.80 para 0.90 e depois para 0.95 ETH; o colecionador deve ver o valor final, não um intermediário.
6. **Aviso repetido:** a mesma mudança chega duas vezes; o colecionador não deve ver dois avisos nem o total ser alterado duas vezes.
7. **Aviso atrasado:** chega a notícia antiga "preço 0.90 ETH" depois da mais nova "preço 0.95 ETH"; a tela não pode voltar para 0.90 ETH.
8. **Vários itens mudam ao mesmo tempo:** carrinho com 4 NFTs, 2 mudam de preço e 1 esgota; o colecionador precisa saber exatamente quais.
9. **Mudança com cupom aplicado:** cupom de 10% sobre subtotal de 2.00 ETH (desconto 0.20 ETH); se o subtotal vira 2.30 ETH, o desconto e o total também mudam (0.23 ETH de desconto, 2.07 ETH antes de taxas).
10. **Mudança durante a revisão do pagamento:** o colecionador está a um clique de confirmar; a confirmação com o valor antigo deve ser barrada e uma nova aprovação pedida.
11. **Mudança depois da confirmação:** o pedido já foi confirmado a 0.85 ETH e o preço vai a 0.92 ETH; o recibo continua mostrando 0.85 ETH.
12. **Conexão cai e volta:** ao voltar, os valores do carrinho precisam ser conferidos novamente com a loja, pois avisos podem ter se perdido.
13. **Mudança irrelevante:** chega uma atualização de um NFT que não está no carrinho; o resumo do carrinho não deve mudar.
14. **Precisão:** preços com muitas casas, ex.: 0.123456789012345678 ETH × 3 unidades = 0.370370367037037034 ETH; nenhum arredondamento silencioso pode alterar o total exibido.
15. **Troca de usuário:** um aviso de mudança destinado à sessão anterior não pode alterar o carrinho de outro colecionador.

## 7. O que NÃO é o problema (fora do escopo)

1. Decidir quanto vale um NFT ou como o vendedor define o preço.
2. Reservar ou "segurar" o preço ou o estoque para o colecionador enquanto ele decide.
3. Garantir que o colecionador sempre consiga comprar: se esgotou, esgotou; a dor é não ser avisado.
4. Mudanças de preço que acontecem depois que o pedido foi confirmado (o recibo já está protegido pelo enunciado).
5. Validação de cupom inválido ou expirado em si (é outra dor do carrinho; aqui só interessa o efeito de uma mudança de preço sobre um cupom já aplicado).
6. Pedidos duplicados por cliques repetidos e recuperação de pedido pendente após queda de conexão (dor vizinha, tratada à parte).
7. Atualização de preço no catálogo e no detalhe para quem não tem o NFT no carrinho (mencionado no enunciado, mas a dor aqui é de quem está comprando).
8. Escolha de carteira, rede e dados pessoais no pagamento.

## 8. Como saberemos que a dor sumiu (sinais observáveis pelo colecionador)

1. Com o carrinho aberto, quando o preço de um item muda de 0.85 ETH para 0.92 ETH, o colecionador vê um aviso que identifica o item e mostra o valor antigo e o novo.
2. O subtotal, o desconto, as taxas e o total do resumo passam a refletir o novo preço sem que ele precise recarregar a página.
3. Quando a quantidade disponível cai abaixo da que está no carrinho (3 no carrinho, 2 disponíveis), ele é avisado e não consegue seguir com 3 unidades.
4. Quando a edição esgota, o item fica claramente marcado como indisponível e não entra no total a pagar.
5. Se a mudança acontece enquanto ele navega em outra tela, ao voltar ao carrinho ele encontra o aviso e os valores já corrigidos.
6. Na tela de pagamento, se qualquer valor mudou desde a última revisão, o botão de confirmar não finaliza a compra com o valor antigo; ele vê o que mudou e precisa aprovar de novo.
7. O valor cobrado e mostrado no recibo é exatamente o último total que ele aprovou.
8. A mesma mudança nunca gera dois avisos nem altera o total duas vezes.
9. O preço exibido nunca "volta" para um valor mais antigo depois de ter sido atualizado.
10. Depois de uma queda de conexão, os valores do carrinho conferem com os da loja assim que a conexão volta.
11. Os totais em ETH exibidos batem, casa a casa, com a soma manual de preço × quantidade menos desconto mais taxas.

## 9. Perguntas em aberto

1. Quando o estoque cai abaixo da quantidade no carrinho (3 → 2 disponíveis), a quantidade deve ser reduzida automaticamente para 2 ou o colecionador decide (reduzir ou remover)?
2. Um item esgotado deve sair do carrinho sozinho, ou ficar visível como "indisponível" até o colecionador removê-lo?
3. Uma queda de preço também deve exigir nova confirmação no pagamento, ou só aumentos de preço e reduções de estoque?
4. O aviso de mudança deve permanecer até o colecionador reconhecê-lo, ou pode sumir sozinho depois de alguns segundos?
5. Se a mudança acontece enquanto o colecionador está em outra tela (ex.: catálogo), ele deve ser avisado ali mesmo ou só quando voltar ao carrinho/pagamento?
6. Se uma mudança de preço tornar o cupom aplicado inválido (ex.: valor mínimo de compra deixa de ser atingido), como isso deve ser comunicado?
7. Há uma variação mínima de preço abaixo da qual não vale avisar (ex.: 0.000001 ETH), ou toda mudança deve ser avisada?
8. Mudanças na taxa de rede também contam como "cotação desatualizada" e exigem nova confirmação?
9. Quanto tempo uma cotação aprovada continua valendo antes de precisar ser conferida de novo, mesmo sem aviso de mudança?
10. No carrinho do visitante (não autenticado), as mudanças de preço e disponibilidade também devem ser avisadas, ou só depois do login?

## 10. Tamanho estimado (P / M / G) e por quê

1. **Tamanho: G.**
2. A dor atravessa três momentos da compra (carrinho, navegação em outras telas e pagamento), e cada um precisa mostrar a mudança de forma coerente.
3. Envolve dois tipos de mudança (preço e disponibilidade), cada um com variações (sobe/cai, parcial/esgotado), além de combinações com cupom e taxas.
4. Exige proteção contra avisos repetidos, atrasados e fora de ordem, e conferência após queda de conexão — casos que só aparecem sob condições difíceis de reproduzir.
5. Exige um bloqueio explícito na confirmação, com nova aprovação, o que muda o fluxo de pagamento.
6. Exige precisão total nos valores em ETH em todos os totais recalculados.
7. Há pelo menos 10 perguntas de comportamento ainda sem resposta (seção 9), que podem aumentar o escopo dependendo das decisões.
