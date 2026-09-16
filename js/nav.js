(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (!reduce && "IntersectionObserver" in window) {
    var revealEls = document.querySelectorAll(".audience-card, .steps li, .phone-gallery figure, .cta-banner .wrap, .site-footer .footer-grid > div");
    if (revealEls.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
      revealEls.forEach(function (el, i) {
        el.classList.add("reveal");
        el.style.transitionDelay = (i % 6) * 70 + "ms";
        io.observe(el);
      });
    }
  }

  var rotator = document.querySelector("[data-rotator]");
  if (rotator) {
    var items = Array.prototype.slice.call(rotator.querySelectorAll(".hero-rotate-item"));
    var index = 0;
    if (items.length > 1 && !reduce) {
      setInterval(function () {
        items[index].classList.remove("is-on");
        index = (index + 1) % items.length;
        items[index].classList.add("is-on");
      }, 2600);
    }
  }

  var pills = Array.prototype.slice.call(document.querySelectorAll(".store-pill"));
  if (pills.length > 1 && !reduce) {
    var pillIndex = pills.findIndex(function (p) { return p.classList.contains("is-on"); });
    if (pillIndex < 0) pillIndex = 0;
    setInterval(function () {
      pills[pillIndex].classList.remove("is-on");
      pillIndex = (pillIndex + 1) % pills.length;
      pills[pillIndex].classList.add("is-on");
    }, 2800);
  }

  function cycle(list, delay) {
    if (reduce || list.length < 2) return;
    var i = list.findIndex(function (el) { return el.classList.contains("is-on"); });
    if (i < 0) {
      i = 0;
      list[0].classList.add("is-on");
    }
    var timer = setInterval(function () {
      list[i].classList.remove("is-on");
      i = (i + 1) % list.length;
      list[i].classList.add("is-on");
    }, delay);
    var root = list[0].parentNode;
    if (!root) return;
    root.addEventListener("mouseenter", function () { clearInterval(timer); timer = null; });
    root.addEventListener("mouseleave", function () {
      if (timer) return;
      timer = setInterval(function () {
        list[i].classList.remove("is-on");
        i = (i + 1) % list.length;
        list[i].classList.add("is-on");
      }, delay);
    });
  }

  var spotlight = document.querySelector("[data-spotlight]");
  if (spotlight) {
    var audience = Array.prototype.slice.call(spotlight.querySelectorAll(".audience-card"));
    audience.forEach(function (card, idx) {
      card.addEventListener("mouseenter", function () {
        audience.forEach(function (c) { c.classList.remove("is-on"); });
        card.classList.add("is-on");
      });
      card.addEventListener("click", function () {
        audience.forEach(function (c) { c.classList.remove("is-on"); });
        card.classList.add("is-on");
      });
      card.setAttribute("tabindex", "0");
    });
    cycle(audience, 3400);
  }

  var stepsRoot = document.querySelector("[data-steps]");
  if (stepsRoot) {
    var steps = Array.prototype.slice.call(stepsRoot.children);
    cycle(steps, 3200);
  }

  function initPhoneCarousel(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll(".phone-stage-track > figure"));
    var dotsWrap = root.querySelector("[data-carousel-dots]");
    var prevBtn = root.querySelector("[data-carousel-prev]");
    var nextBtn = root.querySelector("[data-carousel-next]");
    var viewport = root.querySelector(".phone-stage-viewport");
    if (!slides.length) return;

    var active = 0;
    var timer = null;
    var n = slides.length;

    slides.forEach(function (slide, i) {
      var caption = slide.querySelector("figcaption strong");
      var label = caption ? caption.textContent : "Tela " + (i + 1);
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", label);
      dot.addEventListener("click", function () { go(i, true); });
      if (dotsWrap) dotsWrap.appendChild(dot);
      slide.addEventListener("click", function () {
        if (i !== active) go(i, true);
      });
    });

    var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll("button")) : [];

    function wrapDelta(i) {
      var d = i - active;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      if (d > 2) d = 2;
      if (d < -2) d = -2;
      return d;
    }

    function render() {
      slides.forEach(function (slide, i) {
        var d = wrapDelta(i);
        slide.setAttribute("data-offset", String(d));
        slide.classList.toggle("is-active", d === 0);
        slide.classList.add("is-ready");
        slide.setAttribute("aria-hidden", d === 0 ? "false" : "true");
      });
      dots.forEach(function (dot, i) {
        if (i === active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function go(i, user) {
      active = (i + n) % n;
      render();
      if (user) restart();
    }

    function next() { go(active + 1, false); }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      if (reduce || n < 2) return;
      stop();
      timer = setInterval(next, 4200);
    }

    function restart() {
      stop();
      start();
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { go(active + 1, true); });
    if (prevBtn) prevBtn.addEventListener("click", function () { go(active - 1, true); });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    var startX = 0;
    var dragging = false;
    if (viewport) {
      viewport.addEventListener("pointerdown", function (e) {
        dragging = true;
        startX = e.clientX;
      });
      viewport.addEventListener("pointerup", function (e) {
        if (!dragging) return;
        dragging = false;
        var dx = e.clientX - startX;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) go(active + 1, true);
        else go(active - 1, true);
      });
      viewport.addEventListener("pointercancel", function () { dragging = false; });
    }

    render();
    start();
  }

  function initCardCarousel(root) {
    var track = root.querySelector("[data-card-track]");
    var viewport = root.querySelector(".card-stage-viewport");
    var dotsWrap = root.querySelector("[data-card-dots]");
    var prevBtn = root.querySelector("[data-card-prev]");
    var nextBtn = root.querySelector("[data-card-next]");
    if (!track || !viewport) return;
    var cards = Array.prototype.slice.call(track.children);
    if (!cards.length) return;

    var page = 0;
    var timer = null;

    function perView() {
      if (window.matchMedia("(min-width: 58rem)").matches) return 3;
      if (window.matchMedia("(min-width: 40rem)").matches) return 2;
      return 1;
    }

    function pageCount() {
      return Math.max(1, Math.ceil(cards.length / perView()));
    }

    function rebuildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      var count = pageCount();
      for (var i = 0; i < count; i++) {
        (function (idx) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.setAttribute("aria-label", "Grupo " + (idx + 1));
          dot.addEventListener("click", function () { go(idx, true); });
          dotsWrap.appendChild(dot);
        })(i);
      }
    }

    function render() {
      var pv = perView();
      var gap = 18;
      var vw = viewport.clientWidth;
      var cardW = (vw - gap * (pv - 1)) / pv;
      cards.forEach(function (card) {
        card.style.flex = "0 0 " + cardW + "px";
        card.style.width = cardW + "px";
      });
      var maxStart = Math.max(0, cards.length - pv);
      var start = Math.min(page * pv, maxStart);
      track.style.transform = "translateX(" + (-start * (cardW + gap)) + "px)";
      var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll("button")) : [];
      var currentPage = pv === 0 ? 0 : Math.floor(start / pv);
      dots.forEach(function (dot, i) {
        if (i === currentPage) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function go(i, user) {
      var max = pageCount() - 1;
      page = (i + max + 1) % (max + 1);
      render();
      if (user) restart();
    }

    function next() { go(page + 1, false); }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      if (reduce || pageCount() < 2) return;
      stop();
      timer = setInterval(next, 4800);
    }

    function restart() {
      stop();
      start();
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { go(page + 1, true); });
    if (prevBtn) prevBtn.addEventListener("click", function () { go(page - 1, true); });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    var startX = 0;
    var dragging = false;
    viewport.addEventListener("pointerdown", function (e) {
      dragging = true;
      startX = e.clientX;
    });
    viewport.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.clientX - startX;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) go(page + 1, true);
      else go(page - 1, true);
    });

    window.addEventListener("resize", function () {
      if (page > pageCount() - 1) page = pageCount() - 1;
      rebuildDots();
      render();
    });

    rebuildDots();
    render();
    start();
  }

  document.querySelectorAll("[data-carousel]").forEach(initPhoneCarousel);
  document.querySelectorAll("[data-card-carousel]").forEach(initCardCarousel);
})();
