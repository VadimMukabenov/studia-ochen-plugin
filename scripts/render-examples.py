"""Offline SVG examples from the audited L exports, no generated artwork."""
import json,re,xml.etree.ElementTree as E
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
CAT=json.loads((ROOT/'source/catalog.json').read_text())
NS='http://www.w3.org/2000/svg'; E.register_namespace('',NS)
def tag(t):return '{'+NS+'}'+t
def rgb(c):return '#'+''.join(f'{round(c[k]*255):02x}' for k in ('r','g','b'))
def color(value,palette):
    if not re.fullmatch('#[0-9a-fA-F]{6}',value):return value
    c=[int(value[i:i+2],16)/255 for i in (1,3,5)]
    base=CAT['palettes'][0]['colors'];i=min(range(8),key=lambda i:sum((base[i][k]-c[j])**2 for j,k in enumerate(('r','g','b'))))
    return rgb(palette[i])
specs=json.loads((ROOT/'examples/plans.json').read_text())
# Existing downloaded exports cover seven L main variants. These illustrations
# demonstrate offline SVG composition, separately from native-plugin execution.
for i,(name,keys,w,h,palette_index) in enumerate([
 ('learning',['book','lamp'],1000,1000,0),('connection',['phone','puzzle'],1200,630,1),('savings',['coin','wallet'],800,1200,2)]):
    variants=[next(v for v in next(f for f in CAT['families'] if f['key']==k)['variants'] if v['size']=='L' and v['role']=='main') for k in keys]
    gap=90;vertical=h>w*1.1
    bw=max(v['width'] for v in variants) if vertical else sum(v['width'] for v in variants)+gap
    bh=sum(v['height'] for v in variants)+gap if vertical else max(v['height'] for v in variants)
    margin=min(w,h)*.07;scale=min((w-2*margin)/bw,(h-2*margin)/bh);ox=(w-bw*scale)/2;oy=(h-bh*scale)/2
    colors=CAT['palettes'][palette_index]['colors'];svg=E.Element(tag('svg'),{'width':str(w),'height':str(h),'viewBox':f'0 0 {w} {h}'})
    E.SubElement(svg,tag('metadata')).text=json.dumps({'tool':'Собрано offline example','sourceFile':'Iz8d57EHdCVyPSDO0ukSnb','sourceIds':[v['id'] for v in variants],'commonScale':scale},ensure_ascii=False)
    E.SubElement(svg,tag('rect'),{'width':str(w),'height':str(h),'fill':rgb(colors[0])})
    cursor=0
    for key,v in zip(keys,variants):
        asset=E.parse(ROOT/'prototype/assets'/f'{key}.svg').getroot()
        children=list(asset)
        # Drop export-only ancestor canvas/Section backgrounds; retain original object group.
        if children[0].tag==tag('rect') and children[0].get('fill')=='#F5F5F5':
            wrapper=children[1];assert len(wrapper)==3 and wrapper[-1].tag==tag('g');source=wrapper[-1]
        else:raise RuntimeError('Unexpected source export wrapper')
        x=ox+((bw-v['width'])/2 if vertical else cursor)*scale;y=oy+(cursor if vertical else (bh-v['height'])/2)*scale
        group=E.SubElement(svg,tag('g'),{'transform':f'translate({x} {y}) scale({scale})','data-source-id':v['id']});group.append(source)
        prefix=f'obj-{key}-'
        for n in source.iter():
            for a,val in list(n.attrib.items()):
                if a=='id':n.set(a,prefix+val)
                elif 'url(#' in val:n.set(a,val.replace('url(#','url(#'+prefix))
                elif a.endswith('href') and val.startswith('#'):n.set(a,'#'+prefix+val[1:])
                elif a in ('fill','stroke','stop-color') and palette_index:n.set(a,color(val,colors))
        cursor+=(v['height'] if vertical else v['width'])+gap
    output=ROOT/'examples'/f'{i+1}-{name}.svg';E.ElementTree(svg).write(output,encoding='utf-8',xml_declaration=True)
    assert not re.search(r'<image\b|data:image|foreignObject',output.read_text())
    print(output.name,'paths:',len(svg.findall('.//'+tag('path'))))
