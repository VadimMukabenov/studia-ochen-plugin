# Original vector library

The illustration artwork belongs to the source take-home library. It was supplied
by the user as two SVG frame exports from their Figma copy on 22 November 2026.
It is not generated artwork and is not taken from another candidate's repository.

- `originals/library-L.svg`, `originals/library-S.svg`: unchanged supplied exports.
- `catalog.json`: native Figma node IDs and exact node dimensions recorded earlier.
- `extraction.json`: source SHA256, direct-child indices and measured path bounds
  for every original variant.
- `../web/assets/`: 40 standalone SVGs, 10 families × L/S × main/background.
- `../docs/library-contact-sheet.jpg`: visual inspection sheet. Each thumbnail is
  fitted independently for inspection; this sheet does not show relative object
  scale in a composition.

Figma flattened names and groups when exporting the frames. Extraction restores
the objects using their positions on each original sheet. All original `d`, fill,
stroke, opacity and fill-rule attributes remain unchanged. A single wrapper
translation moves an object's original bounds to the origin. No path is rescaled
or rewritten. `data-fill-slot` / `data-stroke-slot` annotate permanent color roles
so later palette changes do not have to infer roles from a previously changed HEX.

SVG export rounds path coordinates. Differences between the measured exported
path bounds and native node dimensions are below 0.06 source units. The asset
viewBox uses the native dimensions; the future composition engine must use one
common scale for every object, rather than independently fitting its bounding box.

S/main really has less detail for book, phone, coin, headphones, folder and wallet.
Other shapes can have the same path count, and some original S/background
variants retain detail present in L. We preserve those supplied differences.

Rebuild and verify, with Python 3 and no third-party packages:

```sh
python3 scripts/extract-library.py
python3 tests/test_library.py
```

Tests check all 40 identities against the native catalog, source hashes, every
original path attribute, non-overlapping source ownership, native dimensions,
safe vector-only content and permanent paint roles. The complete browser editor
is the next stage; these assets alone are not a finished application.
