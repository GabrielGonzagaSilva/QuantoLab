(()=>{
  'use strict';
  const BRL=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
  const NUM=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2});
  const MIN_WAGE_2026=1621;
  const INSS_CEILING_2026=8475.55;
  const DEPENDENT_DEDUCTION_2026=189.59;
  const SIMPLE_DEDUCTION_2026=607.20;

  const money=v=>BRL.format(Number.isFinite(v)?v:0);
  const number=v=>NUM.format(Number.isFinite(v)?v:0);
  const pct=v=>`${number(v)}%`;
  const clamp=(v,min,max)=>Math.min(Math.max(v,min),max);
  const n=(values,key,fallback=0)=>{
    const value=Number(values[key]);
    return Number.isFinite(value)?value:fallback;
  };

  function inssEmployee(salary){
    const base=clamp(Number(salary)||0,0,INSS_CEILING_2026);
    const bands=[[1621,0.075],[2902.84,0.09],[4354.27,0.12],[8475.55,0.14]];
    let prev=0,total=0;
    for(const [limit,rate] of bands){
      if(base<=prev)break;
      const taxable=Math.min(base,limit)-prev;
      if(taxable>0)total+=taxable*rate;
      prev=limit;
    }
    return Math.max(0,total);
  }

  function baseIrrfTax(base){
    const b=Math.max(0,base);
    if(b<=2428.80)return 0;
    if(b<=2826.65)return b*0.075-182.16;
    if(b<=3751.05)return b*0.15-394.16;
    if(b<=4664.68)return b*0.225-675.49;
    return b*0.275-908.73;
  }

  function irrfMonthly(gross,{inss=0,dependents=0,otherLegal=0}={}){
    const legal=Math.max(0,inss)+Math.max(0,dependents)*DEPENDENT_DEDUCTION_2026+Math.max(0,otherLegal);
    const deduction=Math.max(legal,SIMPLE_DEDUCTION_2026);
    const method=legal>=SIMPLE_DEDUCTION_2026?'Deduções legais':'Desconto simplificado mensal';
    const base=Math.max(0,gross-deduction);
    const beforeReduction=Math.max(0,baseIrrfTax(base));
    let reduction=0;
    if(gross<=5000)reduction=Math.min(beforeReduction,312.89);
    else if(gross<=7350)reduction=Math.min(beforeReduction,Math.max(0,978.62-(0.133145*gross)));
    const tax=Math.max(0,beforeReduction-reduction);
    return {tax,base,deduction,method,beforeReduction,reduction};
  }

  function salaryNet(gross,dependents=0,otherDeductions=0){
    const inss=inssEmployee(gross);
    const ir=irrfMonthly(gross,{inss,dependents});
    return {gross,inss,irrf:ir.tax,net:Math.max(0,gross-inss-ir.tax-Math.max(0,otherDeductions)),ir};
  }

  function compoundFuture(initial,monthly,annualRate,months){
    const r=Math.pow(1+Math.max(-0.99,annualRate/100),1/12)-1;
    if(Math.abs(r)<1e-12)return initial+monthly*months;
    return initial*Math.pow(1+r,months)+monthly*((Math.pow(1+r,months)-1)/r);
  }

  function cltPackageApprox(monthlyGross){
    const gross=Math.max(0,monthlyGross);
    const annualSalary=gross*12;
    const thirteenth=gross;
    const vacationBonus=gross/3;
    const fgts=(annualSalary+thirteenth+vacationBonus)*0.08;
    return annualSalary+thirteenth+vacationBonus+fgts;
  }

  function pjEquivalentClt(annualPj){
    let lo=0,hi=Math.max(5000,annualPj/8);
    while(cltPackageApprox(hi)<annualPj)hi*=1.5;
    for(let i=0;i<50;i++){
      const mid=(lo+hi)/2;
      if(cltPackageApprox(mid)<annualPj)lo=mid;else hi=mid;
    }
    return (lo+hi)/2;
  }

  const SOURCES={
    inss:['INSS — tabela de contribuição mensal 2026','https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal'],
    irrf:['Receita Federal — tributação de 2026','https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026'],
    desemprego:['FAT/MTE — Seguro-Desemprego 2026','https://portalfat.trabalho.gov.br/mte-reajusta-valores-do-beneficio-seguro-desemprego/'],
    fgts:['FGTS — recolhimento do empregado','https://www.fgts.gov.br/Paginas/subpaginas/recolhimento-empregado.aspx'],
    ferias:['FAT/MTE — férias anuais e coletivas','https://portalfat.trabalho.gov.br/programas-e-acoes-2/programa-de-protecao-do-emprego-ppe/perguntas-frequentes/ferias-anuais-e-coletivas/'],
    trabalho:['MTE — dúvidas frequentes do trabalhador','https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/proteja/duvidas-frequentes'],
    clt:['CLT compilada — art. 59','https://www.presidencia.gov.br/ccivil_03/decreto-lei/del5452compilado.htm'],
    mei:['Empresas & Negócios — DAS MEI 2026','https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/perguntas-frequentes/pagamento-da-contribuicao-mensal-carne-mensal/qual-o-valor-das-contribuicoes'],
    bcb:['Banco Central — Calculadora do Cidadão','https://www3.bcb.gov.br/CALCIDADAO/publico/corrigirPeloCDI.do?aba=5&method=corrigirPeloCDI'],
    methodology:['QuantoLab — metodologia','/metodologia']
  };

  const QL=window.QuantoLabTools={configs:{},sources:SOURCES,util:{money,number,pct,clamp,n,inssEmployee,baseIrrfTax,irrfMonthly,salaryNet,compoundFuture,cltPackageApprox,pjEquivalentClt},register(value){Object.assign(this.configs,value);}};

  function make(tag,className,text){
    const el=document.createElement(tag);
    if(className)el.className=className;
    if(text!==undefined)el.textContent=text;
    return el;
  }

  function appendInput(container,field,profile){
    const [key,labelText,type,defaultValue,prefix,suffix,step,profileKey,help,...options]=field;
    const fieldEl=make('div','field');
    const id=`tool-${key}`;
    const label=make('label','',labelText);label.htmlFor=id;
    fieldEl.appendChild(label);
    if(help)fieldEl.appendChild(make('span','field-help',help));
    const wrap=make('div','input-wrap');
    if(prefix)wrap.appendChild(make('span','prefix',prefix));
    let input;
    if(type==='select'){
      input=document.createElement('select');
      for(const pair of options){
        if(!Array.isArray(pair))continue;
        const option=document.createElement('option');option.value=pair[0];option.textContent=pair[1];input.appendChild(option);
      }
      input.value=String(defaultValue);
    }else{
      input=document.createElement('input');input.type='number';input.inputMode='decimal';input.min='0';if(step)input.step=String(step);
      const profileValue=profileKey&&profile&&profile[profileKey]!==undefined?profile[profileKey]:defaultValue;
      input.value=String(profileValue);
    }
    input.id=id;input.name=key;input.dataset.toolInput='';wrap.appendChild(input);
    if(suffix)wrap.appendChild(make('span','suffix',suffix));
    fieldEl.appendChild(wrap);container.appendChild(fieldEl);
  }

  function collect(form){
    const values={};
    for(const input of form.querySelectorAll('[data-tool-input]'))values[input.name]=input.value;
    return values;
  }

  function restoreShared(form){
    const raw=window.location.hash.startsWith('#s=')?window.location.hash.slice(3):'';
    if(!raw)return;
    try{
      const values=JSON.parse(decodeURIComponent(atob(raw)));
      for(const input of form.querySelectorAll('[data-tool-input]'))if(Object.prototype.hasOwnProperty.call(values,input.name))input.value=String(values[input.name]);
    }catch{}
  }

  function encodeShared(values){
    try{return btoa(encodeURIComponent(JSON.stringify(values)));}catch{return '';}
  }

  function renderRelated(config){
    const host=document.querySelector('[data-related-tools]');
    if(!host||!config.related)return;
    for(const [href,title] of config.related){
      const link=make('a','card decision-card');link.href=href;
      link.append(make('span','decision-card__kicker','Próxima decisão'),make('h3','',title),make('p','',`Continue a jornada com ${title.toLowerCase()}.`));
      host.appendChild(link);
    }
  }

  function mount(){
    const slug=document.body.dataset.tool;
    if(!slug||!QL.configs[slug])return;
    const config=QL.configs[slug];
    window.QuantoLabAnalytics?.track?.('tool_opened',{tool:slug});
    const form=document.querySelector('[data-tool-form]');
    const result=document.querySelector('[data-tool-result]');
    if(!form||!result)return;
    const profile=window.QuantoLabProfile?.get?.()||{};
    for(const field of config.fields)appendInput(form,field,profile);
    const actions=make('div','grid2 action-grid simple-actions');
    const calcBtn=make('button','btn','Calcular →');calcBtn.type='button';
    const clearBtn=make('button','btn btn-secondary','Limpar');clearBtn.type='button';
    actions.append(calcBtn,clearBtn);form.appendChild(actions);
    restoreShared(form);

    const headline=result.querySelector('[data-result-headline]');
    const summary=result.querySelector('[data-result-summary]');
    const rows=result.querySelector('[data-result-rows]');
    const note=result.querySelector('[data-result-note]');
    const shareBtn=document.querySelector('[data-share-result]');
    const copyBtn=document.querySelector('[data-copy-result]');
    const sourceHost=document.querySelector('[data-source]');
    if(sourceHost&&config.source){
      const [sourceTitle,sourceHref]=config.source;
      const a=make('a','',`${sourceTitle} →`);a.href=sourceHref;if(/^https?:/.test(sourceHref)){a.target='_blank';a.rel='noopener noreferrer';}
      sourceHost.append(make('span','',`Referência · atualizado em agosto de 2026`),a);
    }

    let last=null;
    const calculate=()=>{
      const values=collect(form);window.QuantoLabAnalytics?.track?.('calculation_started',{tool:slug});
      last=config.calc(values);headline.textContent=last.headline;summary.textContent=last.summary;rows.replaceChildren();
      for(const [rowLabel,value] of last.rows){const row=make('div','row');row.append(make('span','',rowLabel),make('strong','',value));rows.appendChild(row);}
      if(note){note.textContent=last.note||'';note.hidden=!last.note;}
      window.QuantoLabAnalytics?.track?.('calculation_completed',{tool:slug});
    };
    calcBtn.addEventListener('click',calculate);
    clearBtn.addEventListener('click',()=>{
      for(const input of form.querySelectorAll('[data-tool-input]')){
        if(input.tagName==='SELECT')input.selectedIndex=0;else input.value='0';
      }
      headline.textContent='—';summary.textContent='Preencha os dados para calcular.';rows.replaceChildren();if(note){note.hidden=true;note.textContent='';}last=null;
    });

    const shareText=()=>last?`${document.title.replace(' | QuantoLab','')} — ${last.headline}. ${last.summary}`:document.title;
    if(copyBtn)copyBtn.addEventListener('click',async()=>{
      const values=collect(form);const encoded=encodeShared(values);const url=encoded?`${location.origin}${location.pathname}#s=${encoded}`:`${location.origin}${location.pathname}`;
      try{await navigator.clipboard.writeText(`${shareText()} ${url}`);copyBtn.textContent='Copiado ✓';setTimeout(()=>{copyBtn.textContent='Copiar link';},1800);}catch{copyBtn.textContent='Não foi possível copiar';}
      window.QuantoLabAnalytics?.track?.('result_shared',{tool:slug,method:'copy'});
    });
    if(shareBtn)shareBtn.addEventListener('click',async()=>{
      const values=collect(form);const encoded=encodeShared(values);const url=encoded?`${location.origin}${location.pathname}#s=${encoded}`:`${location.origin}${location.pathname}`;
      if(navigator.share){try{await navigator.share({title:document.title,text:shareText(),url});window.QuantoLabAnalytics?.track?.('result_shared',{tool:slug,method:'native'});}catch{}}
      else if(copyBtn)copyBtn.click();
    });
    renderRelated(config);
    calculate();
  }

  QL.mount=mount;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else setTimeout(mount,0);
})();
