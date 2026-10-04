# Sprint 6 · implementation record

Branch: `sprint-6-polish-observability`
Base: `sprint-5-handoff-qa`

## Implementado

- polish de interação com motion curto, hover restrito a ponteiro fino e `prefers-reduced-motion`;
- camada de observabilidade de produto integrada ao contrato `QuantoLabAnalytics`;
- preparação para Vercel Web Analytics e Speed Insights com carregamento first-party e gate após aceite dos Termos;
- redaction de query string/hash e allowlist de propriedades de evento;
- eventos sem valores financeiros e sem texto pesquisado;
- atualização da Política de privacidade;
- CSP alinhada ao endpoint de Speed Insights;
- tráfego sintético recorrente aposentado e mantido apenas como ferramenta manual;
- runbook de lançamento, monitoramento e rollback;
- release gate estático e QA Playwright específico da Sprint 6.

## Estado de release

A implementação pode ser validada em preview sem alterar produção. A promoção para `main` permanece uma ação separada.

A ativação de Web Analytics/Speed Insights no nível do projeto Vercel também é um gate de lançamento: o código está preparado, mas o recurso deve ser habilitado na conta/projeto antes da coleta em produção.
