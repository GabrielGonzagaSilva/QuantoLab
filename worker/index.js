const MAX_BODY_BYTES=4096;
const PROJECT='quantolab';
const SCHEMA_VERSION='1';
const ALLOWED_EVENTS=new Set([
  'page_view',
  'terms_accepted',
  'tool_opened',
  'calculation_started',
  'calculation_completed',
  'result_shared',
  'journey_continued',
  'profile_saved',
  'profile_cleared',
  'ad_script_loaded'
]);
const NO_STORE_HEADERS={
  'Cache-Control':'no-store, max-age=0',
  'Pragma':'no-cache',
  'X-Content-Type-Options':'nosniff'
};

function empty(status=204,extraHeaders={}){
  return new Response(null,{status,headers:{...NO_STORE_HEADERS,...extraHeaders}});
}

function cleanToken(value,max=80){
  if(typeof value!=='string')return '';
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g,'').slice(0,max);
}

function cleanText(value,max=120){
  if(typeof value!=='string')return '';
  return value.trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,max);
}

function cleanPath(value){
  if(typeof value!=='string')return '';
  const path=value.split(/[?#]/,1)[0].trim();
  if(!path.startsWith('/')||path.startsWith('/api/'))return '';
  return path.replace(/[\u0000-\u001f\u007f]/g,'').slice(0,200);
}

function cleanHostname(value){
  if(typeof value!=='string'||!value.trim())return '';
  try{
    const candidate=value.includes('://')?new URL(value).hostname:value.trim().toLowerCase();
    return /^[a-z0-9.-]+$/.test(candidate)?candidate.slice(0,253):'';
  }catch{return '';}
}

function isSameOriginBrowserRequest(request){
  const target=new URL(request.url);
  const origin=request.headers.get('origin');
  if(!origin)return false;
  try{
    if(new URL(origin).host!==target.host)return false;
  }catch{return false;}
  const fetchSite=request.headers.get('sec-fetch-site');
  return !fetchSite||fetchSite==='same-origin';
}

function classifyDevice(request,ua){
  const mobileHint=request.headers.get('sec-ch-ua-mobile');
  if(/iPad|Tablet|PlayBook|Silk/i.test(ua)||(/Android/i.test(ua)&&!/Mobile/i.test(ua)))return 'tablet';
  if(mobileHint==='?1'||/Mobi|Android|iPhone|iPod/i.test(ua))return 'mobile';
  return 'desktop';
}

function classifyBrowser(ua){
  if(/Edg\//.test(ua))return 'edge';
  if(/OPR\//.test(ua))return 'opera';
  if(/Firefox\//.test(ua)||/FxiOS\//.test(ua))return 'firefox';
  if(/Chrome\//.test(ua)||/CriOS\//.test(ua))return 'chrome';
  if(/Safari\//.test(ua)&&/Version\//.test(ua))return 'safari';
  return 'other';
}

function classifyOS(ua){
  if(/Windows NT/i.test(ua))return 'windows';
  if(/Android/i.test(ua))return 'android';
  if(/iPhone|iPad|iPod/i.test(ua))return 'ios';
  if(/Mac OS X|Macintosh/i.test(ua))return 'macos';
  if(/Linux/i.test(ua))return 'linux';
  return 'other';
}

function isKnownCrawler(ua){
  return /bot\b|crawler|spider|slurp|bingpreview/i.test(ua);
}

async function collect(request,env){
  if(request.method!=='POST')return empty(405,{'Allow':'POST'});

  // Synthetic monitoring is deliberately excluded from product and traffic metrics.
  if(request.headers.has('x-quantolab-synthetic-test'))return empty();
  if(!isSameOriginBrowserRequest(request))return empty(403);

  const type=request.headers.get('content-type')||'';
  if(!type.toLowerCase().includes('application/json'))return empty(415);

  const declaredLength=Number(request.headers.get('content-length')||0);
  if(Number.isFinite(declaredLength)&&declaredLength>MAX_BODY_BYTES)return empty(413);

  const raw=await request.text();
  if(new TextEncoder().encode(raw).byteLength>MAX_BODY_BYTES)return empty(413);

  let payload;
  try{payload=JSON.parse(raw);}catch{return empty(400);}
  if(!payload||typeof payload!=='object'||Array.isArray(payload))return empty(400);

  const event=cleanToken(payload.event,48);
  if(!ALLOWED_EVENTS.has(event))return empty(400);

  const properties=payload.properties&&typeof payload.properties==='object'&&!Array.isArray(payload.properties)?payload.properties:{};
  const path=cleanPath(properties.path);
  if(!path)return empty(400);

  const ua=request.headers.get('user-agent')||'';
  if(isKnownCrawler(ua))return empty();

  const tool=cleanToken(properties.tool,64);
  const method=cleanToken(properties.method,24);
  const fromTool=cleanToken(properties.from_tool,64);
  const toTool=cleanToken(properties.to_tool,64);
  const version=cleanToken(properties.version,32);
  const referrerHost=cleanHostname(payload.referrer_host);
  const country=cleanToken(request.cf?.country||'',2);
  const region=cleanText(request.cf?.regionCode||request.cf?.region||'',64);
  const device=classifyDevice(request,ua);
  const browser=classifyBrowser(ua);
  const os=classifyOS(ua);

  env.ANALYTICS.writeDataPoint({
    indexes:[PROJECT],
    blobs:[
      event,
      path,
      tool,
      referrerHost,
      country,
      region,
      device,
      browser,
      os,
      method,
      fromTool,
      toTool,
      version,
      SCHEMA_VERSION
    ],
    doubles:[1]
  });

  return empty();
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/analytics/event')return collect(request,env);
    return env.ASSETS.fetch(request);
  }
};
