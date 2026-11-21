"""Real runtime HTTP/model integration. Run after Compose reports Ready."""
import urllib.request,urllib.error,json,time,io,zipfile
CASES=[('Учиться новому каждый день','book'),('Копить на мечту','coin'),('Работать вместе над сложной задачей','puzzle'),('Тишина помогает сосредоточиться','headphones'),('Найти светлую идею','lamp'),('Общение на расстоянии','phone'),('Рецепт борща',None),('Полет на Марс',None),('asdf qwerty',None),('Сбережения без монет',None)]
def run(base='http://127.0.0.1:18763'):
    assert json.load(urllib.request.urlopen(base+'/health',timeout=5))['ready']
    results=[]
    for query,expected in CASES:
        start=time.monotonic();req=urllib.request.Request(base+'/resolve',data=json.dumps({'query':query}).encode(),headers={'Content-Type':'application/json','X-Sobrano-Client':'1'})
        try:
            with urllib.request.urlopen(req,timeout=30) as response: result=json.load(response);status=response.status
        except urllib.error.HTTPError as e:status=e.code;result=json.load(e)
        passed=(status==400) if expected is None else (status==200 and result['keys'][0]==expected)
        results.append({'query':query,'expectedTop':expected,'status':status,'response':result,'seconds':round(time.monotonic()-start,3),'pass':passed})
    package=urllib.request.urlopen(base+'/sobrano-plugin.zip',timeout=5).read()
    with zipfile.ZipFile(io.BytesIO(package)) as archive:
        assert set(archive.namelist())=={'code.js','manifest.json','ui.html'}
        manifest=json.loads(archive.read('manifest.json'));assert manifest['main']=='code.js'
        assert b'localhost' not in archive.read('ui.html') # fixed loopback IP
    assert b'Figma' in urllib.request.urlopen(base+'/',timeout=5).read()
    for filename in ['1-learning.svg','2-connection.svg','3-savings.svg']:
        svg=urllib.request.urlopen(base+'/examples/'+filename,timeout=5).read();assert b'<svg' in svg and b'<image' not in svg
    print(json.dumps({'cases':results,'zipVerified':True},ensure_ascii=False,indent=2))
    assert all(x['pass'] for x in results),'See failed real model cases above'
if __name__=='__main__':run()
