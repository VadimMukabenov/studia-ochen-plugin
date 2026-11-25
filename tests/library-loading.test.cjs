const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {once}=require('node:events');
const SVG='<svg xmlns="http://www.w3.org/2000/svg"><g id="source"><path d="M0 0L1 1"/></g></svg>';
let loadLibrary;
test.before(async()=>{({loadLibrary}=await import('../web/library-loader.mjs'));});
async function server(t,handler){const s=http.createServer(handler);s.listen(0,'127.0.0.1');await once(s,'listening');t.after(()=>{s.closeAllConnections();s.close();});return `http://127.0.0.1:${s.address().port}/`;}
function cache(){const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),values:m};}
const options={timeoutMs:200,totalTimeoutMs:1000};
test('limits simultaneous asset requests and reports actual completed progress',async t=>{
 let active=0,peak=0;const baseURL=await server(t,(req,res)=>{active++;peak=Math.max(peak,active);setTimeout(()=>{active--;res.end(SVG);},15);});
 const files=Array.from({length:12},(_,i)=>`asset-${i}.svg`),progress=[];
 const assets=await loadLibrary(files,{...options,baseURL,storage:cache(),onProgress:p=>progress.push(p.loaded)});
 assert.equal(Object.keys(assets).length,12);assert.ok(peak<=4,`peak ${peak}`);assert.deepEqual(progress,Array.from({length:13},(_,i)=>i));
});
test('retries a failed HTTP response and rejects HTML before caching',async t=>{
 let calls=0;const baseURL=await server(t,(req,res)=>{calls++;if(calls===1){res.writeHead(503);res.end('unavailable');}else if(calls===2)res.end('<html>temporary proxy page</html>');else res.end(SVG);});const storage=cache();
 const assets=await loadLibrary(['phone.svg'],{...options,baseURL,storage});assert.equal(calls,3);assert.equal(assets['phone.svg'],SVG);assert.deepEqual([...storage.values.values()],[SVG]);
});
test('a stalled response body times out, retries and ends with a recoverable failure',async t=>{
 let calls=0;const baseURL=await server(t,(req,res)=>{calls++;res.writeHead(200);res.write('<svg>');});
 await assert.rejects(loadLibrary(['phone.svg'],{...options,baseURL,timeoutMs:25,totalTimeoutMs:1000,storage:cache()}),/загруз/);assert.equal(calls,3);
});
test('overall deadline cancels pending workers instead of leaving loading forever',async t=>{
 let calls=0;const baseURL=await server(t,()=>{calls++;});
 await assert.rejects(loadLibrary(Array.from({length:12},(_,i)=>`asset-${i}.svg`),{...options,baseURL,timeoutMs:500,totalTimeoutMs:40,storage:cache()}),/загруз/);assert.ok(calls<=4);
});
test('validated cached assets survive reload without a network request',async t=>{
 let calls=0;const baseURL=await server(t,(req,res)=>{calls++;res.end(SVG);});const storage=cache();
 await loadLibrary(['phone.svg','book.svg'],{...options,baseURL,storage});await loadLibrary(['phone.svg','book.svg'],{...options,baseURL,storage});assert.equal(calls,2);
});
test('corrupt cache is discarded and unavailable browser storage does not block loading',async t=>{
 let calls=0;const baseURL=await server(t,(req,res)=>{calls++;res.end(SVG);});const storage=cache();
 await loadLibrary(['phone.svg'],{...options,baseURL,storage});for(const key of storage.values.keys())storage.setItem(key,'<svg><script>alert(1)</script></svg>');
 assert.equal((await loadLibrary(['phone.svg'],{...options,baseURL,storage}))['phone.svg'],SVG);assert.equal(calls,2);
 const unavailable={getItem(){throw Error('storage denied');},setItem(){throw Error('quota');},removeItem(){}};
 assert.equal((await loadLibrary(['phone.svg'],{...options,baseURL,storage:unavailable}))['phone.svg'],SVG);
});
test('uses one compressed library request and caches each validated original',async t=>{
 const {gzipSync}=require('node:zlib');let calls=0;
 const body=gzipSync(JSON.stringify({version:1,files:{'phone.svg':SVG,'book.svg':SVG}}));
 const baseURL=await server(t,(req,res)=>{calls++;res.end(body);});const storage=cache();
 const assets=await loadLibrary(['phone.svg','book.svg'],{...options,baseURL,bundleURL:baseURL+'library.json.gz',storage});
 assert.equal(calls,1);assert.equal(assets['phone.svg'],SVG);assert.equal(assets['book.svg'],SVG);
 await loadLibrary(['phone.svg','book.svg'],{...options,baseURL,bundleURL:baseURL+'library.json.gz',storage});assert.equal(calls,1);
});
test('broken bundle falls back to individual originals without caching unsafe data',async t=>{
 let calls=0;const baseURL=await server(t,(req,res)=>{calls++;res.end(req.url.endsWith('.gz')?'not gzip':SVG);});
 const assets=await loadLibrary(['phone.svg'],{...options,baseURL,bundleURL:baseURL+'library.json.gz',storage:cache()});
 assert.equal(calls,2);assert.equal(assets['phone.svg'],SVG);
});
test('published compressed bundle contains exactly the forty unchanged original SVGs',()=>{
 const fs=require('node:fs'),path=require('node:path'),{gunzipSync}=require('node:zlib');
 const root=path.join(__dirname,'..','web','assets');const bundle=JSON.parse(gunzipSync(fs.readFileSync(path.join(root,'library.json.gz'))));
 const names=fs.readdirSync(root).filter(n=>n.endsWith('.svg')).sort();assert.equal(names.length,40);assert.equal(bundle.version,1);assert.deepEqual(Object.keys(bundle.files).sort(),names);
 for(const name of names)assert.equal(bundle.files[name],fs.readFileSync(path.join(root,name),'utf8'),name);
});
test('embedded originals initialize without any fetch, including when browser storage is denied',async()=>{
 const originalFetch=global.fetch;let calls=0;global.fetch=async()=>{calls++;throw Error('all separate resources blocked');};
 try{const denied={getItem(){throw Error('denied');},setItem(){throw Error('denied');},removeItem(){}};
  const result=await loadLibrary(['phone.svg','book.svg'],{...options,storage:denied,embedded:{version:1,files:{'phone.svg':SVG,'book.svg':SVG}}});
  assert.equal(calls,0);assert.equal(result['phone.svg'],SVG);assert.equal(result['book.svg'],SVG);
 }finally{global.fetch=originalFetch;}
});
