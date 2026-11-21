// Собрано · real source vectors. No network, secrets, or generated artwork.
type Color = {r:number;g:number;b:number};
type Palette = {id?:string;name:string;colors:Color[]};
type Size = 'S'|'L';
type Role = 'main'|'background';
type Layout = 'compact'|'diagonal'|'editorial';
type ItemPlan = {family:string;name:string;sourceId:string;role:Role;originalWidth:number;originalHeight:number;width:number;height:number;x:number;y:number};
type ScenePlan = {width:number;height:number;scale:number;size:Size;items:ItemPlan[]};
const SobCore = (() => {
const families = [{"key":"book","name":"Книга","variants":[{"id":"21:29965","size":"L","role":"main","width":1445.892578125,"height":976.664306640625},{"id":"24:6273","size":"L","role":"background","width":1445.892578125,"height":976.664306640625},{"id":"24:3810","size":"S","role":"main","width":722.9462890625,"height":488.3321228027344},{"id":"24:6934","size":"S","role":"background","width":722.9462890625,"height":488.3321228027344}]},{"key":"phone","name":"Телефон","variants":[{"id":"21:25472","size":"L","role":"main","width":796.5315551757812,"height":461.6672058105469},{"id":"24:6327","size":"L","role":"background","width":796.5315551757812,"height":461.667236328125},{"id":"24:4746","size":"S","role":"main","width":398.2657470703125,"height":230.83363342285156},{"id":"24:6990","size":"S","role":"background","width":398.2657470703125,"height":230.83363342285156}]},{"key":"puzzle","name":"Пазлы","variants":[{"id":"21:417","size":"L","role":"main","width":544.1632080078125,"height":313.5343322753906},{"id":"24:6214","size":"L","role":"background","width":544.1632080078125,"height":313.5343322753906},{"id":"24:4903","size":"S","role":"main","width":272.08160400390625,"height":156.7671661376953},{"id":"24:7147","size":"S","role":"background","width":272.08160400390625,"height":156.7671661376953}]},{"key":"coin","name":"Монета","variants":[{"id":"24:2207","size":"L","role":"main","width":286.6766662597656,"height":188.5005645751953},{"id":"24:6795","size":"L","role":"background","width":286.6768798828125,"height":188.50100708007812},{"id":"24:5345","size":"S","role":"main","width":152.39012145996094,"height":100.20225524902344},{"id":"24:7205","size":"S","role":"background","width":152.3905029296875,"height":100.20217895507812}]},{"key":"headphones","name":"Наушники","variants":[{"id":"23:122","size":"L","role":"main","width":888.14990234375,"height":691.54150390625},{"id":"24:6484","size":"L","role":"background","width":888.14990234375,"height":691.54150390625},{"id":"24:5089","size":"S","role":"main","width":444.074951171875,"height":345.770751953125},{"id":"24:7344","size":"S","role":"background","width":444.074951171875,"height":345.770751953125}]},{"key":"lamp","name":"Лампа","variants":[{"id":"23:121","size":"L","role":"main","width":945.9432373046875,"height":1128.9852294921875},{"id":"24:6569","size":"L","role":"background","width":945.9432373046875,"height":1128.9852294921875},{"id":"24:5485","size":"S","role":"main","width":472.9715881347656,"height":564.4925537109375},{"id":"24:7429","size":"S","role":"background","width":472.9715881347656,"height":564.4925537109375}]},{"key":"flowers","name":"Цветы","variants":[{"id":"28:11628","size":"L","role":"main","width":590.5732421875,"height":747.1065063476562},{"id":"30:11902","size":"L","role":"background","width":590.5732421875,"height":747.10595703125},{"id":"28:11629","size":"S","role":"main","width":323.2647399902344,"height":408.94677734375},{"id":"28:11766","size":"S","role":"background","width":323.2647399902344,"height":408.94677734375}]},{"key":"wallet","name":"Кошелёк","variants":[{"id":"23:211","size":"L","role":"main","width":630.41552734375,"height":396.309814453125},{"id":"24:6660","size":"L","role":"background","width":630.41552734375,"height":396.309814453125},{"id":"24:4594","size":"S","role":"main","width":315.207763671875,"height":198.1549835205078},{"id":"24:7568","size":"S","role":"background","width":315.207763671875,"height":198.1549835205078}]},{"key":"folder","name":"Папка","variants":[{"id":"24:1899","size":"L","role":"main","width":1240.61865234375,"height":658.5882568359375},{"id":"24:6772","size":"L","role":"background","width":1240.61865234375,"height":658.5882568359375},{"id":"24:4430","size":"S","role":"main","width":620.3094482421875,"height":329.29412841796875},{"id":"24:7520","size":"S","role":"background","width":620.3094482421875,"height":329.29412841796875}]},{"key":"pen","name":"Ручка","variants":[{"id":"24:1734","size":"L","role":"main","width":508.42822265625,"height":285.4002380371094},{"id":"24:6747","size":"L","role":"background","width":508.42822265625,"height":285.4002380371094},{"id":"24:4287","size":"S","role":"main","width":254.214111328125,"height":142.7001190185547},{"id":"24:7543","size":"S","role":"background","width":254.214111328125,"height":142.7001190185547}]}];
const palettes:Palette[] = [{"id":"21:29569","colors":[{"r":0.843137264251709,"g":0.8039215803146362,"b":0.9607843160629272},{"r":0.6666666865348816,"g":0.6078431606292725,"b":0.9411764740943909},{"r":0.47058823704719543,"g":0.3921568691730499,"b":0.843137264251709},{"r":0.0941176488995552,"g":0.0941176488995552,"b":0.09019608050584793},{"r":0.9764705896377563,"g":0.9254902005195618,"b":0.6901960968971252},{"r":0.9764705896377563,"g":0.6392157077789307,"b":0.6666666865348816},{"r":1,"g":0.8901960849761963,"b":0.8823529481887817},{"r":1,"g":1,"b":1}],"name":"Сиреневая"},{"id":"21:29570","colors":[{"r":0.9921568632125854,"g":0.843137264251709,"b":0.7254902124404907},{"r":0.9803921580314636,"g":0.7843137383460999,"b":0.5882353186607361},{"r":0.8235294222831726,"g":0.45781978964805603,"b":0.19494789838790894},{"r":0.0941176488995552,"g":0.0941176488995552,"b":0.09019608050584793},{"r":0.9764705896377563,"g":0.9254902005195618,"b":0.6901960968971252},{"r":0.501960813999176,"g":0.8549019694328308,"b":0.8549019694328308},{"r":0.7450980544090271,"g":0.9215686321258545,"b":0.9215686321258545},{"r":1,"g":1,"b":1}],"name":"Персиковая"},{"id":"21:29579","colors":[{"r":0.7445244789123535,"g":0.9196965098381042,"b":0.9196965098381042},{"r":0.5017257332801819,"g":0.8550180196762085,"b":0.8550180196762085},{"r":0.3529411554336548,"g":0.7450980544090271,"b":0.7450980544090271},{"r":0.0941176488995552,"g":0.0941176488995552,"b":0.09019608050584793},{"r":1,"g":0.829758882522583,"b":0.948927640914917},{"r":0.42746198177337646,"g":0.4834255874156952,"b":0.9870980978012085},{"r":0.7137255072593689,"g":0.7764706015586853,"b":0.9960784316062927},{"r":1,"g":1,"b":1}],"name":"Бирюзовая"}];
const aliases:Record<string,string[]>={book:['книг','учебник','book'],phone:['телефон','смартфон','phone'],puzzle:['пазл','puzzle'],coin:['монет','coin'],headphones:['наушник','headphone'],lamp:['ламп','светильник','lamp'],flowers:['цвет','букет','ваз','flower'],wallet:['кошелек','бумажник','wallet'],folder:['папк','документ','folder'],pen:['ручк','карандаш','pen']};
const meanings:{stems:string[];keys:string[];why:string}[]=[
{stems:['уч','знан','образован','экзамен','курс','обуч','чит','study','learn'],keys:['book','lamp','headphones'],why:'Учёба и знания → книга, свет и сосредоточенность'},
{stems:['сбереж','накоп','бюджет','деньг','финанс','эконом','оплат','покуп','saving','money','budget'],keys:['wallet','coin','phone'],why:'Финансы → кошелёк, монета и цифровая оплата'},
{stems:['команд','вместе','сотруднич','собрат','соедин','кусоч','team','connect'],keys:['puzzle','phone','book'],why:'Связь и совместная работа → пазлы и телефон'},
{stems:['иде','твор','вдохнов','придум','озар','пис','creative','idea'],keys:['lamp','pen','book'],why:'Идея и творчество → свет, ручка и книга'},
{stems:['фокус','сосред','темп','музык','слуш','звук','тишин','focus','music'],keys:['headphones','book','lamp'],why:'Свой темп и концентрация → наушники, книга и лампа'},
{stems:['поряд','организ','работ','офис','план','задач','order','work'],keys:['folder','pen','lamp'],why:'Организация работы → папка, ручка и лампа'},
{stems:['подар','празд','забот','радост','любов','рост','раст','весн','gift','growth'],keys:['flowers','wallet','book'],why:'Забота и рост → цветы, кошелёк и книга'},
{stems:['общ','звон','связ','цифр','технолог','мобиль','communication','digital'],keys:['phone','puzzle','headphones'],why:'Общение и технологии → телефон, пазлы и наушники'}];
function words(text:string){return String(text).normalize('NFKC').toLowerCase().replace(/ё/g,'е').match(/[a-zа-я0-9]+/g)||[];}
function match(w:string,stem:string){return /[а-я]/.test(stem)?w.startsWith(stem):w===stem||w===stem+'s';}
function resolve(query:string,mode:string){
 if(typeof query!=='string'||!query.trim()||query.length>500)throw Error('Введите запрос длиной от 1 до 500 символов.');
 if(mode!=='names'&&mode!=='meaning')throw Error('Неизвестный режим.');
 const tokens=words(query), scores:Record<string,number>={}, reasons:string[]=[],excluded=new Set<string>(),unknown:string[]=[];
 for(let i=0;i<tokens.length;i++)for(const f of families)if(aliases[f.key].some(a=>match(tokens[i],a))){if(['без','не','кроме','исключи'].includes(tokens[i-1]))excluded.add(f.key);}
 for(const token of tokens){const f=families.find(f=>aliases[f.key].some(a=>match(token,a)));if(f){scores[f.key]=(scores[f.key]||0)+10;if(!reasons.includes(f.name))reasons.push(f.name);}else if(!['и','с','из','объект','объекты'].includes(token))unknown.push(token);}
 if(mode==='names'&&unknown.length)throw Error('Неизвестные названия: '+unknown.join(', ')+'. Выберите предметы из каталога.');
 if(mode==='meaning')for(const concept of meanings)if(tokens.some(w=>concept.stems.some(s=>match(w,s)))){concept.keys.forEach((key,i)=>scores[key]=(scores[key]||0)+4-i);reasons.push(concept.why);}
 const keys=Object.keys(scores).filter(k=>!excluded.has(k)).sort((a,b)=>scores[b]-scores[a]);
 if(!keys.length)throw Error('Не нашлось подходящих предметов. Уточните смысл или выберите названия из каталога.');
 if(mode==='names'&&keys.length>4)throw Error('За один раз можно выбрать до четырёх разных предметов.');
 return {keys:keys.slice(0,mode==='meaning'?3:4),reasons};
}
function variant(family:string,size:Size,role:Role){const f=families.find(f=>f.key===family);const v=f&&f.variants.find(v=>v.size===size&&v.role===role);if(!v||!f)throw Error('Исходный вариант не найден: '+family);return {...v,name:f.name,family};}
function plan(keys:string[],size:Size,width:number,height:number,layout:Layout,backgrounds:boolean):ScenePlan{
 if(size!=='S'&&size!=='L')throw Error('Размер детализации должен быть S или L.');
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<100||height<100||width>4096||height>4096)throw Error('Размер холста: целые числа от 100 до 4096.');
 if(!['compact','diagonal','editorial'].includes(layout))throw Error('Неизвестная композиция.');
 if(!Array.isArray(keys)||keys.length<1||keys.length>4||new Set(keys).size!==keys.length)throw Error('Выберите от одного до четырёх разных предметов.');
 const items=keys.map((key,i)=>variant(key,size,backgrounds&&keys.length>1&&i===keys.length-1?'background':'main'));
 const gap=size==='L'?90:45;
 let boxes:{x:number;y:number;width:number;height:number}[]=[];
 if(width/height>1.4&&items.length<=3){let x=0;boxes=items.map((v,i)=>{const b={x,y:i%2?Math.max(...items.map(v=>v.height))*.22:0,width:v.width,height:v.height};x+=v.width+gap;return b;});}
 else if(width/height<.85){let y=0;const maxW=Math.max(...items.map(v=>v.width));boxes=items.map((v,i)=>{const b={x:(maxW-v.width)/2+(i%2?gap:0),y,width:v.width,height:v.height};y+=v.height+gap;return b;});}
 else {const colW=[0,0],rowH=[0,0];items.forEach((v,i)=>{colW[i%2]=Math.max(colW[i%2],v.width);rowH[Math.floor(i/2)]=Math.max(rowH[Math.floor(i/2)],v.height);});boxes=items.map((v,i)=>({x:i%2?colW[0]+gap:0,y:i>=2?rowH[0]+gap:0,width:v.width,height:v.height}));}
 if(layout==='diagonal')boxes=boxes.map((b,i)=>({...b,x:b.x+i*gap*.6,y:b.y+i*gap*.55}));
 const bw=Math.max(...boxes.map(b=>b.x+b.width)),bh=Math.max(...boxes.map(b=>b.y+b.height));
 const margin=Math.min(width,height)*.07, reserved=layout==='editorial'?width*.29:0;
 const aw=width-2*margin-reserved,ah=height-2*margin,scale=Math.min(aw/bw,ah/bh);
 const ox=margin+reserved+(aw-bw*scale)/2,oy=margin+(ah-bh*scale)/2;
 return {width,height,scale,size,items:items.map((v,i)=>({family:v.family,name:v.name,sourceId:v.id,role:v.role as Role,originalWidth:v.width,originalHeight:v.height,width:v.width*scale,height:v.height*scale,x:ox+boxes[i].x*scale,y:oy+boxes[i].y*scale}))};
}
function hex(s:unknown):Color{if(typeof s!=='string'||!/^#[0-9a-f]{6}$/i.test(s))throw Error('Цвет должен иметь формат #RRGGBB.');return {r:parseInt(s.slice(1,3),16)/255,g:parseInt(s.slice(3,5),16)/255,b:parseInt(s.slice(5,7),16)/255};}
function luminance(c:Color){const f=(n:number)=>n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4);return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);}
function parsePalette(text:string):Palette{
 if(typeof text!=='string'||text.length>16384)throw Error('Палитра: JSON до 16 КБ.');
 let p;try{p=JSON.parse(text);}catch{throw Error('Палитра должна быть корректным JSON.');}
 if(!p||typeof p.name!=='string'||!p.name.trim()||p.name.length>40||!Array.isArray(p.background)||p.background.length!==3||!Array.isArray(p.objects)||p.objects.length!==3)throw Error('Нужны name, background[3], objects[3], ink и paper.');
 const colors=[...p.background,p.ink,...p.objects,p.paper].map(hex);
 if((Math.max(luminance(colors[3]),luminance(colors[7]))+.05)/(Math.min(luminance(colors[3]),luminance(colors[7]))+.05)<4.5)throw Error('Недостаточный контраст ink и paper: нужно не менее 4.5:1.');
 return {name:p.name.trim(),colors};
}
function sourceScheme(colors:Color[],role:Role):number{
 const slots=role==='background'?[0,1,2,3,7]:[0,1,2,3,4,5,6,7];
 const distance=(a:Color,b:Color)=>(a.r-b.r)**2+(a.g-b.g)**2+(a.b-b.b)**2;
 const candidates=palettes.map((p,index)=>({index,roles:colors.map(c=>slots.reduce((best,i)=>distance(c,p.colors[i])<distance(c,p.colors[best])?i:best,slots[0])),error:colors.reduce((sum,c)=>sum+Math.min(...slots.map(i=>distance(c,p.colors[i]))),0)})).sort((a,b)=>a.error-b.error);
 const best=candidates[0];
 if(candidates.some(c=>Math.abs(c.error-best.error)<1e-6*Math.max(1,colors.length)&&c.roles.some((r,i)=>r!==best.roles[i])))throw Error('Неоднозначные цветовые роли исходника. Нужна проверка исходной палитры.');
 return best.index;
}
function mapColor(c:Color,from:Palette,to:Palette):Color{
 if(JSON.stringify(from.colors)===JSON.stringify(to.colors))return {...c};
 let distance=Infinity,index=0;from.colors.forEach((v,i)=>{const d=(v.r-c.r)**2+(v.g-c.g)**2+(v.b-c.b)**2;if(d<distance){distance=d;index=i;}});
 return {...to.colors[index]};
}
return {families,palettes,resolve,variant,plan,parsePalette,mapColor,sourceScheme};
})();

// Figma sandbox. Kept separate from SobCore so geometry and meaning are testable.
if(typeof figma!=='undefined'){
 const RESOURCE='open';
 type Message={type:string;[key:string]:unknown};
 type ObjectData={shape?:string;family:string;sourceId:string;size:Size;role:Role;scale:number;originalWidth:number;originalHeight:number};
 type SceneData={version:1;palette:Palette;query:string;size:Size;scale:number};
 let busy=false;
 const post=(m:object)=>figma.ui.postMessage(m);
 function read<T>(node:BaseNode,key:string):T|null{const s=node.getPluginData(key);if(!s)return null;try{return JSON.parse(s) as T;}catch{return null;}}
 function palette(m:Message){return typeof m.customPalette==='string'&&m.customPalette?SobCore.parsePalette(m.customPalette):SobCore.palettes[Number.isInteger(m.paletteIndex)?Number(m.paletteIndex):0]||SobCore.palettes[0];}
 function all(root:SceneNode):SceneNode[]{const out:SceneNode[]=[],todo:SceneNode[]=[root];while(todo.length){const n=todo.pop()!;out.push(n);if(out.length>3000)throw Error('Слишком много слоёв: максимум 3000.');if('children'in n)todo.push(...n.children);}return out;}
 function shape(root:SceneNode):string{
  const value=JSON.stringify(all(root).map((n,i)=>({type:n.type,children:'children'in n?n.children.length:0,width:n.width,height:n.height,transform:i===0?null:n.relativeTransform,paths:'vectorPaths'in n?n.vectorPaths:null,visible:n.visible,opacity:'opacity'in n?n.opacity:null})));
  let hash=2166136261;for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}return value.length+':'+(hash>>>0).toString(16);
 }
 function hasRaster(root:SceneNode){return all(root).some(n=>['TEXT','EMBED','MEDIA','WIDGET','INSTANCE'].includes(n.type)||(['fills','strokes'] as const).some(k=>k in n&&Array.isArray((n as GeometryMixin)[k])&&((n as GeometryMixin)[k] as Paint[]).some(p=>p.type==='IMAGE'||p.type==='VIDEO')));}
 function sceneOf(n:BaseNode|null):FrameNode|null{let p=n;while(p&&p.type!=='DOCUMENT'){if(p.type==='FRAME'&&read<SceneData>(p,'sob-scene'))return p;p=p.parent;}return null;}
 function selectedScene(){if(figma.currentPage.selection.length!==1)throw Error('Выделите одну композицию «Собрано» или предмет внутри неё.');const s=sceneOf(figma.currentPage.selection[0]);if(!s)throw Error('Выберите композицию «Собрано». Исходники не изменяются.');return s;}
 function selectedObject(scene:FrameNode){let n:SceneNode=figma.currentPage.selection[0];while(n.parent&&n.parent!==scene&&n.parent.type!=='PAGE'&&n.parent.type!=='DOCUMENT')n=n.parent as SceneNode;if(n.parent!==scene||!read<ObjectData>(n,'sob-object'))throw Error('Выделите один предмет внутри композиции.');if(n.type!=='GROUP')throw Error('Выберите группу исходного предмета.');return n;}
 function sendState(){const s=figma.currentPage.selection.length===1?sceneOf(figma.currentPage.selection[0]):null;post({type:'state',hasScene:!!s,objects:s?s.children.filter(n=>read<ObjectData>(n,'sob-object')).map(n=>({id:n.id,name:n.name})):[]});}
 async function sources(plans:ItemPlan[]){const baselines=read<Record<string,string>>(figma.root,'sob-source-baselines')||{};const library=await figma.getNodeByIdAsync('0:1');if(!library||library.type!=='PAGE'||library.name!=='Библиотека компонентов')throw Error('Откройте файл с исходной библиотекой. Ссылка есть в инструкции плагина.');await library.loadAsync();const nodes:GroupNode[]=[];for(const p of plans){const n=await figma.getNodeByIdAsync(p.sourceId);if(!n||n.type!=='GROUP')throw Error('Не найден исходник '+p.name+' ('+p.sourceId+').');let ancestor:BaseNode=n;while(ancestor.parent&&ancestor.parent.type!=='DOCUMENT')ancestor=ancestor.parent;if(ancestor.id!==library.id||Math.abs(n.width-p.originalWidth)>.02||Math.abs(n.height-p.originalHeight)>.02||hasRaster(n))throw Error('Исходник изменён или содержит растр: '+p.name+'. Используйте исходную библиотеку.');const signature=shape(n);if(baselines[n.id]&&baselines[n.id]!==signature)throw Error('Структура исходника изменена после первого использования: '+p.name);baselines[n.id]=signature;nodes.push(n);}figma.root.setPluginData('sob-source-baselines',JSON.stringify(baselines));return nodes;}
 function colorSlot(color:Color,schemeIndex:number){const from=SobCore.palettes[schemeIndex];let index=0,d=Infinity;from.colors.forEach((c,i)=>{const dist=(c.r-color.r)**2+(c.g-color.g)**2+(c.b-color.b)**2;if(dist<d){d=dist;index=i;}});return index;}
 function paintObject(root:SceneNode,target:Palette){
  const visible=all(root).filter(n=>{let p=n.parent;while(p&&p!==root.parent){if(p.type==='BOOLEAN_OPERATION')return false;p=p.parent;}return true;});
  let scheme=root.getPluginData('sob-source-palette');
  if(!scheme){const colors:Color[]=[];for(const n of visible)for(const key of ['fills','strokes'] as const){if(!(key in n))continue;const paints=(n as GeometryMixin)[key];if(!Array.isArray(paints))continue;for(const p of paints as Paint[])if(p.type==='SOLID')colors.push(p.color);else if('gradientStops'in p)colors.push(...p.gradientStops.map(s=>({r:s.color.r,g:s.color.g,b:s.color.b})));}scheme=String(SobCore.sourceScheme(colors,read<ObjectData>(root,'sob-object')!.role));root.setPluginData('sob-source-palette',scheme);}
  const sourceIndex=Number(scheme);
  for(const n of all(root)){
   // Boolean result paints own their appearance; preserve hidden operands.
   let p=n.parent,operand=false;while(p&&p!==root.parent){if(p.type==='BOOLEAN_OPERATION'){operand=true;break;}p=p.parent;}if(operand)continue;
   const recorded=read<Record<string,{slot:number;original:Color}[][]>>(n,'sob-paints')||{};
   for(const key of ['fills','strokes'] as const){if(!(key in n))continue;const holder=n as GeometryMixin;const paints=holder[key];if(!Array.isArray(paints))continue;
    if(!recorded[key])recorded[key]=paints.map((p:Paint)=>p.type==='SOLID'?[{slot:colorSlot(p.color,sourceIndex),original:{...p.color}}]:'gradientStops'in p?p.gradientStops.map((s:ColorStop)=>({slot:colorSlot(s.color,sourceIndex),original:{r:s.color.r,g:s.color.g,b:s.color.b}})):[]);
    const isOriginal=JSON.stringify(target.colors)===JSON.stringify(SobCore.palettes[sourceIndex].colors);
    holder[key]=paints.map((paint:Paint,i:number)=>{const meta=recorded[key][i];if(!meta||!meta.length)return paint;const color=(j:number)=>isOriginal?meta[j].original:target.colors[meta[j].slot];if(paint.type==='SOLID')return {...paint,color:{...color(0)}};if('gradientStops'in paint)return {...paint,gradientStops:paint.gradientStops.map((s:ColorStop,j:number)=>({...s,color:{...color(j),a:s.color.a}}))};return paint;});
   }n.setPluginData('sob-paints',JSON.stringify(recorded));
  }
 }
 function label(name:string,role:Role){return name+(role==='background'?' · фоновый':' · главный');}
 async function create(m:Message){
  let result:{keys:string[];reasons:string[]};
  if(m.mode==='meaning'){
   if(typeof m.query!=='string'||!m.query.trim()||m.query.length>500)throw Error('Введите запрос длиной от 1 до 500 символов.');
   const semantic=m.semantic as {keys?:unknown;reasons?:unknown;engine?:unknown}|undefined;
   if(!semantic||semantic.engine!=='multilingual-e5-small'||!Array.isArray(semantic.keys)||semantic.keys.length<1||semantic.keys.length>4||new Set(semantic.keys).size!==semantic.keys.length||!semantic.keys.every(k=>typeof k==='string'&&SobCore.families.some(f=>f.key===k)))throw Error('Нужен ответ локальной модели. Запустите помощник по README.');
   result={keys:semantic.keys as string[],reasons:Array.isArray(semantic.reasons)?semantic.reasons.filter((r):r is string=>typeof r==='string').slice(0,4).map(r=>r.slice(0,500)):[]};
  }else result=SobCore.resolve(String(m.query||''),String(m.mode));
  const plan=SobCore.plan(result.keys,String(m.size) as Size,Number(m.width),Number(m.height),String(m.layout) as Layout,m.backgrounds===true),colors=palette(m);
  const originals=await sources(plan.items); // Every source validated before mutations.
  let output=figma.root.children.find(p=>p.getPluginData('sob-output')==='1');
  if(!output){output=figma.createPage();output.name='Собрано · Композиции';output.setPluginData('sob-output','1');}
  await figma.setCurrentPageAsync(output);
  const scene=figma.createFrame();scene.name='Собрано · '+String(m.query).slice(0,50)+' · '+plan.size+' · '+plan.width+'×'+plan.height;
  scene.resize(plan.width,plan.height);scene.clipsContent=true;scene.fills=[{type:'SOLID',color:colors.colors[0]}];
  scene.x=figma.viewport.center.x-plan.width/2;scene.y=figma.viewport.center.y-plan.height/2;
  // Keep output scenes separate, including repeat runs with the same viewport.
  const others=output.children.filter(n=>n!==scene);if(others.length)scene.x=Math.max(...others.map(n=>n.x+n.width))+120;
  try{
   const order=plan.items.map((item,i)=>({item,i})).sort((a,b)=>Number(b.item.role==='background')-Number(a.item.role==='background'));
   for(const {item,i} of order){const n=originals[i].clone();scene.appendChild(n);n.rescale(plan.scale);n.x=item.x;n.y=item.y;n.name=label(item.name,item.role);n.constrainProportions=true;n.setPluginData('sob-object',JSON.stringify({shape:shape(n),family:item.family,sourceId:item.sourceId,size:plan.size,role:item.role,scale:plan.scale,originalWidth:item.originalWidth,originalHeight:item.originalHeight}));paintObject(n,colors);}
   scene.setPluginData('sob-scene',JSON.stringify({version:1,palette:colors,query:m.query,size:plan.size,scale:plan.scale}));scene.setRelaunchData({[RESOURCE]:'Продолжить работу с композицией'});
  }catch(error){scene.remove();throw error;}
  figma.currentPage.selection=[scene];figma.viewport.scrollAndZoomIntoView([scene]);
  post({type:'result',message:'Композиция готова. Предметы можно править на холсте Figma.',names:plan.items.map(i=>i.name),reasons:result.reasons,sceneId:scene.id});sendState();
 }
 async function recolor(m:Message){const scene=selectedScene(),data=read<SceneData>(scene,'sob-scene')!,colors=palette(m);for(const n of scene.children){if(!read<ObjectData>(n,'sob-object'))throw Error('В сцене есть посторонние слои. Выберите исходную композицию.');}for(const n of scene.children)paintObject(n,colors);scene.fills=[{type:'SOLID',color:colors.colors[0]}];scene.setPluginData('sob-scene',JSON.stringify({...data,palette:colors}));post({type:'result',message:'Палитра применена к выделенной композиции.'});}
 async function action(m:Message){
  const scene=selectedScene(),n=selectedObject(scene),data=read<ObjectData>(n,'sob-object')!;
  if(m.action==='duplicate'){if(scene.children.length>=12)throw Error('В композиции уже 12 предметов.');const copy=n.clone();scene.appendChild(copy);copy.x=n.x+24;copy.y=n.y+24;figma.currentPage.selection=[copy];}
  else if(m.action==='delete'){if(scene.children.length<=1)throw Error('Оставьте хотя бы один предмет.');n.remove();figma.currentPage.selection=[scene];}
  else if(m.action==='rotate-right'||m.action==='rotate-left')n.rotation+=m.action==='rotate-right'?15:-15;
  else if(m.action==='front')scene.appendChild(n);
  else if(m.action==='back')scene.insertChild(0,n);
  else if(m.action==='role'){
   const role:Role=data.role==='main'?'background':'main',v=SobCore.variant(data.family,data.size,role);const source=await sources([{family:v.family,name:v.name,sourceId:v.id,role,originalWidth:v.width,originalHeight:v.height,width:v.width*data.scale,height:v.height*data.scale,x:n.x,y:n.y}]);
   const replacement=source[0].clone();scene.insertChild(scene.children.indexOf(n),replacement);replacement.rescale(data.scale);replacement.rotation=n.rotation;replacement.x=n.x;replacement.y=n.y;replacement.name=label(v.name,role);replacement.constrainProportions=true;replacement.setPluginData('sob-object',JSON.stringify({...data,shape:shape(replacement),sourceId:v.id,role,originalWidth:v.width,originalHeight:v.height}));paintObject(replacement,read<SceneData>(scene,'sob-scene')!.palette);n.remove();figma.currentPage.selection=[replacement];
  }else throw Error('Неизвестное действие.');sendState();post({type:'result',message:'Предмет изменён. Перемещение доступно на холсте Figma.'});
 }
 async function exportScene(){
  const scene=selectedScene(),meta=read<SceneData>(scene,'sob-scene')!;
  if(!scene.children.length||scene.children.length>12||hasRaster(scene))throw Error('Экспорт: нужны только исходные векторные предметы, без текста и растра.');
  const provenance:object[]=[];
  for(const n of scene.children){const d=read<ObjectData>(n,'sob-object');if(!d)throw Error('Удалите посторонние слои перед экспортом.');const v=SobCore.variant(d.family,d.size,d.role);if(!d.shape||shape(n)!==d.shape)throw Error('Внутренние слои предмета изменены. Соберите сцену заново.');if(v.id!==d.sourceId||Math.abs(n.width/(v.width*meta.scale)-1)>.002||Math.abs(n.height/(v.height*meta.scale)-1)>.002)throw Error('Изменён относительный размер предмета. Отмените масштабирование или соберите сцену заново.');provenance.push({sourceId:d.sourceId,family:d.family,role:d.role,size:d.size});}
  let svg=await scene.exportAsync({format:'SVG_STRING',svgIdAttribute:true,svgOutlineText:false,svgSimplifyStroke:false});
  if(/<image\b|<foreignObject\b|data:image\//i.test(svg))throw Error('SVG содержит растровые или посторонние данные.');
  const info=JSON.stringify({tool:'Собрано',sourceFile:'Iz8d57EHdCVyPSDO0ukSnb',palette:meta.palette.name,objects:provenance}).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  svg=svg.replace(/(<svg\b[^>]*>)/,'$1<metadata>'+info+'</metadata>');post({type:'svg',svg,filename:'sobrano-'+scene.width+'x'+scene.height+'.svg'});
 }
 figma.showUI(__html__,{width:420,height:760,themeColors:true});figma.root.setRelaunchData({[RESOURCE]:'Открыть конструктор иллюстраций'});
 figma.on('selectionchange',sendState);
 figma.ui.onmessage=async(m:Message)=>{
  if(!m||typeof m.type!=='string')return;
  if(m.type==='init'){post({type:'init',families:SobCore.families.map(f=>({key:f.key,name:f.name})),palettes:SobCore.palettes});sendState();return;}
  if(busy){post({type:'error',message:'Дождитесь завершения текущего действия.'});return;}
  busy=true;post({type:'busy',busy:true});
  try{if(m.type==='create')await create(m);else if(m.type==='recolor')await recolor(m);else if(m.type==='export')await exportScene();else if(m.type==='action')await action(m);else if(m.type==='select'){const scene=selectedScene(),n=scene.children.find(n=>n.id===m.id);if(!n)throw Error('Предмет больше не существует.');figma.currentPage.selection=[n];sendState();}else throw Error('Неизвестная команда.');}
  catch(e){post({type:'error',message:e instanceof Error?e.message:String(e)});}
  finally{busy=false;post({type:'busy',busy:false});sendState();}
 };
}
