const fs=require('node:fs'),ts=require('typescript');
fs.mkdirSync('dist',{recursive:true});
const result=ts.transpileModule(fs.readFileSync('code.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2018}});
fs.writeFileSync('dist/code.js',result.outputText);
for(const f of ['manifest.json','ui.html'])fs.copyFileSync(f,'dist/'+f);
console.log('Built dist/manifest.json, code.js, ui.html');
