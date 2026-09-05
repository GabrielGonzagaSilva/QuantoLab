# QuantoLab — Digital Instrument System

## 1. Princípio do produto

QuantoLab é uma plataforma de instrumentos digitais para cálculo e tomada de decisão sobre trabalho, carreira e dinheiro. A interface deve parecer precisa, útil e verificável antes de parecer decorativa.

A jornada estrutural do produto é:

**calcular → explicar → comparar → orientar → continuar**

O resultado é protagonista. Fórmulas, premissas e fontes permanecem acessíveis. A interface não força um fluxo quando o usuário só precisa de uma resposta.

## 2. Modos de superfície

### Persuade — homepage

Objetivo: fazer o visitante entender o que o QuantoLab é, experimentar sua utilidade e escolher uma ferramenta.

Regras:
- primeira dobra demonstra um cálculo real;
- o instrumento funcional é o protagonista da homepage;
- a headline orienta e enquadra o produto, sem competir em escala com o instrumento;
- mensagem e ação são visíveis sem rolagem em desktop;
- prova do produto substitui claims genéricos;
- evitar sequência de cards promocionais;
- evitar excesso de transições, cortes, geometrias e efeitos entre seções;
- continuidade deve vir principalmente de grid, espaço, tipografia e mudança controlada de superfície;
- lime é reservado a dados ativos, estados e um gesto de assinatura claro, não repetido em toda seção;
- a homepage pode usar gradientes atmosféricos sutis para unir superfícies, desde que não funcionem como glow, ornamento ou estética Web3/AI SaaS.

### Operate — calculadoras e ferramentas

Objetivo: concluir uma tarefa com velocidade, clareza e confiança.

Regras:
- formulário e resultado formam o instrumento principal;
- resultado tem contraste e hierarquia superiores ao conteúdo de apoio;
- campos seguem padrões familiares de formulário;
- detalhes técnicos ficam disponíveis sem competir com a resposta principal;
- estados vazio, cálculo, detalhamento e compartilhamento permanecem claros;
- em mobile, formulário, ação e resultado seguem uma única coluna sem sensação de desktop comprimido.

### Read — guias, metodologia e conteúdo institucional

Objetivo: compreensão. Priorizar medida de leitura, hierarquia, fontes e wayfinding.

## 3. Identidade visual

### Marca

- `quantolab-logo.svg` é o wordmark oficial principal.
- Desktop, tablet e superfícies institucionais usam o wordmark completo.
- O símbolo isolado é reservado a contextos compactos, principalmente navegação mobile, avatar e favicon.
- Não reconstruir o wordmark com tipografia do sistema.
- A marca deve recuar quando o instrumento, o dado ou a tarefa já comunicam claramente que o usuário está no QuantoLab.
- Na homepage, o header pertence ao mesmo campo escuro do hero; por isso o wordmark é apresentado em versão clara por tratamento de superfície.

### Paleta

| Papel | Valor base |
| --- | --- |
| Ink | `#101112` |
| Black instrument | `#09090A` |
| Off-white | `#F4F5F0` |
| White | `#FFFFFF` |
| Surface soft | `#EEF0EA` |
| Muted | `#66686B` |
| Border | `#D9DAD4` |
| Border strong | `#AFB1AA` |
| Lime / signature | `#D9FF66` |

Lime comunica ação, estado ativo, leitura principal ou uma assinatura de marca claramente definida. Na homepage, o resultado da calculadora e o fechamento de ação são os usos de maior intensidade. Não espalhar lime como decoração entre todas as seções.

### Light e dark mode

Os temas são compostos como sistemas próprios, não como inversões mecânicas.

**Homepage / Persuade**
- header e hero permanecem escuros em light e dark mode porque formam o campo de marca e de demonstração do instrumento;
- a preferência de tema passa a influenciar principalmente as superfícies que vêm depois da primeira dobra;
- light mode usa off-white, papel claro e tons suaves intermediários;
- dark mode usa carvão profundo com diferenças reais de elevação entre canvas, método e conteúdo editorial;
- a transição hero → conteúdo pode usar um gradiente atmosférico curto e controlado para evitar corte preto/branco;
- gradientes não podem criar glow, neon, halo ou decoração autônoma.

**Operate / Read**
- o tema do usuário governa toda a superfície;
- light prioriza leitura em off-white/branco;
- dark usa superfícies `#111113`, `#19191C` e `#202024` com contraste composto explicitamente;
- lime permanece a cor de assinatura e estado ativo.

### Tipografia

- Sans de trabalho: `IBM Plex Sans` quando disponível, com fallback para `Helvetica Neue` e Arial.
- Numerais de resultados sempre usam `font-variant-numeric: tabular-nums`.
- Mono é reservado para dados, código ou medição quando necessário; não é decoração “tech”.
- Headlines da homepage usam peso moderado e escala editorial controlada; a intenção é autoridade, não volume.
- Tracking de display fica entre `-0.02em` e `-0.035em`; não ultrapassar `-0.04em`.
- Corpo principal usa 15–18 px e line-height entre 1.55–1.7.
- Microtipografia técnica é reservada a metadados reais, categorias e estados.
- O sistema deve distinguir claramente display, corpo, label e dado sem depender apenas de tamanho.

## 4. Geometria

- Cards não estruturam páginas inteiras.
- Bordas de 1 px são preferidas a sombras.
- Raios: 8–16 px em superfícies funcionais.
- Pills apenas para controles pequenos, tags e status.
- Inputs: 10 px.
- Form/result panels: 12–16 px.
- A homepage não usa diagonais ou geometrias decorativas como recurso recorrente de transição.
- Continuidade visual é construída por alinhamento, ritmo, espaço, contraste tonal e transições atmosféricas discretas.
- Geometria adicional só entra quando pertence à lógica de instrumento ou medição e melhora compreensão.
- Não usar glassmorphism.
- Não usar glow, gradient text, bento genérico ou estética Web3/AI SaaS.
- Gradiente só é permitido quando une superfícies próximas ou cria atmosfera de fundo de baixa intensidade; nunca deve ser o protagonista.

## 5. Navegação

O header funciona como um rail sólido de instrumento:
- altura de 68 px em desktop;
- fundo sólido, sem blur;
- na homepage, compartilha a mesma superfície escura do hero e não cria uma faixa clara independente;
- wordmark oficial à esquerda em desktop/tablet;
- símbolo isolado em navegação compacta/mobile;
- navegação e tema à direita;
- separadores devem ser discretos e não interromper a continuidade com o hero;
- foco visível e área mínima de toque preservados.

## 6. Homepage

### Primeira dobra

Desktop:
- header e hero formam um único ambiente escuro contínuo;
- o hero usa um gradiente tonal quase imperceptível entre carvão e preto esverdeado, sem glow;
- não existe faixa vazia ou corte visual rígido entre navegação e conteúdo;
- grid de duas colunas com maior área visual para o instrumento;
- copy mais contida à esquerda;
- instrumento funcional de salário líquido à direita;
- headline não deve superar visualmente o resultado da calculadora;
- instrumento usa a mesma função `salaryNet` de `tools-core.js`;
- input de salário bruto atualiza líquido, INSS, IRRF e retenção em tempo real;
- CTA principal leva ao catálogo e CTA secundário à metodologia.

Mobile:
- header permanece escuro e integrado ao hero;
- copy curta primeiro;
- símbolo compacto no header;
- instrumento aparece imediatamente em seguida;
- breakdown vira lista vertical em telas estreitas;
- CTAs tornam-se empilhados;
- corpo e descrições não devem depender de microtipografia para caber.

### Transição hero → conteúdo

Entre hero e conteúdo existe uma transição atmosférica curta, sem corte geométrico e sem plano lime.

Light mode:
- escuro do hero evolui gradualmente para off-white em uma faixa curta;
- a faixa não carrega conteúdo importante e deve ser percebida como ambiente, não como efeito.

Dark mode:
- a mesma região conecta o hero a um carvão ligeiramente mais claro, com contraste muito menor.

### Rail de confiança

Após a transição existe uma faixa neutra de confiança que apresenta:
- sem cadastro obrigatório;
- cálculos verificáveis;
- referências quando aplicável;
- acesso direto à metodologia.

A função é reduzir ansiedade e conectar superfícies, não criar um novo pico visual.

### Diretório inicial

- a homepage apresenta quatro entradas prioritárias, não seis ou mais opções equivalentes;
- as entradas são formuladas primeiro como dúvidas humanas e depois apoiadas pelo nome da ferramenta;
- cada linha contém nome da ferramenta, pergunta, descrição e ação;
- não há cards fechados;
- o catálogo completo permanece acessível pelo CTA `Ver todas as 28 ferramentas`;
- o objetivo é reduzir carga cognitiva sem remover nenhuma ferramenta do produto.

### Método

- em light mode, método permanece na família de superfícies claras, usando um tom suave intermediário em vez de um grande bloco preto;
- em dark mode, usa carvão um pouco elevado em relação ao canvas;
- `Calcular / Conferir / Continuar` permanece uma sequência real, portanto `01 / 02 / 03` pode ser usado;
- números são pequenos e funcionais, não elementos gráficos dominantes;
- em mobile, a sequência retorna a uma coluna clara e previsível.

### Guias

- os três guias usam composição editorial alinhada;
- light mode usa superfície de papel levemente distinta do diretório;
- dark mode usa carvão editorial com contraste tonal próprio;
- não há offsets verticais artificiais entre os itens;
- cada item é ancorado por linha superior, categoria, título e contexto;
- a seção é secundária ao instrumento e ao diretório.

### Fechamento

- a homepage termina com um único plano lime de assinatura;
- o fechamento pergunta qual decisão o usuário precisa fazer agora;
- existe uma única ação principal para retornar ao catálogo de ferramentas;
- este é o pico final da página, substituindo múltiplos efeitos lime espalhados ao longo da jornada.

## 7. Calculadoras

### Estrutura desktop

- hero compacto;
- trust row discreto;
- grid formulário + resultado;
- formulário claro;
- resultado escuro e sticky;
- ação principal forte e direta;
- resultado principal em lime;
- detalhamento técnico dentro do mesmo instrumento.

### Estrutura mobile

- grid vira coluna única;
- resultado deixa de ser sticky lateral;
- ações permanecem alcançáveis no final do formulário;
- sticky actions usam fundo sólido, sem blur;
- valores não dependem de viewport fixo para caber.

### Inputs

- mínimo aproximado de 54 px em superfícies principais;
- labels acima do campo;
- help text menor e secundário;
- focus state com borda oliva/lime e halo curto de acessibilidade;
- prefixos e sufixos não competem com o valor.

### Resultados

- `aria-live` preservado;
- valor principal em lime;
- breakdown e tabela usam numerais tabulares;
- estado anterior ao cálculo permanece informativo;
- compartilhar/copiar são ações secundárias.

## 8. Acessibilidade

Requisitos obrigatórios:
- foco visível em teclado;
- contraste WCAG AA em textos e controles;
- fonte de input ≥16 px em mobile quando necessário para evitar zoom do navegador;
- `prefers-reduced-motion` respeitado;
- elementos interativos com alvo adequado;
- estados não dependem apenas de cor;
- `aria-live`, landmarks, labels e hierarquia semântica existentes são preservados.

## 9. Responsividade

Breakpoints operacionais:
- `>1100 px`: desktop amplo;
- `901–1100 px`: desktop compacto;
- `761–900 px`: tablet;
- `431–760 px`: mobile;
- `≤430 px`: mobile compacto.

A regra é recomposição, não compressão. Quando o layout perde legibilidade, muda de estrutura.

## 10. Browser craft

O sistema também tematiza:
- seleção de texto;
- scrollbar;
- focus rings;
- placeholders;
- underline offset;
- numerais tabulares;
- favicon com pathname versionado quando houver troca de identidade para evitar cache persistente.
