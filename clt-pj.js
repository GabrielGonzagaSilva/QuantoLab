(()=>{
'use strict';
const QL=window.QuantoLabTools;
const {money,pct,inssEmployee,irrfMonthly,round2}=QL.util;
const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id)?.value)||0);
const form=$('clt-pj-form');
const result=$('clt-pj-result');
const model=result.querySelector('.calculator-model');
const summary=$('meuCalculo');
const tableClt=$('tabelaClt');
const tablePj=$('tabelaPj');
let last=null;

function addSummary(label,value){const row=document.createElement('div');row.className='calculator-model__summary-row';const a=document.createElement('span'),b=document.createElement('strong');a.textContent=label;b.textContent=value;row.append(a,b);summary.appendChild(row);}
function addTableRow(host,label,value){const tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');th.scope='row';th.textContent=label;td.textContent=value;tr.append(th,td);host.appendChild(tr);}
function shareUrl(){const values={salario:num('cltSalario'),transporte:num('valeTransporte'),refeicao:num('valeRefeicao'),outros:num('outrosBeneficios'),simples:num('simples')};try{return `${location.origin}${location.pathname}#s=${btoa(encodeURIComponent(JSON.stringify(values)))}`;}catch{return `${location.origin}${location.pathname}`;}}
function restore(){if(!location.hash.startsWith('#s='))return;try{const v=JSON.parse(decodeURIComponent(atob(location.hash.slice(3))));if(v.salario!==undefined)$('cltSalario').value=v.salario;if(v.transporte!==undefined)$('valeTransporte').value=v.transporte;if(v.refeicao!==undefined)$('valeRefeicao').value=v.refeicao;if(v.outros!==undefined)$('outrosBeneficios').value=v.outros;if(v.simples!==undefined)$('simples').value=v.simples;}catch{}}
function showForm(){form.hidden=false;document.body.classList.remove('calculator-result-mode');model.hidden=true;if(matchMedia('(max-width:760px)').matches){form.scrollIntoView({behavior:'smooth',block:'start'});$('cltSalario').focus({preventScroll:true});}}
function showResult(){result.hidden=false;form.hidden=false;if(matchMedia('(max-width:760px)').matches){result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'});}}
function resetPreview(){result.hidden=false;model.hidden=true;$('pjEquivalente').textContent='Aguardando cálculo';$('status').textContent='Preencha os campos e toque em Calcular para ver a estimativa.';summary.replaceChildren();tableClt.replaceChildren();tablePj.replaceChildren();}
function calculate(event){
  event?.preventDefault();
  const salary=num('cltSalario'),transport=num('valeTransporte'),meal=num('valeRefeicao'),other=num('outrosBeneficios'),rate=Math.min(95,num('simples'))/100;
  showResult();
  if(!salary){model.hidden=true;$('pjEquivalente').textContent='Revise os dados';$('status').textContent='Informe o salário bruto CLT para calcular.';return;}
  const inss=inssEmployee(salary),ir=irrfMonthly(salary,{inss}),transportDiscount=Math.min(transport,salary*.06),vacation=salary/12,vacationThird=salary/36,thirteenth=salary/12,fgts=salary*.08;
  const effective=round2(salary+transport+meal+other+vacation+vacationThird+thirteenth+fgts-transportDiscount-inss-ir.tax);
  const pjGross=round2(effective/(1-rate)),pjTax=round2(pjGross*rate),pjNet=round2(pjGross-pjTax);
  last={salary,transport,meal,other,rate,inss,irrf:ir.tax,transportDiscount,vacation,vacationThird,thirteenth,fgts,effective,pjGross,pjTax,pjNet};
  model.hidden=false;
  $('pjEquivalente').textContent=money(pjGross);
  $('status').textContent=`Com alíquota de ${pct(rate*100)}, o faturamento PJ mensal de referência é ${money(pjGross)}.`;
  summary.replaceChildren();addSummary('Salário bruto CLT',money(salary));addSummary('Vale transporte',money(transport));addSummary('Vale refeição',money(meal));addSummary('Outros benefícios',money(other));addSummary('Alíquota do Simples Nacional',pct(rate*100));
  tableClt.replaceChildren();addTableRow(tableClt,'Salário bruto',money(salary));addTableRow(tableClt,'Vale transporte',money(transport));addTableRow(tableClt,'Desconto vale transporte',money(transportDiscount));addTableRow(tableClt,'Vale refeição',money(meal));addTableRow(tableClt,'Outros benefícios',money(other));addTableRow(tableClt,'Férias, reserva mensal',money(vacation));addTableRow(tableClt,'1/3 de férias, reserva mensal',money(vacationThird));addTableRow(tableClt,'13º, reserva mensal',money(thirteenth));addTableRow(tableClt,'FGTS',money(fgts));addTableRow(tableClt,'INSS',money(inss));addTableRow(tableClt,'IRRF',money(ir.tax));addTableRow(tableClt,'Remuneração líquida efetiva',money(effective));
  tablePj.replaceChildren();addTableRow(tablePj,'Salário bruto',money(pjGross));addTableRow(tablePj,'Imposto Simples Nacional',money(pjTax));addTableRow(tablePj,'Remuneração líquida efetiva',money(pjNet));
  window.QuantoLabAnalytics?.track?.('calculation_completed',{tool:'comparador-profissional'});
}
function clearAll(){form.reset();$('cltSalario').value='';$('valeTransporte').value='0';$('valeRefeicao').value='0';$('outrosBeneficios').value='0';$('simples').value='6';last=null;resetPreview();showForm();}
form.addEventListener('submit',calculate);$('limpar').addEventListener('click',clearAll);$('refazer').addEventListener('click',showForm);
$('copiar').addEventListener('click',async()=>{const url=shareUrl(),text=last?`CLT x PJ: valor PJ equivalente ${money(last.pjGross)}. ${url}`:url;try{await navigator.clipboard.writeText(text);$('shareStatus').textContent='Link copiado.';setTimeout(()=>$('shareStatus').textContent='',1800);}catch{$('shareStatus').textContent='Não foi possível copiar o link.';}});
$('compartilhar').addEventListener('click',async()=>{const url=shareUrl(),text=last?`Valor PJ equivalente: ${money(last.pjGross)}`:'Calculadora CLT x PJ';if(navigator.share){try{await navigator.share({title:'Calculadora CLT x PJ',text,url});}catch{}}else $('copiar').click();});
restore();resetPreview();
})();