# QuantoLab — contrato de eventos de produto

A camada `window.QuantoLabAnalytics` registra intenção de medição sem instalar um provedor externo por padrão. Cada evento é emitido como `CustomEvent('quantolab:event')`; se uma `dataLayer` já existir, também recebe o evento.

## Eventos
- `page_view`: carregamento de página.
- `terms_accepted`: aceite da versão vigente dos termos.
- `tool_opened`: ferramenta dinâmica aberta.
- `calculation_started`: cálculo solicitado.
- `calculation_completed`: resultado calculado.
- `result_shared`: compartilhamento nativo ou cópia de link.
- `profile_saved`: referências opcionais salvas localmente.
- `profile_cleared`: referências locais removidas.

## Regras
- não enviar salários, valores de projetos ou conteúdo dos campos como propriedades de analytics;
- não ativar provedor externo sem revisar privacidade, CSP, consentimento aplicável e política de retenção;
- medir o funil `visita → uso → cálculo → próxima ferramenta → retorno` sem transformar dados financeiros digitados em identificadores.
