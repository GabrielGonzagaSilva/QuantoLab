(()=>{
  'use strict';

  const STORAGE_KEY='quantolab-theme';
  const THEMES=['system','light','dark'];
  const root=document.documentElement;
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  let selected='system';
  let button=null;
  let icon=null;
  let label=null;

  const decisionSupport={
    '/valor-hora':{
      auditLabel:'Como chegamos neste resultado',
      reference:'Modelo de estimativa de precificação',
      updated:'Atualizado em agosto de 2026',
      intro:'Agora use esse valor para transformar sua referência por hora em uma decisão prática.',
      related:[
        ['/preco-projeto','Calcular preço de projeto','Transforme seu valor por hora em um preço para um trabalho específico.'],
        ['/meta-faturamento','Descobrir sua meta mensal','Veja quanto precisa entrar no mês para chegar à renda que você quer.'],
        ['/comparador-profissional','Comparar CLT e PJ','Use seus números para avaliar uma mudança de modelo de trabalho.']
      ]
    },
    '/preco-projeto':{
      auditLabel:'Como chegamos neste resultado',
      reference:'Modelo de estimativa de projeto',
      updated:'Atualizado em agosto de 2026',
      intro:'Se o preço ainda não parece sustentável, volte um passo ou confira a meta que ele precisa ajudar a atingir.',
      related:[
        ['/valor-hora','Revisar seu valor por hora','Confira se a base usada no projeto representa sua renda e seu tempo.'],
        ['/meta-faturamento','Calcular sua meta mensal','Descubra quanto seus projetos precisam gerar ao longo do mês.']
      ]
    },
    '/meta-faturamento':{
      auditLabel:'Como chegamos neste resultado',
      reference:'Modelo de estimativa de faturamento',
      updated:'Atualizado em agosto de 2026',
      intro:'Transforme a meta em decisões menores de preço e capacidade de trabalho.',
      related:[
        ['/valor-hora','Descobrir seu valor por hora','Converta a meta mensal em uma referência de preço pelo seu tempo.'],
        ['/preco-projeto','Calcular preço de projeto','Veja quanto um projeto precisa valer dentro da sua meta.']
      ]
    },
    '/comparador-profissional':{
      auditLabel:'Como chegamos nesta comparação',
      reference:'Referência 2026 · INSS e IRRF conforme metodologia',
      updated:'Atualizado em agosto de 2026',
      intro:'Use a comparação para aprofundar apenas o cenário que realmente pode mudar sua decisão.',
      related:[
        ['/simulador','Estimar uma rescisão CLT','Se a mudança envolve sair de um emprego, estime o valor do desligamento.'],
        ['/meta-faturamento','Planejar uma meta como PJ','Veja quanto precisa entrar por mês para sustentar sua renda desejada.'],
        ['/valor-hora','Calcular quanto vale sua hora','Transforme sua meta de renda em referência para prestação de serviços.']
      ]
    },
    '/simulador':{
      auditLabel:'Como chegamos neste resultado',
      reference:'Referência 2026 · regras trabalhistas e tributárias descritas na metodologia',
      updated:'Atualizado em agosto de 2026',
      intro:'Depois de entender a saída, compare os próximos cenários de renda sem misturar decisões diferentes.',
      related:[
        ['/comparador-profissional','Comparar CLT e PJ','Avalie uma nova proposta usando remuneração anual e ponto de equilíbrio.'],
        ['/meta-faturamento','Planejar sua próxima meta mensal','Organize quanto precisa entrar se estiver migrando para trabalho independente.'],
        ['/valor-hora','Descobrir seu valor por hora','Crie uma referência de preço caso comece a prestar serviços.']
      ]
    }
  };

  try{
    const saved=localStorage.getItem(STORAGE_KEY);
    if(THEMES.includes(saved))selected=saved;
  }catch{}

  const resolvedTheme=()=>selected==='system'?(media.matches?'dark':'light'):selected;
  const nextTheme=()=>THEMES[(THEMES.indexOf(selected)+1)%THEMES.length];
  const names={system:'Sistema',light:'Claro',dark:'Escuro'};
  const icons={system:'◐',light:'☀',dark:'☾'};

  function updateButton(){
    if(!button||!icon||!label)return;
    const next=nextTheme();
    icon.textContent=icons[selected];
    label.textContent=names[selected];
    const description=`Tema: ${names[selected].toLowerCase()}. Clique para usar ${names[next].toLowerCase()}.`;
    button.setAttribute('aria-label',description);
    button.title=description;
  }

  function applyTheme(){
    const resolved=resolvedTheme();
    root.dataset.theme=selected;
    root.dataset.resolvedTheme=resolved;
    root.style.colorScheme=resolved;
    const themeColor=document.querySelector('meta[name="theme-color"]');
    if(themeColor)themeColor.setAttribute('content',resolved==='dark'?'#101012':'#D9FF66');
    updateButton();
  }

  function saveTheme(){
    try{localStorage.setItem(STORAGE_KEY,selected);}catch{}
  }

  function mountToggle(){
    const nav=document.querySelector('.header .nav');
    if(!nav||nav.querySelector('.theme-toggle'))return;

    button=document.createElement('button');
    button.type='button';
    button.className='theme-toggle';
    if(!nav.querySelector('.navlinks'))button.classList.add('theme-toggle--solo');

    icon=document.createElement('span');
    icon.className='theme-toggle__icon';
    icon.setAttribute('aria-hidden','true');

    label=document.createElement('span');
    label.className='theme-toggle__label';

    button.append(icon,label);
    button.addEventListener('click',()=>{
      selected=nextTheme();
      saveTheme();
      applyTheme();
    });
    nav.appendChild(button);
    updateButton();
  }

  function mountFooterMeta(){
    const footer=document.querySelector('.footer');
    const shell=footer?.querySelector('.shell');
    if(!shell||shell.querySelector('.footer-meta'))return;

    const meta=document.createElement('div');
    meta.className='footer-meta';
    meta.setAttribute('aria-label','Informações legais');

    const copyright=document.createElement('small');
    copyright.className='footer-meta__copyright';
    copyright.textContent=`© ${new Date().getFullYear()} QuantoLab. Todos os direitos reservados.`;

    const disclaimer=document.createElement('small');
    disclaimer.className='footer-meta__disclaimer';
    disclaimer.textContent='As ferramentas e conteúdos têm caráter informativo e fornecem estimativas. Não substituem orientação profissional.';

    meta.append(copyright,disclaimer);
    shell.appendChild(meta);
  }

  function currentProductPath(){
    let path=window.location.pathname.replace(/\.html$/,'');
    if(path==='/index')path='/';
    return path;
  }

  function relatedCard([href,title,description]){
    const card=document.createElement('a');
    card.className='card decision-card';
    card.href=href;

    const kicker=document.createElement('span');
    kicker.className='decision-card__kicker';
    kicker.textContent='Próxima decisão';

    const heading=document.createElement('h3');
    heading.textContent=title;

    const copy=document.createElement('p');
    copy.textContent=description;

    card.append(kicker,heading,copy);
    return card;
  }

  function mountDecisionSupport(){
    if(!document.body.classList.contains('calculator-simple'))return;
    const config=decisionSupport[currentProductPath()];
    const article=document.querySelector('.article');
    if(!config||!article||document.querySelector('.next-decision'))return;

    const resultSummary=document.querySelector('.result-details > summary');
    if(resultSummary)resultSummary.textContent=config.auditLabel;

    const source=document.createElement('div');
    source.className='source-note';
    source.setAttribute('role','note');

    const sourceText=document.createElement('span');
    sourceText.textContent=`${config.reference} · ${config.updated}`;

    const sourceLink=document.createElement('a');
    sourceLink.href='/metodologia';
    sourceLink.textContent='Fontes e premissas →';

    source.append(sourceText,sourceLink);

    const section=document.createElement('section');
    section.className='next-decision';
    section.setAttribute('aria-labelledby','next-decision-title');

    const head=document.createElement('div');
    head.className='next-decision__head';

    const eyebrow=document.createElement('span');
    eyebrow.className='eyebrow';
    eyebrow.textContent='Continue sua jornada';

    const title=document.createElement('h2');
    title.id='next-decision-title';
    title.textContent='Qual é a próxima decisão?';

    const intro=document.createElement('p');
    intro.textContent=config.intro;

    head.append(eyebrow,title,intro);

    const grid=document.createElement('div');
    grid.className='card-grid decision-grid';
    for(const item of config.related)grid.appendChild(relatedCard(item));

    section.append(head,grid);
    article.after(source,section);
  }

  function mountUI(){
    mountToggle();
    mountFooterMeta();
    mountDecisionSupport();
  }

  applyTheme();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountUI,{once:true});
  else mountUI();

  const onSystemChange=()=>{if(selected==='system')applyTheme();};
  if(typeof media.addEventListener==='function')media.addEventListener('change',onSystemChange);
  else if(typeof media.addListener==='function')media.addListener(onSystemChange);
})();
