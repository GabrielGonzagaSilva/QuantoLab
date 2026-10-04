# QuantoLab V1 · launch runbook

## Release gate

A V1 só deve ir para `main` quando todos estes checks estiverem verdes:

- QuantoLab QA;
- Responsive QA;
- CodeQL Security;
- Sprint 6 launch readiness;
- preview Vercel em estado `READY`;
- smoke visual do Home, Ferramentas, Salário Líquido, CLT x PJ, Rescisão e Meus números.

## Observabilidade

### Eventos de produto

A camada `window.QuantoLabAnalytics` permanece como contrato único de produto. A Sprint 6 encaminha eventos elegíveis para Vercel Web Analytics somente quando:

1. o site está em `quantolab.com.br`, `www.quantolab.com.br` ou um domínio `*.vercel.app`;
2. o usuário aceitou os Termos de uso;
3. Web Analytics está habilitado no projeto Vercel.

Eventos instrumentados:

- `ql_terms_accepted`;
- `ql_profile_saved` / `ql_profile_cleared`;
- `ql_catalog_filter`;
- `ql_catalog_search` — envia apenas quantidade de resultados e contexto, nunca o texto pesquisado;
- `ql_decision_shortcut_opened`;
- `ql_tool_opened`;
- `ql_calculator_run` — envia somente identificador da ferramenta e ação, nunca valores do formulário;
- `ql_next_decision_opened`;
- `ql_saved_reference_manage`;
- `ql_mobile_menu_opened`;
- `ql_client_error` — envia somente a origem genérica (`window` ou `promise`), sem mensagem/stack.

O hook `beforeSend` remove query string e fragmento da URL antes do envio.

### Performance

O runtime está preparado para Vercel Speed Insights pelo endpoint first-party `/_vercel/speed-insights/script.js`, carregado pelo mesmo gate de aceite.

### Ativação no projeto Vercel

No momento em que a V1 for promovida, habilitar no projeto `quantolab`:

```bash
vercel project web-analytics quantolab --format json
vercel project speed-insights quantolab --format json
```

Depois, validar pageviews/eventos apenas em produção. O código já está preparado e não requer alteração adicional para começar a coletar quando os recursos estiverem habilitados.

## Privacidade

- valores digitados nas calculadoras permanecem fora da telemetria;
- referências de `Meus números` permanecem locais;
- texto de busca do catálogo não é enviado;
- query string e hash são removidos da URL observada;
- a Política de privacidade deve permanecer coerente com qualquer mudança futura de provedor ou escopo de dados.

## Synthetic traffic

O workflow histórico de tráfego sintético não possui mais cron. Ele só pode ser executado manualmente por `workflow_dispatch`, evitando ruído artificial em analytics e desperdício de CI após o lançamento.

## Monitoramento pós-lançamento

Nas primeiras 24 horas:

- confirmar disponibilidade das rotas principais;
- conferir Runtime Errors no Vercel;
- verificar 4xx/5xx inesperados nos logs;
- conferir Web Analytics por rota/dispositivo;
- conferir Speed Insights e regressões de Core Web Vitals;
- observar `ql_client_error` e os principais funis de ferramenta.

Depois, revisar semanalmente:

- páginas mais acessadas;
- ferramentas mais abertas e calculadas;
- filtros/atalhos mais usados;
- próximas decisões mais acionadas;
- erros de cliente;
- evolução de performance.

## Rollback

Se houver regressão crítica após promoção:

1. reverter o merge da Sprint 6 ou usar rollback do deployment estável anterior na Vercel;
2. confirmar que `quantolab.com.br` voltou a responder com o deployment anterior;
3. validar Home + uma calculadora crítica em desktop e mobile;
4. abrir correção em branch separada e repetir todos os release gates antes de nova promoção.
