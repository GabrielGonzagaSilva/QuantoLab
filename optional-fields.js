(()=>{
  const controls=[...document.querySelectorAll('[data-optional-target]')];

  function sync(control,{remember=true}={}){
    const targetId=control.dataset.optionalTarget;
    const input=document.getElementById(targetId);
    const valueWrap=document.querySelector(`[data-optional-value="${targetId}"]`);
    const dependents=[...document.querySelectorAll(`[data-optional-dependent="${targetId}"]`)];
    if(!input||!valueWrap)return;

    const shouldInform=control.value==='informar';
    dependents.forEach(item=>{item.hidden=!shouldInform;});

    if(shouldInform){
      input.disabled=false;
      valueWrap.hidden=false;
      if((input.value===''||input.value==='0')&&input.dataset.optionalPrevious){
        input.value=input.dataset.optionalPrevious;
      }
      return;
    }

    if(remember&&input.value&&input.value!=='0')input.dataset.optionalPrevious=input.value;
    input.value='0';
    input.disabled=true;
    valueWrap.hidden=true;
  }

  controls.forEach(control=>{
    sync(control,{remember:false});
    control.addEventListener('change',()=>sync(control));
  });

  const clearButton=document.getElementById('limpar');
  if(clearButton){
    clearButton.addEventListener('click',()=>{
      controls.forEach(control=>{
        control.value='ignorar';
        const input=document.getElementById(control.dataset.optionalTarget);
        if(input)input.dataset.optionalPrevious='';
        sync(control,{remember:false});
      });
    });
  }
})();