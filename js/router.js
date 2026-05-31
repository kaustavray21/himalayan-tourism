/* ============================================================
   router.js — hash router that swaps views inside index.html
   Routes are registered by main.js on window.ROUTES.
   ============================================================ */
(function () {
  "use strict";

  const ROUTES = (window.ROUTES = window.ROUTES || {});
  const TITLES = {
    home: "Himalayan Tourism — Where the mountains call",
    packages: "Tour packages — Himalayan Tourism",
    package: "Package details — Himalayan Tourism",
    activities: "Things to do — Himalayan Tourism",
    albums: "Photo albums — Himalayan Tourism",
    contact: "Contact us — Himalayan Tourism"
  };

  function parse() {
    let hash = location.hash.replace(/^#\/?/, "").trim();   // "destination/sydney"
    if (!hash) return { view: "home", param: null };
    const [view, ...rest] = hash.split("/");
    return { view, param: rest.join("/") || null };
  }

  function setActiveNav(view) {
    document.querySelectorAll(".nav-link[data-nav]").forEach(a => {
      const target = a.dataset.nav.replace(/^#\//, "");
      a.classList.toggle("is-current", target === view);
      a.setAttribute("aria-current", target === view ? "page" : "false");
    });
  }

  function render() {
    let { view, param } = parse();
    if (!ROUTES[view]) view = "home";

    // Toggle the visible view section
    const sections = document.querySelectorAll(".view");
    let active = null;
    sections.forEach(s => {
      const on = s.dataset.view === view;
      s.classList.toggle("is-active", on);
      if (on) active = s;
    });

    // Render content into the active section
    if (active) {
      ROUTES[view](active, param);
      window.UI && UI.hydrate(active);
    }

    setActiveNav(view);
    document.title = TITLES[view] || TITLES.home;
    if (window.__closeOverlays) window.__closeOverlays();
    // Always jump to the top of the new view instantly (no smooth animation,
    // so a short page like Contact never momentarily shows the footer).
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }

  window.__renderRoute = render;

  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", () => {
    if (!location.hash) location.replace("#/home");
  });

  // Intercept in-app links (data-link) so plain anchors update the hash cleanly.
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-link]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (href && href.startsWith("#/")) {
      // default anchor behaviour already updates the hash; just ensure same-hash re-render
      if (href === location.hash) { e.preventDefault(); render(); }
    }
  });

  window.__startRouter = render;
})();
