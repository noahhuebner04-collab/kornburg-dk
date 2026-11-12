/* DK_CHARTS – Canvas-Charts ohne Abhängigkeiten, dunkles Theme */
(function () {
  'use strict';

  var AXIS = '#EDEDEF';
  var GRID = '#26272e';
  var MUTED = '#8A8F98';
  var PALETTE = ['#e30613', '#D4AF37', '#4da3ff', '#2ecc71', '#b57bff', '#ff7a1a', '#999B9B'];

  function setup(canvas, h) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
    var height = h || 280;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.height = height + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, height);
    return { ctx: ctx, w: w, h: height };
  }

  function fmtVal(v, pct) {
    if (v == null || isNaN(v)) return '–';
    if (pct) return (Number(v) * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %';
    return Number(v).toLocaleString('de-DE', { maximumFractionDigits: 2 });
  }

  function niceMax(max) {
    if (!isFinite(max) || max <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(max)));
    var n = max / p;
    var m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return m * p;
  }

  function legend(canvas, items) {
    var box = canvas.parentElement.querySelector('.legend');
    if (!box) {
      box = document.createElement('div');
      box.className = 'legend';
      canvas.insertAdjacentElement('afterend', box);
    }
    box.innerHTML = items.map(function (it) {
      return '<span><i style="background:' + it.color + '"></i>' + escapeHtml(it.name) + '</span>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function axesFrame(ctx, pad, w, h) {
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    ctx.fillStyle = MUTED;
    ctx.font = '11px system-ui, sans-serif';
  }

  /* Linien-Chart: {cats:[], series:[{name,color,values[],pct?}], step?}
     - Y-Achse fokussiert auf den Wertebereich (kein verschenkter Platz)
     - null-Werte = Lücke (fehlende Woche wird übersprungen, nicht auf 0 gezogen)
     - Hover/Tooltip mit Woche + Werten */
  function lineChart(canvas, opts) {
    if (!canvas) return;
    opts = opts || {};
    var cats = opts.cats || [];
    var series = opts.series || [];
    // alte Hover-Reste entfernen (Neuzeichnen)
    try {
      if (canvas._dkTip && canvas._dkTip.parentNode) canvas._dkTip.parentNode.removeChild(canvas._dkTip);
      canvas._dkTip = null;
      if (canvas._dkHover) {
        canvas.removeEventListener('mousemove', canvas._dkHover.move);
        canvas.removeEventListener('mouseleave', canvas._dkHover.leave);
        canvas.removeEventListener('click', canvas._dkHover.move);
        canvas._dkHover = null;
      }
    } catch (e) { /* ignore */ }
    var s = setup(canvas);
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { l: 52, r: 12, t: 14, b: 30 };
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    var n = cats.length;
    var all = [];
    series.forEach(function (sr) {
      (sr.values || []).forEach(function (v) { if (v != null && isFinite(v)) all.push(Number(v)); });
    });
    if (!n || !series.length || !all.length) {
      ctx.fillStyle = MUTED; ctx.font = '13px system-ui';
      ctx.fillText('Keine Daten für Linien-Chart.', pad.l, h / 2);
      return;
    }
    var pct = series.some(function (x) { return x.pct; });
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all);
    // Fokus auf den wichtigen Bereich
    var span = (mx - mn) || Math.abs(mx) * 0.1 || 1;
    var lo = mn - span * 0.2, hi = mx + span * 0.2;
    if (mn >= 0 && lo < 0) lo = 0;
    lo = Math.floor(lo * 2) / 2; hi = Math.ceil(hi * 2) / 2;
    if (hi <= lo) hi = lo + 1;
    canvas._dkBounds = { lo: lo, hi: hi };
    var step = opts.step || Math.max(1, Math.ceil(n / 8));
    function X(i) { return pad.l + (iw * (n === 1 ? 0.5 : i / (n - 1))); }
    function Y(v) { return pad.t + ih - (ih * (v - lo) / (hi - lo)); }
    function colorOf(sr, si) { return sr.color || PALETTE[si % PALETTE.length]; }
    function drawBase(hover) {
      axesFrame(ctx, pad, w, h);
      ctx.clearRect(0, 0, w, h);
      // Grid + Y-Achse
      ctx.textAlign = 'right';
      for (var g = 0; g <= 4; g++) {
        var y = pad.t + ih - (ih * g / 4);
        ctx.strokeStyle = GRID;
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
        ctx.fillStyle = MUTED;
        ctx.fillText(fmtVal(lo + (hi - lo) * g / 4, pct), pad.l - 8, y + 4);
      }
      // X-Labels
      ctx.textAlign = 'center';
      cats.forEach(function (c, i) {
        if (i % step !== 0 && i !== n - 1) return;
        ctx.fillStyle = MUTED;
        ctx.fillText(String(c), X(i), h - 8);
      });
      // Hover-Lot
      if (hover != null && hover >= 0) {
        ctx.strokeStyle = '#EDEDEF55';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(X(hover), pad.t); ctx.lineTo(X(hover), pad.t + ih); ctx.stroke();
      }
      // Linien (mit Lücken bei null)
      series.forEach(function (sr, si) {
        var color = colorOf(sr, si);
        var vals = sr.values || [];
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
        var started = false;
        for (var i = 0; i < n; i++) {
          var v = vals[i];
          if (v == null || !isFinite(v)) { started = false; continue; }
          if (!started) { ctx.moveTo(X(i), Y(v)); started = true; }
          else ctx.lineTo(X(i), Y(v));
        }
        ctx.stroke();
        ctx.fillStyle = color;
        for (var j = 0; j < n; j++) {
          var u = vals[j];
          if (u == null || !isFinite(u)) continue;
          ctx.beginPath(); ctx.arc(X(j), Y(u), (j === hover) ? 5 : 3, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.strokeStyle = AXIS;
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ih); ctx.lineTo(w - pad.r, pad.t + ih); ctx.stroke();
    }
    drawBase(-1);
    legend(canvas, series.map(function (sr, i) {
      return { name: sr.name || ('Serie ' + (i + 1)), color: colorOf(sr, i) };
    }));
    // Tooltip (Woche + Werte), folgt der Maus
    var parent = canvas.parentElement;
    try { if (parent && !parent.style.position) parent.style.position = 'relative'; } catch (e) { /* ignore */ }
    var tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.style.display = 'none';
    if (parent) parent.appendChild(tip);
    canvas._dkTip = tip;
    function nearest(px) {
      var rel = (px - pad.l) / (iw || 1) * (n - 1);
      return Math.max(0, Math.min(n - 1, Math.round(rel)));
    }
    function onMove(e) {
      var r = { left: 0, top: 0 };
      try { r = canvas.getBoundingClientRect() || r; } catch (err) { /* ignore */ }
      var cx = (e.clientX != null ? e.clientX : 0) - (r.left || 0);
      var i = nearest(cx);
      drawBase(i);
      var html = '<b>' + escapeHtml(cats[i]) + '</b>';
      series.forEach(function (sr, si) {
        var v = (sr.values || [])[i];
        html += '<br><span class="dot" style="background:' + colorOf(sr, si) + '"></span>' +
          escapeHtml(sr.name || ('Serie ' + (si + 1))) + ': <b>' +
          (v == null || !isFinite(v) ? '–' : escapeHtml(fmtVal(v, sr.pct || pct))) + '</b>';
      });
      tip.innerHTML = html;
      tip.style.display = 'block';
      var tx = X(i) + 12;
      if (tx + 170 > w) tx = X(i) - 182;
      tip.style.left = Math.max(2, tx) + 'px';
      tip.style.top = (pad.t + 4) + 'px';
    }
    function onLeave() { tip.style.display = 'none'; drawBase(-1); }
    canvas._dkHover = { move: onMove, leave: onLeave };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onMove);
    canvas.addEventListener('mouseleave', onLeave);
  }

  /* Horizontale Balken: {cats:[], series:[{name?,color?,values[],pct?}] | {values[]}} */
  function barH(canvas, opts) {
    if (!canvas) return;
    opts = opts || {};
    var cats = opts.cats || [];
    var raw = opts.series || [];
    var seriesArr = Array.isArray(raw) ? raw : [raw];
    var s = setup(canvas);
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { l: 130, r: 56, t: 10, b: 10 };
    if (!cats.length) {
      ctx.fillStyle = MUTED; ctx.fillText('Keine Daten für Balken-Chart.', pad.l, h / 2);
      return;
    }
    var flatMax = 0, pct = false;
    seriesArr.forEach(function (sr) {
      if (sr && sr.pct) pct = true;
      (sr.values || []).forEach(function (v) { if (v != null && v > flatMax) flatMax = v; });
    });
    flatMax = niceMax(flatMax || 1);
    var nSeries = Math.max(1, seriesArr.length);
    var rowH = (h - pad.t - pad.b) / cats.length;
    var barHh = Math.min(16, (rowH - 8) / nSeries);
    ctx.font = '12px system-ui';
    cats.forEach(function (c, i) {
      var yRow = pad.t + rowH * i;
      // Kategorie
      ctx.fillStyle = AXIS; ctx.textAlign = 'right';
      var label = String(c).length > 18 ? String(c).slice(0, 17) + '…' : String(c);
      ctx.fillText(label, pad.l - 8, yRow + rowH / 2 + 4);
      seriesArr.forEach(function (sr, si) {
        var v = (sr.values || [])[i];
        if (v == null) return;
        var color = (sr.colors && sr.colors[i]) || sr.color || PALETTE[si % PALETTE.length];
        var bw = (w - pad.l - pad.r) * (v / flatMax);
        var y = yRow + (rowH - barHh * nSeries) / 2 + si * barHh;
        ctx.fillStyle = color;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pad.l, y, Math.max(2, bw), barHh, 4);
        else ctx.rect(pad.l, y, Math.max(2, bw), barHh);
        ctx.fill();
        ctx.fillStyle = AXIS; ctx.textAlign = 'left';
        ctx.fillText(fmtVal(v, pct || sr.pct), pad.l + bw + 6, y + barHh - 2);
      });
      ctx.strokeStyle = GRID;
      ctx.beginPath(); ctx.moveTo(pad.l, yRow + rowH); ctx.lineTo(w - 8, yRow + rowH); ctx.stroke();
    });
    if (seriesArr.length > 1) {
      legend(canvas, seriesArr.map(function (sr, i) {
        return { name: sr.name || ('Serie ' + (i + 1)), color: sr.color || PALETTE[i % PALETTE.length] };
      }));
    }
  }

  /* Donut: {labels:[], values:[], colors:[]} */
  function donut(canvas, opts) {
    if (!canvas) return;
    opts = opts || {};
    var labels = opts.labels || [], values = opts.values || [];
    var colors = opts.colors || PALETTE;
    var s = setup(canvas);
    var ctx = s.ctx, w = s.w, h = s.h;
    var total = values.reduce(function (a, b) { return a + (Number(b) || 0); }, 0);
    if (!values.length || total <= 0) {
      ctx.fillStyle = MUTED; ctx.fillText('Keine Daten für Donut-Chart.', 20, h / 2);
      return;
    }
    var cx = w / 2, cy = h / 2 - 6, R = Math.min(w, h) / 2 - 30, r = R * 0.58;
    var a0 = -Math.PI / 2;
    values.forEach(function (v, i) {
      var a1 = a0 + (Math.PI * 2 * (Number(v) || 0) / total);
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, a1);
      ctx.arc(cx, cy, r, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      a0 = a1;
    });
    // Anteile in % an die Segmente – nur ab 5 %, Mini-Segmente stehen in der Legende
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    (function () {
      var ang = -Math.PI / 2;
      values.forEach(function (v) {
        var frac = total > 0 ? (Number(v) || 0) / total : 0;
        var sweep = Math.PI * 2 * frac;
        var mid = ang + sweep / 2;
        if (frac >= 0.05) {
          var lr = R + 14;
          var tx = cx + lr * Math.cos(mid), ty = cy + lr * Math.sin(mid);
          tx = Math.min(Math.max(tx, 34), w - 34);
          ctx.fillStyle = AXIS;
          ctx.fillText((frac * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %', tx, ty + 4);
        }
        ang += sweep;
      });
    })();
    legend(canvas, labels.map(function (l, i) {
      var frac = total > 0 ? (Number(values[i]) || 0) / total : 0;
      return { name: l + ' (' + (frac * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %)', color: colors[i % colors.length] };
    }));
  }

  /* Scatter: {points:[{x,y,label?,color?}], xfmt, yfmt} – xfmt/yfmt: Funktion oder {pct:true} */
  function scatter(canvas, opts) {
    if (!canvas) return;
    opts = opts || {};
    var pts = opts.points || [];
    var s = setup(canvas, 360);
    var ctx = s.ctx, w = s.w, h = s.h;
    var pad = { l: 52, r: 16, t: 14, b: 34 };
    if (!pts.length) {
      ctx.fillStyle = MUTED; ctx.fillText('Keine Daten für Scatter-Chart.', pad.l, h / 2);
      return;
    }
    function num(k) {
      var arr = pts.map(function (p) { return Number(p[k]); }).filter(isFinite);
      return { min: Math.min.apply(null, arr), max: Math.max.apply(null, arr) };
    }
    var xr = num('x'), yr = num('y');
    // Puffer um die Daten, damit Punkte + Labels nicht am Rand kleben/abschneiden
    [['xr', xr], ['yr', yr]].forEach(function (pair) {
      var r = pair[1];
      var sp = (r.max - r.min) || Math.abs(r.max) * 0.1 || 1;
      r.min -= sp * 0.1; r.max += sp * 0.1;
    });
    canvas._dkBounds = { x: { min: xr.min, max: xr.max }, y: { min: yr.min, max: yr.max } };
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    function X(v) { return pad.l + iw * (v - xr.min) / (xr.max - xr.min); }
    function Y(v) { return pad.t + ih - ih * (v - yr.min) / (yr.max - yr.min); }
    function fmt(f, v) {
      if (typeof f === 'function') return f(v);
      if (f && f.pct) return fmtVal(v, true);
      return fmtVal(v, false);
    }
    ctx.font = '11px system-ui';
    ctx.strokeStyle = GRID; ctx.fillStyle = MUTED;
    ctx.textAlign = 'right';
    for (var g = 0; g <= 4; g++) {
      var yv = yr.min + (yr.max - yr.min) * g / 4, y = Y(yv);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillText(fmt(opts.yfmt, yv), pad.l - 8, y + 4);
    }
    ctx.textAlign = 'center';
    for (var gx = 0; gx <= 5; gx++) {
      var xv = xr.min + (xr.max - xr.min) * gx / 5;
      ctx.fillText(fmt(opts.xfmt, xv), X(xv), h - 10);
    }
    var placed = []; // belegte Label-Boxen {x, y, w} zur Entzerrung
    pts.forEach(function (p, i) {
      ctx.fillStyle = p.color || PALETTE[i % PALETTE.length];
      ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#00000088'; ctx.stroke();
      if (p.label) {
        // Label passt nicht mehr rechts hin? -> links vom Punkt
        ctx.font = '11px system-ui';
        var txt = String(p.label), tw = 0;
        try { tw = ctx.measureText(txt).width; } catch (e) { /* ignore */ }
        var lx = X(p.x) + 8, anchor = 'left';
        if (lx + tw > w - pad.r) { lx = X(p.x) - 8; anchor = 'right'; }
        var ly = Y(p.y) + 4, guard = 0;
        // überlappende Labels nach unten staffeln
        var clash = true;
        while (clash && guard < 6) {
          clash = false;
          for (var k = 0; k < placed.length; k++) {
            var q = placed[k];
            if (Math.abs(ly - q.y) < 13 && Math.abs((lx + (anchor === 'left' ? tw / 2 : -tw / 2)) - q.x) < (tw + q.w) / 2 + 4) {
              ly = q.y + 13; clash = true; break;
            }
          }
          guard++;
        }
        if (ly > pad.t + ih) ly = pad.t + ih;
        ctx.fillStyle = AXIS; ctx.textAlign = anchor;
        ctx.fillText(txt, lx, ly);
        placed.push({ x: lx + (anchor === 'left' ? tw / 2 : -tw / 2), y: ly, w: tw });
      }
    });
    ctx.strokeStyle = AXIS;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ih); ctx.lineTo(w - pad.r, pad.t + ih); ctx.stroke();
  }

  window.DK_CHARTS = { lineChart: lineChart, barH: barH, donut: donut, scatter: scatter };
})();
