import {assetBody,palettes} from './core.mjs';
const cachePrefix='sobrano-original-v1:';
const failed=()=>new Error('Загрузка иллюстраций прервалась. Повторите загрузку.');

// The originals are immutable. Cache only SVGs validated by the same parser as
// the renderer; partial successes remain available after a network interruption.
export async function loadLibrary(files,{baseURL='assets/',storage,onProgress=()=>{},timeoutMs=8000,totalTimeoutMs=90000,bundleURL,bundleTimeoutMs=60000,embedded}={}){
  if(!Array.isArray(files)||files.some(name=>!/^[-a-zA-Z0-9]+\.svg$/.test(name)))throw failed();
  files=[...new Set(files)];
  if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
  const assets={},stop=new AbortController();let cursor=0,loaded=0;
  const deadline=setTimeout(()=>stop.abort(),totalTimeoutMs);
  const valid=raw=>{assetBody(raw,palettes[0]);return raw;};
  onProgress({loaded,total:files.length});
  function cached(name){
    const key=cachePrefix+name;
    try{const raw=storage?.getItem(key);if(raw!==null&&raw!==undefined)return valid(raw);}catch{try{storage?.removeItem(key);}catch{}}
  }
  function complete(name,raw){
    assets[name]=raw;try{storage?.setItem(cachePrefix+name,raw);}catch{}
    loaded++;onProgress({loaded,total:files.length});
  }
  async function read(name){
    for(let attempt=0;attempt<3;attempt++){
      if(stop.signal.aborted)throw failed();
      const request=new AbortController(),cancel=()=>request.abort();
      stop.signal.addEventListener('abort',cancel,{once:true});
      const timer=setTimeout(cancel,timeoutMs);
      try{
        const response=await fetch(baseURL+name,{signal:request.signal});
        if(!response.ok)throw failed();
        const raw=valid(await response.text());
        return raw;
      }catch{if(stop.signal.aborted||attempt===2)throw failed();}
      finally{clearTimeout(timer);stop.signal.removeEventListener('abort',cancel);}
    }
  }
  if(embedded!==undefined){
    try{
      if(embedded?.version!==1||!embedded.files||Array.isArray(embedded.files))throw failed();
      const batch=files.map(name=>[name,valid(embedded.files[name])]);
      for(const [name,raw] of batch)complete(name,raw);
      return assets;
    }finally{clearTimeout(deadline);}
  }
  const pending=files.filter(name=>{const raw=cached(name);if(raw!==undefined){complete(name,raw);return false;}return true;});
  // A single gzip transfer avoids forty CDN round trips on a cold visit.
  // Individual originals remain a fallback for older browsers or a failed bundle.
  if(pending.length&&bundleURL&&typeof DecompressionStream==='function'){
    const request=new AbortController(),cancel=()=>request.abort();
    stop.signal.addEventListener('abort',cancel,{once:true});
    const timer=setTimeout(cancel,bundleTimeoutMs);
    try{
      const response=await fetch(bundleURL,{signal:request.signal});if(!response.ok)throw failed();
      const bundle=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).json();
      if(bundle.version!==1||!bundle.files||Array.isArray(bundle.files))throw failed();
      const batch=pending.map(name=>[name,valid(bundle.files[name])]);
      for(const [name,raw] of batch)complete(name,raw);
      pending.length=0;
    }catch{}
    finally{clearTimeout(timer);stop.signal.removeEventListener('abort',cancel);}
  }
  async function worker(){
    while(cursor<pending.length){
      if(stop.signal.aborted)throw failed();
      const name=pending[cursor++];complete(name,await read(name));
    }
  }
  const tasks=Array.from({length:Math.min(4,pending.length)},()=>worker());
  try{await Promise.all(tasks);if(stop.signal.aborted)throw failed();return assets;}
  catch(error){stop.abort();await Promise.allSettled(tasks);throw error;}
  finally{clearTimeout(deadline);}
}
