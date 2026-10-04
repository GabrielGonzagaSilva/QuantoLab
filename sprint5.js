(()=>{
  'use strict';

  const MOBILE_QUERY='(max-width: 767px)';
  const normalize=value=>(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const make=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};

  function readProfile(){
    try{const value=window.QuantoLabProfile?.get?.()||{};return value&&typeof value==='object'?value:{};}catch{return {};}
  }

  function mountMobileNavigation(){
    const header=document.querySelector('.header');
    const nav=header?.querySelector('.nav');
    const desktopNav=nav?.querySelector('.navlinks');
    if(!header||!nav||!desktopNav||header.querySelector('.mobile-menu-toggle'))return;

    const toggle=make('button','mobile-menu-toggle');
    toggle.type='button';
    toggle.setAttribute('aria-label','Abrir menu');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-controls','quantolab-mobile-nav');
    toggle.appendChild(make('span','mobile-menu-toggle__icon'));

    const panel=make('div','mobile-nav-panel');
    panel.id='quantolab-mobile-nav';
    panel.hidden=true;
    const inner=make('nav','mobile-nav-panel__inner');
    inner.setAttribute('aria-label','Navegação principal mobile');
    for(const source of desktopNav.querySelectorAll('a')){
      const link=source.cloneNode(true);
      link.removeAttribute('class');
      inner.appendChild(link);
    }
    if(!inner.querySelector('a[href="/meus-numeros"]')){
      const profileLink=make('a','', 'Meus números');
      profileLink.href='/meus-numeros';
      inner.appendChild(profileLink);
    }
    panel.appendChild(inner);
    nav.appendChild(toggle);
    header.appendChild(panel);

    const close=(restoreFocus=false)=>{
      if(panel.hidden)return;
      panel.hidden=true;
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Abrir menu');
      if(restoreFocus)toggle.focus();
    };
    const open=()=>{
      panel.hidden=false;
      toggle.setAttribute('aria-expanded','true');
      toggle.setAttribute('aria-label','Fechar menu');
      requestAnimationFrame(()=>panel.querySelector('a')?.focus());
    };
    toggle.addEventListener('click',()=>panel.hidden?open():close(true));
    panel.addEventListener('click',event=>{if(event.target.closest('a'))close(false);});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();close(true);}});
    document.addEventListener('click',event=>{if(!panel.hidden&&!header.contains(event.target))close(false);});
    const media=window.matchMedia(MOBILE_QUERY);
    const sync=()=>{if(!media.matches)close(false);};
    if(media.addEventListener)media.addEventListener('change',sync);else media.addListener(sync);
  }

  function mountCatalogDiscovery(){
    if(!document.body.classList.contains('catalog-page')||document.querySelector('.catalog-discovery'))return;
    const hero=document.querySelector('.catalog-hero');
    if(!hero)return;

    const section=make('section','catalog-discovery');
    section.setAttribute('aria-labelledby','catalog-discovery-title');
    const title=make('h2','catalog-discovery__heading','Encontre pela sua dúvida.');
    title.id='catalog-discovery-title';
    const intro=make('p','catalog-discovery__intro','Busque pelo nome da ferramenta ou descreva o que você precisa decidir.');

    const searchLabel=make('label','sr-only','Buscar ferramenta');
    searchLabel.htmlFor='catalog-search';
    const searchWrap=make('div','catalog-search-wrap');
    const search=document.createElement('input');
    search.id='catalog-search';
    search.className='catalog-search';
    search.type='search';
    search.placeholder='Buscar por uma dúvida ou ferramenta';
    search.autocomplete='off';
    search.setAttribute('aria-describedby','catalog-discovery-status');
    searchWrap.append(searchLabel,search);

    const chips=make('div','catalog-discovery__chips');
    chips.setAttribute('aria-label','Filtrar por contexto');
    const contexts=[['all','Todos'],['clt','CLT'],['pj','PJ'],['freelancer','Freelancer'],['financeiro','Financeiro']];
    for(const [value,label] of contexts){
      const button=make('button','filter-chip',label);
      button.type='button';
      button.dataset.catalogFilter=value;
      button.setAttribute('aria-pressed',String(value==='all'));
      chips.appendChild(button);
    }

    const shortcuts=make('div','catalog-discovery__shortcuts');
    const shortcutData=[
      ['/salario-liquido','Quanto cai na conta?'],
      ['/comparador-profissional','Vale mais CLT ou PJ?'],
      ['/valor-hora','Quanto devo cobrar?'],
      ['/reserva-emergencia','Quanto preciso guardar?']
    ];
    for(const [href,label] of shortcutData){
      const link=make('a','catalog-shortcut');link.href=href;
      link.append(document.createTextNode(label),make('span','', '→'));
      shortcuts.appendChild(link);
    }

    const status=make('p','catalog-discovery__status');
    status.id='catalog-discovery-status';
    status.setAttribute('aria-live','polite');
    section.append(title,intro,searchWrap,chips,shortcuts,status);
    hero.insertAdjacentElement('afterend',section);

    const categoryMap={'catalog-clt':'clt','catalog-pj':'pj','catalog-freela':'freelancer','catalog-financeiro':'financeiro'};
    const journeySections=[...document.querySelectorAll('.journey-section')];
    for(const journey of journeySections){
      const heading=journey.querySelector('h2[id]');
      journey.dataset.catalogCategory=categoryMap[heading?.id]||normalize(heading?.textContent);
    }

    const params=new URLSearchParams(location.search);
    let active=params.get('contexto')||'all';
    if(!contexts.some(([value])=>value===active))active='all';
    search.value=params.get('q')||'';

    const apply=(updateUrl=true)=>{
      const query=normalize(search.value);
      let count=0;
      for(const journey of journeySections){
        const category=journey.dataset.catalogCategory;
        let sectionCount=0;
        for(const card of journey.querySelectorAll('.tool-card')){
          const matchesContext=active==='all'||category===active;
          const matchesQuery=!query||normalize(card.textContent).includes(query);
          const visible=matchesContext&&matchesQuery;
          card.hidden=!visible;
          if(visible){count++;sectionCount++;}
        }
        journey.hidden=sectionCount===0;
      }
      for(const chip of chips.querySelectorAll('[data-catalog-filter]'))chip.setAttribute('aria-pressed',String(chip.dataset.catalogFilter===active));
      status.textContent=count===1?'1 ferramenta encontrada':`${count} ferramentas encontradas`;
      if(updateUrl){
        const next=new URL(location.href);
        const raw=search.value.trim();
        raw?next.searchParams.set('q',raw):next.searchParams.delete('q');
        active!=='all'?next.searchParams.set('contexto',active):next.searchParams.delete('contexto');
        history.replaceState(null,'',`${next.pathname}${next.search}${next.hash}`);
      }
    };

    let searchTimer=0;
    search.addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>apply(true),80);});
    search.addEventListener('keydown',event=>{if(event.key==='Escape'&&search.value){search.value='';apply(true);}});
    chips.addEventListener('click',event=>{
      const button=event.target.closest('[data-catalog-filter]');
      if(!button)return;
      active=button.dataset.catalogFilter;
      apply(true);
    });
    apply(false);
  }

  function connectFieldAccessibility(root=document){
    let index=0;
    for(const field of root.querySelectorAll('.field')){
      const control=field.querySelector('input,select,textarea');
      const label=field.querySelector('label');
      const helper=field.querySelector('.field-help');
      if(!control)continue;
      if(!control.id)control.id=`ql-field-${++index}`;
      if(label&&!label.htmlFor)label.htmlFor=control.id;
      if(helper){
        if(!helper.id)helper.id=`${control.id}-help`;
        const described=new Set((control.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));
        described.add(helper.id);
        control.setAttribute('aria-describedby',[...described].join(' '));
      }
      control.addEventListener('invalid',()=>control.setAttribute('aria-invalid','true'));
      control.addEventListener('input',()=>{if(control.checkValidity())control.removeAttribute('aria-invalid');});
      control.addEventListener('change',()=>{if(control.checkValidity())control.removeAttribute('aria-invalid');});
    }
    for(const result of root.querySelectorAll('[data-tool-result],.panel.result')){
      result.setAttribute('role','status');
      result.setAttribute('aria-live','polite');
      result.setAttribute('aria-atomic','false');
    }
  }

  function mountSavedReferenceNote(){
    if(!document.body.classList.contains('calculator-simple')||document.querySelector('.saved-reference-note'))return;
    const profile=readProfile();
    if(!Object.values(profile).some(value=>Number.isFinite(Number(value))))return;
    const form=document.querySelector('[data-tool-form]');
    if(!form)return;
    const note=make('div','saved-reference-note');
    note.setAttribute('role','note');
    note.append(make('span','', 'Meus números pode preencher campos compatíveis neste navegador.'));
    const link=make('a','', 'Gerenciar →');link.href='/meus-numeros';
    note.appendChild(link);
    const actions=form.querySelector('.simple-actions,.action-grid');
    actions?form.insertBefore(note,actions):form.appendChild(note);
  }

  const relatedCopy={
    '/salario-liquido':'Confira quanto fica disponível depois das retenções informadas.',
    '/inss':'Confira a contribuição previdenciária usada nas estimativas.',
    '/irrf':'Entenda a retenção mensal de imposto usada no cenário.',
    '/comparador-profissional':'Compare remuneração, benefícios e ponto de equilíbrio entre CLT e PJ.',
    '/clt-pj':'Compare remuneração, benefícios e ponto de equilíbrio entre CLT e PJ.',
    '/pj-clt-equivalente':'Converta a renda PJ em uma referência aproximada de pacote CLT.',
    '/rescisao-clt':'Estime os valores envolvidos em um encerramento de vínculo CLT.',
    '/simulador':'Estime os valores envolvidos em um encerramento de vínculo CLT.',
    '/seguro-desemprego':'Estime a faixa potencial do benefício quando aplicável.',
    '/reserva-emergencia':'Transforme despesas essenciais em meses de proteção financeira.',
    '/valor-hora':'Converta renda, custos e capacidade em uma referência de preço por hora.',
    '/preco-projeto':'Transforme tempo, custos e valor por hora em preço de projeto.',
    '/meta-faturamento':'Descubra quanto precisa entrar no mês para sustentar a renda planejada.',
    '/clientes-necessarios':'Transforme a meta mensal em uma quantidade prática de clientes.',
    '/margem-lucro':'Compare receita, custos e margem do trabalho.',
    '/juros-compostos':'Projete aportes e rentabilidade ao longo do tempo.',
    '/rendimento-cdi':'Compare a projeção com um cenário baseado no CDI.',
    '/comparar-investimentos':'Coloque dois cenários de investimento lado a lado.',
    '/metas-financeiras':'Estime o prazo para chegar a uma meta financeira.',
    '/inflacao':'Veja como a inflação altera o poder de compra no tempo.'
  };

  function refineRelatedDecisionCopy(){
    for(const card of document.querySelectorAll('.decision-card')){
      const copy=card.querySelector('p');
      if(!copy||!/^Continue com /i.test(copy.textContent.trim()))continue;
      const path=new URL(card.href,location.origin).pathname.replace(/\.html$/,'');
      if(relatedCopy[path])copy.textContent=relatedCopy[path];
    }
  }

  function initialize(){
    mountMobileNavigation();
    mountCatalogDiscovery();
    setTimeout(()=>{
      connectFieldAccessibility();
      mountSavedReferenceNote();
      refineRelatedDecisionCopy();
      document.documentElement.dataset.sprint5Ready='true';
    },0);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
