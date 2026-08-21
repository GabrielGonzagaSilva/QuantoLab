const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id)?.value)||0);
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v||0);
const TOOL='meta-faturamento';

window.QuantoLabAnalytics?.track?.('tool_opened',{tool:TOOL});

function reset(message='Preencha os dados para calcular.'){
  $('principal').textContent='R$ 0';$('porProjeto').textContent='R$ 0';$('porSemana').textContent='R$ 0';$('porAno').textContent='R$ 0';$('pontoEquilibrio').textContent='R$ 0';$('status').textContent=message;
}

function run(trackEvent=true){
  const renda=num('renda');
  const custos=num('custos');
  const impostos=num('impostos')/100;
  const reserva=num('reserva')/100;
  const projetos=Math.max(1,Math.floor(num('projetos')||1));
  const sobra=1-impostos-reserva;

  if(!renda){reset('Informe quanto você quer ter para você no mês.');return;}
  if(sobra<=.05){reset('Impostos e reserva estão altos demais. Revise os percentuais.');return;}

  if(trackEvent)window.QuantoLabAnalytics?.track?.('calculation_started',{tool:TOOL});
  const meta=(renda+custos)/sobra;
  const equilibrio=custos/sobra;

  $('principal').textContent=money(meta);
  $('porProjeto').textContent=money(meta/projetos);
  $('porSemana').textContent=money(meta/4.345);
  $('porAno').textContent=money(meta*12);
  $('pontoEquilibrio').textContent=money(equilibrio);
  $('status').textContent=reserva>0?'Meta com a reserva opcional que você informou.':'Meta mensal com seus gastos e impostos.';
  if(trackEvent)window.QuantoLabAnalytics?.track?.('calculation_completed',{tool:TOOL});
}

function clearAll(){
  $('renda').value='';$('custos').value='1500';$('impostos').value='12';$('reserva').value='0';$('projetos').value='4';reset();
}

$('calcular').addEventListener('click',()=>run(true));
$('limpar').addEventListener('click',clearAll);
run(false);