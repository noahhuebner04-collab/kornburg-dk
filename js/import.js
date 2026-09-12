/* DK_IMPORT – Wochen-Update (darthelfer -> Excel) direkt im Admin-Modus.
   Gleiches Menü wie das alte Desktop-Programm (URLs, Woche/Datum, Ranking-Tabelle),
   aber: berechnete Spalten (68-113) werden als WERTE geschrieben – keine Formeln.
   Die Berechnung repliziert die Excel-Formeln exakt (siehe computedValues).
   Excel-Zugriff via SheetJS (vendor) + File System Access (direkt speichern)
   oder Download als Fallback. */
(function () {
  'use strict';

  var BASE_COLUMNS = ['Woche', 'Spiel ID', 'Spieler Name', 'Gegner Name', 'Legs gewonnen', 'Legs verloren', 'Gruppe'];
  (function () {
    for (var i = 1; i <= 5; i++) {
      BASE_COLUMNS.push('geworfene Punkte Leg ' + i, 'geworfene Darts Leg ' + i,
        'First9 Leg ' + i, 'Finish Leg ' + i, 'Scoring Leg ' + i, 'Darts im Scoring Leg ' + i,
        'Finish Scoring Leg ' + i, 'Darts im Finish Scoring Leg ' + i);
    }
  })();
  BASE_COLUMNS.push('Aufnahme0bis9', 'Aufnahme10bis19', 'Aufnahme20bis29', 'Aufnahme30bis39',
    'Aufnahme40bis49', 'Aufnahme50bis59', 'Aufnahme60bis69', 'Aufnahme70bis79', 'Aufnahme80bis89',
    'Aufnahme90bis99', 'Aufnahme100bis109', 'Aufnahme110bis119', 'Aufnahme120bis129',
    'Aufnahme130bis139', 'Aufnahme140bis149', 'Aufnahme150bis159', 'Aufnahme160bis169',
    'Aufnahme170bis180', '171', '180');

  var COMPUTED_COLUMNS = [];
  (function () {
    for (var i = 1; i <= 5; i++) {
      COMPUTED_COLUMNS.push('Leg ' + i + ' Average', 'Leg ' + i + ' Scoring Average',
        'Leg ' + i + ' Finish Average', 'Leg ' + i + ' First9 Average');
    }
  })();
  COMPUTED_COLUMNS.push('Gesamt geworfene Darts', 'Gesamt geworfene Punkte', 'Gesamt Average',
    'geworfene Darts Scoring', 'geworfene Punkte Scoring', 'Average Scoring',
    'geworfene Darts Finish', 'geworfene Punkte Finish', 'Average Finish',
    'geworfene Punkte First9', 'geworfene Darts First 9', 'Average First9',
    '50+', '90+', '130+', '60+', '80+', '100+',
    'Gegner Average', 'Gegner Scoring Average', 'Gegner Finish Average', 'Gegner First9 Average',
    'Average Checkout', 'Gegner Average Checkout',
    'Gegner Gesamt geworfene Darts', 'Gegner Gesamt geworfene Punkte');

  var AUF = ['Aufnahme0bis9', 'Aufnahme10bis19', 'Aufnahme20bis29', 'Aufnahme30bis39', 'Aufnahme40bis49',
    'Aufnahme50bis59', 'Aufnahme60bis69', 'Aufnahme70bis79', 'Aufnahme80bis89', 'Aufnahme90bis99',
    'Aufnahme100bis109', 'Aufnahme110bis119', 'Aufnahme120bis129', 'Aufnahme130bis139',
    'Aufnahme140bis149', 'Aufnahme150bis159', 'Aufnahme160bis169', 'Aufnahme170bis180'];

  function num(v) {
    if (v == null || v === '') return 0;
    var n = Number(v);
    return isFinite(n) ? n : 0;
  }
  function div(a, b) {
    a = num(a); b = num(b);
    return b ? a / b : null; // Excel: #DIV/0!
  }

  /* Spalten 68-113 als Werte (Excel-Formeln exakt repliziert, inkl. Eigenheiten:
     '100+' zählt 160-169 doppelt; 'Average Checkout' ohne Klammer um die Summe) */
  function computedValues(raw) {
    var out = {}, pts = [], dts = [], f9p = [], scp = [], scd = [], fip = [], fid = [], fin = [];
    for (var i = 1; i <= 5; i++) {
      var p = num(raw['geworfene Punkte Leg ' + i]), d = num(raw['geworfene Darts Leg ' + i]);
      var f = num(raw['First9 Leg ' + i]), s = num(raw['Scoring Leg ' + i]);
      var sd = num(raw['Darts im Scoring Leg ' + i]), fi = num(raw['Finish Scoring Leg ' + i]);
      var fd = num(raw['Darts im Finish Scoring Leg ' + i]);
      pts.push(p); dts.push(d); f9p.push(f); scp.push(s); scd.push(sd); fip.push(fi); fid.push(fd);
      fin.push(raw['Finish Leg ' + i]);
      var a = div(raw['geworfene Punkte Leg ' + i], raw['geworfene Darts Leg ' + i]);
      out['Leg ' + i + ' Average'] = a == null ? null : a * 3;
      var b = div(raw['Scoring Leg ' + i], raw['Darts im Scoring Leg ' + i]);
      out['Leg ' + i + ' Scoring Average'] = b == null ? null : b * 3;
      var c = div(raw['Finish Scoring Leg ' + i], raw['Darts im Finish Scoring Leg ' + i]);
      out['Leg ' + i + ' Finish Average'] = c == null ? null : c * 3;
      out['Leg ' + i + ' First9 Average'] = num(raw['First9 Leg ' + i]) / 3;
    }
    var gd = dts.reduce(function (x, y) { return x + y; }, 0);
    var gp = pts.reduce(function (x, y) { return x + y; }, 0);
    out['Gesamt geworfene Darts'] = gd;
    out['Gesamt geworfene Punkte'] = gp;
    out['Gesamt Average'] = gd ? gp / gd * 3 : null;
    var scD = scd.reduce(function (x, y) { return x + y; }, 0);
    var scP = scp.reduce(function (x, y) { return x + y; }, 0);
    out['geworfene Darts Scoring'] = scD;
    out['geworfene Punkte Scoring'] = scP;
    out['Average Scoring'] = scD ? scP / scD * 3 : null;
    var fiD = fid.reduce(function (x, y) { return x + y; }, 0);
    var fiP = fip.reduce(function (x, y) { return x + y; }, 0);
    out['geworfene Darts Finish'] = fiD;
    out['geworfene Punkte Finish'] = fiP;
    out['Average Finish'] = fiD ? fiP / fiD * 3 : null;
    var legs = num(raw['Legs gewonnen']) + num(raw['Legs verloren']);
    var f9sum = f9p.reduce(function (x, y) { return x + y; }, 0);
    out['geworfene Punkte First9'] = f9sum;
    out['geworfene Darts First 9'] = 9 * legs;
    out['Average First9'] = legs ? f9sum / (9 * legs) * 3 : null;
    function A(n) { return num(raw[n]); }
    out['50+'] = A('Aufnahme50bis59') + A('Aufnahme60bis69') + A('Aufnahme70bis79');
    out['90+'] = A('Aufnahme90bis99') + A('Aufnahme100bis109') + A('Aufnahme110bis119') + A('Aufnahme120bis129');
    out['130+'] = A('Aufnahme130bis139') + A('Aufnahme140bis149') + A('Aufnahme150bis159') + A('Aufnahme160bis169');
    out['60+'] = A('Aufnahme60bis69') + A('Aufnahme70bis79');
    out['80+'] = A('Aufnahme80bis89') + A('Aufnahme90bis99');
    out['100+'] = A('Aufnahme100bis109') + A('Aufnahme110bis119') + A('Aufnahme120bis129') +
      A('Aufnahme130bis139') + A('Aufnahme140bis149') + A('Aufnahme150bis159') +
      A('Aufnahme160bis169') + A('Aufnahme160bis169') + A('Aufnahme170bis180');
    var f1 = [num(fin[0]), num(fin[1]), num(fin[2]), num(fin[3]), num(fin[4])];
    out['Average Checkout'] = legs ? f1[0] + f1[1] + f1[2] + f1[3] + f1[4] / legs : null;
    return out;
  }

  /* Gegner-Spalten aus dem Paar-Partner (gleiche Spiel ID) */
  function applyOpponent(rows) {
    var byId = {};
    rows.forEach(function (r) {
      var k = r['Spiel ID'];
      (byId[k] = byId[k] || []).push(r);
    });
    Object.keys(byId).forEach(function (k) {
      var pair = byId[k];
      if (pair.length !== 2) return;
      [[pair[0], pair[1]], [pair[1], pair[0]]].forEach(function (pp) {
        var me = pp[0], op = pp[1];
        me['Gegner Average'] = op['Gesamt Average'];
        me['Gegner Scoring Average'] = op['Average Scoring'];
        me['Gegner Finish Average'] = op['Average Finish'];
        me['Gegner First9 Average'] = op['Average First9'];
        me['Gegner Average Checkout'] = op['Average Checkout'];
        me['Gegner Gesamt geworfene Darts'] = op['Gesamt geworfene Darts'];
        me['Gegner Gesamt geworfene Punkte'] = op['Gesamt geworfene Punkte'];
      });
    });
    return rows;
  }

  function tournamentId(url) {
    var m = String(url || '').match(/tournament\/([a-z0-9-]+)/i);
    return m ? m[1] : null;
  }

  function api(url) {
    return fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' bei ' + url);
      return r.json();
    });
  }

  function processGame(data, grp, week) {
    var pls = [
      { n: data.player1Name, d: data.gameDetailsPlayer1, s: data.player1Statistik, o: data.player2Name },
      { n: data.player2Name, d: data.gameDetailsPlayer2, s: data.player2Statistik, o: data.player1Name }
    ];
    return pls.map(function (p) {
      var row = {};
      BASE_COLUMNS.forEach(function (c) { row[c] = null; });
      row.Woche = week; row['Spiel ID'] = data.gameid;
      row['Spieler Name'] = p.n; row['Gegner Name'] = p.o; row.Gruppe = 'Gruppe ' + grp;
      var won = (p.d || []).filter(function (d) { return d.gewonnen === true; }).length;
      row['Legs gewonnen'] = won;
      row['Legs verloren'] = (p.d || []).length - won;
      (p.d || []).slice().sort(function (a, b) { return a.leg - b.leg; }).slice(0, 5).forEach(function (leg, k) {
        var i = k + 1;
        row['geworfene Punkte Leg ' + i] = leg.anzahlGeworfenerPunkte;
        row['geworfene Darts Leg ' + i] = leg.wuerfe;
        row['First9 Leg ' + i] = leg.anzahlGeworfenerPunkteFirst9;
        var vl = [];
        (data.scores || []).forEach(function (s) {
          if (s.gamedetailId === leg.id) vl = s.scores || [];
        });
        vl = vl.filter(function (v) { return v.scoregueltig && v.aufnahme != null; });
        var sp = 0, sd = 0, fp = 0, fd = 0, skip = false;
        vl.forEach(function (v, idx) {
          var drts = idx === vl.length - 1 ? (leg.wuerfe % 3 || 3) : 3;
          if (v.togo >= 101) { sp += v.aufnahme; sd += drts; }
          if (v.togo <= 170) {
            if (!skip) { skip = true; return; }
            fp += v.aufnahme; fd += drts;
          }
        });
        row['Scoring Leg ' + i] = sp; row['Darts im Scoring Leg ' + i] = sd;
        row['Finish Scoring Leg ' + i] = fp; row['Darts im Finish Scoring Leg ' + i] = fd;
        var fin = null;
        vl.forEach(function (v) { if (v.togo === 0 && fin == null) fin = v.aufnahme; });
        if (fin != null) row['Finish Leg ' + i] = fin;
      });
      for (var j = 0; j < 170; j += 10) {
        var v = p.s ? p.s['aufnahmen' + j + 'Bis' + (j + 9)] : 0;
        row['Aufnahme' + j + 'bis' + (j + 9)] = v == null ? 0 : v;
      }
      row['Aufnahme170bis180'] = (p.s && p.s.aufnahmen170Bis180) || 0;
      row['171'] = (p.s && p.s._171er) || 0;
      row['180'] = (p.s && p.s._180er) || 0;
      return row;
    });
  }

  function parseRankings(text, week, gelost, date) {
    var parts = String(text || '').split(/Gruppe\s+(\d+)/);
    var items = [], maxG = 0, i, g, lines, j;
    for (i = 1; i < parts.length; i += 2) {
      g = parseInt(parts[i], 10);
      if (g > maxG) maxG = g;
      lines = parts[i + 1].split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
      for (j = 0; j < lines.length; j++) {
        if (/^\d+\.$/.test(lines[j]) && lines[j + 1]) {
          items.push({ g: g, pl: parseInt(lines[j], 10), n: lines[j + 1] });
        }
      }
    }
    var spieltag = String(week).replace('Woche ', '');
    return items.map(function (it) {
      var pts, grp;
      if (gelost) {
        pts = 11 - it.pl; grp = 'gelost';
      } else {
        var cg = (it.g === maxG && maxG > 1) ? maxG - 1 : it.g;
        pts = Math.max(0, (13 - cg) - (it.pl - 1)); grp = 'Gruppe ' + it.g;
      }
      return { Spieltag: spieltag, Gruppe: grp, Platzierung: it.pl, Punkte: pts, Name: it.n, Datum: date };
    });
  }

  /* Bestehende IDs/Rankings aus den geladenen Website-Daten (Dedup ohne Excel-Zugriff) */
  function existingFromData() {
    var ids = {}, rank = {};
    try {
      var base = (window.DK_DATA || {}).base || {};
      (base.matches || []).forEach(function (m) { if (m.id) ids[m.id] = 1; });
      (base.platzierung || []).forEach(function (r) {
        rank[[r.Spieltag, r.Gruppe, String(r.Name || '').trim()].join('|')] = 1;
      });
    } catch (e) { /* ignore */ }
    return { ids: ids, rank: rank };
  }

  /* Zeilen anhand der Header-NAMEN anhängen (deterministisch, keine Formeln) */
  function appendRowsByName(XLSX, ws, header, rows) {
    if (!rows.length) return;
    var range = XLSX.utils.decode_range(ws['!ref']);
    var r0 = range.e.r + 1;
    rows.forEach(function (r, i) {
      header.forEach(function (name, c) {
        if (name == null) return;
        var v = r[name];
        if (v === undefined || v === null || v === '') return;
        ws[XLSX.utils.encode_cell({ r: r0 + i, c: c })] =
          { t: (typeof v === 'number' && isFinite(v)) ? 'n' : 's', v: v };
      });
    });
    ws['!ref'] = XLSX.utils.encode_range({ s: range.s, e: { r: r0 + rows.length - 1, c: range.e.c } });
  }

  /* Zeilen an Workbook anhängen (SheetJS). Gibt {wb, nS, nR} zurück. */
  function appendToWorkbook(XLSX, wb, gameRows, rankRows) {
    var ws = wb.Sheets.Spiele || wb.Sheets[wb.SheetNames[0]];
    var header = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })[0];
    var order = BASE_COLUMNS.concat(COMPUTED_COLUMNS);
    var objs = gameRows.map(function (r) {
      var o = {};
      order.forEach(function (c) { o[c] = r[c] == null ? null : r[c]; });
      return o;
    });
    appendRowsByName(XLSX, ws, header, objs);
    var wr = wb.Sheets.Platzierung;
    if (wr && rankRows.length) {
      var rheader = XLSX.utils.sheet_to_json(wr, { header: 1, defval: null })[0];
      appendRowsByName(XLSX, wr, rheader, rankRows.map(function (r) {
        return { Spieltag: r.Spieltag, Gruppe: r.Gruppe, Platzierung: r.Platzierung,
                 Punkte: r.Punkte, Name: r.Name, Datum: r.Datum };
      }));
    }
    return { wb: wb, nS: objs.length, nR: rankRows.length };
  }

  function writeWorkbook(XLSX, wb, handle, filename) {
    var bytes = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    var blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    function download() {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename || 'Ranglistentunier.xlsx';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
      return Promise.resolve({ saved: true, mode: 'download' });
    }
    if (handle) {
      return handle.createWritable().then(function (w) {
        return w.write(blob).then(function () { return w.close(); });
      }).then(function () { return { saved: true, mode: 'file' }; })
      .catch(function (e) {
        // z. B. abgelaufene User-Aktivierung nach langem Import → Download-Fallback
        log('Direktes Speichern scheiterte (' + (e && e.message) + ') – weiche auf Download aus.');
        return download();
      });
    }
    return download();
  }

  /* Spiel-Details mit 1x Retry (darthelfer liefert bei offenen Spielen HTTP 500) */
  function fetchGame(tid, g, idx, total) {
    var url = 'https://www.darthelfer.de/api/public/gameausarchiv/x01/' + tid + '/' + g.id + '/tournamentgameid';
    var tag = 'Spiel ' + (idx + 1) + '/' + total + (g.spielnummer != null ? ' (Nr. ' + g.spielnummer + ')' : '');
    log('  Lade ' + tag);
    return api(url).catch(function (e) {
      log('  Nochmal: ' + tag);
      return new Promise(function (res) { setTimeout(res, 2000); }).then(function () { return api(url); });
    }).then(function (gd) {
      return { ok: true, gd: gd };
    }).catch(function (e) {
      log('  WARNUNG ' + tag + ' übersprungen (keine Details: ' + (e && e.message) + ')');
      return { ok: false, tag: tag };
    });
  }

  /* ---------- UI (Menü wie Altes Programm) ---------- */
  var S = { fileBuf: null, fileName: '', handle: null, busy: false, doneIds: {}, doneRank: {} };

  function $(id) { return document.getElementById(id); }
  function showFileName(mode) {
    var s = $('impFileName');
    if (s) s.textContent = (S.fileName || '–') + (S.fileName && mode ? ' (' + mode + ')' : '');
  }
  function log(msg) {
    var box = $('impLog');
    if (!box) return;
    box.value += msg + '\n';
    box.scrollTop = box.scrollHeight;
  }
  function setBusy(b) {
    S.busy = b;
    var btn = $('impStart');
    if (btn) btn.disabled = b;
  }

  function pickFile() {
    if (window.showOpenFilePicker) {
      return window.showOpenFilePicker({
        types: [{ description: 'Excel', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }],
        multiple: false
      }).then(function (hs) {
        S.handle = hs[0];
        return S.handle.getFile();
      }).then(function (f) {
        S.fileName = f.name;
        return f.arrayBuffer();
      }).then(function (buf) {
        S.fileBuf = buf;
        showFileName('direktes Speichern möglich');
        log('Excel gewählt (direktes Speichern möglich): ' + S.fileName);
      }).catch(function (e) {
        if (e && e.name !== 'AbortError') { log('Dateiwahl abgebrochen/Fehler – Fallback: Datei-Upload.'); fallbackInput(); }
      });
    }
    fallbackInput();
    return Promise.resolve();
  }
  function fallbackInput() {
    var inp = $('impFile');
    if (inp) inp.click();
  }
  function onFileChosen(file) {
    S.handle = null;
    S.fileName = file.name;
    file.arrayBuffer().then(function (buf) {
      S.fileBuf = buf;
      showFileName('Download am Ende');
      log('Excel geladen (Download am Ende): ' + S.fileName);
    });
  }

  function collectWeek(i, fallbackWeek) {
    // Schritt-Assistent wie das Popup im alten Programm (pro URL)
    return new Promise(function (resolve) {
      var box = $('impStep');
      if (!box) { resolve({ week: fallbackWeek, date: '', gelost: false, rankText: '' }); return; }
      box.hidden = false;
      var t = $('impStepTitle');
      if (t) t.textContent = 'Daten für Turnier Nr. ' + (i + 1) + ':';
      var w = $('impWeek'), d = $('impDate'), g = $('impGelost'), r = $('impRank');
      if (w && !w.value) w.value = fallbackWeek || ('Woche ' + (i + 1));
      if (d && !d.value) {
        var now = new Date();
        var dd = ('0' + now.getDate()).slice(-2), mm = ('0' + (now.getMonth() + 1)).slice(-2);
        d.value = dd + '.' + mm + '.' + now.getFullYear();
      }
      var btn = $('impNext');
      function done() {
        var det = {
          week: (w && w.value.trim()) || fallbackWeek || ('Woche ' + (i + 1)),
          date: (d && d.value.trim()) || '',
          gelost: !!(g && g.checked),
          rankText: r ? r.value : ''
        };
        if (w) w.value = '';
        if (r) r.value = '';
        box.hidden = true;
        if (btn) btn.removeEventListener('click', done);
        resolve(det);
      }
      if (btn) btn.addEventListener('click', done);
      if (r) r.focus();
    });
  }

  function startImport() {
    if (S.busy) return;
    if (typeof XLSX === 'undefined') {
      log('FEHLER: Excel-Bibliothek nicht geladen (Internet nötig). Seite neu laden.');
      return;
    }
    var raw = ($('impUrls') ? $('impUrls').value : '').split('\n')
      .map(function (u) { return u.trim(); }).filter(function (u) { return u.indexOf('tournament/') !== -1; });
    if (!raw.length) { log('FEHLER: Keine Turnier-URLs (mit tournament/…) gefunden!'); return; }
    if (!S.fileBuf) { log('FEHLER: Bitte zuerst Ziel-Excel wählen!'); return; }
    setBusy(true);
    // Schreibrecht sofort (per Klick) sichern – nach Minuten-Import gilt die Aktivierung nicht mehr
    if (S.handle && S.handle.requestPermission) {
      try {
        var perm = S.handle.requestPermission({ mode: 'readwrite' });
        if (perm && perm.then) perm.then(function () {}, function () {});
      } catch (e) { /* Fallback beim Speichern */ }
    }
    var ex = existingFromData();
    // Session-Dedup: bereits in dieser Sitzung Geschriebenes nicht doppeln
    Object.keys(S.doneIds).forEach(function (k) { ex.ids[k] = 1; });
    Object.keys(S.doneRank).forEach(function (k) { ex.rank[k] = 1; });
    var wb;
    try {
      wb = XLSX.read(S.fileBuf, { type: 'array' });
    } catch (e) {
      log('FEHLER: Excel nicht lesbar: ' + (e && e.message));
      setBusy(false);
      return;
    }
    if (!wb.Sheets.Spiele || !wb.Sheets.Platzierung) {
      log('FEHLER: Blätter „Spiele“/„Platzierung“ fehlen in der Datei.');
      setBusy(false);
      return;
    }
    var allG = [], allR = [], chain = Promise.resolve();
    // Startwoche aus Daten ableiten
    var maxW = 0;
    try {
      ((window.DK_DATA || {}).base || {}).matches.forEach(function (m) { if (m.w > maxW) maxW = m.w; });
    } catch (e) { /* ignore */ }
    // 1) Details je URL abfragen (wie Popup im alten Programm)
    var dets = [];
    raw.forEach(function (url, i) {
      chain = chain.then(function () {
        var tid = tournamentId(url);
        if (!tid) { log('Überspringe (keine ID): ' + url); dets.push(null); return; }
        log('Details für Turnier ' + (i + 1) + '/' + raw.length + ' …');
        return collectWeek(i, 'Woche ' + (maxW + i + 1)).then(function (det) {
          det.tid = tid; det.url = url;
          dets.push(det);
        });
      });
    });
    // 2) Laden + rechnen + speichern
    chain = chain.then(function () {
      var seq = Promise.resolve();
      dets.forEach(function (det, i) {
        seq = seq.then(function () {
          if (!det) return;
          log('--- Turnier ' + (i + 1) + '/' + dets.length + ' ---');
          if (!det.rankText.trim()) { log('WARNUNG: kein Ranking-Text – Turnier übersprungen.'); return; }
          return api('https://www.darthelfer.de/api/public/tournament/' + det.tid).then(function (data) {
            var games = ((data.turnierMain || {}).tournamentGroupGameEntities) || [];
            var gseq = Promise.resolve();
            var grows = [], skipped = [];
            games.forEach(function (g, idx) {
              gseq = gseq.then(function () {
                return fetchGame(det.tid, g, idx, games.length).then(function (r) {
                  if (r.ok) {
                    processGame(r.gd, g.gruppe == null ? '?' : g.gruppe, det.week).forEach(function (x) { grows.push(x); });
                  } else if (r.tag) {
                    skipped.push(r.tag);
                  }
                });
              });
            });
            return gseq.then(function () {
              if (skipped.length) {
                log('  ' + skipped.length + ' ohne Details: ' + skipped.join(', '));
                log('  (Meist noch offene Spiele – später einfach erneut laufen lassen, Fehlendes wird ergänzt.)');
              }
              var fresh = grows.filter(function (r) { return !ex[r['Spiel ID']]; });
              log('  ' + grows.length + ' Zeilen geladen, ' + fresh.length + ' neu.');
              fresh.forEach(function (r) {
                var c = computedValues(r);
                Object.keys(c).forEach(function (k) { r[k] = c[k]; });
                ex[r['Spiel ID']] = 1;
              });
              applyOpponent(fresh);
              var rank = parseRankings(det.rankText, det.week, det.gelost, det.date);
              var freshR = rank.filter(function (r) {
                var k = [r.Spieltag, r.Gruppe, String(r.Name).trim()].join('|');
                return !ex.rank[k];
              });
              freshR.forEach(function (r) {
                ex.rank[[r.Spieltag, r.Gruppe, String(r.Name).trim()].join('|')] = 1;
              });
              log('  Ranking: ' + rank.length + ' Zeilen, ' + freshR.length + ' neu.');
              allG.push.apply(allG, fresh);
              allR.push.apply(allR, freshR);
            });
          }).catch(function (e) { log('FEHLER bei ' + det.tid + ': ' + (e && e.message)); });
        });
      });
      return seq;
    });
    chain.then(function () {
      log('GESAMT: ' + allG.length + ' neue Spiel-Zeilen, ' + allR.length + ' neue Ranking-Zeilen.');
      if (!allG.length && !allR.length) { log('Nichts zu schreiben.'); setBusy(false); return; }
      var res = appendToWorkbook(XLSX, wb, allG, allR);
      log('Excel aktualisiert (' + res.nS + ' + ' + res.nR + ' Zeilen, Werte statt Formeln). Speichere …');
      return writeWorkbook(XLSX, res.wb, S.handle, S.fileName).then(function (r) {
        if (r.mode === 'file') {
          log('Gespeichert (direkt in die gewählte Datei).');
          // Puffer auffrischen, damit ein weiterer Lauf in dieser Sitzung darauf aufbaut
          if (S.handle && S.handle.getFile) {
            S.handle.getFile().then(function (f) { return f.arrayBuffer(); }).then(function (buf) {
              S.fileBuf = buf;
            }).catch(function () { /* ignore */ });
          }
        } else log('Download gestartet – Datei bitte ans Original ersetzen.');
        allG.forEach(function (x) { S.doneIds[x['Spiel ID']] = 1; });
        allR.forEach(function (x) { S.doneRank[[x.Spieltag, x.Gruppe, String(x.Name).trim()].join('|')] = 1; });
        log('Danach im Terminal: python tools/build_data.py --out site/data');
      });
    }).catch(function (e) {
      log('FEHLER: ' + (e && e.message));
    }).then(function () { setBusy(false); });
  }

  function bindUI() {
    var b = $('impPick');
    if (b) b.addEventListener('click', pickFile);
    var f = $('impFile');
    if (f) f.addEventListener('change', function () { if (f.files[0]) onFileChosen(f.files[0]); });
    var s = $('impStart');
    if (s) s.addEventListener('click', startImport);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindUI);
  else bindUI();

  window.DK_IMPORT = {
    BASE_COLUMNS: BASE_COLUMNS, COMPUTED_COLUMNS: COMPUTED_COLUMNS,
    tournamentId: tournamentId, processGame: processGame, computedValues: computedValues,
    applyOpponent: applyOpponent, parseRankings: parseRankings,
    existingFromData: existingFromData, appendToWorkbook: appendToWorkbook,
    version: 1
  };
})();
