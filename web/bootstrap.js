// A visible HTML loading screen exists even if this small script cannot load.
(async()=>{
  const title=document.getElementById('startup-title'),status=document.getElementById('startup-status');
  let timer;
  try{
    const app=await Promise.race([
      import('./app.mjs?startup=20261125-3'),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('module timeout')),30000);})
    ]);
    clearTimeout(timer);
    await app.start({onProgress:({loaded,total})=>{status.textContent=loaded?`Загружаем иллюстрации: ${loaded} из ${total}`:`Загружаем библиотеку (${total} иллюстраций)…`;}});
    document.getElementById('startup').hidden=true;
    document.getElementById('app-header').inert=false;
    document.getElementById('studio').hidden=false;
  }catch{
    title.textContent='Не удалось загрузить редактор';
    status.textContent='Соединение прервалось или ответ занял слишком много времени. Нажмите «Повторить загрузку». Уже загруженные иллюстрации сохранены на этом устройстве.';
    document.getElementById('startup').dataset.state='error';
  }finally{clearTimeout(timer);}
})();
