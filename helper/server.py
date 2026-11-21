"""Loopback-only semantic retrieval; never generates or edits artwork."""
from http.server import HTTPServer,BaseHTTPRequestHandler
from pathlib import Path
import json,os,threading,io,zipfile,re
import numpy as np
from helper.download_model import ROOT,REVISION
CATALOG=json.loads((Path(__file__).with_name('catalog.json')).read_text(encoding='utf-8'))

def validate_query(body):
    q=body.get('query') if isinstance(body,dict) else None
    if not isinstance(q,str) or not 1<=len(q.strip())<=500:
        raise ValueError('Введите запрос длиной от 1 до 500 символов.')
    if re.search(r'(?i)(?:\bбез\b|\bне\b|\bисключ\w*)',q):
        raise ValueError('Отрицания и сложные ограничения пока не поддерживаются. Укажите смысл без них или выберите предметы по названиям.')
    return q.strip()

def pool(hidden,mask):
    averaged=(hidden*mask[:,:,None]).sum(axis=1)/mask.sum(axis=1)[:,None]
    return averaged/np.maximum(np.linalg.norm(averaged,axis=1,keepdims=True),1e-12)

def rank(keys,scores):
    ordered=sorted(zip(keys,map(float,scores)),key=lambda x:x[1],reverse=True)
    if not ordered or ordered[0][1]<.82 or (len(ordered)>1 and ordered[0][1]-ordered[1][1]<.005):
        raise ValueError('Смысл неоднозначен для этой библиотеки. Уточните запрос или выберите предметы по названиям.')
    return [k for k,s in ordered[:3] if s>=max(.82,ordered[0][1]-.025)]

class Engine:
    def __init__(self):
        from tokenizers import Tokenizer
        import onnxruntime as ort
        self.tokenizer=Tokenizer.from_file(str(ROOT/'tokenizer.json'))
        self.tokenizer.enable_truncation(max_length=192)
        self.tokenizer.enable_padding(pad_id=1,pad_token='<pad>')
        options=ort.SessionOptions();options.intra_op_num_threads=min(4,os.cpu_count() or 1)
        self.session=ort.InferenceSession(str(ROOT/'onnx/model.onnx'),sess_options=options,providers=['CPUExecutionProvider'])
        self.inputs={x.name for x in self.session.get_inputs()}
        self.vectors=self.embed(['passage: '+x['description'] for x in CATALOG])
        self.lock=threading.Lock()
    def embed(self,texts):
        tokens=self.tokenizer.encode_batch(texts)
        ids=np.array([t.ids for t in tokens],dtype=np.int64)
        mask=np.array([t.attention_mask for t in tokens],dtype=np.int64)
        feed={'input_ids':ids,'attention_mask':mask,'token_type_ids':np.zeros_like(ids)}
        hidden=self.session.run(None,{k:v for k,v in feed.items() if k in self.inputs})[0]
        return pool(hidden,mask)
    def resolve(self,query):
        with self.lock: scores=(self.embed(['query: '+query])@self.vectors.T)[0]
        keys=rank([x['key'] for x in CATALOG],scores)
        return {'keys':keys,'reasons':[next(x['name']+': '+x['description'] for x in CATALOG if x['key']==k) for k in keys],
                'engine':'multilingual-e5-small','revision':REVISION,
                'scores':{x['key']:round(float(s),4) for x,s in zip(CATALOG,scores)}}

def make_server(engine,port=18763):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self,*args): pass # Never log prompts.
        def setup(self):
            super().setup();self.connection.settimeout(15)
        def send(self,status,data):
            payload=json.dumps(data,ensure_ascii=False).encode()
            self.send_response(status)
            self.send_header('Content-Type','application/json; charset=utf-8')
            self.send_header('Content-Length',str(len(payload)))
            self.send_header('Access-Control-Allow-Origin','*') # Figma plugin iframe has opaque origin.
            self.send_header('Cache-Control','no-store')
            self.end_headers();self.wfile.write(payload)
        def do_OPTIONS(self):
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin','*')
            self.send_header('Access-Control-Allow-Methods','POST, GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers','Content-Type, X-Sobrano-Client')
            self.send_header('Access-Control-Allow-Private-Network','true')
            self.end_headers()
        def valid_host(self):
            return self.headers.get('Host') in (f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}')
        def do_GET(self):
            if not self.valid_host(): return self.send(403,{'error':'Invalid host'})
            if self.path=='/health':return self.send(200,{'ready':True,'engine':'multilingual-e5-small','revision':REVISION})
            app=Path(__file__).resolve().parent.parent
            examples={f'/examples/{n}':n for n in ('1-learning.svg','2-connection.svg','3-savings.svg')}
            if self.path in examples:
                payload=(app/'examples'/examples[self.path]).read_bytes();self.send_response(200);self.send_header('Content-Type','image/svg+xml');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload);return
            if self.path in ('/','/palette.json','/sobrano-plugin.zip'):
                if self.path=='/': payload=(app/'helper/index.html').read_bytes();mime='text/html; charset=utf-8'
                elif self.path=='/palette.json':payload=(app/'examples/palette.json').read_bytes();mime='application/json'
                else:
                    buf=io.BytesIO()
                    with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as archive:
                        for name in ('manifest.json','code.js','ui.html'):archive.write(app/'dist'/name,name)
                    payload=buf.getvalue();mime='application/zip'
                self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload);return
            self.send(404,{'error':'Not found'})
        def do_POST(self):
            if not self.valid_host() or self.headers.get('X-Sobrano-Client')!='1':return self.send(403,{'error':'Invalid client'})
            if self.path!='/resolve':return self.send(404,{'error':'Not found'})
            try:
                length=int(self.headers.get('Content-Length','0'))
                if not 0<length<=4096: raise ValueError('Слишком большой или пустой запрос.')
                if self.headers.get_content_type()!='application/json':raise ValueError('Нужен JSON.')
                body=json.loads(self.rfile.read(length));query=validate_query(body)
                self.send(200,engine.resolve(query))
            except (ValueError,UnicodeError) as e: self.send(400,{'error':str(e)})
            except Exception: self.send(500,{'error':'Ошибка локальной модели. Перезапустите помощник.'})
    return HTTPServer((os.environ.get('SOB_BIND','127.0.0.1'),port),Handler)

if __name__=='__main__':
    print('Loading local CPU model…',flush=True)
    engine=Engine();server=make_server(engine)
    print('Ready: http://127.0.0.1:18763 · prompts stay on this computer · Ctrl+C to stop',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
