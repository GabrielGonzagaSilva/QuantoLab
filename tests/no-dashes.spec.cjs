const { test, expect } = require('@playwright/test');

const routes = [
  '/index.html',
  '/ferramentas.html',
  '/salario-liquido.html',
  '/comparador-profissional.html',
  '/valor-hora.html',
  '/preco-projeto.html',
  '/simulador.html',
  '/reserva-emergencia.html',
  '/metodologia.html',
  '/sobre.html',
  '/termos.html',
  '/politica-de-privacidade.html',
  '/contato.html',
  '/meus-numeros.html',
];

const dashPattern = /[—–]/;

async function acceptTermsIfNeeded(page) {
  const accept = page.locator('[data-accept-terms]');
  if (await accept.count()) {
    await expect(accept).toBeVisible();
    await accept.click();
    await expect(page.locator('.terms-consent')).toHaveCount(0);
  }
}

for (const route of routes) {
  test(`${route} não exibe travessões em textos`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
    await acceptTermsIfNeeded(page);

    const audit = await page.evaluate(() => {
      const pattern = /[—–]/;
      const visibleText = document.body.innerText || '';
      const title = document.title || '';
      const metadata = [...document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]')]
        .map(meta => meta.getAttribute('content') || '')
        .join('\n');
      const attributes = [...document.querySelectorAll('[title],[aria-label],[placeholder],[alt]')]
        .flatMap(element => ['title','aria-label','placeholder','alt'].map(attr => element.getAttribute(attr) || ''))
        .join('\n');

      return {
        visibleTextHasDash: pattern.test(visibleText),
        titleHasDash: pattern.test(title),
        metadataHasDash: pattern.test(metadata),
        attributesHaveDash: pattern.test(attributes),
      };
    });

    expect(audit.visibleTextHasDash, JSON.stringify(audit, null, 2)).toBe(false);
    expect(audit.titleHasDash, JSON.stringify(audit, null, 2)).toBe(false);
    expect(audit.metadataHasDash, JSON.stringify(audit, null, 2)).toBe(false);
    expect(audit.attributesHaveDash, JSON.stringify(audit, null, 2)).toBe(false);
  });
}
