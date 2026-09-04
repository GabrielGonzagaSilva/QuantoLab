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
- mensagem e ação são visíveis sem rolagem em desktop;
- expressão de marca pode ser mais forte;
- prova do produto substitui claims genéricos;
- evitar sequência de cards promocionais.

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

Lime comunica ação, estado ativo, leitura principal ou sinal de medição. Não deve ser espalhado como decoração.

### Dark mode

O modo escuro preserva o mesmo sistema, com superfícies `#111113`, `#19191C` e `#202024`. Lime permanece a cor de assinatura. Não usar glow como substituto de contraste.

### Tipografia

- Sans de trabalho: `IBM Plex Sans` quando disponível, com fallback para `Helvetica Neue` e Arial.
- Numerais de resultados sempre usam `font-variant-numeric: tabular-nums`.
- Mono é reservado para dados, código ou medição quando necessário; não é decoração “tech”.
- Headlines: tracking máximo de `-0.04em`.
- Corpo: 1.5–1.7 de line-height e medida confortável.

## 4. Geometria

- Cards não estruturam páginas inteiras.
- Bordas de 1 px são preferidas a sombras.
- Raios: 10–16 px em superfícies funcionais.
- Pills apenas para controles pequenos, tags e status.
- Inputs: 10 px.
- Form/result panels: 16 px.
- Não usar glassmorphism.
- Não usar gradiente decorativo, glow, bento genérico ou estética Web3/AI SaaS.

## 5. Navegação

O header funciona como um rail sólido de instrumento:
- altura de 68–70 px em desktop;
- fundo sólido, sem blur;
- logo à esquerda;
- navegação e tema à direita;
- borda inferior de 1 px;
- foco visível e área mínima de toque preservados.

## 6. Homepage

### Primeira dobra

Desktop:
- grid de duas colunas;
- copy à esquerda;
- instrumento funcional de salário líquido à direita;
- instrumento usa a mesma função `salaryNet` de `tools-core.js`;
- input de salário bruto atualiza líquido, INSS, IRRF e retenção em tempo real;
- CTA principal leva ao catálogo e CTA secundário à metodologia.

Mobile:
- copy primeiro;
- instrumento em seguida;
- breakdown vira lista vertical;
- CTAs tornam-se empilhados.

### Diretório de ferramentas

As ferramentas principais aparecem em linhas informacionais, não em tiles equivalentes. Cada linha contém categoria, nome, descrição e ação.

### Método

A sequência `Calcular / Conferir / Continuar` explica a arquitetura do produto sem adicionar promessas novas.

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
- `>1040 px`: desktop amplo;
- `901–1040 px`: desktop compacto/tablet landscape;
- `701–900 px`: tablet/desktop estreito;
- `431–700 px`: mobile;
- `≤430 px`: mobile compacto.

A regra é recomposição, não compressão. Quando o layout perde legibilidade, muda de estrutura.

## 10. Browser craft

O sistema também tematiza:
- seleção de texto;
- scrollbar;
- focus rings;
- placeholders;
- underline offset;
- numerais tabulares.

## 11. Critério de aceite da V2

A implementação é considerada aderente quando:
1. homepage demonstra o produto na primeira dobra;
2. calculadoras continuam funcionando sem alteração de fórmulas;
3. resultado é o elemento dominante nas ferramentas;
4. desktop, tablet e mobile usam composições próprias;
5. dark mode continua funcional;
6. navegação, consentimento, compartilhamento e conteúdo institucional continuam acessíveis;
7. nenhuma superfície depende de glassmorphism, glow, gradiente decorativo ou card grid genérico como linguagem principal.
