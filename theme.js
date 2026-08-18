(()=>{
  'use strict';

  const STORAGE_KEY='quantolab-theme';
  const TERMS_KEY='quantolab-terms-v2026-08-16';
  const PROFILE_KEY='quantolab-profile-v1';
  const THEMES=['system','light','dark'];
  const root=document.documentElement;
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  let selected='system';
  let button=null;
  let icon=null;
  let label=null;
  let typographyObserver=null;

  const globalStyles=document.querySelector('link[href="/platform.css"]');
  if(!globalStyles){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/platform.css';
    document.head.appendChild(link);
  }

  const decisionSupport={
    '/valor-hora':{
      auditLabel:'Como chegamos neste resultado',reference:'Modelo de estimativa de precificação',updated:'Atualizado em agosto de 2026',
      intro:'Agora use esse valor para transformar sua referência por hora em uma decisão prática.',
      related:[['/preco-projeto','Calcular preço de projeto','Transforme seu valor por hora em um preço para um trabalho específico.'],['/meta-faturamento','Descobrir sua meta mensal','Veja quanto precisa entrar no mês para chegar à renda que você quer.'],['/clt-pj','Comparar CLT e PJ','Use seus números para avaliar uma mudança de modelo de trabalho.']]
    },
    '/preco-projeto':{
      auditLabel:'Como chegamos neste resultado',reference:'Modelo de estimativa de projeto',updated:'Atualizado em agosto de 2026',
      intro:'Se o preço ainda não parece sustentável, volte um passo ou confira a meta que ele precisa ajudar a atingir.',
      related:[['/valor-hora','Revisar seu valor por hora','Confira se a base usada no projeto representa sua renda e seu tempo.'],['/meta-faturamento','Calcular sua meta mensal','Descubra quanto seus projetos precisam gerar ao longo do mês.'],['/margem-lucro','Conferir margem do trabalho','Veja quanto sobra depois dos custos.']]
    },
    '/meta-faturamento':{
      auditLabel:'Como chegamos neste resultado',reference:'Modelo de estimativa de faturamento',updated:'Atualizado em agosto de 2026',
      intro:'Transforme a meta em decisões menores de preço e capacidade de trabalho.',
      related:[['/valor-hora','Descobrir seu valor por hora','Converta a meta mensal em uma referência de preço pelo seu tempo.'],['/preco-projeto','Calcular preço de projeto','Veja quanto um projeto precisa valer dentro da sua meta.'],['/clientes-necessarios','Calcular clientes necessários','Transforme a meta em uma quantidade prática de clientes.']]
    },
    '/comparador-profissional':null,
    '/clt-pj':{
      auditLabel:'Como chegamos nesta comparação',reference:'Referência 2026 · INSS e IRRF conforme metodologia',updated:'Atualizado em agosto de 2026',
      intro:'Use a comparação para aprofundar apenas o cenário que realmente pode mudar sua decisão.',
      related:[['/rescisao-clt','Estimar uma rescisão CLT','Se a mudança envolve sair de um emprego, estime o valor do desligamento.'],['/pj-clt-equivalente','Converter PJ em CLT equivalente','Veja a referência de pacote anual em sentido inverso.'],['/salario-liquido','Calcular salário líquido','Entenda o valor disponível no cenário CLT.']]
    },
    '/simulador':null,
    '/rescisao-clt':{
      auditLabel:'Como chegamos neste resultado',reference:'Referência 2026 · regras trabalhistas e tributárias descritas na metodologia',updated:'Atualizado em agosto de 2026',
      intro:'Depois de entender a saída, compare os próximos cenários de renda sem misturar decisões diferentes.',
      related:[['/clt-pj','Comparar CLT e PJ','Avalie uma nova proposta usando remuneração anual e ponto de equilíbrio.'],['/seguro-desemprego','Estimar seguro-desemprego','Veja a faixa potencial do benefício quando aplicável.'],['/reserva-emergencia','Planejar uma reserva','Transforme o valor disponível em meses de proteção.']]
    }
  };
  decisionSupport['/comparador-profissional']=decisionSupport['/clt-pj'];
  decisionSupport['/simulador']=decisionSupport['/rescisao-clt'];

  function storageGet(key){try{return localStorage.getItem(key);}catch{return null;}}
  function storageSet(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
  function storageRemove(key){try{localStorage.removeItem(key);}catch{}}

  try{const saved=storageGet(STORAGE_KEY);if(THEMES.includes(saved))selected=saved;}catch{}

  const resolvedTheme=()=>selected==='system'?(media.matches?'dark':'light'):selected;
  const nextTheme=()=>THEMES[(THEMES.indexOf(selected)+1)%THEMES.length];
  const names={system:'Sistema',light:'Claro',dark:'Escuro'};
  const icons={system:'◐',light:'☀',dark:'☾'};

  function updateButton(){
    if(!button||!icon||!label)return;
    const next=nextTheme();icon.textContent=icons[selected];label.textContent=names[selected];
    const description=`Tema: ${names[selected].toLowerCase()}. Clique para usar ${names[next].toLowerCase()}.`;
    button.setAttribute('aria-label',description);button.title=description;
  }

  function applyTheme(){
    const resolved=resolvedTheme();root.dataset.theme=selected;root.dataset.resolvedTheme=resolved;root.style.colorScheme=resolved;
    const themeColor=document.querySelector('meta[name="theme-color"]');if(themeColor)themeColor.setAttribute('content',resolved==='dark'?'#101012':'#D9FF66');updateButton();
  }

  function saveTheme(){storageSet(STORAGE_KEY,selected);}

  function mountToggle(){
    const nav=document.querySelector('.header .nav');if(!nav||nav.querySelector('.theme-toggle'))return;
    button=document.createElement('button');button.type='button';button.className='theme-toggle';if(!nav.querySelector('.navlinks'))button.classList.add('theme-toggle--solo');
    icon=document.createElement('span');icon.className='theme-toggle__icon';icon.setAttribute('aria-hidden','true');
    label=document.createElement('span');label.className='theme-toggle__label';button.append(icon,label);
    button.addEventListener('click',()=>{selected=nextTheme();saveTheme();applyTheme();});nav.appendChild(button);updateButton();
  }

  function mountFooterMeta(){
    const footer=document.querySelector('.footer');const shell=footer?.querySelector('.shell');if(!shell||shell.querySelector('.footer-meta'))return;
    const meta=document.createElement('div');meta.className='footer-meta';meta.setAttribute('aria-label','Informações legais');
    const copyright=document.createElement('small');copyright.className='footer-meta__copyright';copyright.textContent=`© ${new Date().getFullYear()} QuantoLab. Todos os direitos reservados.`;
    const disclaimer=document.createElement('small');disclaimer.className='footer-meta__disclaimer';disclaimer.textContent='As ferramentas e conteúdos têm caráter informativo e fornecem estimativas. Não substituem orientação profissional.';
    meta.append(copyright,disclaimer);shell.appendChild(meta);
  }

  function currentProductPath(){let path=window.location.pathname.replace(/\.html$/,'');if(path==='/index')path='/';return path;}

  function relatedCard([href,title,description]){
    const card=document.createElement('a');card.className='card decision-card';card.href=href;
    const kicker=document.createElement('span');kicker.className='decision-card__kicker';kicker.textContent='Próxima decisão';
    const heading=document.createElement('h3');heading.textContent=title;const copy=document.createElement('p');copy.textContent=description;card.append(kicker,heading,copy);return card;
  }

  function mountDecisionSupport(){
    if(!document.body.classList.contains('calculator-simple'))return;
    const config=decisionSupport[currentProductPath()];const article=document.querySelector('.article');if(!config||!article||document.querySelector('.next-decision'))return;
    const resultSummary=document.querySelector('.result-details > summary');if(resultSummary)resultSummary.textContent=config.auditLabel;
    const source=document.createElement('div');source.className='source-note';source.setAttribute('role','note');
    const sourceText=document.createElement('span');sourceText.textContent=`${config.reference} · ${config.updated}`;
    const sourceLink=document.createElement('a');sourceLink.href='/metodologia';sourceLink.textContent='Fontes e premissas →';source.append(sourceText,sourceLink);
    const section=document.createElement('section');section.className='next-decision';section.setAttribute('aria-labelledby','next-decision-title');
    const head=document.createElement('div');head.className='next-decision__head';const eyebrow=document.createElement('span');eyebrow.className='eyebrow';eyebrow.textContent='Continue sua jornada';
    const title=document.createElement('h2');title.id='next-decision-title';title.textContent='Qual é a próxima decisão?';const intro=document.createElement('p');intro.textContent=config.intro;head.append(eyebrow,title,intro);
    const grid=document.createElement('div');grid.className='card-grid decision-grid';for(const item of config.related)grid.appendChild(relatedCard(item));section.append(head,grid);article.after(source,section);
  }

  function mountAdvertising(){
    if(!/(^|\.)quantolab\.com\.br$/i.test(window.location.hostname))return;
    const mount=()=>{
      if(document.querySelector('script[data-adsterra-loader]'))return;
      const slots=[...document.querySelectorAll('[data-ad-slot]')].filter(slot=>slot.dataset.adPriority!=='low');
      if(!slots.length)return;
      const slot=slots.find(item=>/after(?:-tool|-tools)?$/.test(item.dataset.adSlot||''))||slots.find(item=>item.classList.contains('ad--content'))||slots.find(item=>item.dataset.adPriority==='high')||slots[0];
      const box=slot.querySelector('.ad-box');if(!box)return;
      let wrapper=slot.parentElement;
      if(!wrapper?.classList.contains('ads-ready')){
        wrapper=document.createElement('div');wrapper.className='ads-ready';slot.before(wrapper);wrapper.appendChild(slot);
      }
      slot.dataset.adProvider='adsterra';slot.dataset.adFormat='native-banner';
      const container=document.createElement('div');container.id='container-4df7857eeb5d00d170c72cf4a5eb2aec';box.replaceChildren(container);
      const script=document.createElement('script');script.dataset.adsterraLoader='native-banner';script.async=true;script.setAttribute('data-cfasync','false');script.src='https://pl30913530.effectivecpmnetwork.com/4df7857eeb5d00d170c72cf4a5eb2aec/invoke.js';
      script.addEventListener('load',()=>window.QuantoLabAnalytics?.track?.('ad_script_loaded',{provider:'adsterra',format:'native_banner'}),{once:true});
      script.addEventListener('error',()=>{wrapper?.remove();},{once:true});
      document.head.appendChild(script);
    };
    if(storageGet(TERMS_KEY)==='accepted')mount();
    else window.addEventListener('quantolab:terms-accepted',mount,{once:true});
  }

  function make(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}

  function cleanVisibleText(value){
    if(!value||!/[—–]/.test(value))return value;
    if(/^[\s—–]+$/.test(value))return value.replace(/[—–]/g,'…');
    return value
      .replace(/\s*[—–]\s+(e|ou)\s+/gi,' $1 ')
      .replace(/\s*[—–]\s*/g,': ');
  }

  function cleanMetadataText(value){
    if(!value||!/[—–]/.test(value))return value;
    return value.replace(/\s*[—–]\s*/g,' | ');
  }

  function sanitizeElementAttributes(element){
    if(!(element instanceof Element)||element.closest('[data-ad-provider]'))return;
    for(const attr of ['title','aria-label','placeholder','alt']){
      const value=element.getAttribute(attr);
      const cleaned=cleanVisibleText(value);
      if(value&&cleaned!==value)element.setAttribute(attr,cleaned);
    }
  }

  function sanitizeTextNode(node){
    if(node.nodeType!==Node.TEXT_NODE)return;
    const parent=node.parentElement;
    if(!parent||parent.closest('script,style,code,pre,svg,[data-ad-provider]'))return;
    const cleaned=cleanVisibleText(node.nodeValue);
    if(cleaned!==node.nodeValue)node.nodeValue=cleaned;
  }

  function sanitizeSubtree(rootNode){
    if(rootNode.nodeType===Node.TEXT_NODE){sanitizeTextNode(rootNode);return;}
    if(!(rootNode instanceof Element)&&rootNode!==document.body)return;
    if(rootNode instanceof Element)sanitizeElementAttributes(rootNode);
    const walker=document.createTreeWalker(rootNode,NodeFilter.SHOW_TEXT);
    let node;while((node=walker.nextNode()))sanitizeTextNode(node);
    if(rootNode.querySelectorAll)for(const element of rootNode.querySelectorAll('[title],[aria-label],[placeholder],[alt]'))sanitizeElementAttributes(element);
  }

  function normalizeSiteTypography(){
    document.title=cleanMetadataText(document.title);
    for(const selector of ['meta[property="og:title"]','meta[property="og:description"]','meta[name="description"]']){
      for(const meta of document.querySelectorAll(selector)){
        const value=meta.getAttribute('content');
        const cleaned=cleanMetadataText(value);
        if(value&&cleaned!==value)meta.setAttribute('content',cleaned);
      }
    }
    sanitizeSubtree(document.body);
    if(typographyObserver)typographyObserver.disconnect();
    typographyObserver=new MutationObserver(records=>{
      for(const record of records){
        if(record.type==='characterData')sanitizeTextNode(record.target);
        for(const node of record.addedNodes)sanitizeSubtree(node);
      }
    });
    typographyObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
  }

  function mountTermsConsent(){
    const path=currentProductPath();
    if(path==='/termos'||path==='/politica-de-privacidade'||storageGet(TERMS_KEY)==='accepted')return;
    if(document.querySelector('.terms-consent'))return;
    const overlay=make('div','terms-consent');
    const dialog=make('section','terms-consent__dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','terms-consent-title');dialog.setAttribute('aria-describedby','terms-consent-desc');
    const eyebrow=make('span','eyebrow','Antes de continuar');
    const title=make('h2','', 'Termos de uso e privacidade');title.id='terms-consent-title';
    const desc=make('p','', 'O QuantoLab fornece estimativas informativas. Ao continuar, você confirma que leu e aceita os Termos de uso e a Política de privacidade.');desc.id='terms-consent-desc';
    const links=make('div','terms-consent__links');
    const terms=make('a','', 'Ler Termos de uso');terms.href='/termos';terms.target='_blank';terms.rel='noopener';
    const privacy=make('a','', 'Ler Política de privacidade');privacy.href='/politica-de-privacidade';privacy.target='_blank';privacy.rel='noopener';links.append(terms,privacy);
    const local=make('p','terms-consent__local','Sua aceitação e preferências opcionais são salvas apenas neste navegador.');
    const accept=make('button','btn','Aceitar e continuar');accept.type='button';accept.dataset.acceptTerms='';
    dialog.append(eyebrow,title,desc,links,local,accept);overlay.appendChild(dialog);document.body.appendChild(overlay);document.body.classList.add('terms-consent-open');
    const focusables=[terms,privacy,accept];
    const trap=event=>{
      if(event.key==='Escape'){event.preventDefault();accept.focus();return;}
      if(event.key!=='Tab')return;
      const first=focusables[0],last=focusables[focusables.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    dialog.addEventListener('keydown',trap);
    accept.addEventListener('click',()=>{
      storageSet(TERMS_KEY,'accepted');overlay.remove();document.body.classList.remove('terms-consent-open');
      window.QuantoLabAnalytics?.track?.('terms_accepted',{version:'2026-08-16'});
      try{window.dispatchEvent(new CustomEvent('quantolab:terms-accepted'));}catch{}
    },{once:true});
    setTimeout(()=>accept.focus(),0);
  }

  window.QuantoLabProfile={
    get(){try{const raw=storageGet(PROFILE_KEY);const parsed=raw?JSON.parse(raw):{};return parsed&&typeof parsed==='object'?parsed:{};}catch{return {}; }},
    set(value){const safe={};for(const key of ['monthlyIncome','monthlyCosts','hoursDay','daysWeek','taxRate','reserveMonths'])if(Number.isFinite(Number(value?.[key])))safe[key]=Number(value[key]);storageSet(PROFILE_KEY,JSON.stringify(safe));return safe;},
    clear(){storageRemove(PROFILE_KEY);}
  };

  window.QuantoLabAnalytics={
    track(name,properties={}){
      const detail={name,properties:{...properties,path:currentProductPath()},at:new Date().toISOString()};
      try{window.dispatchEvent(new CustomEvent('quantolab:event',{detail}));}catch{}
      if(Array.isArray(window.dataLayer))window.dataLayer.push({event:`ql_${name}`,...detail.properties});
    }
  };

  function mountUI(){normalizeSiteTypography();mountToggle();mountFooterMeta();mountDecisionSupport();mountTermsConsent();mountAdvertising();window.QuantoLabAnalytics?.track?.('page_view');}

  applyTheme();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountUI,{once:true});else mountUI();
  const onSystemChange=()=>{if(selected==='system')applyTheme();};if(typeof media.addEventListener==='function')media.addEventListener('change',onSystemChange);else if(typeof media.addListener==='function')media.addListener(onSystemChange);
})();
