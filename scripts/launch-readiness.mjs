import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const failures=[];
const fail=message=>failures.push(message);
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const exists=file=>fs.existsSync(path.join(root,file));

for(const file of ['sprint6.js','sprint6.css','theme.js','dark-only.css','politica-de-privacidade.html','.github/workflows/quantolab-synthetic-traffic.yml']){
  if(!exists(file))fail(`${file}: arquivo obrigatório da Sprint 6 ausente.`);
}

if(exists('theme.js')){
  const theme=read('theme.js');
  for(const token of ["const SPRINT6_RUNTIME='/sprint6.js'","window.QuantoLabConsent","analyticsAllowed()","profile_saved","profile_cleared"]){
    if(!theme.includes(token))fail(`theme.js: contrato de Sprint 6 ausente (${token}).`);
  }
}

if(exists('dark-only.css')&&!read('dark-only.css').includes("@import url('/sprint6.css');"))fail('dark-only.css: Sprint 6 CSS não está carregado.');

if(exists('sprint6.js')){
  const runtime=read('sprint6.js');
  for(const token of ["/_vercel/insights/script.js","/_vercel/speed-insights/script.js","beforeSend","quantolab:terms-accepted","catalog_search","calculator_run","client_error"]){
    if(!runtime.includes(token))fail(`sprint6.js: observabilidade incompleta (${token}).`);
  }
  for(const forbidden of ['monthlyIncome','monthlyCosts','taxRate','reserveMonths','search.value','location.search']){
    if(runtime.includes(forbidden))fail(`sprint6.js: possível dado sensível/consulta incluído na telemetria (${forbidden}).`);
  }
}

if(exists('sprint6.css')){
  const css=read('sprint6.css');
  if(!css.includes('@media (prefers-reduced-motion:reduce)'))fail('sprint6.css: tratamento de reduced motion ausente.');
  if(!css.includes('@media (hover:hover) and (pointer:fine)'))fail('sprint6.css: hover deveria ficar restrito a ponteiro fino.');
}

if(exists('politica-de-privacidade.html')){
  const policy=read('politica-de-privacidade.html');
  for(const text of ['Vercel Web Analytics','Vercel Speed Insights','não incluem os valores financeiros digitados','parâmetros de consulta e fragmentos da URL são removidos']){
    if(!policy.includes(text))fail(`Política de privacidade: transparência de telemetria ausente (${text}).`);
  }
}

if(exists('.github/workflows/quantolab-synthetic-traffic.yml')){
  const workflow=read('.github/workflows/quantolab-synthetic-traffic.yml');
  if(/^\s*schedule:/m.test(workflow))fail('Synthetic traffic: cron legado ainda está ativo antes do lançamento.');
  if(!/^\s*workflow_dispatch:/m.test(workflow))fail('Synthetic traffic: execução manual explícita ausente.');
}

if(failures.length){
  console.error(`Launch readiness falhou com ${failures.length} problema(s):`);
  for(const item of failures)console.error(`- ${item}`);
  process.exit(1);
}

console.log('Launch readiness aprovado: polish, consent gate, telemetria sem valores financeiros, privacy disclosure e synthetic traffic manual-only.');
