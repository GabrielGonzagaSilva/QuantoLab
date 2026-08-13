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
function setupHelp(){
  const form=document.querySelector('.form');
  if(!form)return;
  const old=form.querySelector('.help-details');
  if(old)old.remove();
  const tips=[
    'Quanto você quer receber no mês.',
    'Seus gastos fixos para trabalhar.',
    'Percentual descontado do total.',
    'Folga adicionada ao cálculo.',
    'Seu tempo total de trabalho por semana.',
    'Parte do tempo que realmente pode ser cobrada.',
    'Férias e períodos em que você não pretende faturar.'
  ];
  const fields=[...form.querySelectorAll('.field')];
  fields.forEach((field,index)=>{
    if(!tips[index])return;
    const label=field.querySelector('label');
    if(!label)return;
    const tip=document.createElement('span');
    tip.className='field-help';
    tip.textContent=tips[index];
    label.insertAdjacentElement('afterend',tip);
  });
  const button=document.createElement('button');
  button.type='button';
  button.className='help-inline-toggle';
  button.innerHTML='<span>Entenda os valores</span><span class="help-symbol" aria-hidden="true"></span>';
  form.prepend(button);
  let open=false;
  button.addEventListener('click',()=>{
    open=!open;
    form.querySelectorAll('.field-help').forEach(el=>el.style.display=open?'block':'none');
    button.classList.toggle('is-open',open);
  });
}
setupHelp();
document.getElementById('calcular').addEventListener('click',run);run();