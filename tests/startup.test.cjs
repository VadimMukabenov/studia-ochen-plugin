const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
// Replace only the external module fetch; execute the production bootstrap.
const source=fs.readFileSync(require.resolve('../web/bootstrap.js'),'utf8').replace("import('./app.mjs?startup=20261125')",'loadApp()');
async function boot(loadApp){
 const nodes=Object.fromEntries(['startup-title','startup-status','startup','studio','app-header'].map(id=>[id,{hidden:id==='studio',inert:id==='app-header',dataset:{}}]));
 await vm.runInNewContext(source,{loadApp,document:{getElementById:id=>nodes[id]},setTimeout:(fn,ms)=>setTimeout(fn,ms/1000),clearTimeout});return nodes;
}
test('reveals editor only after assets and scene initialization complete',async()=>{
 const nodes=await boot(async()=>({start:async({onProgress})=>onProgress({loaded:40,total:40})}));
 assert.equal(nodes.startup.hidden,true);assert.equal(nodes.studio.hidden,false);assert.equal(nodes['app-header'].inert,false);
});
test('failed asset initialization keeps unsafe editor hidden and shows recoverable error',async()=>{
 const nodes=await boot(async()=>({start:async()=>{throw Error('network failure');}}));
 assert.equal(nodes.startup.hidden,false);assert.equal(nodes.startup.dataset.state,'error');assert.equal(nodes.studio.hidden,true);assert.equal(nodes['app-header'].inert,true);
});
test('failed or hanging module import ends in the visible recovery screen',async()=>{
 for(const load of [async()=>{throw Error('module unavailable');},()=>new Promise(()=>{})]){
  const nodes=await boot(load);assert.equal(nodes.startup.hidden,false);assert.equal(nodes.startup.dataset.state,'error');assert.equal(nodes.studio.hidden,true);
 }
});
