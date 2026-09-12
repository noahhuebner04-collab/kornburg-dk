/* DK_ADMIN – Admin-Modus (?admin=1 + PIN), Overrides (Texte/Farben/Anordnung) */
(function () {
  'use strict';

  var KEY_OV = 'dk_overrides';
  var KEY_ADMIN = 'dk_admin';
  var DEFAULT_PIN = '1234';

  /* Storage mit Memory-Fallback (privater Modus wirft sonst still) */
  var MEM = {};
  function sGet(k) {
    try { var v = localStorage.getItem(k); return v == null && (k in MEM) ? MEM[k] : v; }
    catch (e) { return (k in MEM) ? MEM[k] : null; }
  }
  function sSet(k, v) {
    MEM[k] = String(v);
    try { localStorage.setItem(k, v); } catch (e) { /* nur Memory */ }
  }
  function sDel(k) {
    delete MEM[k];
    try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
  }
  function note(text) {
    var b = document.getElementById('adminBtn');
    if (!b) return;
    var old = b.textContent;
    b.textContent = text;
    setTimeout(function () { b.textContent = old; }, 2200);
  }

  function qs(s) { try { return new URLSearchParams(location.search).get(s); } catch (e) { return null; } }
  function loadOv() {
    try {
      var o = JSON.parse(sGet(KEY_OV) || 'null');
      if (o && o.v === 1) return o;
    } catch (e) { /* ignore */ }
    return { v: 1, texts: {}, hidden: [], order: {}, colors: {}, pin: DEFAULT_PIN };
  }
  function saveOv(o) { sSet(KEY_OV, JSON.stringify(o)); }
  function isAdmin() {
    try { return qs('admin') === '1' && sGet(KEY_ADMIN) === '1'; }
    catch (e) { return false; }
  }

  function ensurePin(cb) {
    if (qs('admin') !== '1') return;
    if (sGet(KEY_ADMIN) === '1') return cb(true);
    var ov = loadOv();
    var pin;
    try { pin = window.prompt('Admin-PIN eingeben (Default: ' + (ov.pin || DEFAULT_PIN) + '):', ''); }
    catch (e) { note('Prompt blockiert'); return cb(false); }
    if (pin == null || pin === '') { note('Abgebrochen'); return cb(false); }
    if (pin === (ov.pin || DEFAULT_PIN)) {
      sSet(KEY_ADMIN, '1');
      return cb(true);
    }
    try { window.alert('Falsche PIN.'); } catch (e) { /* ignore */ }
    note('Falsche PIN');
    return cb(false);
  }

  function collectWidgets(page, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll('[data-wid]'));
  }

  function snapshotTexts(page) {
    var ov = loadOv();
    collectWidgets(page).forEach(function (w) {
      var wid = w.getAttribute('data-wid');
      if (w.hasAttribute('data-hidden')) return;
      ov.texts[wid] = w.innerHTML;
    });
    saveOv(ov);
  }

  function bindWidgetControls(page) {
    collectWidgets(page).forEach(function (w) {
      var wid = w.getAttribute('data-wid');
      var bar = w.querySelector(':scope > .w-controls');
      if (!bar) return;
      if (bar.dataset.bound) return;
      bar.dataset.bound = '1';
      bar.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        var ov = loadOv();
        var act = btn.getAttribute('data-act');
        if (act === 'toggle') {
          var i = ov.hidden.indexOf(wid);
          if (i === -1) ov.hidden.push(wid); else ov.hidden.splice(i, 1);
          saveOv(ov); window.DK_APP.refresh();
        } else if (act === 'up' || act === 'down') {
          var ids = collectWidgets(page).map(function (x) { return x.getAttribute('data-wid'); });
          var idx = ids.indexOf(wid);
          var j = act === 'up' ? idx - 1 : idx + 1;
          if (idx < 0 || j < 0 || j >= ids.length) return;
          var t = ids[idx]; ids[idx] = ids[j]; ids[j] = t;
          ov.order[page] = ids;
          saveOv(ov); window.DK_APP.refresh();
        }
      });
      var col = bar.querySelector('input[type=color]');
      if (col) {
        var ov0 = loadOv();
        if (ov0.colors[wid]) col.value = ov0.colors[wid];
        col.addEventListener('change', function () {
          var ov = loadOv();
          ov.colors[wid] = col.value;
          saveOv(ov); window.DK_APP.refresh();
        });
      }
    });
  }

  /* Daten-Refresh über den lokalen Server (tools/dk_server.py).
     Ohne Server (z. B. python -m http.server) gibt es keine API – dann Hinweis. */
  function refreshServerStand() {
    var el = document.getElementById('srvStand');
    if (!el) return;
    fetch('api/status', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        var i = (j && j.info) || {};
        el.textContent = 'Server: Excel ' + (i.excel_mtime || '?') + ' → Daten ' + (i.data_mtime || '?');
      })
      .catch(function () {
        el.textContent = 'Server-API fehlt (für 1-Klick-Refresh: python tools/dk_server.py starten).';
      });
  }
  function refreshFromExcel(btn) {
    var st = document.getElementById('refreshStatus');
    var lg = document.getElementById('refreshLog');
    var ov = document.getElementById('refreshOverlay');
    var ovT = document.getElementById('refreshOverlayText');
    function say(t) { if (st) st.textContent = t; }
    function showLog(t) {
      if (!lg) return;
      lg.hidden = false;
      lg.textContent = t;
    }
    function overlay(on, title) {
      if (!ov) return;
      ov.hidden = !on;
      if (on && title && ovT) ovT.innerHTML = '<b>' + title + '</b>';
    }
    if (btn) btn.disabled = true;
    say('Baue Daten aus Excel neu …');
    showLog('');
    overlay(true, 'Daten werden aktualisiert …');
    fetch('api/refresh', { method: 'POST', cache: 'no-store' })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); })
      .catch(function () { return { status: 0, body: null }; })
      .then(function (res) {
        if (btn) btn.disabled = false;
        if (!res.body) {
          overlay(false);
          say('Kein Server mit Refresh-API – bitte `DartKnights starten.bat` nutzen ( schließt alte Server und startet den richtigen).');
          return;
        }
        var b = res.body;
        showLog(b.log || b.error || JSON.stringify(b));
        if (b.ok && b.checks_ok) {
          say('Fertig – ALLE CHECKS OK. Seite lädt neu …');
          overlay(true, 'Fertig – ALLE CHECKS OK. Seite lädt neu …');
          refreshServerStand();
          setTimeout(function () {
            try { location.reload(); } catch (e) { /* Testumgebung */ }
          }, 1200);
        } else if (b.ok) {
          overlay(false);
          say('Rebuild fertig, aber Validierung meldet Abweichungen (Log prüfen).');
        } else {
          overlay(false);
          say('Fehler: ' + (b.error || 'Rebuild fehlgeschlagen (Log prüfen).'));
        }
      });
  }

  function setEditing(on) {    document.body.classList.toggle('editing', on);
    document.querySelectorAll('[data-editable]').forEach(function (n) {
      n.contentEditable = on ? 'true' : 'false';
    });
    var b = document.getElementById('btnEdit');
    if (b) b.textContent = 'Bearbeiten: ' + (on ? 'an' : 'aus');
    if (!on) {
      // Texte einsammeln
      try { snapshotTexts(window.DK_APP.current); } catch (e) { /* ignore */ }
    }
  }


  /* ---------- Init ---------- */
  function init() {
    var adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
      adminBtn.addEventListener('click', function () {
        if (qs('admin') === '1' && sGet(KEY_ADMIN) === '1') {
          sDel(KEY_ADMIN);
          location.search = '';
        } else {
          location.search = '?admin=1';
        }
      });
    }
    if (qs('admin') !== '1') return;
    ensurePin(function (ok) {
      if (!ok) return;
      document.body.classList.add('admin');
      var bar = document.getElementById('adminBar');
      if (bar) bar.hidden = false;
      if (adminBtn) adminBtn.textContent = 'Admin ✓';
      bindWidgetControls(window.DK_APP ? window.DK_APP.current : 'startseite');
      var bE = document.getElementById('btnEdit');
      if (bE) bE.addEventListener('click', function () {
        setEditing(!document.body.classList.contains('editing'));
      });
      var bX = document.getElementById('btnExport');
      if (bX) bX.addEventListener('click', function () {
        try { snapshotTexts(window.DK_APP.current); } catch (e) { /* ignore */ }
        var blob = new Blob([sGet(KEY_OV) || '{}'], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'dk_overrides.json';
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      });
      var bI = document.getElementById('btnImport');
      var fI = document.getElementById('fileImport');
      if (bI && fI) {
        bI.addEventListener('click', function () { fI.click(); });
        fI.addEventListener('change', function () {
          var f = fI.files[0];
          if (!f) return;
          var rd = new FileReader();
          rd.onload = function () {
            try {
              var o = JSON.parse(rd.result);
              if (o && typeof o === 'object') { saveOv(o); window.DK_APP.refresh(); }
              else window.alert('Ungültige Datei.');
            } catch (e) { window.alert('Import fehlgeschlagen: ' + e.message); }
          };
          rd.readAsText(f);
        });
      }var bP = document.getElementById('btnPin');
      if (bP) bP.addEventListener('click', function () {
        var ov = loadOv();
        var np = window.prompt('Neue PIN:', ov.pin || DEFAULT_PIN);
        if (np) { ov.pin = np; saveOv(ov); window.alert('PIN gespeichert.'); }
      });
      var bD = document.getElementById('btnData');
      var dP = document.getElementById('dataPanel');
      if (bD && dP) bD.addEventListener('click', function () {
        dP.hidden = !dP.hidden;
        if (!dP.hidden) {
          try {
            var D = window.DK_DATA || {}, meta = D.meta || {}, base = D.base || {};
            var ms = base.matches || [], wks = ms.map(function (m) { return m.w; });
            var plo = wks.length ? Math.min.apply(null, wks) : '?';
            var phi = wks.length ? Math.max.apply(null, wks) : '?';
            var nsp = base.playermeta ? Object.keys(base.playermeta).length : '?';
            document.getElementById('dataStand').textContent =
              (meta.saison || '?') + ' · ' + (meta.stand || '') +
              ' · Wochen ' + plo + '–' + phi + ' · ' + nsp + ' Spieler · ' + ms.length + ' Matches';
          } catch (e) { /* Stand optional */ }
          refreshServerStand();
        }
      });
      var bR2 = document.getElementById('btnRefresh');
      if (bR2) bR2.addEventListener('click', function () { refreshFromExcel(bR2); });
      var bR = document.getElementById('btnReset');
      if (bR) bR.addEventListener('click', function () {
        if (window.confirm('Alle Overrides löschen?')) {
          var ov = loadOv();
          sDel(KEY_OV);
          saveOv({ v: 1, texts: {}, hidden: [], order: {}, colors: {}, pin: ov.pin || DEFAULT_PIN });
          window.DK_APP.refresh();
        }
      });
    });
  }

  window.DK_ADMIN = {
    afterRender: function (page, root) {
      if (!isAdmin()) return;
      bindWidgetControls(page, root);
      if (document.body.classList.contains('editing')) {
        root.querySelectorAll('[data-editable]').forEach(function (n) { n.contentEditable = 'true'; });
      }
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
