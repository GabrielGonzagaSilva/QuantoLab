(()=>{
  'use strict';

  const root=document.documentElement;
  const ANALYTICS_SRC='/_vercel/insights/script.js';
  const SPEED_SRC='/_vercel/speed-insights/script.js';
  const SAFE_KEYS=new Set(['path','tool','context','destination','results','source','version','mode','fields','action','viewport']);
  let analyticsMounted=false;
  let searchTimer=0;
  let lastRun={tool:'',at:0};

  function productPath(value=location.pathname){
    let path=String(value||'/').replace(/\.html$/,'');
    if(path==='/index')path='/';
    return path||'/';
  }

  function hostedRuntime(){
    const host=location.hostname.toLowerCase();
    return location.protocol==='https:'&&(host==='quantolab.com.br'||host==='www.quantolab.com.br'||host.endsWith('.vercel.app'));
  }

  function safeData(properties={}){
    const output={};
    for(const [key,value] of Object.entries(properties)){
      if(!SAFE_KEYS.has(key)||value===undefined||value===null)continue;
      if(typeof value==='string')output[key]=value.slice(0,96);
      else if(typeof value==='number'&&Number.isFinite(value))output[key]=value;
      else if(typeof value==='boolean')output[key]=value;
      if(Object.keys(output).length>=8)break;
    }
    if(!output.path)output.path=productPath();
    return output;
  }

  function loadFirstPartyScript(src,id,label){
    if(document.getElementById(id))return;
    const script=document.createElement('script');
    script.id=id;
    script.src=src;
    script.defer=true;
    script.dataset.qlTelemetry=label;
    script.addEventListener('load',()=>{root.dataset[label]='ready';},{once:true});
    script.addEventListener('error',()=>{root.dataset[label]='unavailable';},{once:true});
    document.head.appendChild(script);
  }

  function mountTelemetry(){
    if(analyticsMounted||!hostedRuntime()||!window.QuantoLabConsent?.analyticsAllowed?.())return;
    analyticsMounted=true;
    root.dataset.telemetry='enabled';

    window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};
    window.va('beforeSend',event=>{
      try{
        const cleanUrl=new URL(event.url,location.origin);
        cleanUrl.search='';
        cleanUrl.hash='';
        return {...event,url:cleanUrl.toString()};
      }catch{return event;}
    });

    window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments);};
    loadFirstPartyScript(ANALYTICS_SRC,'ql-vercel-analytics','analytics');
    loadFirstPartyScript(SPEED_SRC,'ql-vercel-speed','speedInsights');
  }

  function sendProductEvent(name,properties={}){
    if(name==='page_view'||typeof window.va!=='function'||!analyticsMounted)return;
    window.va('event',{name:`ql_${String(name).replace(/[^a-z0-9_]+/gi,'_').toLowerCase()}`,data:safeData(properties)});
  }

  function track(name,properties={}){
    window.QuantoLabAnalytics?.track?.(name,properties);
  }

  function hrefPath(element){
    try{return productPath(new URL(element.href,location.origin).pathname);}catch{return '';}
  }

  function currentTool(){
    return document.body.dataset.tool||document.querySelector('[data-tool]')?.getAttribute('data-tool')||productPath().replace(/^\//,'')||'home';
  }

  function instrumentClicks(){
    document.addEventListener('click',event=>{
      const target=event.target instanceof Element?event.target:null;
      if(!target)return;

      const filter=target.closest('[data-catalog-filter]');
      if(filter)track('catalog_filter',{context:filter.getAttribute('data-catalog-filter')||'all'});

      const shortcut=target.closest('.catalog-shortcut');
      if(shortcut)track('decision_shortcut_opened',{destination:hrefPath(shortcut),source:'catalog'});

      const decision=target.closest('.decision-card');
      if(decision)track('next_decision_opened',{destination:hrefPath(decision),source:'calculator'});

      const toolCard=target.closest('.tool-card');
      if(toolCard)track('tool_opened',{tool:hrefPath(toolCard).replace(/^\//,''),source:'catalog'});

      const savedReference=target.closest('.saved-reference-note a');
      if(savedReference)track('saved_reference_manage',{source:'calculator'});

      const menuToggle=target.closest('.mobile-menu-toggle');
      if(menuToggle&&menuToggle.getAttribute('aria-expanded')==='true')track('mobile_menu_opened',{viewport:innerWidth});

      const calculate=target.closest('#calcular,[data-tool-calculate],[data-calculate]');
      if(calculate){
        const tool=currentTool();
        const now=Date.now();
        if(lastRun.tool!==tool||now-lastRun.at>300){lastRun={tool,at:now};track('calculator_run',{tool,action:'calculate'});}
      }
    });

    document.addEventListener('submit',event=>{
      const form=event.target instanceof HTMLFormElement?event.target:null;
      if(!form||!document.body.classList.contains('calculator-simple'))return;
      const tool=currentTool();
      const now=Date.now();
      if(lastRun.tool===tool&&now-lastRun.at<=300)return;
      lastRun={tool,at:now};
      track('calculator_run',{tool,action:'submit'});
    });
  }

  function instrumentCatalogSearch(){
    document.addEventListener('input',event=>{
      const search=event.target instanceof HTMLInputElement&&event.target.matches('.catalog-search')?event.target:null;
      if(!search)return;
      clearTimeout(searchTimer);
      searchTimer=setTimeout(()=>{
        const results=document.querySelectorAll('.tool-card:not([hidden])').length;
        const context=document.querySelector('[data-catalog-filter][aria-pressed="true"]')?.getAttribute('data-catalog-filter')||'all';
        track('catalog_search',{results,context});
      },700);
    });
  }

  function instrumentClientErrors(){
    window.addEventListener('error',event=>{
      if(event.target!==window)return;
      track('client_error',{source:'window'});
    });
    window.addEventListener('unhandledrejection',()=>track('client_error',{source:'promise'}));
  }

  function initialize(){
    window.addEventListener('quantolab:event',event=>{
      const detail=event.detail||{};
      sendProductEvent(detail.name,detail.properties||{});
    });
    window.addEventListener('quantolab:terms-accepted',mountTelemetry);
    instrumentClicks();
    instrumentCatalogSearch();
    instrumentClientErrors();
    mountTelemetry();
    root.dataset.sprint6Ready='true';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
