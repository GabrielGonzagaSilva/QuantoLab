const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id)?.value)||0);
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v||0);
const round2=v=>Math.round((v+Number.EPSILON)*100)/100;

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

function reset(message='Preencha os dados para comparar.'){
  $('winner').textContent='—';$('diferenca').textContent='R$ 0';$('cltAno').textContent='R$ 0';$('pjAno').textContent='R$ 0';$('cltMes').textContent='R$ 0';$('pjMes').textContent='R$ 0';$('fgtsAno').textContent='R$ 0';$('pjEquivalente').textContent='R$ 0';$('status').textContent=message;
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
  const diff=Math.abs(cltAno-pjAno);

  $('winner').textContent=cltAno>pjAno?'CLT':pjAno>cltAno?'PJ':'Empate';
  $('diferenca').textContent=money(diff);
  $('cltAno').textContent=money(cltAno);
  $('pjAno').textContent=money(pjAno);
  $('cltMes').textContent=money(cltLiquidoMes);
  $('pjMes').textContent=money(pjMedio);
  $('fgtsAno').textContent=money(fgtsAno);
  $('pjEquivalente').textContent=money(equivalente);
  $('status').textContent='Comparação anual com regras de INSS e IR de 2026 no CLT. O FGTS aparece separado.';
}

function clearAll(){
  $('cltSalario').value='';$('cltBeneficios').value='0';$('dependentes').value='0';$('cltDescontos').value='0';$('cltBonus').value='0';$('pjMensal').value='';$('pjMeses').value='11';$('pjImpostos').value='10';$('pjContador').value='200';$('pjOutros').value='500';reset();
}

$('calcular').addEventListener('click',calcular);
$('limpar').addEventListener('click',clearAll);
calcular();