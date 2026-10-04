const { test, expect } = require('@playwright/test');

const BASE='http://127.0.0.1:4173';

async function ready(page,{accept=true}={}){
  await expect(page.locator('html')).toHaveAttribute('data-sprint6-ready','true');
  if(!accept)return;
  const button=page.locator('[data-accept-terms]');
  if(await button.count()){
    await expect(button).toBeVisible();
    await button.click();
    await expect(page.locator('.terms-consent')).toHaveCount(0);
  }
}

async function captureEvents(page){
  await page.evaluate(()=>{
    window.__qlEvents=[];
    window.addEventListener('quantolab:event',event=>window.__qlEvents.push(event.detail));
  });
}

test.describe('Sprint 6 · polish + observability + launch readiness',()=>{
  test('telemetry remains gated and does not load third-party/runtime scripts on localhost',async({page})=>{
    await page.goto(`${BASE}/index.html`,{waitUntil:'networkidle'});
    await ready(page,{accept:false});
    await expect(page.locator('[data-ql-telemetry]')).toHaveCount(0);
    await expect(page.locator('.terms-consent__local')).toContainText('medição técnica e de uso');

    await page.locator('[data-accept-terms]').click();
    await expect(page.locator('.terms-consent')).toHaveCount(0);
    await expect(page.locator('[data-ql-telemetry]')).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute('data-telemetry','enabled');
  });

  test('catalog events carry context and result count but never the search text',async({page})=>{
    await page.goto(`${BASE}/ferramentas.html`,{waitUntil:'networkidle'});
    await ready(page);
    await captureEvents(page);

    await page.getByRole('button',{name:'PJ',exact:true}).click();
    await page.locator('.catalog-search').fill('salário líquido');
    await page.waitForTimeout(850);

    const events=await page.evaluate(()=>window.__qlEvents);
    const filter=events.find(event=>event.name==='catalog_filter');
    const search=events.find(event=>event.name==='catalog_search');
    expect(filter?.properties?.context).toBe('pj');
    expect(search?.properties?.context).toBe('pj');
    expect(typeof search?.properties?.results).toBe('number');
    expect(JSON.stringify(search)).not.toContain('salário líquido');
    expect(search?.properties).not.toHaveProperty('query');
  });

  test('profile telemetry exposes only field count, not the saved financial values',async({page})=>{
    await page.goto(`${BASE}/meus-numeros.html`,{waitUntil:'networkidle'});
    await ready(page);
    await captureEvents(page);

    const captured=await page.evaluate(()=>{
      window.QuantoLabProfile.set({monthlyIncome:9876,monthlyCosts:1234});
      return window.__qlEvents.find(event=>event.name==='profile_saved');
    });
    expect(captured.properties.fields).toBe(2);
    expect(JSON.stringify(captured)).not.toContain('9876');
    expect(JSON.stringify(captured)).not.toContain('1234');
    expect(captured.properties).not.toHaveProperty('monthlyIncome');
  });

  test('client errors are reduced to a generic source without message or stack',async({page})=>{
    await page.goto(`${BASE}/index.html`,{waitUntil:'networkidle'});
    await ready(page);
    await captureEvents(page);

    const captured=await page.evaluate(()=>{
      window.dispatchEvent(new ErrorEvent('error',{message:'sensitive-value-9999'}));
      return window.__qlEvents.find(event=>event.name==='client_error');
    });
    expect(captured.properties.source).toBe('window');
    expect(JSON.stringify(captured)).not.toContain('sensitive-value-9999');
  });

  test('reduced motion removes Sprint 6 transitions',async({page})=>{
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(`${BASE}/ferramentas.html`,{waitUntil:'networkidle'});
    await ready(page);
    const duration=await page.locator('.tool-card').first().evaluate(node=>getComputedStyle(node).transitionDuration);
    expect(duration.split(',').every(value=>value.trim()==='0s')).toBe(true);
  });

  test('privacy disclosure documents the observability provider and redaction contract',async({page})=>{
    await page.goto(`${BASE}/politica-de-privacidade.html`,{waitUntil:'networkidle'});
    await ready(page,{accept:false});
    await expect(page.getByRole('heading',{name:'Medição de produto e desempenho'})).toBeVisible();
    await expect(page.locator('.article')).toContainText('Vercel Web Analytics');
    await expect(page.locator('.article')).toContainText('Vercel Speed Insights');
    await expect(page.locator('.article')).toContainText('não incluem os valores financeiros digitados');
    await expect(page.locator('.article')).toContainText('parâmetros de consulta e fragmentos da URL são removidos');
  });
});
