from pathlib import Path
import re


def ad(slot, variant='leaderboard', priority='standard'):
    return (
        f'<aside class="ad ad--{variant}" aria-label="Publicidade" data-ad-slot="{slot}" data-ad-priority="{priority}">'
        '<span class="ad-label">Publicidade</span>'
        '<div class="ad-box"><span class="ad-placeholder">Espaço publicitário</span></div>'
        '</aside>'
    )


old_ad = '<section class="ad"><span class="ad-label">Publicidade</span><div class="ad-box">Espaço preparado para anúncio responsivo</div></section>'

# Home: dois pontos de alta visibilidade, sem interromper navegação ou ação.
p = Path('index.html')
html = p.read_text()
if html.count(old_ad) != 1:
    raise SystemExit('index.html: placeholder original não encontrado como esperado')
html = html.replace(old_ad, ad('home-top', 'leaderboard', 'high'), 1)
marker = '</div></div></section>\n<section class="section"><div class="shell card-grid">'
if marker not in html:
    raise SystemExit('index.html: fim da grade de ferramentas não encontrado')
html = html.replace(
    marker,
    '</div></div></section>\n<div class="shell">' + ad('home-after-tools', 'content', 'high') + '</div>\n<section class="section"><div class="shell card-grid">',
    1,
)
p.write_text(html)

# Calculadoras: um anúncio antes da ferramenta e outro depois da tarefa principal.
for filename in ['valor-hora.html', 'preco-projeto.html', 'meta-faturamento.html', 'comparador-profissional.html', 'simulador.html']:
    p = Path(filename)
    html = p.read_text().replace(old_ad, '')
    stem = p.stem
    calc = re.search(r'<section(?:\s+id="calc")?\s+class="calc-grid">', html)
    if not calc:
        raise SystemExit(f'{filename}: bloco principal da calculadora não encontrado')
    html = html[:calc.start()] + ad(f'{stem}-top', 'leaderboard', 'high') + '\n' + html[calc.start():]
    html, n = re.subn(
        r'</section>\s*<article class="article">',
        '</section>\n' + ad(f'{stem}-after-tool', 'content', 'high') + '\n<article class="article">',
        html,
        count=1,
    )
    if n != 1:
        raise SystemExit(f'{filename}: transição calculadora → explicação não encontrada')
    p.write_text(html)

# Metodologia: conteúdo longo comporta dois slots sem cortar parágrafos.
p = Path('metodologia.html')
html = p.read_text()
html, n = re.subn(
    r'</section>\s*<article class="article">',
    '</section>\n' + ad('metodologia-top', 'leaderboard') + '\n<article class="article">',
    html,
    count=1,
)
if n != 1:
    raise SystemExit('metodologia.html: início do artigo não encontrado')
html, n = re.subn(
    r'</article>\s*</div></main>',
    '</article>\n' + ad('metodologia-bottom', 'content') + '\n</div></main>',
    html,
    count=1,
)
if n != 1:
    raise SystemExit('metodologia.html: fim do artigo não encontrado')
p.write_text(html)

# Institucionais e legais: somente depois do conteúdo.
for filename, slot in [
    ('sobre.html', 'sobre-bottom'),
    ('politica-de-privacidade.html', 'privacidade-bottom'),
    ('termos.html', 'termos-bottom'),
]:
    p = Path(filename)
    html = p.read_text()
    html, n = re.subn(
        r'</article>\s*</div></main>',
        '</article>\n' + ad(slot, 'footer', 'low') + '\n</div></main>',
        html,
        count=1,
    )
    if n != 1:
        raise SystemExit(f'{filename}: fim do conteúdo não encontrado')
    p.write_text(html)

# Contato é noindex e de baixo conteúdo: monetização deliberadamente desabilitada.
p = Path('contato.html')
html = p.read_text()
if 'data-ad-slot=' in html:
    raise SystemExit('contato.html: inventário publicitário inesperado')
if 'Sem publicidade enquanto esta página' not in html:
    html = html.replace(
        '<main><div class="shell">',
        '<main><div class="shell"><!-- Sem publicidade enquanto esta página for noindex e tiver conteúdo mínimo. -->',
        1,
    )
p.write_text(html)

# CSS responsivo com espaço reservado para reduzir layout shift.
cssp = Path('style.css')
css = cssp.read_text()
advertising = '''/* Advertising inventory */
.ad{width:100%;margin:clamp(24px,4vw,42px) 0;clear:both}
.ad-label{display:block;margin-bottom:8px;text-align:center;text-transform:uppercase;letter-spacing:.14em;font-size:9px;font-weight:650;color:#98989d;user-select:none}
.ad-box{width:100%;max-width:970px;margin-inline:auto;display:grid;place-items:center;overflow:hidden;border:1px dashed rgba(0,0,0,.12);border-radius:var(--radius-md);background:rgba(255,255,255,.48);color:#8c8c92;text-align:center}
.ad-placeholder{padding:12px;font-size:11px;line-height:1.35;letter-spacing:.01em}
.ad--leaderboard .ad-box{min-height:90px}
.ad--content .ad-box{min-height:clamp(140px,16vw,180px)}
.ad--footer .ad-box{min-height:90px;max-width:860px}

@media (max-width:760px){
  .ad{margin:22px 0 30px}
  .ad--leaderboard .ad-box{min-height:100px}
  .ad--content .ad-box{min-height:250px}
  .ad--footer .ad-box{min-height:100px}
}

@media (max-width:380px){
  .ad{margin:18px 0 26px}
  .ad-box{border-radius:13px}
  .ad-placeholder{font-size:10px}
}
'''
css, n = re.subn(
    r'/\* Advertising \*/.*?/\* Calculator pages \*/',
    advertising + '\n/* Calculator pages */',
    css,
    count=1,
    flags=re.S,
)
if n != 1:
    raise SystemExit('style.css: bloco de publicidade antigo não encontrado')
cssp.write_text(css)

# QA permanente: densidade, unicidade, acessibilidade e exceção de contato.
qap = Path('scripts/qa.mjs')
qa = qap.read_text()
anchor = "if(!css.includes('.btn-secondary'))fail('style.css: falta estilo do botão secundário.');"
if anchor not in qa:
    raise SystemExit('qa.mjs: âncora não encontrada')
checks = r'''
if(!css.includes('.ad--leaderboard')||!css.includes('.ad--content')||!css.includes('.ad--footer'))fail('style.css: sistema responsivo de publicidade incompleto.');
const adMinimums=new Map([['index.html',2],['valor-hora.html',2],['preco-projeto.html',2],['meta-faturamento.html',2],['comparador-profissional.html',2],['simulador.html',2],['metodologia.html',2],['sobre.html',1],['politica-de-privacidade.html',1],['termos.html',1]]);
const adSlots=new Set();
for(const [file,minimum] of adMinimums){
  const html=read(file);
  const slots=[...html.matchAll(/\bdata-ad-slot=["']([^"']+)["']/g)].map(m=>m[1]);
  if(slots.length<minimum)fail(`${file}: inventário publicitário abaixo do planejado (${slots.length}/${minimum}).`);
  if(!/<aside class=["'][^"']*\bad\b[^"']*["'][^>]+aria-label=["']Publicidade["']/i.test(html))fail(`${file}: espaço publicitário sem identificação acessível.`);
  for(const slot of slots){if(adSlots.has(slot))fail(`Publicidade: data-ad-slot duplicado "${slot}".`);adSlots.add(slot);}
}
if(read('contato.html').includes('data-ad-slot='))fail('contato.html: página noindex/baixo conteúdo não deve exibir publicidade.');
'''
qa = qa.replace(anchor, anchor + checks, 1)
qap.write_text(qa)
