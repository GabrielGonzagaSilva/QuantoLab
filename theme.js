(()=>{
  'use strict';

  const STORAGE_KEY='quantolab-theme';
  const TERMS_KEY='quantolab-terms-v2026-08-16';
  const PROFILE_KEY='quantolab-profile-v1';
  const root=document.documentElement;
  const compactBrandMedia=window.matchMedia('(max-width:700px)');
  const WORDMARK_SRC='/quantolab-logo.svg';
  const COMPACT_MARK_SRC='/brand/mark-black.svg';
  const FAVICON_SRC='/favicon-20260905.svg';
  const DARK_ONLY_STYLES='/dark-only.css';
  let typographyObserver=null;

  const globalStyles=document.querySelector('link[href="/platform.css"]');
  if(!globalStyles){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='/platform.css';
    document.head.appendChild(link);
  }

  if(!document.querySelector(`link[href="${DARK_ONLY_STYLES}"]`)){
    const darkOnly=document.createElement('link');
    darkOnly.rel='stylesheet';
    darkOnly.href=DARK_ONLY_STYLES;
    document.head.appendChild(darkOnly);
  }

  function normalizeFavicon(){
    const icons=[...document.querySelectorAll('link[rel~="icon"]')];
    let favicon=icons[0]||null;
    for(const candidate of icons.slice(1))candidate.remove();
    if(!favicon){favicon=document.createElement('link');favicon.rel='icon';document.head.appendChild(favicon);}
    favicon.rel='icon';favicon.type='image/svg+xml';favicon.href=FAVICON_SRC;favicon.removeAttribute('sizes');
  }

  function syncHeaderBrand(){
    const compact=compactBrandMedia.matches;
    for(const image of document.querySelectorAll('.header .brand img')){
      const nextSrc=compact?COMPACT_MARK_SRC:WORDMARK_SRC;
      if(image.getAttribute('src')!==nextSrc)image.setAttribute('src',nextSrc);
      image.setAttribute('width',compact?'78':'334');
      image.setAttribute('height',compact?'75':'48');
      if(compact){image.style.width='40px';image.style.height='auto';}
      else{image.style.removeProperty('width');image.style.removeProperty('height');}
    }
  }

  normalizeFavicon();

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

  function applyTheme(){
    root.dataset.theme='dark';
    root.dataset.resolvedTheme='dark';
    root.style.colorScheme='dark';
    storageSet(STORAGE_KEY,'dark');
    const themeColor=document.querySelector('meta[name="theme-color"]');
    if(themeColor)themeColor.setAttribute('content','#101012');
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

    const region=make('aside','terms-consent');
    region.setAttribute('role','region');
    region.setAttribute('aria-labelledby','terms-consent-title');
    region.setAttribute('aria-describedby','terms-consent-desc');

    const panel=make('div','terms-consent__dialog');
    const eyebrow=make('span','terms-consent__eyebrow','Uso responsável');
    const title=make('h2','', 'Antes de usar as ferramentas');title.id='terms-consent-title';
    const desc=make('p','', 'O QuantoLab oferece estimativas informativas. Você pode continuar usando o produto enquanto consulta os Termos de uso e a Política de privacidade.');desc.id='terms-consent-desc';

    const links=make('div','terms-consent__links');
    const terms=make('a','', 'Ler Termos de uso');terms.href='/termos';terms.target='_blank';terms.rel='noopener';
    const privacy=make('a','', 'Ler Política de privacidade');privacy.href='/politica-de-privacidade';privacy.target='_blank';privacy.rel='noopener';
    links.append(terms,privacy);

    const local=make('p','terms-consent__local','Nenhum dado das calculadoras é enviado ao aceitar. A preferência fica salva apenas neste navegador.');
    const status=make('p','terms-consent__status','O aviso não bloqueia o uso do produto.');
    const accept=make('button','btn','Li e aceito os termos');accept.type='button';accept.dataset.acceptTerms='';

    panel.append(eyebrow,title,desc,links,local,status,accept);
    region.appendChild(panel);
    document.body.insertBefore(region,document.body.firstChild);

    accept.addEventListener('click',()=>{
      storageSet(TERMS_KEY,'accepted');
      region.remove();
      window.QuantoLabAnalytics?.track?.('terms_accepted',{version:'2026-08-16',mode:'non_blocking'});
      try{window.dispatchEvent(new CustomEvent('quantolab:terms-accepted'));}catch{}
    },{once:true});
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

  function mountUI(){normalizeSiteTypography();syncHeaderBrand();mountFooterMeta();mountDecisionSupport();mountTermsConsent();window.QuantoLabAnalytics?.track?.('page_view');}

  applyTheme();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountUI,{once:true});else mountUI();
  const onBrandLayoutChange=()=>syncHeaderBrand();if(typeof compactBrandMedia.addEventListener==='function')compactBrandMedia.addEventListener('change',onBrandLayoutChange);else if(typeof compactBrandMedia.addListener==='function')compactBrandMedia.addListener(onBrandLayoutChange);
})();