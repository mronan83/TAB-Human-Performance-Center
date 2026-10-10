// Client behaviour shared by every living-document page (inlined by scripts/docs/page.mjs): search and chip filters,
// buttons that apply a filter, deep links that open and reveal their target, contents highlighting, expand and
// collapse, and a hover card for every linked ID, drawn from the ID index embedded in the page.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = {};
  let statuses = {};
  try {
    index = JSON.parse($('#tab-index')?.textContent || '{}');
    statuses = JSON.parse($('#tab-statuses')?.textContent || '{}');
  } catch {
    index = {};
  }

  // Filters: each bar filters the [data-item] elements of its own section ------------------------------------------
  const bars = new Map();
  for (const bar of $$('.filters')) {
    const scope = bar.closest('section') || document;
    const items = $$('[data-item]', scope);
    const q = $('input[type=search]', bar);
    const count = $('.count-text', bar);
    const reset = $('.reset', bar);
    const temp = $('.temp-filter', bar);
    const toggle = $('.facet-toggle', bar);
    const badge = toggle && $('.n', toggle);
    const noun = bar.dataset.noun || 'items';
    const active = {};
    const text = new Map(items.map((el) => [el, (el.dataset.search || el.textContent).toLowerCase()]));
    const apply = () => {
      const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let shown = 0;
      for (const el of items) {
        let ok = words.every((w) => text.get(el).includes(w));
        for (const [facet, set] of Object.entries(active)) {
          if (!ok || !set.size) continue;
          const vals = (el.getAttribute('data-f-' + facet) || '').split(' ');
          ok = vals.some((v) => set.has(v));
        }
        el.hidden = !ok;
        if (ok) shown++;
      }
      for (const g of $$('[data-group]', scope)) {
        g.hidden = !$$('[data-item]', g).some((el) => !el.hidden);
        const h = g.previousElementSibling;
        if (h?.matches('.sub-h')) h.hidden = g.hidden;
      }
      for (const e of $$('.empty[data-empty]', scope)) e.hidden = shown > 0;
      count.textContent = 'Showing ' + shown + ' of ' + items.length + ' ' + noun;
      const any = words.length || Object.values(active).some((s) => s.size);
      reset.hidden = !any;
      if (badge) {
        const n = Object.values(active).reduce((sum, s) => sum + s.size, 0);
        badge.textContent = String(n);
        badge.hidden = !n;
      }
    };
    toggle?.addEventListener('click', () => {
      const open = !bar.classList.contains('open');
      bar.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('.chip[data-facet]');
      if (!b) return;
      const { facet, value } = b.dataset;
      const set = (active[facet] ||= new Set());
      if (set.has(value)) set.delete(value);
      else set.add(value);
      b.setAttribute('aria-pressed', String(set.has(value)));
      apply();
    });
    q.addEventListener('input', apply);
    const clear = () => {
      q.value = '';
      for (const s of Object.values(active)) s.clear();
      for (const b of $$('.chip[data-facet]', bar)) b.setAttribute('aria-pressed', 'false');
      temp.hidden = true;
      temp.textContent = '';
      apply();
    };
    reset.addEventListener('click', clear);
    const set = (facet, value, label) => {
      clear();
      active[facet] = new Set([value]);
      const chip = $('.chip[data-facet="' + facet + '"][data-value="' + value + '"]', bar);
      if (chip) chip.setAttribute('aria-pressed', 'true');
      else {
        temp.hidden = false;
        temp.textContent = label || value;
      }
      apply();
      const top = bar.getBoundingClientRect().top + scrollY - 8;
      scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    };
    bars.set(scope.id || 'page', { bar, clear, set, scope });
    apply();
  }
  const clearAll = () => bars.forEach((b) => b.clear());
  // Buttons elsewhere on the page can apply a filter: data-set-filter="facet:value", data-filter-target="<section id>".
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set-filter]');
    if (!b) return;
    const target = bars.get(b.dataset.filterTarget) || bars.values().next().value;
    if (!target) return;
    const [facet, ...rest] = b.dataset.setFilter.split(':');
    target.set(facet, rest.join(':'), b.dataset.filterLabel);
  });
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName || '';
    const first = bars.values().next().value;
    if (!first) return;
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag)) {
      e.preventDefault();
      $('input[type=search]', first.bar).focus();
    } else if (e.key === 'Escape' && document.activeElement?.matches('.filters input[type=search]')) {
      bars.forEach((b) => { if (b.bar.contains(document.activeElement)) b.clear(); });
    }
  });

  // Expand and collapse --------------------------------------------------------------------------------------------
  for (const btn of $$('[data-expand]')) {
    btn.addEventListener('click', () => {
      const scope = document.getElementById(btn.dataset.expand);
      const open = btn.getAttribute('aria-pressed') !== 'true';
      for (const d of $$('details.row', scope)) if (!d.closest('[hidden]')) d.open = open;
      btn.setAttribute('aria-pressed', String(open));
      btn.textContent = open ? 'Collapse all' : 'Expand all';
    });
  }

  // Deep links: open what encloses the target, clear filters hiding it, land below the pinned bar, flash it ----------
  const find = (id) => document.getElementById(id) || document.getElementById(id.toLowerCase());
  const reveal = (id, smooth) => {
    const el = id && find(id);
    if (!el) return;
    if (el.closest('[hidden]')) clearAll();
    for (let d = el.closest('details'); d; d = d.parentElement?.closest('details')) d.open = true;
    if (el.tagName === 'DETAILS') el.open = true;
    const bar = el.closest('section')?.querySelector('.filters');
    const sticky = bar && getComputedStyle(bar).position === 'sticky';
    const offset = sticky ? bar.offsetHeight + 12 : 16;
    const top = el.getBoundingClientRect().top + scrollY - offset;
    scrollTo({ top, behavior: smooth && !reduced ? 'smooth' : 'auto' });
    const target = el.matches('details') ? el.querySelector('summary') || el : el.matches('section') ? el.querySelector('.sec-head') || el : el;
    target.classList.remove('flash');
    void target.offsetWidth;
    target.classList.add('flash');
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (!id || !find(id)) return;
    e.preventDefault();
    try {
      history.replaceState(null, '', '#' + id);
    } catch {
      /* the frame may refuse history changes */
    }
    reveal(id, true);
  });
  window.addEventListener('hashchange', () => reveal(decodeURIComponent(location.hash.slice(1)), true));
  if (location.hash.length > 1) {
    const go = () => reveal(decodeURIComponent(location.hash.slice(1)), false);
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go);
  }

  // Contents highlighting --------------------------------------------------------------------------------------------
  const links = $$('.toc a[href^="#"]');
  const targets = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) seen.set(en.target.id, en.isIntersecting);
        const current = targets.find((t) => seen.get(t.id));
        if (!current) return;
        for (const a of links) a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + current.id));
      },
      { rootMargin: '0px 0px -70% 0px' },
    );
    targets.forEach((t) => io.observe(t));
  }

  // Hover cards for IDs ----------------------------------------------------------------------------------------------
  const pop = document.createElement('div');
  pop.className = 'pop';
  pop.hidden = true;
  pop.setAttribute('role', 'tooltip');
  pop.id = 'tab-pop';
  document.body.append(pop);
  let timer = 0;
  const show = (a) => {
    const entry = index[a.dataset.id];
    if (!entry) return;
    const [title, status, kind, where] = entry;
    pop.replaceChildren();
    const head = document.createElement('div');
    head.className = 'pop-h';
    const id = document.createElement('span');
    id.className = 'id';
    id.textContent = a.dataset.id;
    head.append(id);
    const st = statuses[status];
    if (st) {
      const p = document.createElement('span');
      p.className = 'pill ' + st[1];
      p.textContent = st[0];
      head.append(p);
    }
    const k = document.createElement('span');
    k.className = 'pop-k';
    k.textContent = kind + (where && a.target === '_blank' ? ' · ' + where : '');
    head.append(k);
    const body = document.createElement('div');
    body.textContent = title;
    pop.append(head, body);
    pop.hidden = false;
    const r = a.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const left = Math.max(8, Math.min(r.left, innerWidth - w - 8));
    const top = r.bottom + h + 12 > innerHeight ? r.top - h - 8 : r.bottom + 8;
    pop.style.left = left + 'px';
    pop.style.top = Math.max(8, top) + 'px';
    a.setAttribute('aria-describedby', 'tab-pop');
  };
  const hide = (a) => {
    clearTimeout(timer);
    pop.hidden = true;
    a?.removeAttribute('aria-describedby');
  };
  const canHover = matchMedia('(hover: hover)');
  document.addEventListener('mouseover', (e) => {
    if (!canHover.matches) return;
    const a = e.target.closest('a[data-id]');
    if (!a) return;
    clearTimeout(timer);
    timer = setTimeout(() => show(a), 160);
  });
  document.addEventListener('mouseout', (e) => {
    const a = e.target.closest('a[data-id]');
    if (a && !a.contains(e.relatedTarget)) hide(a);
  });
  document.addEventListener('focusin', (e) => {
    const a = e.target.closest?.('a[data-id]');
    if (a && a.matches(':focus-visible')) show(a);
  });
  document.addEventListener('focusout', (e) => {
    const a = e.target.closest?.('a[data-id]');
    if (a) hide(a);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !pop.hidden) hide(document.querySelector('[aria-describedby="tab-pop"]'));
  });
  addEventListener('scroll', () => hide(), { passive: true });
})();
