# QuantoLab → Gabriel Ops — integração de Analytics

## Arquitetura

O Gabriel Ops não deve consumir métricas por um endpoint público dentro da QuantoLab. A leitura recomendada é feita pelo backend do Gabriel Ops diretamente na API SQL do Cloudflare Workers Analytics Engine, usando credenciais server-side com o menor escopo possível.

Fluxo:

`QuantoLab browser → POST /api/analytics/event → Cloudflare Worker → Analytics Engine → Gabriel Ops backend → dashboard`

Dataset: `quantolab_product_events`

O navegador nunca recebe Account ID secreto, API Token ou credencial administrativa.

## Schema do dataset

O Worker grava um ponto por evento usando as colunas genéricas do Analytics Engine:

| Coluna | Significado |
|---|---|
| `index1` | projeto, sempre `quantolab` |
| `blob1` | evento |
| `blob2` | path sem query/hash |
| `blob3` | ferramenta |
| `blob4` | hostname do referrer |
| `blob5` | país |
| `blob6` | região agregada |
| `blob7` | dispositivo |
| `blob8` | navegador |
| `blob9` | sistema operacional |
| `blob10` | método, quando aplicável |
| `blob11` | ferramenta de origem |
| `blob12` | ferramenta de destino |
| `blob13` | versão associada ao evento, quando aplicável |
| `blob14` | versão do schema de analytics |
| `double1` | contador unitário |

Não existem colunas de visitor ID, session ID, IP completo ou valores financeiros.

## Autenticação de leitura

O backend do Gabriel Ops deve usar um Cloudflare API Token restrito à leitura de Analytics da conta. Guardar o token como secret no ambiente server-side.

Endpoint de consulta:

`POST https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/analytics_engine/sql`

Nunca colocar `<ACCOUNT_ID>` ou token administrativo no JavaScript público da QuantoLab.

## Regra de contagem

Workers Analytics Engine pode aplicar amostragem em volume elevado. Por isso, agregações devem usar `SUM(_sample_interval)` e não `COUNT()`.

### Pageviews nas últimas 24h

```sql
SELECT SUM(_sample_interval) AS pageviews
FROM quantolab_product_events
WHERE index1 = 'quantolab'
  AND blob1 = 'page_view'
  AND timestamp > NOW() - INTERVAL '24' HOUR
```

### Pageviews em 7 dias

```sql
SELECT SUM(_sample_interval) AS pageviews
FROM quantolab_product_events
WHERE index1 = 'quantolab'
  AND blob1 = 'page_view'
  AND timestamp > NOW() - INTERVAL '7' DAY
```

### Pageviews em 30 dias

```sql
SELECT SUM(_sample_interval) AS pageviews
FROM quantolab_product_events
WHERE index1 = 'quantolab'
  AND blob1 = 'page_view'
  AND timestamp > NOW() - INTERVAL '30' DAY
```

Para “hoje”, o backend do Gabriel Ops deve calcular o início do dia em `America/Sao_Paulo`, converter o limite para UTC e montar a consulta com esse instante. Não usar “últimas 24h” como substituto de “hoje”.

### Páginas mais acessadas

```sql
SELECT blob2 AS path, SUM(_sample_interval) AS pageviews
FROM quantolab_product_events
WHERE index1 = 'quantolab'
  AND blob1 = 'page_view'
  AND timestamp > NOW() - INTERVAL '7' DAY
GROUP BY blob2
ORDER BY pageviews DESC
LIMIT 20
```

### Dispositivos

```sql
SELECT blob7 AS device, SUM(_sample_interval) AS pageviews
FROM quantolab_product_events
WHERE index1 = 'quantolab'
  AND blob1 = 'page_view'
  AND timestamp > NOW() - INTERVAL '7' DAY
GROUP BY blob7
ORDER BY pageviews DESC
```

O mesmo padrão vale para navegador (`blob8`), sistema operacional (`blob9`), país (`blob5`) e região (`blob6`).

### Referrers externos

```sql
SELECT blob4 AS referrer, SUM(_sample_interval) AS pageviews
FROM quantolab_product_events
WHERE index1 = 'quantolab'
  AND blob1 = 'page_view'
  AND blob4 != ''
  AND blob4 != 'quantolab.com.br'
  AND blob4 != 'www.quantolab.com.br'
  AND timestamp > NOW() - INTERVAL '7' DAY
GROUP BY blob4
ORDER BY pageviews DESC
LIMIT 20
```

### Ferramentas mais abertas

```sql
SELECT blob3 AS tool, SUM(_sample_interval) AS opens
FROM quantolab_product_events
WHERE index1 = 'quantolab'
  AND blob1 = 'tool_opened'
  AND timestamp > NOW() - INTERVAL '30' DAY
GROUP BY blob3
ORDER BY opens DESC
```

### Funil por ferramenta

```sql
SELECT blob3 AS tool, blob1 AS event, SUM(_sample_interval) AS total
FROM quantolab_product_events
WHERE index1 = 'quantolab'
  AND blob1 IN ('tool_opened','calculation_started','calculation_completed','result_shared')
  AND timestamp > NOW() - INTERVAL '30' DAY
GROUP BY blob3, blob1
ORDER BY blob3, blob1
```

O Gabriel Ops deve derivar a taxa de conclusão como:

`calculation_completed / calculation_started`

Se `calculation_started` for zero ou estiver ausente, a taxa deve ser `null`, não `0%`.

### Continuidade entre ferramentas

```sql
SELECT blob11 AS from_tool, blob12 AS to_tool, SUM(_sample_interval) AS transitions
FROM quantolab_product_events
WHERE index1 = 'quantolab'
  AND blob1 = 'journey_continued'
  AND timestamp > NOW() - INTERVAL '30' DAY
GROUP BY blob11, blob12
ORDER BY transitions DESC
```

## Métricas que devem permanecer indisponíveis inicialmente

A arquitetura não cria identificadores persistentes de visitantes. Portanto, até existir uma metodologia de privacidade aprovada, o Gabriel Ops deve retornar:

```json
{
  "unique_visitors": null,
  "active_visitors": null,
  "returning_visitors": null
}
```

Exibir “Dados ainda não disponíveis”. Não inferir essas métricas a partir de pageviews.

## Shape recomendado no Gabriel Ops

O backend do Gabriel Ops pode normalizar as consultas para um objeto como:

```json
{
  "project": "quantolab",
  "generated_at": "<timestamp real do backend>",
  "traffic": {
    "pageviews_today": null,
    "pageviews_24h": null,
    "pageviews_7d": null,
    "pageviews_30d": null,
    "unique_visitors": null,
    "active_visitors": null,
    "returning_visitors": null
  },
  "devices": {},
  "top_pages": [],
  "referrers": [],
  "product_events": {}
}
```

Os `null` acima representam apenas o contrato de ausência de dados. O backend deve substituir cada campo somente por valores efetivamente retornados pela fonte.

## Tráfego sintético

O endpoint `/api/analytics/event` descarta toda requisição marcada com `X-QuantoLab-Synthetic-Test`. Portanto, o dataset de produto é a fonte preferencial para pageviews do dashboard operacional da QuantoLab.

Métricas HTTP brutas da zona Cloudflare podem conter monitoramento sintético e não devem ser apresentadas como “visitantes reais” sem uma estratégia adicional de exclusão.
