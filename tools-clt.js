(()=>{
'use strict';
const QL=window.QuantoLabTools;const {money,number,pct,clamp,n,round2,inssEmployee,irrfMonthly,irrfThirteenth,salaryNet,monthsBetween}=QL.util;const SOURCES=QL.sources;
const date=v=>v?new Date(`${v}T12:00:00`):null;
QL.register({
'salario-liquido':{
  fields:[
    ['salario','Salário bruto','number',5000,'R$','',100,'monthlyIncome','Valor registrado antes dos descontos.'],
    ['outros','Descontos','number',0,'R$','',10,null,'Inclua descontos adicionais do holerite, como pensão, plano de saúde ou coparticipação.'],
    ['dependentes','Número de dependentes','number',0,'','',1,null,'Informe dependentes considerados no Imposto de Renda da folha.']
  ],source:SOURCES.irrf,related:[['/inss','Conferir INSS'],['/irrf','Conferir IRRF'],['/comparador-profissional','Comparar CLT e PJ']],
  validate:v=>n(v,'salario')<=0?'Informe o salário bruto para calcular.':'',
  calc:v=>{const gross=n(v,'salario'),dep=Math.floor(n(v,'dependentes')),other=n(v,'outros'),r=salaryNet(gross,dep,other),inssRate=gross?r.inss/gross*100:0,irrfRate=gross?r.irrf/gross*100:0,total=r.inss+r.irrf+other;return {headline:money(r.net),summary:`Valor estimado que fica disponível depois dos descontos sobre ${money(gross)}.`,rows:[['Salário bruto',money(gross)],['Descontos adicionais',money(other)],['INSS',money(r.inss)],['IRRF',money(r.irrf)],['Total de descontos',money(total)]],table:{headers:['Evento','Alíquota efetiva','Proventos','Descontos'],rows:[['Salário bruto','',money(gross),''],['Outros','', '',money(other)],['INSS',pct(inssRate),'',money(r.inss)],['IRRF',pct(irrfRate),'',money(r.irrf)],['Totais','',money(gross),money(total)],['Salário líquido','',money(r.net),'']]}};}
},
'ferias':{
  fields:[
    ['salario','Salário bruto','number',5000,'R$','',100,'monthlyIncome','Use o salário bruto mensal.'],
    ['extras','Horas extras, média mensal','number',0,'R$','',10,null,'Informe a média de valor recebida por mês com horas extras, se houver.'],
    ['dependentes','Número de dependentes','number',0,'','',1,null,'Dependentes considerados no Imposto de Renda.'],
    ['dias','Dias de férias','number',30,'',' dias',1,null,'Informe a quantidade de dias de férias do cálculo.'],
    ['abono','Abono pecuniário, venda de 1/3','select','nao','','',null,null,'Escolha Sim se houver conversão de 1/3 das férias em dinheiro.',['nao','Não'],['sim','Sim']],
    ['adiantar13','Adiantar 1ª parcela do 13º','select','nao','','',null,null,'Escolha Sim se a primeira parcela do 13º será adiantada nas férias.',['nao','Não'],['sim','Sim']]
  ],source:SOURCES.ferias,related:[['/decimo-terceiro','Calcular 13º'],['/salario-liquido','Calcular salário líquido'],['/simulador','Simular rescisão']],
  validate:v=>n(v,'salario')<=0?'Informe o salário bruto para calcular.':n(v,'dias')<=0||n(v,'dias')>30?'Informe de 1 a 30 dias de férias.':'',
  calc:v=>{const salary=n(v,'salario'),extra=n(v,'extras'),dep=Math.floor(n(v,'dependentes')),days=clamp(n(v,'dias',30),1,30),base=salary+extra,vacation=base*(days/30),third=vacation/3,soldDays=v.abono==='sim'?days/3:0,abono=base*(soldDays/30),abonoThird=abono/3,taxable=vacation+third,inss=inssEmployee(taxable),ir=irrfMonthly(taxable,{inss,dependents:dep}),advance13=v.adiantar13==='sim'?salary/2:0,net=round2(taxable+abono+abonoThird+advance13-inss-ir.tax);return {headline:money(net),summary:`Estimativa líquida das férias para ${number(days)} dias.`,rows:[['Férias brutas',money(vacation)],['1/3 constitucional',money(third)],['Abono pecuniário',money(abono)],['1/3 do abono',money(abonoThird)],['Adiantamento do 13º',money(advance13)],['INSS',money(inss)],['IRRF',money(ir.tax)]],table:{headers:['Evento','Referência','Proventos','Descontos'],rows:[['Férias',`${number(days)} dias`,money(vacation),''],['1/3 de férias','',money(third),''],['Abono pecuniário',soldDays?`${number(soldDays)} dias`:'',money(abono),''],['1/3 do abono','',money(abonoThird),''],['Adiantamento do 13º','',money(advance13),''],['INSS','', '',money(inss)],['IRRF','', '',money(ir.tax)],['Férias líquidas','',money(net),'']]},note:'A estimativa usa as regras gerais. Convenções coletivas, médias remuneratórias e particularidades da folha podem alterar o valor.'};}
},
'decimo-terceiro':{
  fields:[
    ['salario','Salário bruto','number',5000,'R$','',100,'monthlyIncome','Use a remuneração que serve de base para o 13º.'],
    ['meses','Número de meses trabalhados','number',12,'',' meses',1,null,'Conte cada mês com 15 dias ou mais trabalhados.'],
    ['dependentes','Número de dependentes','number',0,'','',1,null,'Dependentes considerados no Imposto de Renda.'],
    ['parcela','Parcela','select','unica','','',null,null,'Escolha a parcela que deseja estimar.',['primeira','Primeira parcela'],['segunda','Segunda parcela'],['unica','Parcela única']]
  ],source:SOURCES.trabalho,related:[['/ferias','Calcular férias'],['/salario-liquido','Calcular salário líquido'],['/fgts','Estimar FGTS']],
  validate:v=>n(v,'salario')<=0?'Informe o salário bruto para calcular.':n(v,'meses')<1||n(v,'meses')>12?'Informe de 1 a 12 meses trabalhados.':'',
  calc:v=>{const salary=n(v,'salario'),months=clamp(Math.floor(n(v,'meses',12)),1,12),dep=Math.floor(n(v,'dependentes')),gross=round2(salary*months/12),tax=irrfThirteenth(gross,dep),first=round2(gross/2);let paid=0,inss=0,irrf=0,advance=0;if(v.parcela==='primeira')paid=first;else if(v.parcela==='segunda'){inss=tax.inss;irrf=tax.tax;advance=first;paid=round2(Math.max(0,gross-first-inss-irrf));}else{inss=tax.inss;irrf=tax.tax;paid=round2(Math.max(0,gross-inss-irrf));}const label=v.parcela==='primeira'?'Primeira parcela':v.parcela==='segunda'?'Segunda parcela':'Parcela única';return {headline:money(paid),summary:`${label} estimada para ${months} meses considerados.`,rows:[['13º bruto proporcional',money(gross)],['Adiantamento da primeira parcela',money(advance)],['INSS',money(inss)],['IRRF',money(irrf)]],table:{headers:['Evento','Referência','Proventos','Descontos'],rows:[['Valor bruto',`${months}/12`,money(gross),''],['Adiantamento da 1ª parcela','', '',money(advance)],['INSS','', '',money(inss)],['IRRF','', '',money(irrf)],['Valor líquido da parcela','',money(paid),'']]}};}
},
'fgts':{
  fields:[
    ['salario','Salário bruto','number',5000,'R$','',100,'monthlyIncome','Use o salário bruto mensal.'],
    ['saldo','Saldo anterior','number',0,'R$','',100,null,'Informe o saldo já existente, se quiser somá-lo à estimativa.'],
    ['inicio','Data inicial','month','2026-01','','',null,null,'Mês inicial do período.'],
    ['fim','Data final','month','2026-12','','',null,null,'Mês final do período.'],
    ['corrigido','Cálculo corrigido','checkbox',false,'','',null,null,'Quando ativado, aplica uma estimativa básica de 3% ao ano sobre o saldo. A TR não é projetada.']
  ],source:SOURCES.fgts,related:[['/simulador','Simular rescisão'],['/comparador-profissional','Comparar CLT e PJ'],['/salario-liquido','Calcular salário líquido']],
  validate:v=>n(v,'salario')<=0?'Informe o salário bruto para calcular.':!v.inicio||!v.fim?'Informe o período do cálculo.':'',
  calc:v=>{const salary=n(v,'salario'),previous=n(v,'saldo'),start=date(`${v.inicio}-01`),end=date(`${v.fim}-01`),months=monthsBetween(start,end);if(!months)return {headline:money(0),summary:'A data final precisa ser igual ou posterior à data inicial.',rows:[],table:{headers:['Item','Valor'],rows:[]}};const monthly=round2(salary*.08),regular=round2(monthly*months),thirteenth=round2(monthly*(months/12)),deposits=regular+thirteenth;let balance=previous+deposits;if(v.corrigido){const years=months/12;balance=round2(previous*Math.pow(1.03,years)+deposits*Math.pow(1.03,years/2));}const penalty=round2(balance*.40);return {headline:money(balance),summary:`Saldo estimado após ${months} competências de depósito.`,rows:[['Depósito mensal',money(monthly)],['Depósitos mensais',money(regular)],['FGTS estimado sobre 13º',money(thirteenth)],['Saldo anterior',money(previous)],['Multa de 40% como referência',money(penalty)]],table:{headers:['Item','Valor'],rows:[['Saldo anterior',money(previous)],['Depósitos do período',money(deposits)],['Saldo estimado',money(balance)],['Multa de 40%',money(penalty)],['Saldo mais multa',money(balance+penalty)]]},note:v.corrigido?'A correção é apenas uma aproximação de 3% ao ano e não inclui a TR real de cada período.':'O valor não inclui correção monetária nem distribuição de resultados do FGTS.'};}
},
'seguro-desemprego':{
  fields:[
    ['solicitacao','Já recebeu seguro desemprego','select','primeira','','',null,null,'Escolha quantas vezes o benefício já foi solicitado.',['primeira','Nunca, esta é a primeira solicitação'],['segunda','Uma vez, esta é a segunda solicitação'],['terceira','Duas vezes ou mais']],
    ['s1','Antepenúltimo salário bruto','number',3000,'R$','',100,null,'Salário bruto do terceiro mês anterior à dispensa.'],
    ['s2','Penúltimo salário bruto','number',3000,'R$','',100,null,'Salário bruto do segundo mês anterior à dispensa.'],
    ['s3','Último salário bruto','number',3000,'R$','',100,'monthlyIncome','Salário bruto do último mês antes da dispensa.'],
    ['admissao','Data de contratação','date','','','',null,null,'Data de entrada na última empresa.'],
    ['demissao','Data de demissão','date','','','',null,null,'Data do encerramento do vínculo.']
  ],source:SOURCES.desemprego,related:[['/simulador','Simular rescisão'],['/reserva-emergencia','Planejar reserva'],['/salario-liquido','Calcular salário líquido']],
  validate:v=>!v.admissao||!v.demissao?'Informe as datas de contratação e demissão.':n(v,'s3')<=0?'Informe pelo menos o último salário bruto.':'',
  calc:v=>{const salaries=[n(v,'s1'),n(v,'s2'),n(v,'s3')].filter(x=>x>0),avg=round2(salaries.reduce((a,b)=>a+b,0)/salaries.length),start=date(v.admissao),end=date(v.demissao),months=monthsBetween(start,end);let installment;if(avg<=2222.17)installment=avg*.8;else if(avg<=3703.99)installment=1777.74+(avg-2222.17)*.5;else installment=2518.65;installment=round2(clamp(installment,1621,2518.65));let parcels=0;if(v.solicitacao==='primeira'){if(months>=24)parcels=5;else if(months>=12)parcels=4;}else if(v.solicitacao==='segunda'){if(months>=24)parcels=5;else if(months>=12)parcels=4;else if(months>=9)parcels=3;}else{if(months>=24)parcels=5;else if(months>=12)parcels=4;else if(months>=6)parcels=3;}const total=round2(installment*parcels);return {headline:parcels?money(installment):'Não elegível pela faixa informada',summary:parcels?`Estimativa de ${parcels} parcelas com base nos salários e no tempo de vínculo.`:'O tempo de vínculo informado não alcança a faixa mínima desta solicitação.',rows:[['Média salarial',money(avg)],['Meses de vínculo usados na estimativa',String(months)],['Quantidade de parcelas',String(parcels)],['Valor da parcela',money(installment)],['Valor total',money(total)]],table:{headers:['Indicador','Resultado'],rows:[['Média salarial',money(avg)],['Meses trabalhados',String(months)],['Quantidade de parcelas',String(parcels)],['Valor de cada parcela',money(installment)],['Total estimado',money(total)]]},note:'A elegibilidade real depende de todos os requisitos do programa e da análise do Ministério do Trabalho e Emprego.'};}
},
'hora-extra':{
  fields:[
    ['salario','Salário base, bruto','number',5000,'R$','',100,'monthlyIncome','Use o salário bruto mensal.'],
    ['jornada','Jornada mensal, horas','number',220,'',' horas',1,null,'Informe a quantidade de horas da jornada mensal.'],
    ['normais','Horas extras normais','number',0,'',' horas',.5,null,'Horas extras com adicional de 50%.'],
    ['noturnas','Horas extras noturnas','number',0,'',' horas',.5,null,'Horas extras noturnas, com adicional noturno de 20% e hora extra de 50%.'],
    ['dobradas','Horas extras 100%','number',0,'',' horas',.5,null,'Horas remuneradas com adicional de 100%.']
  ],source:SOURCES.clt,related:[['/salario-liquido','Calcular salário líquido'],['/renda-anual','Projetar renda anual'],['/fgts','Estimar FGTS']],
  validate:v=>n(v,'salario')<=0?'Informe o salário base.':n(v,'jornada')<=0?'Informe a jornada mensal em horas.':'',
  calc:v=>{const salary=n(v,'salario'),journey=Math.max(1,n(v,'jornada')),hour=salary/journey,normalHours=n(v,'normais'),nightHours=n(v,'noturnas'),doubleHours=n(v,'dobradas'),normal=round2(hour*1.5*normalHours),night=round2(hour*1.2*1.5*nightHours),double=round2(hour*2*doubleHours),total=round2(normal+night+double);return {headline:money(total),summary:'Total bruto estimado das horas extras informadas.',rows:[['Valor da hora normal',money(hour)],['Horas extras normais',money(normal)],['Horas extras noturnas',money(night)],['Horas extras 100%',money(double)]],table:{headers:['Tipo','Horas','Valor por hora','Total'],rows:[['Normal 50%',number(normalHours),money(hour*1.5),money(normal)],['Noturna',number(nightHours),money(hour*1.2*1.5),money(night)],['100%',number(doubleHours),money(hour*2),money(double)],['Total','','',money(total)]]},note:'A conta não inclui reflexos em descanso semanal remunerado, férias, 13º ou regras específicas de convenção coletiva.'};}
},
'inss':{
  fields:[['salario','Salário bruto','number',5000,'R$','',100,'monthlyIncome','Valor do salário de contribuição do empregado.']],source:SOURCES.inss,related:[['/salario-liquido','Calcular salário líquido'],['/irrf','Calcular IRRF'],['/pro-labore','Calcular pró labore']],
  validate:v=>n(v,'salario')<=0?'Informe o salário bruto para calcular.':'',
  calc:v=>{const gross=n(v,'salario'),contribution=inssEmployee(gross),effective=gross?contribution/gross*100:0,base=Math.min(gross,8475.55);return {headline:money(contribution),summary:`Contribuição mensal estimada, alíquota efetiva de ${pct(effective)}.`,rows:[['Salário bruto',money(gross)],['Base limitada ao teto',money(base)],['Contribuição',money(contribution)],['Alíquota efetiva',pct(effective)]],table:{headers:['Indicador','Valor'],rows:[['Salário bruto',money(gross)],['Base de contribuição',money(base)],['INSS estimado',money(contribution)],['Alíquota efetiva',pct(effective)]]}};}
},
'irrf':{
  fields:[['rendimento','Rendimento tributável mensal','number',7000,'R$','',100,'monthlyIncome','Use o rendimento sujeito à incidência mensal.'],['inss','INSS descontado','number',0,'R$','',10,null,'Se deixar 0, a ferramenta estima o INSS como empregado CLT.'],['dependentes','Dependentes','number',0,'','',1,null,'Dependentes considerados para dedução na folha.']],source:SOURCES.irrf,related:[['/inss','Calcular INSS'],['/salario-liquido','Calcular salário líquido'],['/comparador-profissional','Comparar CLT e PJ']],
  validate:v=>n(v,'rendimento')<=0?'Informe o rendimento tributável.':'',
  calc:v=>{const gross=n(v,'rendimento'),informed=n(v,'inss'),inss=informed>0?informed:inssEmployee(gross),r=irrfMonthly(gross,{inss,dependents:n(v,'dependentes')});return {headline:money(r.tax),summary:'IRRF mensal estimado com a tabela e a redução vigentes em 2026.',rows:[['INSS considerado',money(inss)],['Base de cálculo',money(r.base)],['Método de dedução',r.method],['Imposto antes da redução',money(r.beforeReduction)],['Redução 2026',money(r.reduction)]],table:{headers:['Indicador','Valor'],rows:[['Rendimento tributável',money(gross)],['INSS considerado',money(inss)],['Base do IRRF',money(r.base)],['Imposto antes da redução',money(r.beforeReduction)],['Redução de 2026',money(r.reduction)],['IRRF estimado',money(r.tax)]]}};}
}
});
})();