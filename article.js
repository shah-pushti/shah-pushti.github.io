(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* figures animate once when they come into view */
  var inview = document.querySelectorAll(".hbars, .waf, .ivp, .flow");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.25 });
    inview.forEach(function (el) { io.observe(el); });
  } else {
    inview.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* table of contents follows the reader */
  var toc = document.querySelectorAll(".toc a");
  if (toc.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) toc.forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll(".prose h2[id]").forEach(function (h) { so.observe(h); });
  }

  /* stage figure: 100 squares built from the legend counts */
  document.querySelectorAll("[data-stage]").forEach(function (fig) {
    var waf = fig.querySelector(".waf"), legend = fig.querySelectorAll(".lg"), note = fig.querySelector(".stage-note");
    var k = 0;
    legend.forEach(function (b, s) {
      var n = +b.dataset.n, c = b.style.getPropertyValue("--c");
      for (var j = 0; j < n; j++) {
        var i = document.createElement("i");
        i.dataset.s = s; i.style.setProperty("--i", k); i.style.setProperty("--c", c);
        if (b.dataset.outline) i.className = "s4";
        waf.appendChild(i); k++;
      }
    });
    var base = note.textContent;
    legend.forEach(function (b, s) {
      b.addEventListener("click", function () {
        var on = b.getAttribute("aria-pressed") !== "true";
        legend.forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        fig.classList.toggle("has-sel", on);
        waf.querySelectorAll("i").forEach(function (i) { i.classList.toggle("is-sel", on && +i.dataset.s === s); });
        if (on) b.setAttribute("aria-pressed", "true");
        note.textContent = on ? b.dataset.note : base;
      });
    });
  });

  /* interval plot: positions on a log axis, explanation on selection */
  document.querySelectorAll("[data-ivp]").forEach(function (fig) {
    var lo = Math.log(+fig.dataset.min), hi = Math.log(+fig.dataset.max);
    var x = function (v) { return ((Math.log(v) - lo) / (hi - lo) * 100).toFixed(2) + "%"; };
    fig.style.setProperty("--ref", x(1));
    fig.querySelectorAll(".iv").forEach(function (r) {
      var t = r.querySelector(".iv__t");
      t.style.setProperty("--ref", x(1));
      t.style.setProperty("--lo", x(+r.dataset.lo)); t.style.setProperty("--hi", x(+r.dataset.hi)); t.style.setProperty("--pt", x(+r.dataset.est));
    });
    fig.querySelectorAll(".iv-axis b").forEach(function (b) { b.style.setProperty("--x", x(+b.dataset.v)); });
    var rows = fig.querySelectorAll(".iv"), note = fig.parentNode.querySelector(".iv-note"), base = note.textContent;
    rows.forEach(function (r) {
      r.addEventListener("click", function () {
        var on = r.getAttribute("aria-pressed") !== "true";
        rows.forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        if (on) r.setAttribute("aria-pressed", "true");
        note.textContent = on ? r.dataset.note : base;
      });
    });
  });

  /* self-check: diagram, step buttons and previous / next */
  document.querySelectorAll("[data-check]").forEach(function (box) {
    var btns = Array.prototype.slice.call(box.querySelectorAll(".steps7 button"));
    var zones = box.querySelectorAll(".zone");
    var card = box.querySelector(".check__card"), pos = box.querySelector(".check__pos");
    var cur = 0;
    function show(i, focusZone) {
      cur = (i + btns.length) % btns.length;
      var b = btns[cur];
      btns.forEach(function (o, j) { if (j === cur) o.setAttribute("aria-current", "step"); else o.removeAttribute("aria-current"); });
      zones.forEach(function (z) { z.classList.toggle("is-on", z.dataset.k === b.dataset.k); });
      card.querySelector("h3").textContent = (cur + 1) + ". " + b.textContent;
      card.querySelector(".do").textContent = b.dataset.do;
      card.querySelector(".look").innerHTML = "";
      var k = document.createElement("span"); k.className = "k"; k.textContent = b.dataset.pre;
      card.querySelector(".look").appendChild(k);
      card.querySelector(".look").appendChild(document.createTextNode(b.dataset.look));
      pos.textContent = "Step " + (cur + 1) + " of " + btns.length;
      if (focusZone) { var z = box.querySelector('.zone[data-k="' + b.dataset.k + '"]'); if (z) z.focus(); }
    }
    btns.forEach(function (b, i) { b.addEventListener("click", function () { show(i); }); });
    zones.forEach(function (z) {
      var go = function () { btns.forEach(function (b, i) { if (b.dataset.k === z.dataset.k) show(i); }); };
      z.addEventListener("click", go);
      z.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
    box.querySelector("[data-prev]").addEventListener("click", function () { show(cur - 1); });
    box.querySelector("[data-next]").addEventListener("click", function () { show(cur + 1); });
    show(0);
  });
})();
