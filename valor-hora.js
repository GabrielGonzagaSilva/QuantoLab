const $=id=>document.getElementById(id);
const num=id=>Math.max(0,Number($(id)?.value)||0);
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(v||0);
const TOOL='valor-hora';

globalThis.QuantoLabAnalytics?.track?.('tool_opened',{tool:TOOL});

function reset(message='Preencha os dados para calcular.'){
  $('recomendado').textContent='R$ 0/h';
  $('faturamento').textContent='R$ 0';
  $('minimo').textContent='R$ 0/h';
  $('horasMes').textContent='0 h';
  $('diaria').textContent='R$ 0';
  $('projeto').textContent='R$ 0';
  $('status').textContent=message;
}

function run(trackEvent=true){
  const renda=num('renda');
  const custos=num('custos');
  const horasDia=num('horasDia');
  const diasSemana=num('diasSemana');
  const ferias=Math.min(num('ferias'),51);
  const naoFaturavel=Math.min(num('naoFaturavel'),95)/100;
  const impostos=Math.min(num('impostos'),95)/100;
  const margem=num('margem')/100;

  if(!renda||!horasDia||!diasSemana){reset('Informe quanto quer receber e sua rotina de trabalho.');return;}
  if(impostos>=.95||naoFaturavel>=.95){reset('Revise os percentuais dos ajustes opcionais.');return;}

  const semanasTrabalho=Math.max(1,52-ferias);
  const horasAno=horasDia*diasSemana*semanasTrabalho;
  const horasCobraveisAno=horasAno*(1-naoFaturavel);
  const horasCobraveisMes=horasCobraveisAno/12;
  if(horasCobraveisMes<=0){reset('Não há horas disponíveis para cobrar com esses dados.');return;}

  if(trackEvent)globalThis.QuantoLabAnalytics?.track?.('calculation_started',{tool:TOOL});
  const entradaMinimaMes=(renda+custos)/(1-impostos);
  const valorMinimo=entradaMinimaMes/horasCobraveisMes;
  const valorSugerido=valorMinimo*(1+margem);
  const entradaSugeridaMes=valorSugerido*horasCobraveisMes;

  $('recomendado').textContent=money(valorSugerido)+'/h';
  $('faturamento').textContent=money(entradaSugeridaMes);
  $('minimo').textContent=money(valorMinimo)+'/h';
  $('horasMes').textContent=horasCobraveisMes.toFixed(1).replace('.',',')+' h';
  $('diaria').textContent=money(valorSugerido*horasDia);
  $('projeto').textContent=money(valorSugerido*20);
  const hasAdjustments=ferias>0||naoFaturavel>0||impostos>0||margem>0;
  $('status').textContent=hasAdjustments?'Estimativa com os ajustes opcionais que você informou.':'Estimativa básica. Use os ajustes opcionais se quiser refinar.';
  if(trackEvent)globalThis.QuantoLabAnalytics?.track?.('calculation_completed',{tool:TOOL});
}

function clearAll(){
  $('renda').value='';$('custos').value='0';$('horasDia').value='8';$('diasSemana').value='5';$('ferias').value='0';$('naoFaturavel').value='0';$('impostos').value='0';$('margem').value='0';reset();
}

$('calcular').addEventListener('click',()=>run(true));
$('limpar').addEventListener('click',clearAll);
run(false);