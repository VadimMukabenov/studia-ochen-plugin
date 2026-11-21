const {test,expect}=require('@playwright/test');
async function open(page){await page.addInitScript(()=>{window.sent=[];window.addEventListener('message',e=>{if(e.data.pluginMessage)window.sent.push(e.data.pluginMessage);});});await page.goto('/ui.html');await expect(page.getByText('Собрано',{exact:true})).toBeVisible();}
async function message(page,data){await page.evaluate(d=>window.postMessage({pluginMessage:d},'*'),data);}
test('create submits real UI values and prevents repeat clicks while busy',async({page})=>{
 await open(page);await page.locator('#query input').fill('Телефон, пазлы');await page.locator('#mode select').selectOption('names');await page.locator('#size select').selectOption('S');await page.locator('#create').click();
 await expect.poll(()=>page.evaluate(()=>window.sent.find(m=>m.type==='create'))).toMatchObject({query:'Телефон, пазлы',mode:'names',size:'S',width:1200,height:630});
 await message(page,{type:'busy',busy:true});await expect(page.locator('#create button')).toBeDisabled();await message(page,{type:'error',message:'Исходник недоступен'});await message(page,{type:'busy',busy:false});await expect(page.locator('#status')).toContainText('Исходник недоступен');await expect(page.locator('#create button')).toBeEnabled();
});
test('palette file import is passed intact and invalid JSON is shown',async({page})=>{
 await open(page);const palette={name:'Своя',background:['#ddddee','#aaaacc','#7777aa'],objects:['#ffeebb','#ffaa99','#bbddff'],ink:'#111111',paper:'#ffffff'};
 await page.locator('#palette-file').setInputFiles({name:'my.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(palette))});await expect(page.locator('#palette-name')).toContainText('my.json');await page.locator('#create').click();await expect.poll(()=>page.evaluate(()=>window.sent.find(m=>m.type==='create')?.customPalette)).toBe(JSON.stringify(palette));
 await page.locator('#palette-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await expect(page.locator('#status')).toContainText('JSON');
});
test('SVG message downloads an editable file and unknown data is not executed',async({page})=>{
 await open(page);const svg='<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L1 1"/></svg>';const downloadPromise=page.waitForEvent('download');await message(page,{type:'svg',svg,filename:'test.svg'});const download=await downloadPromise;expect(download.suggestedFilename()).toBe('test.svg');
 await message(page,{type:'result',message:'<img src=x onerror=alert(1)>'});await expect(page.locator('#status')).toHaveText('<img src=x onerror=alert(1)>');await expect(page.locator('#status img')).toHaveCount(0);
});
test('meaning mode submits actual local helper results and shows unavailable helper without creation',async({page})=>{
 await open(page);await page.locator('#mode select').selectOption('meaning');
 await page.route('http://127.0.0.1:18763/resolve',route=>route.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({engine:'multilingual-e5-small',keys:['book','lamp'],reasons:['Знания']})}));
 await page.locator('#create').click();await expect.poll(()=>page.evaluate(()=>window.sent.find(m=>m.type==='create')?.semantic?.keys)).toEqual(['book','lamp']);
 await message(page,{type:'busy',busy:false});await page.unroute('http://127.0.0.1:18763/resolve');await page.route('http://127.0.0.1:18763/resolve',route=>route.abort());
 const before=await page.evaluate(()=>window.sent.filter(m=>m.type==='create').length);await page.locator('#create').click();await expect(page.locator('#status')).toContainText('помощник недоступен');expect(await page.evaluate(()=>window.sent.filter(m=>m.type==='create').length)).toBe(before);
});
