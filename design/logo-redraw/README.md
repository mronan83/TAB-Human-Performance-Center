# TAB Human Performance Center logo redraw (pending owner approval)

Vector redraw of the approved brand board (`images/12.webp` in the session that produced it), measured against the board.
Approval sheet: https://claude.ai/artifact/ANr1LCRAKNmmvjzaLijK7g

- `out/` final SVG lockups, symbol, app icons, favicon; `out/png/` raster exports; `out/icons/` the five service icons.
- `fit/` fitted parameters and the scripts that built them (Montserrat outlines via fontTools; the mark is a
  G1/G2 Bezier construction optimised against the board's per-part alpha masks, which are not committed).

Nothing here is wired into the site. After approval, the chosen files move to `public/brand/` in rebrand PR 1 and
this folder is removed.
