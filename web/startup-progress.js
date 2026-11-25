// Runs as soon as the small workspace shell arrives, before requesting the original SVGs.
globalThis.sobranoStartup=(()=>{
  const panel=document.getElementById('startup');
  const status=document.getElementById('startup-status');
  const bar=document.getElementById('startup-progressbar');
  const retry=document.getElementById('startup-retry');
  let loaded=0,timer;
  function watch(){
    clearTimeout(timer);
    if(loaded===40)return;
    timer=setTimeout(()=>{
      panel.dataset.state='slow';
      status.textContent=`Соединение медленное. Получено ${loaded} из 40. Продолжаем загрузку…`;
      retry.hidden=false;
    },15000);
  }
  function progress(result){
    loaded=result.loaded;
    bar.value=loaded;
    status.textContent=`Загружаем иллюстрации: ${loaded} из 40`;
    panel.dataset.state='loading';
    retry.hidden=true;
    watch();
  }
  watch();
  return {progress,finish(){clearTimeout(timer);}};
})();
