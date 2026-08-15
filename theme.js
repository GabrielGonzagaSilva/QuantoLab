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

  function mountUI(){
    mountToggle();
    mountFooterMeta();
  }

  applyTheme();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountUI,{once:true});
  else mountUI();

  const onSystemChange=()=>{if(selected==='system')applyTheme();};
  if(typeof media.addEventListener==='function')media.addEventListener('change',onSystemChange);
  else if(typeof media.addListener==='function')media.addListener(onSystemChange);
})();
