# Sobrano browser editor implementation plan

> For agentic workers: execute with superpowers:executing-plans in this chat. User approved the five-stage order; continue without another planning approval.

**Goal:** A reviewer launches the free local editor, chooses original objects, edits a composition and downloads an editable SVG.

**Architecture:** Extract original vectors from the two user-supplied flattened Figma frames, retaining exact path data and native relative dimensions. A standalone browser editor owns scene state, whole-object editing and SVG serialization; the existing local CPU model remains an optional semantic planner behind the same-origin helper.

**Tech stack:** Browser ES modules, SVG, CSS, Node built-in tests, existing Python/ONNX helper and Docker Compose.

**Spec:** career-search/studia-ochen-web-editor-brief-2026-11-22.md in the private career repository; public requirements summarized here.

## Global constraints

- 10 families × L/S × main/background = 40 original variants; preserve paths and one common scale.
- No invented illustrations, raster export, competitor code/assets, paid API or mandatory reviewer API keys. User authorized an optional free OpenRouter mode on 22 November; local CPU operation remains available without registration.
- Three original palettes and validated palette import; background uses background slots only.
- Direct objects → three layouts → whole-object editing → SVG must work before model integration and packaging.
- Keep the preview release intact until its replacement passes the actual browser workflow.

## Review focus

- Flattened exports must not accidentally include labels, palette swatches or parts of adjacent objects.
- Repeated recoloring and duplicate objects must preserve paint roles and SVG ID uniqueness.
- Invalid project/palette input must preserve the current scene and reject external SVG content.
- Slow or failed semantic requests must not replace a newer scene or discard manual edits.
- Reviewers on small screens and without the model must still complete direct selection and export.

### Task 1: Original library

Files: source/originals/library-{L,S}.svg, source/extraction.json, web/assets/*.svg, scripts/extract-library.py, tests/test_library.py.

Interface: web/assets/catalog.json enumerates key, label, size, role, native width/height, asset URL and paint-role mapping. Extraction manifest records source SHA256 and direct-child indices.

- [x] Render both source frames and identify all 40 regions using exact path bounds.
- [x] Write a failing test for all 40 variants, geometry provenance, native dimensions and safe vectors.
- [x] Implement deterministic extraction; retain original d values and normalize only by wrapper translation.
- [x] Run tests and inspect contact sheets of all extracted variants. Commit verified library. Independent review found no Critical/Important issues; exact order/paint-slot assertions added.

### Task 2: Complete direct-object workflow

Files: web/index.html, web/styles.css, web/core.mjs, web/app.mjs, tests/web-core.test.cjs, helper/server.py.

Interfaces: createScene(keys, options), layouts(scene), recolor(scene, palette), exportSvg(scene, assets), validateProject(input). Scene stores family/role/position/rotation and global scale; source geometry never enters user project data.

- [ ] Show three distinct visual editor concepts grounded in the original assets; settle the visual direction before UI implementation.
- [ ] Pin layout, palette and safe project/export behaviors with failing tests; implement the pure scene core.
- [ ] Implement object picker, large canvas, three actual layout previews and contextual whole-object controls.
- [ ] Add undo/redo, local recovery and validated portable JSON projects.
- [ ] Verify phone + puzzle → three layouts → move/rotate/duplicate/delete/layers → downloaded SVG in the browser, desktop and narrow screen.

### Task 3: Meaning planner

Files: helper/server.py, helper semantic tests, web/app.mjs.

Scoped exception explicitly requested by the user on 22 November: acquire a separate free OpenRouter key and smoke-test it before UI implementation. Done; see docs/free-cloud-spike.md. This does not complete or reorder the editor/model integration work below. The credential is outside Git and the Docker context; it must never enter a public release or the browser bundle.

- [ ] Record an unseen evaluation set before tuning; include explicit names, mixed intent, exclusions, ambiguous and unsupported requests.
- [ ] Preserve explicit requested objects, apply supported exclusions, expose uncertainty and keep model errors recoverable.
- [ ] Verify actual local inference, edit preservation and stale response rejection. Do not label dictionary rules as AI.

### Task 4: Reviewer delivery

Files: Dockerfile, installer packaging, README.md, docs/verification.md, final examples and demo.

- [ ] Ship the real editor and all 40 assets in the existing offline image/Compose package.
- [ ] Verify both architecture builds and downloaded archive startup; record platform limitations honestly.
- [ ] Record a short complete editor demo and three SVG examples from the app; fresh final review and fixes.
- [ ] Publish the working public source/release and update private career tracking without touching other work.
