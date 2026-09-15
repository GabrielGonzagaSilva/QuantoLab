# QuantoLab — Digital Instrument System

## 1. Princípio do produto

QuantoLab é uma plataforma de instrumentos digitais para cálculo e tomada de decisão sobre trabalho, carreira e dinheiro. A interface deve parecer precisa, útil e verificável antes de parecer decorativa.

A jornada estrutural é:

**calcular → explicar → comparar → orientar → continuar**

O resultado é protagonista. Fórmulas, premissas e fontes permanecem acessíveis. A interface não força uma jornada quando o usuário só precisa de uma resposta.

## 2. Modos de superfície

### Persuade — homepage

Objetivo: explicar o produto, demonstrar utilidade e levar o visitante à ferramenta certa.

- a primeira dobra demonstra um cálculo real;
- o instrumento funcional é o protagonista;
- prova de produto substitui claims genéricos;
- evitar sequência de cards promocionais;
- lime é reservado a dados ativos, estados e um gesto de assinatura claro;
- gradientes atmosféricos são permitidos apenas como transição tonal de fundo, sem glow, neon ou estética Web3/AI SaaS.

### Operate — calculadoras e ferramentas

Objetivo: concluir uma tarefa com velocidade, clareza e confiança.

- formulário e resultado formam o instrumento principal;
- resultado tem contraste e hierarquia superiores ao conteúdo de apoio;
- campos seguem padrões familiares;
- detalhes técnicos permanecem disponíveis sem competir com a resposta;
- estados `waiting`, `error` e `calculated` são explícitos no componente de resultado;
- o preview do resultado permanece visível antes do cálculo e após reset;
- em mobile, a estrutura recompõe para uma coluna, sem aparência de desktop comprimido.

### Read — guias, metodologia e institucional

Objetivo: compreensão. Priorizar medida de leitura, hierarquia, fontes, wayfinding e superfícies editoriais simples.

## 3. Tema e identidade visual

### Contrato dark-only

O runtime atual do QuantoLab é **dark-only**.

- `theme.js` força `data-theme="dark"` e `data-resolved-theme="dark"`;
- não existe seletor de tema no produto;
- novas telas não devem criar light mode local, toggle próprio ou regras condicionais de tema;
- superfícies principais usam preto e carvão profundo, com elevação por contraste tonal e hairlines;
- off-white e branco continuam disponíveis como cores de texto, documentação e referência de marca, não como canvas claro do runtime atual;
- qualquer reintrodução de light mode é uma decisão futura de produto e exige atualização coordenada de tokens, QA e documentação. Não deve acontecer por CSS isolado.

### Marca

- `quantolab-logo.svg` é o wordmark oficial;
- desktop/tablet usam o wordmark completo;
- o símbolo isolado é reservado a contextos compactos, principalmente mobile e favicon;
- não reconstruir o wordmark com tipografia do sistema;
- a marca recua quando o dado ou a tarefa já deixam claro que o usuário está no QuantoLab.

### Paleta de referência

| Papel | Valor base |
| --- | --- |
| Ink | `#101112` |
| Black instrument | `#09090A` |
| Dark surface | `#111113` |
| Elevated surface | `#19191C` |
| Elevated strong | `#202024` |
| White | `#FFFFFF` |
| Muted | `#B9B9BF` |
| Lime / signature | `#D9FF66` |

Lime comunica ação, estado ativo, leitura principal ou assinatura. Não espalhar lime como decoração.

### Tipografia

- Sans de trabalho: `IBM Plex Sans` quando disponível, com fallback para `Helvetica Neue` e Arial;
- numerais de resultados usam `font-variant-numeric: tabular-nums`;
- mono é reservado para dado, código ou medição real;
- display usa tracking entre `-0.02em` e `-0.035em`;
- corpo principal usa 15–18 px e line-height entre 1.55–1.7;
- metadados técnicos devem representar informação real, não decoração “tech”.

## 4. Geometria e linguagem visual

- cards não estruturam páginas inteiras;
- bordas de 1 px são preferidas a sombras;
- raios de 8–16 px em superfícies funcionais;
- pills apenas para controles pequenos, tags e status;
- inputs: aproximadamente 10 px de raio;
- form/result panels: 12–16 px;
- não usar glassmorphism;
- não usar glow, gradient text, bento genérico ou estética Web3/AI SaaS;
- gradiente só é permitido como atmosfera de baixa intensidade para conectar superfícies;
- continuidade visual vem de grid, espaço, tipografia, contraste tonal e hairlines.

## 5. Navegação e consentimento

### Navegação

O header funciona como rail sólido de instrumento:

- altura de aproximadamente 68 px em desktop;
- fundo sólido, sem blur;
- wordmark oficial à esquerda em desktop/tablet;
- símbolo isolado em navegação compacta/mobile;
- navegação à direita;
- foco visível e alvo mínimo de toque preservados.

### Consentimento de termos

O consentimento de primeira visita é explícito, mas não toma conta da página.

- aparece como rail/painel compacto no fluxo da página, logo após o header;
- não sobrepõe conteúdo, controles ou ações da interface;
- não usa `aria-modal`, focus trap, overlay ou bloqueio de rolagem;
- o visitante pode navegar e ler antes do aceite;
- executar uma calculadora exige aceite explícito enquanto a versão atual ainda não foi aceita;
- tentativa de calcular antes do aceite leva foco ao CTA e explica o requisito em região `aria-live`;
- Termos e Privacidade permanecem acessíveis sem aceite;
- o registro de aceite fica apenas no navegador e não inclui valores de cálculo.

## 6. Homepage

### Primeira dobra

- header e hero formam um único ambiente escuro;
- o gradiente de assinatura preto → verde profundo → lime é controlado e pertence ao sistema atual da homepage;
- grid de duas colunas com maior área visual para o instrumento;
- copy contida à esquerda;
- prévia funcional de salário líquido à direita;
- CTA principal leva ao catálogo e CTA secundário à metodologia.

### Diretório inicial

- quatro entradas prioritárias, formuladas a partir de dúvidas humanas;
- catálogo completo continua no CTA `Ver todas as 28 ferramentas`;
- entradas usam linhas editoriais e não uma parede de cards.

### Método, guias e fechamento

- método usa carvão levemente elevado em relação ao canvas;
- `Calcular / Conferir / Continuar` é sequência real e pode usar `01 / 02 / 03`;
- guias usam composição editorial alinhada, sem offsets artificiais;
- o fechamento usa um único plano lime de assinatura com uma ação principal.

## 7. Calculadoras

### Desktop

- hero compacto;
- trust row discreto;
- grid formulário + resultado;
- resultado escuro e sticky quando apropriado;
- ação principal direta;
- resultado principal em lime;
- detalhamento técnico dentro do mesmo instrumento.

### Mobile

- grid vira coluna única;
- resultado deixa de ser sticky lateral;
- ações permanecem alcançáveis;
- sticky actions usam fundo sólido, sem blur;
- valores não dependem de viewport fixo para caber.

### Inputs

- mínimo aproximado de 54 px em superfícies principais;
- labels acima do campo;
- help text menor e secundário;
- focus state visível e consistente;
- prefixos e sufixos não competem com o valor.

### Resultado e estados

O painel `.panel.result` é permanente e não usa `hidden` para representar seu estado principal em runtime.

- `data-result-state="waiting"`: mostra `Aguardando cálculo`, instrução curta e esconde tabelas/detalhamento;
- `data-result-state="error"`: mantém painel visível, explica o que precisa ser revisado e mantém o formulário acessível;
- `data-result-state="calculated"`: exibe resultado real, breakdown, tabela e ações secundárias;
- limpar ou escolher `Fazer outro cálculo` retorna a `waiting`;
- `aria-live="polite"` permanece no painel para anunciar mudanças sem interromper o usuário.

`hidden` continua válido para subcomponentes realmente ausentes do estado atual, como visualização opcional, tabela alternativa ou detalhe colapsado. Ele não deve ser usado como substituto do estado do painel principal.

## 8. Acessibilidade, responsividade e browser craft

Requisitos permanentes:

- foco visível por teclado;
- contraste WCAG AA;
- input ≥16 px em mobile quando necessário para evitar zoom;
- `prefers-reduced-motion` respeitado;
- alvos de toque adequados;
- estados não dependem apenas de cor;
- landmarks, labels, hierarquia semântica e `aria-live` preservados;
- sem overflow horizontal entre 320 e 1440 px;
- responsividade por recomposição, não compressão.

Breakpoints operacionais:

- `>1100 px`: desktop amplo;
- `901–1100 px`: desktop compacto;
- `761–900 px`: tablet;
- `431–760 px`: mobile;
- `≤430 px`: mobile compacto.

O sistema também cuida de seleção de texto, scrollbar, focus rings, placeholders, underline offset, numerais tabulares e favicon versionado quando necessário para evitar cache persistente.
