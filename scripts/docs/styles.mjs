/**
 * The stylesheet shared by every living-document page (architecture, data model, requirements, user stories, backlog,
 * content guide). Layout: a Deep Olive masthead carrying the approved logo, a hero, then a contents rail beside one
 * content column. Sizes are in rem and the root size steps up on large monitors, so one layout reads from a phone to a
 * 4K display; prose stays near 80 characters while tables, matrices and cards use the width. Touch screens get 44px
 * controls.
 *
 * Colour: TAB Human Performance Center's palette only (app/globals.css, proposed D-062). Statuses use icon, word and
 * tint together, never colour alone. Clay, Sage and Ochre appear only as borders, bars and tints, never as text or behind
 * white text; white text sits only on Deep Olive. Light palette on bare :root, dark for prefers-color-scheme: dark.
 */
const LIGHT = `
  --bg: #FBF6F1; --surface: #FFFFFF; --surface-2: #F4EFE7; --linen: #E8E3D9;
  --line: #DDD6CA; --line-strong: #ABA597; --input: #858075;
  --text: #2E2E2E; --text-soft: #5A5953; --text-faint: #625F58;
  --primary: #4A5A44; --primary-text: #3E4C39; --primary-tint: #E2EADA; --on-primary: #FFFFFF;
  --mast: #4A5A44; --mast-text: #FFFFFF; --mast-soft: #E5E8E2;
  --done-bg: #E2EADA; --done-line: #4A5A44; --done-fg: #33402F;
  --prog-bg: #EDF0EA; --prog-line: #7E8A76; --prog-fg: #2E2E2E;
  --ready-bg: #FFFFFF; --ready-line: #4A5A44; --ready-fg: #3E4C39;
  --queue-bg: #F1EDE6; --queue-line: #ABA597; --queue-fg: #5A5953;
  --block-bg: #F5E4DB; --block-line: #C46A4A; --block-fg: #8E472D;
  --you-bg: #F4E9DC; --you-line: #D4A574; --you-fg: #7A561B;
  --muted-fg: #5A5953;
  --bar-done: #4A5A44; --bar-prog: #A7B39F; --bar-ready: #C9D1C2; --bar-queue: #E1DBD0; --bar-block: #C46A4A; --bar-you: #D4A574;
  --focus: #A75436; --code-bg: #F1ECE3; --flash: #F4E9DC; --zone: #F6F1EA;
  --shadow: 0 1px 2px rgb(46 46 46 / 0.06), 0 0.375rem 1.25rem rgb(46 46 46 / 0.08);`;
const DARK = `
  --bg: #1C1E1B; --surface: #252824; --surface-2: #2B2E29; --linen: #31342F;
  --line: #3A3E37; --line-strong: #6E6F63; --input: #8F8C80;
  --text: #EFEAE0; --text-soft: #BEBBB0; --text-faint: #A9A69B;
  --primary: #C5CBA8; --primary-text: #CFD6B4; --primary-tint: #2B3A28; --on-primary: #1C1E1B;
  --mast: #2F3A2B; --mast-text: #FBF6F1; --mast-soft: #CFD6B4;
  --done-bg: #2B3A28; --done-line: #A9C99F; --done-fg: #D3E3CC;
  --prog-bg: #2E332B; --prog-line: #8C9884; --prog-fg: #E6E9E1;
  --ready-bg: transparent; --ready-line: #A9C99F; --ready-fg: #D3E3CC;
  --queue-bg: #31342F; --queue-line: #6E6F63; --queue-fg: #CFCCC2;
  --block-bg: #46301F; --block-line: #E8A57F; --block-fg: #F4CDB4;
  --you-bg: #3D3020; --you-line: #D4A574; --you-fg: #EFD3A6;
  --muted-fg: #BEBBB0;
  --bar-done: #A9C99F; --bar-prog: #7E8A76; --bar-ready: #4E5A49; --bar-queue: #45483F; --bar-block: #E8A57F; --bar-you: #D4A574;
  --focus: #E8A57F; --code-bg: #2B2E29; --flash: #3D3020; --zone: #222521;
  --shadow: 0 1px 2px rgb(0 0 0 / 0.4), 0 0.375rem 1.25rem rgb(0 0 0 / 0.3);
  color-scheme: dark;`;

export const CSS = `
:root {${LIGHT}
  --font-display: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
  --font-body: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
  --font-serif: 'Spectral', Georgia, serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --r-sm: 0.375rem; --r-md: 0.75rem; --r-lg: 1.125rem; --r-pill: 999px;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) {${DARK} } }
:root[data-theme='dark'] {${DARK} }

/* Base -------------------------------------------------------------------------------------------------------------- */
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
html { font-size: 100%; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; scroll-padding-top: 1rem; }
@media (min-width: 1800px) { html { font-size: 106.25%; } }
@media (min-width: 2400px) { html { font-size: 112.5%; } }
@media (min-width: 3200px) { html { font-size: 131.25%; } }
body { margin: 0; background: var(--bg); color: var(--text); font: 400 0.9375rem/1.6 var(--font-body); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.page { --gl: max(1rem, env(safe-area-inset-left, 0px)); --gr: max(1rem, env(safe-area-inset-right, 0px));
  max-width: calc(80rem + var(--gl) + var(--gr)); margin: 0 auto; padding: 0 var(--gr) 3rem var(--gl); }
@media (min-width: 1600px) { .page { max-width: calc(100rem + var(--gl) + var(--gr)); } }
a { color: var(--primary-text); text-underline-offset: 2px; text-decoration-thickness: 1px; }
a:hover { text-decoration-thickness: 2px; }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; border-radius: 0.25rem; }
.mast :focus-visible { outline-color: var(--mast-text); }
h1, h2, h3, h4 { font-family: var(--font-display); font-weight: 700; line-height: 1.2; text-wrap: balance; margin: 0; color: var(--text); }
h3 { font-size: 1.125rem; }
h4, h5, h6 { font-size: 0.9375rem; }
p { margin: 0; }
code, kbd { font-family: var(--font-mono); font-size: 0.86em; background: var(--code-bg); border-radius: 0.25rem; padding: 0.05em 0.3em; overflow-wrap: anywhere; }
a.code { text-decoration: none; } a.code code { border-bottom: 1px dotted var(--line-strong); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.i { width: 1.1em; height: 1.1em; flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; vertical-align: -0.18em; }
.eyebrow { font: 700 0.7188rem/1.3 var(--font-body); letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-faint); }
.none { color: var(--text-faint); }
[id] { scroll-margin-top: 1rem; }
.anchor { display: block; position: relative; top: -8px; }
.flash { animation: flash 1.6s ease-out; }
@keyframes flash { 0%, 35% { background-color: var(--flash); } }
@media (prefers-reduced-motion: reduce) { * { animation-duration: 1ms !important; transition-duration: 1ms !important; scroll-behavior: auto !important; } }

/* Masthead ---------------------------------------------------------------------------------------------------------- */
.mast { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1.5rem;
  margin: 0 calc(-1 * var(--gr)) 0 calc(-1 * var(--gl)); padding: 0.625rem var(--gr) 0.625rem var(--gl); background: var(--mast); color: var(--mast-text); }
@media (min-width: 720px) { .mast { border-radius: 0 0 var(--r-lg) var(--r-lg); } }
.brand { display: inline-flex; align-items: center; gap: 0.75rem; color: var(--mast-text); text-decoration: none; }
.brand img { height: 1.75rem; width: auto; display: block; }
.brand-sub { font: 600 0.6875rem/1 var(--font-body); letter-spacing: 0.08em; text-transform: uppercase; color: var(--mast-soft);
  padding-left: 0.75rem; border-left: 1px solid color-mix(in srgb, var(--mast-text) 35%, transparent); }
.mast ul { display: flex; flex-wrap: wrap; gap: 2px; list-style: none; margin: 0; padding: 0; }
.mast nav a { display: flex; align-items: center; gap: 0.375rem; padding: 0.4375rem 0.75rem; border-radius: var(--r-pill); color: var(--mast-text);
  text-decoration: none; font: 600 0.8438rem/1.2 var(--font-body); }
.mast nav a .no { font: 500 0.6875rem/1 var(--font-mono); }
.mast nav a:hover { background: color-mix(in srgb, var(--mast-text) 14%, transparent); }
.mast nav a[aria-current='page'] { background: var(--mast-text); color: var(--mast); }

/* Hero -------------------------------------------------------------------------------------------------------------- */
.hero { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.75rem; padding-block: 2.25rem 1.75rem; }
@media (max-width: 480px) { .hero { padding-block: 1.5rem 1.25rem; } }
.hero h1 { font-size: clamp(1.875rem, 4.4vw, 2.75rem); letter-spacing: -0.015em; }
.meta { color: var(--text-soft); font-size: 0.8438rem; }
.lede { max-width: 72ch; font: 400 1.125rem/1.55 var(--font-serif); color: var(--text-soft); }
.stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 8.5rem), 1fr)); gap: 0.625rem; margin: 0.5rem 0 0; max-width: 72rem; }
@media (max-width: 560px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.stat { display: grid; align-content: start; gap: 2px; padding: 0.625rem 0.875rem 0.75rem; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); }
.stat dt { order: 2; font-size: 0.7812rem; color: var(--text-soft); }
.stat dd { order: 1; margin: 0; font: 800 1.625rem/1.1 var(--font-display); font-variant-numeric: tabular-nums; }
.stat dd small { font: 600 0.8125rem var(--font-body); color: var(--text-soft); }
.stat.st-you { border-color: var(--you-line); background: var(--you-bg); }
.stat.st-you dd, .stat.st-you dt { color: var(--you-fg); }
.stat.st-blocked { border-color: var(--block-line); background: var(--block-bg); }
.stat.st-blocked dd, .stat.st-blocked dt { color: var(--block-fg); }
.latest { max-width: 88ch; padding: 0.75rem 1rem; border-left: 3px solid var(--you-line); background: var(--surface); border-radius: 0 var(--r-md) var(--r-md) 0;
  display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.25rem; font-size: 0.875rem; }

/* Layout and contents rail ------------------------------------------------------------------------------------------- */
.layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem; }
.toc { display: none; }
.toc-m { margin-bottom: 1rem; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); padding: 0.625rem 0.875rem; }
.toc-m summary { cursor: pointer; font-weight: 600; }
.toc ol, .toc-m ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; }
.toc ol ol, .toc-m ol ol { padding-left: 0.75rem; margin-bottom: 0.25rem; }
.toc a, .toc-m a { display: block; padding: 0.25rem 0.5rem; border-radius: var(--r-sm); color: var(--text-soft); text-decoration: none; font-size: 0.8438rem; line-height: 1.35; }
.toc ol ol a { font-size: 0.7812rem; }
.toc a:hover, .toc-m a:hover { color: var(--text); background: var(--surface-2); }
.toc a[aria-current='true'] { color: var(--primary-text); background: var(--primary-tint); font-weight: 600; }
.toc .key { display: grid; gap: 0.25rem; margin-top: 0.75rem; padding: 0.625rem 0.5rem 0; border-top: 1px solid var(--line); font-size: 0.75rem; color: var(--text-soft); }
.toc .key .pill { justify-self: start; }
@media (min-width: 1100px) {
  .layout { grid-template-columns: 13.5rem minmax(0, 1fr); }
  .toc { display: block; }
  .toc nav { position: sticky; top: 1rem; max-height: calc(100dvh - 2rem); overflow-y: auto; display: grid; gap: 0.5rem; }
  .toc-m { display: none; }
}
main { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 3rem; }

/* Sections ---------------------------------------------------------------------------------------------------------- */
.sec { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; min-width: 0; }
.sec-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.5rem 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--line); }
.sec-head h2 { font-size: 1.5rem; letter-spacing: -0.01em; }
.sec-note { max-width: 80ch; color: var(--text-soft); }
.sub { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.75rem; min-width: 0; }
.sub > h3, .sub > .group-h { padding-top: 0.5rem; }
.prose { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.75rem; max-width: 82ch; min-width: 0; }
.prose ul, .prose ol { margin: 0; padding-left: 1.3em; display: grid; gap: 0.375rem; }
.prose ol.steps li::marker { font-weight: 700; color: var(--primary-text); }
.prose ol.steps ul { margin-top: 0.375rem; }
.prose h3 { margin-top: 0.75rem; }
.prose .table-wrap, .prose .chart, .prose .cards, .prose .rows, .prose .matrix { max-width: none; }
.prose > .wide, .wide { max-width: none; }
.note { color: var(--text-soft); font-size: 0.875rem; }
.sec > p.para, .sec > ul.bullets, .sec > ol.bullets, .sec > blockquote, .sec > .sub-h + p.para { max-width: 82ch; }

/* Tables ------------------------------------------------------------------------------------------------------------ */
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); }
table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
th, td { text-align: left; vertical-align: top; padding: 0.5625rem 0.75rem; border-bottom: 1px solid var(--line); }
th { font: 600 0.7188rem/1.3 var(--font-body); letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-soft); background: var(--surface-2); white-space: nowrap; }
tbody tr:last-child td { border-bottom: 0; }
td { font-variant-numeric: tabular-nums; }
td.nowrap { white-space: nowrap; }
td.main { min-width: 14rem; }
td .why { display: block; margin-top: 0.25rem; font-size: 0.8125rem; color: var(--text-soft); }
@media (max-width: 640px) {
  table.md thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  table.md tr { display: grid; gap: 0.25rem; padding: 0.75rem; border-bottom: 1px solid var(--line); }
  table.md tbody tr:last-child { border-bottom: 0; }
  table.md td { display: block; padding: 0; border: 0; }
  table.md td::before { content: attr(data-label); display: block; font: 600 0.6875rem/1.4 var(--font-body); letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-faint); }
  table.md td:empty { display: none; }
}

/* Statuses: pills, tags, references ---------------------------------------------------------------------------------- */
.st-done { --st: var(--done-line); --st-bg: var(--done-bg); --st-fg: var(--done-fg); }
.st-progress { --st: var(--prog-line); --st-bg: var(--prog-bg); --st-fg: var(--prog-fg); }
.st-ready { --st: var(--ready-line); --st-bg: var(--ready-bg); --st-fg: var(--ready-fg); }
.st-queued { --st: var(--queue-line); --st-bg: var(--queue-bg); --st-fg: var(--queue-fg); }
.st-blocked { --st: var(--block-line); --st-bg: var(--block-bg); --st-fg: var(--block-fg); }
.st-you { --st: var(--you-line); --st-bg: var(--you-bg); --st-fg: var(--you-fg); }
.st-muted { --st: var(--line-strong); --st-bg: transparent; --st-fg: var(--muted-fg); }
.pill { display: inline-flex; align-items: center; gap: 0.3125rem; padding: 2px 0.5625rem 2px 0.375rem; border: 1px solid var(--st, var(--line-strong));
  background: var(--st-bg, var(--surface)); color: var(--st-fg, var(--text-soft)); border-radius: var(--r-pill); font: 600 0.75rem/1.5 var(--font-body); white-space: nowrap; }
.pill small { font-weight: 500; }
.st-ready.pill, .st-ready.tag, .st-muted.pill, .st-muted.tag { border-style: dashed; }
.pill.plain { --st: var(--line); --st-bg: var(--surface-2); --st-fg: var(--text-soft); padding-left: 0.5625rem; }
.tags { display: inline-flex; flex-wrap: wrap; gap: 0.25rem; vertical-align: middle; }
.tag { display: inline-flex; align-items: center; gap: 0.25rem; min-height: 1.5rem; padding: 1px 0.4375rem 1px 0.3125rem; border: 1px solid var(--st, var(--line));
  background: var(--st-bg, var(--surface)); color: var(--st-fg, var(--text-soft)); border-radius: var(--r-pill); font: 500 0.75rem/1.55 var(--font-mono); text-decoration: none; white-space: nowrap; }
.tag:not([class*='st-']) { padding-left: 0.4375rem; }
a.tag:hover { border-color: var(--text-soft); }
.tag .i { width: 0.8rem; height: 0.8rem; vertical-align: 0; }
a.ref { font-family: var(--font-mono); font-size: 0.88em; font-weight: 500; white-space: nowrap; text-decoration-style: dotted; }
code a.ref { font-size: inherit; }
.id { font: 600 0.8125rem/1.4 var(--font-mono); color: var(--text); white-space: nowrap; }
.pr { font: 600 0.6875rem/1.5 var(--font-body); padding: 1px 0.5rem; border-radius: var(--r-pill); border: 1px solid var(--line-strong); color: var(--text-soft); white-space: nowrap; }
.pr.must { background: var(--primary); border-color: var(--primary); color: var(--on-primary); }

/* Bars and meters ----------------------------------------------------------------------------------------------------- */
.stack { display: flex; width: 100%; height: 0.75rem; border-radius: var(--r-pill); overflow: hidden; background: var(--surface-2); gap: 2px; }
.stack.small { height: 0.5rem; }
.stack .seg { min-width: 0.25rem; }
.seg.st-done { background: var(--bar-done); } .seg.st-progress { background: var(--bar-prog); } .seg.st-ready { background: var(--bar-ready); }
.seg.st-queued { background: var(--bar-queue); } .seg.st-blocked { background: var(--bar-block); } .seg.st-you { background: var(--bar-you); } .seg.st-muted { background: var(--line); }
.stack-l { font-size: 0.7812rem; color: var(--text-soft); }
.bars { display: grid; gap: 0.625rem; }
.bar-row { display: grid; grid-template-columns: minmax(8rem, 13rem) minmax(0, 1fr) auto; gap: 0.75rem; align-items: center; font-size: 0.875rem; }
.bar-row .stack-l { white-space: nowrap; }
@media (max-width: 560px) { .bar-row { grid-template-columns: minmax(0, 1fr) auto; } .bar-row .stack { grid-column: 1 / -1; order: 3; } }

/* Filters: the search row stays pinned while its list scrolls; on small or short screens the chips fold behind a button. */
.filters { position: sticky; top: 0; z-index: 20; display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.625rem; padding: 0.75rem 0; background: var(--bg); border-bottom: 1px solid var(--line); }
@media (max-height: 499px) { .filters { position: static; } }
.filter-top { display: flex; gap: 0.5rem; align-items: center; }
.facet-toggle { display: none; flex: none; align-items: center; gap: 0.375rem; }
.facet-toggle .n { min-width: 1.25rem; padding: 0 0.3125rem; border-radius: var(--r-pill); background: var(--text); color: var(--bg); font-size: 0.6875rem; text-align: center; }
@media (max-width: 1099px), (max-height: 760px) {
  .facet-toggle { display: inline-flex; }
  .filters .facets { display: none; }
  .filters.open .facets { display: flex; max-height: min(50vh, 26rem); overflow-y: auto; overscroll-behavior: contain; padding-bottom: 0.25rem; }
}
.search { flex: 1; min-width: 0; display: flex; align-items: center; gap: 0.5rem; padding: 0 0.75rem; border: 1px solid var(--input); border-radius: var(--r-pill); background: var(--surface); color: var(--text-soft); }
.search:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 25%, transparent); }
.search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--text); font: 400 1rem/1.2 var(--font-body); padding: 0.5625rem 0; }
.search kbd { font-size: 0.6875rem; border: 1px solid var(--line); }
.facets { display: flex; flex-wrap: wrap; gap: 0.5rem 1.125rem; }
.facet { display: flex; flex-wrap: wrap; align-items: center; gap: 0.3125rem; }
.facet-l { font: 600 0.7188rem/1 var(--font-body); letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-faint); margin-right: 2px; }
.chip { display: inline-flex; align-items: center; gap: 0.3125rem; padding: 0.25rem 0.625rem; border: 1px solid var(--input); border-radius: var(--r-pill);
  background: var(--surface); color: var(--text-soft); font: 500 0.7812rem/1.4 var(--font-body); cursor: pointer; }
@media (hover: hover) { .chip:hover { border-color: var(--text-soft); color: var(--text); } }
.chip[aria-pressed='true'] { background: var(--text); border-color: var(--text); color: var(--bg); }
.chip .n { font-variant-numeric: tabular-nums; font-weight: 600; }
.count { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--text-soft); }
.reset, .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem; border: 1px solid var(--input); background: var(--surface); color: var(--text);
  border-radius: var(--r-pill); padding: 3px 0.6875rem; font: 600 0.7812rem/1.4 var(--font-body); cursor: pointer; }
@media (hover: hover) { .reset:hover, .btn:hover { border-color: var(--text-soft); } }
.temp-filter { display: inline-flex; align-items: center; gap: 0.375rem; padding: 2px 0.625rem; border-radius: var(--r-pill); background: var(--text); color: var(--bg); font-size: 0.7812rem; font-weight: 600; }
.empty { padding: 1.5rem; text-align: center; color: var(--text-soft); border: 1px dashed var(--line-strong); border-radius: var(--r-md); }

/* Expandable rows ----------------------------------------------------------------------------------------------------- */
.rows { display: grid; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); overflow: hidden; }
.row { border-bottom: 1px solid var(--line); }
.row:last-child { border-bottom: 0; }
.row > summary, .row-static { display: grid; grid-template-columns: 5.75rem minmax(0, 1fr) auto; gap: 0.25rem 0.875rem; align-items: start; padding: 0.75rem 0.875rem; }
.rows.wide-id .row > summary, .rows.wide-id .row-static { grid-template-columns: 12rem minmax(0, 1fr) auto; }
.row > summary { list-style: none; cursor: pointer; }
.row > summary::-webkit-details-marker { display: none; }
@media (hover: hover) { .row > summary:hover { background: color-mix(in srgb, var(--surface-2) 70%, transparent); } }
.row[open] > summary { background: var(--surface-2); }
.row .what { display: grid; gap: 0.375rem; min-width: 0; }
.row .title { font-weight: 600; }
.row .title.long { font-weight: 500; }
.row .facts { display: flex; flex-wrap: wrap; gap: 0.375rem 0.75rem; font-size: 0.7812rem; color: var(--text-soft); align-items: center; }
.row .side { display: flex; flex-direction: column; align-items: flex-end; gap: 0.375rem; }
.chev { transition: transform 0.2s; color: var(--text-faint); }
.row[open] .chev { transform: rotate(180deg); }
.row-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.875rem; padding: 0.25rem 0.875rem 1.125rem 7.5rem; min-width: 0; }
.rows.wide-id .row-body { padding-left: 13.75rem; }
@media (max-width: 720px) {
  .row > summary, .row-static, .rows.wide-id .row > summary, .rows.wide-id .row-static { grid-template-columns: minmax(0, 1fr) auto; }
  .row > summary .id, .row-static .id { grid-column: 1 / -1; }
  .row-body, .rows.wide-id .row-body { padding-left: 0.875rem; }
}
.kv { display: grid; grid-template-columns: 9.375rem minmax(0, 1fr); gap: 0.5rem 1rem; margin: 0; font-size: 0.875rem; }
.kv dt { font: 600 0.7188rem/1.7 var(--font-body); letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-faint); }
.kv dd { margin: 0; min-width: 0; }
@media (max-width: 560px) { .kv { grid-template-columns: minmax(0, 1fr); gap: 2px; } .kv dd { margin-bottom: 0.5rem; } }
.trace-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.trace-list li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.25rem 0.625rem; align-items: baseline; }
.trace-list .t { color: var(--text-soft); }
.bullets { margin: 0; padding-left: 1.2em; display: grid; gap: 0.375rem; max-width: 86ch; }
.done-when { padding: 0.625rem 0.875rem; border: 1px solid var(--done-line); background: color-mix(in srgb, var(--done-bg) 60%, var(--surface)); border-radius: var(--r-md); max-width: 86ch; }
.done-when b { color: var(--done-fg); }
.inner-table { font-size: 0.8125rem; }

/* Cards ------------------------------------------------------------------------------------------------------------- */
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 16.25rem), 1fr)); gap: 0.75rem; }
.card { display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: 0.5rem; padding: 0.875rem 1rem; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); min-width: 0; }
.card h3 { font-size: 1rem; }
.card p { color: var(--text-soft); font-size: 0.875rem; }
.card .card-h { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; justify-content: space-between; }
.num { font: 800 0.8125rem/1 var(--font-display); color: var(--primary-text); font-variant-numeric: tabular-nums; }

/* Matrix (milestone × size, epic × phase) ----------------------------------------------------------------------------- */
.matrix { overflow-x: auto; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); }
@media (min-width: 641px) { .matrix table { min-width: 40rem; } }
.matrix th[scope='row'] { text-transform: none; letter-spacing: 0; font: 700 0.875rem/1.3 var(--font-display); color: var(--text); background: var(--surface); white-space: normal; min-width: 11rem; }
.matrix th[scope='row'] small { display: block; font: 400 0.75rem/1.4 var(--font-body); color: var(--text-soft); margin-top: 2px; }
.matrix td { min-width: 4.5rem; }
.matrix .prog { display: grid; gap: 0.25rem; margin-top: 0.5rem; max-width: 12rem; font: 400 0.75rem/1.3 var(--font-body); color: var(--text-soft); }
@media (max-width: 640px) {
  .matrix { overflow: visible; }
  .matrix table.md tr { gap: 0.5rem; }
  .matrix table.md th[scope='row'] { display: block; padding: 0; border: 0; background: none; min-width: 0; }
  .matrix td { min-width: 0; }
  .matrix table.md td:has(> .none:only-child) { display: none; }
}

/* Waiting on you ------------------------------------------------------------------------------------------------------ */
.yours { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.75rem; padding: 1.125rem; border: 1px solid var(--you-line); border-radius: var(--r-lg); background: color-mix(in srgb, var(--you-bg) 70%, var(--surface)); }
.yours ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.yours li { display: grid; grid-template-columns: 3rem minmax(0, 1fr) auto; gap: 0.25rem 0.75rem; align-items: start; padding: 0.625rem 0; border-top: 1px solid color-mix(in srgb, var(--you-line) 45%, transparent); }
.yours li:first-child { border-top: 0; }
.yours .yid { font: 800 0.9375rem/1.4 var(--font-display); color: var(--you-fg); }
.yours .act { font-weight: 600; }
.yours .where { font-size: 0.8125rem; color: var(--text-soft); }
.yours .unb { display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center; font-size: 0.7812rem; color: var(--text-soft); margin-top: 0.25rem; }
@media (max-width: 640px) { .yours li { grid-template-columns: 2.5rem minmax(0, 1fr); } .yours li > .btn { grid-column: 2; justify-self: start; } }
.yours-done summary { cursor: pointer; font-weight: 600; font-size: 0.875rem; color: var(--text-soft); }
.yours-done ul { list-style: none; margin: 0.5rem 0 0; padding: 0; display: grid; gap: 0.375rem; }
.yours-done li { display: grid; grid-template-columns: 3rem minmax(0, 1fr); gap: 0.75rem; font-size: 0.8125rem; color: var(--text-soft); }

/* Chains, checks, risk grid -------------------------------------------------------------------------------------------- */
.chain { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; padding: 0.875rem; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); }
.chain .arrow { color: var(--text-faint); }
.checks { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.checks li { display: flex; gap: 0.5rem; align-items: baseline; flex-wrap: wrap; font-size: 0.875rem; }
.checks .ok { color: var(--done-fg); } .checks .warn { color: var(--block-fg); } .checks .info { color: var(--text-soft); }
.riskgrid { display: grid; grid-template-columns: 4.75rem repeat(3, minmax(0, 1fr)); gap: 0.25rem; max-width: 50rem; }
.riskgrid .ax { font: 600 0.7188rem/1.3 var(--font-body); letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-faint); display: flex; align-items: center; }
.riskgrid .ax.top { justify-content: center; }
.riskgrid .cell { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 0.25rem; min-height: 4rem; padding: 0.5rem; border-radius: var(--r-sm); background: var(--surface); border: 1px solid var(--line); }
.riskgrid .cell.h2 { background: color-mix(in srgb, var(--you-bg) 55%, var(--surface)); }
.riskgrid .cell.h3 { background: color-mix(in srgb, var(--block-bg) 75%, var(--surface)); border-color: color-mix(in srgb, var(--block-line) 45%, var(--line)); }

/* Diagrams (plain SVG styled by the page's tokens) ---------------------------------------------------------------------- */
.chart { margin: 0; display: grid; gap: 0.5rem; }
.chart .scroll { overflow-x: auto; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-md); padding: 1rem; overscroll-behavior-x: contain; }
.chart svg { display: block; width: 100%; height: auto; font-family: var(--font-body); }
.chart figcaption { color: var(--text-soft); font-size: 0.8125rem; max-width: 82ch; }
.t-title { font-size: 15px; font-weight: 700; fill: var(--text); }
.t-name { font-size: 13px; font-weight: 700; fill: var(--text); }
.t-label { font-size: 12.5px; fill: var(--text); }
.t-quiet { font-size: 11.5px; fill: var(--text-soft); }
.t-edge { font-size: 11px; fill: var(--text-soft); }
.t-zone { font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; fill: var(--text-faint); }
.t-in { font-size: 11px; font-weight: 700; fill: var(--text); }
.t-id { font: 600 11.5px var(--font-mono); fill: var(--text); }
.node { fill: var(--surface); stroke: var(--line-strong); stroke-width: 1.2; }
.node.accent { fill: var(--block-bg); stroke: var(--block-line); stroke-width: 1.8; }
.node.muted { fill: var(--surface-2); stroke-dasharray: 4 3; }
.zone { fill: var(--zone); stroke: var(--line); }
.edge { fill: none; stroke: var(--line-strong); stroke-width: 1.4; }
.edge.dashed { stroke-dasharray: 5 4; }
.arrowhead { fill: var(--line-strong); }
.grid-line { stroke: var(--line); stroke-width: 1; }
.ref-line { stroke: var(--focus); stroke-width: 1.5; stroke-dasharray: 5 4; }
.seg-verified { fill: var(--bar-done); } .seg-built { fill: var(--bar-ready); stroke: var(--ready-line); stroke-width: 1; stroke-dasharray: 3 2; } .seg-partial { fill: var(--bar-prog); }
.seg-planned { fill: var(--bar-queue); stroke: var(--line-strong); stroke-width: 1; } .seg-deferred { fill: var(--surface); stroke: var(--line-strong); stroke-dasharray: 3 2; }
svg a .dnode { fill: var(--st-bg); stroke: var(--st); stroke-width: 1.4; }
svg a.st-ready .dnode, svg a.st-muted .dnode { stroke-dasharray: 4 3; }
svg a .dtext { fill: var(--st-fg); }
svg a:hover .dnode, svg a:focus-visible .dnode { stroke-width: 2.6; }
svg .lane { fill: var(--zone); stroke: var(--line); }

/* Hover card ---------------------------------------------------------------------------------------------------------- */
.pop { position: fixed; z-index: 60; max-width: min(24rem, calc(100vw - 2rem)); padding: 0.625rem 0.75rem; border: 1px solid var(--line-strong); border-radius: var(--r-md);
  background: var(--surface); color: var(--text); box-shadow: var(--shadow); font-size: 0.8438rem; line-height: 1.45; display: grid; gap: 0.375rem; pointer-events: none; }
.pop .pop-h { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
.pop .pop-k { font-size: 0.7188rem; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.06em; }

/* Legend, footer, utilities --------------------------------------------------------------------------------------------- */
.legend { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.5rem; padding: 0.875rem 1rem; border: 1px dashed var(--line-strong); border-radius: var(--r-md); font-size: 0.8438rem; color: var(--text-soft); }
.legend .tags { gap: 0.375rem; }
.foot { margin-top: 3.5rem; padding-top: 1.125rem; border-top: 1px solid var(--line); color: var(--text-soft); font-size: 0.8125rem; display: grid; gap: 0.375rem; }
.muted { color: var(--text-soft); }
.small { font-size: 0.8125rem; }
.split { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 21rem), 1fr)); gap: 1rem; align-items: start; }
.group-h { display: flex; align-items: baseline; gap: 0.625rem; flex-wrap: wrap; }
.group-h h3 { font-size: 1.1875rem; }
.tools { display: flex; gap: 0.5rem; flex-wrap: wrap; }
details.more > summary { cursor: pointer; color: var(--primary-text); font-weight: 600; font-size: 0.8438rem; }
details.more[open] > summary { margin-bottom: 0.625rem; }
.as { color: var(--text-soft); font-size: 0.875rem; }
.gwt { margin: 0; padding-left: 1.4em; display: grid; gap: 0.5rem; max-width: 88ch; }
.gwt li::marker { font: 700 0.75rem var(--font-display); color: var(--text-faint); }
.kw { font-weight: 700; color: var(--primary-text); }
pre.code { margin: 0; overflow-x: auto; background: var(--code-bg); border: 1px solid var(--line); border-radius: var(--r-sm); padding: 0.75rem 0.875rem; font: 400 0.7812rem/1.55 var(--font-mono); white-space: pre-wrap; }
pre.code code { background: none; padding: 0; }
blockquote { margin: 0; padding: 0.625rem 0.875rem; border-left: 3px solid var(--line-strong); background: var(--surface); border-radius: 0 var(--r-sm) var(--r-sm) 0; color: var(--text-soft); }

/* Touch screens: every control at least 44px tall; ID tags at least 28px. */
@media (pointer: coarse) {
  .mast nav a, .chip, .btn, .reset, .toc a, .toc-m a, .toc-m summary, details.more > summary { min-height: 2.75rem; }
  .toc a, .toc-m a, .toc-m summary, details.more > summary { display: flex; align-items: center; }
  .chip { padding-inline: 0.875rem; } .btn, .reset { padding-inline: 1rem; }
  .search input { min-height: 2.75rem; } .search kbd { display: none; }
  .tags { gap: 0.375rem; } a.tag { min-height: 1.75rem; padding-inline: 0.5rem 0.625rem; }
}
@media print { .filters, .toc, .toc-m, .mast nav { display: none !important; } details.row { break-inside: avoid; } }
`;
