(()=>{
'use strict';
const BRL=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const NUM=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2});
const MIN_WAGE_2026=1621;
const INSS_CEILING_2026=8475.55;
const DEPENDENT_DEDUCTION_2026=189.59;
const SIMPLE_DEDUCTION_2026=607.20;
const money=v=>BRL.format(Number.isFinite(Number(v))?Number(v):0);
const number=v=>NUM.format(Number.isFinite(Number(v))?Number(v):0);
const pct=v=>`${number(v)}%`;
const clamp=(v,min,max)=>Math.min(Math.max(v,min),max);
const n=(values,key,fallback=0)=>{const value=Number(values[key]);return Number.isFinite(value)?value:fallback;};
const round2=v=>Math.round((Number(v)+Number.EPSILON)*100)/100;

function inssEmployee(salary){
  const base=clamp(Number(salary)||0,0,INSS_CEILING_2026);
  const bands=[[1621,0.075],[2902.84,0.09],[4354.27,0.12],[8475.55,0.14]];
  let prev=0,total=0;
  for(const [limit,rate] of bands){if(base<=prev)break;const taxable=Math.min(base,limit)-prev;if(taxable>0)total+=taxable*rate;prev=limit;}
  return round2(Math.max(0,total));
}
function baseIrrfTax(base){const b=Math.max(0,base);if(b<=2428.80)return 0;if(b<=2826.65)return b*.075-182.16;if(b<=3751.05)return b*.15-394.16;if(b<=4664.68)return b*.225-675.49;return b*.275-908.73;}
function applyIrrfReduction2026(gross,tax){const income=Math.max(0,Number(gross)||0);const before=Math.max(0,Number(tax)||0);let reduction=0;if(income<=5000)reduction=Math.min(before,312.89);else if(income<=7350)reduction=Math.min(before,Math.max(0,978.62-(.133145*income)));return {tax:round2(Math.max(0,before-reduction)),reduction:round2(reduction)};}
function irrfMonthly(gross,{inss=0,dependents=0,otherLegal=0}={}){
  const legal=Math.max(0,inss)+Math.max(0,dependents)*DEPENDENT_DEDUCTION_2026+Math.max(0,otherLegal);
  const deduction=Math.max(legal,SIMPLE_DEDUCTION_2026);
  const method=legal>=SIMPLE_DEDUCTION_2026?'Deduções legais':'Desconto simplificado mensal';
  const base=Math.max(0,gross-deduction);
  const beforeReduction=round2(Math.max(0,baseIrrfTax(base)));
  const reduced=applyIrrfReduction2026(gross,beforeReduction);
  return {tax:reduced.tax,base:round2(base),deduction:round2(deduction),method,beforeReduction,reduction:reduced.reduction};
}
function irrfThirteenth(gross,dependents=0){
  const inss=inssEmployee(gross);
  const base=Math.max(0,gross-inss-Math.max(0,dependents)*DEPENDENT_DEDUCTION_2026);
  const beforeReduction=round2(Math.max(0,baseIrrfTax(base)));
  const reduced=applyIrrfReduction2026(gross,beforeReduction);
  return {tax:reduced.tax,inss,base:round2(base),beforeReduction,reduction:reduced.reduction};
}
function salaryNet(gross,dependents=0,otherDeductions=0){const inss=inssEmployee(gross);const ir=irrfMonthly(gross,{inss,dependents});return {gross,inss,irrf:ir.tax,net:Math.max(0,round2(gross-inss-ir.tax-Math.max(0,otherDeductions))),ir};}
function monthlyEquivalentRate(rate,kind='annual'){const value=Number(rate)||0;return kind==='monthly'?value/100:Math.pow(1+value/100,1/12)-1;}
function compoundSeries(initial,monthly,rate,rateKind,months){
  const start=Math.max(0,Number(initial)||0),contribution=Math.max(0,Number(monthly)||0),r=monthlyEquivalentRate(rate,rateKind);let balance=start,invested=start;const out=[];
  for(let month=1;month<=Math.max(0,Math.floor(months));month++){
    const interest=balance*r;balance+=interest;balance+=contribution;invested+=contribution;
    out.push({month,start:round2(start),interest:round2(interest),invested:round2(invested),totalInterest:round2(balance-invested),balance:round2(balance)});
  }
  return out;
}
function compoundFuture(initial,monthly,annualRate,months){const series=compoundSeries(initial,monthly,annualRate,'annual',months);return series.length?series.at(-1).balance:Number(initial)||0;}
function cltPackageApprox(monthlyGross){const gross=Math.max(0,monthlyGross),annualSalary=gross*12,thirteenth=gross,vacationBonus=gross/3,fgts=(annualSalary+thirteenth+vacationBonus)*.08;return annualSalary+thirteenth+vacationBonus+fgts;}
function pjEquivalentClt(annualPj){let lo=0,hi=Math.max(5000,annualPj/8);while(cltPackageApprox(hi)<annualPj)hi*=1.5;for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(cltPackageApprox(mid)<annualPj)lo=mid;else hi=mid;}return (lo+hi)/2;}
function monthsBetween(start,end){if(!(start instanceof Date)||!(end instanceof Date)||end<start)return 0;return Math.max(0,(end.getFullYear()-start.getFullYear())*12+(end.getMonth()-start.getMonth())+1);}

const SOURCES={
  inss:['INSS, tabela de contribuição mensal 2026','https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal'],
  irrf:['Receita Federal, tributação de 2026','https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026'],
  desemprego:['FAT/MTE, Seguro Desemprego 2026','https://portalfat.trabalho.gov.br/mte-reajusta-valores-do-beneficio-seguro-desemprego/'],
  fgts:['FGTS, recolhimento do empregado','https://www.fgts.gov.br/Paginas/subpaginas/recolhimento-empregado.aspx'],
  ferias:['MTE, perguntas frequentes sobre férias','https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/perguntas-frequentes'],
  trabalho:['MTE, direitos no encerramento do contrato','https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/proteja/duvidas-frequentes'],
  clt:['CLT compilada, art. 59','https://www.presidencia.gov.br/ccivil_03/decreto-lei/del5452compilado.htm'],
  mei:['Empresas e Negócios, DAS MEI 2026','https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/perguntas-frequentes/pagamento-da-contribuicao-mensal-carne-mensal/qual-o-valor-das-contribuicoes'],
  bcb:['Banco Central, Calculadora do Cidadão','https://www3.bcb.gov.br/CALCIDADAO/publico/corrigirPeloCDI.do?aba=5&method=corrigirPeloCDI'],
  methodology:['QuantoLab, metodologia','/metodologia']
};
const QL=window.QuantoLabTools={configs:{},sources:SOURCES,util:{money,number,pct,clamp,n,round2,inssEmployee,baseIrrfTax,applyIrrfReduction2026,irrfMonthly,irrfThirteenth,salaryNet,monthlyEquivalentRate,compoundSeries,compoundFuture,cltPackageApprox,pjEquivalentClt,monthsBetween},register(value){Object.assign(this.configs,value);}};
const make=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
function appendInput(container,field,profile){
  const [key,labelText,type,defaultValue,prefix,suffix,step,profileKey,help,...options]=field;const fieldEl=make('div','field'),id=`tool-${key}`,label=make('label','',labelText);label.htmlFor=id;fieldEl.appendChild(label);if(help)fieldEl.appendChild(make('span','field-help',help));
  let input,wrap=make('div','input-wrap');if(prefix)wrap.appendChild(make('span','prefix',prefix));
  if(type==='select'){input=document.createElement('select');for(const pair of options){if(!Array.isArray(pair))continue;const option=document.createElement('option');option.value=pair[0];option.textContent=pair[1];input.appendChild(option);}input.value=String(defaultValue);}
  else if(type==='checkbox'){input=document.createElement('input');input.type='checkbox';input.checked=Boolean(defaultValue);wrap.classList.add('input-wrap--check');}
  else{input=document.createElement('input');input.type=type==='date'||type==='month'?type:'number';if(input.type==='number'){input.inputMode='decimal';input.min='0';if(step)input.step=String(step);}const profileValue=profileKey&&profile&&profile[profileKey]!==undefined?profile[profileKey]:defaultValue;if(profileValue!==undefined&&profileValue!==null)input.value=String(profileValue);}
  input.id=id;input.name=key;input.dataset.toolInput='';wrap.appendChild(input);if(suffix)wrap.appendChild(make('span','suffix',suffix));fieldEl.appendChild(wrap);container.appendChild(fieldEl);
}
function collect(form){const values={};for(const input of form.querySelectorAll('[data-tool-input]'))values[input.name]=input.type==='checkbox'?input.checked:input.value;return values;}
function restoreShared(form){const raw=location.hash.startsWith('#s=')?location.hash.slice(3):'';if(!raw)return;try{const values=JSON.parse(decodeURIComponent(atob(raw)));for(const input of form.querySelectorAll('[data-tool-input]'))if(Object.prototype.hasOwnProperty.call(values,input.name)){if(input.type==='checkbox')input.checked=Boolean(values[input.name]);else input.value=String(values[input.name]);}}catch{}}
function encodeShared(values){try{return btoa(encodeURIComponent(JSON.stringify(values)));}catch{return '';}}
function renderRelated(config){const host=document.querySelector('[data-related-tools]');if(!host||!config.related)return;for(const [href,title] of config.related){const link=make('a','card decision-card');link.href=href;link.append(make('span','decision-card__kicker','Próxima decisão'),make('h3','',title),make('p','',`Continue com ${title.toLowerCase()}.`));host.appendChild(link);}}
function displayValue(input){if(input.type==='checkbox')return input.checked?'Sim':'Não';if(input.tagName==='SELECT')return input.selectedOptions[0]?.textContent||'';if(!input.value)return 'Não informado';if(input.type==='date')return new Date(`${input.value}T12:00:00`).toLocaleDateString('pt-BR');if(input.type==='month'){const [y,m]=input.value.split('-');return `${m}/${y}`;}const field=input.closest('.field');if(field?.querySelector('.prefix')?.textContent.includes('R$'))return money(Number(input.value));const suffix=field?.querySelector('.suffix')?.textContent||'';return `${number(Number(input.value))}${suffix?` ${suffix.trim()}`:''}`;}
function ensureModel(result){
  let model=result.querySelector('.calculator-model');if(model)return model;const body=result.querySelector('.result-body')||result;model=make('div','calculator-model');
  const redo=make('button','calculator-model__redo','Fazer outro cálculo');redo.type='button';redo.dataset.redoCalculation='';
  const mine=make('section','calculator-model__section');mine.append(make('h3','','Meu cálculo'),make('div','calculator-model__summary'));const outcome=make('section','calculator-model__section');outcome.append(make('h3','','Resultado'),make('div','calculator-table-wrap'));const visual=make('section','calculator-model__section calculator-model__visual');visual.hidden=true;model.append(redo,mine,outcome,visual);body.prepend(model);return model;
}
function renderTable(host,last){host.replaceChildren();const table=document.createElement('table');table.className='calculator-table';const thead=document.createElement('thead'),tbody=document.createElement('tbody');const spec=last.table||{headers:['Item','Valor'],rows:last.rows||[]};const trh=document.createElement('tr');for(const h of spec.headers){const th=make('th','',h);trh.appendChild(th);}thead.appendChild(trh);for(const rowData of spec.rows){const tr=document.createElement('tr');for(let i=0;i<spec.headers.length;i++){const cell=i===0?document.createElement('th'):document.createElement('td');if(i===0)cell.scope='row';cell.textContent=rowData[i]??'';tr.appendChild(cell);}tbody.appendChild(tr);}table.append(thead,tbody);host.appendChild(table);}
function renderSeries(host,series){
  host.replaceChildren();if(!Array.isArray(series)||!series.length){host.hidden=true;return;}host.hidden=false;
  const tabs=make('div','calculator-tabs'),chartBtn=make('button','is-active','Gráfico'),tableBtn=make('button','','Tabela');chartBtn.type=tableBtn.type='button';chartBtn.setAttribute('aria-pressed','true');tableBtn.setAttribute('aria-pressed','false');tabs.append(chartBtn,tableBtn);
  const chart=make('div','calculator-chart'),tableWrap=make('div','calculator-table-wrap');tableWrap.hidden=true;host.append(tabs,chart,tableWrap);
  const values=series.map(x=>x.balance),max=Math.max(...values,1),w=640,h=220,p=18,points=series.map((x,i)=>`${p+(i/Math.max(1,series.length-1))*(w-p*2)},${h-p-(x.balance/max)*(h-p*2)}`).join(' ');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('role','img');svg.setAttribute('aria-label','Evolução do valor acumulado');
  const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');line.setAttribute('fill','none');line.setAttribute('stroke','currentColor');line.setAttribute('stroke-width','4');line.setAttribute('points',points);svg.appendChild(line);
  const legend=make('div','calculator-chart__legend');legend.append(make('span','',`Valor inicial: ${money(series[0].start)}`),make('strong','',`Valor final: ${money(series.at(-1).balance)}`));chart.append(svg,legend);
  renderTable(tableWrap,{table:{headers:['Mês','Juros','Total investido','Total em juros','Total acumulado'],rows:series.map(x=>[String(x.month),money(x.interest),money(x.invested),money(x.totalInterest),money(x.balance)])}});
  const select=showChart=>{chart.hidden=!showChart;tableWrap.hidden=showChart;chartBtn.classList.toggle('is-active',showChart);tableBtn.classList.toggle('is-active',!showChart);chartBtn.setAttribute('aria-pressed',String(showChart));tableBtn.setAttribute('aria-pressed',String(!showChart));};chartBtn.addEventListener('click',()=>select(true));tableBtn.addEventListener('click',()=>select(false));
}
function mount(){
  const slug=document.body.dataset.tool;if(!slug||!QL.configs[slug])return;const config=QL.configs[slug];window.QuantoLabAnalytics?.track?.('tool_opened',{tool:slug});const form=document.querySelector('[data-tool-form]'),result=document.querySelector('[data-tool-result]');if(!form||!result)return;const profile=window.QuantoLabProfile?.get?.()||{};for(const field of config.fields)appendInput(form,field,profile);
  const actions=make('div','grid2 action-grid simple-actions'),calcBtn=make('button','btn','Calcular'),clearBtn=make('button','btn btn-secondary','Limpar');calcBtn.type=clearBtn.type='button';actions.append(calcBtn,clearBtn);form.appendChild(actions);restoreShared(form);
  const headline=result.querySelector('[data-result-headline]'),summary=result.querySelector('[data-result-summary]'),rows=result.querySelector('[data-result-rows]'),note=result.querySelector('[data-result-note]'),shareBtn=document.querySelector('[data-share-result]'),copyBtn=document.querySelector('[data-copy-result]'),sourceHost=document.querySelector('[data-source]'),model=ensureModel(result);result.hidden=true;
  if(sourceHost&&config.source){const [sourceTitle,sourceHref]=config.source,a=make('a','',`${sourceTitle} →`);a.href=sourceHref;if(/^https?:/.test(sourceHref)){a.target='_blank';a.rel='noopener noreferrer';}sourceHost.append(make('span','',`Referência atualizada em agosto de 2026`),a);}
  let last=null;
  function showForm(){form.hidden=false;document.body.classList.remove('calculator-result-mode');if(matchMedia('(max-width:760px)').matches){form.scrollIntoView({behavior:'smooth',block:'start'});form.querySelector('[data-tool-input]')?.focus({preventScroll:true});}}
  model.querySelector('[data-redo-calculation]').addEventListener('click',showForm);
  const calculate=()=>{
    const values=collect(form),validation=config.validate?.(values);if(validation){result.hidden=false;headline.textContent='Revise os dados';summary.textContent=validation;model.hidden=true;return;}
    window.QuantoLabAnalytics?.track?.('calculation_started',{tool:slug});last=config.calc(values);result.hidden=false;model.hidden=false;result.classList.add('model-active');headline.textContent=last.headline;summary.textContent=last.summary;rows?.replaceChildren();if(rows&&last.rows)for(const [rowLabel,value] of last.rows){const row=make('div','row');row.append(make('span','',rowLabel),make('strong','',value));rows.appendChild(row);}if(note){note.textContent=last.note||'';note.hidden=!last.note;}
    const summaryHost=model.querySelector('.calculator-model__summary');summaryHost.replaceChildren();for(const input of form.querySelectorAll('[data-tool-input]')){const label=form.querySelector(`label[for="${input.id}"]`)?.textContent||input.name,row=make('div','calculator-model__summary-row');row.append(make('span','',label),make('strong','',displayValue(input)));summaryHost.appendChild(row);}renderTable(model.querySelector('.calculator-table-wrap'),last);renderSeries(model.querySelector('.calculator-model__visual'),last.series);
    if(matchMedia('(max-width:760px)').matches){form.hidden=true;document.body.classList.add('calculator-result-mode');result.tabIndex=-1;result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'});}window.QuantoLabAnalytics?.track?.('calculation_completed',{tool:slug});
  };
  calcBtn.addEventListener('click',calculate);form.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.tagName!=='SELECT'){event.preventDefault();calculate();}});
  clearBtn.addEventListener('click',()=>{for(const input of form.querySelectorAll('[data-tool-input]')){if(input.type==='checkbox')input.checked=false;else if(input.tagName==='SELECT')input.selectedIndex=0;else input.value='';}result.hidden=true;model.hidden=true;last=null;showForm();});
  const shareText=()=>last?`${document.title.replace(' | QuantoLab','')}: ${last.headline}. ${last.summary}`:document.title;
  if(copyBtn)copyBtn.addEventListener('click',async()=>{const values=collect(form),encoded=encodeShared(values),url=encoded?`${location.origin}${location.pathname}#s=${encoded}`:`${location.origin}${location.pathname}`;try{await navigator.clipboard.writeText(`${shareText()} ${url}`);copyBtn.textContent='Copiado';setTimeout(()=>copyBtn.textContent='Copiar link',1800);}catch{copyBtn.textContent='Não foi possível copiar';}window.QuantoLabAnalytics?.track?.('result_shared',{tool:slug,method:'copy'});});
  if(shareBtn)shareBtn.addEventListener('click',async()=>{const values=collect(form),encoded=encodeShared(values),url=encoded?`${location.origin}${location.pathname}#s=${encoded}`:`${location.origin}${location.pathname}`;if(navigator.share){try{await navigator.share({title:document.title,text:shareText(),url});window.QuantoLabAnalytics?.track?.('result_shared',{tool:slug,method:'native'});}catch{}}else copyBtn?.click();});renderRelated(config);
}
QL.mount=mount;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else setTimeout(mount,0);
})();