const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id)?.value)||0);
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v||0);

function reset(message='Preencha os dados para calcular.'){
  $('principal').textContent='R$ 0';$('base').textContent='R$ 0';$('custosResultado').textContent='R$ 0';$('reservaResultado').textContent='R$ 0';$('complexidadeResultado').textContent='R$ 0';$('entrada').textContent='R$ 0';$('status').textContent=message;
}

function run(){
  const valorHora=num('valorHora');
  const horas=num('horas');
  const custos=num('custos');
  const revisoes=num('revisoes')/100;
  const complexidade=num('complexidade')/100;
  if(!valorHora||!horas){reset('Informe seu valor por hora e o tempo previsto.');return;}

  const base=valorHora*horas;
  const reserva=base*revisoes;
  const extraComplexidade=base*complexidade;
  const final=base+custos+reserva+extraComplexidade;

  $('principal').textContent=money(final);
  $('base').textContent=money(base);
  $('custosResultado').textContent=money(custos);
  $('reservaResultado').textContent=money(reserva);
  $('complexidadeResultado').textContent=money(extraComplexidade);
  $('entrada').textContent=money(final*.5);
  $('status').textContent='Resultado formado somente pelos valores e percentuais informados.';
}

function clearAll(){
  $('valorHora').value='';$('horas').value='';$('custos').value='0';$('revisoes').value='15';$('complexidade').value='0';reset();
}

$('calcular').addEventListener('click',run);
$('limpar').addEventListener('click',clearAll);
run();