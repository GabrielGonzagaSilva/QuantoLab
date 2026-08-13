function num(id){return Number(document.getElementById(id).value)||0}
function brl(v){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2}).format(v)}
function setup(){
 document.title='Rescisão CLT | QuantoLab';
 const h=document.querySelector('h1');if(h)h.textContent='Calcule uma rescisão CLT';
 const p=document.querySelector('.lead');if(p)p.textContent='Faça uma estimativa das principais verbas de desligamento com premissas visíveis.';
 const labels=['Salário mensal','Tipo de desligamento','Dias trabalhados no último mês','Avos de 13º','Avos de férias proporcionais','Férias integrais não gozadas','Férias vencidas fora do prazo concessivo','Anos completos na empresa','Situação do aviso prévio','Dias de aviso não cumpridos','Base de FGTS para multa','Outros créditos','Outros descontos'];
 document.querySelectorAll('.field label').forEach((el,i)=>{if(labels[i])el.textContent=labels[i]});
 const tipo=document.getElementById('b');
 ['Sem justa causa','Pedido de demissão','Acordo entre as partes','Justa causa','Rescisão indireta reconhecida'].forEach((t,i)=>{if(tipo.options[i])tipo.options[i].textContent=t});
 const aviso=document.getElementById('i');
 ['Trabalhado ou não aplicável','Indenizado','Não cumprido pelo empregado'].forEach((t,i)=>{if(aviso.options[i])aviso.options[i].textContent=t});
}
function calc(){
 const salario=num('a'),tipo=num('b'),dias=Math.min(Math.max(num('c'),0),31),avos13=Math.min(Math.max(num('d'),0),12),avosFerias=Math.min(Math.max(num('e'),0),12),feriasIntegrais=Math.max(num('f'),0),feriasVencidas=Math.max(num('g'),0),anos=Math.max(num('h'),0),aviso=num('i'),diasAviso=Math.min(Math.max(num('j'),0),30),baseFgts=Math.max(num('k'),0),creditos=Math.max(num('l'),0),descontos=Math.max(num('m'),0);
 const saldo=salario/30*dias;
 const justa=tipo===4;
 const decimo=justa?0:salario*avos13/12;
 const feriasProp=justa?0:(salario*avosFerias/12)*(4/3);
 const feriasInt=salario*feriasIntegrais*(4/3);
 const feriasDobro=salario*feriasVencidas*2*(4/3);
 const diasPrevio=Math.min(30+3*Math.floor(anos),90);
 let avisoCredito=0,avisoDesconto=0;
 if(aviso===2&&(tipo===1||tipo===5))avisoCredito=salario/30*diasPrevio;
 if(aviso===2&&tipo===3)avisoCredito=(salario/30*diasPrevio)/2;
 if(aviso===3&&tipo===2)avisoDesconto=salario/30*diasAviso;
 let multaFgts=0;if(tipo===1||tipo===5)multaFgts=baseFgts*.40;if(tipo===3)multaFgts=baseFgts*.20;
 const direto=Math.max(0,saldo+decimo+feriasProp+feriasInt+feriasDobro+avisoCredito+creditos-descontos-avisoDesconto);
 const economico=direto+multaFgts;
 const out={r1:saldo,r2:decimo,r3:feriasProp,r4:feriasInt+feriasDobro,r5:avisoCredito,r6:avisoDesconto,r7:multaFgts,r8:direto,r9:economico};
 Object.entries(out).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=brl(v)});
 const notice=document.getElementById('notice');if(notice)notice.textContent='Aviso de referência: '+diasPrevio+' dias. Ajuste os avos manualmente quando houver projeção do aviso indenizado.';
}
setup();document.getElementById('calcular').addEventListener('click',calc);calc();