const { test, expect } = require('@playwright/test');

const routes = [
  ['home', '/index.html'],
  ['valor-hora', '/valor-hora.html'],
  ['preco-projeto', '/preco-projeto.html'],
  ['meta-faturamento', '/meta-faturamento.html'],
  ['clt-pj', '/comparador-profissional.html'],
  ['rescisao', '/simulador.html'],
  ['metodologia', '/metodologia.html'],
  ['sobre', '/sobre.html'],
  ['privacidade', '/politica-de-privacidade.html'],
  ['termos', '/termos.html'],
  ['contato', '/contato.html'],
];

const viewports = [
  ['320', { width: 320, height: 800 }],
  ['360', { width: 360, height: 800 }],
  ['375', { width: 375, height: 812 }],
  ['390', { width: 390, height: 844 }],
  ['430', { width: 430, height: 932 }],
  ['768', { width: 768, height: 1024 }],
  ['1024', { width: 1024, height: 768 }],
  ['1280', { width: 1280, height: 900 }],
  ['1440', { width: 1440, height: 900 }],
];

for (const [viewportName, viewport] of viewports) {
  test.describe(`viewport ${viewportName}`, () => {
    test.use({ viewport });

    for (const [routeName, route] of routes) {
      test(`${routeName} has no responsive breakage`, async ({ page }) => {
        await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });

        const audit = await page.evaluate(() => {
          const viewportWidth = window.innerWidth;
          const doc = document.documentElement;
          const isVisible = (el) => {
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
          };

          const offenders = [];
          for (const el of document.querySelectorAll('body *')) {
            if (!isVisible(el)) continue;
            if (el.closest('.ad') && getComputedStyle(el.closest('.ad')).display === 'none') continue;
            const rect = el.getBoundingClientRect();
            if (rect.left < -1 || rect.right > viewportWidth + 1) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                className: typeof el.className === 'string' ? el.className : '',
                id: el.id || '',
                left: Math.round(rect.left * 10) / 10,
                right: Math.round(rect.right * 10) / 10,
                width: Math.round(rect.width * 10) / 10,
              });
            }
          }

          const brand = document.querySelector('.brand');
          const header = document.querySelector('.header');
          let brandOutsideHeader = false;
          if (brand && header && isVisible(brand)) {
            const br = brand.getBoundingClientRect();
            const hr = header.getBoundingClientRect();
            brandOutsideHeader = br.left < hr.left - 1 || br.right > hr.right + 1 || br.top < hr.top - 1 || br.bottom > hr.bottom + 1;
          }

          const visibleNavLinks = [...document.querySelectorAll('.navlinks a')].filter(isVisible);
          let headerCollision = false;
          if (brand && visibleNavLinks.length) {
            const br = brand.getBoundingClientRect();
            headerCollision = visibleNavLinks.some((link) => {
              const lr = link.getBoundingClientRect();
              return br.right > lr.left - 8 && br.left < lr.right + 8 && br.bottom > lr.top && br.top < lr.bottom;
            });
          }

          const smallControls = [];
          if (viewportWidth <= 760) {
            for (const el of document.querySelectorAll('button, input:not([type="hidden"]), select, .help-inline-toggle, .help-toggle')) {
              if (!isVisible(el)) continue;
              const rect = el.getBoundingClientRect();
              if (rect.height < 44) {
                smallControls.push({ tag: el.tagName.toLowerCase(), id: el.id || '', className: typeof el.className === 'string' ? el.className : '', height: Math.round(rect.height * 10) / 10 });
              }
            }
          }

          return {
            viewportWidth,
            documentWidth: doc.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            offenders: offenders.slice(0, 15),
            brandOutsideHeader,
            headerCollision,
            smallControls: smallControls.slice(0, 15),
          };
        });

        expect(audit.documentWidth, JSON.stringify(audit, null, 2)).toBeLessThanOrEqual(viewport.width + 1);
        expect(audit.bodyWidth, JSON.stringify(audit, null, 2)).toBeLessThanOrEqual(viewport.width + 1);
        expect(audit.offenders, JSON.stringify(audit, null, 2)).toEqual([]);
        expect(audit.brandOutsideHeader, JSON.stringify(audit, null, 2)).toBe(false);
        expect(audit.headerCollision, JSON.stringify(audit, null, 2)).toBe(false);
        expect(audit.smallControls, JSON.stringify(audit, null, 2)).toEqual([]);

        if (['home', 'valor-hora', 'rescisao'].includes(routeName) && ['320', '390', '768', '1440'].includes(viewportName)) {
          await page.screenshot({ path: `responsive-artifacts/${routeName}-${viewportName}.png`, fullPage: true });
        }
      });
    }
  });
}
