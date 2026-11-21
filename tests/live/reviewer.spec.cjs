const {test,expect}=require('@playwright/test');
test('reviewer landing page uses real CPU model and provides complete plugin ZIP',async({page})=>{
 await page.goto('/');if(process.env.SOBRANO_DEMO)await page.waitForTimeout(2500);await expect(page.getByRole('heading',{name:'Собрано',exact:true})).toBeVisible();
 for(const [query,expected] of [['Учиться новому каждый день','Книга'],['Копить на мечту','Монета'],['Общение на расстоянии','Телефон']]){
  await page.getByLabel('Проверить смысловой поиск').fill(query);await page.getByRole('button',{name:'Подобрать предметы'}).click();await expect(page.locator('#result')).toContainText(expected);await expect(page.getByRole('button',{name:'Подобрать предметы'})).toBeEnabled();if(process.env.SOBRANO_DEMO)await page.waitForTimeout(3500);
 }
 await page.getByLabel('Проверить смысловой поиск').fill('Рецепт борща');await page.getByRole('button',{name:'Подобрать предметы'}).click();await expect(page.locator('#result')).toContainText('Уточните');
 const downloadEvent=page.waitForEvent('download');await page.getByRole('link',{name:'Скачать плагин ↓'}).click();const download=await downloadEvent;expect(download.suggestedFilename()).toBe('sobrano-plugin.zip');
 await page.getByLabel('Проверить смысловой поиск').fill('Учиться новому каждый день');await page.getByRole('button',{name:'Подобрать предметы'}).click();await expect(page.locator('#result')).toContainText('Книга');await expect(page.locator('.examples img')).toHaveCount(3);
 await page.screenshot({path:'docs/runtime.png',fullPage:true});
});
