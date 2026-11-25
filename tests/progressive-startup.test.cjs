const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=()=>fs.readFileSync(require.resolve('../web/index.html'),'utf8');
test('startup controller is delivered before any original and the workspace is visible',()=>{
 const page=html(),early=page.match(/<script id="startup-progress">([\s\S]*?)<\/script>/);
 assert.ok(early,'early controller must run before the large library arrives');
 assert.ok(Buffer.byteLength(page)<150000,'initial page must not contain the large SVG library');
 assert.doesNotMatch(page,/<main[^>]*id="studio"[^>]*hidden/);
 assert.match(page,/<progress[^>]*id="startup-progressbar"/);
 assert.ok(page.indexOf('id="canvas-stage"')<page.indexOf('id="startup"'));
});
test('streamed progress counts actual originals, reports a stall and resumes without fake advancement',()=>{
 const early=html().match(/<script id="startup-progress">([\s\S]*?)<\/script>/);assert.ok(early,'missing early startup controller');
 const nodes=Object.fromEntries(['startup','startup-status','startup-progressbar','startup-retry'].map(id=>[id,{textContent:'',hidden:true,dataset:{}}]));
 let timer;
 const context=vm.createContext({document:{getElementById:id=>nodes[id]},setTimeout:fn=>(timer=fn,1),clearTimeout:()=>{timer=null;}});
 vm.runInContext(early[1],context);
 context.sobranoStartup.progress({loaded:1,total:40});assert.equal(nodes['startup-progressbar'].value,1);
 timer();assert.match(nodes['startup-status'].textContent,/1 из 40/);assert.equal(nodes['startup-retry'].hidden,false);assert.equal(nodes['startup-progressbar'].value,1);
 for(let loaded=2;loaded<=40;loaded++)context.sobranoStartup.progress({loaded,total:40});
 assert.equal(nodes['startup-progressbar'].value,40);assert.equal(timer,null);
 assert.equal(nodes['startup-retry'].hidden,true);
});
