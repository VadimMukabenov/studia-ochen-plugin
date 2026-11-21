"""Download only official ONNX CPU weights and tokenizer at an immutable revision."""
from pathlib import Path
import hashlib,json,urllib.request,os
MODEL='intfloat/multilingual-e5-small'
REVISION='614241f622f53c4eeff9890bdc4f31cfecc418b3'
ROOT=Path(os.environ.get('SOB_MODEL_DIR',str(Path(__file__).resolve().parent/'model')))
FILES=('onnx/model.onnx','tokenizer.json','README.md')
def download():
    ROOT.mkdir(parents=True,exist_ok=True)
    entries={'onnx/model.onnx':{'sha256':'ca456c06b3a9505ddfd9131408916dd79290368331e7d76bb621f1cba6bc8665'},'tokenizer.json':{'sha256':'0b44a9d7b51c3c62626640cda0e2c2f70fdacdc25bbbd68038369d14ebdf4c39'},'README.md':{}}
    for name in FILES:
        path=ROOT/name;path.parent.mkdir(parents=True,exist_ok=True)
        entry=entries[name];expected=entry.get('sha256')
        if path.exists() and (not expected or hashlib.file_digest(path.open('rb'),'sha256').hexdigest()==expected):
            print('Cached:',name,flush=True);continue
        print('Downloading:',name,flush=True)
        temp=path.with_suffix('.part')
        with urllib.request.urlopen(f'https://huggingface.co/{MODEL}/resolve/{REVISION}/{name}',timeout=120) as src, temp.open('wb') as out:
            while chunk:=src.read(1024*1024): out.write(chunk)
        if expected and hashlib.file_digest(temp.open('rb'),'sha256').hexdigest()!=expected:
            temp.unlink();raise RuntimeError('Model checksum mismatch')
        os.replace(temp,path)
    print('Model ready:',ROOT,flush=True)
if __name__=='__main__': download()
