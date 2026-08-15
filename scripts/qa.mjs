import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const failures=[];
const fail=m=>failures.push(m);
const files=fs.readdirSync(root,{withFileTypes:true});
const htmlFiles=files.filter(f=>f.isFile()&&f.name.endsWith('.html')).map(f=>f.name);
const jsFiles=files.filter(f=>f.isFile()&&f.name.endsWith('.js')).map(f=>f.name);
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

function routeExists(href){
  if(!href||href.startsWith('#')||/^(https?:|mailto:|tel:)/i.test(href))return true;
  const clean=href.split('#')[0].split('?')[0];
  if(!clean||clean==='/')return fs.existsSync(path.join(root,'index.html'));
  const rel=clean.replace(/^\//,'');
  if(rel.endsWith('.html')||rel.endsWith('.js')||rel.endsWith('.css')||rel.endsWith('.xml')||rel.endsWith('.txt'))return fs.existsSync(path.join(root,rel));
  return fs.existsSync(path.join(root,rel))||fs.existsSync(path.join(root,`${rel}.html`))||fs.existsSync(path.join(root,rel,'index.html'));
}

for(const file of htmlFiles){
  const html=read(file);
  const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
  const unique=new Set(ids);
  if(ids.length!==unique.size)fail(`${file}: possui ID duplicado.`);
  if(!/<html[^>]+lang=["']pt-BR["']/i.test(html))fail(`${file}: falta lang="pt-BR".`);
  if(!/<meta[^>]+name=["']viewport["']/i.test(html))fail(`${file}: falta meta viewport.`);
  if((html.match(/<h1\b/gi)||[]).length!==1)fail(`${file}: deve ter exatamente um h1.`);
  if(/<script\b(?![^>]*\bsrc=)(?![^>]*\btype=["']application\/ld\+json["'])[^>]*>/i.test(html))fail(`${file}: script inline executável não é permitido pela CSP.`);
  if(/\son[a-z]+\s*=/i.test(html))fail(`${file}: handler JavaScript inline encontrado.`);
  if(/(?:href|src)=["']http:\/\//i.test(html))fail(`${file}: recurso HTTP inseguro encontrado.`);
  if(/<script[^>]+src=["']https?:\/\//i.test(html))fail(`${file}: script externo exige revisão de segurança e CSP.`);
  if(!html.includes('<script src="/theme.js"></script>'))fail(`${file}: controle global de tema ausente.`);
  if(!html.includes('<link rel="stylesheet" href="/theme.css">'))fail(`${file}: estilos globais de tema ausentes.`);
  for(const m of html.matchAll(/<label[^>]+for=["']([^"']+)["']/gi))if(!unique.has(m[1]))fail(`${file}: label aponta para ID inexistente "${m[1]}".`);
  for(const m of html.matchAll(/<(?:a|link|script)[^>]+(?:href|src)=["']([^"']+)["']/gi))if(!routeExists(m[1]))fail(`${file}: referência local inexistente "${m[1]}".`);
  for(const m of html.matchAll(/<script[^>]+src=["']\/([^"']+\.js)["']/gi)){
    const script=m[1];
    if(!fs.existsSync(path.join(root,script))){fail(`${file}: script ${script} não existe.`);continue;}
    const js=read(script);
    const referenced=new Set([
      ...[...js.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(x=>x[1]),
      ...[...js.matchAll(/\$\(["']([^"']+)["']\)/g)].map(x=>x[1])
    ]);
    for(const id of referenced)if(!unique.has(id))fail(`${file} ↔ ${script}: JS procura ID inexistente "${id}".`);
  }
}

const browserSecurityPatterns=[
  [/\beval\s*\(/,'eval()'],
  [/\bnew\s+Function\s*\(/,'new Function()'],
  [/\.(?:innerHTML|outerHTML)\s*=/,'HTML dinâmico por innerHTML/outerHTML'],
  [/\binsertAdjacentHTML\s*\(/,'insertAdjacentHTML()'],
  [/\bdocument\.write\s*\(/,'document.write()'],
  [/\bsessionStorage\b/,'sessionStorage'],
  [/\bdocument\.cookie\b/,'document.cookie'],
  [/\bfetch\s*\(/,'fetch()'],
  [/\bXMLHttpRequest\b/,'XMLHttpRequest'],
  [/\bWebSocket\b/,'WebSocket'],
  [/\bnavigator\.sendBeacon\b/,'sendBeacon()']
];
for(const file of jsFiles){
  const js=read(file);
  if(/(?:api[_-]?key|secret|password|bearer\s+[A-Za-z0-9._-]+)/i.test(js))fail(`${file}: possível segredo no JavaScript público.`);
  if(/\blocalStorage\b/.test(js)&&file!=='theme.js')fail(`${file}: localStorage só é permitido para a preferência de tema revisada.`);
  for(const [pattern,label] of browserSecurityPatterns)if(pattern.test(js))fail(`${file}: ${label} altera a superfície de segurança/privacidade e exige revisão explícita.`);
}

if(!fs.existsSync(path.join(root,'theme.js')))fail('Tema: theme.js ausente.');
else {
  const themeJs=read('theme.js');
  if(!themeJs.includes('quantolab-theme'))fail('Tema: chave local de preferência não está explícita.');
  if(!themeJs.includes("['system','light','dark']"))fail('Tema: estados sistema, claro e escuro incompletos.');
}
if(!fs.existsSync(path.join(root,'theme.css')))fail('Tema: theme.css ausente.');
else {
  const themeCss=read('theme.css');
  let themeBalance=0;for(const ch of themeCss){if(ch==='{')themeBalance++;if(ch==='}')themeBalance--;if(themeBalance<0)break;}
  if(themeBalance!==0)fail('theme.css: chaves desbalanceadas.');
  if(!themeCss.includes('.theme-toggle'))fail('Tema: estilo do controle ausente.');
  if(!themeCss.includes('[data-resolved-theme="dark"]'))fail('Tema: paleta escura ausente.');
}

const css=read('style.css');
let balance=0;for(const ch of css){if(ch==='{')balance++;if(ch==='}')balance--;if(balance<0)break;}
if(balance!==0)fail('style.css: chaves desbalanceadas.');
if(!css.includes('@media (max-width:380px)'))fail('style.css: falta proteção para telas muito estreitas.');
if(!css.includes(':focus-visible'))fail('style.css: falta estado de foco acessível.');
if(!css.includes('.btn-secondary'))fail('style.css: falta estilo do botão secundário.');
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

const headers=read('_headers');
for(const required of ['Content-Security-Policy','Strict-Transport-Security','X-Content-Type-Options','X-Frame-Options','Permissions-Policy'])if(!headers.includes(required))fail(`_headers: falta ${required}.`);
for(const directive of ["script-src 'self'","connect-src 'self'","object-src 'none'","frame-ancestors 'none'"])if(!headers.includes(directive))fail(`_headers: CSP precisa manter ${directive}.`);

if(!fs.existsSync(path.join(root,'.gitignore')))fail('.gitignore: proteção contra commit acidental de segredos ausente.');
else {
  const gitignore=read('.gitignore');
  for(const entry of ['.env','.dev.vars','*.pem','*.key','.wrangler/'])if(!gitignore.includes(entry))fail(`.gitignore: falta proteger ${entry}.`);
}
if(!fs.existsSync(path.join(root,'.assetsignore')))fail('.assetsignore: lista de exclusão do bundle estático ausente.');
else {
  const assetsignore=read('.assetsignore');
  for(const entry of ['.github/','scripts/','UX_WRITING.md','.env','.dev.vars','.wrangler/'])if(!assetsignore.includes(entry))fail(`.assetsignore: falta excluir ${entry} do bundle público.`);
}

const indexablePages=['index.html','valor-hora.html','preco-projeto.html','meta-faturamento.html','comparador-profissional.html','simulador.html','sobre.html','metodologia.html','politica-de-privacidade.html','termos.html'];
for(const file of indexablePages){
  const html=read(file);
  for(const requirement of [
    ['meta robots',/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*index/i],
    ['title',/<title>[^<]+<\/title>/i],
    ['description',/<meta[^>]+name=["']description["']/i],
    ['canonical',/<link[^>]+rel=["']canonical["']/i],
    ['favicon',/<link[^>]+rel=["']icon["'][^>]+href=["']\/favicon\.svg["']/i],
    ['Open Graph site name',/<meta[^>]+property=["']og:site_name["'][^>]+content=["']QuantoLab["']/i],
    ['Open Graph title',/<meta[^>]+property=["']og:title["']/i],
    ['Open Graph description',/<meta[^>]+property=["']og:description["']/i],
    ['Open Graph URL',/<meta[^>]+property=["']og:url["']/i],
    ['Twitter card',/<meta[^>]+name=["']twitter:card["']/i],
    ['JSON-LD',/<script[^>]+type=["']application\/ld\+json["']/i]
  ]) if(!requirement[1].test(html)) fail('SEO técnico: '+file+' sem '+requirement[0]+'.');
}
if(!read('index.html').includes('"@type":"WebSite"'))fail('SEO técnico: home sem WebSite structured data.');
const contact=read('contato.html');
if(!/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(contact))fail('SEO técnico: contato deve permanecer noindex.');
if(!css.includes('.ads-ready .ad{display:block}')||!css.includes('.ad{display:none;'))fail('Publicidade: placeholders vazios devem ficar ocultos antes da ativação da rede.');
if(!fs.existsSync(path.join(root,'54b967966f714fbb3be34ca2b1113ef2.txt')))fail('IndexNow: arquivo de validação ausente.');
if(!fs.existsSync(path.join(root,'.github/workflows/indexnow.yml')))fail('IndexNow: workflow de submissão ausente.');

const sitemap=read('sitemap.xml');
if(/<loc>[^<]+\.html<\/loc>/i.test(sitemap))fail('sitemap.xml: contém URL .html em vez da rota canônica.');
for(const m of sitemap.matchAll(/<loc>https:\/\/quantolab\.com\.br([^<]*)<\/loc>/g))if(!routeExists(m[1]||'/'))fail(`sitemap.xml: rota inexistente ${m[1]||'/'}.`);
if((sitemap.match(/<lastmod>2026-08-14<\/lastmod>/g)||[]).length<10)fail('sitemap.xml: lastmod ausente nas URLs indexáveis.');
if(/<loc>https:\/\/quantolab\.com\.br\/contato<\/loc>/.test(sitemap))fail('sitemap.xml: contato noindex não deve constar no sitemap.');

function element(value=''){
  return {value:String(value),textContent:'',disabled:false,listeners:{},addEventListener(type,cb){this.listeners[type]=cb;}};
}
function runCalculator(scriptName,values,click=false){
  const els={};for(const [id,value] of Object.entries(values))els[id]=element(value);
  const document={getElementById:id=>els[id]||null,querySelectorAll:()=>[]};
  const context=vm.createContext({document,Intl,Date,Math,Number,console,setTimeout,clearTimeout});
  vm.runInContext(read(scriptName),context,{filename:scriptName});
  if(click&&els.calcular?.listeners.click)els.calcular.listeners.click();
  return els;
}
const expectIncludes=(label,text,expected)=>{if(!String(text).includes(expected))fail(`${label}: esperado "${expected}" em "${text}".`);};

try{
  let e=runCalculator('valor-hora.js',{renda:6000,custos:1200,horasDia:8,diasSemana:5,ferias:4,naoFaturavel:30,impostos:12,margem:20,calcular:'',limpar:'',recomendado:'',faturamento:'',minimo:'',horasMes:'',diaria:'',projeto:'',status:''});
  expectIncludes('Valor por hora',e.recomendado.textContent,'88');
  expectIncludes('Valor por hora / horas cobradas',e.horasMes.textContent,'112,0');
  expectIncludes('Valor por hora / projeto 20h',e.projeto.textContent,'1.753');

  e=runCalculator('preco-projeto.js',{valorHora:100,horas:20,custos:200,revisoes:15,complexidade:10,calcular:'',limpar:'',principal:'',base:'',custosResultado:'',reservaResultado:'',complexidadeResultado:'',entrada:'',status:''});
  expectIncludes('Preço de projeto',e.principal.textContent,'2.700');
  expectIncludes('Preço de projeto / entrada',e.entrada.textContent,'1.350');

  e=runCalculator('meta-faturamento.js',{renda:8000,custos:1500,impostos:12,reserva:10,projetos:4,calcular:'',limpar:'',principal:'',porProjeto:'',porSemana:'',porAno:'',pontoEquilibrio:'',status:''});
  expectIncludes('Meta mensal',e.principal.textContent,'12.179');
  expectIncludes('Meta mensal / por projeto',e.porProjeto.textContent,'3.045');

  e=runCalculator('clt-pj.js',{cltSalario:7000,cltBeneficios:1200,dependentes:0,cltDescontos:0,cltBonus:0,pjMensal:10000,pjMeses:11,pjImpostos:10,pjContador:200,pjOutros:500,calcular:'',limpar:'',winner:'',diferenca:'',cltAno:'',pjAno:'',cltMes:'',pjMes:'',fgtsAno:'',pjEquivalente:'',status:''});
  if(e.winner.textContent!=='PJ')fail(`CLT x PJ: esperado PJ, recebido ${e.winner.textContent}.`);
  expectIncludes('CLT x PJ / CLT anual',e.cltAno.textContent,'86.924');
  expectIncludes('CLT x PJ / PJ anual',e.pjAno.textContent,'90.600');
  expectIncludes('CLT x PJ / equivalência',e.pjEquivalente.textContent,'9.629');

  e=runCalculator('desligamento.js',{admissao:'2024-01-10',desligamento:'2026-08-10',salario:5000,divisorSaldo:'30',tipo:'sem_justa',aviso:'indenizado',feriasVencidas:'nao',periodosFerias:0,decimoAdiantado:'nao',valorDecimoAdiantado:0,saldoFgts:12000,saqueAniversario:'nao',dependentes:0,outrasVerbas:0,naturezaOutras:'remuneratoria',outrosDescontos:0,calcular:'',limpar:'',totalLiquido:'',notice:'',rSaldo:'',rAviso:'',rDecimo:'',rFeriasProp:'',rFeriasVencidas:'',rOutras:'',rFgtsRescisao:'',rMultaFgts:'',rSaqueFgts:'',rInss:'',rIrrf:'',rDescontos:''},true);
  expectIncludes('Rescisão / 13º projetado',e.rDecimo.textContent,'3.750');
  expectIncludes('Rescisão / aviso proporcional',e.rAviso.textContent,'6.000');
  if(e.totalLiquido.textContent.includes('R$ 0,00'))fail('Rescisão CLT: total líquido ficou zerado no cenário de referência.');
  if(e.rMultaFgts.textContent.includes('R$ 0,00'))fail('Rescisão CLT: multa do FGTS ficou zerada na demissão sem justa causa.');
}catch(err){fail(`Testes de cálculo: ${err.stack||err.message}`);}

if(failures.length){console.error(`QA falhou com ${failures.length} problema(s):`);for(const item of failures)console.error(`- ${item}`);process.exit(1);}
console.log(`QA aprovado: ${htmlFiles.length} páginas, ${jsFiles.length} scripts, segurança do browser, estrutura responsiva, tema persistente, headers e 5 calculadoras com resultados esperados.`);