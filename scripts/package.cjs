// Reproducible source archive from an explicit allowlist; excludes caches/secrets.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const files=['Dockerfile','compose.yaml','.dockerignore','.gitignore','README.md','code.ts','ui.html','manifest.json','package.json','package-lock.json','tsconfig.json','playwright.config.cjs','playwright.live.config.cjs'];
for(const dir of ['docs','examples','helper','scripts','tests','prototype/assets','installer','.github']){
 function walk(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){if(['model','__pycache__'].includes(f.name))continue;const p=path.join(d,f.name);if(f.isDirectory())walk(p);else files.push(p);}}walk(dir);
}
files.push('source/catalog.json','prototype/index.html','prototype/README.md');
fs.mkdirSync('dist',{recursive:true});
// Python is available in the Docker build/runtime, or on a developer machine.
const program='import json,sys,zipfile; names=json.load(sys.stdin); z=zipfile.ZipFile("dist/sobrano-source.zip","w",zipfile.ZIP_DEFLATED); [z.write(n,"sobrano/"+n) for n in names]; z.close()';
cp.execFileSync(process.env.PYTHON||'python3',['-c',program],{input:JSON.stringify([...new Set(files)].sort())});
console.log('dist/sobrano-source.zip');
