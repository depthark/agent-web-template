# Fonts

- `anybody.woff2` – [Anybody](https://github.com/Etcetera-Type-Co/Anybody) by Etcetera Type Co., SIL OFL 1.1 (`LICENSE-anybody.txt`, no Reserved Font Name). Variable (wdth 50–150, wght 100–900), subset to Latin + Czech/Slovak + punctuation.
  **Modified:** `lcaron` (ľ) rebuilt for Slovak – the upstream glyph is `l` + a centred háček; here it is `l` + the apostrophe-style caron of `ď`, right of the stem, with gvar deltas so it follows the stem on every width/weight. Scripts: `docs/creative/tools/fix-lcaron.py` (glyph) and `anybody-one.py` (subset), run on the upstream `Anybody[wdth,wght].ttf`.
