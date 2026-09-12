import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const BASE = 'https://quantolab.com.br';
const OUT = path.resolve('portfolio-captures');
await fs.mkdir(OUT, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  source: BASE,
  policy: 'Every image is captured directly from the live production website using Chromium/Playwright. No mockups or reconstructed UI.',
  desktop: { viewport: '1440x900', deviceScaleFactor: 2 },
  mobile: { viewport: '390x844', deviceScaleFactor: 2 },
  files: []
};

const browser = await chromium.launch({ headless: true });

async function ready(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(700);
}

async function addEntry(filename, page, label, selectors, extra = {}) {
  manifest.files.push({
    filename,
    label,
    url: page.url(),
    selectors,
    capturedAt: new Date().toISOString(),
    ...extra
  });
}

async function shotLocator(page, selector, filename, label, extra = {}) {
  const loc = page.locator(selector).first();
  await loc.waitFor({ state: 'visible', timeout: 15000 });
  await loc.screenshot({ path: path.join(OUT, filename), animations: 'disabled' });
  await addEntry(filename, page, label, [selector], extra);
}

async function shotUnion(page, selectors, filename, label, padding = 0, extra = {}) {
  const rects = [];
  for (const selector of selectors) {
    const loc = page.locator(selector).first();
    await loc.waitFor({ state: 'visible', timeout: 15000 });
    const box = await loc.boundingBox();
    if (box) rects.push(box);
  }
  if (!rects.length) throw new Error(`No visible rectangles for ${filename}`);
  const left = Math.max(0, Math.min(...rects.map(r => r.x)) - padding);
  const top = Math.max(0, Math.min(...rects.map(r => r.y)) - padding);
  const right = Math.max(...rects.map(r => r.x + r.width)) + padding;
  const bottom = Math.max(...rects.map(r => r.y + r.height)) + padding;
  await page.screenshot({
    path: path.join(OUT, filename),
    clip: { x: left, y: top, width: right - left, height: bottom - top },
    animations: 'disabled'
  });
  await addEntry(filename, page, label, selectors, extra);
}

async function fillSalary(page) {
  await page.locator('#tool-salario').fill('5000');
  await page.locator('#tool-outros').fill('0');
  await page.locator('#tool-dependentes').fill('0');
}

async function calculateSalary(page) {
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
  await page.locator('[data-result-headline]').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(350);
}

const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  locale: 'pt-BR'
});
const page = await desktop.newPage();

// 01 — Homepage hero + header
await ready(page, `${BASE}/`);
await shotUnion(page, ['header.header', '.lab-hero'], '01-homepage-hero.png', 'Homepage — Hero', 0, { viewport: 'desktop' });

// 02 — Homepage discovery section
await shotLocator(page, '.lab-directory', '02-homepage-comece-pela-duvida.png', 'Homepage — Comece pela sua dúvida', { viewport: 'desktop' });

// 14 — Homepage closing CTA (captured now, numbered later in portfolio order)
await shotLocator(page, '.lab-close', '14-homepage-cta-final.png', 'Homepage — Qual decisão você precisa fazer agora?', { viewport: 'desktop' });

// 03–06 + 12 — Salary calculator real states
await ready(page, `${BASE}/salario-liquido`);
await fillSalary(page);
await shotUnion(page, ['.calc-hero', '.trust-row', '.calc-grid'], '03-salario-liquido-preenchida.png', 'Calculadora de Salário Líquido — tela preenchida', 0, { viewport: 'desktop', input: { salario: 5000, descontos: 0, dependentes: 0 } });
await calculateSalary(page);

await shotUnion(page, ['.calc-grid'], '04-salario-liquido-resultado.png', 'Calculadora de Salário Líquido — resultado detalhado', 0, { viewport: 'desktop', input: { salario: 5000, descontos: 0, dependentes: 0 } });

const details = page.locator('details.result-details');
if (await details.count()) {
  const isOpen = await details.evaluate(el => el.open);
  if (!isOpen) await details.locator('summary').click();
}
await page.waitForTimeout(200);
await shotUnion(page, ['[data-tool-result]', '.article', '.source-note'], '05-salario-liquido-premissas-fontes.png', 'Salário Líquido — resultado, detalhamento, premissas e fonte', 0, { viewport: 'desktop', input: { salario: 5000, descontos: 0, dependentes: 0 } });

await shotLocator(page, '.next-decision', '06-proxima-decisao.png', 'Ferramentas relacionadas / próxima decisão', { viewport: 'desktop' });

await shotLocator(page, '.calc-grid', '12-componentes-em-uso.png', 'Sistema — componentes e padrões em uso na calculadora', { viewport: 'desktop', note: 'Real product UI used as evidence of the design system in production.' });

// 07 — Full catalog by domain
await ready(page, `${BASE}/ferramentas`);
await shotUnion(page, ['.catalog-hero', '.journey-section:nth-of-type(2)', '.journey-section:nth-of-type(3)', '.journey-section:nth-of-type(4)', '.journey-section:nth-of-type(5)'], '07-catalogo-por-dominio.png', 'Catálogo de ferramentas por domínio — CLT, PJ, Freelancer e Financeiro', 0, { viewport: 'desktop' });

// 08–09 — CLT x PJ
await ready(page, `${BASE}/comparador-profissional`);
await page.locator('#cltSalario').fill('7000');
await page.locator('#valeTransporte').fill('0');
await page.locator('#valeRefeicao').fill('800');
await page.locator('#outrosBeneficios').fill('600');
await page.locator('#simples').fill('6');
await shotUnion(page, ['.calc-hero', '.trust-row', '.calc-grid'], '08-clt-pj-preenchida.png', 'Comparador CLT x PJ — tela preenchida', 0, { viewport: 'desktop', input: { salarioCLT: 7000, valeRefeicao: 800, outrosBeneficios: 600, simples: 6 } });
await page.locator('#calcular').click();
await page.locator('#clt-pj-result').waitFor({ state: 'visible', timeout: 10000 });
await page.waitForTimeout(300);
await shotLocator(page, '.calc-grid', '09-clt-pj-resultado.png', 'Comparador CLT x PJ — resultado da comparação', { viewport: 'desktop', input: { salarioCLT: 7000, valeRefeicao: 800, outrosBeneficios: 600, simples: 6 } });

// 10–11 — Methodology and official sources
await ready(page, `${BASE}/metodologia`);
await shotUnion(page, ['.legal-hero', '[data-method-review="true"]', '.article > h2:nth-of-type(2)', '.article > p:nth-of-type(3)'], '10-metodologia.png', 'Página de metodologia — princípios e revisão', 0, { viewport: 'desktop' });

const sourceHeading = page.getByRole('heading', { name: 'Fontes oficiais e referências', exact: true });
await sourceHeading.scrollIntoViewIfNeeded();
const article = page.locator('.article');
const sourcesList = sourceHeading.locator('xpath=following-sibling::ul[1]');
const sourcesNotice = sourceHeading.locator('xpath=following-sibling::div[contains(@class,"notice")][1]');
const sourceBoxes = [];
for (const loc of [sourceHeading, sourcesList, sourcesNotice]) {
  const box = await loc.boundingBox();
  if (box) sourceBoxes.push(box);
}
if (!sourceBoxes.length) throw new Error('Could not locate methodology sources');
const sx = Math.max(0, Math.min(...sourceBoxes.map(r => r.x)) - 12);
const sy = Math.max(0, Math.min(...sourceBoxes.map(r => r.y)) - 12);
const sr = Math.max(...sourceBoxes.map(r => r.x + r.width)) + 12;
const sb = Math.max(...sourceBoxes.map(r => r.y + r.height)) + 12;
await page.screenshot({ path: path.join(OUT, '11-fontes-oficiais-referencias-2026.png'), clip: { x: sx, y: sy, width: sr - sx, height: sb - sy }, animations: 'disabled' });
await addEntry('11-fontes-oficiais-referencias-2026.png', page, 'Fontes oficiais e referências fiscais 2026', ['h2:Fontes oficiais e referências', 'following ul', 'following .notice'], { viewport: 'desktop' });

// 13 — Mobile calculator, real calculated state
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  locale: 'pt-BR',
  isMobile: true,
  hasTouch: true
});
const mobilePage = await mobile.newPage();
await ready(mobilePage, `${BASE}/salario-liquido`);
await fillSalary(mobilePage);
await calculateSalary(mobilePage);
await shotUnion(mobilePage, ['.calc-hero', '.calc-grid'], '13-calculadora-mobile.png', 'Calculadora de Salário Líquido — versão mobile calculada', 0, { viewport: 'mobile', input: { salario: 5000, descontos: 0, dependentes: 0 } });

await desktop.close();
await mobile.close();
await browser.close();

// Verify all expected captures exist and record dimensions/size via file stats only.
for (const entry of manifest.files) {
  const stat = await fs.stat(path.join(OUT, entry.filename));
  entry.bytes = stat.size;
}

manifest.files.sort((a, b) => a.filename.localeCompare(b.filename, 'pt-BR', { numeric: true }));
await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
await fs.writeFile(path.join(OUT, 'README.txt'), [
  'QuantoLab — Capturas para Portfólio',
  '',
  `Fonte única: ${BASE}`,
  'Todas as imagens desta pasta foram capturadas diretamente do site real em produção por Chromium/Playwright.',
  'Não há mockups, reconstruções ou imagens geradas por IA.',
  '',
  'Desktop: viewport 1440×900 com DPR 2 (renderização 2×).',
  'Mobile: viewport 390×844 com DPR 2 (renderização 2×).',
  '',
  ...manifest.files.map(x => `${x.filename} — ${x.label} — ${x.url}`)
].join('\n'), 'utf8');

// Create a portable ZIP adjacent to the folder.
execFileSync('zip', ['-r', '-9', 'quantolab-portfolio-captures.zip', 'portfolio-captures'], { stdio: 'inherit' });
console.log(JSON.stringify({ count: manifest.files.length, output: OUT, zip: 'quantolab-portfolio-captures.zip' }, null, 2));
