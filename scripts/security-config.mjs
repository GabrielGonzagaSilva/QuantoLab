import fs from 'node:fs';

const fail = message => {
  console.error(`Security config failed: ${message}`);
  process.exit(1);
};

const wrangler = JSON.parse(fs.readFileSync('wrangler.jsonc', 'utf8'));

if (wrangler.name !== 'quantolab') fail('Worker name must remain quantolab.');
if (wrangler.workers_dev !== false) fail('workers.dev must remain disabled.');
if (wrangler.preview_urls !== false) fail('Preview URLs must remain disabled.');
if (wrangler.assets?.directory !== '.') fail('Static asset directory must remain explicit.');
if ('route' in wrangler || 'routes' in wrangler) fail('Custom-domain routing must remain managed in the Cloudflare dashboard, not overridden by Wrangler.');

const assetsIgnore = fs.readFileSync('.assetsignore', 'utf8');
for (const entry of ['.github/', 'scripts/', 'UX_WRITING.md', '.gitignore', '.assetsignore', 'wrangler.jsonc', '.env', '.dev.vars', '.wrangler/', 'node_modules/', '*.pem', '*.key']) {
  if (!assetsIgnore.includes(entry)) fail(`.assetsignore must exclude ${entry}`);
}

console.log('Security config approved: alternate Worker URLs disabled and internal files excluded from public assets.');
