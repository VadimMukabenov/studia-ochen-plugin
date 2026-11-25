import {assetBody,palettes} from './core.mjs';
const cachePrefix='sobrano-original-v1:';
const failed=()=>new Error('Загрузка иллюстраций прервалась. Повторите загрузку.');

// The originals are immutable. Cache only SVGs validated by the same parser as
// the renderer; partial successes remain available after a network interruption.
export async function loadLibrary(files,{baseURL='assets/',storage,onProgress=()=>{},timeoutMs=8000,totalTimeoutMs=30000}={}){
  if(!Array.isArray(files)||files.some(name=>!/^[-a-zA-Z0-9]+\.svg$/.test(name)))throw failed();
  files=[...new Set(files)];
  if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
  const assets={},stop=new AbortController();let cursor=0,loaded=0;
  const deadline=setTimeout(()=>stop.abort(),totalTimeoutMs);
  const valid=raw=>{assetBody(raw,palettes[0]);return raw;};
  onProgress({loaded,total:files.length});
  async function read(name){
    const key=cachePrefix+name;
    try{const raw=storage?.getItem(key);if(raw!==null&&raw!==undefined)return valid(raw);}catch{try{storage?.removeItem(key);}catch{}}
    for(let attempt=0;attempt<3;attempt++){
      if(stop.signal.aborted)throw failed();
      const request=new AbortController(),cancel=()=>request.abort();
      stop.signal.addEventListener('abort',cancel,{once:true});
      const timer=setTimeout(cancel,timeoutMs);
      try{
        const response=await fetch(baseURL+name,{signal:request.signal});
        if(!response.ok)throw failed();
        const raw=valid(await response.text());
        try{storage?.setItem(key,raw);}catch{}
        return raw;
      }catch{if(stop.signal.aborted||attempt===2)throw failed();}
      finally{clearTimeout(timer);stop.signal.removeEventListener('abort',cancel);}
    }
  }
  async function worker(){
    while(cursor<files.length){
      if(stop.signal.aborted)throw failed();
      const name=files[cursor++];assets[name]=await read(name);loaded++;
      onProgress({loaded,total:files.length});
    }
  }
  const tasks=Array.from({length:Math.min(4,files.length)},()=>worker());
  try{await Promise.all(tasks);return assets;}
  catch(error){stop.abort();await Promise.allSettled(tasks);throw error;}
  finally{clearTimeout(deadline);}
}
