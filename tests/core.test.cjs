const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync,existsSync}=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const context=vm.createContext({console});
if(existsSync('code.ts'))vm.runInContext(ts.transpileModule(readFileSync('code.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2018}}).outputText,context);
const core=vm.runInContext('typeof SobCore === "undefined" ? {} : SobCore',context);
const plain=x=>JSON.parse(JSON.stringify(x));
test('names resolve inflected Russian and English names without adding objects',()=>{
 assert.deepEqual(plain(core.resolve('Телефон, пазлы и BOOK','names').keys),['phone','puzzle','book']);
 assert.deepEqual(plain(core.resolve('кошелёк; монета; кошелек','names').keys),['wallet','coin']);
});
test('partially unknown names do not silently become a different request',()=>{
 assert.throws(()=>core.resolve('телефон, вертолёт','names'),/вертолет/i);
 assert.throws(()=>core.resolve('','names'),/запрос/i);
});
test('metaphor maps learning and savings to actual catalog families',()=>{
 const study=core.resolve('Учиться в своём темпе','meaning');
 assert.ok(study.keys.includes('book'));
 assert.ok(study.keys.includes('headphones'));
 const savings=core.resolve('Сбережения на будущее','meaning');
 assert.ok(savings.keys.includes('wallet'));
 assert.ok(savings.keys.includes('coin'));
 assert.ok(study.reasons.length>0);
});
test('unknown metaphor fails and explicitly excluded objects stay excluded',()=>{
 assert.throws(()=>core.resolve('квантовая телепортация','meaning'),/Не наш/i);
 assert.ok(!core.resolve('учеба без телефона','meaning').keys.includes('phone'));
});
test('S and background are original variants, never a scaled L substitute',()=>{
 const p=core.plan(['phone','book'],'S',1200,630,'compact',true);
 assert.equal(p.items.find(x=>x.family==='phone').sourceId,'24:4746');
 assert.equal(p.items.find(x=>x.family==='book').sourceId,'24:6934');
 const l=core.plan(['phone'],'L',1200,630,'compact',false);
 assert.equal(l.items[0].sourceId,'21:25472');
});
test('all objects share one scale and stay inside square, banner and portrait',()=>{
 for(const [w,h] of [[1000,1000],[1200,630],[800,1200]])for(const layout of ['compact','diagonal','editorial']){
 const p=core.plan(['book','lamp','headphones','coin'],'L',w,h,layout,true);
 for(const n of p.items){assert.ok(Math.abs(n.width/n.originalWidth-p.scale)<1e-9);assert.ok(Math.abs(n.height/n.originalHeight-p.scale)<1e-9);assert.ok(n.x>=0&&n.y>=0&&n.x+n.width<=w+1e-6&&n.y+n.height<=h+1e-6);}
 assert.ok(p.items.some(x=>x.role==='main'));
 }
});
test('bad sizes and invalid families fail before a scene is made',()=>{
 for(const dim of [0,NaN,Infinity,99,5000])assert.throws(()=>core.plan(['book'],'L',dim,630,'compact',false));
 assert.throws(()=>core.plan(['helicopter'],'L',1200,630,'compact',false));
 assert.throws(()=>core.plan(['book'],'XL',1200,630,'compact',false));
});
test('palette import requires named roles and rejects invalid or unreadable ink',()=>{
 const input={name:'Моя',background:['#f0f0f0','#b0b0b0','#808080'],objects:['#facc15','#f87171','#bfdbfe'],ink:'#111111',paper:'#ffffff'};
 const p=core.parsePalette(JSON.stringify(input));
 assert.equal(p.name,'Моя');assert.equal(p.colors.length,8);
 assert.deepEqual(plain(p.colors[0]),{r:240/255,g:240/255,b:240/255});
 assert.throws(()=>core.parsePalette('{oops'));
 assert.throws(()=>core.parsePalette(JSON.stringify({...input,objects:['red']})));
 assert.throws(()=>core.parsePalette(JSON.stringify({...input,ink:'#ffffff'})),/контраст/i);
});
test('recolour uses palette roles and preserves an exact original when unchanged',()=>{
 const a=core.palettes[0],b=core.palettes[1];
 assert.deepEqual(plain(core.mapColor(a.colors[0],a,b)),plain(b.colors[0]));
 assert.deepEqual(plain(core.mapColor(a.colors[4],a,b)),plain(b.colors[4]));
 assert.deepEqual(plain(core.mapColor(b.colors[4],b,a)),plain(a.colors[4]));
 const unusual={r:.09,g:.08,b:.03};assert.deepEqual(plain(core.mapColor(unusual,a,a)),unusual);
});
