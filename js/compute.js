/* DK_ENGINE – Measure-Engine im Browser (Port von tools/dk_data.py).
   Einzige Quelle: data/base.json -> matches (expandierte Spielzeilen).
   Scopes wie Desktop: Spieler/Woche-Range/Gruppe; Gegner wird ignoriert (ALL-Semantik),
   H2H nutzt Direktbegegnungen. */
(function () {
  'use strict';

  var B = null;

  function num(v) { var f = parseFloat(v); return isFinite(f) ? f : 0; }
  function div(p, d) { return d ? p / d : 0; }
  function init(base) { B = base; }
  function weeks() { return (B && B.meta && B.meta.weeks) || []; }
  function players() { return (B && B.meta && B.meta.players) || []; }
  function groups() { return (B && B.meta && B.meta.groups) || []; }
  function playerGruppe(p) {
    if (B && B.playermeta && B.playermeta[p]) return B.playermeta[p].gruppe || '';
    return '';
  }
  function maxWeek() {
    var w = weeks();
    return w.length ? w[w.length - 1] : 0;
  }

  /* Zeilen filtern: {player, players, lo, hi, gruppe} */
  function rows(o) {
    o = o || {};
    if (!B || !B.matches) return [];
    return B.matches.filter(function (m) {
      if (o.player && m.sp !== o.player) return false;
      if (o.players && o.players.indexOf(m.sp) === -1) return false;
      if (o.lo != null && m.w < o.lo) return false;
      if (o.hi != null && m.w > o.hi) return false;
      if (o.gruppe && m.gr !== o.gruppe) return false;
      return true;
    });
  }

  function sumRows(rs) {
    var a = { n: rs.length, lg: 0, lv: 0, pts: 0, darts: 0, f9p: 0, f9d: 0, scp: 0, scd: 0,
      finp: 0, find: 0, tons: 0, f171: 0, f180: 0, aufn: 0, tri: 0, aus: 0,
      g1: 0, g2: 0, g3: 0, g4: 0, g5: 0, g6: 0, g7: 0, g8: 0, g9: 0,
      aus_on: 0, dec_n: 0, dec_w: 0, ausb_w: 0, ausb_n: 0,
      anw_w: 0, anw_n: 0, ganw_w: 0, ganw_n: 0, u60_n: 0, u60_w: 0,
      low: 0, low21: 0, chk40: 0, chk36: 0, chk32: 0, siege: 0,
      chk_n: 0, chk_sum: 0, bestleg: null, hfmax: null,
      legp: [0, 0, 0, 0, 0], legd: [0, 0, 0, 0, 0],
      chk_cats: [0, 0, 0, 0, 0, 0, 0], finset: {} };
    rs.forEach(function (m) {
      a.lg += num(m.lg); a.lv += num(m.lv);
      a.pts += num(m.pts); a.darts += num(m.darts);
      a.f9p += num(m.f9p); a.f9d += num(m.f9d);
      a.scp += num(m.scp); a.scd += num(m.scd);
      a.finp += num(m.finp); a.find += num(m.find);
      a.tons += num(m.tons); a.f171 += num(m.f171); a.f180 += num(m.f180);
      a.aufn += num(m.aufn); a.tri += num(m.tri); a.aus += num(m.aus);
      ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9'].forEach(function (k) { a[k] += num(m[k]); });
      a.aus_on += num(m.aus_on);
      a.dec_n += num(m.dec); a.dec_w += num(m.decw);
      a.ausb_w += num(m.bull); a.ausb_n += 1;
      a.anw_w += num(m.anw_w); a.anw_n += num(m.anw_n);
      a.ganw_w += num(m.ganw_w); a.ganw_n += num(m.ganw_n);
      a.u60_n += num(m.u60n); a.u60_w += num(m.u60w);
      a.chk40 += num(m.chk40); a.chk36 += num(m.chk36); a.chk32 += num(m.chk32);
      if (m.lg === 3) a.siege += 1;
      var i;
      for (i = 0; i < 5; i++) {
        a.legp[i] += num(m.legp[i]); a.legd[i] += num(m.legd[i]);
        var P = num(m.legp[i]), Dd = num(m.legd[i]), F = num(m.legf[i]);
        if (P === 501 && Dd > 0) {
          if (a.bestleg == null || Dd < a.bestleg) a.bestleg = Dd;
          if (Dd <= 20) a.low += 1;
          if (Dd <= 21) a.low21 += 1;
        }
        if (P === 501 && F > 0 && (a.hfmax == null || F > a.hfmax)) a.hfmax = F;
        if (F > 0) { a.chk_n += 1; a.chk_sum += F; a.finset[F] = 1; }
      }
    });
    a.finset = Object.keys(a.finset).map(Number);
    return a;
  }

  function metrics(a) {
    return {
      avg: div(a.pts, a.darts) * 3,
      first9: div(a.f9p, a.f9d) * 3,
      scoring: div(a.scp, a.scd) * 3,
      finish: div(a.finp, a.find) * 3,
      checkout: a.chk_n ? a.chk_sum / a.chk_n : 0,
      tons: a.tons, f171: a.f171, f180: a.f180,
      bestleg: a.bestleg, hfmax: a.hfmax, low: a.low,
      aufnahmen: a.aufn,
      gerade: div(a.aus_on, a.darts) * 1.1,
      triple: div(a.tri, a.darts),
      ausreisser: 1 - div(a.aus_on, a.darts) * 1.1,
      visits: [div(a.g1 + a.g2 + a.g3, a.aufn), div(a.g5 + a.g6, a.aufn),
               div(a.g7 + a.g8, a.aufn), div(a.g9, a.aufn)],
      decider: a.dec_n ? a.dec_w / a.dec_n : 0,
      winrate_u60: a.u60_n ? a.u60_w / a.u60_n : 0,
      ausbull: a.ausb_n ? a.ausb_w / a.ausb_n : 0,
      anwurf: a.anw_n ? a.anw_w / a.anw_n : 0,
      gegen_anwurf: a.ganw_n ? a.ganw_w / a.ganw_n : 0,
      legavgs: [0, 1, 2, 3, 4].map(function (i) { return div(a.legp[i], a.legd[i]) * 3; }),
      spiele: a.n, siege: a.siege, punkte: a.siege * 3,
      checkrate: function (weg) { return 0; }
    };
  }

  function scoped(player, lo, hi, gruppe) {
    return metrics(sumRows(rows({ player: player, lo: lo, hi: hi, gruppe: gruppe })));
  }

  /* Matchliste eines Spielers (neueste zuerst) */
  function playerMatches(p) {
    return rows({ player: p }).slice().sort(function (x, y) {
      return (y.w - x.w) || String(y.id).localeCompare(String(x.id));
    });
  }

  function matchAvg(m) { return m.darts ? (m.pts / m.darts) * 3 : 0; }

  /* Bestes Einzelspiel (höchster Match-Avg) im Zeitraum, optional pro Gruppe */
  function bestMatchAvg(p, lo, hi, gruppe) {
    var best = null;
    rows({ player: p, lo: lo, hi: hi, gruppe: gruppe }).forEach(function (m) {
      var a = matchAvg(m);
      if (best == null || a > best.avg) best = { avg: Math.round(a * 100) / 100, w: m.w, geg: m.geg, sp: m.sp };
    });
    return best;
  }

  function lastK(p, opp, k, lost) {
    var rs = playerMatches(p);
    if (opp) rs = rs.filter(function (m) { return m.geg === opp; });
    var out = [];
    for (var i = 1; i <= k; i++) {
      if (rs.length < i) { out.push('-'); continue; }
      var topk = rs.slice(0, i).slice().sort(function (x, y) {
        return (x.w - y.w) || String(x.id).localeCompare(String(y.id));
      });
      var last = topk[0];
      out.push(((lost ? last.lv : last.lg) === 3) ? 'W' : 'L');
    }
    return out;
  }

  function form5(p, opp) {
    var rs = playerMatches(p);
    if (opp) rs = rs.filter(function (m) { return m.geg === opp; });
    rs = rs.slice(0, 5);
    if (!rs.length) return 0;
    return rs.reduce(function (s, m) { return s + matchAvg(m); }, 0) / rs.length;
  }

  function form5tage(p, opp) {
    var rs = playerMatches(p);
    if (opp) rs = rs.filter(function (m) { return m.geg === opp; });
    var ws = {};
    rs.forEach(function (m) { ws[m.w] = 1; });
    var top = Object.keys(ws).map(Number).sort(function (x, y) { return y - x; }).slice(0, 5);
    if (!top.length) return 0;
    var all = rows({ player: p }).filter(function (m) { return top.indexOf(m.w) !== -1; });
    var q = 0, d = 0;
    all.forEach(function (m) { q += m.pts; d += m.darts; });
    return div(q, d) * 3;
  }

  function winprob(a, b) {
    var fa = form5(a, b), fb = form5(b, null);
    var ta = form5tage(a, b), tb = form5tage(b, null);
    var fp = 1 / (1 + Math.exp(-0.12 * (fa - fb)));
    var kp = 1 / (1 + Math.exp(-0.10 * (ta - tb)));
    var la = lastK(a, b, 5, false);
    var hp = la.reduce(function (s, x) { return s + (x === 'W' ? 1 : (x === 'L' ? 0 : 0.5)); }, 0) / 5;
    var fin = fp * 0.40 + kp * 0.30 + hp * 0.30;
    if (!fa) fin = 0.5;
    return [fin, 1 - fin];
  }

  function h2h(a, b) {
    function PA(x, y) { return rows({ player: x }).filter(function (m) { return m.geg === y; }); }
    function agg(rs) {
      var t = { n: 0 };
      var sums = ['lg', 'lv', 'pts', 'darts', 'f9p', 'f9d', 'tons', 'f171', 'f180'];
      sums.forEach(function (k) { t[k] = 0; });
      t.hfmax = null;
      rs.forEach(function (m) {
        sums.forEach(function (k) { t[k] += num(m[k]); });
        (m.legf || []).forEach(function (F, i) {
          if ((m.legp || [])[i] === 501 && F > 0 && (t.hfmax == null || F > t.hfmax)) t.hfmax = F;
        });
      });
      return t;
    }
    var R_AB = PA(a, b), R_BA = PA(b, a);
    var A = agg(R_AB), Bs = agg(R_BA);
    var sa = sumRows(rows({ player: a })), sb = sumRows(rows({ player: b }));
    function R(v, d) { return v == null ? v : Math.round(v * 100) / 100; }
    var zeilen = [
      { label: 'Average', a: R(div(A.pts, A.darts) * 3), b: R(div(Bs.pts, Bs.darts) * 3) },
      { label: 'First 9', a: R(div(A.f9p, A.f9d) * 3), b: R(div(Bs.f9p, Bs.f9d) * 3) },
      { label: 'Tons', a: A.tons, b: Bs.tons },
      { label: '171er', a: A.f171, b: Bs.f171 },
      { label: '180er', a: A.f180, b: Bs.f180 },
      { label: 'High Finish', a: A.hfmax || 0, b: Bs.hfmax || 0 },
      { label: 'Saison Average', a: R(div(sa.pts, sa.darts) * 3), b: R(div(sb.pts, sb.darts) * 3) }
    ];
    var ta = lastK(a, b, 5, false), tb = lastK(b, a, 5, false);
    var wp = winprob(a, b);
    function wins(rs) { return rs.filter(function (m) { return m.lg === 3; }).length; }
    var bilanz = { a: wins(R_AB), b: wins(R_BA), duelle: R_AB.length, legsA: A.lg, legsB: Bs.lg };
    return { zeilen: zeilen, trend: (function (o) { o[a] = ta; o[b] = tb; return o; })({}), winProb: { a: wp[0], b: wp[1] }, bilanz: bilanz };
  }

  var KAT_VALUE = {
    finish: function (t) { return t.hfmax; },
    leg: function (t) { return t.bestleg; },
    f171: function (t) { return t.f171; },
    f180: function (t) { return t.f180; },
    tons: function (t) { return t.tons; }
  };

  var CATS = ['1 Dart (D2-D20)', '2 Dart (S+D)', '3 Dart (S+S+D)', '2 Dart (T+D)',
              '3 Dart (T+S+D)', '3 Dart (T+T+D)', 'Sonstige'];
  var CAT_COLORS = { '1 Dart (D2-D20)': '#8CB42D', '2 Dart (S+D)': '#2ECC71',
    '3 Dart (S+S+D)': '#3498DB', '2 Dart (T+D)': '#F1C40F', '3 Dart (T+S+D)': '#E67E22',
    '3 Dart (T+T+D)': '#E74C3C', 'Sonstige': '#8A8F98' };

  function catOf(finish, darts) {
    var f = Math.round(num(finish)), dd = Math.round(num(darts)), d = dd % 3 === 0 ? 3 : dd % 3;
    if (f >= 2 && f <= 40 && f % 2 === 0) return CATS[0];
    if ((f >= 3 && f <= 39 && f % 2 !== 0) || (f >= 41 && f <= 60)) return CATS[1];
    if (f >= 61 && f <= 80 && d === 3) return CATS[2];
    if (f >= 61 && f <= 100 && f !== 99) return CATS[3];
    if (f === 99 || (f >= 101 && f <= 130)) return CATS[4];
    if (f >= 131 && f <= 170) return CATS[5];
    return CATS[6];
  }

  function checkoutDonut(p, lo, hi) {
    var counts = [0, 0, 0, 0, 0, 0, 0];
    rows({ player: p, lo: lo, hi: hi }).forEach(function (m) {
      (m.legf || []).forEach(function (F, i) {
        if (F > 0) counts[CATS.indexOf(catOf(F, (m.legd || [])[i]))] += 1;
      });
    });
    return { labels: CATS.slice(), values: counts, colors: CATS.map(function (c) { return CAT_COLORS[c]; }) };
  }

  function totals(o) {
    o = o || {};
    var out = {};
    players().forEach(function (p) {
      out[p] = sumRows(rows({ player: p, lo: o.lo, hi: o.hi, gruppe: o.gruppe }));
    });
    return out;
  }

  function topNames(kat, o, n) {
    var T = totals(o), arr = [];
    Object.keys(T).forEach(function (p) {
      var v = KAT_VALUE[kat](T[p]);
      if (v != null && v > 0) arr.push([p, v]);
    });
    if (kat === 'leg') arr.sort(function (x, y) { return (x[1] - y[1]) || (x[0] < y[0] ? -1 : 1); });
    else arr.sort(function (x, y) { return (y[1] - x[1]) || (x[0] < y[0] ? -1 : 1); });
    return arr.slice(0, n || 5).map(function (e) { return e[0]; });
  }

  function podium(kat, o) {
    var T = totals(o), arr = [];
    Object.keys(T).forEach(function (p) {
      var v = KAT_VALUE[kat](T[p]);
      if (v != null && !(kat !== 'leg' && v <= 0) && !(kat === 'leg' && !v)) arr.push([p, v]);
    });
    if (kat === 'leg') arr.sort(function (x, y) { return (x[1] - y[1]) || (x[0] < y[0] ? -1 : 1); });
    else arr.sort(function (x, y) { return (y[1] - x[1]) || (x[0] < y[0] ? -1 : 1); });
    function pick(i) {
      if (i < arr.length) return { name: arr[i][0], wert: arr[i][1] };
      return { name: '–', wert: null };
    }
    return { gold: pick(0), silber: pick(1), bronze: pick(2) };
  }

  function wochen() { return weeks(); }

  function rennen(kat, names, o) {
    o = o || {};
    var ws = weeks().filter(function (w) {
      return (o.lo == null || w >= o.lo) && (o.hi == null || w <= o.hi);
    });
    return {
      weeks: ws,
      series: names.map(function (p) {
        var vals = [], best = null, sum = 0;
        ws.forEach(function (w) {
          // Kumulativ ab Saisonstart (Desktop resettet am Range-Anfang nicht)
          var t = sumRows(rows({ player: p, lo: 1, hi: w, gruppe: o.gruppe }));
          var v = KAT_VALUE[kat](t);
          if (kat === 'finish' || kat === 'leg') {
            if (v != null && (best == null || (kat === 'finish' ? v > best : v < best))) best = v;
            vals.push(best);
          } else { vals.push(v || 0); }
        });
        return { name: p, values: vals };
      })
    };
  }

  function weeklyMetric(p, fn, lo, hi) {
    return weeks().filter(function (w) {
      return (lo == null || w >= lo) && (hi == null || w <= hi);
    }).map(function (w) {
      var t = sumRows(rows({ player: p, lo: w, hi: w }));
      var v = fn(t);
      return (v == null || (typeof v === 'number' && !isFinite(v))) ? null : Math.round(v * 100) / 100;
    });
  }

  var TREND4 = {
    AVERAGE: ['pts', 'darts'], FIRST9: ['f9p', 'f9d'], SCORING: ['scp', 'scd'],
    FINISH: ['finp', 'find'], CHECKOUT: ['chk_sum', 'chk_n']
  };

  function series4w(p, kind, lo, hi) {
    var key = String(kind || 'AVERAGE').replace(/\s+/g, '').toUpperCase();
    var keys = TREND4[key] || TREND4.AVERAGE;
    var ws = weeks().filter(function (w) {
      return (lo == null || w >= lo) && (hi == null || w <= hi);
    });

    return {
      weeks: ws,
      values: ws.map(function (w) {
        var qq = 0, dd = 0, hits = 0;
        for (var k = w - 3; k <= w; k++) {
          var t = sumRows(rows({ player: p, lo: k, hi: k }));
          if (t.n) { qq += t[keys[0]]; dd += t[keys[1]]; hits++; }
        }
        if (!hits) return null;
        var v = keys[0] === 'chk_sum' ? (dd ? qq / dd : null) : div(qq, dd) * 3;
        return v == null || !isFinite(v) ? null : Math.round(v * 100) / 100;
      })
    };
  }

  function weeklyPairs(p, lo, hi) {
    return weeks().filter(function (w) {
      return (lo == null || w >= lo) && (hi == null || w <= hi);
    }).map(function (w) {
      var t = sumRows(rows({ player: p, lo: w, hi: w }));
      if (!t.n) return null;
      return { x: Math.round(div(t.aus_on, t.darts) * 1.1 * 10000) / 10000,
               y: Math.round(div(t.tri, t.darts) * 10000) / 10000, label: 'W' + w };
    }).filter(function (v) { return v; });
  }

  function ampel(p) {
    var ms = playerMatches(p);
    var byW = {};
    ms.forEach(function (m) { (byW[m.w] = byW[m.w] || []).push(m); });
    var wks = Object.keys(byW).map(Number).sort(function (x, y) { return y - x; });
    var idx = {};
    wks.forEach(function (w, i) { idx[w] = i + 1; });
    var q = 0, d = 0;
    ms.forEach(function (m) {
      if (idx[m.w] <= 3) { q += m.pts; d += m.darts; }
    });
    var trent = div(q, d) * 3;
    var sall = sumRows(rows({ player: p }));
    var saison = div(sall.pts, sall.darts) * 3;
    if (!trent || !saison) return 0;
    var diff = trent - saison;
    if (diff >= 1.5) return 3;
    if (diff <= -1.5) return 1;
    return 2;
  }

  function rewind(p, lo, hi) {
    var t = sumRows(rows({ player: p, lo: lo, hi: hi }));
    var wset = {};
    rows({ player: p, lo: lo, hi: hi }).forEach(function (m) { wset[m.w] = 1; });
    var nw = Object.keys(wset).length;
    var w = 0, l = 0;
    rows({ player: p, lo: lo, hi: hi }).forEach(function (m) {
      if (m.lg === 3) w++;
      if (m.lv === 3) l++;
    });
    return [
      { icon: 'target', wert: nw, label: 'TEILNAHMEN' },
      { icon: 'vs', wert: t.n, label: 'SPIELE' },
      { icon: 'swords', wert: w + ' - ' + l, label: 'BILANZ' },
      { icon: 'dart', wert: compact(t.darts), label: 'GEWORFENE DARTS' }
    ];
  }

  function spielerView(p, lo, hi) {
    var t = sumRows(rows({ player: p, lo: lo, hi: hi }));
    var R2 = function (v) { return v == null ? null : Math.round(v * 100) / 100; };
    var bm = bestMatchAvg(p, lo, hi);
    var cards = [
      { titel: 'Average', wert: R2(div(t.pts, t.darts) * 3), sub: 'Saison' },
      { titel: 'First 9', wert: R2(div(t.f9p, t.f9d) * 3), sub: 'Saison' },
      { titel: 'Scoring', wert: R2(div(t.scp, t.scd) * 3), sub: 'Saison' },
      { titel: 'Finish', wert: R2(div(t.finp, t.find) * 3), sub: 'Saison' },
      { titel: 'Checkout', wert: R2(t.chk_n ? t.chk_sum / t.chk_n : 0), sub: 'Saison' },
      { titel: 'Best Leg', wert: t.bestleg, sub: '' },
      { titel: 'High Finish', wert: t.hfmax, sub: '' },
      { titel: 'Low Darter', wert: lowCount(p, lo, hi), sub: '' },
      { titel: 'High Finishes', wert: highCount(p, lo, hi), sub: '' },
      { titel: 'Highlights', wert: totalHighlights(p, lo, hi), sub: '' },
      { titel: 'Bester Spiel-Avg', wert: R2(bm ? bm.avg : null), sub: bm ? ('W' + bm.w + ' vs ' + bm.geg) : '' }
    ];
    var diffs = diffCards(p, lo, hi);
    var s2 = metrics(t);
    var s2cards = [
      { titel: 'Ausreißer', wert: R2(s2.ausreisser), pct: true },
      { titel: 'Gerade', wert: R2(s2.gerade), pct: true },
      { titel: 'Triple', wert: R2(s2.triple), pct: true },
      { titel: 'Anwurf gehalten', wert: R2(s2.anwurf), pct: true },
      { titel: 'Break', wert: R2(s2.gegen_anwurf), pct: true },
      { titel: 'Decider', wert: R2(s2.decider), pct: true }
    ];
    return { cards: cards, diffs: diffs, s2cards: s2cards };
  }

  function lowCount(p, lo, hi) {
    var hl = highlights(p, lo, hi);
    return hl.filter(function (h) { return h.typ === 'Low Dart'; }).length;
  }
  function highCount(p, lo, hi) {
    var hl = highlights(p, lo, hi);
    return hl.filter(function (h) { return h.typ === 'High Finish'; }).length;
  }
  function totalHighlights(p, lo, hi) {
    var hl = highlights(p, lo, hi), n = 0;
    hl.forEach(function (h) {
      if (h.typ === '180er' || h.typ === '171er') n += parseInt(h.wert, 10) || 0;
      else n += 1;
    });
    return n;
  }

  function diffCards(p, lo, hi, gruppe) {
    var wmax = hi != null ? hi : maxWeek();
    var w0 = Math.max(wmax - 3, lo != null ? lo : 1);
    function roll(keys) {
      var q = 0, d = 0;
      rows({ player: p, lo: w0, hi: wmax, gruppe: gruppe }).forEach(function (m) {
        var t = sumRows([m]);
        q += t[keys[0]]; d += t[keys[1]];
      });
      return { q: q, d: d };
    }
    function chkRoll() {
      var n = 0, s = 0;
      rows({ player: p, lo: w0, hi: wmax, gruppe: gruppe }).forEach(function (m) {
        (m.legf || []).forEach(function (F) { if (F > 0) { n++; s += F; } });
      });
      return { q: s, d: n };
    }
    var t = sumRows(rows({ player: p, lo: lo, hi: hi, gruppe: gruppe }));
    function cmp(cur, rq, rd, isChk) {
      var tr = isChk ? (rd ? rq / rd : 0) : div(rq, rd) * 3;
      // Leserichtung: Saison minus Trend (negativ = über dem Schnitt = gut)
      return Math.round((cur - tr) * 100) / 100;
    }
    var rAvg = roll(['pts', 'darts']), rF9 = roll(['f9p', 'f9d']), rSc = roll(['scp', 'scd']),
        rFi = roll(['finp', 'find']), rCh = chkRoll();
    var m = metrics(t);
    return [
      { titel: 'Ø Diff', wert: cmp(m.avg, rAvg.q, rAvg.d) },
      { titel: 'First-9 Diff', wert: cmp(m.first9, rF9.q, rF9.d) },
      { titel: 'Scoring Diff', wert: cmp(m.scoring, rSc.q, rSc.d) },
      { titel: 'Finish Diff', wert: cmp(m.finish, rFi.q, rFi.d) },
      { titel: 'Checkout Diff', wert: cmp(m.checkout, rCh.q, rCh.d, true) }
    ];
  }

  function vergleichView(lo, hi) {
    var head = ['Spieler', 'Spiele', 'Siege', 'Average', 'Best Leg', 'High Finish',
                'Decider %', 'U60 %', 'Gerade %', 'Triple %'];
    var arr = players().map(function (p) {
      var t = sumRows(rows({ player: p, lo: lo, hi: hi }));
      if (!t.n) return null;
      var m = metrics(t);
      function R2(v) { return v == null ? null : Math.round(v * 100) / 100; }
      function P2(v) { return v == null ? null : Math.round(v * 10000) / 100; }
      return [p, t.n, t.siege, R2(m.avg), t.bestleg, t.hfmax,
              P2(m.decider), P2(m.winrate_u60), P2(m.gerade), P2(m.triple)];
    }).filter(function (r) { return r; });
    return { headers: head, rows: arr };
  }

  function platzRows(gruppe) {
    if (!B || !B.platzierung) return [];
    return B.platzierung.filter(function (r) { return !gruppe || r.Gruppe === gruppe; });
  }

  function siegerView(gruppe) {
    var map = {};
    platzRows(gruppe).forEach(function (r) {
      if (Number(r.Platzierung) === 1) map[r.Name] = (map[r.Name] || 0) + 1;
    });
    return Object.keys(map).map(function (n) { return { Name: n, Gruppensiege: map[n] }; })
      .sort(function (x, y) { return (y.Gruppensiege - x.Gruppensiege) || (x.Name < y.Name ? -1 : 1); });
  }

  function teilnahmenView(gruppe) {
    var map = {};
    platzRows(gruppe).forEach(function (r) {
      (map[r.Name] = map[r.Name] || {})[r.Datum || r.Spieltag] = 1;
    });
    return Object.keys(map).map(function (n) { return { Name: n, Gruppenteilnahmen: Object.keys(map[n]).length }; })
      .sort(function (x, y) { return (y.Gruppenteilnahmen - x.Gruppenteilnahmen) || (x.Name < y.Name ? -1 : 1); });
  }

  function spieltagView(gruppe, spieltag) {
    var ps = players().filter(function (p) {
      return rows({ player: p, lo: spieltag, hi: spieltag, gruppe: gruppe }).length > 0;
    });
    var arr = ps.map(function (p) {
      var t = sumRows(rows({ player: p, lo: spieltag, hi: spieltag, gruppe: gruppe }));
      var score = t.siege * 3 * 1000000 + t.siege * 10000 +
        ((t.lg - t.lv) + 100) * 100 + t.lg;
      return { Spieler: p, Punkte: t.siege * 3, Win: t.siege,
               Lose: t.n - t.siege, Legs: t.lg + ' - ' + t.lv, _s: score };
    });
    arr.sort(function (x, y) { return (y._s - x._s) || (x.Spieler < y.Spieler ? -1 : 1); });
    var out = [], last = null, rank = 0;
    arr.forEach(function (r, i) {
      if (last == null || r._s !== last) { rank = i + 1; last = r._s; }
      out.push({ Platz: rank, Spieler: r.Spieler, Punkte: r.Punkte, Win: r.Win, Lose: r.Lose, Legs: r.Legs });
    });
    return out;
  }

  function cutoffView(gruppe, spieltag) {
    var mw = maxWeek();
    var pset = {};
    rows({}).forEach(function (m) {
      if ((!gruppe || m.gr === gruppe) && (spieltag == null || m.w === spieltag)) pset[m.sp] = 1;
    });
    var best = null;
    Object.keys(pset).forEach(function (p) {
      var t = sumRows(rows({ player: p, lo: mw - 2, hi: mw }));
      if (!t.n) return;
      var v = div(t.pts, t.darts) * 3;
      if (best == null || v < best) best = v;
    });
    return best == null ? null : Math.round(best * 100) / 100;
  }

  function gruppenView(g, st, lo, hi) {
    var cards = [
      { titel: 'Cutoff', wert: cutoffView(g, st), sub: g },
      { titel: 'Weekly Avg', wert: (function () {
          var t = sumRows(rows({ lo: st, hi: st, gruppe: g }));
          var v = div(t.pts, t.darts) * 3;
          return Math.round(v * 100) / 100;
        })(), sub: 'Spieltag ' + st },
      { titel: 'Highlights', wert: (function () {
          var n = 0;
          rows({ lo: st, hi: st, gruppe: g }).forEach(function (m) {
            n += num(m.f180) + num(m.f171);
            (m.low || []).forEach(function () { n += 1; });
          });
          return n;
        })(), sub: 'Spieltag ' + st }
    ];
    var ws = weeks().filter(function (w) {
      return (lo == null || w >= lo) && (hi == null || w <= hi);
    });
    var vals = ws.map(function (w) {
      var t = sumRows(rows({ lo: w, hi: w, gruppe: g }));
      return t.n ? Math.round(div(t.pts, t.darts) * 300) / 100 : null;
    });
    return {
      sieger: siegerView(g), teilnahmen: teilnahmenView(g), spieltag: spieltagView(g, st),
      cards: cards, verlauf: { cats: ws.map(function (w) { return 'W' + w; }), series: [{ name: g, values: vals }] }
    };
  }

  /* Gruppen-Pendant zu spielerView: Averages + Diffs + Highlights einer Gruppe */
  function gruppenHighlights(g, lo, hi) {
    var out = [];
    rows({ lo: lo, hi: hi, gruppe: g }).forEach(function (m) {
      (m.low || []).forEach(function (L) {
        out.push({ w: m.w, sp: m.sp, geg: m.geg, typ: 'Low Dart', wert: L.d + ' Darts' });
      });
      (m.legf || []).forEach(function (F) {
        if (F >= 100) out.push({ w: m.w, sp: m.sp, geg: m.geg, typ: 'High Finish', wert: String(F) });
      });
      if (m.f180 > 0) out.push({ w: m.w, sp: m.sp, geg: m.geg, typ: '180er', wert: String(m.f180) });
      if (m.f171 > 0) out.push({ w: m.w, sp: m.sp, geg: m.geg, typ: '171er', wert: String(m.f171) });
    });
    out.sort(function (x, y) { return (y.w - x.w) || (x.sp < y.sp ? -1 : 1); });
    return out;
  }

  function gruppenAverages(g, lo, hi) {
    var t = sumRows(rows({ lo: lo, hi: hi, gruppe: g }));
    var R2 = function (v) { return v == null ? null : Math.round(v * 100) / 100; };
    var bm = bestMatchAvg(null, lo, hi, g);
    var hl = gruppenHighlights(g, lo, hi);
    function cnt(typ) { return hl.filter(function (h) { return h.typ === typ; }).length; }
    var tot = 0;
    hl.forEach(function (h) {
      if (h.typ === '180er' || h.typ === '171er') tot += parseInt(h.wert, 10) || 0;
      else tot += 1;
    });
    var cards = [
      { titel: 'Average', wert: R2(div(t.pts, t.darts) * 3), sub: 'Saison' },
      { titel: 'First 9', wert: R2(div(t.f9p, t.f9d) * 3), sub: 'Saison' },
      { titel: 'Scoring', wert: R2(div(t.scp, t.scd) * 3), sub: 'Saison' },
      { titel: 'Finish', wert: R2(div(t.finp, t.find) * 3), sub: 'Saison' },
      { titel: 'Checkout', wert: R2(t.chk_n ? t.chk_sum / t.chk_n : 0), sub: 'Saison' },
      { titel: 'Best Leg', wert: t.bestleg, sub: '' },
      { titel: 'High Finish', wert: t.hfmax, sub: '' },
      { titel: 'Low Darter', wert: cnt('Low Dart'), sub: '' },
      { titel: 'High Finishes', wert: cnt('High Finish'), sub: '' },
      { titel: 'Highlights', wert: tot, sub: '' },
      { titel: 'Bester Spiel-Avg', wert: R2(bm ? bm.avg : null), sub: bm ? (bm.sp + ' · W' + bm.w) : '' }
    ];
    return { cards: cards, diffs: diffCards(null, lo, hi, g), highlights: hl };
  }

  function highlights(p, lo, hi) {
    var out = [];
    rows({ player: p, lo: lo, hi: hi }).forEach(function (m) {
      (m.low || []).forEach(function (L) {
        out.push({ w: m.w, geg: m.geg, typ: 'Low Dart', wert: L.d + ' Darts' });
      });
      (m.legf || []).forEach(function (F) {
        if (F >= 100) out.push({ w: m.w, geg: m.geg, typ: 'High Finish', wert: String(F) });
      });
      if (m.f180 > 0) out.push({ w: m.w, geg: m.geg, typ: '180er', wert: String(m.f180) });
      if (m.f171 > 0) out.push({ w: m.w, geg: m.geg, typ: '171er', wert: String(m.f171) });
    });
    out.sort(function (x, y) { return (y.w - x.w) || (x.geg < y.geg ? -1 : 1); });
    return out;
  }

  /* Checkout-Bingo-Raster (wie Power BI): je Zahl Treffer, Spieler, Top-Spieler */
  var BINGO_NIX = [159, 162, 163, 165, 166, 168, 169];
  function bingoGrid(p, lo, hi) {
    var rs = rows({ player: (p && p !== 'Alle' ? p : null), lo: lo, hi: hi });
    var map = {};
    rs.forEach(function (m) {
      (m.legf || []).forEach(function (F) {
        F = Math.round(Number(F));
        if (!(F >= 2 && F <= 170) || BINGO_NIX.indexOf(F) !== -1) return;
        var c = map[F] || (map[F] = { hits: 0, by: {} });
        c.hits++;
        c.by[m.sp] = (c.by[m.sp] || 0) + 1;
      });
    });
    var cells = [];
    for (var n = 2; n <= 170; n++) {
      if (BINGO_NIX.indexOf(n) !== -1) continue;
      var c = map[n], top = null, topN = 0;
      if (c) Object.keys(c.by).forEach(function (sp) {
        if (c.by[sp] > topN) { topN = c.by[sp]; top = sp; }
      });
      cells.push({ n: n, hits: c ? c.hits : 0, top: top,
                   players: c ? Object.keys(c.by).sort() : [] });
    }
    return { cells: cells,
             distinct: cells.filter(function (c) { return c.hits > 0; }).length,
             total: cells.length };
  }

  function bingo(lo, hi) {
    var per = {};
    rows({ lo: lo, hi: hi }).forEach(function (m) {
      (m.legf || []).forEach(function (F) {
        if (F >= 2 && F <= 170 && [159, 162, 163, 165, 166, 168, 169].indexOf(F) === -1) {
          (per[m.sp] = per[m.sp] || {})[F] = 1;
        }
      });
    });
    var all = {}, arr = [];
    Object.keys(per).forEach(function (p) {
      var n = Object.keys(per[p]).length;
      arr.push([p, n]);
      Object.keys(per[p]).forEach(function (f) { all[f] = 1; });
    });
    arr.sort(function (x, y) { return (y[1] - x[1]) || (x[0] < y[0] ? -1 : 1); });
    return { total: Object.keys(all).length, rows: arr };
  }

  /* Formatierung */
  function fmtDE(v, dec) {
    if (v == null || v === '' || !isFinite(Number(v))) return v == null ? '–' : String(v);
    return Number(v).toLocaleString('de-DE', { maximumFractionDigits: dec != null ? dec : 2 });
  }
  function pct(x, dec) {
    if (x == null || !isFinite(Number(x))) return '–';
    return (Number(x) * 100).toLocaleString('de-DE', { maximumFractionDigits: dec != null ? dec : 2 }) + ' %';
  }
  function fmtInt(v) {
    if (v == null || !isFinite(Number(v))) return '–';
    return Math.round(Number(v)).toLocaleString('de-DE');
  }
  function compact(v) {
    if (v == null || !isFinite(Number(v))) return '–';
    var f = Number(v), af = Math.abs(f);
    if (af >= 1e9) return Math.round(f / 1e9) + 'B';
    if (af >= 1e6) return Math.round(f / 1e6) + 'M';
    if (af >= 1000 && Math.round(f) === f) return Math.round(f / 1e3) + 'K';
    return Number.isInteger(f) ? fmtInt(f) : fmtDE(f);
  }

  window.DK_ENGINE = {
    init: init, weeks: weeks, players: players, groups: groups, maxWeek: maxWeek,
    rows: rows, sumRows: sumRows, metrics: metrics, scoped: function (p, lo, hi, g) { return metrics(sumRows(rows({ player: p, lo: lo, hi: hi, gruppe: g }))); },
    h2h: h2h, podium: podium, topNames: topNames, rennen: rennen, wochen: wochen, weeklyMetric: weeklyMetric,
    series4w: series4w, weeklyPairs: weeklyPairs, ampel: ampel, rewind: rewind,
    spielerView: spielerView, vergleichView: vergleichView, gruppenView: gruppenView,
    gruppenAverages: gruppenAverages, gruppenHighlights: gruppenHighlights,
    cutoffView: cutoffView, spieltagView: spieltagView, siegerView: siegerView,
    teilnahmenView: teilnahmenView,
    highlights: highlights, bingo: bingo, bingoGrid: bingoGrid, lastK: lastK, form5: form5, form5tage: form5tage,
    winprob: winprob, checkoutDonut: checkoutDonut, cats: CATS, catColors: CAT_COLORS, catOf: catOf,
    playerMatches: function (p) {
      return rows({ player: p }).slice().sort(function (x, y) {
        return (y.w - x.w) || String(y.id).localeCompare(String(x.id));
      });
    },
    fmtDE: fmtDE, pct: pct, fmtInt: fmtInt, compact: compact
  };
})();
