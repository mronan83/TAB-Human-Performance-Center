# TAB Human Performance Center logo redraw (approved baseline, 2026-10-05)

Vector redraw of the approved brand board, measured against the board, then corrected where the AI-generated board was
inconsistent: one descriptor tracking value, even line spacing aligned to TAB, a centred divider, a centred tagline
(see the end of `fit/build.py`). Approved by the owner on 2026-10-05 as the baseline for the website brand redesign:
flat colour is the master, the sheen versions are for large digital uses, the stacked lockup is approved, and both
service icon colourways are approved. Palette: the palette file values (Deep Olive #4A5A44, Clay #C46A4A, Linen #E8E3D9,
Bone #FBF6F1). Name: TAB Human Performance Center.
Approval sheet: https://claude.ai/artifact/ANr1LCRAKNmmvjzaLijK7g

- The installed artwork is in `public/brand/` (lockups, symbol, app icons, service icons) and `public/` (favicons,
  touch and PWA icons). `make.py` writes it to `out/` (git-ignored) before it is copied there.
- `fit/` fitted parameters and the scripts that built them (Montserrat outlines via fontTools; the mark is a
  G1/G2 Bezier construction optimised against the board's per-part alpha masks, which are not committed).

Kept as the record of how the production logo was made (proposed D-061). Designer vector masters, if commissioned,
replace the files in `public/brand/` under the same names.
