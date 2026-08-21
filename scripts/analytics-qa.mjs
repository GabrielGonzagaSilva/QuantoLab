import fs from 'node:fs';

const fail = message => {
  console.error(`Analytics QA failed: ${message}`);
  process.exit(1);
};

const read = path => fs.readFileSync(path, 'utf8');
const theme = read('theme.js');
const transport = read('client/analytics-transport.js');
const core = read('tools-core.js');
const worker = read('worker/index.js');
const privacy = read('politica-de-privacidade.html');

for (const event of ['page_view','tool_opened','calculation_started','calculation_completed','result_shared','journey_continued']) {
  if (!theme.includes(`'${event}'`)) fail(`theme.js is missing ${event} in the analytics contract.`);
  if (!worker.includes(`'${event}'`)) fail(`worker/index.js is missing ${event} in the server allowlist.`);
}

if (!theme.includes("script.src='/client/analytics-transport.js'")) fail('Theme must load the reviewed same-origin analytics transport.');
if (theme.includes('fetch(') || theme.includes('sendBeacon')) fail('Global theme shell must not make network calls directly.');
if (!theme.includes('safeAnalyticsProperties')) fail('Client property allowlist is required.');
if (!theme.includes('__QuantoLabAnalyticsQueue')) fail('Analytics queue is required to avoid losing early events.');

if (!transport.includes("const ENDPOINT='/api/analytics/event'")) fail('Analytics endpoint must remain first-party.');
if (!transport.includes("credentials:'omit'")) fail('Analytics requests must not send browser credentials.');
if (!transport.includes("referrerPolicy:'no-referrer'")) fail('Collector request must not leak the current URL through the Referer header.');
if (/https?:\/\//i.test(transport)) fail('Analytics transport must not call external origins.');
if (/localStorage|sessionStorage|document\.cookie|fingerprint/i.test(transport)) fail('Analytics transport must not create visitor identifiers.');

for (const event of ['tool_opened','calculation_started','calculation_completed','result_shared']) {
  if (!core.includes(`'${event}'`)) fail(`tools-core.js must emit ${event} for shared calculators.`);
}

for (const file of ['valor-hora.js','preco-projeto.js','meta-faturamento.js','clt-pj.js','desligamento.js']) {
  const source = read(file);
  for (const event of ['tool_opened','calculation_started','calculation_completed']) {
    if (!source.includes(`'${event}'`)) fail(`${file} must emit ${event}.`);
  }
}

for (const file of ['clt-pj.js','desligamento.js']) {
  if (!read(file).includes("'result_shared'")) fail(`${file} must measure successful result sharing.`);
}

for (const required of ['MAX_BODY_BYTES','isSameOriginBrowserRequest','x-quantolab-synthetic-test','writeDataPoint','request.cf?.country']) {
  if (!worker.includes(required)) fail(`Worker safety requirement missing: ${required}`);
}

for (const forbidden of ['cf-connecting-ip','CF-Connecting-IP','localStorage','sessionStorage','document.cookie']) {
  if (worker.includes(forbidden)) fail(`Collector must not use ${forbidden}.`);
}

if (!privacy.includes('Workers Analytics Engine')) fail('Privacy policy must disclose the analytics processor/storage layer.');
if (!privacy.includes('não persiste endereço IP completo')) fail('Privacy policy must explicitly state that full IP addresses are not persisted in the product dataset.');

console.log('Analytics contract approved: first-party transport, event coverage, synthetic exclusion, privacy boundaries, and no visitor identifiers.');
