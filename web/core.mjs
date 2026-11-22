import {variants,palettes} from './catalog.mjs';
export {variants,palettes};
export const families=variants.filter(v=>v.size==='L'&&v.role==='main').map(v=>({key:v.key,label:v.label}));
const clone=x=>structuredClone(x);
const finite=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
const fail=message=>{throw new Error(message);};
export function getVariant(key,size='L',role='main') {return variants.find(v=>v.key===key&&v.size===size&&v.role===role)||fail('Неизвестный исходный предмет.');}
export function slotColor(p,slot) {if(/^background[012]$/.test(slot))return p.background[+slot.at(-1)];if(/^object[012]$/.test(slot))return p.objects[+slot.at(-1)];if(['ink','paper'].includes(slot))return p[slot];fail('Неизвестная цветовая роль.');}
function luminance(hex){const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
export function validatePalette(p) {
  if(!p||typeof p!=='object'||Object.keys(p).some(k=>!['name','background','objects','ink','paper'].includes(k))||typeof p.name!=='string'||!p.name.trim()||p.name.length>48)fail('У палитры должно быть короткое название.');
  if(!Array.isArray(p.background)||p.background.length!==3||!Array.isArray(p.objects)||p.objects.length!==3||![...p.background,...p.objects,p.ink,p.paper].every(c=>typeof c==='string'&&/^#[a-f0-9]{6}$/i.test(c)))fail('Палитра: по три HEX-цвета background и objects, а также ink и paper.');
  const a=luminance(p.ink),b=luminance(p.paper);if((Math.max(a,b)+.05)/(Math.min(a,b)+.05)<4.5)fail('Недостаточный контраст контура и бумаги (нужно 4,5:1).');
  return clone(p);
}
export function parsePalette(text){if(typeof text!=='string'||text.length>16384)fail('Файл палитры слишком большой.');try{return validatePalette(JSON.parse(text));}catch(e){throw new Error(e instanceof SyntaxError?'Не удалось прочитать JSON палитры.':e.message);}}
export function validateScene(s) {
  const allowed=['version','title','width','height','size','layout','scale','palette','background','items'];
  if(!s||typeof s!=='object'||Object.keys(s).some(k=>!allowed.includes(k))||s.version!==1)fail('Неизвестный формат проекта.');
  if(typeof s.title!=='string'||s.title.length>80||!Number.isInteger(s.width)||!Number.isInteger(s.height)||!finite(s.width,100,4096)||!finite(s.height,100,4096)||!['L','S'].includes(s.size)||!['compact','diagonal','editorial'].includes(s.layout)||!finite(s.scale,.005,20)||![0,1,2,'transparent'].includes(s.background))fail('Некорректные параметры холста.');
  validatePalette(s.palette);
  if(!Array.isArray(s.items)||s.items.length>12)fail('В композиции может быть до 12 предметов.');
  const ids=new Set();for(const i of s.items){if(!i||Object.keys(i).some(k=>!['id','key','role','x','y','rotation'].includes(k))||typeof i.id!=='string'||!/^item-[1-9][0-9]{0,5}$/.test(i.id)||ids.has(i.id)||!['main','background'].includes(i.role)||!finite(i.x,-s.width*4,s.width*4)||!finite(i.y,-s.height*4,s.height*4)||!finite(i.rotation,-180,180))fail('Некорректный предмет в проекте.');getVariant(i.key,s.size,i.role);ids.add(i.id);}
  return clone(s);
}
export function parseProject(text){if(typeof text!=='string'||text.length>100000)fail('Файл проекта слишком большой.');try{return validateScene(JSON.parse(text));}catch(e){throw new Error(e instanceof SyntaxError?'Не удалось прочитать JSON проекта.':e.message);}}
export function createScene(keys,options={}) {
  if(!Array.isArray(keys)||!keys.length||keys.length>10||new Set(keys).size!==keys.length)fail('Выберите от 1 до 10 разных предметов.');
  const s={version:1,title:'Связь складывается',width:1200,height:675,size:'L',layout:'compact',scale:1,palette:clone(palettes[0]),background:0,items:keys.map((key,n)=>({id:`item-${n+1}`,key,role:'main',x:0,y:0,rotation:0})),...options};
  validateScene(s);return layoutScene(s,s.layout);
}
export function itemBounds(s,i){const v=getVariant(i.key,s.size,i.role);return {x:i.x,y:i.y,width:v.width*s.scale,height:v.height*s.scale};}
export function layoutScene(scene,layout=scene.layout) {
  const s=validateScene({...scene,layout});if(!s.items.length)return s;
  const gap=s.size==='L'?95:47.5;
  const vs=s.items.map(i=>getVariant(i.key,s.size,i.role));let boxes=[];
  const order=vs.map((v,i)=>i);if(vs.length===2)order.reverse();
  const narrow=s.width/s.height<.8;
  const cols=narrow?1:(vs.length<=3&&s.width/s.height>1.45?vs.length:Math.min(vs.length,vs.length>6?3:2));
  const rows=Math.ceil(vs.length/cols);const cw=Array(cols).fill(0),rh=Array(rows).fill(0);
  order.forEach((idx,n)=>{cw[n%cols]=Math.max(cw[n%cols],vs[idx].width);rh[Math.floor(n/cols)]=Math.max(rh[Math.floor(n/cols)],vs[idx].height);});
  order.forEach((idx,n)=>{const col=n%cols,row=Math.floor(n/cols);let x=cw.slice(0,col).reduce((a,b)=>a+b+gap,0)+(cw[col]-vs[idx].width)/2;let y=rh.slice(0,row).reduce((a,b)=>a+b+gap,0)+(rh[row]-vs[idx].height)*.65;
    if(layout==='diagonal'){x+=n*gap*.65;y+=n*gap*1.2;}
    boxes[idx]={x,y,width:vs[idx].width,height:vs[idx].height};
  });
  const bw=Math.max(...boxes.map(b=>b.x+b.width)),bh=Math.max(...boxes.map(b=>b.y+b.height));
  const margin=Math.min(s.width,s.height)*.085,reserved=layout==='editorial'?s.width*.34:0;
  const aw=s.width-2*margin-reserved,ah=s.height-2*margin;
  s.scale=Math.min(aw/bw,ah/bh)*(layout==='diagonal'?.91:1);
  const ox=margin+reserved+(aw-bw*s.scale)/2,oy=margin+(ah-bh*s.scale)/2;
  s.items=s.items.map((i,n)=>({...i,x:ox+boxes[n].x*s.scale,y:oy+boxes[n].y*s.scale,rotation:layout==='diagonal'?(n%2?7:-6):0}));return s;
}
export function changeSize(scene,size){if(!['L','S'].includes(size))fail('Выберите S или L.');const s=validateScene(scene);if(s.size===size)return s;const old=s.size,ratio=getVariant('phone',old).width/getVariant('phone',size).width;const scale=s.scale*ratio;
  s.items=s.items.map(i=>{const a=getVariant(i.key,old,i.role),b=getVariant(i.key,size,i.role);return {...i,x:i.x+a.width*s.scale/2-b.width*scale/2,y:i.y+a.height*s.scale/2-b.height*scale/2};});s.size=size;s.scale=scale;return validateScene(s);}
export function editScene(scene,action,id,value) {
  const s=validateScene(scene),idx=s.items.findIndex(i=>i.id===id);if(idx<0)fail('Выберите предмет.');const i=s.items[idx];
  if(action==='move'){i.x=value.x;i.y=value.y;}
  else if(action==='rotate')i.rotation=((i.rotation+value+540)%360)-180;
  else if(action==='role'){const a=getVariant(i.key,s.size,i.role),b=getVariant(i.key,s.size,value);i.x+=(a.width-b.width)*s.scale/2;i.y+=(a.height-b.height)*s.scale/2;i.role=value;}
  else if(action==='duplicate'){if(s.items.length>=12)fail('В композиции уже 12 предметов.');const next=Math.max(0,...s.items.map(i=>+i.id.slice(5)))+1;s.items.splice(idx+1,0,{...i,id:`item-${next}`,x:i.x+24,y:i.y+24});}
  else if(action==='delete')s.items.splice(idx,1);
  else if(action==='front'){s.items.splice(idx,1);s.items.push(i);}
  else if(action==='back'){s.items.splice(idx,1);s.items.unshift(i);}
  else fail('Доступно редактирование только целых предметов.');
  return validateScene(s);
}
export function scaleScene(scene,factor){const s=validateScene(scene);if(!finite(factor,.1,4))fail('Некорректный общий масштаб.');s.items=s.items.map(i=>({...i,x:s.width/2+(i.x-s.width/2)*factor,y:s.height/2+(i.y-s.height/2)*factor}));s.scale*=factor;return validateScene(s);}
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function assetBody(raw,palette) {
  if(typeof raw!=='string'||raw.length>200000||/<!DOCTYPE|<!ENTITY|<\s*(?:script|image|use|foreignObject)|\bon\w+\s*=|(?:href|url\s*\()/i.test(raw))fail('Исходный SVG повреждён.');
  const tags=[...raw.matchAll(/<\/?([a-z][\w:-]*)\b[^>]*>/gi)];if(!tags.length||tags.some(t=>!['svg','g','path'].includes(t[1])))fail('Допустимы только исходные векторные контуры.');
  const body=raw.replace(/^\s*<\?xml[^>]*>\s*/,'').replace(/^<svg\b[^>]*>/,'').replace(/<\/svg>\s*$/,'');
  if(!body.startsWith('<g ')||!body.endsWith('</g>'))fail('Не найдена исходная векторная группа.');
  return body.replace(/<path\b[^>]*>/g,tag=>{
    for(const paint of ['fill','stroke']){const slot=tag.match(new RegExp(`data-${paint}-slot="([^"]+)"`));if(slot)tag=tag.replace(new RegExp(`\\b${paint}="[^"]*"`),`${paint}="${slotColor(palette,slot[1])}"`);}
    return tag;
  });
}
export function exportSvg(scene,assets) {
  const s=validateScene(scene);const shapes=s.items.map(i=>{const v=getVariant(i.key,s.size,i.role),body=assetBody(assets[v.asset],s.palette);const cx=i.x+v.width*s.scale/2,cy=i.y+v.height*s.scale/2;return `<g data-instance="${i.id}" data-object="${i.key}" data-role="${i.role}" data-source-node="${v.sourceNode}" transform="translate(${cx} ${cy}) rotate(${i.rotation}) scale(${s.scale}) translate(${-v.width/2} ${-v.height/2})">${body}</g>`;}).join('');
  const bg=s.background==='transparent'?'':`<rect width="${s.width}" height="${s.height}" fill="${s.palette.background[s.background]}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s.width}" height="${s.height}" viewBox="0 0 ${s.width} ${s.height}" fill="none"><title>${escape(s.title||'Композиция')}</title><metadata>Original Figma library · common scale ${s.scale} · ${s.size} · editable paths</metadata>${bg}${shapes}</svg>`;
}
