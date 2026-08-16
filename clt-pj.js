const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id)?.value)||0);
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v||0);
const percent=v=>`${new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(v||0)}%`;
const round2=v=>Math.round((v+Number.EPSILON)*100)/100;
const setText=(id,value)=>{const el=$(id);if(el)el.textContent=value;};

function inss2026(base){
  base=Math.min(Math.max(0,base),8475.55);
  const bands=[[1621,0.075],[2902.84,0.09],[4354.27,0.12],[8475.55,0.14]];
  let prev=0,total=0;
  for(const [limit,rate] of bands){if(base<=prev)break;const part=Math.min(base,limit)-prev;if(part>0)total+=part*rate;prev=limit;}
  return round2(total);
}
function irTable2026(base){if(base<=2428.80)return 0;if(base<=2826.65)return base*.075-182.16;if(base<=3751.05)return base*.15-394.16;if(base<=4664.68)return base*.225-675.49;return base*.275-908.73;}
function applyReduction2026(gross,tax){if(gross<=5000)return 0;if(gross<=7350)return round2(Math.max(0,tax-Math.min(tax,Math.max(0,978.62-.133145*gross))));return round2(Math.max(0,tax));}
function irrfMonthly2026(gross,inss,dependents){if(gross<=0)return 0;const legal=inss+dependents*189.59;const deduction=Math.max(legal,607.20);const base=Math.max(0,gross-deduction);return applyReduction2026(gross,Math.max(0,irTable2026(base)));}
function irrf13_2026(gross,inss,dependents){if(gross<=0)return 0;const base=Math.max(0,gross-inss-dependents*189.59);return applyReduction2026(gross,Math.max(0,irTable2026(base)));}

function updateScenarioState(value){
  for(const button of document.querySelectorAll('[data-pj-value]')){
    button.setAttribute('aria-pressed',Number(button.dataset.pjValue)===Number(value)?'true':'false');
  }
}

function reset(message='Preencha os dados para comparar.'){
  setText('winner','—');setText('diferenca','R$ 0');setText('difMensal','R$ 0');setText('difPercentual','0%');setText('cltAno','R$ 0');setText('pjAno','R$ 0');setText('cltMes','R$ 0');setText('pjMes','R$ 0');setText('fgtsAno','R$ 0');setText('pjEquivalente','R$ 0');setText('status',message);
}

function calcular(){
  const salario=num('cltSalario');
  const beneficios=num('cltBeneficios');
  const dependentes=Math.floor(num('dependentes'));
  const descontosClt=num('cltDescontos');
  const bonus=num('cltBonus');
  const pjMensal=num('pjMensal');
  const pjMeses=Math.min(12,Math.max(1,Math.floor(num('pjMeses')||1)));
  const pjImpostos=Math.min(num('pjImpostos'),95)/100;
  const contador=num('pjContador');
  const outrosPj=num('pjOutros');

  updateScenarioState(pjMensal);
  if(!salario||!pjMensal){reset('Informe os valores mensais das duas propostas.');return;}
  if(pjImpostos>=.95){reset('Revise o percentual de impostos do PJ.');return;}

  const inssMes=inss2026(salario);
  const irMes=irrfMonthly2026(salario,inssMes,dependentes);
  const cltLiquidoMes=Math.max(0,salario-inssMes-irMes-descontosClt);

  const inss13=inss2026(salario);
  const ir13=irrf13_2026(salario,inss13,dependentes);
  const decimoLiquido=Math.max(0,salario-inss13-ir13);

  const feriasBrutas=salario*4/3;
  const inssFerias=inss2026(feriasBrutas);
  const irFerias=irrfMonthly2026(feriasBrutas,inssFerias,dependentes);
  const feriasLiquidas=Math.max(0,feriasBrutas-inssFerias-irFerias);
  const mesNormalSemOutrosDescontos=Math.max(0,salario-inssMes-irMes);
  const extraFerias=Math.max(0,feriasLiquidas-mesNormalSemOutrosDescontos);

  const cltAno=cltLiquidoMes*12+beneficios*12+decimoLiquido+extraFerias+bonus;
  const fgtsAno=(salario*13+salario/3)*.08;

  const custosPjAno=(contador+outrosPj)*12;
  const pjAno=Math.max(0,pjMensal*pjMeses*(1-pjImpostos)-custosPjAno);
  const pjMedio=pjAno/12;
  const equivalente=(cltAno+custosPjAno)/(pjMeses*(1-pjImpostos));
  const diff=Math.abs(pjAno-cltAno);
  const diffMensal=diff/12;
  const winner=cltAno>pjAno?'CLT':pjAno>cltAno?'PJ':'Empate';
  const comparisonBase=winner==='PJ'?cltAno:winner==='CLT'?pjAno:Math.max(cltAno,pjAno);
  const diffPct=comparisonBase>0?diff/comparisonBase*100:0;

  setText('winner',winner);
  setText('diferenca',money(diff));
  setText('difMensal',money(diffMensal));
  setText('difPercentual',percent(diffPct));
  setText('cltAno',money(cltAno));
  setText('pjAno',money(pjAno));
  setText('cltMes',money(cltLiquidoMes));
  setText('pjMes',money(pjMedio));
  setText('fgtsAno',money(fgtsAno));
  setText('pjEquivalente',money(equivalente));
  setText('status',winner==='Empate'?'As duas propostas ficam praticamente iguais nesta estimativa.':`A proposta ${winner} é aproximadamente ${percent(diffPct)} melhor financeiramente e deixa ${money(diff)} a mais disponível no ano.`);
}

function clearAll(){
  $('cltSalario').value='';$('cltBeneficios').value='0';$('dependentes').value='0';$('cltDescontos').value='0';$('cltBonus').value='0';$('pjMensal').value='';$('pjMeses').value='12';$('pjImpostos').value='0';$('pjContador').value='0';$('pjOutros').value='0';updateScenarioState(0);reset();
}

$('calcular').addEventListener('click',calcular);
$('limpar').addEventListener('click',clearAll);
$('pjMensal').addEventListener('input',()=>updateScenarioState(num('pjMensal')));
for(const button of document.querySelectorAll('[data-pj-value]')){
  button.addEventListener('click',()=>{
    $('pjMensal').value=button.dataset.pjValue;
    calcular();
  });
}
calcular();