import fs from 'node:fs';
import vm from 'node:vm';

const failures=[];
const fail=m=>failures.push(m);
const read=f=>fs.readFileSync(f,'utf8');
const exists=f=>fs.existsSync(f);

const tools={
  'tools-clt.js':['salario-liquido','ferias','decimo-terceiro','fgts','seguro-desemprego','hora-extra','inss','irrf'],
  'tools-pj.js':['pj-clt-equivalente','impostos-pj','mei-das','pro-labore','custo-funcionario'],
  'tools-freela.js':['clientes-necessarios','margem-lucro','renda-anual','faturamento-anual'],
  'tools-finance.js':['reserva-emergencia','juros-compostos','rendimento-cdi','comparar-investimentos','metas-financeiras','inflacao']
};
const existing=['valor-hora','preco-projeto','meta-faturamento','comparador-profissional','simulador'];
const newTools=Object.values(tools).flat();
if(existing.length+newTools.length!==28)fail('Catálogo deve totalizar 28 ferramentas.');

for(const [script,slugs] of Object.entries(tools)){
  if(!exists(script)){fail(`${script} ausente.`);continue;}
  const js=read(script);
  for(const slug of slugs){
    if(!js.includes(`'${slug}'`))fail(`${script}: configuração de ${slug} ausente.`);
    const file=`${slug}.html`;
    if(!exists(file)){fail(`${file} ausente.`);continue;}
    const html=read(file);
    if(!html.includes(`data-tool="${slug}"`))fail(`${file}: data-tool incorreto.`);
    if(!html.includes('/tools-core.js'))fail(`${file}: motor compartilhado ausente.`);
    if(!html.includes(`/${script}`))fail(`${file}: script de jornada ausente.`);
    if((html.match(/<h1\b/gi)||[]).length!==1)fail(`${file}: deve ter um h1.`);
    if(!html.includes('data-tool-form')||!html.includes('data-tool-result'))fail(`${file}: shell de cálculo incompleto.`);
    if(!html.includes('data-share-result')||!html.includes('data-copy-result'))fail(`${file}: compartilhamento ausente.`);
    if(!html.includes('<link rel="canonical"'))fail(`${file}: canonical ausente.`);
  }
}

const professions=['designer','desenvolvedor','copywriter','social-media','fotografo','arquiteto'];
for(const slug of professions){
  const file=`valor-hora/${slug}.html`;
  if(!exists(file))fail(`${file} ausente.`);
  else if(!read(file).includes('href="/valor-hora"'))fail(`${file}: CTA para calculadora principal ausente.`);
}

for(const file of ['ferramentas.html','meus-numeros.html','incorporar.html','embed/calculadora.html','platform.css','embed.js','.github/ANALYTICS_EVENTS.md'])if(!exists(file))fail(`${file} ausente.`);

if(exists('ferramentas.html')){
  const html=read('ferramentas.html');
  for(const slug of [...existing,...newTools])if(!html.includes(`href="/${slug}"`))fail(`Catálogo sem ${slug}.`);
}

const theme=read('theme.js');
for(const token of ['quantolab-terms-v2026-08-16','quantolab-profile-v1','terms-consent','QuantoLabProfile','QuantoLabAnalytics','terms_accepted'])if(!theme.includes(token))fail(`theme.js: ${token} ausente.`);
const platform=read('platform.css');
if(!platform.includes('.terms-consent')||!platform.includes('.tool-grid--dense'))fail('platform.css: estilos estruturais incompletos.');

const terms=read('termos.html');
if(!terms.includes('16 de agosto de 2026')||!terms.includes('Aceitar e continuar'))fail('Termos: versão/aceite não documentados.');
const privacy=read('politica-de-privacidade.html');
for(const term of ['Meus números','fragmento da URL','Medição de produto'])if(!privacy.includes(term))fail(`Privacidade: seção ${term} ausente.`);

const embed=read('embed/calculadora.html');
if(!/noindex,nofollow/.test(embed))fail('Embed deve permanecer noindex.');
if(embed.includes('data-ad-slot='))fail('Embed não deve exibir publicidade.');
const headers=read('_headers');
for(const term of ['/embed/*','! X-Frame-Options','! Content-Security-Policy','frame-ancestors https:','X-Robots-Tag: noindex, nofollow'])if(!headers.includes(term))fail(`_headers: regra de embed incompleta (${term}).`);

const sitemap=read('sitemap.xml');
for(const slug of [...existing,...newTools,'ferramentas','meus-numeros','incorporar',...professions.map(p=>`valor-hora/${p}`)])if(!sitemap.includes(`https://quantolab.com.br/${slug}`))fail(`Sitemap sem ${slug}.`);
if(sitemap.includes('/embed/calculadora'))fail('Sitemap não deve indexar embed.');
if(!sitemap.includes('<lastmod>2026-08-16</lastmod>'))fail('Sitemap não foi atualizado para 2026-08-16.');

try{
  const document={readyState:'loading',addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},head:{appendChild(){}},createElement(){return {appendChild(){},append(){},setAttribute(){},classList:{add(){}}};}};
  const window={QuantoLabProfile:{get(){return{};}},QuantoLabAnalytics:{track(){}}};
  const context=vm.createContext({window,document,Intl,Math,Number,Date,URL,URLSearchParams,location:{pathname:'/',hash:'',origin:'https://quantolab.com.br'},navigator:{},setTimeout(){},clearTimeout(){}});
  vm.runInContext(read('tools-core.js'),context,{filename:'tools-core.js'});
  const util=context.window.QuantoLabTools?.util;
  if(!util)fail('tools-core.js: utilitários não foram expostos.');
  else {
    const inss=util.inssEmployee(7000);
    if(Math.abs(inss-781.5144)>0.02)fail(`INSS 2026: cenário 7000 divergente (${inss}).`);
    const net=util.salaryNet(7000,0,0);
    if(!(net.net>5400&&net.net<5500))fail(`Salário líquido 7000 fora da faixa de referência (${net.net}).`);
    if(Math.abs(util.compoundFuture(10000,0,10,12)-11000)>0.05)fail('Juros compostos: 10% a.a. por 12 meses divergente.');
  }
}catch(err){fail(`Motor compartilhado: ${err.stack||err.message}`);}

if(failures.length){console.error(`Platform QA falhou com ${failures.length} problema(s):`);for(const item of failures)console.error(`- ${item}`);process.exit(1);}
console.log(`Platform QA aprovado: 28 ferramentas, consentimento, perfil local, compartilhamento, profissões, embed, SEO e referências matemáticas.`);
