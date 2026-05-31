/* ============================================================
   components.js — render helpers + interactive components
   Exposes window.UI (render) and wires global UI behaviour.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- tiny DOM helpers ---------- */
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
  /* Only allow in-app hash routes (defends against tampered localStorage injecting javascript: links). */
  const safeRoute = (r) => (typeof r === "string" && /^#\/[\w\-/]*$/.test(r)) ? r : "#/home";
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* Image fallback (broken url → teal gradient block).
     No inline onerror handlers are used (keeps a strict CSP) — instead a single
     capture-phase listener catches every <img> load failure document-wide. */
  window.imgErr = function (img) {
    if (!img || img.dataset.fb) return;
    img.dataset.fb = "1";
    img.classList.add("img-fallback");
    img.removeAttribute("src");
  };
  window.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG") window.imgErr(t);
  }, true);
  const imgAttr = `loading="lazy" decoding="async"`;

  /* ============================================================
     RENDER HELPERS
     ============================================================ */
  const UI = {};

  /* Single card (markup string). Supports overlay + badge + kicker + fav. */
  UI.card = function (c) {
    const overlay = c.overlay ? " card--overlay" : "";
    const badge = c.badge ? `<span class="card__badge ${c.badgeType ? "card__badge--" + c.badgeType : ""}">${esc(c.badge)}</span>` : "";
    const kicker = c.kicker ? `<span class="card__kicker">${esc(c.kicker)}</span>` : "";
    const meta = c.meta ? `<span class="card__meta">${esc(c.meta)}</span>` : "";
    const desc = c.desc ? `<span class="card__desc">${esc(c.desc)}</span>` : "";
    const href = c.route || "#/home";
    return `
      <article class="card${overlay}">
        <a class="card__media" href="${href}" data-link aria-label="${esc(c.title)}">
          <img ${imgAttr} src="${c.img}" alt="${esc(c.title)}" />
          ${badge}
        </a>
        <button class="card__fav" data-fav="${esc(c.id)}" data-title="${esc(c.title)}" data-img="${c.img}" data-route="${href}" aria-label="Save ${esc(c.title)} to wishlist" aria-pressed="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-4.35-9.5-8.5C.5 9 2 5.5 5.5 5.5 8 5.5 9.5 7.5 12 10c2.5-2.5 4-4.5 6.5-4.5C22 5.5 23.5 9 21.5 12.5 19 16.65 12 21 12 21Z"/></svg>
        </button>
        <a class="card__body" href="${href}" data-link>
          ${kicker}
          <span class="card__title">${esc(c.title)}</span>
          ${meta}${desc}
        </a>
      </article>`;
  };

  UI.grid = (cards, cols = 4) => `<div class="grid grid--${cols}">${cards.map(UI.card).join("")}</div>`;

  /* Horizontal carousel with prev/next buttons. cols = visible cards on desktop. */
  let cid = 0;
  UI.carousel = function (cards, cols = 4) {
    const id = "car" + (++cid);
    return `
      <div class="carousel carousel--${cols}" data-carousel>
        <button class="carousel__btn carousel__btn--prev" aria-label="Previous" data-dir="-1" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="carousel__track" id="${id}">${cards.map(UI.card).join("")}</div>
        <button class="carousel__btn carousel__btn--next" aria-label="Next" data-dir="1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>`;
  };

  /* Tabbed carousel: tabs map { TabName: [cards] } */
  UI.tabbedCarousel = function (tabsMap, cols = 4) {
    const keys = Object.keys(tabsMap);
    const tabs = keys.map((k, i) =>
      `<button class="tab${i === 0 ? " is-active" : ""}" data-tab="${esc(k)}">${esc(k)}</button>`).join("");
    return `
      <div data-tabset>
        <div class="tabs" role="tablist">${tabs}</div>
        <div data-tabpanel>${UI.carousel(tabsMap[keys[0]], cols)}</div>
      </div>`;
  };

  /* Promo banner. type: "split" (default), "media" (full image), reverse flag. */
  UI.banner = function (b, opts = {}) {
    const reverse = opts.reverse ? " banner--reverse" : "";
    if (opts.type === "media") {
      return `
        <div class="banner banner--media">
          <div class="banner__media"><img ${imgAttr} src="${b.img}" alt="${esc(b.title)}" /></div>
          <div class="banner__body">
            ${b.eyebrow ? `<span class="eyebrow">${esc(b.eyebrow)}</span>` : ""}
            <h2>${esc(b.title)}</h2>
            <p>${esc(b.text)}</p>
            <a class="btn btn--primary" href="${b.cta[1]}" data-link>${esc(b.cta[0])}</a>
          </div>
        </div>`;
    }
    return `
      <div class="banner${reverse}">
        <div class="banner__media"><img ${imgAttr} src="${b.img}" alt="${esc(b.title)}" /></div>
        <div class="banner__body">
          ${b.eyebrow ? `<span class="eyebrow">${esc(b.eyebrow)}</span>` : ""}
          <h2>${esc(b.title)}</h2>
          <p>${esc(b.text)}</p>
          <a class="btn btn--primary" href="${b.cta[1]}" data-link>${esc(b.cta[0])}</a>
        </div>
      </div>`;
  };

  /* Hero */
  UI.hero = function (hero, page = false) {
    const share = hero.share ? `
      <div class="hero__share" aria-label="Share">
        <a href="#" aria-label="Share on Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1Z"/></svg></a>
        <a href="#" aria-label="Share on X"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-7.5 8.6L23.3 22h-6.8l-5.3-7-6.1 7H2l8-9.2L1.5 2h7l4.8 6.4L18.9 2Z"/></svg></a>
        <a href="#" aria-label="Copy link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg></a>
      </div>` : "";
    const actions = (hero.primary || hero.secondary) ? `
      <div class="hero__actions">
        ${hero.primary ? `<a class="btn btn--primary btn--sweep" href="${hero.primary[1]}" data-link><span>${esc(hero.primary[0])}</span></a>` : ""}
        ${hero.secondary ? `<a class="btn btn--ghost" href="${hero.secondary[1]}" data-link>${esc(hero.secondary[0])}</a>` : ""}
      </div>` : "";
    const slides = (hero.slides && hero.slides.length) ? hero.slides : [hero.img];
    const media = slides.map((s, i) =>
      `<img class="hero__slide${i === 0 ? " is-active" : ""}" src="${s}" alt="${esc(hero.title)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`).join("");
    return `
      <section class="hero${page ? " hero--page" : ""}"${slides.length > 1 ? " data-hero-slides" : ""}>
        <div class="hero__media">${media}</div>
        <div class="container hero__inner">
          ${hero.eyebrow ? `<span class="hero__eyebrow"><span class="dot"></span>${esc(hero.eyebrow)}</span>` : ""}
          <h1>${esc(hero.title)}</h1>
          ${hero.lead ? `<p class="hero__lead">${esc(hero.lead)}</p>` : ""}
          ${actions}${share}
        </div>
      </section>`;
  };

  UI.sectionHead = (eyebrow, title, lead, link) => `
    <div class="container">
      <div class="section-head ${link ? "section-head--row" : ""}">
        <div>
          ${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
          <h2>${esc(title)}</h2>
          ${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
        </div>
        ${link ? `<a class="link-arrow" href="${link[1]}" data-link>${esc(link[0])}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>` : ""}
      </div>
    </div>`;

  window.UI = UI;
  window.__h = h; window.__esc = esc;

  /* ============================================================
     INTERACTIVE BEHAVIOUR (init after DOM render)
     ============================================================ */

  /* Carousels — wire arrow buttons + enable/disable at ends. Idempotent. */
  UI.initCarousels = function (root = document) {
    $$("[data-carousel]", root).forEach(car => {
      if (car.dataset.bound) return; car.dataset.bound = "1";
      const track = $(".carousel__track", car);
      const prev = $(".carousel__btn--prev", car);
      const next = $(".carousel__btn--next", car);
      const step = () => Math.max(track.clientWidth * 0.8, 280);
      const update = () => {
        const max = track.scrollWidth - track.clientWidth - 4;
        prev.disabled = track.scrollLeft <= 4;
        next.disabled = track.scrollLeft >= max;
      };
      prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
      next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
      track.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      setTimeout(update, 60);
    });
  };

  /* Tabbed carousels — swap track on tab click. Data kept on element via closure store. */
  const tabStore = new WeakMap();
  UI.registerTabset = function (elm, tabsMap, cols) { tabStore.set(elm, { tabsMap, cols }); };
  UI.initTabsets = function (root = document) {
    $$("[data-tabset]", root).forEach(set => {
      if (set.dataset.bound) return; set.dataset.bound = "1";
      const cfg = tabStore.get(set); if (!cfg) return;
      const panel = $("[data-tabpanel]", set);
      set.addEventListener("click", e => {
        const btn = e.target.closest(".tab"); if (!btn) return;
        $$(".tab", set).forEach(t => t.classList.toggle("is-active", t === btn));
        const key = btn.dataset.tab;
        panel.innerHTML = UI.carousel(cfg.tabsMap[key], cfg.cols);
        UI.initCarousels(panel);
      });
    });
  };

  /* Accordions (FAQ + mobile menu) — generic toggle. */
  UI.initAccordions = function (root = document) {
    $$(".accordion__btn, .mobile-acc__btn", root).forEach(btn => {
      if (btn.dataset.bound) return; btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        const panel = btn.nextElementSibling;
        if (panel) panel.classList.toggle("is-open", !open);
      });
    });
  };

  /* "Load more" buttons: reveal hidden cards in a grid. */
  UI.initLoadMore = function (root = document) {
    $$("[data-loadmore]", root).forEach(btn => {
      if (btn.dataset.bound) return; btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const grid = document.getElementById(btn.dataset.loadmore);
        const hidden = $$(".card[hidden]", grid).slice(0, 4);
        hidden.forEach(c => c.removeAttribute("hidden"));
        if (!$(".card[hidden]", grid)) btn.closest(".loadmore-wrap").remove();
      });
    });
  };

  /* ============================================================
     WISHLIST (localStorage)
     ============================================================ */
  const WISH_KEY = "discoverAU.wishlist";
  const Wish = {
    items() { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch { return []; } },
    save(v) { localStorage.setItem(WISH_KEY, JSON.stringify(v)); },
    has(id) { return this.items().some(i => i.id === id); },
    toggle(item) {
      const list = this.items(); const i = list.findIndex(x => x.id === item.id);
      if (i > -1) list.splice(i, 1); else list.push(item);
      this.save(list); return i === -1;
    },
    remove(id) { this.save(this.items().filter(i => i.id !== id)); }
  };
  window.Wish = Wish;

  /* Paint a wishlist control (heart icon or text button) to match saved state. */
  function paintFav(b, on) {
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", String(on));
    if (b.classList.contains("btn--wish")) {
      const s = b.querySelector("span");
      if (s) s.textContent = on ? "Saved to wishlist" : "Save to wishlist";
    }
  }
  UI.syncFavs = function (root = document) {
    $$("[data-fav]", root).forEach(b => paintFav(b, Wish.has(b.dataset.fav)));
    const count = Wish.items().length;
    const badge = document.getElementById("wishCount");
    if (badge) { badge.textContent = count; badge.dataset.empty = count === 0; }
  };

  UI.renderWishlist = function () {
    const list = document.getElementById("wishlistList");
    const items = Wish.items();
    if (!items.length) { list.innerHTML = `<p class="wishlist-empty">No saved trips yet.<br>Tap the ♥ on any trip to save it here.</p>`; return; }
    list.innerHTML = items.map(i => `
      <div class="wishlist-row">
        <img src="${i.img}" alt="${esc(i.title)}" loading="lazy" />
        <a href="${safeRoute(i.route)}" data-link><strong>${esc(i.title)}</strong></a>
        <button class="icon-btn rm" data-rm="${esc(i.id)}" aria-label="Remove ${esc(i.title)}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>
      </div>`).join("");
  };

  /* Delegated fav + remove clicks (works for heart icons and text buttons) */
  document.addEventListener("click", e => {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      e.preventDefault();
      const added = Wish.toggle({ id: fav.dataset.fav, title: fav.dataset.title, img: fav.dataset.img, route: fav.dataset.route });
      paintFav(fav, added);
      UI.syncFavs(); UI.renderWishlist();
      return;
    }
    const rm = e.target.closest("[data-rm]");
    if (rm) { Wish.remove(rm.dataset.rm); UI.syncFavs(); UI.renderWishlist(); }
  });

  /* ============================================================
     HEADER: mega menu, mobile drawer, search, wishlist drawer
     ============================================================ */
  UI.buildHeaderNav = function () {
    const nav = document.getElementById("primaryNav");
    // Top-level items are menu TRIGGERS (buttons), not links — they do not navigate.
    nav.innerHTML = NAV.map((n, idx) => `
      <div class="nav-item">
        <button type="button" class="nav-link" data-nav="${n.route}" aria-expanded="false" aria-haspopup="true" aria-controls="mega-${idx}">
          ${esc(n.label)}
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="mega mega--simple" id="mega-${idx}" role="menu">
          <div class="mega-list mega-list--${n.kind}">
            ${n.links.map(([t, r]) => `<a href="${r}" data-link role="menuitem">${esc(t)}</a>`).join("")}
          </div>
          <div class="mega-foot">
            <a href="${n.footRoute}" data-link>${esc(n.footLabel)} →</a>
          </div>
        </div>
      </div>`).join("");

    const items = $$(".nav-item", nav);
    const closeAll = (except) => items.forEach(it => {
      if (it === except) return;
      it.classList.remove("is-open");
      $(".nav-link", it).setAttribute("aria-expanded", "false");
    });
    items.forEach(item => {
      const link = $(".nav-link", item), mega = $(".mega", item);
      let timer;
      const open = () => { clearTimeout(timer); closeAll(item); item.classList.add("is-open"); link.setAttribute("aria-expanded", "true"); };
      const close = (delay = 160) => { clearTimeout(timer); timer = setTimeout(() => { item.classList.remove("is-open"); link.setAttribute("aria-expanded", "false"); }, delay); };
      // hover (with grace delay so the cursor can reach the centered panel)
      item.addEventListener("mouseenter", open);
      item.addEventListener("mouseleave", () => close());
      mega.addEventListener("mouseenter", () => clearTimeout(timer));
      mega.addEventListener("mouseleave", () => close());
      // click toggles (no navigation), and keyboard focus opens
      link.addEventListener("click", () => item.classList.contains("is-open") ? close(0) : open());
      link.addEventListener("focus", open);
      // close when a menu link is chosen
      mega.addEventListener("click", e => { if (e.target.closest("a")) close(0); });
    });
    // click outside closes any open menu
    document.addEventListener("click", e => { if (!e.target.closest(".nav-item")) closeAll(); });
    nav.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

    // mobile accordions
    const macc = document.getElementById("mobileAccordions");
    macc.innerHTML = NAV.map(n => `
      <div class="mobile-acc">
        <button class="mobile-acc__btn" aria-expanded="false">
          ${esc(n.label)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="mobile-acc__panel">
          ${n.links.map(([t, r]) => `<a href="${r}" data-link>${esc(t)}</a>`).join("")}
          <a href="${n.footRoute}" data-link><strong>${esc(n.footLabel)} →</strong></a>
        </div>
      </div>`).join("");
    UI.initAccordions(macc);
  };

  UI.initHeaderUI = function () {
    const scrim = document.getElementById("scrim");
    const openScrim = () => { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("is-open")); document.body.style.overflow = "hidden"; };
    const closeScrim = () => { scrim.classList.remove("is-open"); document.body.style.overflow = ""; setTimeout(() => scrim.hidden = true, 280); };

    const mobileNav = document.getElementById("mobileNav");
    const wishDrawer = document.getElementById("wishlistDrawer");
    const searchOv = document.getElementById("searchOverlay");

    const closeAll = () => {
      mobileNav.classList.remove("is-open"); mobileNav.setAttribute("aria-hidden", "true");
      wishDrawer.classList.remove("is-open"); wishDrawer.setAttribute("aria-hidden", "true");
      searchOv.classList.remove("is-open"); searchOv.setAttribute("aria-hidden", "true");
      closeScrim();
    };
    window.__closeOverlays = closeAll;

    // Mobile menu
    document.getElementById("hamburger").addEventListener("click", () => { closeAll(); mobileNav.classList.add("is-open"); mobileNav.setAttribute("aria-hidden", "false"); openScrim(); });
    document.getElementById("mobileClose").addEventListener("click", closeAll);

    // Wishlist
    document.getElementById("wishlistBtn").addEventListener("click", () => { closeAll(); UI.renderWishlist(); wishDrawer.classList.add("is-open"); wishDrawer.setAttribute("aria-hidden", "false"); openScrim(); });
    document.getElementById("wishlistClose").addEventListener("click", closeAll);

    // Search
    const open = () => { closeAll(); searchOv.classList.add("is-open"); searchOv.setAttribute("aria-hidden", "false"); openScrim(); setTimeout(() => document.getElementById("searchInput").focus(), 50); };
    document.getElementById("searchBtn").addEventListener("click", open);
    document.getElementById("searchClose").addEventListener("click", closeAll);
    document.getElementById("searchForm").addEventListener("submit", e => e.preventDefault());
    document.getElementById("searchInput").addEventListener("input", e => UI.runSearch(e.target.value));

    scrim.addEventListener("click", closeAll);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });
  };

  /* ============================================================
     FORM SUBMIT → Google Apps Script → Google Sheet
     Uses a "simple" POST (no preflight/CORS headaches). With
     mode:"no-cors" the response is opaque, so we treat a resolved
     request as success (validation already happened client-side).
     ============================================================ */
  UI.submitToSheet = function (formType, data) {
    if (typeof SHEET_ENDPOINT === "undefined" || !SHEET_ENDPOINT || SHEET_ENDPOINT.indexOf("PASTE_YOUR") === 0) {
      console.warn("[forms] SHEET_ENDPOINT not set in js/config.js — running in demo mode.");
      return Promise.resolve({ demo: true });
    }
    const body = new URLSearchParams(Object.assign({ formType: formType, page: location.hash || "#/home" }, data));
    return fetch(SHEET_ENDPOINT, { method: "POST", mode: "no-cors", body: body });
  };

  /* Search across the data index (built in main.js) */
  UI.runSearch = function (q) {
    const box = document.getElementById("searchResults");
    q = (q || "").trim().toLowerCase();
    if (!q) { box.innerHTML = ""; return; }
    const hits = (window.SEARCH_INDEX || []).filter(i => i.title.toLowerCase().includes(q)).slice(0, 8);
    box.innerHTML = hits.length
      ? hits.map(i => `<a href="${i.route}" data-link><img src="${i.img}" alt=""><span><strong>${esc(i.title)}</strong>${i.meta ? ` · <small>${esc(i.meta)}</small>` : ""}</span></a>`).join("")
      : `<p class="wishlist-empty">No matches for “${esc(q)}”.</p>`;
  };

  /* Hero slideshow — auto-rotate images on an interval (one hero at a time). */
  let heroTimer = null;
  UI.initHero = function (root) {
    if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
    const hero = root.querySelector("[data-hero-slides]");
    if (!hero) return;
    const slides = $$(".hero__slide", hero);
    if (slides.length < 2) return;
    let i = 0;
    heroTimer = setInterval(() => {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 5000);
  };

  /* Auto-shuffling traveller reviews — cross-fade through testimonials. */
  let reviewTimer = null;
  UI.initReviews = function (root) {
    if (reviewTimer) { clearInterval(reviewTimer); reviewTimer = null; }
    const box = root.querySelector("[data-reviews]");
    if (!box) return;
    const slides = $$(".review", box);
    const dots = $$(".reviews__dots button", box);
    if (slides.length < 2) return;
    let i = 0;
    const go = (n) => {
      slides[i].classList.remove("is-active"); if (dots[i]) dots[i].classList.remove("is-active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-active"); if (dots[i]) dots[i].classList.add("is-active");
    };
    const start = () => { reviewTimer = setInterval(() => go(i + 1), 4500); };
    const restart = (n) => { clearInterval(reviewTimer); go(n); start(); };
    dots.forEach((d, idx) => d.addEventListener("click", () => restart(idx)));
    const prev = box.querySelector(".reviews__arrow--prev");
    const next = box.querySelector(".reviews__arrow--next");
    if (prev) prev.addEventListener("click", () => restart(i - 1));
    if (next) next.addEventListener("click", () => restart(i + 1));
    start();
  };

  /* Floating glass header — add a class once the page is scrolled. */
  UI.initScrollGlass = function () {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-floating", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  };

  /* Glass filter sheet — a floating filter icon that opens a glass panel of
     filter chips once the page is scrolled. Per-view; one active at a time. */
  let curFilter = null;
  UI.initFilterSheet = function (root) {
    const fab = root.querySelector(".filter-fab");
    const sheet = root.querySelector(".filter-sheet");
    curFilter = (fab && sheet) ? { fab, sheet } : null;
    if (!curFilter) return;
    const open = () => { sheet.hidden = false; requestAnimationFrame(() => sheet.classList.add("is-open")); fab.setAttribute("aria-expanded", "true"); };
    const close = () => { sheet.classList.remove("is-open"); fab.setAttribute("aria-expanded", "false"); setTimeout(() => { sheet.hidden = true; }, 240); };
    sheet._close = close;
    fab.onclick = () => sheet.classList.contains("is-open") ? close() : open();
    const closeBtn = sheet.querySelector(".filter-sheet__close");
    if (closeBtn) closeBtn.onclick = close;
  };
  /* Global listeners installed once; they act on the current view's filter. */
  UI.initFilterGlobals = function () {
    window.addEventListener("scroll", () => {
      if (!curFilter) return;
      curFilter.fab.classList.toggle("is-visible", window.scrollY > 240);
    }, { passive: true });
    document.addEventListener("click", e => {
      if (!curFilter) return;
      const { fab, sheet } = curFilter;
      if (sheet.classList.contains("is-open") && !sheet.contains(e.target) && !fab.contains(e.target)) sheet._close();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && curFilter && curFilter.sheet.classList.contains("is-open")) curFilter.sheet._close();
    });
  };

  /* Run all component initialisers within a freshly-rendered view */
  /* Tilted "pile of photos" — auto-rotates the front photo to the back. */
  let destTimer = null;
  UI.initDestStack = function (root) {
    if (destTimer) { clearInterval(destTimer); destTimer = null; }
    const stack = root.querySelector("[data-dest-stack]");
    if (!stack) return;
    const photos = $$(".dest-photo", stack);
    if (photos.length < 2) return;
    const rots = [0, -6, 5, -3, 7];
    let order = photos.map((_, i) => i);
    const apply = () => order.forEach((idx, pos) => {
      const el = photos[idx];
      el.style.zIndex = String(photos.length - pos);
      el.style.transform = `translate(${pos * 16}px, ${pos * 12}px) rotate(${rots[pos % rots.length]}deg) scale(${1 - pos * 0.05})`;
      el.style.opacity = pos > 3 ? "0" : "1";
    });
    apply();
    destTimer = setInterval(() => { order.push(order.shift()); apply(); }, 2800);
  };

  UI.hydrate = function (root) {
    UI.initHero(root);
    UI.initReviews(root);
    UI.initFilterSheet(root);
    UI.initDestStack(root);
    UI.initCarousels(root);
    UI.initTabsets(root);
    UI.initAccordions(root);
    UI.initLoadMore(root);
    UI.syncFavs(root);
  };

  /* ============================================================
     LEAD-CAPTURE POPUP (dismissible, styled to the site)
     ============================================================ */
  const LEAD_KEY = "himalaya.lead";
  UI.initLeadPopup = function () {
    const modal = document.getElementById("leadModal");
    if (!modal) return;
    const done = () => { try { return localStorage.getItem(LEAD_KEY); } catch { return null; } };
    const show = () => { if (done()) return; modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); };
    const hide = (remember) => {
      modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true");
      if (remember) { try { localStorage.setItem(LEAD_KEY, "1"); } catch {} }
    };
    // open after a short delay on first visit
    if (!done()) setTimeout(show, 6000);

    modal.querySelectorAll("[data-lead-dismiss]").forEach(b => b.addEventListener("click", () => hide(false)));
    modal.querySelector(".lead-modal__scrim").addEventListener("click", () => hide(false));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("is-open")) hide(false); });

    const form = document.getElementById("leadForm");
    const msg = document.getElementById("leadMsg");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]');
      const phone = form.querySelector('[name="phone"]');
      const email = form.querySelector('[name="email"]');
      if (!name.value.trim()) { msg.textContent = "Please enter your name."; msg.classList.add("is-error"); name.focus(); return; }
      if (!phone.value.trim()) { msg.textContent = "Please enter your phone number."; msg.classList.add("is-error"); phone.focus(); return; }
      if (email.value.trim() && !email.checkValidity()) { msg.textContent = "Please enter a valid email, or leave it blank."; msg.classList.add("is-error"); email.focus(); return; }
      msg.classList.remove("is-error");
      const data = Object.fromEntries(new FormData(form).entries());
      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true; msg.textContent = "Sending…";
      UI.submitToSheet("lead", data)
        .then(() => {
          msg.textContent = "✓ Thank you! We'll be in touch with trip ideas soon.";
          form.querySelectorAll("input, select, button[type=submit]").forEach(el => el.disabled = true);
          setTimeout(() => hide(true), 1500);
        })
        .catch(() => { msg.textContent = "Network error — please try again."; msg.classList.add("is-error"); submitBtn.disabled = false; });
    });
    // expose a manual opener (e.g. from a CTA)
    window.__openLead = () => { modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); };
  };
})();
