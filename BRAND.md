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
- `favicon.svg` — favicon oficial em formato de ícone; recebe versionamento de URL em runtime para evitar cache persistente.

## Hierarquia de uso

1. **Header desktop e tablet:** usar o wordmark oficial completo.
2. **Header mobile e contextos compactos:** usar o símbolo isolado quando o wordmark comprometer espaço ou leitura.
3. **Footer e superfícies institucionais:** usar o wordmark oficial completo de forma discreta.
4. **Favicon, app icon e avatar:** usar a versão de ícone, nunca o wordmark horizontal.
5. **Dados, resultados e ferramentas:** a marca deve recuar; o conteúdo e a decisão do usuário permanecem protagonistas.

## Favicon

O HTML mantém um único favicon funcional. `theme.js` normaliza qualquer declaração legada para uma única referência a `/favicon.svg` com query de versão. Isso evita duas fontes concorrentes e força atualização do asset quando houver mudança de identidade.

## Regras de aplicação

- Lime oficial: `#D9FF66`.
- Não reconstruir o wordmark com tipografia do sistema.
- Não separar, redesenhar, inclinar ou alterar a proporção do wordmark oficial.
- Não usar o símbolo isolado por padrão quando houver espaço adequado para o wordmark.
- Não aplicar glow, gradientes decorativos ou efeitos que contrariem o conceito Digital Instrument System.
- Preservar área de respiro suficiente ao redor da assinatura.

## Relação com o sistema visual

A identidade deve reforçar `QuantoLab — Digital Instrument System`: precisão, leitura técnica, clareza editorial e assinatura lime controlada. O wordmark identifica a marca; o símbolo resolve compactação; nenhum dos dois deve competir com a tarefa principal do produto.
