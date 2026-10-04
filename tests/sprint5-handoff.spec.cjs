const { test, expect } = require('@playwright/test');

const BASE='http://127.0.0.1:4173';

async function ready(page){
  await expect(page.locator('html')).toHaveAttribute('data-sprint5-ready','true');
  const accept=page.locator('[data-accept-terms]');
  if(await accept.count()){
    await expect(accept).toBeVisible();
    await accept.click();
    await expect(page.locator('.terms-consent')).toHaveCount(0);
  }
}

test.describe('Sprint 5 · Figma handoff contract',()=>{
  test('catalog discovery supports search, context filters and decision shortcuts',async({page})=>{
    await page.setViewportSize({width:1440,height:900});
    await page.goto(`${BASE}/ferramentas.html`,{waitUntil:'networkidle'});
    await ready(page);

    await expect(page.locator('.catalog-discovery')).toBeVisible();
    await expect(page.locator('.catalog-search')).toBeVisible();
    await expect(page.locator('.filter-chip')).toHaveCount(5);
    await expect(page.locator('.catalog-shortcut')).toHaveCount(4);
    await expect(page.locator('.tool-card:not([hidden])')).toHaveCount(28);
    await expect(page.locator('#catalog-discovery-status')).toHaveText('28 ferramentas encontradas');

    await page.locator('.catalog-search').fill('salário líquido');
    await expect(page.locator('.tool-card:not([hidden])')).toHaveCount(1);
    await expect(page.locator('.tool-card:not([hidden]) h3')).toContainText('Salário Líquido');

    await page.locator('.catalog-search').fill('');
    await page.getByRole('button',{name:'PJ',exact:true}).click();
    await expect(page.getByRole('button',{name:'PJ',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.tool-card:not([hidden])')).toHaveCount(5);
    await expect(page.locator('#catalog-discovery-status')).toHaveText('5 ferramentas encontradas');
    expect(new URL(page.url()).searchParams.get('contexto')).toBe('pj');

    await expect(page.locator('.catalog-shortcut').nth(0)).toHaveAttribute('href','/salario-liquido');
    await expect(page.locator('.catalog-shortcut').nth(1)).toHaveAttribute('href','/comparador-profissional');
  });

  test('mobile navigation is touch-safe, keyboard operable and restores focus',async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto(`${BASE}/index.html`,{waitUntil:'networkidle'});
    await ready(page);

    const toggle=page.locator('.mobile-menu-toggle');
    await expect(toggle).toBeVisible();
    const box=await toggle.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
    await expect(toggle).toHaveAttribute('aria-expanded','false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    await expect(page.locator('#quantolab-mobile-nav')).toBeVisible();
    await expect(page.locator('#quantolab-mobile-nav a[href="/meus-numeros"]')).toBeVisible();
    await expect(page.locator('#quantolab-mobile-nav a').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('#quantolab-mobile-nav')).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await expect(toggle).toBeFocused();
  });

  for(const viewport of [
    {name:'320',width:320,height:800},
    {name:'390',width:390,height:844},
    {name:'480',width:480,height:900},
    {name:'768',width:768,height:1024},
    {name:'834',width:834,height:1112},
    {name:'1024',width:1024,height:900},
    {name:'1440',width:1440,height:900},
  ]){
    test(`calculator reflow follows the grid contract at ${viewport.name}`,async({page})=>{
      await page.setViewportSize({width:viewport.width,height:viewport.height});
      await page.goto(`${BASE}/salario-liquido.html`,{waitUntil:'networkidle'});
      await ready(page);
      const audit=await page.evaluate(()=>{
        const grid=document.querySelector('.calc-grid');
        const result=document.querySelector('.panel.result');
        const input=document.querySelector('.input-wrap input');
        return {
          docWidth:document.documentElement.scrollWidth,
          bodyWidth:document.body.scrollWidth,
          viewport:innerWidth,
          columns:getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length,
          resultPosition:getComputedStyle(result).position,
          inputFontSize:parseFloat(getComputedStyle(input).fontSize),
        };
      });
      expect(audit.docWidth,JSON.stringify(audit)).toBeLessThanOrEqual(viewport.width+1);
      expect(audit.bodyWidth,JSON.stringify(audit)).toBeLessThanOrEqual(viewport.width+1);
      if(viewport.width>=1200){
        expect(audit.columns).toBe(2);
        expect(audit.resultPosition).toBe('sticky');
      }else{
        expect(audit.columns).toBe(1);
        expect(audit.resultPosition).toBe('static');
      }
      if(viewport.width<=767)expect(audit.inputFontSize).toBeGreaterThanOrEqual(16);
    });
  }

  test('saved references remain visible assumptions in compatible calculators',async({page})=>{
    await page.addInitScript(()=>localStorage.setItem('quantolab-profile-v1',JSON.stringify({monthlyIncome:9750,monthlyCosts:1400,hoursDay:7,daysWeek:5,taxRate:6,reserveMonths:6})));
    await page.setViewportSize({width:390,height:844});
    await page.goto(`${BASE}/renda-anual.html`,{waitUntil:'networkidle'});
    await ready(page);

    await expect(page.locator('#tool-mensal')).toHaveValue('9750');
    await expect(page.locator('.saved-reference-note')).toBeVisible();
    await expect(page.locator('.saved-reference-note')).toContainText('Meus números');
    await expect(page.locator('.saved-reference-note a')).toHaveAttribute('href','/meus-numeros');
  });

  test('dynamic fields expose label/helper relationships and semantic result announcements',async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto(`${BASE}/salario-liquido.html`,{waitUntil:'networkidle'});
    await ready(page);

    const fields=page.locator('.dynamic-tool-form .field');
    expect(await fields.count()).toBeGreaterThan(0);
    for(let i=0;i<await fields.count();i++){
      const field=fields.nth(i);
      const control=field.locator('input,select,textarea').first();
      const id=await control.getAttribute('id');
      expect(id).toBeTruthy();
      await expect(field.locator(`label[for="${id}"]`)).toHaveCount(1);
      const helper=field.locator('.field-help');
      if(await helper.count()){
        const helperId=await helper.getAttribute('id');
        expect(helperId).toBeTruthy();
        await expect(control).toHaveAttribute('aria-describedby',new RegExp(helperId));
      }
    }
    const result=page.locator('[data-tool-result]');
    await expect(result).toHaveAttribute('role','status');
    await expect(result).toHaveAttribute('aria-live','polite');
  });
});
