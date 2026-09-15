# QuantoLab — Design System

Este documento registra o sistema implementado no produto. O código continua sendo a fonte principal de verdade; novas telas devem reutilizar estes padrões antes de criar componentes novos.

## Identidade

- Runtime atual: **dark-only**.
- Canvas principal: preto/carvão (`#09090A`, `#101012`).
- Superfícies: `#111113`, `#19191C` e `#202024` conforme elevação.
- Texto: branco e cinzas de alto contraste.
- Acento: lime `#D9FF66`.
- Tipografia: `IBM Plex Sans` quando disponível, com fallback Helvetica Neue/Arial.
- Marca: `quantolab-logo.svg`; símbolo compacto apenas em contextos reduzidos.

Não existe toggle de tema no runtime. Novos componentes não devem introduzir light mode local. Uma eventual volta de light mode exige decisão explícita de produto e atualização coordenada de tokens, testes e documentação.

O lime é assinatura e deve permanecer pontual: resultado principal, ação, foco, dado ativo ou estado relevante. Não transformar o produto em uma interface predominantemente verde.

## Tokens

Fonte de verdade: `style.css`, `theme.css`, `dark-only.css` e refinamentos em `instrument-system.css`.

Principais tokens:

- `--bg`
- `--surface`
- `--surface-soft`
- `--surface-muted`
- `--text`
- `--muted`
- `--muted-2`
- `--border`
- `--border-strong`
- `--accent`
- `--dark`
- `--shadow-sm`
- `--shadow-lg`
- `--radius-xl`
- `--radius-lg`
- `--radius-md`
- `--focus`

Bordas e contraste tonal são preferidos a sombras. Glassmorphism, blur decorativo, glow e gradient text não pertencem ao sistema.

## Layout

- Container principal: `.shell`, largura máxima aproximada de 1160 px.
- Calculadoras: `.calc-grid`, formulário + resultado, recompondo para uma coluna em telas menores.
- Grids auxiliares: `.grid2`, `.tool-grid`, `.card-grid`.
- Catálogo de ferramentas usa diretório em linhas, não parede de cards.
- Mobile não é desktop reduzido: grids mudam de estrutura, resultado deixa de ser sticky e navegação é simplificada.

## Componentes

### Header

- `.header`, `.nav`, `.brand`, `.navlinks`.
- Superfície sólida, sem blur.
- Wordmark completo em desktop/tablet e símbolo compacto em mobile.
- Não existe `.theme-toggle` no contrato atual.

### Botões

- Primário: `.btn`.
- Secundário: `.btn.btn-secondary`.
- Controles principais mantêm área de toque adequada.
- Não criar novos estilos de CTA sem necessidade funcional clara.

### Formulários

- `.field`, `.field-help`, `.input-wrap`, `.prefix`, `.suffix`.
- Labels associados aos inputs.
- Help text próximo do campo.
- Informações opcionais usam disclosure quando necessário.
- Sticky actions em mobile usam superfície sólida, sem backdrop blur.

### Resultado

- `.panel.result` é o painel permanente de resposta.
- `.result-top` apresenta a resposta essencial.
- `.result-value` usa lime como destaque principal.
- `.result-details` aplica progressive disclosure para composição e premissas.
- `aria-live="polite"` anuncia mudanças do resultado.

O painel principal usa estado explícito:

- `data-result-state="waiting"`: preview visível com `Aguardando cálculo`;
- `data-result-state="error"`: feedback de validação sem esconder o formulário;
- `data-result-state="calculated"`: resultado real, detalhamento e ações secundárias.

Regra permanente: o painel principal não usa `hidden` para simular preview. Limpar ou escolher `Fazer outro cálculo` volta a `waiting`.

`hidden` pode ser usado em subcomponentes realmente ausentes do estado atual, como gráfico opcional ou tabela alternativa.

### Consentimento

- `.terms-consent` é um rail/painel fixo compacto de primeira visita.
- Não é modal fullscreen.
- Não usa `aria-modal`, focus trap ou bloqueio de rolagem.
- O visitante pode navegar e ler sem aceite.
- Ações de cálculo são bloqueadas até aceite explícito da versão atual.
- Uma tentativa de calcular antes do aceite apresenta mensagem em `aria-live` e leva foco ao CTA de aceite.
- Termos e Privacidade continuam acessíveis antes do aceite.
- O registro local contém apenas a versão aceita, nunca valores das calculadoras.

### Cards e superfícies editoriais

- `.card` e `.tool-card` só entram quando existe agrupamento funcional real.
- Evitar nesting de cards, bento genérico e decoração sem função.
- Páginas legais/editoriais priorizam hairlines, medida de leitura e hierarquia tipográfica.

### Confiança e avisos

- `.trust-row` para compromissos de confiança.
- `.notice` para limites e informações importantes.
- Publicidade usa `.ad` e permanece separada da ação principal.

### Footer

- `.footer`, `.footer-grid`, `.footer-brand`, `.footer-links`.
- `.footer-meta` contém copyright e caráter informativo das ferramentas.

## Linguagem

- Português direto e específico.
- Perguntas refletem a linguagem de usuários leigos.
- Resultado responde primeiro “o que isso significa para mim?”.
- Termos técnicos aparecem com contexto.
- Evitar labels genéricos como “Abrir” quando a ação pode ser “Calcular”, “Comparar”, “Projetar” ou “Planejar”.

## Acessibilidade

Requisitos mínimos permanentes:

- `lang="pt-BR"`;
- um único `h1` por página;
- labels associados;
- foco visível com `:focus-visible`;
- controles de toque com pelo menos ~44 px no mobile;
- navegação por teclado;
- HTML semântico e landmarks nativos;
- estado não comunicado apenas por cor;
- contraste compatível com o tema dark-only;
- `prefers-reduced-motion` respeitado;
- `aria-*` apenas quando necessário;
- resultados dinâmicos com `aria-live="polite"`.

## Processo para componentes novos

1. Procurar componente existente que resolva o problema.
2. Reutilizar tokens e espaçamentos atuais.
3. Criar componente novo apenas quando houver necessidade funcional clara.
4. Validar dark-only, teclado e faixas de 320–1440 px.
5. Validar estados loading/empty/error/success quando aplicável.
6. Adicionar cobertura ao QA quando o componente for estrutural.
7. Não reintroduzir glass, blur, cardificação excessiva ou aparência genérica de AI SaaS.
