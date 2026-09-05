# QuantoLab — Brand Identity

## Marca oficial

A assinatura principal do QuantoLab é o **wordmark completo oficial** fornecido para o projeto. Ele deve ser usado em contextos em que há espaço suficiente para identificação plena da marca, especialmente navegação desktop e superfícies institucionais.

O símbolo isolado é um **asset compacto**, não a assinatura principal. Seu uso é reservado a situações em que o espaço, o formato ou a legibilidade tornam o wordmark completo inadequado.

## Arquivos oficiais

- `quantolab-logo.svg` — wordmark oficial preto, usado como assinatura principal.
- `brand/mark-black.svg` — símbolo isolado preto para superfícies claras e contextos compactos.
- `brand/mark-white.svg` — símbolo isolado branco para superfícies escuras e contextos compactos.
- `brand/icon-lime.svg` — ícone contido lime `#D9FF66` com símbolo preto.
- `brand/icon-black.svg` — ícone contido preto com símbolo branco.
- `favicon-20260905.svg` — favicon oficial ativo, com pathname próprio para invalidar caches antigos.
- `favicon.svg` — fallback legado mantido por compatibilidade e pelo contrato de SEO existente.

## Hierarquia de uso

1. **Header desktop e tablet:** usar o wordmark oficial completo.
2. **Header mobile e contextos compactos:** usar o símbolo isolado quando o wordmark comprometer espaço ou leitura.
3. **Footer e superfícies institucionais:** usar o wordmark oficial completo de forma discreta.
4. **Favicon, app icon e avatar:** usar a versão de ícone, nunca o wordmark horizontal.
5. **Dados, resultados e ferramentas:** a marca deve recuar; o conteúdo e a decisão do usuário permanecem protagonistas.

## Favicon

O HTML conserva `/favicon.svg` como fallback estável. Durante o carregamento, `theme.js` remove declarações concorrentes e normaliza o navegador para uma única referência a `/favicon-20260905.svg`. O pathname novo é intencional: favicons podem permanecer em cache mesmo quando o conteúdo do arquivo original muda.

## Regras de aplicação

- Lime oficial: `#D9FF66`.
- Não reconstruir o wordmark com tipografia do sistema.
- Não separar, redesenhar, inclinar ou alterar a proporção do wordmark oficial.
- Não usar o símbolo isolado por padrão quando houver espaço adequado para o wordmark.
- Não aplicar glow, gradientes decorativos ou efeitos que contrariem o conceito Digital Instrument System.
- Preservar área de respiro suficiente ao redor da assinatura.

## Relação com o sistema visual

A identidade deve reforçar `QuantoLab — Digital Instrument System`: precisão, leitura técnica, clareza editorial e assinatura lime controlada. O wordmark identifica a marca; o símbolo resolve compactação; nenhum dos dois deve competir com a tarefa principal do produto.
