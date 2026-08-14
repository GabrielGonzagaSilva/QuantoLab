const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id)?.value)||0);
const brl=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
const round2=v=>Math.round((v+Number.EPSILON)*100)/100;

function parseDate(id){const value=$(id)?.value;if(!value)return null;const [y,m,d]=value.split('-').map(Number);return new Date(y,m-1,d,12);}
function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d;}
function addMonths(date,months){const d=new Date(date);const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+months);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,last));return d;}
function diffDays(a,b){return Math.floor((b-a)/86400000)+1;}
function fullYears(a,b){let y=b.getFullYear()-a.getFullYear();if(b.getMonth()<a.getMonth()||(b.getMonth()===a.getMonth()&&b.getDate()<a.getDate()))y--;return Math.max(0,y);}
function noticeDays(admission,end){const years=fullYears(admission,end);return Math.min(90,30+years*3);}
function overlapDays(a1,a2,b1,b2){const start=new Date(Math.max(a1,b1));const end=new Date(Math.min(a2,b2));return end<start?0:diffDays(start,end);}

function thirteenthMonths(admission,termination,projectedEnd){
  let total=0;
  for(let year=termination.getFullYear();year<=projectedEnd.getFullYear();year++){
    for(let month=0;month<12;month++){
      const start=new Date(year,month,1,12),end=new Date(year,month+1,0,12);
      if(start>projectedEnd)break;
      if(overlapDays(admission,projectedEnd,start,end)>=15)total++;
    }
  }
  return total;
}
function vacationMonths(admission,end){
  let start=new Date(end.getFullYear(),admission.getMonth(),admission.getDate(),12);
  if(start>end)start.setFullYear(start.getFullYear()-1);
  if(start<admission)start=new Date(admission);
  let total=0;
  for(let i=0;i<12;i++){
    const a=addMonths(start,i),next=addMonths(start,i+1),b=addDays(next,-1);
    if(a>end)break;
    if(overlapDays(admission,end,a,b)>=15)total++;
  }
  return Math.min(12,total);
}

function inss2026(base){base=Math.min(Math.max(0,base),8475.55);const bands=[[1621,0.075],[2902.84,0.09],[4354.27,0.12],[8475.55,0.14]];let prev=0,total=0;for(const [limit,rate] of bands){if(base<=prev)break;const part=Math.min(base,limit)-prev;if(part>0)total+=part*rate;prev=limit;}return round2(total);}
function irTable2026(base){if(base<=2428.80)return 0;if(base<=2826.65)return base*.075-182.16;if(base<=3751.05)return base*.15-394.16;if(base<=4664.68)return base*.225-675.49;return base*.275-908.73;}
function applyReduction2026(gross,tax){if(gross<=5000)return 0;if(gross<=7350)return round2(Math.max(0,tax-Math.min(tax,Math.max(0,978.62-.133145*gross))));return round2(Math.max(0,tax));}
function irrfMensal2026(gross,inss,dependents){if(gross<=0)return 0;const legal=inss+dependents*189.59;const deduction=Math.max(legal,607.20);const base=Math.max(0,gross-deduction);return applyReduction2026(gross,Math.max(0,irTable2026(base)));}
function irrf13_2026(gross,inss,dependents){if(gross<=0)return 0;const base=Math.max(0,gross-inss-dependents*189.59);return applyReduction2026(gross,Math.max(0,irTable2026(base)));}

function resetResults(message='Preencha os dados para calcular.'){
  $('totalLiquido').textContent='R$ 0,00';$('notice').textContent=message;
  ['rSaldo','rAviso','rDecimo','rFeriasProp','rFeriasVencidas','rOutras','rFgtsRescisao','rMultaFgts','rSaqueFgts'].forEach(id=>$(id).textContent='R$ 0,00');
  ['rInss','rIrrf','rDescontos'].forEach(id=>$(id).textContent='− R$ 0,00');
}

function calc(){
  const admission=parseDate('admissao'),end=parseDate('desligamento'),salary=num('salario');
  if(!admission||!end||!salary){resetResults('Informe as datas e o salário para calcular.');return;}
  if(end<admission){resetResults('A data de saída precisa ser posterior à data de entrada.');return;}
  if(end.getFullYear()!==2026){resetResults('Esta versão usa as tabelas de 2026. Informe uma data de saída em 2026.');return;}

  const type=$('tipo').value,notice=$('aviso').value;
  const nDays=noticeDays(admission,end);
  let projectedEnd=new Date(end),noticeCredit=0,noticeDiscount=0;
  if(notice==='indenizado'&&(type==='sem_justa'||type==='indireta')){noticeCredit=salary/30*nDays;projectedEnd=addDays(end,nDays);}
  if(notice==='indenizado'&&type==='acordo'){noticeCredit=salary/30*nDays*.5;projectedEnd=addDays(end,Math.ceil(nDays*.5));}
  if(notice==='descontado'&&type==='pedido')noticeDiscount=salary;

  const monthStart=new Date(end.getFullYear(),end.getMonth(),1,12),effectiveStart=admission>monthStart?admission:monthStart;
  let workedDays=Math.max(0,diffDays(effectiveStart,end));
  const divisor=$('divisorSaldo').value==='calendario'?new Date(end.getFullYear(),end.getMonth()+1,0).getDate():30;
  if(divisor===30)workedDays=Math.min(workedDays,30);
  const salaryBalance=salary/divisor*workedDays;

  const justCause=type==='justa';
  const m13=justCause?0:thirteenthMonths(admission,end,projectedEnd);
  const mVac=justCause?0:vacationMonths(admission,projectedEnd);
  const gross13=justCause?0:salary*m13/12;
  const advance13=$('decimoAdiantado').value==='sim'?num('valorDecimoAdiantado'):0;
  const thirteenth=Math.max(0,gross13-Math.min(advance13,gross13));
  const proportionalVacation=justCause?0:(salary*mVac/12)*(4/3);
  const vacationPeriods=$('feriasVencidas').value==='sim'?Math.floor(num('periodosFerias')):0;
  const completedVacation=salary*vacationPeriods*(4/3);

  const otherIncome=num('outrasVerbas'),otherTaxable=$('naturezaOutras').value==='remuneratoria';
  const otherDiscounts=num('outrosDescontos'),dependents=Math.floor(num('dependentes'));
  const regularTaxable=salaryBalance+(otherTaxable?otherIncome:0);
  const inssRegular=inss2026(regularTaxable),inss13=inss2026(gross13);
  const irRegular=irrfMensal2026(regularTaxable,inssRegular,dependents),ir13=irrf13_2026(gross13,inss13,dependents);
  const totalInss=inssRegular+inss13,totalIrrf=irRegular+ir13;

  const fgtsBase=salaryBalance+thirteenth+noticeCredit+(otherTaxable?otherIncome:0);
  const fgtsTermination=round2(fgtsBase*.08),informedFgts=num('saldoFgts'),penaltyBase=informedFgts+fgtsTermination;
  const saqueAniversario=$('saqueAniversario')?.value==='sim';
  let fgtsPenalty=0,withdrawal=0;
  if(type==='sem_justa'||type==='indireta'){
    fgtsPenalty=penaltyBase*.40;
    withdrawal=saqueAniversario?0:penaltyBase;
  }else if(type==='acordo'){
    fgtsPenalty=penaltyBase*.20;
    withdrawal=saqueAniversario?0:penaltyBase*.80;
  }else if(type==='prazo'){
    withdrawal=penaltyBase;
  }
  fgtsPenalty=round2(fgtsPenalty);withdrawal=round2(withdrawal);

  const grossPay=salaryBalance+noticeCredit+thirteenth+proportionalVacation+completedVacation+otherIncome;
  const deductions=noticeDiscount+totalInss+totalIrrf+otherDiscounts;
  const net=Math.max(0,round2(grossPay-deductions));

  $('totalLiquido').textContent=brl(net);$('rSaldo').textContent=brl(salaryBalance);
  $('rAviso').textContent=noticeDiscount?('− '+brl(noticeDiscount)):brl(noticeCredit);
  $('rDecimo').textContent=brl(thirteenth);$('rFeriasProp').textContent=brl(proportionalVacation);$('rFeriasVencidas').textContent=brl(completedVacation);$('rOutras').textContent=brl(otherIncome);
  $('rInss').textContent='− '+brl(totalInss);$('rIrrf').textContent='− '+brl(totalIrrf);$('rDescontos').textContent='− '+brl(otherDiscounts);
  $('rFgtsRescisao').textContent=brl(fgtsTermination);$('rMultaFgts').textContent=brl(fgtsPenalty);$('rSaqueFgts').textContent=brl(withdrawal);
  const saqueMsg=saqueAniversario&&(type==='sem_justa'||type==='indireta'||type==='acordo')?' · saque-aniversário: saldo não foi somado como saque disponível':'';
  $('notice').textContent=`13º: ${m13} mês(es) · férias proporcionais: ${mVac} mês(es) · aviso de referência: ${nDays} dias${saqueMsg}. FGTS e multa ficam separados do valor líquido acima.`;
}

function setSuggestedNotice(){const type=$('tipo').value;if(type==='sem_justa'||type==='indireta'||type==='acordo')$('aviso').value='indenizado';else if(type==='pedido')$('aviso').value='trabalhado';else $('aviso').value='nao_aplica';}
function syncFields(){const hasVacation=$('feriasVencidas').value==='sim';$('periodosFerias').disabled=!hasVacation;if(!hasVacation)$('periodosFerias').value=0;const has13=$('decimoAdiantado').value==='sim';$('valorDecimoAdiantado').disabled=!has13;if(!has13)$('valorDecimoAdiantado').value=0;}
function clearAll(){document.querySelectorAll('#rescisao-form input').forEach(el=>{if(el.type==='checkbox')el.checked=false;else el.value='';});$('divisorSaldo').value='30';$('tipo').value='sem_justa';$('aviso').value='indenizado';$('feriasVencidas').value='nao';$('periodosFerias').value=0;$('decimoAdiantado').value='nao';$('valorDecimoAdiantado').value=0;$('dependentes').value=0;$('outrasVerbas').value=0;$('naturezaOutras').value='remuneratoria';$('outrosDescontos').value=0;$('saldoFgts').value=0;if($('saqueAniversario'))$('saqueAniversario').value='nao';syncFields();resetResults();}

$('calcular').addEventListener('click',calc);$('limpar').addEventListener('click',clearAll);$('tipo').addEventListener('change',()=>{setSuggestedNotice();calc();});$('feriasVencidas').addEventListener('change',syncFields);$('decimoAdiantado').addEventListener('change',syncFields);syncFields();resetResults();