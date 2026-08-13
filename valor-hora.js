function q(id){return Number(document.getElementById(id).value)||0}
function money(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v)}
function run(){
  const a=q('renda');
  const b=q('custos');
  const c=q('impostos')/100;
  const d=q('margem')/100;
  const e=q('horas');
  const f=q('faturaveis')/100;
  const g=q('ferias');
  if(e<=0||f<=0||c>=1)return;
  const h=(52-g)/12;
  const i=e*h*f;
  const j=(a+b)/(1-c);
  const k=j/i;
  const l=k*(1+d);
  const m=l*1.2;
  document.getElementById('recomendado').textContent=money(l)+'/h';
  document.getElementById('faixa').textContent=money(l)+' — '+money(m)+'/h';
  document.getElementById('minimo').textContent=money(k)+'/h';
  document.getElementById('faturamento').textContent=money(j);
  document.getElementById('horasMes').textContent=i.toFixed(1)+' h';
  document.getElementById('projeto').textContent=money(l*20);
}
document.getElementById('calcular').addEventListener('click',run);run();