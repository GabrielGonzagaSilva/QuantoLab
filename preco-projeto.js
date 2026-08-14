function v(i){return Number(document.getElementById(i).value)||0}
function f(n){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n)}
function r(){let x=v('a')*v('b');let y=x*((v('c')+v('d')+v('e'))/100);let z=x+y;document.getElementById('principal').textContent=f(z);document.getElementById('base').textContent=f(x);document.getElementById('extra').textContent=f(y);document.getElementById('final').textContent=f(z)}
function setupHelp(){
  const form=document.querySelector('.form');
  if(!form)return;
  const old=form.querySelector('.help-details');
  if(old)old.remove();
  const tips=[
    'Quanto você cobra por uma hora do seu trabalho.',
    'Tempo total que você acha que vai gastar no projeto.',
    'Valor extra para mudanças e rodadas de feedback.',
    'Reserva para gastos que não estão nas horas de trabalho.',
    'Reserva para imprevistos e mudanças no projeto.'
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
document.getElementById('calcular').addEventListener('click',r);r();