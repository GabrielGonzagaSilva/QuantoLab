# QuantoLab — contrato de eventos de produto

A camada `window.QuantoLabAnalytics` registra eventos de produto e os envia para o endpoint first-party `POST /api/analytics/event`. O endpoint roda server-side em Cloudflare Workers e grava somente dimensões permitidas no dataset `quantolab_product_events` do Workers Analytics Engine.

A emissão local por `CustomEvent('quantolab:event')` é preservada para desacoplamento interno. Se uma `dataLayer` já existir, ela recebe somente as propriedades aprovadas pelo contrato.

## Eventos

- `page_view`: carregamento de página.
- `terms_accepted`: aceite da versão vigente dos termos.
- `tool_opened`: ferramenta/calculadora aberta.
- `calculation_started`: cálculo válido solicitado pelo usuário.
- `calculation_completed`: resultado calculado com sucesso.
- `result_shared`: compartilhamento nativo concluído ou cópia de link concluída.
- `journey_continued`: clique em uma próxima decisão que leva a outra ferramenta.
- `profile_saved`: referências opcionais salvas localmente.
- `profile_cleared`: referências locais removidas.
- `ad_script_loaded`: confirmação técnica de carregamento de publicidade, sem dados das calculadoras.

## Propriedades permitidas no cliente

- `path`, incluído automaticamente pela camada global;
- `tool`;
- `method`;
- `from_tool`;
- `to_tool`;
- `version`;
- `provider`.

Qualquer propriedade fora dessa allowlist é descartada no navegador e novamente no Worker.

## Dimensões derivadas server-side

Sem persistir os valores brutos que as originam, o Worker pode registrar:

- país e região agregados fornecidos pela infraestrutura Cloudflare;
- classe de dispositivo: `mobile`, `desktop` ou `tablet`;
- família de navegador;
- família de sistema operacional.

A origem de navegação enviada pelo navegador é reduzida apenas ao hostname de `document.referrer`.

## Dados proibidos

Nunca enviar ou persistir no dataset de produto:

- salários, renda, custos, impostos, valores de projetos ou resultados calculados;
- conteúdo de inputs das calculadoras;
- endereço IP completo;
- User-Agent completo;
- cookies ou identificadores persistentes de visitante;
- fingerprint;
- query strings;
- fragments/hash de URLs;
- e-mail, telefone, nome ou outros dados pessoais desnecessários.

## Tráfego sintético

O monitoramento sintético da QuantoLab usa o header `X-QuantoLab-Synthetic-Test`. O coletor descarta essas requisições antes de qualquer gravação. Métricas de produto e pageviews do dataset não devem incluir esse tráfego.

## Semântica das métricas

- `calculation_started` é emitido somente depois que os campos mínimos passam pela validação local.
- cálculos automáticos usados apenas para preencher o estado inicial de páginas legadas não geram eventos de início/conclusão;
- `result_shared` só conta quando a ação nativa ou a cópia para clipboard é concluída;
- `journey_continued` mede apenas links de “Próxima decisão”.

## Regra de ausência de dados

Ausência de uma métrica nunca deve ser convertida em zero ou estimativa. Integrações consumidoras devem usar `null` e exibir “Dados ainda não disponíveis” quando a fonte não suportar ou não retornar a métrica.
