#!/usr/bin/env python3
"""Rebuild the complete vector library from the user's original Figma exports.

Only Python's standard library is needed. The reviewed extraction manifest
restores groups flattened by Figma; original paths, paints and draw order stay
intact. Translation normalizes coordinates without scaling or rewriting paths.
"""
import copy
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
PAINTS = {
    '#D7CDF5': 'background0', '#AA9BF0': 'background1', '#7864D7': 'background2',
    '#F9ECB0': 'object0', '#F9A3AA': 'object1', '#FFE3E1': 'object2',
    '#181817': 'ink', 'white': 'paper',
}


def main():
    manifest = json.loads((ROOT / 'source/extraction.json').read_text())
    sources = {}
    for size, info in manifest['sources'].items():
        raw = (ROOT / 'source' / info['file']).read_bytes()
        if hashlib.sha256(raw).hexdigest() != info['sha256']:
            raise ValueError(f'Original source {size} changed; review the extraction map first')
        sources[size] = ET.fromstring(raw)
    output = ROOT / 'web/assets'
    output.mkdir(parents=True, exist_ok=True)
    records = []
    for record in manifest['variants']:
        width, height = record['width'], record['height']
        svg = ET.Element(f'{{{NS}}}svg', {
            'width': str(width), 'height': str(height),
            'viewBox': f'0 0 {width} {height}', 'fill': 'none',
        })
        x, y = record['bounds'][:2]
        group = ET.SubElement(svg, f'{{{NS}}}g', {'transform': f'translate({-x} {-y})'})
        for index in record['indices']:
            shape = copy.deepcopy(sources[record['size']][index])
            if shape.tag != f'{{{NS}}}path' or len(shape):
                raise ValueError('Only reviewed original path shapes are allowed')
            for paint in ['fill', 'stroke']:
                if paint in shape.attrib:
                    shape.set('data-' + paint + '-slot', PAINTS[shape.get(paint)])
            group.append(shape)
        ET.ElementTree(svg).write(output / record['asset'], encoding='utf-8', xml_declaration=True)
        records.append({k: record[k] for k in ['key', 'label', 'size', 'role', 'width', 'height', 'sourceNode', 'asset']})
    (output / 'catalog.json').write_text(json.dumps({'variants': records}, ensure_ascii=False, indent=2) + '\n')
    print(f'Extracted {len(records)} original variants without modifying path data')


if __name__ == '__main__':
    main()
