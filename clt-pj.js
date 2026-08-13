function n(id){return Number(document.getElementById(id).value)||0}
function m(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v)}
const labels=['Valor mensal CLT','Benefícios mensais','Bônus anual','Considerar 13º?','Considerar 1/3 de férias?','Valor mensal PJ','Meses faturados no ano','Taxas estimadas','Custos mensais PJ'];
document.title='CLT x PJ | QuantoLab';
const title=document.querySelector('h1');if(title)title.textContent='CLT x PJ';
const lead=document.querySelector('.lead');if(lead)lead.textContent='Compare os dois formatos usando os valores reais da sua proposta.';
document.querySelectorAll('.field label').forEach((el,i)=>{if(labels[i])el.textContent=labels[i]});
const resultLabels=document.querySelectorAll('.result-body .row span');if(resultLabels[0])resultLabels[0].textContent='CLT anual estimado';if(resultLabels[1])resultLabels[1].textContent='PJ anual estimado';
const hi=document.querySelector('.highlight span');if(hi)hi.textContent='PJ mensal para empatar';
function calcular(){
 const a=n('a'),b=n('b'),c=n('c'),d=n('d'),e=n('e'),f=n('f'),g=n('g'),h=n('h'),i=n('i');
 const clt=a*12+b*12+c+(d?a:0)+(e?a/3:0);
 const pj=(f*g)*(1-h/100)-i*12;
 const diff=Math.abs(clt-pj);
 const eq=g>0&&h<100?((clt+i*12)/(1-h/100))/g:0;
 document.getElementById('r1').textContent=m(clt);
 document.getElementById('r2').textContent=m(pj);
 document.getElementById('r3').textContent=m(diff);
 document.getElementById('r4').textContent=m(eq);
 document.getElementById('winner').textContent=clt>pj?'CLT':pj>clt?'PJ':'Empate';
}
document.getElementById('calcular').addEventListener('click',calcular);calcular();