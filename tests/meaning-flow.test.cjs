const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../web/app.mjs'),'utf8').replace(/^import .*\n/gm,'').replace(/^export /gm,'');
// Execute the real controller and event handlers. Only DOM rendering and the
// external model response are replaced; scene operations and undo remain real.
async function controller(){
 const C=await import('../web/core.mjs');const elements=new Map();
 function element(id){if(!elements.has(id))elements.set(id,{value:'',hidden:false,style:{},dataset:{},firstElementChild:{textContent:''},classList:{add(){},remove(){}},listeners:{},setAttribute(){},querySelectorAll(){return[];},addEventListener(name,fn){this.listeners[name]=fn;},getBoundingClientRect(){return{width:1200,height:675};},setPointerCapture(){},scrollIntoView(){}});return elements.get(id);}
 let release;const windowHandlers={};
 const context=vm.createContext({C,structuredClone,AbortSignal,innerWidth:1440,location:{hostname:'localhost'},window:{addEventListener(name,fn){windowHandlers[name]=fn;}},document:{getElementById:element,querySelectorAll(){return[];},querySelector:selector=>selector==='dialog[open]'?null:element('studio')},fetch:()=>new Promise(resolve=>{release=resolve;})});
 vm.runInContext(source,context);
 vm.runInContext('render=()=>{};renderCanvas=()=>{};remember=()=>{};backendAvailable=true;setMode("meaning");',context);
 element('prompt').value='свидание с девушкой';element('engine').value='openrouter';
 return {$:element,key:e=>windowHandlers.keydown(e),read:()=>JSON.parse(vm.runInContext('JSON.stringify(scene)',context)),start:()=>vm.runInContext('resolveMeaning()',context),respond:(data,status=200)=>release({ok:status===200,json:async()=>data})};
}
const result={keys:['flowers','wallet','phone'],reason:'Цветы, оплата и связь',engine:'openrouter'};
test('one click creates the scene and one undo restores the entire previous scene',async()=>{
 const c=await controller(),before=c.read();const pending=c.start();c.respond(result);await pending;
 assert.deepEqual(c.read().items.map(i=>i.key),['flowers','wallet','phone']);assert.equal(c.read().title,'свидание с девушкой');
 const built=c.read();c.$('undo').onclick();assert.deepEqual(c.read(),before);c.$('redo').onclick();assert.deepEqual(c.read(),built);
});
test('explicitly uncertain match waits for acceptance; HTTP error preserves the scene',async()=>{
 const c=await controller(),before=c.read();let pending=c.start();c.respond({...result,uncertain:true});await pending;assert.deepEqual(c.read(),before);
 c.$('accept-meaning').onclick();assert.deepEqual(c.read().items.map(i=>i.key),['flowers','wallet','phone']);
 const accepted=c.read();pending=c.start();c.respond({error:'Квота исчерпана'},429);await pending;assert.deepEqual(c.read(),accepted);assert.equal(c.$('message').textContent,'Квота исчерпана');
});
for(const [name,action] of [
 ['mode round trip',c=>{c.$('mode-objects').onclick();c.$('mode-meaning').onclick();}],
 ['query edit and restore',c=>{const p=c.$('prompt'),old=p.value;p.value='другая тема';p.oninput?.();p.value=old;p.oninput?.();}],
 ['engine change and restore',c=>{const e=c.$('engine');e.value='rules';e.onchange();e.value='openrouter';e.onchange();}],
 ['drag started before pointerup',c=>{c.$('canvas-surface').listeners.pointerdown({target:{closest:()=>({dataset:{instance:'item-1'}})},preventDefault(){},clientX:50,clientY:50,pointerId:1});}],
 ['scale input before change',c=>c.$('global-scale').oninput({target:{value:120}})],
 ['project title input before blur',c=>{c.$('project-title').value='Моя правка';c.$('project-title').oninput?.();}],
 ['committed rotation',c=>c.$('rotate-right').onclick()]
])test(`late response preserves user work after ${name}`,async()=>{
 const c=await controller(),pending=c.start();action(c);const edited=c.read();c.respond(result);await pending;assert.deepEqual(c.read(),edited);
});

test('keyboard shortcuts cannot change the scene while startup keeps the editor hidden',async()=>{
 const c=await controller(),before=c.read();c.$('studio').hidden=true;
 c.key({key:'Delete',preventDefault(){},ctrlKey:false,metaKey:false});assert.deepEqual(c.read(),before);
});
