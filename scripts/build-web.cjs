const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..'),web=path.join(root,'web');
function read(name){return fs.readFileSync(path.join(web,name),'utf8');}
const safeScript=s=>s.replace(/<\/script/gi,'<\\/script');
const iconUrls=Object.fromEntries(fs.readdirSync(path.join(web,'icons')).filter(n=>n.endsWith('.svg')).map(n=>[n.slice(0,-4),'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(read('icons/'+n))]));
const files=Object.fromEntries(fs.readdirSync(path.join(web,'assets')).filter(n=>n.endsWith('.svg')).sort().map(n=>[n,read('assets/'+n)]));
const modules=['catalog.mjs','core.mjs','library-loader.mjs','app.mjs'].map(name=>{
 let source=read(name);
 if(name==='app.mjs')source=source.replace('icon=name=>`<img src="icons/${name}.svg" alt="">`','icon=name=>`<img src="${__iconUrls[name]}" alt="">`');
 const code=ts.transpileModule(source,{fileName:name.replace('.mjs','.ts'),compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 return JSON.stringify('./'+name)+':function(module,exports,require){\n'+code+'\n}';
}).join(',\n');
const bootstrap=read('bootstrap.js').replace(/import\('\.\/app\.mjs\?startup=[^']+'\)/,"Promise.resolve(require('./app.mjs'))");
if(/\bimport\s*\(/.test(bootstrap))throw Error('Unbundled dynamic import in bootstrap');
const runtime=`(()=>{const __iconUrls=${JSON.stringify(iconUrls)};const factories={${modules}};const cache={};function require(name){name=name.split('?')[0];if(cache[name])return cache[name].exports;if(!factories[name])throw Error('Unknown editor module');const module={exports:{}};cache[name]=module;factories[name](module,module.exports,require);return module.exports;}\n${bootstrap}\n})();`;
let css=read('styles.css').replace(/url\("icons\/([^"/]+)\.svg"\)/g,(_,name)=>'url("'+iconUrls[name]+'")');
let html=read('editor.template.html').replace(/<link rel="stylesheet" href="[^"]+">/,()=>'<style>'+css+'</style>').replace(/(?:src|href)="icons\/([^"/]+)\.svg"/g,(_,name)=>'src="'+iconUrls[name]+'"');
// Favicon is a link, unlike all other icon references.
html=html.replace('<link rel="icon" src=','<link rel="icon" href=');
const embedded=JSON.stringify({version:1,files}).replace(/</g,'\\u003c');
html=html.replace(/<script src="bootstrap\.js[^\"]*" defer><\/script>/,()=>'<script id="original-library" type="application/json">'+embedded+'</script><script>'+safeScript(runtime)+'</script>');
if(process.argv.includes('--check')){if(html!==read('index.html')){console.error('Generated web/index.html is stale. Run npm run build:web.');process.exitCode=1;}}
else{fs.writeFileSync(path.join(web,'index.html'),html);console.log('Built self-contained web/index.html ('+Buffer.byteLength(html)+' bytes)');}
