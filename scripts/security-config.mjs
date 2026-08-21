import fs from 'node:fs';

const fail = message => {
  console.error(`Security config failed: ${message}`);
  process.exit(1);
};

const wrangler = JSON.parse(fs.readFileSync('wrangler.jsonc', 'utf8'));

if (wrangler.name !== 'quantolab') fail('Worker name must remain quantolab.');
if (wrangler.main !== 'worker/index.js') fail('Worker entrypoint must remain worker/index.js.');
if (wrangler.workers_dev !== false) fail('workers.dev must remain disabled.');
if (wrangler.preview_urls !== false) fail('Preview URLs must remain disabled.');
if (wrangler.assets?.directory !== '.') fail('Static asset directory must remain explicit.');
if (wrangler.assets?.binding !== 'ASSETS') fail('Static assets binding must remain ASSETS.');
if (JSON.stringify(wrangler.assets?.run_worker_first) !== JSON.stringify(['/api/analytics/*'])) fail('Only analytics API routes may run the Worker before static assets.');
if ('route' in wrangler || 'routes' in wrangler) fail('Custom-domain routing must remain managed in the Cloudflare dashboard, not overridden by Wrangler.');

const analytics = wrangler.analytics_engine_datasets;
if (!Array.isArray(analytics) || analytics.length !== 1) fail('Exactly one Analytics Engine dataset must be configured.');
if (analytics[0]?.binding !== 'ANALYTICS' || analytics[0]?.dataset !== 'quantolab_product_events') fail('Analytics Engine binding/dataset changed unexpectedly.');

const assetsIgnore = fs.readFileSync('.assetsignore', 'utf8');
for (const entry of ['.github/', 'scripts/', 'tools/', 'worker/', 'tests/', 'UX_WRITING.md', '.gitignore', '.assetsignore', 'wrangler.jsonc', '.env', '.dev.vars', '.wrangler/', 'node_modules/', '*.pem', '*.key']) {
  if (!assetsIgnore.includes(entry)) fail(`.assetsignore must exclude ${entry}`);
}

const headers = fs.readFileSync('_headers', 'utf8');
for (const rule of ["script-src 'self'", "connect-src 'self'", 'Strict-Transport-Security:', 'Cross-Origin-Resource-Policy: same-origin', "frame-ancestors 'none'"]) {
  if (!headers.includes(rule)) fail(`Security header regression: missing ${rule}`);
}

const worker = fs.readFileSync('worker/index.js', 'utf8');
if (!worker.includes("request.headers.has('x-quantolab-synthetic-test')")) fail('Synthetic monitoring exclusion is required.');
if (worker.includes('cf-connecting-ip') || worker.includes('CF-Connecting-IP')) fail('Worker must not persist or inspect full client IP for product analytics.');
if (!worker.includes("credentials") && worker.includes('Authorization: Bearer')) fail('Analytics read credentials must never be embedded in the collector.');

console.log('Security config approved: first-party analytics is isolated, server-side, synthetic traffic is excluded, and browser protections remain strict.');
