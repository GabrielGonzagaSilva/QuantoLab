(()=>{
'use strict';
function mount(){
  if(!window.QuantoLabProfile)return;
  const map={monthlyIncome:'profileMonthlyIncome',monthlyCosts:'profileMonthlyCosts',hoursDay:'profileHoursDay',daysWeek:'profileDaysWeek',taxRate:'profileTaxRate',reserveMonths:'profileReserveMonths'};
  const saved=window.QuantoLabProfile.get();
  for(const [key,id] of Object.entries(map)){const el=document.getElementById(id);if(el&&saved[key]!==undefined)el.value=String(saved[key]);}
  const status=document.getElementById('profileStatus');
  document.getElementById('profileSave')?.addEventListener('click',()=>{const next={};for(const [key,id] of Object.entries(map)){const el=document.getElementById(id);if(el&&el.value!=='')next[key]=Number(el.value);}window.QuantoLabProfile.set(next);if(status)status.textContent='Referências salvas apenas neste navegador.';window.QuantoLabAnalytics?.track?.('profile_saved',{fields:Object.keys(next).length});});
  document.getElementById('profileClear')?.addEventListener('click',()=>{window.QuantoLabProfile.clear();for(const id of Object.values(map)){const el=document.getElementById(id);if(el)el.value='';}if(status)status.textContent='Referências removidas deste navegador.';window.QuantoLabAnalytics?.track?.('profile_cleared');});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
