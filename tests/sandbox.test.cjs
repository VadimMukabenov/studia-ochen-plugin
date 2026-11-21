const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const ts=require('typescript');const fs=require('node:fs');
const data=JSON.parse(fs.readFileSync('source/catalog.json','utf8'));
function setup(missing){
 let serial=0;const nodes=new Map(),messages=[];let current;
 class Node{
 constructor(type,name,id){this.type=type;this.name=name;this.id=id||'test:'+ ++serial;this.children=[];this.width=100;this.height=100;this.x=0;this.y=0;this.rotation=0;this.fills=[];this.strokes=[];this.data={};this.removed=false;nodes.set(this.id,this);}
 appendChild(n){if(n.parent)n.parent.children.splice(n.parent.children.indexOf(n),1);this.children.push(n);n.parent=this;}
 insertChild(i,n){this.appendChild(n);this.children.splice(this.children.indexOf(n),1);this.children.splice(i,0,n);}
 resize(w,h){this.width=w;this.height=h;}
 rescale(s){this.width*=s;this.height*=s;for(const c of this.children)c.rescale(s);}
 clone(){const n=new Node(this.type,this.name);n.width=this.width;n.height=this.height;n.fills=JSON.parse(JSON.stringify(this.fills));n.strokes=JSON.parse(JSON.stringify(this.strokes));n.data={...this.data};n.rotation=this.rotation;for(const c of this.children)n.appendChild(c.clone());if(this.parent)this.parent.appendChild(n);return n;}
 remove(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);this.removed=true;nodes.delete(this.id);}
 setPluginData(k,v){this.data[k]=v;}getPluginData(k){return this.data[k]||'';}setRelaunchData(){}async loadAsync(){}
 async exportAsync(){return '<svg xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0L1 1"/></g></svg>';}
 }
 const root=new Node('DOCUMENT','Document','0:0'),lib=new Node('PAGE','Библиотека компонентов','0:1');root.appendChild(lib);lib.selection=[];current=lib;
 for(const f of data.families)for(const v of f.variants){if(v.id===missing)continue;const n=new Node('GROUP',f.name,v.id);n.width=v.width;n.height=v.height;lib.appendChild(n);const leaf=new Node('VECTOR','Vector');leaf.fills=[{type:'SOLID',color:{...data.palettes[0].colors[4]},opacity:1}];n.appendChild(leaf);}
 const figma={root,get currentPage(){return current;},viewport:{center:{x:0,y:0},scrollAndZoomIntoView(){}},ui:{postMessage:m=>messages.push(m),resize(){}},showUI(){},on(){},notify(){},async getNodeByIdAsync(id){return nodes.get(id)||null;},async setCurrentPageAsync(p){current=p;},createPage(){const p=new Node('PAGE','New page');p.selection=[];root.appendChild(p);return p;},createFrame(){const n=new Node('FRAME','Frame');current.appendChild(n);return n;}};
 const ctx=vm.createContext({figma,__html__:'',console});vm.runInContext(ts.transpileModule(fs.readFileSync('code.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2018}}).outputText,ctx);
 return {figma,lib,nodes,messages,Node,async send(message){await figma.ui.onmessage(message);},scene(){return root.children.flatMap(p=>p.children).find(n=>n.type==='FRAME');}};
}
const request={type:'create',mode:'names',query:'Телефон, пазлы',size:'S',width:1200,height:630,layout:'compact',backgrounds:false,paletteIndex:0};
test('create produces owned native groups and leaves original library unchanged',async()=>{
 const s=setup();const originalCount=s.lib.children.length;
 await s.send(request);const scene=s.scene();assert.ok(scene);assert.equal(scene.width,1200);assert.equal(scene.children.length,2);assert.equal(s.lib.children.length,originalCount);assert.ok(scene.children[0].getPluginData('sob-object').includes('24:4746'));assert.ok(s.messages.some(m=>m.type==='result'));
});
test('missing source fails before any output page or scene is created',async()=>{
 const s=setup('24:4746');await s.send(request);assert.equal(s.scene(),undefined);assert.equal(s.figma.root.children.length,1);assert.ok(s.messages.some(m=>m.type==='error'));
});
test('mutating an original selection is refused',async()=>{
 const s=setup();s.figma.currentPage.selection=[s.nodes.get('21:25472')];await s.send({type:'action',action:'delete'});assert.ok(s.nodes.has('21:25472'));assert.ok(s.messages.some(m=>m.type==='error'));
});
test('recolour twice preserves original source and paint roles',async()=>{
 const s=setup();await s.send(request);const scene=s.scene(),first=scene.children[0];s.figma.currentPage.selection=[scene];
 await s.send({type:'recolor',paletteIndex:1});assert.equal(first.children[0].fills[0].color.r,data.palettes[1].colors[4].r);
 await s.send({type:'recolor',paletteIndex:2});assert.equal(first.children[0].fills[0].color.b,data.palettes[2].colors[4].b);
 await s.send({type:'recolor',paletteIndex:0});assert.deepEqual(JSON.parse(JSON.stringify(first.children[0].fills[0].color)),data.palettes[0].colors[4]);
});
test('duplicate, rotate and delete operate on owned whole objects',async()=>{
 const s=setup();await s.send(request);const scene=s.scene();s.figma.currentPage.selection=[scene.children[0]];
 await s.send({type:'action',action:'duplicate'});assert.equal(scene.children.length,3);
 await s.send({type:'action',action:'rotate-right'});assert.equal(s.figma.currentPage.selection[0].rotation,15);
 await s.send({type:'action',action:'delete'});assert.equal(scene.children.length,2);
});
test('SVG export includes provenance and rejects a raster inserted into the scene',async()=>{
 const s=setup();await s.send(request);const scene=s.scene();s.figma.currentPage.selection=[scene];await s.send({type:'export'});
 const msg=s.messages.find(m=>m.type==='svg');assert.ok(msg.svg.includes('24:4746'));assert.ok(!msg.svg.includes('<image'));
 const foreign=new s.Node('RECTANGLE','Image');foreign.fills=[{type:'IMAGE',imageHash:'abc'}];scene.appendChild(foreign);const before=s.messages.filter(m=>m.type==='svg').length;await s.send({type:'export'});assert.equal(s.messages.filter(m=>m.type==='svg').length,before);assert.ok(s.messages.at(-1).type==='state'||s.messages.at(-1).type==='error');
});
test('meaning requires validated local-model results and never silently uses dictionary',async()=>{
 const s=setup();await s.send({...request,mode:'meaning',query:'новые горизонты'});assert.equal(s.scene(),undefined);assert.ok(s.messages.some(m=>m.type==='error'));
 await s.send({...request,mode:'meaning',query:'новые горизонты',semantic:{keys:['book','lamp'],engine:'multilingual-e5-small',reasons:['Знания и идеи']}});assert.equal(s.scene().children.length,2);assert.ok(s.scene().children.some(n=>n.name.includes('Книга')));
 const invalid=setup();await invalid.send({...request,mode:'meaning',semantic:{keys:['invented'],engine:'multilingual-e5-small'}});assert.equal(invalid.scene(),undefined);
});
test('source scheme is inferred and semantic paint slots survive cross-palette recolour',async()=>{
 const s=setup();const source=s.nodes.get('24:4746');source.children[0].fills=[{type:'SOLID',color:data.palettes[1].colors[5]}];const unique=new s.Node('VECTOR','unique');unique.fills=[{type:'SOLID',color:data.palettes[1].colors[2]}];source.appendChild(unique);
 await s.send({...request,paletteIndex:2});const scene=s.scene();assert.ok(scene);const clone=scene.children.find(n=>n.name.includes('Телефон'));assert.deepEqual(JSON.parse(JSON.stringify(clone.children[0].fills[0].color)),data.palettes[2].colors[5]);
 s.figma.currentPage.selection=[scene];await s.send({type:'recolor',paletteIndex:0});assert.deepEqual(JSON.parse(JSON.stringify(clone.children[0].fills[0].color)),data.palettes[0].colors[5]);
});
test('foreign vector inside owned object is refused on export',async()=>{
 const s=setup();await s.send(request);const scene=s.scene();scene.children[0].appendChild(new s.Node('VECTOR','foreign'));s.figma.currentPage.selection=[scene];await s.send({type:'export'});assert.equal(s.messages.filter(m=>m.type==='svg').length,0);assert.ok(s.messages.some(m=>m.type==='error'));
});
test('library changes after initial baseline are refused before next scene',async()=>{
 const s=setup();await s.send(request);const before=s.figma.currentPage.children.length;s.nodes.get('24:4746').appendChild(new s.Node('VECTOR','foreign'));await s.send(request);assert.equal(s.figma.currentPage.children.length,before);assert.ok(s.messages.some(m=>m.type==='error'));
});
test('interior path edit with unchanged root bounds is refused',async()=>{
 const s=setup();await s.send(request);const scene=s.scene();scene.children[0].children[0].vectorPaths=[{windingRule:'NONZERO',data:'M0 0 L1 1'}];s.figma.currentPage.selection=[scene];await s.send({type:'export'});assert.equal(s.messages.filter(m=>m.type==='svg').length,0);
});
test('shared colours with different source roles are rejected explicitly',async()=>{
 const s=setup();for(const v of ['24:4746','24:4903'])s.nodes.get(v).children[0].fills=[{type:'SOLID',color:data.palettes[1].colors[5]}];await s.send(request);assert.ok(s.messages.some(m=>m.type==='error'&&m.message.includes('Неоднозначные')));assert.equal(s.scene(),undefined);
});
