(()=>{
'use strict';
const QL=window.QuantoLabTools;
const {money,round2,inssEmployee,irrfMonthly,irrfThirteenth}=QL.util;
const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id)?.value)||0);
const form=$('rescisao-form');
const result=$('rescisao-result');
const summary=$('meuCalculo');
const table=$('resultadoTabela');
const TOOL='simulador';
let last=null;

window.QuantoLabAnalytics?.track?.('tool_opened',{tool:TOOL});

function parseDate(id){const value=$(id)?.value;if(!value)return null;const [y,m,d]=value.split('-').map(Number);return new Date(y,m-1,d,12);}
function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d;}
function fullYears(a,b){let years=b.getFullYear()-a.getFullYear();if(b.getMonth()<a.getMonth()||(b.getMonth()===a.getMonth()&&b.getDate()<a.getDate()))years--;return Math.max(0,years);}
function noticeDays(admission,end){return Math.min(90,30+fullYears(admission,end)*3);}
function overlapDays(a1,a2,b1,b2){const start=new Date(Math.max(a1,b1)),end=new Date(Math.min(a2,b2));return end<start?0:Math.floor((end-start)/86400000)+1;}
function thirteenthMonths(admission,end){let total=0;for(let month=0;month<12;month++){const start=new Date(end.getFullYear(),month,1,12),finish=new Date(end.getFullYear(),month+1,0,12);if(start>end)break;if(overlapDays(admission,end,start,finish)>=15)total++;}return total;}
function proportionalVacationMonths(admission,end){let anchor=new Date(end.getFullYear(),admission.getMonth(),admission.getDate(),12);if(anchor>end)anchor.setFullYear(anchor.getFullYear()-1);if(anchor<admission)anchor=new Date(admission);let total=0;for(let i=0;i<12;i++){const start=new Date(anchor);start.setMonth(start.getMonth()+i);const finish=new Date(anchor);finish.setMonth(finish.getMonth()+i+1);finish.setDate(finish.getDate()-1);if(start>end)break;if(overlapDays(admission,end,start,finish)>=15)total++;}return Math.min(12,total);}
function fmtDate(date){return date?.toLocaleDateString('pt-BR')||'';}
function addSummary(label,value){const row=document.createElement('div');row.className='calculator-model__summary-row';const a=document.createElement('span'),b=document.createElement('strong');a.textContent=label;b.textContent=value;row.append(a,b);summary.appendChild(row);}
function addRow(label,value){const tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');th.scope='row';th.textContent=label;td.textContent=value;tr.append(th,td);table.appendChild(tr);}
function typeLabel(){return $('tipo').selectedOptions[0]?.textContent||'';}
function noticeLabel(){return $('aviso').selectedOptions[0]?.textContent||'';}
function showForm(){form.hidden=false;document.body.classList.remove('calculator-result-mode');if(matchMedia('(max-width:760px)').matches){form.scrollIntoView({behavior:'smooth',block:'start'});$('salario').focus({preventScroll:true});}}
function showResult(){result.hidden=false;if(matchMedia('(max-width:760px)').matches){form.hidden=true;document.body.classList.add('calculator-result-mode');result.focus({preventScroll:true});result.scrollIntoView({behavior:'smooth',block:'start'});}}
function encodeState(){const state={salario:num('salario'),admissao:$('admissao').value,desligamento:$('desligamento').value,tipo:$('tipo').value,aviso:$('aviso').value,feriasAdquiridas:$('feriasAdquiridas').checked,dependentes:num('dependentes'),saldoFgts:num('saldoFgts'),feriasVencidasDias:num('feriasVencidasDias')};try{return btoa(encodeURIComponent(JSON.stringify(state)));}catch{return '';}}
function restore(){if(!location.hash.startsWith('#s='))return;try{const state=JSON.parse(decodeURIComponent(atob(location.hash.slice(3))));for(const key of ['salario','admissao','desligamento','tipo','aviso','dependentes','saldoFgts','feriasVencidasDias'])if(state[key]!==undefined&&$(key))$(key).value=state[key];if(state.feriasAdquiridas!==undefined)$('feriasAdquiridas').checked=Boolean(state.feriasAdquiridas);}catch{}}
function calculate(event){
  event?.preventDefault();
  const admission=parseDate('admissao'),end=parseDate('desligamento'),salary=num('salario'),dependents=Math.floor(num('dependentes'));
  showResult();
  if(!salary||!admission||!end){$('totalLiquido').textContent='Revise os dados';$('notice').textContent='Informe salário, data de contratação e data de demissão.';return;}
  if(end<admission){$('totalLiquido').textContent='Revise os dados';$('notice').textContent='A data de demissão precisa ser posterior à contratação.';return;}
  if(end.getFullYear()!==2026){$('totalLiquido').textContent='Revise os dados';$('notice').textContent='Esta versão usa as tabelas tributárias de 2026. Informe uma demissão em 2026.';return;}
  window.QuantoLabAnalytics?.track?.('calculation_started',{tool:TOOL});
  const type=$('tipo').value,notice=$('aviso').value,noticeLength=noticeDays(admission,end);let projectedEnd=new Date(end),noticeCredit=0,noticeDiscount=0;
  if(notice==='indenizado'&&(type==='sem_justa'||type==='indireta')){noticeCredit=salary/30*noticeLength;projectedEnd=addDays(end,noticeLength);}
  else if(notice==='indenizado'&&type==='acordo'){noticeCredit=salary/30*noticeLength*.5;projectedEnd=addDays(end,Math.ceil(noticeLength*.5));}
  else if(notice==='descontado'&&type==='pedido')noticeDiscount=salary;

  const workedDays=Math.min(30,Math.max(0,end.getDate()));
  const salaryBalance=round2(salary/30*workedDays);
  const losesProportional=type==='justa';
  const months13=losesProportional?0:thirteenthMonths(admission,projectedEnd);
  const gross13=round2(salary*months13/12);
  const vacationMonths=losesProportional?0:proportionalVacationMonths(admission,projectedEnd);
  const proportionalVacation=round2(salary*vacationMonths/12*4/3);
  const acquiredVacation=$('feriasAdquiridas').checked?round2(salary*4/3):0;
  const overdueDays=Math.min(60,num('feriasVencidasDias'));
  const overdueVacation=round2(salary/30*overdueDays*4/3);

  const regularInss=inssEmployee(salaryBalance),regularIr=irrfMonthly(salaryBalance,{inss:regularInss,dependents}),thirteenthTax=irrfThirteenth(gross13,dependents);
  const totalInss=round2(regularInss+thirteenthTax.inss),totalIrrf=round2(regularIr.tax+thirteenthTax.tax);
  const grossDirect=round2(salaryBalance+noticeCredit+gross13+proportionalVacation+acquiredVacation+overdueVacation);
  const directNet=round2(Math.max(0,grossDirect-noticeDiscount-totalInss-totalIrrf));

  const terminationFgts=round2((salaryBalance+gross13+noticeCredit)*.08),previousFgts=num('saldoFgts'),fgtsBase=round2(previousFgts+terminationFgts);let penalty=0,withdrawal=0;
  if(type==='sem_justa'||type==='indireta'){penalty=round2(fgtsBase*.4);withdrawal=fgtsBase;}
  else if(type==='acordo'||type==='reciproca'){penalty=round2(fgtsBase*.2);withdrawal=round2(type==='acordo'?fgtsBase*.8:fgtsBase);}
  else if(type==='prazo'){withdrawal=fgtsBase;}
  const fgtsAvailable=round2(withdrawal+penalty);

  last={salary,admission,end,type,notice,noticeLength,workedDays,salaryBalance,noticeCredit,noticeDiscount,months13,gross13,vacationMonths,proportionalVacation,acquiredVacation,overdueDays,overdueVacation,totalInss,totalIrrf,directNet,terminationFgts,previousFgts,penalty,withdrawal,fgtsAvailable};
  $('totalLiquido').textContent=money(directNet);
  $('notice').textContent=fgtsAvailable>0?`Além do acerto, a estimativa indica ${money(fgtsAvailable)} entre saldo de FGTS disponível e multa.`:'FGTS e multa são mostrados separadamente quando houver direito de saque.';
  summary.replaceChildren();addSummary('Salário bruto',money(salary));addSummary('Data de contratação',fmtDate(admission));addSummary('Data de demissão',fmtDate(end));addSummary('Motivo',typeLabel());addSummary('Aviso prévio',noticeLabel());addSummary('Férias adquiridas no ano anterior',$('feriasAdquiridas').checked?'Sim':'Não');addSummary('Número de dependentes',String(dependents));addSummary('Saldo do FGTS',money(previousFgts));addSummary('Férias vencidas',`${overdueDays} dias`);
  table.replaceChildren();addRow('Salário pelos dias trabalhados',money(salaryBalance));addRow('Aviso prévio',noticeDiscount?`Desconto de ${money(noticeDiscount)}`:money(noticeCredit));addRow('13º proporcional',money(gross13));addRow('Férias proporcionais e 1/3',money(proportionalVacation));addRow('Férias adquiridas e 1/3',money(acquiredVacation));addRow('Férias vencidas informadas e 1/3',money(overdueVacation));addRow('INSS estimado',money(totalInss));addRow('IRRF estimado',money(totalIrrf));addRow('Valor líquido do acerto',money(directNet));addRow('FGTS calculado na rescisão',money(terminationFgts));addRow('Saldo de FGTS considerado',money(fgtsBase));addRow('Multa do FGTS',money(penalty));addRow('FGTS disponível para saque',money(withdrawal));addRow('FGTS mais multa',money(fgtsAvailable));
  window.QuantoLabAnalytics?.track?.('calculation_completed',{tool:TOOL});
}
function clearAll(){form.reset();$('salario').value='';$('dependentes').value='0';$('saldoFgts').value='0';$('feriasVencidasDias').value='0';$('tipo').value='sem_justa';$('aviso').value='indenizado';result.hidden=true;last=null;showForm();}
form.addEventListener('submit',calculate);$('limpar').addEventListener('click',clearAll);$('refazer').addEventListener('click',showForm);
$('copiar').addEventListener('click',async()=>{const encoded=encodeState(),url=encoded?`${location.origin}${location.pathname}#s=${encoded}`:`${location.origin}${location.pathname}`,text=last?`Rescisão estimada: ${money(last.directNet)}. ${url}`:url;try{await navigator.clipboard.writeText(text);$('shareStatus').textContent='Link copiado.';if(last)window.QuantoLabAnalytics?.track?.('result_shared',{tool:TOOL,method:'copy'});setTimeout(()=>$('shareStatus').textContent='',1800);}catch{$('shareStatus').textContent='Não foi possível copiar o link.';}});
$('compartilhar').addEventListener('click',async()=>{const encoded=encodeState(),url=encoded?`${location.origin}${location.pathname}#s=${encoded}`:`${location.origin}${location.pathname}`,text=last?`Rescisão estimada: ${money(last.directNet)}`:'Calculadora de rescisão';if(navigator.share){try{await navigator.share({title:'Calculadora de rescisão',text,url});if(last)window.QuantoLabAnalytics?.track?.('result_shared',{tool:TOOL,method:'native'});}catch{}}else $('copiar').click();});
restore();result.hidden=true;
})();