import fs from 'node:fs';

const pages = new Map([
  ['index.html', 'QuantoLab'],
  ['valor-hora.html', 'Valor por hora'],
  ['preco-projeto.html', 'Preço de projeto'],
  ['meta-faturamento.html', 'Meta mensal'],
  ['comparador-profissional.html', 'CLT x PJ'],
  ['simulador.html', 'Rescisão CLT'],
  ['sobre.html', 'Sobre'],
  ['metodologia.html', 'Metodologia'],
  ['politica-de-privacidade.html', 'Política de privacidade'],
  ['termos.html', 'Termos de uso'],
]);

const esc = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

for (const [file, label] of pages) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/\n?<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->\n?/g, '\n');

  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1]?.trim();
  if (!title || !description || !canonical) throw new Error(`${file}: title, description ou canonical ausente.`);

  const schema = file === 'index.html'
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        url: 'https://quantolab.com.br/',
        name: 'QuantoLab',
        alternateName: 'Quanto Lab',
        description,
        inLanguage: 'pt-BR',
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'QuantoLab',
            item: 'https://quantolab.com.br/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: label,
            item: canonical,
          },
        ],
      };

  const block = `<!-- SEO:START -->\n<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">\n<meta name="theme-color" content="#D9FF66">\n<meta property="og:locale" content="pt_BR">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="QuantoLab">\n<meta property="og:title" content="${esc(title)}">\n<meta property="og:description" content="${esc(description)}">\n<meta property="og:url" content="${esc(canonical)}">\n<meta name="twitter:card" content="summary">\n<script type="application/ld+json">${JSON.stringify(schema)}</script>\n<!-- SEO:END -->`;

  const favicon = /<link\s+rel=["']icon["'][^>]*>\s*/i;
  if (!favicon.test(html)) throw new Error(`${file}: favicon não encontrado.`);
  html = html.replace(favicon, match => `${match}${block}\n`);
  fs.writeFileSync(file, html);
}

const urls = [
  ['https://quantolab.com.br/', 'weekly', '1.0'],
  ['https://quantolab.com.br/valor-hora', 'monthly', '0.9'],
  ['https://quantolab.com.br/preco-projeto', 'monthly', '0.9'],
  ['https://quantolab.com.br/meta-faturamento', 'monthly', '0.9'],
  ['https://quantolab.com.br/comparador-profissional', 'monthly', '0.9'],
  ['https://quantolab.com.br/simulador', 'monthly', '0.9'],
  ['https://quantolab.com.br/sobre', 'monthly', '0.5'],
  ['https://quantolab.com.br/metodologia', 'monthly', '0.7'],
  ['https://quantolab.com.br/politica-de-privacidade', 'yearly', '0.3'],
  ['https://quantolab.com.br/termos', 'yearly', '0.3'],
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([loc, freq, priority]) => `  <url><loc>${loc}</loc><lastmod>2026-08-14</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync('sitemap.xml', sitemap);

let css = fs.readFileSync('style.css', 'utf8');
if (!css.includes('.ads-ready .ad{display:block}')) {
  css = css.replace('.ad{width:100%;', '.ad{display:none;width:100%;');
  css = css.replace('/* Advertising inventory */', '/* Advertising inventory */\n/* Empty inventory stays invisible until a real ad network is activated. */\n.ads-ready .ad{display:block}');
}
fs.writeFileSync('style.css', css);

let privacy = fs.readFileSync('politica-de-privacidade.html', 'utf8');
privacy = privacy.replace(
  '<p>Os espaços marcados como “Publicidade” são apenas áreas reservadas enquanto não houver um serviço de anúncios ativo. Caso ferramentas de análise, publicidade ou cookies sejam adicionadas, esta política deverá ser atualizada antes ou junto da ativação desses recursos.</p>',
  '<p>Os espaços de publicidade permanecem ocultos enquanto não houver uma rede de anúncios ativa. Quando a monetização for ativada, o QuantoLab poderá usar o Google AdSense ou serviço equivalente.</p><p>Fornecedores terceiros, incluindo o Google, podem usar cookies ou tecnologias semelhantes para veicular e medir anúncios. O uso de cookies de publicidade pode permitir a exibição de anúncios com base em visitas anteriores a este e a outros sites. Quando exigido, mecanismos de consentimento e opções de gerenciamento de publicidade serão disponibilizados antes ou junto da ativação desses recursos.</p>'
);
fs.writeFileSync('politica-de-privacidade.html', privacy);

let qa = fs.readFileSync('scripts/qa.mjs', 'utf8');
qa = qa.replace(
  "if(/<script\\b(?![^>]*\\bsrc=)[^>]*>/i.test(html))fail(`${file}: script inline não é permitido pela CSP.`);",
  "if(/<script\\b(?![^>]*\\bsrc=)(?![^>]*\\btype=[\"']application\\/ld\\+json[\"'])[^>]*>/i.test(html))fail(`${file}: script inline executável não é permitido pela CSP.`);"
);
const marker = "const sitemap=read('sitemap.xml');";
if (!qa.includes('SEO técnico:')) {
  const seoChecks = `const indexablePages=['index.html','valor-hora.html','preco-projeto.html','meta-faturamento.html','comparador-profissional.html','simulador.html','sobre.html','metodologia.html','politica-de-privacidade.html','termos.html'];\nfor(const file of indexablePages){\n  const html=read(file);\n  for(const requirement of [\n    ['meta robots',/<meta[^>]+name=[\"']robots[\"'][^>]+content=[\"'][^\"']*index/i],\n    ['title',/<title>[^<]+<\\/title>/i],\n    ['description',/<meta[^>]+name=[\"']description[\"']/i],\n    ['canonical',/<link[^>]+rel=[\"']canonical[\"']/i],\n    ['favicon',/<link[^>]+rel=[\"']icon[\"'][^>]+href=[\"']\\/favicon\\.svg[\"']/i],\n    ['Open Graph site name',/<meta[^>]+property=[\"']og:site_name[\"'][^>]+content=[\"']QuantoLab[\"']/i],\n    ['Open Graph title',/<meta[^>]+property=[\"']og:title[\"']/i],\n    ['Open Graph description',/<meta[^>]+property=[\"']og:description[\"']/i],\n    ['Open Graph URL',/<meta[^>]+property=[\"']og:url[\"']/i],\n    ['Twitter card',/<meta[^>]+name=[\"']twitter:card[\"']/i],\n    ['JSON-LD',/<script[^>]+type=[\"']application\\/ld\\+json[\"']/i]\n  ]) if(!requirement[1].test(html)) fail(\`SEO técnico: ${file} sem ${requirement[0]}.\`);\n}\nif(!read('index.html').includes('\"@type\":\"WebSite\"'))fail('SEO técnico: home sem WebSite structured data.');\nconst contact=read('contato.html');\nif(!/<meta[^>]+name=[\"']robots[\"'][^>]+content=[\"'][^\"']*noindex/i.test(contact))fail('SEO técnico: contato deve permanecer noindex.');\nif(!css.includes('.ads-ready .ad{display:block}')||!css.includes('.ad{display:none;'))fail('Publicidade: placeholders vazios devem ficar ocultos antes da ativação da rede.');\nif(!fs.existsSync(path.join(root,'54b967966f714fbb3be34ca2b1113ef2.txt')))fail('IndexNow: arquivo de validação ausente.');\nif(!fs.existsSync(path.join(root,'.github/workflows/indexnow.yml')))fail('IndexNow: workflow de submissão ausente.');\n\n`;
  qa = qa.replace(marker, seoChecks + marker);
}
qa = qa.replace(
  "for(const m of sitemap.matchAll(/<loc>https:\\/\\/quantolab\\.com\\.br([^<]*)<\\/loc>/g))if(!routeExists(m[1]||'/'))fail(`sitemap.xml: rota inexistente ${m[1]||'/'}.`);",
  "for(const m of sitemap.matchAll(/<loc>https:\\/\\/quantolab\\.com\\.br([^<]*)<\\/loc>/g))if(!routeExists(m[1]||'/'))fail(`sitemap.xml: rota inexistente ${m[1]||'/'}.`);\nif((sitemap.match(/<lastmod>2026-08-14<\\/lastmod>/g)||[]).length<10)fail('sitemap.xml: lastmod ausente nas URLs indexáveis.');\nif(sitemap.includes('https://quantolab.com.br/contato'))fail('sitemap.xml: contato noindex não deve constar no sitemap.');"
);
fs.writeFileSync('scripts/qa.mjs', qa);

console.log('SEO técnico de lançamento aplicado.');
