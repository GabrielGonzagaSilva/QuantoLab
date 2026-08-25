const { test, expect } = require('@playwright/test');

const routes = [
  ['guias', '/guias.html'],
  ['guia-clt-pj', '/guias/clt-ou-pj.html'],
  ['guia-salario', '/guias/salario-liquido-2026.html'],
  ['politica-editorial', '/politica-editorial.html'],
  ['salario-liquido', '/salario-liquido.html'],
];

const viewports = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

async function acceptTermsIfNeeded(page) {
  const accept = page.locator('[data-accept-terms]');
  if (await accept.count()) await accept.click();
}

for (const viewport of viewports) {
  test.describe(`editorial ${viewport.width}`, () => {
    test.use({ viewport });

    for (const [name, route] of routes) {
      test(`${name} remains readable and inside viewport`, async ({ page }) => {
        await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
        await acceptTermsIfNeeded(page);

        const audit = await page.evaluate(() => {
          const width = window.innerWidth;
          const visible = el => {
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) !== 0 && r.width > 0 && r.height > 0;
          };
          const offenders = [];
          for (const el of document.querySelectorAll('body *')) {
            if (!visible(el)) continue;
            const r = el.getBoundingClientRect();
            if (r.left < -1 || r.right > width + 1) offenders.push({ tag: el.tagName, className: el.className || '', left: r.left, right: r.right });
          }
          return {
            h1: document.querySelectorAll('h1').length,
            offenders: offenders.slice(0, 12),
            hasAdInventory: Boolean(document.querySelector('[data-ad-slot], .ad-box, .ad-placeholder')),
            documentWidth: document.documentElement.scrollWidth,
          };
        });

        expect(audit.h1).toBe(1);
        expect(audit.offenders, JSON.stringify(audit, null, 2)).toEqual([]);
        expect(audit.hasAdInventory).toBe(false);
        expect(audit.documentWidth).toBeLessThanOrEqual(viewport.width + 1);
      });
    }
  });
}

test('guide pages expose editorial responsibility, revision date and useful depth', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/guias/clt-ou-pj.html', { waitUntil: 'networkidle' });
  await acceptTermsIfNeeded(page);
  await expect(page.locator('.guide-byline')).toContainText('Por QuantoLab');
  await expect(page.locator('.guide-byline')).toContainText('Revisado em 24 de agosto de 2026');
  expect(await page.locator('.guide-article section').count()).toBeGreaterThanOrEqual(6);
  await expect(page.locator('.guide-aside a[href="/politica-editorial"]')).toBeVisible();
  await expect(page.locator('.guide-article a[href="/comparador-profissional"]')).toBeVisible();
});

test('calculator pages expose static editorial context in addition to the calculator', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/salario-liquido.html', { waitUntil: 'networkidle' });
  await acceptTermsIfNeeded(page);
  await expect(page.locator('[data-tool-form]')).toBeVisible();
  await expect(page.locator('[data-editorial-depth="salario-liquido"]')).toBeVisible();
  expect(await page.locator('[data-editorial-depth="salario-liquido"] h2').count()).toBeGreaterThanOrEqual(6);
  await expect(page.locator('[data-editorial-depth="salario-liquido"] a[href="/guias/salario-liquido-2026"]')).toBeVisible();
});
