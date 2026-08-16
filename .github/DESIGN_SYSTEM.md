# QuantoLab — Design System

Este documento registra o sistema já existente no produto. O código continua sendo a fonte principal de verdade; novas telas devem reutilizar estes padrões antes de criar componentes novos.

## Identidade

- Fundo principal claro: `#f6f6f8`.
- Superfícies: branco e cinzas muito claros.
- Texto principal: `#1d1d1f`.
- Acento: lime `#d9ff66`.
- Tema escuro: fundo `#101012`, superfícies próximas de `#19191c` e texto claro.
- Tipografia: stack de sistema Apple/Helvetica/Arial já definida em `style.css`.
- Marca: `quantolab-logo.svg` e `favicon.svg`.

O lime é assinatura e deve permanecer pontual: resultado principal, pequenos indicadores, foco e estados de destaque. Não transformar o produto em uma interface predominantemente verde.

## Tokens existentes

Fonte de verdade: `:root` em `style.css` e overrides em `theme.css`.

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

## Layout

- Container principal: `.shell`, largura máxima de 1160 px.
- Grid de calculadora: `.calc-grid`, formulário + resultado, colapsando para uma coluna em telas menores.
- Grid geral: `.grid2`, `.tool-grid`, `.card-grid`.
- Breakpoints consolidados: 980, 700, 520 e 380 px.
- Mobile não é desktop reduzido: grids viram coluna, resultado deixa de ser sticky, links de navegação são progressivamente reduzidos.

## Componentes

### Header

- `.header`, `.nav`, `.brand`, `.navlinks`.
- Sticky, translúcido e com blur.
- Controle de tema global `.theme-toggle` com 44 px de área clicável no mobile.

### Botões

- Primário: `.btn`.
- Secundário: `.btn.btn-secondary`.
- Altura mínima próxima de 56–58 px nas calculadoras.
- Não criar novos estilos de CTA sem necessidade funcional.

### Formulários

- `.field`, `.field-help`, `.input-wrap`, `.prefix`, `.suffix`.
- Labels sempre associados a inputs.
- Texto de ajuda permanece visível abaixo do campo nas calculadoras simplificadas.
- Informações opcionais usam `.optional-choice` e permitem “Não se aplica / não tenho essa informação”.
- Ajustes avançados usam `.simple-details`, fechados por padrão.

### Resultado

- `.panel.result` é o padrão de resultado principal.
- `.result-top` apresenta a resposta essencial.
- `.result-value` usa o lime como destaque.
- `.highlight` apresenta a segunda informação mais útil.
- `.result-details` aplica progressive disclosure para composição e premissas.

Regra: o usuário nunca deve depender de abrir detalhes para descobrir a resposta principal.

### Cards

- Ferramentas: `.tool-card`.
- Conteúdo/apoio: `.card`.
- Evitar variações cosméticas por jornada. Uma nova ferramenta deve parecer parte do mesmo ecossistema.

### Confiança e avisos

- `.trust-row` para compromissos de confiança.
- `.notice` para limites, avisos e informações importantes.
- Publicidade usa `.ad` e suas variações; deve continuar separada visualmente de conteúdo e ação principal.

### Footer

- `.footer`, `.footer-grid`, `.footer-brand`, `.footer-links`.
- `.footer-meta` contém copyright, direitos reservados e caráter informativo das ferramentas.

## Linguagem

- Português direto, sem jargão quando não for necessário.
- Perguntas nos formulários devem refletir a linguagem do usuário leigo.
- Explicações curtas e próximas ao campo.
- Resultado deve responder primeiro “o que isso significa para mim?”.
- Termos técnicos podem aparecer nos detalhes, acompanhados de contexto.

## Acessibilidade

Requisitos mínimos permanentes:

- `lang="pt-BR"`.
- um único `h1` por página.
- labels associados.
- foco visível com `:focus-visible`.
- controles de toque com pelo menos ~44 px no mobile.
- navegação por teclado.
- HTML semântico e landmarks nativos.
- não comunicar estado apenas por cor.
- contraste compatível com tema claro/escuro.
- `prefers-reduced-motion` respeitado.
- `aria-*` somente quando necessário.
- resultados dinâmicos com `aria-live="polite"` quando aplicável.

## Processo para componentes novos

1. Procurar componente existente que resolva o problema.
2. Reutilizar tokens e espaçamentos atuais.
3. Criar novo componente apenas se houver necessidade funcional clara.
4. Validar claro/escuro, teclado, 320–1440 px e regressões.
5. Adicionar cobertura ao QA quando o componente for estrutural.