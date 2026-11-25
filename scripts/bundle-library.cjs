const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
const root=path.join(__dirname,'..','web','assets');
const files=Object.fromEntries(fs.readdirSync(root).filter(f=>f.endsWith('.svg')).sort().map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')]));
fs.writeFileSync(path.join(root,'library.json.gz'),zlib.gzipSync(JSON.stringify({version:1,files}),{level:9}));
