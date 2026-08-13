function n(id){return Number(document.getElementById(id).value)||0}
function m(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v)}
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