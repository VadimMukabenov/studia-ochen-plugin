const test = require('node:test');
const assert = require('node:assert/strict');
let core;
test.before(async () => { core = await import('../web/core.mjs'); });
test('browser scene uses all original variants and one common scale in three distinct layouts', () => {
  const scenes = ['compact','diagonal','editorial'].map(layout => core.createScene(['phone','puzzle'], {layout}));
  assert.equal(core.variants.length,40);
  assert.equal(new Set(scenes.map(s=>JSON.stringify(s.items.map(i=>[i.x,i.y,i.rotation])))).size,3);
  for(const size of ['S','L']) for(const role of ['main','background']) {
    const scene=core.createScene(['phone','puzzle'],{size}); scene.items[1].role=role;
    for(const item of scene.items) {
      const v=core.getVariant(item.key,size,item.role);
      assert.ok(v.asset.includes(`-${size}-${item.role}.svg`));
      assert.ok(!('scale' in item));
    }
  }
  for(const [w,h] of [[1200,675],[1080,1080],[900,1200],[675,1200]]) {
    const s=core.createScene(['book','lamp','phone','wallet'],{width:w,height:h});
    for(const i of s.items) { const b=core.itemBounds(s,i); assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=w+.1&&b.y+b.height<=h+.1); }
  }
});
test('immutable scene operations support undo-friendly whole-object editing and preserve scale',()=>{
  const s=core.createScene(['phone','puzzle']); const before=JSON.stringify(s); const id=s.items[0].id;
  const moved=core.editScene(s,'move',id,{x:50,y:90});assert.equal(JSON.stringify(s),before);assert.equal(moved.items[0].x,50);
  const copy=core.editScene(moved,'duplicate',id);assert.equal(copy.items.length,3);assert.equal(new Set(copy.items.map(x=>x.id)).size,3);
  assert.equal(copy.scale,s.scale);
  const rotated=core.editScene(copy,'rotate',id,15);assert.equal(rotated.items[0].rotation,15);
  const layered=core.editScene(rotated,'front',id);assert.equal(layered.items.at(-1).id,id);
  const bg=core.editScene(layered,'role',id,'background');assert.equal(bg.items.at(-1).role,'background');
  assert.equal(core.editScene(bg,'delete',id).items.length,2);
  assert.throws(()=>core.editScene(s,'resize',id,2));
});
test('project import rejects foreign artwork, duplicate IDs, NaN and invalid dimensions',()=>{
  const s=core.createScene(['phone','puzzle']);
  assert.deepEqual(core.parseProject(JSON.stringify(s)),s);
  for(const edit of [v=>v.items[0].key='rocket',v=>v.items[1].id=v.items[0].id,v=>v.scale=Infinity,v=>v.width=0,v=>v.items[0].svg='<script/>',v=>v.items[0].scale=2]) {
    const p=structuredClone(s);edit(p);assert.throws(()=>core.validateScene(p));
  }
  assert.throws(()=>core.parseProject('x'.repeat(100001)));
});
test('palette import validates roles and readable ink; repeated colors retain stable slots',()=>{
  const p={name:'Моя',background:['#f1e8ff','#c6b0f2','#8262b8'],objects:['#f9dc9c','#f9dc9c','#ffd9dd'],ink:'#18202c',paper:'#ffffff'};
  assert.deepEqual(core.parsePalette(JSON.stringify(p)),p);
  assert.throws(()=>core.parsePalette(JSON.stringify({...p,ink:'#ffffff'})));
  assert.throws(()=>core.parsePalette(JSON.stringify({...p,background:['red']})));
  assert.equal(core.slotColor(p,'object1'),'#f9dc9c');
  assert.equal(core.slotColor(core.palettes[2],'object1'),core.palettes[2].objects[1]);
});
test('SVG serialization preserves original paths, excludes UI and keeps every duplicate editable',()=>{
  const fs=require('node:fs'),path=require('node:path'); const assets={};
  for(const v of core.variants)assets[v.asset]=fs.readFileSync(path.join(__dirname,'../web/assets',v.asset),'utf8');
  const s=core.editScene(core.createScene(['phone','puzzle']),'duplicate','item-1');
  const svg=core.exportSvg(s,assets);
  assert.ok(svg.startsWith('<svg'));assert.equal((svg.match(/data-object=/g)||[]).length,3);
  assert.ok(!/<image|<script|<foreignObject|selection|https?:\/\/[^w]/i.test(svg));
  const pathData=assets['phone-L-main.svg'].match(/ d="([^"]+)"/)[1];assert.ok(svg.includes(`d="${pathData}"`));
  const pink=core.exportSvg({...s,palette:core.palettes[1]},assets);assert.ok(pink.includes(core.palettes[1].objects[1]));
  assert.throws(()=>core.exportSvg(s,{...assets,'phone-L-main.svg':'<svg><script/></svg>'}));
});
