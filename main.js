(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero: examination lamp over epithelium ---------- */
  var hero = document.querySelector(".hero");
  var cv = document.querySelector(".hero__tissue");
  if (hero && cv && cv.getContext) {
    var ctx = cv.getContext("2d");
    var base = document.createElement("canvas");
    var bctx = base.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cells = [], step = 30;
    var lamp = { x: 0, y: 0, tx: 0, ty: 0, r: 190 };
    var pointer = false, running = false, visible = true, t0 = performance.now();

    function rand(seed) { var x = Math.sin(seed) * 43758.5453; return x - Math.floor(x); }

    function build() {
      var rect = hero.getBoundingClientRect();
      W = rect.width; H = rect.height;
      cv.width = base.width = Math.round(W * dpr);
      cv.height = base.height = Math.round(H * dpr);
      step = W < 600 ? 24 : 30;
      lamp.r = Math.max(130, Math.min(240, W * 0.17));
      cells = [];
      var i = 0;
      for (var y = -step; y < H + step; y += step * 0.86) {
        var row = Math.round(y / step);
        for (var x = -step; x < W + step; x += step) {
          i++;
          var ox = (row % 2) * step * 0.5;
          cells.push({
            x: x + ox + (rand(i * 3.1) - 0.5) * step * 0.5,
            y: y + (rand(i * 7.7) - 0.5) * step * 0.45,
            r: step * (0.38 + rand(i * 1.3) * 0.14),
            nr: step * (0.08 + rand(i * 5.9) * 0.05),
            nx: (rand(i * 2.2) - 0.5) * step * 0.12,
            ny: (rand(i * 4.4) - 0.5) * step * 0.12,
            ph: rand(i * 9.1) * Math.PI * 2,
            k: rand(i * 6.6) // a few cells take the warmer tint
          });
        }
      }
      // static, barely visible layer
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.fillStyle = "#1B2629";
      bctx.fillRect(0, 0, W, H);
      bctx.strokeStyle = "rgba(201,221,218,0.07)";
      bctx.lineWidth = 1;
      for (var c = 0; c < cells.length; c++) {
        var e = cells[c];
        bctx.beginPath(); bctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); bctx.stroke();
      }
      if (!pointer) { lamp.x = lamp.tx = W * 0.72; lamp.y = lamp.ty = H * 0.36; }
    }

    function frame(now) {
      var t = (now - t0) / 1000;
      if (!pointer && !reduce) {
        lamp.tx = W * (0.66 + 0.16 * Math.sin(t * 0.21));
        lamp.ty = H * (0.36 + 0.16 * Math.sin(t * 0.33 + 1));
      }
      lamp.x += (lamp.tx - lamp.x) * (reduce ? 1 : 0.12);
      lamp.y += (lamp.ty - lamp.y) * (reduce ? 1 : 0.12);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // light pool
      var g = ctx.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, lamp.r * 1.25);
      g.addColorStop(0, "rgba(246,231,168,0.20)");
      g.addColorStop(0.6, "rgba(246,231,168,0.07)");
      g.addColorStop(1, "rgba(246,231,168,0)");
      ctx.fillStyle = g;
      ctx.fillRect(lamp.x - lamp.r * 1.3, lamp.y - lamp.r * 1.3, lamp.r * 2.6, lamp.r * 2.6);

      var R = lamp.r, R2 = R * R;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        var dx = c.x - lamp.x, dy = c.y - lamp.y, d2 = dx * dx + dy * dy;
        if (d2 > R2) continue;
        var f = 1 - Math.sqrt(d2) / R;           // 0 at rim, 1 at centre
        var a = f * f * (3 - 2 * f);            // smoothstep
        var breathe = reduce ? 0 : Math.sin(t * 1.4 + c.ph) * 0.6;
        // magnification: cells near the centre appear larger
        var mag = 1 + a * 0.22;
        var cx = lamp.x + dx * (1 + a * 0.08), cy = lamp.y + dy * (1 + a * 0.08);
        var warm = c.k > 0.93;
        ctx.beginPath();
        ctx.arc(cx, cy, c.r * mag + breathe, 0, Math.PI * 2);
        ctx.fillStyle = warm ? "rgba(235,201,207," + (0.20 * a) + ")" : "rgba(242,244,242," + (0.06 * a) + ")";
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(235,201,207," + (0.55 * a) + ")";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + c.nx * mag, cy + c.ny * mag, c.nr * mag * (warm ? 1.5 : 1), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180,71,94," + (0.85 * a) + ")";
        ctx.fill();
      }
      // lamp rim
      if (pointer || !reduce) {
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y, R, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(246,231,168,0.28)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // shade under the text
      var s = ctx.createLinearGradient(0, H * 0.35, 0, H);
      s.addColorStop(0, "rgba(27,38,41,0)");
      s.addColorStop(1, "rgba(27,38,41,0.82)");
      ctx.fillStyle = s;
      ctx.fillRect(0, 0, W, H);

      if (running) requestAnimationFrame(frame);
    }

    function start() { if (!running && visible && !reduce) { running = true; requestAnimationFrame(frame); } }
    function stop() { running = false; }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      pointer = true; lamp.tx = e.clientX - r.left; lamp.ty = e.clientY - r.top;
      if (reduce) requestAnimationFrame(frame);
    });
    hero.addEventListener("pointerleave", function () { pointer = false; });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting; visible ? start() : stop();
      }).observe(hero);
    }
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { build(); if (!running) frame(performance.now()); }, 120); });
    build();
    frame(performance.now());
    start();
  }

  /* ---------- Fields highlight the path ---------- */
  var path = document.querySelector(".path");
  var fields = document.querySelectorAll(".field");
  fields.forEach(function (b) {
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true";
      fields.forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
      path.classList.toggle("is-filtered", on);
      path.querySelectorAll(".stop").forEach(function (s) {
        var hit = on && (" " + s.dataset.fields + " ").indexOf(" " + b.dataset.field + " ") > -1;
        s.classList.toggle("is-hit", hit);
      });
      if (on) {
        b.setAttribute("aria-pressed", "true");
        var first = path.querySelector(".is-hit");
        var r = first && first.getBoundingClientRect();
        if (r && (r.top > window.innerHeight || r.bottom < 0)) {
          first.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        }
      }
    });
  });

  /* ---------- Evidence: five steps ---------- */
  document.querySelectorAll(".panel__fig[data-dots]").forEach(function (f) {
    var n = +f.dataset.dots, r = +(f.dataset.range || n);
    for (var i = 0; i < 100; i++) {
      var d = document.createElement("i");
      d.className = "d" + (i < n ? " on" : i < r ? " range" : "");
      d.style.transitionDelay = (reduce ? 0 : i * 6) + "ms";
      f.appendChild(d);
    }
  });
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var fill = document.querySelector(".steps__fill");
  var current = 0;
  function draw(panel) {
    var fig = panel.querySelector(".panel__fig");
    if (!fig) return;
    fig.classList.remove("is-drawn");
    void fig.offsetWidth;
    requestAnimationFrame(function () { fig.classList.add("is-drawn"); });
  }
  function select(i, focus) {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach(function (t, k) {
      var on = k === current;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle("is-past", k < current);
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (fill) fill.style.setProperty("--fill", (current / (tabs.length - 1)) * 100 * 0.8 + "%");
    var p = document.getElementById(tabs[current].getAttribute("aria-controls"));
    draw(p);
    if (focus) tabs[current].focus();
    if (history.replaceState) history.replaceState(null, "", "#step-" + (current + 1));
  }
  tabs.forEach(function (t, k) {
    t.addEventListener("click", function () { select(k); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); select(current + 1, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); select(current - 1, true); }
      if (e.key === "Home") { e.preventDefault(); select(0, true); }
      if (e.key === "End") { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });
  var nextBtn = document.querySelector(".next");
  if (nextBtn) nextBtn.addEventListener("click", function () { select(current + 1); });
  var m = location.hash.match(/^#step-([1-5])$/);
  if (tabs.length) {
    select(m ? +m[1] - 1 : 0);
    if (!m && history.replaceState) history.replaceState(null, "", location.pathname);
    if (m) document.getElementById("evidence").scrollIntoView();
  }

  /* draw-once when visible */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-drawn");
          if (e.target.closest(".panel")) draw(e.target.closest(".panel"));
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".degrees, .panels, .fields").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".degrees, .fields").forEach(function (el) { el.classList.add("is-drawn"); });
  }

  /* ---------- Hero: name and greeting ---------- */
  var nm = document.querySelector(".hero__nm");
  if (nm && !reduce) {
    var full = nm.textContent, n = 0;
    nm.textContent = "";
    var vh = document.createElement("span"); vh.className = "vh"; vh.textContent = full; nm.appendChild(vh);
    full.split(" ").forEach(function (word, w) {
      if (w) nm.appendChild(document.createTextNode(" "));
      var ws = document.createElement("span"); ws.className = "w"; ws.setAttribute("aria-hidden", "true");
      word.split("").forEach(function (ch) {
        var l = document.createElement("i"); l.textContent = ch; l.style.setProperty("--i", n++); ws.appendChild(l);
      });
      nm.appendChild(ws);
    });
  }
  var hello = document.querySelector(".hello");
  if (hello && !reduce) {
    var words = hello.getAttribute("data-words").split("|"), wi = 0;
    setInterval(function () {
      hello.classList.add("is-out");
      setTimeout(function () { wi = (wi + 1) % words.length; hello.textContent = words[wi]; hello.classList.remove("is-out"); }, 350);
    }, 2600);
  }

  /* ---------- Scroll: page progress and the path line ---------- */
  var prog = document.querySelector(".prog"), stops = path ? path.querySelectorAll(".stop") : [], ticking = false;
  function onScroll() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max) : 0);
    if (path) {
      var pr = path.getBoundingClientRect(), mark = window.innerHeight * 0.62;
      path.style.setProperty("--prog", Math.max(0, Math.min(1, (mark - pr.top) / pr.height)) * 100 + "%");
      stops.forEach(function (s) { if (s.getBoundingClientRect().top < mark) s.classList.add("is-on"); });
    }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Evidence: swipe between steps ---------- */
  var pn = document.querySelector(".panels"), sx = null;
  if (pn) {
    pn.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    pn.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 60) select(current + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Copy email ---------- */
  var toast = document.querySelector(".toast"), tt;
  function say(msg) { toast.textContent = msg; toast.classList.add("is-on"); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("is-on"); }, 1800); }
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.dataset.copy;
      var de = document.documentElement.lang === "de";
      var done = function () {
        var l = b.querySelector(".copy__label") || b, o = l.textContent;
        l.textContent = de ? "Kopiert" : "Copied"; b.classList.add("is-done");
        say(de ? "E-Mail-Adresse kopiert" : "Email address copied");
        setTimeout(function () { l.textContent = o; b.classList.remove("is-done"); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () { say(v); });
      else say(v);
    });
  });

  /* ---------- Current section in the bar ---------- */
  var links = document.querySelectorAll(".bar nav a");
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["fields", "path", "evidence", "writing", "contact"].forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
  }
})();
