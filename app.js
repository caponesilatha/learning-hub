/* Learning Hub: sito statico, nessuna dipendenza da Claude.
   Contenuti: weeks/*.js  ·  Profilo e prossima settimana: profile.js  ·  Progressi: localStorage. */
(function () {
  "use strict";
  var HUB = window.HUB || {};
  var WEEKS = window.WEEKS = window.WEEKS || [];
  var app = document.getElementById("app");
  var tabs = document.getElementById("tabs");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ testi dei moduli (per lingua della settimana) */
  var T = {
    en: {
      gotIt: "Got it", practice: "In practice: ", listen: "Listen", stop: "Stop", listenAria: "Listen to this stop",
      tapCards: "Tap the cards: {a} of {b}", seenAll: "You've seen them all.",
      tapFirst: "First tap an item above.", right: "Correct.", allSorted: "All sorted.", tryAgain: "Not that one: try again.",
      nowTap: "Now tap where “{x}” goes.", rightNext: "Right, keep going.", orderDone: "Perfect order.", orderWrong: "Not yet. Think about which comes next.",
      question: "Question {a} of {b}", recap: "Recap {a} of {b}", next: "Next", last: "Done", notQuite: "Not quite. ",
      allCorrect: "All correct. Nice work.", score: "You got {a} of {b} right.", perfect: " Perfect.", scoreLow: " Revisit the map: it gets easier next time.",
      cmpIntro: "Tap each row to compare.", cmpHint: "tap to reveal", rangePick: "Tap a bar or a button.", thin: "low", thick: "high",
      labelPick: "Tap a part to see what it means.", mapIntro: "Review the map. If a word means nothing now, go back to that stop.", mapDay: "Day", mapDone: "Close the day",
      finalIntro: "The whole week at a glance. Each row reopens that day's map.", finalDone: "Finish the week",
      nextStop: "Next stop", toExtras: "Go to the extras", min: "min", dayDone: "Day {n} complete",
      dayDoneNext: "Let it settle. Tomorrow starts with a quick recap.", dayDoneLast: "Week complete. Your check-in is waiting in the Me tab.",
      goDay: "Go to day {n}", goMe: "Open the check-in", extrasH: "Extras, if you still have energy",
      extrasHint: "Short videos and readings on the same topic. They open in a new tab.",
      extrasNote: "These were found by search and not watched by me. If one doesn't suit you, use a ready-made search.",
      kVideo: "Video", kSearch: "Search YouTube", kRead: "Read",
      recapDay: "Quick recap of yesterday", recapWeek: "Recap from last week"
    },
    it: {
      gotIt: "Ci sono", practice: "In pratica: ", listen: "Ascolta", stop: "Stop", listenAria: "Ascolta questa tappa",
      tapCards: "Tocca le carte: {a} di {b}", seenAll: "Le hai viste tutte.",
      tapFirst: "Prima tocca un elemento in alto.", right: "Giusto.", allSorted: "Tutto smistato.", tryAgain: "Non è questa: riprova.",
      nowTap: "Ora tocca dove va «{x}».", rightNext: "Giusto, avanti.", orderDone: "Ordine perfetto.", orderWrong: "Non ancora. Pensa a quale viene dopo.",
      question: "Domanda {a} di {b}", recap: "Ripasso {a} di {b}", next: "Avanti", last: "Fine", notQuite: "Non proprio. ",
      allCorrect: "Tutte giuste. Ottimo lavoro.", score: "Hai risposto bene a {a} su {b}.", perfect: " Perfetto.", scoreLow: " Ripassa le mappe: la prossima volta sarà più facile.",
      cmpIntro: "Tocca ogni riga per confrontare.", cmpHint: "tocca per scoprire", rangePick: "Tocca una barra o un pulsante.", thin: "poco", thick: "molto",
      labelPick: "Tocca una zona per scoprire cosa significa.", mapIntro: "Ripassa guardando la mappa. Se una parola non ti dice più nulla, torna alla tappa.", mapDay: "Giorno", mapDone: "Chiudi il giorno",
      finalIntro: "Questa è tutta la settimana. Ogni riga riapre la mappa del giorno.", finalDone: "Chiudi la settimana",
      nextStop: "Tappa successiva", toExtras: "Vai agli extra", min: "min", dayDone: "Giorno {n} completato",
      dayDoneNext: "Ora lascia lavorare la memoria. Domani si riparte con un ripasso lampo.", dayDoneLast: "Settimana finita. Il check-in ti aspetta nella scheda Me.",
      goDay: "Vai al giorno {n}", goMe: "Apri il check-in", extrasH: "Extra, se hai ancora energia",
      extrasHint: "Video brevi e letture sullo stesso tema. Si aprono in una nuova scheda.",
      extrasNote: "Li ho trovati con una ricerca ma non li ho guardati: se uno non ti piace, usa la ricerca pronta.",
      kVideo: "Video", kSearch: "Cerca su YouTube", kRead: "Lettura",
      recapDay: "Ripasso lampo di ieri", recapWeek: "Ripasso della settimana scorsa"
    }
  };
  var L = "en";
  function t(k, v) {
    var s = (T[L] && T[L][k]) || T.en[k] || k;
    if (v) Object.keys(v).forEach(function (x) { s = s.split("{" + x + "}").join(v[x]); });
    return s;
  }

  /* ------------------------------------------------------------ utilità */
  function h(tag, attrs) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") e.className = v; else if (k === "html") e.innerHTML = v; else e.setAttribute(k, v === true ? "" : v);
    });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, k) {
    if (k === null || k === undefined || k === false) return;
    if (Array.isArray(k)) { k.forEach(function (x) { add(e, x); }); return; }
    e.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
  function on(el, ev, fn) { el.addEventListener(ev, fn); return el; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); setTimeout(function () { el.classList.remove("shake"); }, 450); }
  function svgFrom(s) { var tp = document.createElement("template"); tp.innerHTML = s.trim(); return tp.content.firstChild; }
  function scrollToEl(el) { try { el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); } catch (e) { el.scrollIntoView(); } }
  function fmtDate(iso) { try { return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); } catch (e) { return iso; } }

  /* ------------------------------------------------------------ dati e progresso (localStorage) */
  var KEY = "learning-hub-v1";
  var mem = { done: {}, fb: {}, nfb: {} };
  try { var raw = localStorage.getItem(KEY); if (raw) { var p = JSON.parse(raw); mem.done = p.done || {}; mem.fb = p.fb || {}; mem.nfb = p.nfb || {}; } } catch (e) { /* ignora */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* ignora */ } }
  function nkey(w, d, i) { return w.id + "-d" + d + "-n" + i; }

  WEEKS.sort(function (a, b) { return a.n - b.n; });
  function curWeek() { return WEEKS[WEEKS.length - 1]; }
  function weekById(id) { for (var i = 0; i < WEEKS.length; i++) if (WEEKS[i].id === id) return WEEKS[i]; return null; }

  function buildNodes(week, day) {
    var out = [], qn = null, title = "";
    L = week.lang || "en";
    if (day.n > 1) {
      var prev = week.days[day.n - 2];
      qn = prev.nodes.filter(function (x) { return x.type === "quiz" && !x.retry; }).pop(); title = t("recapDay");
    } else {
      var idx = WEEKS.indexOf(week);
      if (idx > 0) {
        var pw = WEEKS[idx - 1], pd = pw.days[pw.days.length - 1];
        qn = pd.nodes.filter(function (x) { return x.type === "quiz" && !x.retry; }).pop(); title = t("recapWeek");
      }
    }
    if (qn) out.push({ type: "quiz", title: title, min: 1, review: true, qs: qn.qs.slice(0, 2) });
    return out.concat(day.nodes);
  }
  function dayMin(week, day) { return buildNodes(week, day).reduce(function (a, n) { return a + n.min; }, 0); }
  function dayStats(week, day) {
    var ns = buildNodes(week, day), c = 0;
    ns.forEach(function (_, i) { if (mem.done[nkey(week, day.n, i)]) c++; });
    return { done: c, total: ns.length };
  }
  function weekStats(week) {
    var d = 0, tot = 0, full = 0;
    week.days.forEach(function (day) { var s = dayStats(week, day); d += s.done; tot += s.total; if (s.done === s.total) full++; });
    return { done: d, total: tot, days: full };
  }

  /* ------------------------------------------------------------ icone e disegni */
  var ICON = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ic-line" d="M5 12.5l5 5 9-11"/></svg>',
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ic-line" d="M15 5l-7 7 7 7"/></svg>',
    down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ic-line" d="M6 9l6 6 6-6"/></svg>',
    up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ic-line" d="M7 11l5-6 5 6M12 5v14"/></svg>',
    thumbUp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ic-line" d="M7 11v9H4v-9zM7 11l4-7c2 0 3 1 3 3l-1 3h6c1 0 2 1 2 2l-1.5 6c-.3 1-1 2-2.2 2H7"/></svg>',
    thumbDown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ic-line" d="M7 13V4H4v9zM7 13l4 7c2 0 3-1 3-3l-1-3h6c1 0 2-1 2-2l-1.5-6C19.2 5 18.5 4 17.3 4H7"/></svg>',
    leaf: '<svg viewBox="0 0 48 48" aria-hidden="true"><path class="ic" d="M8 40C8 20 22 8 42 6c0 20-12 32-30 34z"/><path class="ic-line" d="M12 36 30 18"/></svg>',
    paw: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="ic" cx="24" cy="32" r="9"/><circle class="ic" cx="11" cy="22" r="4.5"/><circle class="ic" cx="20" cy="13" r="4.5"/><circle class="ic" cx="30" cy="13" r="4.5"/><circle class="ic" cx="38" cy="22" r="4.5"/></svg>'
  };
  var CARE = {
    tub: '<svg viewBox="0 0 56 56" aria-hidden="true"><path class="sym" d="M8 16h40l-5 24H13z"/><path class="sym" d="M15 25q4-4 8 0t8 0 8 0"/></svg>',
    dry: '<svg viewBox="0 0 56 56" aria-hidden="true"><rect class="sym" x="10" y="10" width="36" height="36" rx="3"/><circle class="sym" cx="28" cy="28" r="12"/></svg>',
    iron: '<svg viewBox="0 0 56 56" aria-hidden="true"><path class="sym" d="M8 42h40l-6-20H22c-8 0-14 7-14 20z"/></svg>',
    bleach: '<svg viewBox="0 0 56 56" aria-hidden="true"><path class="sym" d="M28 10 49 46H7z"/></svg>',
    clean: '<svg viewBox="0 0 56 56" aria-hidden="true"><circle class="sym" cx="28" cy="28" r="18"/></svg>'
  };
  function mascot(cls) {
    return svgFrom('<svg class="mascot ' + (cls || "") + '" viewBox="0 0 84 84" aria-hidden="true">' +
      '<circle class="m-body" cx="40" cy="42" r="30"/><path class="m-thread" d="M14 34c14-10 38-10 52 0M11 48c16-8 42-8 58 0M19 62c12-6 30-6 42 0"/>' +
      '<path class="m-tail" d="M64 62c12 2 14 14 2 17"/><circle class="m-eye" cx="30" cy="42" r="4.6"/><circle class="m-eye" cx="50" cy="42" r="4.6"/>' +
      '<circle class="m-shine" cx="31.6" cy="40.4" r="1.4"/><circle class="m-shine" cx="51.6" cy="40.4" r="1.4"/><path class="m-mouth" d="M33 53q7 6 14 0"/></svg>');
  }
  function fibersSvg(mode) {
    var s = 11, r = function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }, p = "";
    for (var i = 0; i < 12; i++) {
      if (mode === "parallel") { var y = 8 + i * 5; p += '<path class="fib" d="M6 ' + y + "q54 " + (i % 2 ? -3 : 3) + ' 108 0"/>'; }
      else {
        var x = 10 + r() * 100, yy = 8 + r() * 54, a = r() * Math.PI, l = 22 + r() * 22, dx = Math.cos(a) * l / 2, dy = Math.sin(a) * l / 2;
        p += '<path class="fib" d="M' + (x - dx).toFixed(1) + " " + (yy - dy).toFixed(1) + "q" + (dx * 0.8).toFixed(1) + " -6 " + (2 * dx).toFixed(1) + " " + (2 * dy).toFixed(1) + '"/>';
      }
    }
    return '<svg viewBox="0 0 120 70" aria-hidden="true">' + p + "</svg>";
  }
  function iconFor(n) { return (n === "random" || n === "parallel") ? fibersSvg(n) : (ICON[n] || ""); }

  /* ------------------------------------------------------------ componenti dei moduli */
  function doneButton(ctx, label) { var b = h("button", { class: "btn", type: "button" }, label || t("gotIt")); on(b, "click", function () { b.disabled = true; ctx.done(true); }); return b; }

  function cHook(nd, ctx) {
    var box = h("div", { class: "hook" },
      h("div", { class: "hook-row" }, mascot(), h("div", { class: "bubble" }, h("p", null, nd.text))),
      nd.practice ? h("p", { class: "practice" }, h("b", null, t("practice")), nd.practice) : null);
    box.append(doneButton(ctx));
    return box;
  }

  function cCards(nd, ctx) {
    var seen = 0, n = nd.items.length;
    var counter = h("p", { class: "counter", "aria-live": "polite" }, t("tapCards", { a: 0, b: n }));
    var grid = h("div", { class: "cards" });
    nd.items.forEach(function (it) {
      var front = h("span", { class: "c-title" }, it.svg ? svgFrom(CARE[it.svg]) : null, it.t);
      var back = h("span", { class: "c-back" }, h("span", { class: "c-desc" }, it.d), it.use ? h("span", { class: "c-use" }, h("b", null, t("practice")), it.use) : null);
      var b = h("button", { class: "card-flip", type: "button", "aria-expanded": "false" }, front, back), first = true;
      on(b, "click", function () {
        var open = b.getAttribute("aria-expanded") === "true";
        b.setAttribute("aria-expanded", open ? "false" : "true"); b.classList.toggle("open", !open);
        if (first) { first = false; seen++; counter.textContent = seen < n ? t("tapCards", { a: seen, b: n }) : t("seenAll"); if (seen === n) ctx.done(); }
      });
      grid.append(b);
    });
    var box = h("div", { class: "cardsbox" });
    box.append(counter, grid);
    if (nd.note) box.append(h("p", { class: "note" }, nd.note));
    return box;
  }

  function cSort(nd, ctx) {
    var items = shuffle(nd.items.map(function (it) { return { t: it.t, b: it.b }; })), sel = null, left = items.length;
    var msg = h("p", { class: "fb", "aria-live": "polite" }), pool = h("div", { class: "pool" }), bw = h("div", { class: "buckets" });
    nd.buckets.forEach(function (name, bi) {
      var placed = h("span", { class: "placed" });
      var btn = h("button", { class: "bucket", type: "button" }, h("span", { class: "bname" }, name), placed);
      on(btn, "click", function () {
        if (!sel) { msg.className = "fb"; msg.textContent = t("tapFirst"); return; }
        if (sel.it.b === bi) {
          placed.append(h("span", { class: "tag" }, sel.it.t)); sel.el.remove(); left--; sel = null;
          msg.className = "fb ok"; msg.textContent = left ? t("right") : t("allSorted"); if (!left) ctx.done();
        } else {
          shake(btn); msg.className = "fb bad"; msg.textContent = (nd.hints && nd.hints[sel.it.t]) || t("tryAgain");
          sel.el.classList.remove("sel"); sel = null;
        }
      });
      bw.append(btn);
    });
    items.forEach(function (it) {
      var el = h("button", { class: "chip", type: "button" }, it.t);
      on(el, "click", function () {
        if (sel && sel.el === el) { el.classList.remove("sel"); sel = null; msg.textContent = ""; return; }
        if (sel) sel.el.classList.remove("sel");
        sel = { it: it, el: el }; el.classList.add("sel"); msg.className = "fb"; msg.textContent = t("nowTap", { x: it.t });
      });
      pool.append(el);
    });
    return h("div", { class: "sort" }, h("p", { class: "intro" }, nd.intro), pool, bw, msg);
  }

  function cOrder(nd, ctx) {
    var items = nd.items.map(function (it, i) { return { t: it.t, lvl: it.lvl, i: i }; }), next = 0;
    var line = h("div", { class: "line" }), pool = h("div", { class: "pool" }), msg = h("p", { class: "fb", "aria-live": "polite" });
    shuffle(items.slice()).forEach(function (it) {
      var el = h("button", { class: "chip", type: "button" }, it.t);
      on(el, "click", function () {
        if (it.i === next) {
          var bar = h("span", { class: "bar" }); bar.style.height = (3 + it.lvl * 3) + "px";
          line.append(h("div", { class: "row" }, h("span", { class: "rt" }, it.t), bar)); el.remove(); next++;
          msg.className = "fb ok"; msg.textContent = next < items.length ? t("rightNext") : (nd.doneMsg || t("orderDone")); if (next === items.length) ctx.done();
        } else { shake(el); msg.className = "fb bad"; msg.textContent = nd.wrongMsg || t("orderWrong"); }
      });
      pool.append(el);
    });
    return h("div", { class: "order" }, h("p", { class: "intro" }, nd.intro), pool, line, msg);
  }

  function normQ(q) {
    if (typeof q.o[0] === "string") return { q: q.q, why: q.why, opts: q.o.map(function (s, i) { return { t: s, ok: i === q.a }; }) };
    return { q: q.q, why: "", opts: q.o.map(function (o) { return { t: o.t, ok: !!o.ok, why: o.why }; }) };
  }
  function cQuiz(nd, ctx) {
    var qs = nd.qs.map(normQ), i = 0, score = 0, box = h("div", { class: "quiz" });
    function render() {
      box.innerHTML = "";
      if (i >= qs.length) {
        box.append(h("p", { class: "result" }, nd.retry ? t("allCorrect") : t("score", { a: score, b: qs.length }) + (score === qs.length ? t("perfect") : t("scoreLow"))));
        ctx.done(); return;
      }
      var q = qs[i], pairs = shuffle(q.opts.slice()), fb = h("p", { class: "fb", "aria-live": "polite" }), list = h("div", { class: "opts" });
      var next = h("button", { class: "btn", type: "button" }, i === qs.length - 1 ? t("last") : t("next")); next.hidden = true;
      on(next, "click", function () { i++; render(); });
      var btns = [], locked = false, first = true;
      pairs.forEach(function (o) {
        var b = h("button", { class: "opt", type: "button" }, o.t); btns.push({ b: b, o: o });
        on(b, "click", function () {
          if (locked || b.disabled) return;
          if (o.ok) {
            b.classList.add("ok"); locked = true; if (first) score++;
            fb.className = "fb ok"; fb.textContent = o.why || q.why; btns.forEach(function (x) { x.b.disabled = true; }); next.hidden = false;
          } else {
            first = false; b.classList.add("bad"); b.disabled = true; shake(b);
            if (nd.retry) { fb.className = "fb bad"; fb.textContent = o.why || t("tryAgain"); }
            else {
              locked = true; btns.forEach(function (x) { x.b.disabled = true; if (x.o.ok) x.b.classList.add("ok"); });
              fb.className = "fb bad"; fb.textContent = t("notQuite") + q.why; next.hidden = false;
            }
          }
        });
        list.append(b);
      });
      box.append(h("p", { class: "qcount" }, t(nd.review ? "recap" : "question", { a: i + 1, b: qs.length })), h("p", { class: "qtext" }, q.q), list, fb, next);
    }
    render(); return box;
  }

  function cCompare(nd, ctx) {
    var seen = {}, count = 0, total = nd.rows.length;
    var head = h("div", { class: "cmp-head" },
      h("div", { class: "cmp-col a" }, h("span", { class: "cmp-ic", html: iconFor(nd.a.icon) }), h("b", null, nd.a.name)),
      h("div", { class: "cmp-col b" }, h("span", { class: "cmp-ic", html: iconFor(nd.b.icon) }), h("b", null, nd.b.name)));
    var rows = h("div", { class: "cmp-rows" });
    nd.rows.forEach(function (r, ri) {
      var row = h("button", { class: "cmp-row", type: "button", "aria-expanded": "false", "data-hint": t("cmpHint") },
        h("span", { class: "cmp-k", "data-hint": t("cmpHint") }, r.k), h("span", { class: "cmp-v a" }, r.a), h("span", { class: "cmp-v b" }, r.b));
      on(row, "click", function () { row.classList.add("open"); row.setAttribute("aria-expanded", "true"); if (!seen[ri]) { seen[ri] = true; count++; if (count === total) ctx.done(); } });
      rows.append(row);
    });
    return h("div", { class: "compare" }, h("p", { class: "intro" }, t("cmpIntro")), head, rows, nd.note ? h("p", { class: "note" }, nd.note) : null);
  }

  function cRanges(nd, ctx) {
    var x0 = 24, x1 = 304, lo = nd.min0, hi = nd.max0, X = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };
    var svg = '<svg viewBox="0 0 320 ' + (40 + nd.items.length * 46 + 34) + '" class="ranges" role="img" aria-label="' + (nd.unit || "") + '">';
    nd.items.forEach(function (it, i) {
      var y = 34 + i * 46;
      svg += '<text class="r-label" x="' + x0 + '" y="' + (y - 8) + '">' + it.t + '</text><rect class="r-track" x="' + x0 + '" y="' + y + '" width="' + (x1 - x0) + '" height="22" rx="11"/>' +
        '<rect class="r-bar" data-i="' + i + '" x="' + X(it.from).toFixed(1) + '" y="' + y + '" width="' + (X(it.to) - X(it.from)).toFixed(1) + '" height="22" rx="11"/>';
    });
    var ay = 34 + nd.items.length * 46 + 6, step = nd.step || 10;
    for (var v = lo; v <= hi; v += step) svg += '<path class="r-tick" d="M' + X(v) + " " + ay + 'v6"/><text class="r-num" x="' + X(v) + '" y="' + (ay + 22) + '">' + v + "</text>";
    svg += '<text class="r-unit" x="' + x1 + '" y="14">' + (nd.unit || "") + '</text><text class="r-edge" x="' + x0 + '" y="14">' + (nd.edge || "") + "</text></svg>";
    var info = h("p", { class: "fb", "aria-live": "polite" }, t("rangePick")), seen = {}, cnt = 0, el = svgFrom(svg), bars = el.querySelectorAll(".r-bar");
    function pick(i) {
      bars.forEach(function (b, bi) { b.classList.toggle("on", bi === i); });
      info.className = "fb ok"; info.textContent = nd.items[i].d;
      if (!seen[i]) { seen[i] = true; cnt++; if (cnt === nd.items.length) ctx.done(); }
    }
    bars.forEach(function (b, i) { on(b, "click", function () { pick(i); }); });
    var btns = h("div", { class: "seg" });
    nd.items.forEach(function (it, i) { btns.append(on(h("button", { type: "button" }, it.t), "click", function () { pick(i); })); });
    return h("div", { class: "rangebox" }, h("p", { class: "intro" }, nd.intro), el, btns, info, nd.note ? h("p", { class: "note" }, nd.note) : null);
  }

  function cSlider(nd, ctx) {
    var seen = {}, cnt = 0, len = nd.levels.length, need = Math.min(6, len);
    var out = h("div", { class: "w-out", "aria-live": "polite" }), preview = h("div", { class: "w-preview" });
    var input = h("input", { type: "range", min: "0", max: String(len - 1), step: "1", value: "0", id: "wslider", "aria-label": nd.title });
    function show(i) {
      var lv = nd.levels[i];
      if (nd.visual === "bar") {
        preview.innerHTML = '<svg viewBox="0 0 300 40" aria-hidden="true"><rect class="r-track" x="10" y="10" width="280" height="20" rx="10"/><rect class="r-bar on" x="10" y="10" width="' + (280 * (i + 1) / len).toFixed(1) + '" height="20" rx="10"/></svg>';
      } else {
        var sw = (2 + i * (22.4 / Math.max(1, len - 1))).toFixed(1);
        preview.innerHTML = '<svg viewBox="0 0 300 70" aria-hidden="true"><path class="thread" stroke-width="' + sw + '" d="M14 36C60 8 100 64 150 36S250 8 286 36"/></svg>';
      }
      out.innerHTML = "";
      out.append(h("div", { class: "w-title" }, h("span", { class: "w-num" }, String(lv.n !== undefined ? lv.n : i + 1)), h("b", null, lv.t), lv.alias ? h("span", { class: "w-alias" }, lv.alias) : null),
        h("p", null, lv.d),
        lv.facts && lv.facts.length ? h("ul", { class: "w-facts" }, lv.facts.map(function (f) { return h("li", null, h("b", null, f.k + ": "), f.v); })) : null);
      if (!seen[i]) { seen[i] = true; cnt++; if (cnt >= need) ctx.done(); }
    }
    on(input, "input", function () { show(parseInt(input.value, 10)); });
    show(0);
    return h("div", { class: "weights" }, h("p", { class: "intro" }, nd.intro), preview,
      h("div", { class: "w-range" }, h("span", null, nd.lo || t("thin")), input, h("span", null, nd.hi || t("thick"))), out, nd.note ? h("p", { class: "note" }, nd.note) : null);
  }

  function plySvg(n) {
    var b = '<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="pc-out" cx="60" cy="60" r="52"/>';
    if (n === 1) b += '<circle class="pc" cx="60" cy="60" r="34"/>';
    if (n === 2) b += '<circle class="pc" cx="36" cy="60" r="24"/><circle class="pc" cx="84" cy="60" r="24"/>';
    if (n === 3) b += '<circle class="pc" cx="60" cy="36" r="22"/><circle class="pc" cx="38" cy="76" r="22"/><circle class="pc" cx="82" cy="76" r="22"/>';
    if (n === 4) b += '<circle class="pc-grp" cx="36" cy="60" r="26"/><circle class="pc-grp" cx="84" cy="60" r="26"/><circle class="pc" cx="36" cy="48" r="12"/><circle class="pc" cx="36" cy="72" r="12"/><circle class="pc" cx="84" cy="48" r="12"/><circle class="pc" cx="84" cy="72" r="12"/>';
    return b + "</svg>";
  }
  function cPly(nd, ctx) {
    var seen = {}, cnt = 0, vis = h("div", { class: "ply-vis" }), txt = h("p", { class: "fb ok", "aria-live": "polite" }), seg = h("div", { class: "seg" }), btns = [];
    function pick(i) {
      btns.forEach(function (b, bi) { b.classList.toggle("on", bi === i); });
      vis.innerHTML = plySvg(nd.items[i].n); txt.textContent = nd.items[i].d;
      if (!seen[i]) { seen[i] = true; cnt++; if (cnt === nd.items.length) ctx.done(); }
    }
    nd.items.forEach(function (it, i) { var b = h("button", { type: "button" }, it.t); on(b, "click", function () { pick(i); }); btns.push(b); seg.append(b); });
    var box = h("div", { class: "ply" }, h("p", { class: "intro" }, nd.intro), seg, vis, txt); pick(0); return box;
  }

  function cHotspots(nd, ctx) {
    var seen = {}, cnt = 0, n = nd.parts.length;
    var info = h("div", { class: "l-info", "aria-live": "polite" }, h("p", null, nd.hint || t("labelPick"))), label = h("div", { class: "label" });
    nd.parts.forEach(function (p) {
      var shown = h("span", { class: "l-show" });
      p.show.split("\n").forEach(function (ln, i) { if (i) shown.append(h("br")); shown.append(ln); });
      var b = h("button", { class: "lpart" + (p.wide ? " wide" : ""), type: "button" }, h("span", { class: "l-name" }, p.t), shown);
      on(b, "click", function () {
        label.querySelectorAll(".lpart").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on");
        info.innerHTML = ""; info.append(h("p", null, h("b", null, p.t + ". "), p.d));
        if (!seen[p.id]) { seen[p.id] = true; cnt++; b.classList.add("seen"); if (cnt === n) ctx.done(); }
      });
      label.append(b);
    });
    return h("div", { class: "labelbox" }, h("p", { class: "intro" }, nd.intro), label, info);
  }

  function cMap(nd, ctx, week, day) {
    var k = day.keywords, cx = 180, cy = 180, rx = 112, ry = 128, bw = 112, bh = 36;
    var svg = '<svg viewBox="0 0 360 360" class="mm" role="img" aria-label="' + day.title + '">';
    var pos = k.map(function (w, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / k.length; return { w: w, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }; });
    pos.forEach(function (p) { svg += '<path class="mm-line" d="M' + cx + " " + cy + "L" + p.x.toFixed(1) + " " + p.y.toFixed(1) + '"/>'; });
    svg += '<circle class="mm-center" cx="' + cx + '" cy="' + cy + '" r="44"/><text class="mm-num" x="' + cx + '" y="' + (cy - 2) + '">' + t("mapDay") + '</text><text class="mm-day" x="' + cx + '" y="' + (cy + 26) + '">' + day.n + "</text>";
    pos.forEach(function (p) { svg += '<g class="mm-node"><rect class="mm-bubble" x="' + (p.x - bw / 2).toFixed(1) + '" y="' + (p.y - bh / 2).toFixed(1) + '" width="' + bw + '" height="' + bh + '" rx="18"/><text class="mm-text" x="' + p.x.toFixed(1) + '" y="' + (p.y + 5).toFixed(1) + '">' + p.w + "</text></g>"; });
    return h("div", { class: "mapbox" }, h("p", { class: "intro" }, t("mapIntro")), svgFrom(svg + "</svg>"), doneButton(ctx, t("mapDone")));
  }

  function cFinalMap(nd, ctx, week) {
    var list = h("div", { class: "final" });
    week.days.forEach(function (d) {
      list.append(h("a", { class: "fday d" + d.n, href: "#" + week.id + "-d" + d.n },
        h("span", { class: "fnum" }, String(d.n)), h("span", { class: "ftxt" }, h("b", null, d.title), h("small", null, d.keywords.slice(0, 4).join(" · ")))));
    });
    return h("div", { class: "finalbox" }, h("p", { class: "intro" }, t("finalIntro")), list, doneButton(ctx, t("finalDone")));
  }

  var RENDER = { hook: cHook, cards: cCards, sort: cSort, order: cOrder, quiz: cQuiz, compare: cCompare, ranges: cRanges, slider: cSlider, ply: cPly, hotspots: cHotspots, map: cMap, finalmap: cFinalMap };

  /* ------------------------------------------------------------ feedback: tutto locale, poi un check-in settimanale su GitHub */
  function chipGroup(options, multi, initial, onChange) {
    var sel = multi ? (initial || []).slice() : (initial || null), wrap = h("div", { class: "chips", role: "group" });
    options.forEach(function (o) {
      var b = h("button", { class: "chipbtn", type: "button", "aria-pressed": "false" }, o[1]);
      function paint() { var on_ = multi ? sel.indexOf(o[0]) >= 0 : sel === o[0]; b.classList.toggle("on", on_); b.setAttribute("aria-pressed", on_ ? "true" : "false"); }
      on(b, "click", function () {
        if (multi) { var i = sel.indexOf(o[0]); if (i >= 0) sel.splice(i, 1); else sel.push(o[0]); } else { sel = sel === o[0] ? null : o[0]; }
        wrap.querySelectorAll(".chipbtn").forEach(function (x) { x._p && x._p(); }); onChange(sel);
      });
      b._p = paint; paint(); wrap.append(b);
    });
    return wrap;
  }

  function dayFeedback(week, day) {
    var id = week.id + "-d" + day.n, cur = mem.fb[id] || {}, data = { focus: cur.focus || null, length: cur.length || null, best: cur.best || [], note: cur.note || "" };
    var box = h("section", { class: "dayfb" });
    function render(saved) {
      box.innerHTML = "";
      if (saved) { box.append(h("p", { class: "fb ok" }, "Saved. It goes into your weekly check-in.")); return; }
      var note = h("textarea", { id: "fbnote-" + id, rows: "2", placeholder: "Anything that worked or annoyed you? (optional)" }); note.value = data.note;
      on(note, "input", function () { data.note = note.value.slice(0, 300); });
      var send = h("button", { class: "btn ghost", type: "button" }, "Save feedback");
      on(send, "click", function () { mem.fb[id] = { focus: data.focus, length: data.length, best: data.best, note: data.note }; save(); render(true); });
      box.append(h("h3", null, "Quick feedback"), h("p", { class: "hint" }, "Optional. Three taps."),
        h("p", { class: "lbl" }, "How was your focus?"), chipGroup([["locked", "Locked in"], ["drifted", "Drifted a bit"], ["lost", "Lost it"]], false, data.focus, function (v) { data.focus = v; }),
        h("p", { class: "lbl" }, "Length"), chipGroup([["short", "Too short"], ["right", "About right"], ["long", "Too long"]], false, data.length, function (v) { data.length = v; }),
        h("p", { class: "lbl" }, "What worked best?"), chipGroup([["hook", "The hook"], ["cards", "Cards"], ["games", "Games"], ["quiz", "Quiz"], ["map", "Mind map"], ["audio", "Audio"], ["videos", "Videos"]], true, data.best, function (v) { data.best = v; }),
        h("label", { class: "lbl", for: "fbnote-" + id }, "Note"), note, send);
    }
    render(!!mem.fb[id]); return box;
  }

  function copyText(text, btn, label) {
    function ok() { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = label; }, 1800); }
    try { navigator.clipboard.writeText(text).then(ok, function () { window.prompt("Copy this:", text); }); } catch (e) { window.prompt("Copy this:", text); }
  }

  function buildCheckin(form) {
    var w = curWeek(), perDay = [], helped = [], hurt = [];
    w.days.forEach(function (d) { var f = mem.fb[w.id + "-d" + d.n]; if (f) perDay.push({ day: d.n, focus: f.focus, length: f.length, best: f.best, note: f.note }); });
    Object.keys(mem.nfb).forEach(function (k) { if (k.indexOf(w.id + "-") === 0) (mem.nfb[k] > 0 ? helped : hurt).push(k.slice(w.id.length + 1)); });
    var st = weekStats(w);
    var payload = { kind: "checkin", week: w.id, topic: w.topic, daysCompleted: st.days, rating: form.rating, keep: form.keep, change: form.change, next: { topic: form.topic, notes: form.notes }, perDay: perDay, stopsThatHelped: helped, stopsThatDidNot: hurt };
    var lines = ["## Weekly check-in · " + w.id + " (" + w.topic + ")", "",
      "- Days completed: " + st.days + "/7", "- Week rating: " + (form.rating || "not given"),
      "- Keep: " + (form.keep || "-"), "- Change: " + (form.change || "-"), "",
      "## Next week", "- Topic: " + (form.topic || "-"), "- Notes: " + (form.notes || "-"), ""];
    if (perDay.length) { lines.push("## Daily feedback"); perDay.forEach(function (p) { lines.push("- Day " + p.day + ": focus " + (p.focus || "?") + ", length " + (p.length || "?") + ", best " + ((p.best || []).join("/") || "?") + (p.note ? ", note: " + p.note : "")); }); lines.push(""); }
    if (helped.length || hurt.length) lines.push("## Stop ratings", "- Helped: " + (helped.join(", ") || "-"), "- Did not help: " + (hurt.join(", ") || "-"), "");
    lines.push("<!-- hub-checkin " + JSON.stringify(payload) + " -->");
    return { title: "Check-in " + w.id + ": next week " + (form.topic || "?"), body: lines.join("\n") };
  }
  function issueUrl(c) {
    return "https://github.com/" + HUB.repo + "/issues/new?title=" + encodeURIComponent(c.title) + "&labels=checkin&body=" + encodeURIComponent(c.body);
  }

  /* ------------------------------------------------------------ viste */
  function setTabs(active) {
    tabs.hidden = !active;
    tabs.querySelectorAll("a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-tab") === active); if (a.getAttribute("data-tab") === active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  }
  function emptyState(title, text) { return h("div", { class: "empty" }, mascot("big"), h("h2", null, title), h("p", null, text)); }

  function dayCard(week, day, firstOpen) {
    L = week.lang || "en";
    var r = dayStats(week, day), full = r.done === r.total;
    var state = full ? "Completed" : (r.done ? r.done + " of " + r.total : "Not started");
    return h("li", null, h("a", { class: "daycard d" + day.n + (full ? " finished" : "") + (firstOpen === day.n ? " next" : ""), href: "#" + week.id + "-d" + day.n },
      h("span", { class: "dnum" }, full ? svgFrom(ICON.check) : String(day.n)),
      h("span", { class: "dtxt" }, firstOpen === day.n ? h("em", { class: "tonext" }, "Up next") : null, h("b", null, day.title), h("small", null, day.sub)),
      h("span", { class: "dmeta" }, "≈ " + dayMin(week, day) + " min", h("small", null, state))));
  }

  function weekHeader(week, archived) {
    var st = weekStats(week), pct = st.total ? Math.round(st.done / st.total * 100) : 0;
    var bar = h("div", { class: "pbar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": "Week progress" }, h("i")); bar.firstChild.style.width = pct + "%";
    return h("header", { class: "hero" }, mascot("big"),
      h("p", { class: "eyebrow" }, (archived ? "Archive · " : "") + "Week " + week.n + " · from " + fmtDate(week.start)),
      h("h1", null, week.topic), h("p", { class: "lead" }, week.summary), bar, h("p", { class: "pcount" }, st.days + " of " + week.days.length + " days finished"));
  }

  function renderWeekPage(week, archived) {
    document.title = week.topic + " · Learning Hub";
    app.innerHTML = ""; app.className = "hub";
    var first = null; week.days.forEach(function (d) { var s = dayStats(week, d); if (first === null && s.done < s.total) first = d.n; });
    var list = h("ol", { class: "days" }); week.days.forEach(function (d) { list.append(dayCard(week, d, archived ? null : first)); });
    if (archived) app.append(h("a", { class: "crumb", href: "#archive" }, h("span", { html: ICON.back }), "Archive"));
    app.append(weekHeader(week, archived), list);
    if (!archived) {
      var nx = window.PROFILE && window.PROFILE.next;
      app.append(h("section", { class: "nextweek" }, h("h2", null, "Next week"),
        nx ? h("p", null, h("b", null, nx.topic), nx.status ? " · " + nx.status : "") : h("p", null, "Not chosen yet. Tell me in the chat on Sunday, or leave it in your check-in."),
        h("a", { class: "btn ghost", href: "#me" }, "Open the check-in")));
    }
  }

  function renderNow() {
    var w = curWeek();
    if (!w) { document.title = "Learning Hub"; app.innerHTML = ""; app.className = "hub"; app.append(emptyState("No week yet", "Ask for your first topic in the chat and it will appear here.")); return; }
    renderWeekPage(w, false);
  }

  function renderArchive() {
    document.title = "Archive · Learning Hub"; app.innerHTML = ""; app.className = "hub";
    var past = WEEKS.slice(0, -1).reverse();
    app.append(h("header", { class: "pagehead" }, h("h1", null, "Archive"), h("p", { class: "lead" }, "Past weeks stay here. Reopen any day to review it.")));
    if (!past.length) { app.append(emptyState("Nothing here yet", "When next week starts, this week moves here and stays reviewable.")); return; }
    var list = h("ol", { class: "days" });
    past.forEach(function (w) {
      var st = weekStats(w), kws = []; w.days.forEach(function (d) { d.keywords.slice(0, 2).forEach(function (k) { kws.push(k); }); });
      list.append(h("li", null, h("a", { class: "weekcard", href: "#" + w.id },
        h("span", { class: "wnum" }, String(w.n)),
        h("span", { class: "wtxt" }, h("b", null, w.topic), h("small", null, fmtDate(w.start) + " · " + st.days + " of " + w.days.length + " days finished"),
          h("span", { class: "kws" }, kws.slice(0, 6).map(function (k) { return h("i", null, k); }))))));
    });
    app.append(list);
  }

  function renderMe() {
    document.title = "Me · Learning Hub"; app.innerHTML = ""; app.className = "hub";
    var P = window.PROFILE || {}, w = curWeek();
    app.append(h("header", { class: "pagehead" }, h("h1", null, "Me"), h("p", { class: "lead" }, "How I teach you, and your weekly check-in.")));

    var prof = h("section", { class: "panel" }, h("h2", null, "How I teach you"),
      h("p", { class: "lbl" }, "What works"), h("ul", null, (P.works || []).map(function (x) { return h("li", null, x); })),
      h("p", { class: "lbl" }, "What I avoid"), h("ul", null, (P.avoid || []).map(function (x) { return h("li", null, x); })),
      P.note ? h("p", { class: "hint" }, P.note + (P.updated ? " Updated " + P.updated + "." : "")) : null);
    app.append(prof);

    if (!w) return;
    var form = { rating: null, keep: "", change: "", topic: "", notes: "" };
    var keep = h("textarea", { id: "ci-keep", rows: "2", placeholder: "What should I keep doing?" });
    var change = h("textarea", { id: "ci-change", rows: "2", placeholder: "What should I change?" });
    var topic = h("input", { id: "ci-topic", type: "text", placeholder: "e.g. How espresso extraction works", autocomplete: "off" });
    var notes = h("textarea", { id: "ci-notes", rows: "2", placeholder: "Anything specific for next week? (more videos, a practical project...)" });
    on(keep, "input", function () { form.keep = keep.value; }); on(change, "input", function () { form.change = change.value; });
    on(topic, "input", function () { form.topic = topic.value; update(); }); on(notes, "input", function () { form.notes = notes.value; });
    var msg = h("p", { class: "hint" });
    var send = h("button", { class: "btn", type: "button" }, "Send check-in on GitHub");
    var copy = h("button", { class: "btn ghost", type: "button" }, "Copy instead");
    function update() { var ready = form.topic.trim().length > 2; send.disabled = !ready; copy.disabled = !ready; }
    on(send, "click", function () {
      var c = buildCheckin(form); var url = issueUrl(c);
      if (url.length > 7500) { msg.textContent = "The check-in is too long for a link. Use Copy instead and paste it in the chat."; return; }
      msg.textContent = "GitHub opened in a new tab. Press Submit there and tell me in the chat that it's sent.";
      window.open(url, "_blank", "noopener");
    });
    on(copy, "click", function () { copyText(buildCheckin(form).body, copy, "Copy instead"); });
    update();
    app.append(h("section", { class: "panel" }, h("h2", null, "Weekly check-in"),
      h("p", { class: "hint" }, "Once a week. It includes your daily feedback and stop ratings from this device."),
      h("p", { class: "lbl" }, "How was the week?"), chipGroup([["great", "Great"], ["ok", "Okay"], ["meh", "Not for me"]], false, null, function (v) { form.rating = v; }),
      h("label", { class: "lbl", for: "ci-keep" }, "Keep"), keep, h("label", { class: "lbl", for: "ci-change" }, "Change"), change,
      h("label", { class: "lbl", for: "ci-topic" }, "What do you want to learn next week?"), topic,
      h("label", { class: "lbl", for: "ci-notes" }, "Notes for next week"), notes,
      h("div", { class: "btnrow" }, send, copy), msg));

    var restore = h("textarea", { id: "bk-in", rows: "2", placeholder: "Paste a backup code here" });
    var bmsg = h("p", { class: "hint" }), bcopy = h("button", { class: "btn ghost", type: "button" }, "Copy backup code"), brest = h("button", { class: "btn ghost", type: "button" }, "Restore");
    on(bcopy, "click", function () { copyText(JSON.stringify(mem), bcopy, "Copy backup code"); });
    on(brest, "click", function () {
      try { var p = JSON.parse(restore.value); mem.done = p.done || {}; mem.fb = p.fb || {}; mem.nfb = p.nfb || {}; save(); bmsg.textContent = "Restored."; } catch (e) { bmsg.textContent = "That code didn't work. Copy it again from the other device."; }
    });
    app.append(h("section", { class: "panel" }, h("h2", null, "Move to another device"),
      h("p", { class: "hint" }, "Progress is saved in this browser. Copy a backup code and paste it on your other device."), h("div", { class: "btnrow" }, bcopy), restore, h("div", { class: "btnrow" }, brest), bmsg));
  }

  function renderModule(week, day) {
    L = week.lang || "en";
    document.title = "Day " + day.n + " · " + day.title;
    app.innerHTML = ""; app.className = "module d" + day.n;
    var nodes = buildNodes(week, day), total = nodes.length;
    var isCur = week === curWeek(), backHref = isCur ? "#now" : "#" + week.id;
    var count = h("span", { class: "tcount" }), tbar = h("div", { class: "tbar" }, h("i"));
    var top = h("div", { class: "topbar" }, h("a", { class: "back", href: backHref, "aria-label": "Back", html: ICON.back }), h("div", { class: "tmid" }, h("b", null, "Week " + week.n + " · Day " + day.n), tbar), count);
    var finish = h("section", { class: "finish", hidden: true });

    function refresh() {
      var d = 0; nodes.forEach(function (_, i) { if (mem.done[nkey(week, day.n, i)]) d++; });
      count.textContent = d + "/" + total; tbar.firstChild.style.width = Math.round(d / total * 100) + "%";
      if (d === total && !finish.childNodes.length) {
        finish.hidden = false;
        var nxt = week.days[day.n], lastDay = !nxt;
        finish.append(mascot("sm"), h("h2", null, t("dayDone", { n: day.n })), h("p", null, lastDay ? t("dayDoneLast") : t("dayDoneNext")),
          lastDay ? (isCur ? h("a", { class: "btn", href: "#me" }, t("goMe")) : h("a", { class: "btn", href: backHref }, "Back to the week")) : h("a", { class: "btn", href: "#" + week.id + "-d" + nxt.n }, t("goDay", { n: nxt.n })),
          h("div", { class: "fbwrap" }, dayFeedback(week, day)));
      }
    }

    var root = h("header", { class: "root" }, mascot("big"), h("div", null, h("h1", null, day.title), h("p", null, day.sub + " · ≈ " + dayMin(week, day) + " " + t("min"))));
    var trail = h("ol", { class: "trail" }), lis = [];
    function pending() { for (var q = 0; q < total; q++) if (!mem.done[nkey(week, day.n, q)]) return q; return total; }
    function mark() { var p = pending(); lis.forEach(function (x, xi) { x.li.classList.toggle("open", xi === p); }); }
    function goNext(i) { if (i < total - 1) reveal(i + 1, true); else scrollToEl(finish.hidden ? extra : finish); }
    function reveal(i, scroll) {
      var x = lis[i]; x.li.hidden = false;
      if (!x.built) {
        x.built = true;
        var nd = nodes[i];
        var ctx = { done: function (advance) {
          if (!mem.done[nkey(week, day.n, i)]) { mem.done[nkey(week, day.n, i)] = true; save(); }
          x.li.classList.add("done"); x.foot.hidden = !!advance; refresh(); mark();
          if (advance) goNext(i);
        } };
        x.content.append(RENDER[nd.type](nd, ctx, week, day));
        if (mem.done[nkey(week, day.n, i)]) x.foot.hidden = false;
      }
      mark();
      if (scroll) scrollToEl(x.li);
    }

    nodes.forEach(function (nd, i) {
      var li = h("li", { class: "node" + (mem.done[nkey(week, day.n, i)] ? " done" : ""), hidden: true });
      var pin = h("div", { class: "pin", "aria-hidden": "true" }, h("span", { class: "pn" }, String(i + 1)), h("span", { class: "pk", html: ICON.check }));
      var head = h("div", { class: "nhead" }, h("h2", { class: "nt" }, nd.title), h("span", { class: "nm" }, nd.min + " " + t("min")));
      var content = h("div", { class: "ncontent" });
      var rate = h("div", { class: "rate" });
      var nk = nkey(week, day.n, i);
      function drawRate() {
        rate.innerHTML = "";
        var cur = mem.nfb[nk];
        [[1, ICON.thumbUp, "This stop helped"], [-1, ICON.thumbDown, "This stop didn't help"]].forEach(function (o) {
          var b = h("button", { class: "thumb" + (cur === o[0] ? " on" : ""), type: "button", "aria-label": o[2], "aria-pressed": cur === o[0] ? "true" : "false", html: o[1] });
          on(b, "click", function () { if (mem.nfb[nk] === o[0]) delete mem.nfb[nk]; else mem.nfb[nk] = o[0]; save(); drawRate(); });
          rate.append(b);
        });
      }
      drawRate();
      var foot = h("div", { class: "nfoot", hidden: true },
        on(h("button", { class: "btn", type: "button" }, i < total - 1 ? t("nextStop") : t("toExtras")), "click", function () { goNext(i); }), rate);
      li.append(pin, h("div", { class: "ncard" }, head, h("div", { class: "nbody" }, content, foot))); trail.append(li);
      lis.push({ li: li, content: content, foot: foot, built: false });
    });

    var extra = h("section", { class: "extra" }, h("h2", null, t("extrasH")), h("p", { class: "hint" }, t("extrasHint")));
    var list = h("ul", { class: "elist" });
    (day.extra || []).forEach(function (e) {
      var url = e.url || ("https://www.youtube.com/results?search_query=" + encodeURIComponent(e.q));
      list.append(h("li", null, h("a", { href: url, target: "_blank", rel: "noopener noreferrer" },
        h("span", { class: "etag " + e.kind }, t(e.kind === "search" ? "kSearch" : (e.kind === "video" ? "kVideo" : "kRead"))),
        h("span", { class: "etxt" }, h("b", null, e.t), e.src ? h("small", null, e.src) : null))));
    });
    extra.append(list, h("p", { class: "hint small" }, t("extrasNote")));
    app.append(top, root, trail, finish, extra); refresh();
    var upto = Math.min(pending(), total - 1);
    for (var r = 0; r <= upto; r++) reveal(r, false);
  }

  /* ------------------------------------------------------------ router */
  function route() {
    var hsh = location.hash.slice(1), m;
    if ((m = /^(w\d\d)-d([1-7])$/.exec(hsh))) {
      var w = weekById(m[1]), d = w && w.days[parseInt(m[2], 10) - 1];
      if (d) { setTabs(null); renderModule(w, d); window.scrollTo(0, 0); return; }
    }
    if ((m = /^(w\d\d)$/.exec(hsh))) {
      var w2 = weekById(m[1]);
      if (w2) { setTabs("archive"); renderWeekPage(w2, w2 !== curWeek()); window.scrollTo(0, 0); return; }
    }
    if (hsh === "archive") { setTabs("archive"); renderArchive(); }
    else if (hsh === "me") { setTabs("me"); renderMe(); }
    else { setTabs("now"); renderNow(); }
    window.scrollTo(0, 0);
  }

  function boot() { window.addEventListener("hashchange", route); route(); }
  var files = (window.WEEK_FILES || []).slice();
  (function nextFile() {
    var f = files.shift();
    if (!f) { WEEKS.sort(function (a, b) { return a.n - b.n; }); boot(); return; }
    var s = document.createElement("script"); s.src = f + "?v=" + (HUB.v || "1"); s.onload = nextFile; s.onerror = nextFile; document.head.appendChild(s);
  })();
})();
