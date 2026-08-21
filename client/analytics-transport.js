(()=>{
'use strict';
const ENDPOINT='/api/analytics/event';
const MAX_PAYLOAD_BYTES=4096;

function send(payload){
  try{
    const body=JSON.stringify(payload);
    if(new TextEncoder().encode(body).byteLength>MAX_PAYLOAD_BYTES)return;
    void fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body,credentials:'omit',cache:'no-store',keepalive:true,referrerPolicy:'no-referrer'}).catch(()=>{});
  }catch{}
}

window.QuantoLabAnalyticsTransport=send;
const queue=Array.isArray(window.__QuantoLabAnalyticsQueue)?window.__QuantoLabAnalyticsQueue:[];
for(const payload of queue.splice(0,queue.length))send(payload);
})();
