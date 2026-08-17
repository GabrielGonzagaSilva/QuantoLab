const { test, expect } = require('@playwright/test');

async function acceptTermsIfNeeded(page) {
  const accept = page.locator('[data-accept-terms]');
  if (await accept.count()) {
    await expect(accept).toBeVisible();
    await accept.click();
    await expect(page.locator('.terms-consent')).toHaveCount(0);
  }
}

async function open(page, route) {
  await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
  await acceptTermsIfNeeded(page);
}

test.describe('calculator result flow on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('salário líquido uses calculate, meu cálculo, result and redo stages', async ({ page }) => {
    await open(page, '/salario-liquido.html');
    const form = page.locator('[data-tool-form]');
    const result = page.locator('[data-tool-result]');
    await expect(form).toBeVisible();
    await expect(result).toBeHidden();
    await page.locator('#tool-salario').fill('7000');
    await page.locator('#tool-outros').fill('200');
    await form.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(form).toBeHidden();
    await expect(result).toBeVisible();
    await expect(result.getByText('Meu cálculo', { exact: true })).toBeVisible();
    await expect(result.getByText('Resultado', { exact: true })).toBeVisible();
    await expect(result.locator('.calculator-table')).toContainText('Salário líquido');
    await expect(result.locator('[data-result-headline]')).not.toHaveText('R$ 0,00');
    await result.getByRole('button', { name: 'Fazer outro cálculo' }).click();
    await expect(form).toBeVisible();
  });

  test('juros compostos exposes graph and table result views', async ({ page }) => {
    await open(page, '/juros-compostos.html');
    const form = page.locator('[data-tool-form]');
    const result = page.locator('[data-tool-result]');
    await page.locator('#tool-inicial').fill('10000');
    await page.locator('#tool-aporte').fill('500');
    await page.locator('#tool-taxa').fill('10');
    await page.locator('#tool-periodo').fill('2');
    await form.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(result).toBeVisible();
    const visual = result.locator('.calculator-model__visual');
    await expect(visual).toBeVisible();
    await expect(visual.locator('svg')).toBeVisible();
    const tableButton = visual.getByRole('button', { name: 'Tabela', exact: true });
    await tableButton.click();
    await expect(visual.locator('.calculator-table')).toBeVisible();
    await expect(visual.locator('.calculator-table')).toContainText('Total acumulado');
  });

  test('CLT x PJ follows the equivalent PJ input model', async ({ page }) => {
    await open(page, '/comparador-profissional.html');
    const form = page.locator('#clt-pj-form');
    const result = page.locator('#clt-pj-result');
    await expect(result).toBeHidden();
    await page.locator('#cltSalario').fill('7000');
    await page.locator('#valeTransporte').fill('0');
    await page.locator('#valeRefeicao').fill('800');
    await page.locator('#outrosBeneficios').fill('300');
    await page.locator('#simples').fill('6');
    await form.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(form).toBeHidden();
    await expect(result).toBeVisible();
    await expect(page.locator('#pjEquivalente')).toContainText('R$');
    await expect(page.locator('#tabelaClt')).toContainText('Vale transporte');
    await expect(page.locator('#tabelaClt')).toContainText('Remuneração líquida efetiva');
    await expect(page.locator('#tabelaPj')).toContainText('Imposto Simples Nacional');
    await expect(page.locator('#meuCalculo')).toContainText('Alíquota do Simples Nacional');
  });

  test('rescisão uses the reduced reference field set and returns FGTS separately', async ({ page }) => {
    await open(page, '/simulador.html');
    const form = page.locator('#rescisao-form');
    const result = page.locator('#rescisao-result');
    await page.locator('#salario').fill('5000');
    await page.locator('#admissao').fill('2024-01-10');
    await page.locator('#desligamento').fill('2026-08-10');
    await page.locator('#tipo').selectOption('sem_justa');
    await page.locator('#aviso').selectOption('indenizado');
    await page.locator('#saldoFgts').fill('12000');
    await form.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(form).toBeHidden();
    await expect(result).toBeVisible();
    await expect(page.locator('#totalLiquido')).toContainText('R$');
    await expect(page.locator('#resultadoTabela')).toContainText('Multa do FGTS');
    await expect(page.locator('#resultadoTabela')).toContainText('FGTS disponível para saque');
    await expect(page.locator('#meuCalculo')).toContainText('Demissão sem justa causa');
  });
});

test.describe('calculator layout on desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('salary form and result remain side by side after calculation', async ({ page }) => {
    await open(page, '/salario-liquido.html');
    const form = page.locator('[data-tool-form]');
    const result = page.locator('[data-tool-result]');
    await form.getByRole('button', { name: 'Calcular', exact: true }).click();
    await expect(form).toBeVisible();
    await expect(result).toBeVisible();
    const formBox = await form.boundingBox();
    const resultBox = await result.boundingBox();
    expect(formBox).not.toBeNull();
    expect(resultBox).not.toBeNull();
    expect(resultBox.x).toBeGreaterThan(formBox.x);
  });
});
