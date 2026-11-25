const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
test('published small document contains all executable code, styles and icons without external bootstrap dependencies',()=>{
 const html=fs.readFileSync(path.join(root,'web/index.html'),'utf8');
 assert.doesNotMatch(html,/<script\b[^>]*\bsrc\s*=/i,'a blocked external entry script must not stall startup');
 assert.doesNotMatch(html,/<link\b[^>]*rel="stylesheet"/i,'styles must render without a second request');
 assert.doesNotMatch(html,/(?:src|href)="icons\//i,'icons must not require separate downloads');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m=>!m[0].startsWith('<script id="original-library"'));
 assert.ok(scripts.length);for(const m of scripts){assert.doesNotMatch(m[1],/\bimport\s*\(/);new vm.Script(m[1]);}
});
test('bundled dependency graph executes real core and loader with all network disabled',async()=>{
 const html=fs.readFileSync(path.join(root,'web/index.html'),'utf8');
 const data={version:1,files:Object.fromEntries(fs.readdirSync(path.join(root,'web/assets')).filter(n=>n.endsWith('.svg')).map(n=>[n,fs.readFileSync(path.join(root,'web/assets',n),'utf8')]))};
 const runtime=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter(m=>!m[0].startsWith('<script id="original-library"')).at(-1)[1];
 const at=runtime.indexOf('// A visible HTML loading');assert.ok(at>0);
 const context=vm.createContext({structuredClone,AbortController,setTimeout,clearTimeout,fetch:()=>{throw Error('network forbidden');}});
 vm.runInContext(runtime.slice(0,at)+"globalThis.core=require('./core.mjs');globalThis.loader=require('./library-loader.mjs');})();",context);
 const assets=await context.loader.loadLibrary(Object.keys(data.files),{embedded:data,storage:null});assert.equal(Object.keys(assets).length,40);
 const svg=context.core.exportSvg(context.core.createScene(['phone','puzzle']),assets);assert.match(svg,/<svg/);assert.equal((svg.match(/data-instance=/g)||[]).length,2);
});
