(()=>{
  'use strict';
  const input=document.getElementById('home-salary-input');
  const net=document.getElementById('home-salary-net');
  const inss=document.getElementById('home-salary-inss');
  const irrf=document.getElementById('home-salary-irrf');
  const rate=document.getElementById('home-salary-rate');
  const meter=document.getElementById('home-salary-meter');
  const util=window.QuantoLabTools?.util;
  if(!input||!util)return;
  const render=()=>{
    const gross=Math.max(0,Number(input.value)||0);
    const result=util.salaryNet(gross,0,0);
    const retained=gross?((result.inss+result.irrf)/gross)*100:0;
    net.textContent=util.money(result.net);
    inss.textContent=util.money(result.inss);
    irrf.textContent=util.money(result.irrf);
    rate.textContent=`${util.number(retained)}%`;
    meter.style.width=`${Math.max(0,Math.min(100,gross?result.net/gross*100:0))}%`;
  };
  input.addEventListener('input',render);
  render();
})();
