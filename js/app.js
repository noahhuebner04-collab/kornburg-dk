/* DK_APP – Router, Datenladen, Komponenten, Seiten (statisch, keine Build-Tools) */
(function () {
  'use strict';

  var PAGES = ['startseite', 'setzliste', 'trophaeen', 'h2h', 'vergleich', 'spieler1', 'gruppen', 'bingo'];
  var PAGE_TITLES = {
    startseite: 'Startseite', setzliste: 'Setzliste', trophaeen: 'Trophäen', h2h: 'Head-to-Head',
    vergleich: 'Vergleich', spieler1: 'Spieler',
    spieler3: 'Spieler III', gruppen: 'Gruppen', bingo: 'Bingo'
  };
  var FILES = ['meta', 'base'].concat(PAGES.filter(function (p) { return p !== 'spieler3'; }));

  /* ---------- Mini-Mockdaten (2 Spieler, 3 Wochen) für sichtbare Shell ohne Build ---------- */
  var MOCK_DATA = {
    meta: { saison: 'Competition 2026', stand: 'Mock-Daten (2 Spieler, 3 Wochen)' },
    startseite: {
      kpis: [
        { titel: 'Spieler gesamt', wert: 2, sub: 'Mock' },
        { titel: 'Legs gespielt', wert: 48, sub: 'Wochen 1–3' },
        { titel: 'Best Average', wert: 62.4, sub: 'Max Power' }
      ],
      anmeldung: { titel: 'Anmeldung nächste Woche', text: 'Anmeldung bis 18:15 Uhr · Jeden Mittwoch 18:30 Uhr', cta: 'ANMELDUNG NÄCHSTE WOCHE', link: '#' }
    },
    setzliste: {
      filter: ['Gesamt', 'Anmeldung'],
      setzliste: [
        { rang: 1, spieler: 'Max Power', punkte: 18, status: 'Anmeldung' },
        { rang: 2, spieler: 'Lisa Löwenherz', punkte: 12, status: 'Anmeldung' }
      ],
      rangliste: [
        { rang: 1, spieler: 'Max Power', avg: 62.4, legs: 30 },
        { rang: 2, spieler: 'Lisa Löwenherz', avg: 54.1, legs: 18 }
      ]
    },
    trophaeen: {
      kategorien: ['Highest Finish', 'Best Leg', 'Most 180s', 'Best Average', 'Most Wins'],
      podium: {
        'Highest Finish': { gold: { name: 'Max Power', wert: 120 }, silber: { name: 'Lisa Löwenherz', wert: 100 }, bronze: { name: '–', wert: 0 } },
        'Best Leg': { gold: { name: 'Lisa Löwenherz', wert: 18 }, silber: { name: 'Max Power', wert: 21 }, bronze: { name: '–', wert: 0 } },
        'Most 180s': { gold: { name: 'Max Power', wert: 3 }, silber: { name: 'Lisa Löwenherz', wert: 1 }, bronze: { name: '–', wert: 0 } },
        'Best Average': { gold: { name: 'Max Power', wert: 62.4 }, silber: { name: 'Lisa Löwenherz', wert: 54.1 }, bronze: { name: '–', wert: 0 } },
        'Most Wins': { gold: { name: 'Max Power', wert: 6 }, silber: { name: 'Lisa Löwenherz', wert: 3 }, bronze: { name: '–', wert: 0 } }
      },
      verlauf: { cats: ['W1', 'W2', 'W3'], series: [
        { name: 'Max Power', color: '#e30613', values: [58.2, 61.0, 62.4] },
        { name: 'Lisa Löwenherz', color: '#D4AF37', values: [52.0, 55.3, 54.1] }
      ]}
    },
    h2h: {
      spieler: ['Max Power', 'Lisa Löwenherz'],
      zeilen: [
        { label: 'Average', a: 62.4, b: 54.1 },
        { label: 'Best Leg (Darts)', a: 21, b: 18 },
        { label: 'High Finish', a: 120, b: 100 },
        { label: 'Win-Quote', a: 0.667, b: 0.333, pct: true }
      ],
      trend: { 'Max Power': ['W', 'W', 'L'], 'Lisa Löwenherz': ['L', 'W', 'L'] },
      winProb: { a: 0.68, b: 0.32 }
    },
    vergleich: {
      headers: ['Spieler', 'Spiele', 'Siege', 'Ø', 'Best Leg', 'HF'],
      rows: [
        ['Max Power', 9, 6, 62.4, 21, 120],
        ['Lisa Löwenherz', 9, 3, 54.1, 18, 100]
      ]
    },
    spieler1: {
      spieler: ['Max Power', 'Lisa Löwenherz'],
      cards: { 'Max Power': [
        { titel: 'Average', wert: 62.4, sub: '3 Wochen' },
        { titel: 'Best Average', wert: 68.1, sub: 'Woche 3' },
        { titel: 'Highlights', wert: 7, sub: '180s + HF' }
      ], 'Lisa Löwenherz': [
        { titel: 'Average', wert: 54.1, sub: '3 Wochen' },
        { titel: 'Best Average', wert: 57.0, sub: 'Woche 2' },
        { titel: 'Highlights', wert: 4, sub: '180s + HF' }
      ]},
      verlauf: { cats: ['W1', 'W2', 'W3'], values: { 'Max Power': [58.2, 61.0, 62.4], 'Lisa Löwenherz': [52.0, 55.3, 54.1] } },
      highlights: [
        { woche: 'W1', spieler: 'Max Power', typ: '180', wert: 1 },
        { woche: 'W2', spieler: 'Max Power', typ: 'HF 120', wert: 120 },
        { woche: 'W3', spieler: 'Lisa Löwenherz', typ: 'HF 100', wert: 100 }
      ],
      legs: { cats: ['Gewonnen', 'Verloren'], values: { 'Max Power': [20, 10], 'Lisa Löwenherz': [12, 18] } },
      ampel: { 'Max Power': ['g', 'g', 'y'], 'Lisa Löwenherz': ['y', 'r', 'y'] }
    },
    spieler2: {
      spieler: ['Max Power', 'Lisa Löwenherz'],
      cards: [
        { titel: 'Doppel-Quote', wert: 0.342, sub: '34,2 %', pct: true },
        { titel: '180s', wert: 4, sub: 'gesamt' },
        { titel: 'Spiele', wert: 9, sub: 'Mock' }
      ],
      scatter: [{ x: 58.2, y: 34, label: 'W1' }, { x: 61.0, y: 38, label: 'W2' }, { x: 62.4, y: 41, label: 'W3' }],
      donut: { labels: ['Gewonnen', 'Verloren'], values: [20, 10], colors: ['#e30613', '#3a3d46'] },
      balken: { cats: ['W1', 'W2', 'W3'], values: [6, 7, 7] },
      rewind: [
        { woche: 'W3', text: 'Best Average 62,4 von Max Power' },
        { woche: 'W2', text: 'High Finish 120 von Max Power' },
        { woche: 'W1', text: 'Saisonstart mit 2 Spielern' }
      ]
    },
    spieler3: {
      sections: [
        { title: 'Formkurve', type: 'line', cats: ['W1', 'W2', 'W3'], series: [{ name: 'Ø', values: [55.1, 58.2, 58.9] }] },
        { title: 'Kennzahlen', type: 'cards', cards: [
          { titel: 'Ø Saison', wert: 58.9, sub: 'Mock' },
          { titel: 'Teilnahmen', wert: 3, sub: 'Wochen' }
        ]},
        { title: 'Notizen', type: 'table', headers: ['Woche', 'Notiz'], rows: [['W1', 'Start'], ['W2', 'Steigerung'], ['W3', 'Konstant']] }
      ]
    },
    gruppen: {
      gruppen: ['Gruppe A', 'Gruppe B'],
      spieltage: ['Spieltag 1', 'Spieltag 2', 'Spieltag 3'],
      sieger: [{ rang: 1, spieler: 'Max Power', siege: 6 }, { rang: 2, spieler: 'Lisa Löwenherz', siege: 3 }],
      teilnahmen: [{ spieler: 'Max Power', teilnahmen: 3 }, { spieler: 'Lisa Löwenherz', teilnahmen: 3 }],
      spieltag: [{ rang: 1, spieler: 'Max Power', punkte: 8 }, { rang: 2, spieler: 'Lisa Löwenherz', punkte: 4 }],
      cards: [
        { titel: 'Gruppen', wert: 2, sub: 'A–B' },
        { titel: 'Spieltage', wert: 3, sub: 'Mock' },
        { titel: 'Spiele', wert: 18, sub: 'gesamt' }
      ],
      verlauf: { cats: ['W1', 'W2', 'W3'], series: [{ name: 'Punkte Ø', color: '#e30613', values: [4, 5, 6] }] }
    },
    bingo: {
      zaehler: { titel: 'Bingos gesamt', wert: 5, sub: 'Mock' },
      headers: ['Spieler', 'Bingos', 'Letzte Woche'],
      rows: [['Max Power', 3, 'W3'], ['Lisa Löwenherz', 2, 'W2']]
    }
  };

  /* ---------- Utils ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDE(v, dec) {
    if (v == null || v === '' || isNaN(Number(v))) return esc(v == null ? '–' : v);
    var n = Number(v);
    return n.toLocaleString('de-DE', { maximumFractionDigits: dec != null ? dec : 2 });
  }
  function get(obj, path, fb) {
    try {
      var cur = obj;
      var parts = Array.isArray(path) ? path : String(path).split('.');
      for (var i = 0; i < parts.length; i++) {
        if (cur == null) return fb;
        cur = cur[parts[i]];
      }
      return cur == null ? fb : cur;
    } catch (e) { return fb; }
  }
  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }
  function notice(text) {
    return el('div', 'notice', esc(text));
  }
  function loadOverrides() {
    try {
      var raw = localStorage.getItem('dk_overrides');
      if (!raw) return { v: 1, texts: {}, hidden: [], order: {}, colors: {}, pin: '1234' };
      var o = JSON.parse(raw);
      o.texts = o.texts || {}; o.hidden = o.hidden || []; o.order = o.order || {}; o.colors = o.colors || {};
      return o;
    } catch (e) { return { v: 1, texts: {}, hidden: [], order: {}, colors: {}, pin: '1234' }; }
  }
  function isAdmin() {
    try { return new URLSearchParams(location.search).get('admin') === '1' && localStorage.getItem('dk_admin') === '1'; }
    catch (e) { return false; }
  }

  /* ---------- Komponenten-Helper (geben Elemente zurück, inkl. data-wid) ---------- */
  function widget(wid, node, opts) {
    var w = el('div', 'widget panel');
    w.setAttribute('data-wid', wid);
    if (opts && opts.accent) { w.classList.add('accent'); }
    w.appendChild(node);
    if (isAdmin()) {
      var c = el('div', 'w-controls');
      c.innerHTML = '<button data-act="up" title="hoch">↑</button>' +
        '<button data-act="down" title="runter">↓</button>' +
        '<button data-act="toggle" title="ein/aus">◐</button>' +
        '<input type="color" data-act="color" title="Akzentfarbe" value="#e30613">';
      w.appendChild(c);
    }
    return w;
  }
  function section(wid, title) {
    var h = el('div', '', '<p class="label" data-editable>' + esc(title) + '</p>');
    return widget(wid, h);
  }
  function statCard(wid, titel, wert, sub, delta) {
    var val = (typeof wert === 'number') ? fmtDE(wert) : esc(wert);
    var dh = '';
    if (typeof delta === 'number' && isFinite(delta)) {
      // Farbe nach Vorzeichen: plus = grün, minus = rot, null = weiß
      var cls = delta > 0 ? 'pos' : (delta < 0 ? 'neg' : 'zero');
      dh = '<div class="stat-delta ' + cls + '">' + esc((delta > 0 ? '+' : '') + fmtDE(delta)) + '</div>';
    }
    var n = el('article', 'card stat',
      '<div class="stat-title" data-editable>' + esc(titel) + '</div>' +
      '<div class="stat-value" data-editable>' + val + '</div>' + dh +
      '<div class="stat-sub" data-editable>' + esc(sub || '') + '</div>');
    return widget(wid, n);
  }
  function podium(wid, obj) {
    obj = obj || {};
    function col(place, key, cls) {
      var p = obj[key] || { name: '–', wert: '–' };
      var v = (typeof p.wert === 'number') ? fmtDE(p.wert) : esc(p.wert);
      return '<div class="podium-col"><div class="podium-value" data-editable>' + v + '</div>' +
        '<div class="podium-bar ' + cls + '"></div>' +
        '<div class="podium-name" data-editable>' + esc(p.name) + '</div>' +
        '<div class="podium-place">' + place + '</div></div>';
    }
    // Reihenfolge Silber / Gold / Bronze wie klassisches Podest
    var n = el('div', '', '<div class="podium">' + col('2 · Silber', 'silber', 'silver') + col('1 · Gold', 'gold', 'gold') + col('3 · Bronze', 'bronze', 'bronze') + '</div>');
    return widget(wid, n);
  }
  function dataTable(wid, headers, rows, opts) {
    headers = headers || []; rows = rows || []; opts = opts || { sortable: true };
    var wrap = el('div', 'table-wrap' + (opts.scroll ? ' scroll' : ''));
    var t = document.createElement('table');
    t.className = 'data';
    var thead = document.createElement('thead');
    var trh = document.createElement('tr');
    headers.forEach(function (hh, i) {
      var th = document.createElement('th');
      th.textContent = hh;
      if (opts.sortable !== false) {
        th.title = 'Klicken zum Sortieren';
        th.addEventListener('click', function () { sortTable(t, i); });
      }
      trh.appendChild(th);
    });
    thead.appendChild(trh); t.appendChild(thead);
    var tb = document.createElement('tbody');
    if (!rows.length) {
      var tr0 = document.createElement('tr');
      var td0 = document.createElement('td'); td0.colSpan = Math.max(1, headers.length);
      td0.textContent = 'Keine Zeilen vorhanden.'; tr0.appendChild(td0); tb.appendChild(tr0);
    }
    rows.forEach(function (r, ri) {
      var tr = document.createElement('tr');
      if (opts.top3 && ri < 3) tr.className = 'rank-' + (ri + 1);
      (r || []).forEach(function (cell, ci) {
        var td = document.createElement('td');
        var v = cell;
        if (typeof v === 'number') { td.textContent = v.toLocaleString('de-DE'); td.className = 'num'; }
        else td.textContent = (v == null ? '–' : v);
        if (ci > 0 && !isNaN(Number(String(cell).replace(',', '.')))) td.classList.add('num');
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb); wrap.appendChild(t);
    return widget(wid, wrap);
  }
  function sortTable(table, colIdx) {
    var tb = table.tBodies[0];
    var rows = Array.prototype.slice.call(tb.rows);
    var asc = table.getAttribute('data-sort-col') !== String(colIdx) || table.getAttribute('data-sort-dir') === 'desc';
    rows.sort(function (a, b) {
      var x = (a.cells[colIdx] || {}).textContent || '';
      var y = (b.cells[colIdx] || {}).textContent || '';
      var nx = parseFloat(String(x).replace(/\./g, '').replace(',', '.'));
      var ny = parseFloat(String(y).replace(/\./g, '').replace(',', '.'));
      if (!isNaN(nx) && !isNaN(ny)) return asc ? nx - ny : ny - nx;
      return asc ? x.localeCompare(y, 'de') : y.localeCompare(x, 'de');
    });
    rows.forEach(function (r) { tb.appendChild(r); });
    table.setAttribute('data-sort-col', String(colIdx));
    table.setAttribute('data-sort-dir', asc ? 'asc' : 'desc');
  }
  function slicerDropdown(wid, label, values, selected, onchange) {
    values = values || [];
    var box = el('div', 'slicer');
    var id = 'dl-' + wid.replace(/[^a-z0-9]+/gi, '-');
    box.innerHTML = '<label for="' + id + '" data-editable>' + esc(label) + '</label>';
    // Suchfeld nur bei langen Listen (kurze Listen: direktes Dropdown)
    var search = null;
    if (values.length > 12) {
      search = document.createElement('input');
      search.type = 'text'; search.className = 'dsearch';
      search.placeholder = 'Suchen …';
      search.setAttribute('aria-label', 'Suchen');
      box.appendChild(search);
    }
    var sel = document.createElement('select');
    sel.id = id; sel.className = 'dselect';
    function fill(filter) {
      var q = String(filter || '').toLowerCase();
      var cur = sel.value;
      sel.innerHTML = '';
      values.forEach(function (v) {
        if (q && String(v).toLowerCase().indexOf(q) === -1) return;
        var o = document.createElement('option');
        o.value = v; o.textContent = v;
        sel.appendChild(o);
      });
      if (cur && Array.prototype.some.call(sel.options, function (o) { return o.value === cur; })) {
        sel.value = cur;
      }
    }
    fill('');
    var init = selected != null ? selected : (values[0] || '');
    if (init && Array.prototype.some.call(sel.options, function (o) { return o.value === init; })) {
      sel.value = init;
    }
    if (search) {
      search.addEventListener('input', function () { fill(search.value); });
      search.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && sel.options.length) {
          sel.selectedIndex = 0;
          if (onchange) onchange(sel.value);
        }
      });
    }
    sel.addEventListener('change', function () { if (onchange) onchange(sel.value); });
    box.appendChild(sel);
    return widget(wid, box);
  }
  function slicerRange(wid, label, min, max, lo, hi, onchange) {
    min = Number(min != null ? min : 1); max = Number(max != null ? max : 3);
    if (!(max > min)) max = min + 1;
    lo = Math.min(Math.max(Number(lo != null ? lo : min), min), max);
    hi = Math.min(Math.max(Number(hi != null ? hi : max), min), max);
    if (lo > hi) { var t = lo; lo = hi; hi = t; }
    var box = el('div', 'slicer');
    var lab = el('label', '');
    lab.setAttribute('data-editable', '');
    box.appendChild(lab);
    function labText() {
      lab.textContent = label + ' (' + lo + '–' + hi + ' von ' + min + '–' + max + ')';
    }
    labText();
    // Exakte Eingabe (spinnt sicher)
    var row = el('div', 'range-nums');
    var n1 = document.createElement('input');
    n1.type = 'number'; n1.min = min; n1.max = max; n1.value = lo;
    n1.setAttribute('aria-label', 'Von');
    var n2 = document.createElement('input');
    n2.type = 'number'; n2.min = min; n2.max = max; n2.value = hi;
    n2.setAttribute('aria-label', 'Bis');
    row.appendChild(n1); row.appendChild(n2); box.appendChild(row);
    // Dual-Slider mit Pointer-Events (beide Griffe greifbar)
    var track = el('div', 'dual');
    var fill = el('div', 'dual-fill');
    var h1 = el('div', 'dual-handle'); h1.setAttribute('role', 'slider');
    var h2 = el('div', 'dual-handle'); h2.setAttribute('role', 'slider');
    track.appendChild(fill); track.appendChild(h1); track.appendChild(h2);
    box.appendChild(track);
    var out = el('div', 'range-vals', '');
    box.appendChild(out);
    function pos(v) { return ((v - min) / (max - min)) * 100; }
    function paint() {
      h1.style.left = pos(lo) + '%';
      h2.style.left = pos(hi) + '%';
      fill.style.left = pos(lo) + '%';
      fill.style.width = Math.max(0, pos(hi) - pos(lo)) + '%';
      out.innerHTML = 'Von <b>' + lo + '</b> bis <b>' + hi + '</b>';
      labText();
    }
    var fired = null;
    function fire(now) {
      n1.value = lo; n2.value = hi;
      paint();
      if (now && onchange) onchange(lo, hi);
    }
    function fromEvent(e, which) {
      var r = track.getBoundingClientRect();
      var p = r.width > 0 ? (e.clientX - r.left) / r.width : 0;
      var v = Math.round(min + p * (max - min));
      v = Math.min(Math.max(v, min), max);
      if (which === 'lo') lo = Math.min(v, hi); else hi = Math.max(v, lo);
      n1.value = lo; n2.value = hi;
      paint();
    }
    [['lo', h1], ['hi', h2]].forEach(function (pair) {
      var which = pair[0], h = pair[1];
      h.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        try { h.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        var move = function (ev) { fromEvent(ev, which); };
        var up = function () {
          h.removeEventListener('pointermove', move);
          h.removeEventListener('pointerup', up);
          h.removeEventListener('pointercancel', up);
          fire(true);
        };
        h.addEventListener('pointermove', move);
        h.addEventListener('pointerup', up);
        h.addEventListener('pointercancel', up);
      });
    });
    n1.addEventListener('change', function () {
      lo = Math.min(Math.max(Number(n1.value) || min, min), max);
      if (lo > hi) lo = hi;
      fire(true);
    });
    n2.addEventListener('change', function () {
      hi = Math.min(Math.max(Number(n2.value) || max, min), max);
      if (hi < lo) hi = lo;
      fire(true);
    });
    paint();
    return widget(wid, box);
  }
  function heroBlock(wid, meta) {
    var n = el('div', 'hero',
      '<h1 data-editable>DART <span>KNIGHTS</span></h1>' +
      '<div class="sub" data-editable>AUSWERTUNG COMPETITION</div>' +
      '<div class="infos"><span>Anmeldung bis <strong>18:15 Uhr</strong></span><span>·</span><span>Jeden Mittwoch <strong>18:30 Uhr</strong></span></div>' +
      '<button class="btn" type="button" data-cta>ANMELDUNG NÄCHSTE WOCHE</button>' +
      (meta && meta.stand ? '<div class="infos"><span>' + esc(meta.stand) + '</span></div>' : ''));
    var w = widget(wid, n);
    var btn = w.querySelector('[data-cta]');
    btn.addEventListener('click', function () { location.hash = '#/startseite'; window.scrollTo(0, 0); });
    return w;
  }

  /* ---------- Overrides anwenden (Farben, Hidden, Order, Texte) ---------- */
  function applyOverrides(page, root) {
    var ov = loadOverrides();
    var widgets = Array.prototype.slice.call(root.querySelectorAll('[data-wid]'));
    // Texte
    widgets.forEach(function (w) {
      var wid = w.getAttribute('data-wid');
      if (ov.texts && ov.texts[wid]) {
        try {
          var tmp = document.createElement('div'); tmp.innerHTML = ov.texts[wid];
          var storedEd = tmp.querySelectorAll('[data-editable]');
          var curEd = w.querySelectorAll('[data-editable]');
          if (storedEd.length && storedEd.length === curEd.length) {
            curEd.forEach(function (c, i) { c.innerHTML = storedEd[i].innerHTML; });
          } else if (!curEd.length) { w.innerHTML = ov.texts[wid]; }
        } catch (e) { /* defensiv */ }
      }
      if (ov.colors && ov.colors[wid]) {
        w.classList.add('accent');
        w.style.setProperty('--wcolor', ov.colors[wid]);
        w.style.borderLeftColor = ov.colors[wid];
      }
      if ((ov.hidden || []).indexOf(wid) !== -1) {
        w.style.display = isAdmin() ? '' : 'none';
        if (isAdmin()) { w.style.opacity = '0.35'; w.setAttribute('data-hidden', '1'); }
      }
    });
    // Order
    var order = ov.order && ov.order[page];
    if (order && order.length) {
      var map = {};
      widgets.forEach(function (w) { map[w.getAttribute('data-wid')] = w; });
      order.forEach(function (wid) {
        if (map[wid]) root.appendChild(map[wid]);
      });
    }
  }

  /* ---------- Seiten-Renderer ---------- */
  function head(page, sub) {
    var h = el('div', 'page-head', '<h1 data-editable>' + esc(PAGE_TITLES[page] || page) + '</h1>' +
      (sub ? '<p data-editable>' + esc(sub) + '</p>' : ''));
    h.setAttribute('data-wid', page + '.head');
    return h;
  }
  function grid(nodes, cls) {
    var g = el('div', 'grid ' + (cls || ''));
    nodes.forEach(function (n) { g.appendChild(n); });
    return g;
  }
  function rowsToTable(wid, arr, order, opts) {
    if (!arr || !arr.length) return dataTable(wid, [], []);
    var headers = order || Object.keys(arr[0]);
    var rows = arr.map(function (o) { return headers.map(function (k) { return o[k]; }); });
    var labels = headers.map(function (k) { return k.charAt(0).toUpperCase() + k.slice(1); });
    var o2 = { sortable: true };
    if (opts && opts.top3) o2.top3 = true;
    if (opts && opts.scroll) o2.scroll = true;
    return dataTable(wid, labels, rows, o2);
  }
  function sliceWeeks(cats, series, lo, hi) {
    // lo/hi sind 1-basierte Wochen-Indizes
    var a = Math.max(0, (lo || 1) - 1), b = Math.min(cats.length, hi != null ? hi : cats.length);
    return {
      cats: cats.slice(a, b),
      series: (series || []).map(function (s) {
        return { name: s.name, color: s.color, values: (s.values || []).slice(a, b), pct: s.pct };
      })
    };
  }

  var R = {};
  R.startseite = function (root, D) {
    var d = D.startseite || {};
    root.appendChild(head('startseite', get(D, 'meta.stand', '')));
    root.appendChild(heroBlock('startseite.0', D.meta));
    var kpis = d.kpis || [];
    if (!kpis.length) root.appendChild(notice('Keine Kennzahlen in data/startseite.json.'));
    else root.appendChild(grid(kpis.slice(0, 3).map(function (k, i) {
      return statCard('startseite.' + (i + 1), k.titel || ('KPI ' + (i + 1)), k.wert != null ? k.wert : '–', k.sub || '');
    }), 'cards'));
    var a = d.anmeldung || {};
    var p = el('div', 'panel', '<p class="label" data-editable>' + esc(a.titel || 'Anmeldung') + '</p>' +
      '<h3 data-editable>' + esc(a.text || 'Anmeldung bis 18:15 Uhr · Jeden Mittwoch 18:30 Uhr') + '</h3>' +
      '<p><a class="btn" style="display:inline-block;text-decoration:none" href="' + esc(a.link || '#') + '" data-editable>' + esc(a.cta || 'ANMELDUNG NÄCHSTE WOCHE') + '</a></p>');
    root.appendChild(widget('startseite.4', p));
  };

  R.setzliste = function (root, D, state) {
    var d = D.setzliste || {};
    root.appendChild(head('setzliste', 'Setz- und Rangliste'));
    var opts = d.filter || ['Gesamt', 'Anmeldung'];
    state.sel = state.sel || opts[0];
    root.appendChild(slicerDropdown('setzliste.0', 'Anmeldung', opts, state.sel, function (v) {
      state.sel = v; refresh();
    }));
    var sl = d.setzliste || [], rl = d.rangliste || [];
    if (state.sel && state.sel !== 'Gesamt') {
      sl = sl.filter(function (r) { return r.status === state.sel; });
      rl = rl.filter(function (r) { return r.status === state.sel; });
    }
    root.appendChild(section('setzliste.1', 'Setzliste'));
    root.appendChild(rowsToTable('setzliste.2', sl, null, { top3: true }));
    root.appendChild(section('setzliste.3', 'Rangliste'));
    root.appendChild(rowsToTable('setzliste.4', rl, null, { top3: true }));
  };

  function ENG() { return (window.DK_LIVE && window.DK_ENGINE) || null; }
  function katId(label) {
    var ks = get(window.DK_DATA, 'meta.kategorien', []);
    for (var i = 0; i < ks.length; i++) if (ks[i].label === label) return ks[i].id;
    var map = { 'Best High Finish': 'finish', 'Best Leg': 'leg', 'Most 171s': 'f171', 'Most 180s': 'f180', 'Most Tons': 'tons' };
    return map[label] || 'finish';
  }
  function katLabel(id) {
    var ks = get(window.DK_DATA, 'meta.kategorien', []);
    for (var i = 0; i < ks.length; i++) if (ks[i].id === id) return ks[i].label;
    return id;
  }

  R.trophaeen = function (root, D, state) {
    var E = ENG();
    root.appendChild(head('trophaeen', 'Trophäen pro Kategorie'));
    var kats = (get(D, 'meta.kategorien', [])).map(function (k) { return k.label; });
    if (!kats.length) kats = ['Best High Finish'];
    state.kat = state.kat || 'Best High Finish';
    var weeks = E ? E.weeks() : [1, 2, 3];
    var wmax = weeks.length ? weeks[weeks.length - 1] : 3;
    state.lo = state.lo || 1; state.hi = state.hi || wmax;
    root.appendChild(grid([
      slicerDropdown('trophaeen.0', 'Kategorie', kats, state.kat, function (v) { state.kat = v; refresh(); }),
      slicerRange('trophaeen.1', 'Woche', 1, wmax, state.lo, state.hi, function (a, b) { state.lo = a; state.hi = b; draw(); })
    ], 'two'));
    var kid = katId(state.kat);
    // Podium: Stand bis Woche hi (Desktop: Before-Slicer kumuliert)
    var pod = E ? E.podium(kid, { hi: state.hi })
      : get(D, 'trophaeen.podium.' + state.kat, { gold: { name: '–', wert: '–' }, silber: { name: '–', wert: '–' }, bronze: { name: '–', wert: '–' } });
    root.appendChild(section('trophaeen.2', 'Podium · ' + state.kat));
    root.appendChild(podium('trophaeen.3', pod));
    root.appendChild(section('trophaeen.4', 'Wochenverlauf Top 5'));
    var cw = el('div', '', '<canvas class="chart"></canvas>');
    var wChart = widget('trophaeen.5', cw);
    root.appendChild(wChart);
    var RCOL = ['#e30613', '#D4AF37', '#2ECC71', '#4092FF', '#F472D0'];
    function draw() {
      var cv = cw.querySelector('canvas');
      var series;
      if (E) {
        var names = E.topNames(kid, { hi: state.hi }, 5);
        var rn = E.rennen(kid, names, { lo: state.lo, hi: state.hi });
        series = rn.series.map(function (s, i) {
          var vals = s.values.map(function (v, j) {
            var w = rn.weeks[j];
            return (w < state.lo || w > state.hi) ? null : v;
          });
          return { name: s.name, color: RCOL[i % RCOL.length], values: vals };
        });
        window.DK_CHARTS.lineChart(cv, {
          cats: rn.weeks.map(function (w) { return 'W' + w; }), series: series, step: true
        });
      } else {
        var verl = get(D, 'trophaeen.verlauf.' + state.kat, get(D, 'trophaeen.verlauf', { cats: [], series: [] }));
        var sliced = sliceWeeks(verl.cats || [], verl.series || [], state.lo, state.hi);
        if (!sliced.cats.length) { cv.replaceWith(notice('Kein Wochenverlauf.').firstChild || document.createElement('canvas')); return; }
        window.DK_CHARTS.lineChart(cv, sliced);
      }
    }
    // verzögert zeichnen (Layout abwarten), bei Range-Change neu
    setTimeout(draw, 30);
    root._redraw = draw;
  };

  R.h2h = function (root, D, state) {
    var E = ENG();
    root.appendChild(head('h2h', 'Direktvergleich zweier Spieler'));
    var players = E ? E.players() : (get(D, 'h2h.spieler', []) || []);
    if (players.length < 2) { root.appendChild(notice('H2H braucht 2 Spieler.')); players = ['Thorsten Kasper', 'Sebastian Reinke']; }
    state.a = state.a || players[players.indexOf('Thorsten Kasper') !== -1 ? players.indexOf('Thorsten Kasper') : 0];
    state.b = state.b || players[players.indexOf('Sebastian Reinke') !== -1 ? players.indexOf('Sebastian Reinke') : 1];
    if (state.a === state.b) state.b = players[(players.indexOf(state.a) + 1) % players.length];
    root.appendChild(grid([
      slicerDropdown('h2h.0', 'Spieler A', players, state.a, function (v) { state.a = v; refresh(); }),
      slicerDropdown('h2h.1', 'Spieler B', players, state.b, function (v) { state.b = v; refresh(); })
    ], 'two'));
    var hb = E ? E.h2h(state.a, state.b) : {
      zeilen: get(D, 'h2h.zeilen', []),
      trend: get(D, 'h2h.trend', {}),
      winProb: get(D, 'h2h.winProb', { a: 0.5, b: 0.5 }),
      bilanz: get(D, 'h2h.bilanz', {})
    };
    // Gesamt-Zwischenstand der direkten Duelle
    (function () {
      var bl = hb.bilanz || {};
      var ba = Number(bl.a || 0), bb = Number(bl.b || 0);
      var du = Number(bl.duelle || 0), la = Number(bl.legsA || 0), lb = Number(bl.legsB || 0);
      var ca = ba > bb ? ' win' : '', cb = bb > ba ? ' win' : '';
      var sc = el('div', 'scoreboard',
        '<div class="score-names"><span>' + esc(state.a) + '</span><span>' + esc(state.b) + '</span></div>' +
        '<div class="score-nums"><span class="' + ca + '">' + ba + '</span><span class="sep">:</span><span class="' + cb + '">' + bb + '</span></div>' +
        '<div class="score-sub" data-editable>Gesamt · ' + du + ' Duelle · Legs ' + la + ' : ' + lb + '</div>');
      root.appendChild(widget('h2h.5', sc));
    })();
    var zeilen = hb.zeilen || [];
    var box = el('div', 'h2h-rows');
    if (!zeilen.length) box.appendChild(notice('Keine Vergleichszeilen gefunden.'));
    zeilen.forEach(function (z) {
      var fa = z.pct ? (Number(z.a) * 100).toLocaleString('de-DE') + ' %' : fmtDE(z.a);
      var fb = z.pct ? (Number(z.b) * 100).toLocaleString('de-DE') + ' %' : fmtDE(z.b);
      box.appendChild(el('div', '', '<div class="h2h-row"><span class="l">' + fa + '</span><span class="m" data-editable>' + esc(z.label) + '</span><span class="r">' + fb + '</span></div>'));
    });
    root.appendChild(widget('h2h.2', box));
    // Trend
    var tr = el('div', '');
    tr.innerHTML = '<p class="label">Trend (W = Sieg, L = Niederlage)</p>';
    [state.a, state.b].forEach(function (p) {
      var arr = ((hb.trend || {})[p]) || [];
      var row = el('div', '', '<p style="margin:8px 0 4px"><b>' + esc(p) + '</b></p>');
      var t = el('div', 'trend');
      if (!arr.length) t.appendChild(notice('Kein Trend für ' + p + '.'));
      arr.forEach(function (x) {
        var k = String(x).toUpperCase() === 'W' ? 'w' : String(x).toUpperCase() === 'L' ? 'l' : '';
        t.appendChild(el('span', 'tick ' + k, esc(x)));
      });
      row.appendChild(t); tr.appendChild(row);
    });
    root.appendChild(widget('h2h.3', tr));
    // Win-Probability
    var wp = hb.winProb || { a: 0.5, b: 0.5 };
    var pa = Math.round(Number(wp.a) * 100), pb = Math.round(Number(wp.b) * 100);
    var wbox = el('div', '', '<p class="label" data-editable>Win-Probability</p>' +
      '<div class="prob"><span class="a" style="width:' + pa + '%"></span><span class="b" style="width:' + pb + '%"></span></div>' +
      '<p><b>' + esc(state.a) + ' ' + pa + ' %</b> · ' + esc(state.b) + ' ' + pb + ' %</p>');
    root.appendChild(widget('h2h.4', wbox));
  };

  R.vergleich = function (root, D, state) {
    var E = ENG();
    root.appendChild(head('vergleich', 'Alle Spieler im Überblick (klickbar sortierbar)'));
    var wmax = E ? E.maxWeek() : 34;
    state.lo = state.lo || 4; state.hi = state.hi || wmax;
    var dyn = el('div', '');
    root.appendChild(grid([
      slicerRange('vergleich.9', 'Woche', 1, wmax, state.lo, state.hi, function (a, b) { state.lo = a; state.hi = b; draw(); })
    ], 'two'));
    root.appendChild(dyn);
    function draw() {
      dyn.innerHTML = '';
      var tab = E ? E.vergleichView(state.lo, state.hi)
        : { headers: get(D, 'vergleich.headers', []), rows: get(D, 'vergleich.rows', []) };
      if (!tab.headers || !tab.rows) { dyn.appendChild(notice('Keine Vergleichsdaten.')); return; }
      dyn.appendChild(dataTable('vergleich.0', tab.headers, tab.rows, { sortable: true }));
      try { applyOverrides('vergleich', dyn); } catch (e) { /* ignore */ }
    }
    setTimeout(draw, 30); root._redraw = draw;
  };

  R.spieler1 = function (root, D, state) {
    var E = ENG();
    root.appendChild(head('spieler1', 'Spieler-Statistik: Averages, Streuung & Rewind'));
    var players = E ? E.players() : (get(D, 'spieler1.spieler', []) || Object.keys(get(D, 'spieler1.cards', {})));
    if (!players.length) { root.appendChild(notice('Keine Spielerdaten.')); return; }
    var avgOpts = (E && get(window.DK_DATA, 'meta.avgOptions')) || ['AVERAGE'];
    state.sp = state.sp || (players.indexOf('Nicnaks Winkler') !== -1 ? 'Nicnaks Winkler' : players[0]);
    state.avg = state.avg || 'AVERAGE';
    var wmax = E ? E.maxWeek() : 34;
    state.lo = state.lo || 4; state.hi = state.hi || wmax;
    root.appendChild(grid([
      slicerDropdown('spieler1.0', 'Spieler', players, state.sp, function (v) { state.sp = v; refresh(); }),
      slicerRange('spieler1.1', 'Woche', 1, wmax, state.lo, state.hi, function (a, b) { state.lo = a; state.hi = b; draw(); })
    ], 'two'));
    var dyn = el('div', ''); dyn.setAttribute('data-dyn', 's1dyn');
    root.appendChild(dyn);
    function cardGrid() {
      var list = [];
      if (E) {
        var v = E.spielerView(state.sp, state.lo, state.hi);
        // Diff (Trend letzter Wochen minus Gesamt) gehört zur jeweiligen Avg-Karte
        var dmap = { 'Average': 0, 'First 9': 1, 'Scoring': 2, 'Finish': 3, 'Checkout': 4 };
        v.cards.forEach(function (k) {
          var di = dmap[k.titel];
          var d = (di != null && v.diffs[di]) ? v.diffs[di].wert : null;
          list.push({ titel: k.titel, wert: k.wert == null ? '–' : k.wert, sub: k.sub || '', delta: d });
        });
      } else {
        ((get(D, 'spieler1.cards.' + state.sp, [])) || []).slice(0, 10).forEach(function (k) {
          list.push({ titel: k.titel, wert: k.wert, sub: k.sub, delta: null });
        });
      }
      return grid(list.map(function (k, i) {
        return statCard('spieler1.' + (30 + i), k.titel, k.wert, k.sub, k.delta);
      }), 'cards');
    }
    function draw() {
      dyn.innerHTML = '';
      dyn.appendChild(cardGrid());
      dyn.appendChild(section('spieler1.5', 'Average-Verlauf · ' + state.sp));
      // Kennzahl-Slicer direkt über dem Graphen (zeichnet nur diese Seite neu, kein Scrollsprung)
      dyn.appendChild(slicerDropdown('spieler1.13', 'Kennzahl', avgOpts, state.avg, function (v) { state.avg = v; draw(); }));
      var cw = el('div', '', '<canvas class="chart"></canvas>');
      dyn.appendChild(widget('spieler1.6', cw));
      var cv = cw.querySelector('canvas');
      if (E) {
        var s4 = E.series4w(state.sp, state.avg, state.lo, state.hi);
        window.DK_CHARTS.lineChart(cv, {
          cats: s4.weeks.map(function (w) { return 'W' + w; }),
          series: [{ name: state.avg, values: s4.values }]
        });
      } else {
        var vv = get(D, 'spieler1.verlauf.values.' + state.sp, []);
        var cats = get(D, 'spieler1.verlauf.cats', []).slice(state.lo - 1, state.hi);
        window.DK_CHARTS.lineChart(cv, { cats: cats, series: [{ name: state.sp, values: vv.slice(state.lo - 1, state.hi) }] });
      }
      dyn.appendChild(buildRest());
      dyn.appendChild(buildExtra());
      try { applyOverrides('spieler1', dyn); } catch (e) { /* ignore */ }
    }
    function buildRest() {
      var box = el('div', ''); box.setAttribute('data-dyn', 's1rest');
      var hl, legs, amp;
      if (E) {
        hl = E.highlights(state.sp, state.lo, state.hi).map(function (h) {
          return { Typ: h.typ, Wert: h.wert, Woche: h.w, Gegner: h.geg };
        });
        var t = E.sumRows(E.rows({ player: state.sp, lo: state.lo, hi: state.hi }));
        legs = { cats: ['Leg 1', 'Leg 2', 'Leg 3', 'Leg 4', 'Leg 5'],
                 values: [0, 1, 2, 3, 4].map(function (i) {
                   var v = t.legd[i] ? (t.legp[i] / t.legd[i]) * 3 : null;
                   return v == null ? null : Math.round(v * 100) / 100;
                 }) };
        var am = E.ampel(state.sp);
        amp = [{ 3: 'g', 2: 'y', 1: 'r' }[am] || ''];
      } else {
        hl = get(D, 'spieler1.highlights', []);
        legs = { cats: ['Leg 1'], values: [0] };
        amp = [''];
      }
      box.appendChild(section('spieler1.7', 'Highlights'));
      box.appendChild(rowsToTable('spieler1.8', hl.length ? hl : [{ Typ: '–', Wert: '–', Woche: '–', Gegner: '–' }]));
      box.appendChild(section('spieler1.9', 'Leg-Averages'));
      var lb = el('div', '', '<canvas class="chart"></canvas>');
      box.appendChild(widget('spieler1.10', lb));
      setTimeout(function () {
        window.DK_CHARTS.barH(lb.querySelector('canvas'), { cats: legs.cats, series: [{ name: state.sp, values: legs.values }] });
      }, 30);
      var ab = el('div', 'ampel');
      ['g', 'y', 'r'].forEach(function (k) {
        var lamp = el('span', 'lamp' + (amp[0] === k ? ' on-' + k : ''));
        lamp.title = ['Form', 'Konstanz', 'Doppel'][['g', 'y', 'r'].indexOf(k)];
        ab.appendChild(lamp);
      });
      ab.insertAdjacentHTML('afterbegin', '<p class="label">Ampel</p>');
      box.appendChild(widget('spieler1.11', ab));
      return box;
    }
    /* Ehemalige Seite „Spieler II": Streuung, Anteile & Rewind – gleiche Auswahl (state.sp/lo/hi) */
    function buildExtra() {
      var box = el('div', ''); box.setAttribute('data-dyn', 's1extra');
      var cards = [], pts = [], donut = { labels: [], values: [], colors: [] }, bars = { cats: [], values: [] }, rw = [];
      if (E) {
        var m = E.scoped(state.sp, state.lo, state.hi);
        cards = [
          { titel: 'Ausreißer', wert: E.pct(m.ausreisser), sub: '' },
          { titel: 'Gerade', wert: E.pct(m.gerade), sub: '' },
          { titel: 'Triple', wert: E.pct(m.triple), sub: '' },
          { titel: 'Anwurf gehalten', wert: E.pct(m.anwurf), sub: '' },
          { titel: 'Break', wert: E.pct(m.gegen_anwurf), sub: '' },
          { titel: 'Decider', wert: E.pct(m.decider), sub: '' }
        ];
        pts = E.weeklyPairs(state.sp, state.lo, state.hi);
        donut = E.checkoutDonut(state.sp, state.lo, state.hi);
        bars = { cats: ['0', '1', '2', '3'], values: m.visits.map(function (v) { return Math.round(v * 10000) / 10000; }) };
        rw = E.rewind(state.sp, state.lo, state.hi).map(function (r) {
          return { icon: r.icon, wert: r.wert, label: r.label };
        });
      } else {
        var d = MOCK_DATA.spieler2 || {};
        (d.cards || []).slice(0, 6).forEach(function (k) {
          cards.push({ titel: k.titel, wert: k.wert, sub: k.sub });
        });
        pts = d.scatter || [];
        donut = d.donut || { labels: [], values: [] };
        var b = d.balken || { cats: [], values: [] };
        bars = b;
        (d.rewind || []).forEach(function (r) { rw.push({ icon: '', wert: r.woche, label: r.text }); });
      }
      box.appendChild(grid(cards.map(function (k, i) {
        return statCard('spieler1.' + (14 + i), k.titel, k.wert, k.sub);
      }), 'cards'));
      box.appendChild(section('spieler1.20', 'Korrelation Gerade & Triple'));
      var sc = el('div', '', '<canvas class="chart"></canvas>');
      box.appendChild(widget('spieler1.21', sc));
      window.DK_CHARTS.scatter(sc.querySelector('canvas'), { points: pts, xfmt: { pct: true }, yfmt: { pct: true } });
      // Donut + Balken nebeneinander
      var dn = el('div', '', '<canvas class="chart"></canvas>');
      var colA = el('div', '');
      colA.appendChild(section('spieler1.22', 'Checkout-Bereiche'));
      colA.appendChild(widget('spieler1.23', dn));
      var bh = el('div', '', '<canvas class="chart"></canvas>');
      var colB = el('div', '');
      colB.appendChild(section('spieler1.24', 'Triple pro Aufnahme'));
      colB.appendChild(widget('spieler1.25', bh));
      box.appendChild(grid([colA, colB], 'two'));
      window.DK_CHARTS.donut(dn.querySelector('canvas'), donut);
      window.DK_CHARTS.barH(bh.querySelector('canvas'), { cats: bars.cats || [], series: [{ name: '%', values: bars.values || [], pct: true }] });
      box.appendChild(section('spieler1.26', 'Rewind'));
      var rbox = el('div', 'rewind');
      rw.forEach(function (r) {
        rbox.appendChild(el('div', 'rewind-row',
          '<b>' + esc(r.wert) + '</b><span>' + esc(r.label) + '</span>'));
      });
      if (!rw.length) rbox.appendChild(notice('Kein Rewind.'));
      box.appendChild(widget('spieler1.27', rbox));
      return box;
    }
    setTimeout(draw, 30); root._redraw = draw;
  };

  /* Alias: alte Route/Hashes auf die zusammengeführte Spieler-Seite */
  R.spieler2 = R.spieler1;

  R.spieler3 = function (root, D) {
    var d = D.spieler3 || {};
    root.appendChild(head('spieler3', 'Generisch aus JSON (sections-Array)'));
    var secs = d.sections || [];
    if (!secs.length) { root.appendChild(notice('Kein sections-Array in data/spieler3.json.')); return; }
    secs.forEach(function (s, i) {
      var base = 'spieler3.' + i;
      root.appendChild(section(base + 'a', s.title || ('Sektion ' + (i + 1))));
      if (s.type === 'cards') {
        root.appendChild(grid((s.cards || []).map(function (k, j) {
          return statCard(base + 'b' + j, k.titel, k.wert, k.sub);
        }), 'cards'));
      } else if (s.type === 'table') {
        root.appendChild(dataTable(base + 'b', s.headers || [], s.rows || []));
      } else if (s.type === 'line') {
        (function (sec, wid) {
          var cw = el('div', '', '<canvas class="chart"></canvas>');
          root.appendChild(widget(wid, cw));
          setTimeout(function () { window.DK_CHARTS.lineChart(cw.querySelector('canvas'), { cats: sec.cats || [], series: sec.series || [] }); }, 30);
        })(s, base + 'b');
      } else if (s.type === 'barH') {
        (function (sec, wid) {
          var cw = el('div', '', '<canvas class="chart"></canvas>');
          root.appendChild(widget(wid, cw));
          setTimeout(function () { window.DK_CHARTS.barH(cw.querySelector('canvas'), { cats: sec.cats || [], series: sec.series || [] }); }, 30);
        })(s, base + 'b');
      } else if (s.type === 'donut') {
        (function (sec, wid) {
          var cw = el('div', '', '<canvas class="chart"></canvas>');
          root.appendChild(widget(wid, cw));
          setTimeout(function () { window.DK_CHARTS.donut(cw.querySelector('canvas'), sec); }, 30);
        })(s, base + 'b');
      } else {
        root.appendChild(widget(base + 'b', notice('Unbekannter Sektionstyp: ' + (s.type || '?'))));
      }
    });
  };

  R.gruppen = function (root, D, state) {
    var E = ENG();
    root.appendChild(head('gruppen', 'Gruppen & Spieltage'));
    var gs = E ? E.groups() : (get(D, 'gruppen.gruppen', []) || ['Gruppe 1']);
    var sts = [];
    if (E) {
      var mx = E.maxWeek();
      for (var s = 1; s <= mx; s++) sts.push('Spieltag ' + s);
    } else (get(D, 'gruppen.spieltage', []) || []).forEach(function (x) { sts.push(x); });
    state.g = state.g || (gs.indexOf('Gruppe 1') !== -1 ? 'Gruppe 1' : gs[0]);
    state.st = state.st || 'Spieltag 34';
    var stNum = parseInt(String(state.st).replace(/\D+/g, ''), 10) || 34;
    var wmax = E ? E.maxWeek() : 34;
    state.lo = state.lo || 1; state.hi = state.hi || wmax;
    root.appendChild(grid([
      slicerDropdown('gruppen.0', 'Gruppe', gs, state.g, function (v) { state.g = v; refresh(); }),
      slicerDropdown('gruppen.1', 'Spieltag', sts, state.st, function (v) { state.st = v; refresh(); }),
      slicerRange('gruppen.2', 'Woche', 1, wmax, state.lo, state.hi, function (a, b) { state.lo = a; state.hi = b; draw(); })
    ], 'two'));
    var dyn = el('div', '');
    root.appendChild(dyn);
    // Avg-Karten mit farbiger Diff-Zeile (wie Spieler-Seite)
    function avgCards(v, base) {
      var dmap = { 'Average': 0, 'First 9': 1, 'Scoring': 2, 'Finish': 3, 'Checkout': 4 };
      return grid(v.cards.map(function (k, i) {
        var di = dmap[k.titel];
        var d = (di != null && v.diffs && v.diffs[di]) ? v.diffs[di].wert : null;
        return statCard('gruppen.' + (base + i), k.titel, k.wert == null ? '–' : k.wert, k.sub || '', d);
      }), 'cards');
    }
    function groupHlTable(hl, wid) {
      var list = (hl || []).map(function (h) {
        return { Typ: h.typ, Wert: h.wert, Woche: h.w, Spieler: h.sp, Gegner: h.geg };
      });
      return rowsToTable(wid, list.length ? list : [{ Typ: '–', Wert: '–', Woche: '–', Spieler: '–', Gegner: '–' }]);
    }
    function draw() {
      dyn.innerHTML = '';
      stNum = parseInt(String(state.st).replace(/\D+/g, ''), 10) || 34;
      var gv = E ? E.gruppenView(state.g, stNum, state.lo, state.hi) : null;
      var sieger = gv ? gv.sieger : get(D, 'gruppen.sieger', []);
      var teiln = gv ? gv.teilnahmen : get(D, 'gruppen.teilnahmen', []);
      var spt = gv ? gv.spieltag : get(D, 'gruppen.spieltag', []);
      var cards = gv ? gv.cards : get(D, 'gruppen.cards', []);
      // Bereich 1: Saison ganzjährig (Sieger/Teilnahmen sind immer Saisonwerte)
      dyn.appendChild(section('gruppen.14', 'Saison · ganzjährig · ' + state.g));
      var colS = el('div', '');
      colS.appendChild(section('gruppen.3', 'Sieger · ' + state.g));
      colS.appendChild(rowsToTable('gruppen.4', sieger, null, { scroll: true }));
      var colT = el('div', '');
      colT.appendChild(section('gruppen.5', 'Teilnahmen'));
      colT.appendChild(rowsToTable('gruppen.6', teiln, null, { scroll: true }));
      dyn.appendChild(grid([colS, colT], 'two'));
      // Averages + Highlights der Gruppe (Saison)
      if (E) {
        var gs = E.gruppenAverages(state.g, 1, wmax);
        dyn.appendChild(section('gruppen.20', 'Averages · Saison'));
        dyn.appendChild(avgCards(gs, 21));
        dyn.appendChild(section('gruppen.32', 'Highlights · Saison'));
        dyn.appendChild(groupHlTable(gs.highlights, 'gruppen.33'));
      } else {
        dyn.appendChild(section('gruppen.20', 'Averages · Saison'));
        dyn.appendChild(notice('Keine Gruppendaten (Engine offline).'));
      }
      dyn.appendChild(section('gruppen.7', 'Tabelle · ' + state.st));
      dyn.appendChild(rowsToTable('gruppen.8', spt));
      dyn.appendChild(grid(cards.slice(0, 3).map(function (k, i) {
        return statCard('gruppen.' + (9 + i), k.titel, k.wert, k.sub);
      }), 'cards'));
      dyn.appendChild(section('gruppen.12', 'Verlauf'));
      var cw = el('div', '', '<canvas class="chart"></canvas>');
      dyn.appendChild(widget('gruppen.13', cw));
      var cv = cw.querySelector('canvas');
      if (gv) window.DK_CHARTS.lineChart(cv, { cats: gv.verlauf.cats, series: gv.verlauf.series });
      else {
        var cats = get(D, 'gruppen.verlauf.cats', []);
        var sliced = sliceWeeks(cats, get(D, 'gruppen.verlauf.series', []), state.lo, state.hi);
        window.DK_CHARTS.lineChart(cv, sliced);
      }
      try { applyOverrides('gruppen', dyn); } catch (e) { /* ignore */ }
    }
    setTimeout(draw, 30); root._redraw = draw;
  };

  R.bingo = function (root, D, state) {
    var E = ENG();
    root.appendChild(head('bingo', 'Bingo-Auswertung'));
    var wmax = E ? E.maxWeek() : 34;
    state.lo = state.lo || 1; state.hi = state.hi || wmax;
    var players = E ? E.players() : [];
    state.sp = state.sp || 'Alle';
    var dyn = el('div', '');
    root.appendChild(grid([
      slicerDropdown('bingo.3', 'Spieler', ['Alle'].concat(players), state.sp, function (v) { state.sp = v; draw(); }),
      slicerRange('bingo.4', 'Woche', 1, wmax, state.lo, state.hi, function (a, b) { state.lo = a; state.hi = b; draw(); })
    ], 'two'));
    root.appendChild(dyn);
    function draw() {
      dyn.innerHTML = '';
      var cells = [], total = 0, rows = [];
      if (E) {
        var bg = E.bingoGrid(state.sp, state.lo, state.hi);
        cells = bg.cells; total = bg.distinct;
        var b = E.bingo(state.lo, state.hi);
        rows = b ? b.rows : [];
      } else {
        var bd = get(D, 'bingo', {});
        total = (bd.rows || []).length;
        rows = bd.rows || [];
      }
      if (state.sp && state.sp !== 'Alle') rows = rows.filter(function (r) { return r[0] === state.sp; });
      var lay = el('div', 'bingo-layout');
      // Brett links (wie Power BI)
      var board = el('div', 'bingo-board');
      cells.forEach(function (c) {
        var d = document.createElement('div');
        d.className = 'bingo-cell' + (c.hits > 0 ? ' hit' : ' miss');
        d.title = c.hits > 0 ? (c.n + ': ' + c.players.join(', ') + ' (' + c.hits + 'x)') : (c.n + ': noch offen');
        d.innerHTML = '<span class="bn">' + c.n + '</span>' +
          (c.hits > 0 ? '<span class="bp">' + esc(c.top || '') + '</span><span class="bc">' + c.hits + 'x</span>' : '');
        board.appendChild(d);
      });
      if (!cells.length) board.appendChild(notice('Kein Bingo-Raster (Engine offline).'));
      lay.appendChild(widget('bingo.5', board));
      // Zähler + Tabelle rechts
      var side = el('div', 'bingo-side');
      side.appendChild(statCard('bingo.0', 'Checkouts', total + ' /162 Checkouts', 'distincte Finishes'));
      side.appendChild(section('bingo.1', 'Tabelle'));
      side.appendChild(dataTable('bingo.2', ['Name', 'Checkouts'], rows));
      lay.appendChild(side);
      dyn.appendChild(lay);
      try { applyOverrides('bingo', dyn); } catch (e) { /* ignore */ }
    }
    setTimeout(draw, 30); root._redraw = draw;
  };

  /* ---------- App-State, Router, Laden ---------- */
  var view, loader, subnav;
  var current = 'startseite';
  var stateByPage = {};
  var DATA = {};

  function refresh() { showPage(current); }

  function showPage(page) {
    if (PAGES.indexOf(page) === -1) page = 'startseite';
    current = page;
    stateByPage[page] = stateByPage[page] || {};
    Array.prototype.forEach.call(subnav.querySelectorAll('button'), function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-page') === page);
    });
    if (('#/' + page) !== location.hash) history.replaceState(null, '', '#/' + page);
    view.innerHTML = '';
    var wrap = el('div', '');
    wrap.id = 'page-' + page;
    try {
      (R[page] || function (r) { r.appendChild(notice('Seite nicht implementiert: ' + page)); })(wrap, DATA, stateByPage[page]);
    } catch (e) {
      console.error(e);
      wrap.appendChild(notice('Fehler beim Rendern (' + page + '): ' + e.message));
    }
    view.appendChild(wrap);
    applyOverrides(page, wrap);
    if (window.DK_ADMIN && typeof window.DK_ADMIN.afterRender === 'function') {
      try { window.DK_ADMIN.afterRender(page, wrap); } catch (e) { console.error(e); }
    }
    window.scrollTo(0, 0);
  }

  function fetchOne(name) {
    return fetch('data/' + name + '.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return null; });
  }

  function init() {
    view = document.getElementById('view');
    loader = document.getElementById('loader');
    subnav = document.getElementById('subnav');
    subnav.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-page]');
      if (b) showPage(b.getAttribute('data-page'));
    });
    window.addEventListener('hashchange', function () {
      var p = (location.hash || '').replace('#/', '');
      if (p && p !== current) showPage(p);
    });
    loader.hidden = false;
    Promise.all(FILES.map(fetchOne)).then(function (list) {
      var missing = 0;
      FILES.forEach(function (name, i) {
        if (list[i]) DATA[name] = list[i];
        else { missing++; DATA[name] = MOCK_DATA[name] || null; }
      });
      window.DK_DATA = DATA;
      window.DK_MOCK = missing === FILES.length;
      try {
        if (window.DK_ENGINE && DATA.base) { window.DK_ENGINE.init(DATA.base); window.DK_LIVE = true; }
        else { window.DK_LIVE = false; }
      } catch (e) { window.DK_LIVE = false; console.error(e); }
      if (window.DK_MOCK) {
        console.info('[DK] data/*.json fehlt – rendern mit Mini-Mockdaten.');
      }
      // document title stand
      loader.hidden = true;
      var start = (location.hash || '').replace('#/', '');
      showPage(PAGES.indexOf(start) !== -1 ? start : 'startseite');
      window.addEventListener('resize', function () {
        var w = document.querySelector('#page-' + current);
        if (w && w._redraw) { try { w._redraw(); } catch (e) { /* ignore */ } }
      });
    });
  }

  window.DK_APP = {
    showPage: showPage, refresh: refresh,
    get current() { return current; },
    get data() { return DATA; },
    state: stateByPage
  };
  window.DK_COMP = {
    statCard: statCard, podium: podium, dataTable: dataTable,
    slicerDropdown: slicerDropdown, slicerRange: slicerRange, section: section, widget: widget
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
