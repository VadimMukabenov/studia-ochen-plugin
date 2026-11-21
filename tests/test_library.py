"""Independent provenance checks for the complete user-supplied vector library."""
import hashlib
import json
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
NS = '{http://www.w3.org/2000/svg}'
SLOTS = {'background0', 'background1', 'background2', 'object0', 'object1', 'object2', 'ink', 'paper'}
SOURCE_SLOTS = {
    '#D7CDF5': 'background0', '#AA9BF0': 'background1', '#7864D7': 'background2',
    '#F9ECB0': 'object0', '#F9A3AA': 'object1', '#FFE3E1': 'object2',
    '#181817': 'ink', 'white': 'paper',
}


class LibraryTest(unittest.TestCase):
    def test_all_variants_keep_original_geometry_and_native_dimensions(self):
        manifest = json.loads((ROOT / 'source/extraction.json').read_text())
        native = json.loads((ROOT / 'source/catalog.json').read_text())
        assets = json.loads((ROOT / 'web/assets/catalog.json').read_text())
        self.assertEqual(len(assets['variants']), 40)
        self.assertEqual(len({a['asset'] for a in assets['variants']}), 40)
        expected = {(f['key'], v['size'], v['role']): v for f in native['families'] for v in f['variants']}
        self.assertEqual({(v['key'], v['size'], v['role']) for v in assets['variants']}, set(expected))
        originals = {}
        for size, info in manifest['sources'].items():
            raw = (ROOT / 'source' / info['file']).read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(), info['sha256'])
            originals[size] = ET.fromstring(raw)
        used = {'L': set(), 'S': set()}
        for record in assets['variants']:
            identity = (record['key'], record['size'], record['role'])
            source = next(v for v in manifest['variants'] if (v['key'], v['size'], v['role']) == identity)
            original = expected[identity]
            self.assertEqual((record['width'], record['height']), (original['width'], original['height']))
            self.assertEqual(record['sourceNode'], original['id'])
            svg = ET.parse(ROOT / 'web/assets' / record['asset']).getroot()
            self.assertEqual(svg.get('viewBox'), f"0 0 {record['width']} {record['height']}")
            self.assertEqual([x.tag for x in svg], [NS + 'g'])
            group = svg[0]
            self.assertEqual(len(group), len(source['indices']))
            self.assertEqual(source['indices'], sorted(source['indices']), 'original draw order must be preserved')
            self.assertGreater(len(group), 15)
            self.assertEqual(group.get('transform'), f"translate({-source['bounds'][0]} {-source['bounds'][1]})")
            for index, shape in zip(source['indices'], group):
                self.assertNotIn(index, used[record['size']], 'source shape assigned to two objects')
                used[record['size']].add(index)
                orig = originals[record['size']][index]
                self.assertEqual(shape.tag, NS + 'path')
                clean = {k: v for k, v in shape.attrib.items() if not k.startswith('data-')}
                self.assertEqual(clean, orig.attrib, 'geometry and source paints must be unchanged')
                for paint in ['fill', 'stroke']:
                    if paint in shape.attrib:
                        self.assertIn(shape.get('data-' + paint + '-slot'), SLOTS)
                        self.assertEqual(shape.get('data-' + paint + '-slot'), SOURCE_SLOTS[orig.get(paint)])
                        if record['role'] == 'background':
                            self.assertTrue(shape.get('data-' + paint + '-slot').startswith('background'))
            for e in svg.iter():
                self.assertNotIn(e.tag, [NS + 'image', NS + 'script', NS + 'foreignObject', NS + 'use'])
                self.assertFalse(any('href' in k or k.lower().startswith('on') for k in e.attrib))
            bounds = source['bounds']
            self.assertLess(abs(bounds[2] - bounds[0] - original['width']), 0.06)
            self.assertLess(abs(bounds[3] - bounds[1] - original['height']), 0.06)

    def test_small_variants_are_not_scaled_large_replacements(self):
        for key in ['book', 'phone', 'coin', 'headphones', 'wallet', 'folder']:
            counts = []
            for size in ['S', 'L']:
                root = ET.parse(ROOT / f'web/assets/{key}-{size}-main.svg').getroot()
                counts.append(len(root[0]))
            self.assertNotEqual(counts[0], counts[1], key)


if __name__ == '__main__':
    unittest.main()
