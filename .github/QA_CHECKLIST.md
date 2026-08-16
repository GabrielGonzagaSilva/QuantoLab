# QuantoLab — Checklist de não regressão

Usar antes de publicar qualquer evolução relevante.

## Produto
- a resposta principal continua imediata;
- a nova funcionalidade ajuda uma decisão real;
- complexidade avançada permanece progressiva;
- próximas ferramentas são contextuais, não aleatórias.

## Visual
- componentes existentes foram reutilizados primeiro;
- tipografia, cores, raios, sombras e espaçamentos seguem os tokens atuais;
- tema claro e escuro permanecem consistentes;
- nenhuma calculadora parece um microsite separado.

## UX e acessibilidade
- labels associados;
- ajuda contextual clara;
- teclado e foco visível;
- controles de toque adequados;
- não depender apenas de cor;
- resultado dinâmico compreensível;
- 320, 360, 375, 390, 430, 768, 1024, 1280 e 1440 px verificados;
- `prefers-reduced-motion` preservado.

## Cálculo
- fórmula existente preservada quando a mudança não exige alteração;
- cenários de referência continuam passando;
- campos opcionais não adicionam valores escondidos;
- estimativas e hipóteses ficam explícitas;
- fontes/ano de referência aparecem quando aplicável.

## SEO e performance
- canonical preservado ou migrado com redirect seguro;
- title/description continuam únicos;
- sitemap e robots não regrediram;
- ferramenta permanece acima do conteúdo de apoio;
- nenhum recurso externo novo sem revisão de CSP/performance.

## Privacidade e monetização
- sem coleta nova sem necessidade clara;
- simulações continuam locais quando possível;
- publicidade não entra entre input, ação e resultado;
- parceiros nunca alteram fórmula, ranking ou interpretação.