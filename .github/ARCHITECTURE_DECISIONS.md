# Architecture Decisions — Product Foundation v1

## ADR-001 — Preservar sistema atual

Novas funcionalidades devem reutilizar `style.css`, `calculator-simple.css`, `theme.css` e os componentes já existentes. Não criar framework visual paralelo.

## ADR-002 — Próxima decisão no shell global

A camada global já responsável por tema e metadados institucionais também monta, nas calculadoras existentes, metadados de referência e próximos passos contextuais. Isso evita cinco implementações divergentes enquanto o produto ainda possui poucas ferramentas.

Quando a arquitetura evoluir para templates/build estático, esses links devem migrar para HTML gerado estaticamente para maximizar interlinking SEO sem duplicação manual.

## ADR-003 — CLT x PJ evolui sem alterar a base fiscal

A primeira evolução do flagship preserva as fórmulas existentes e acrescenta apenas derivados da comparação: diferença média mensal, diferença percentual e presets de proposta PJ. Mudanças em premissas fiscais devem ocorrer separadamente e com validação de fontes.

## ADR-004 — Sem analytics novo nesta entrega

A especificação prevê métricas de produto, mas nenhuma coleta é adicionada até existir uma decisão explícita sobre provedor, consentimento, privacidade, CSP e eventos mínimos necessários.