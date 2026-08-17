(()=>{
'use strict';
const path=location.pathname.replace(/\.html$/,'');
const configs={
  '/valor-hora':{
    form:'valor-hora-form',
    outputs:[['Valor por hora','recomendado'],['Diária de trabalho','diaria'],['Quanto precisa entrar por mês','faturamento'],['Valor sem reserva de segurança','minimo'],['Horas cobradas por mês','horasMes'],['Projeto de 20 horas','projeto']]
  },
  '/preco-projeto':{
    form:'preco-projeto-form',
    outputs:[['Preço do projeto','principal'],['Entrada de 50%','entrada'],['Seu trabalho','base'],['Gastos extras','custosResultado'],['Revisões e imprevistos','reservaResultado'],['Urgência ou dificuldade','complexidadeResultado']]
  },
  '/meta-faturamento':{
    form:'meta-form',
    outputs:[['Meta mensal','principal'],['Meta por cliente ou projeto','porProjeto'],['Meta por semana','porSemana'],['Meta no ano','porAno'],['Mínimo para cobrir gastos fixos','pontoEquilibrio']]
  }
};
const config=configs[path];if(!config)return;
const form=document.getElementById(config.form),result=document.querySelector('.panel.result'),calculate=document.getElementById('calcular'),clear=document.getElementById('limpar');if(!form||!result||!calculate)return;
const make=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
const moneyFormat=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});

function stateControls(){return [...form.querySelectorAll('input,select')].filter(el=>el.type!=='hidden');}
function summaryControls(){return stateControls().filter(el=>!el.disabled&&!el.id.endsWith('Modo'));}
function fieldValue(control){
  if(control.type==='checkbox')return control.checked?'Sim':'Não';
  if(control.tagName==='SELECT')return control.selectedOptions[0]?.textContent||'Não informado';
  if(!control.value)return 'Não informado';
  const field=control.closest('.field');
  if(field?.querySelector('.prefix')?.textContent.includes('R$'))return moneyFormat.format(Number(control.value)||0);
  const suffix=field?.querySelector('.suffix')?.textContent?.trim();
  return suffix?`${control.value} ${suffix}`:control.value;
}
function labelFor(control){return form.querySelector(`label[for="${control.id}"]`)?.textContent?.trim()||control.getAttribute('aria-label')||control.id;}
function buildModel(){
  const body=result.querySelector('.result-body')||result;
  let model=body.querySelector('.calculator-model--legacy');if(model)return model;
  for(const old of body.querySelectorAll('.highlight,.result-details'))old.hidden=true;
  model=make('div','calculator-model calculator-model--legacy');
  const redo=make('button','calculator-model__redo','Fazer outro cálculo');redo.type='button';redo.dataset.legacyRedo='';
  const mine=make('section','calculator-model__section');mine.append(make('h3','','Meu cálculo'),make('div','calculator-model__summary'));
  const outcome=make('section','calculator-model__section');outcome.append(make('h3','','Resultado'),make('div','calculator-table-wrap'));
  const share=make('div','result-share'),shareButton=make('button','btn btn-secondary','Compartilhar resultado'),copyButton=make('button','btn btn-secondary','Copiar link'),status=make('p','result-share__status');shareButton.type=copyButton.type='button';status.setAttribute('aria-live','polite');share.append(shareButton,copyButton,status);
  model.append(redo,mine,outcome,share);body.appendChild(model);result.classList.add('legacy-model-enhanced');
  redo.addEventListener('click',()=>{model.hidden=true;result.hidden=false;form.hidden=false;document.body.classList.remove('calculator-result-mode');if(matchMedia('(max-width:760px)').matches){form.scrollIntoView({behavior:'smooth',block:'start'});summaryControls()[0]?.focus({preventScroll:true});}});
  const sharedUrl=()=>{const values={};for(const control of stateControls())values[control.id]=control.type==='checkbox'?control.checked:control.value;try{return `${location.origin}${location.pathname}#s=${btoa(encodeURIComponent(JSON.stringify(values)))}`;}catch{return `${location.origin}${location.pathname}`;}};
  const shareText=()=>`${document.title.replace(' | QuantoLab','')}: ${config.outputs[0] ? document.getElementById(config.outputs[0][1])?.textContent||'' : ''}`;
  copyButton.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`${shareText()} ${sharedUrl()}`);status.textContent='Link copiado.';setTimeout(()=>status.textContent='',1800);}catch{status.textContent='Não foi possível copiar o link.';}});
  shareButton.addEventListener('click',async()=>{const url=sharedUrl(),text=shareText();if(navigator.share){try{await navigator.share({title:document.title,text,url});}catch{}}else copyButton.click();});
  return model;
}
function restore(){
  if(!location.hash.startsWith('#s='))return false;
  try{
    const values=JSON.parse(decodeURIComponent(atob(location.hash.slice(3))));
    for(const control of stateControls())if(Object.prototype.hasOwnProperty.call(values,control.id)){
      if(control.type==='checkbox')control.checked=Boolean(values[control.id]);else control.value=String(values[control.id]);
      control.dispatchEvent(new Event('change',{bubbles:true}));
    }
    return true;
  }catch{return false;}
}
function refreshModel(){
  const model=buildModel(),summary=model.querySelector('.calculator-model__summary'),wrap=model.querySelector('.calculator-table-wrap');summary.replaceChildren();
  for(const control of summaryControls()){const row=make('div','calculator-model__summary-row');row.append(make('span','',labelFor(control)),make('strong','',fieldValue(control)));summary.appendChild(row);}
  wrap.replaceChildren();const table=make('table','calculator-table'),thead=document.createElement('thead'),tbody=document.createElement('tbody'),head=document.createElement('tr');head.append(make('th','','Item'),make('th','','Valor'));thead.appendChild(head);
  for(const [label,id] of config.outputs){const tr=document.createElement('tr'),th=make('th','',label),td=make('td','',document.getElementById(id)?.textContent||'');th.scope='row';tr.append(th,td);tbody.appendChild(tr);}table.append(thead,tbody);wrap.appendChild(table);
}
function showResult(){const model=buildModel();refreshModel();result.hidden=false;model.hidden=false;form.hidden=false;if(matchMedia('(max-width:760px)').matches){result.tabIndex=-1;result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'});}}
calculate.textContent='Calcular';
const model=buildModel();
result.hidden=false;
model.hidden=true;
calculate.addEventListener('click',()=>setTimeout(showResult,0));
clear?.addEventListener('click',()=>{setTimeout(()=>{result.hidden=false;model.hidden=true;form.hidden=false;document.body.classList.remove('calculator-result-mode');},0);});
if(restore())setTimeout(()=>calculate.click(),0);
})();