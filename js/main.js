/* ============================================================
   main.js — render each view + boot the app
   Views: home · packages · package (detail) · contact
   ============================================================ */
(function () {
  "use strict";
  const ROUTES = (window.ROUTES = window.ROUTES || {});
  const esc = window.__esc;

  const ICN = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    food:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3M6 12v9M18 3c-1.5 0-3 1.5-3 5s1.5 4 3 4v9"/></svg>',
    bed:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6h18v6M3 12V8h10v4M3 18v2M21 18v2"/></svg>',
    walk:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="4" r="2"/><path d="M11 7l-2 5 3 2 1 6M9 12l-3 1M14 9l3 2"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6 6l1-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7A2 2 0 0 1 22 16.9Z"/></svg>',
    mail:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>',
    pin:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    chat:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z"/></svg>',
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M17 11a3 3 0 1 0-2-5.2"/></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6a4 4 0 0 0 4-4V9M16 5h-6a4 4 0 0 0-4 4v6"/></svg>'
  };

  /* ---------- wishlist controls (localStorage-backed via Wish/syncFavs) ---------- */
  const HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-4.35-9.5-8.5C.5 9 2 5.5 5.5 5.5 8 5.5 9.5 7.5 12 10c2.5-2.5 4-4.5 6.5-4.5C22 5.5 23.5 9 21.5 12.5 19 16.65 12 21 12 21Z"/></svg>';
  const wishData = (p) => `data-fav="${esc(p.id)}" data-title="${esc(p.placeName ? p.placeName + " · " + p.days + " Days" : p.name)}" data-img="${p.img}" data-route="#/package/${p.id}"`;
  function favHeart(p) {
    return `<button class="card__fav" ${wishData(p)} aria-label="Save ${esc(p.placeName || p.name)} to wishlist" aria-pressed="false">${HEART}</button>`;
  }
  function wishButton(p) {
    return `<button class="btn btn--outline btn--wish" ${wishData(p)} aria-pressed="false">${HEART}<span>Save to wishlist</span></button>`;
  }

  /* ---------- card builders ---------- */
  function pkgCard(p) {
    return `
      <article class="card">
        <a class="card__media" href="#/package/${p.id}" data-link aria-label="${esc(p.name)}">
          <img loading="lazy" decoding="async" src="${p.img}" alt="${esc(p.name)}">
          <span class="card__badge card__badge--top">${p.days} Days</span>
        </a>
        ${favHeart(p)}
        <a class="card__body" href="#/package/${p.id}" data-link>
          <span class="card__kicker">${esc(p.placeName)} · ${esc(p.state)}</span>
          <span class="card__title">${esc(p.name)}</span>
          <span class="card__desc">${esc(p.summary)}</span>
        </a>
      </article>`;
  }
  /* Floating glass "Filters" icon + panel (shared by packages & activities) */
  function filterFabSheet(groupsHTML) {
    return `
      <button class="filter-fab" aria-expanded="false" aria-label="Open filters">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/><circle cx="9" cy="6" r="2" fill="#fff"/><circle cx="15" cy="12" r="2" fill="#fff"/><circle cx="11" cy="18" r="2" fill="#fff"/></svg>
        Filters
      </button>
      <div class="filter-sheet" hidden role="dialog" aria-label="Filters">
        <div class="filter-sheet__head"><strong>Filters</strong>
          <button class="filter-sheet__close icon-btn" aria-label="Close filters"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>
        </div>
        <div class="filter-sheet__body">${groupsHTML}</div>
      </div>`;
  }

  /* carousel from pre-rendered package cards (UI.carousel expects data objects, so build directly) */
  function pkgCarousel(list, cols) {
    return `<div class="carousel carousel--${cols || 4}" data-carousel>
      <button class="carousel__btn carousel__btn--prev" aria-label="Previous" data-dir="-1" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
      <div class="carousel__track">${list.map(pkgCard).join("")}</div>
      <button class="carousel__btn carousel__btn--next" aria-label="Next" data-dir="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
    </div>`;
  }
  function pillars() {
    const item = (ico, h, t) => `
      <div class="card3d">
        <div class="card3d__ico">${ICN[ico]}</div>
        <h3 class="card3d__title">${h}</h3>
        <p>${t}</p>
      </div>`;
    return `
      <section class="section pillars-sec" style="background-image:url('${HM.alt3}')">
        <div class="pillars-sec__scrim"></div>
        ${UI.sectionHead("Why us", "Travel with local experts")}
        <div class="container"><div class="cards-3d">
          ${item("shield", "Handpicked & safe", "Vetted stays, licensed guides and 24×7 on-trip support.")}
          ${item("users", "Small groups", "Intimate departures and easy tailor-made private trips.")}
          ${item("route", "Everything planned", "Stays, transfers, permits and meals — sorted end to end.")}
        </div></div>
      </section>`;
  }
  function contactBand() {
    return `
      <section class="section section--alt">
        <div class="container">
          <div class="banner">
            <div class="banner__media"><img loading="lazy" src="${CONTACT.img}" alt="${esc(CONTACT.owner)}"></div>
            <div class="banner__body">
              <span class="eyebrow">Talk to a local expert</span>
              <h2>Plan your trip with ${esc(CONTACT.owner)}</h2>
              <p>${esc(CONTACT.blurb)}</p>
              <a class="btn btn--primary" href="#/contact" data-link>Contact us</a>
            </div>
          </div>
        </div>
      </section>`;
  }

  /* ---------------- HOME ---------------- */
  ROUTES.home = function (view) {
    const featured = HOME.featuredIds.map(id => PACKAGES.find(p => p.id === id)).filter(Boolean);
    view.innerHTML = `
      ${UI.hero(HOME.hero)}

      <section class="section">
        ${UI.sectionHead("Tour packages", "Featured Himalayan trips", "Fixed-departure and tailor-made trips across the Indian Himalaya.", ["View all packages", "#/packages"])}
        <div class="container">${pkgCarousel(featured, 4)}</div>
      </section>

      <section class="section section--alt">
        ${UI.sectionHead("Destinations", "Where would you like to go?", "Two Himalayan favourites — each with 3 trips of different lengths.")}
        <div class="container">
          <div class="dest-feature">
            <div class="dest-stack" data-dest-stack aria-hidden="true">
              ${[PLACES[0].img, PLACES[1].img, ACTIVITIES[2].img, ACTIVITIES[8].img, ACTIVITIES[4].img]
                .map(src => `<div class="dest-photo"><img loading="lazy" decoding="async" src="${src}" alt=""></div>`).join("")}
            </div>
            <div class="dest-list">
              ${PLACES.map(p => `
                <a class="dest-link" href="#/packages/${p.id}" data-link>
                  <span class="dest-link__name">${esc(p.name)}</span>
                  <span class="dest-link__meta">${esc(p.state)} · 3 trips</span>
                </a>`).join("")}
              <a class="dest-link dest-link--all" href="#/packages" data-link>
                <span class="dest-link__name">All packages</span>
                <span class="dest-link__meta">Browse every trip →</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      ${reviewsBlock()}
      ${pillars()}
      ${contactBand()}`;
  };

  /* ---------------- PACKAGES (list + filters) ---------------- */
  ROUTES.packages = function (view, param) {
    let initPlace = "all", initDur = "any";
    if (param) { if (param.indexOf("dur/") === 0) initDur = param.slice(4); else initPlace = param; }

    const chip = (g, v, label, active) => `<button class="tab${active ? " is-active" : ""}" data-fg="${g}" data-fv="${v}">${label}</button>`;
    const placeChips = (sel) => [chip("place", "all", "All", sel === "all")]
      .concat(PLACES.map(p => chip("place", p.id, p.name, sel === p.id))).join("");
    const durChips = (sel) => [["any", "Any length"], ["short", "3 Days"], ["medium", "5 Days"], ["long", "7 Days"]]
      .map(([v, l]) => chip("dur", v, l, sel === v)).join("");
    const groups = (ip, id) => `
      <div class="pkg-filtergroup"><span>Destination</span>${placeChips(ip)}</div>
      <div class="pkg-filtergroup"><span>Duration</span>${durChips(id)}</div>`;

    const rows = PACKAGES.map(p => `
      <article class="pkg-card" data-place="${p.placeId}" data-dur="${p.durKey}">
        <div class="pkg-card__media">
          <a href="#/package/${p.id}" data-link aria-label="${esc(p.name)}">
            <img loading="lazy" decoding="async" src="${p.img}" alt="${esc(p.name)}">
            <span class="pkg-card__region">${p.days} Days</span>
          </a>
          ${favHeart(p)}
        </div>
        <div class="pkg-card__body">
          <h3>${esc(p.placeName)} · ${p.days} Days</h3>
          <div class="pkg-card__facts"><span><b>${p.state}</b></span><span>Difficulty: <b>${esc(p.difficulty)}</b></span><span>Best: <b>${esc(p.bestTime)}</b></span></div>
          <p class="card__desc">${esc(p.summary)}</p>
          <div class="pkg-card__tags">${p.highlights.slice(0, 3).map(t => `<span class="pkg-tag">${esc(t)}</span>`).join("")}</div>
        </div>
        <div class="pkg-card__aside">
          <a class="btn btn--primary" href="#/package/${p.id}" data-link>View</a>
          <a class="btn btn--outline" href="#/contact" data-link>Enquire</a>
        </div>
      </article>`).join("");

    view.innerHTML = `
      <section class="pkg-head"><div class="container">
        <h1>Tour packages</h1>
        <p>Two Himalayan destinations, each offered as a 3, 5 or 7-day trip. Filter by where you want to go and how long you have.</p>
      </div></section>
      <div class="pkg-filters"><div class="container"><div class="row">
        ${groups(initPlace, initDur)}
        <span class="pkg-count" id="pkgCount"></span>
      </div></div></div>
      <div class="container"><div class="pkg-list" id="pkgList">${rows}
        <p class="pkg-empty" id="pkgEmpty" hidden>No trips match those filters. Try widening your search.</p>
      </div></div>
      ${filterFabSheet(groups(initPlace, initDur))}`;

    const state = { place: initPlace, dur: initDur };
    const apply = () => {
      let n = 0;
      view.querySelectorAll(".pkg-card").forEach(card => {
        const okP = state.place === "all" || card.dataset.place === state.place;
        const okD = state.dur === "any" || card.dataset.dur === state.dur;
        const show = okP && okD; card.hidden = !show; if (show) n++;
      });
      view.querySelector("#pkgCount").textContent = n + " trip" + (n === 1 ? "" : "s");
      view.querySelector("#pkgEmpty").hidden = n > 0;
    };
    // chips appear both inline and in the glass sheet — mirror active state by value
    view.querySelectorAll("[data-fg]").forEach(b => b.addEventListener("click", () => {
      const g = b.dataset.fg, v = b.dataset.fv;
      state[g === "place" ? "place" : "dur"] = v;
      view.querySelectorAll(`[data-fg="${g}"]`).forEach(x => x.classList.toggle("is-active", x.dataset.fv === v));
      apply();
    }));
    apply();
  };

  /* ---------------- PACKAGE detail ---------------- */
  ROUTES.package = function (view, slug) {
    const p = PACKAGES.find(x => x.id === slug) || PACKAGES[0];
    const itin = p.itinerary.map(d => `
      <div class="itin__item">
        <div class="itin__day">D${d.day}</div>
        <div class="itin__card">
          <h4>${esc(d.title)}</h4>
          <div class="itin__meta">
            <div class="line">${ICN.walk}<span class="itin__acts">${d.activities.map(a => `<a href="#/activities/${p.placeId}" data-link title="See activities in ${esc(p.placeName)}">${esc(a)}</a>`).join("")}</span></div>
            <div class="line">${ICN.food}<span><b>Food:</b> ${esc(d.food)}</span></div>
            <div class="line">${ICN.bed}<span><b>Stay:</b> ${esc(d.stay)}</span></div>
          </div>
        </div>
      </div>`).join("");

    const alsoSame = pkgsByPlace(p.placeId).filter(x => x.id !== p.id);
    const alsoOther = PACKAGES.filter(x => x.placeId !== p.placeId && x.durKey === p.durKey).slice(0, 3);
    const also = alsoSame.concat(alsoOther).slice(0, 3);

    view.innerHTML = `
      <section class="pkg-detail__hero">
        <img src="${p.img}" alt="${esc(p.name)}" fetchpriority="high">
        <div class="container pkg-detail__heroinner">
          <a class="crumb" href="#/packages" data-link>← All packages</a>
          <h1>${esc(p.placeName)} · ${p.days} Days</h1>
          <div class="pkg-detail__facts">
            <div><span class="k">Destination</span><span class="v">${esc(p.placeName)}, ${esc(p.state)}</span></div>
            <div><span class="k">Duration</span><span class="v">${p.days} days / ${p.days - 1} nights</span></div>
            <div><span class="k">Difficulty</span><span class="v">${esc(p.difficulty)}</span></div>
            <div><span class="k">Best time</span><span class="v">${esc(p.bestTime)}</span></div>
          </div>
        </div>
      </section>

      <div class="container">
        <div class="pkg-detail__layout">
          <div>
            <h2>Overview</h2>
            <p style="margin-top:10px;font-size:1.06rem">${esc(p.summary)}</p>
            <h2 style="margin-top:36px">Day-by-day itinerary</h2>
            <p style="margin:8px 0 22px">Your ${p.days}-day plan — tailored to your dates, fitness and pace.</p>
            <div class="itin">${itin}</div>
          </div>
          <aside class="pkg-aside">
            <div class="pkg-book">
              <p class="pkg-book__lead">Get a tailored quote for your dates, group size and hotel category.</p>
              <a class="btn btn--primary" href="#/contact" data-link>Enquire / Book</a>
              ${wishButton(p)}
              <a class="btn btn--outline" href="#/packages/${p.placeId}" data-link>Other ${esc(p.placeName)} trips</a>
            </div>
            <div class="pkg-incl">
              <h4>What's included</h4>
              <ul>${p.inclusions.map(i => `<li>${ICN.check}${esc(i)}</li>`).join("")}</ul>
            </div>
            <div class="pkg-food">
              <h4>Food on this trip</h4>
              <p>${esc(p.foodNote)}</p>
            </div>
          </aside>
        </div>
      </div>

      <section class="section section--alt">
        ${UI.sectionHead("More trips", "You might also like")}
        <div class="container"><div class="home-pkg">${also.map(pkgCard).join("")}</div></div>
      </section>`;
  };

  /* ---------------- CONTACT ---------------- */
  ROUTES.contact = function (view) {
    const c = CONTACT;
    const socialIco = {
      Instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>',
      Facebook: '<path d="M14 9h3V5h-3a4 4 0 0 0-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9a1 1 0 0 1 1-1Z"/>',
      WhatsApp: '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z"/><path d="M8.5 8.5c0 4 3 7 7 7"/>',
      YouTube: '<rect x="2" y="5" width="20" height="14" rx="4"/><polygon points="10 9 16 12 10 15 10 9" fill="currentColor" stroke="none"/>'
    };
    view.innerHTML = `
      <section class="pkg-head"><div class="container">
        <h1>Contact us</h1>
        <p>Questions about a trek, custom dates or a private group? Reach our team directly — we usually reply within one business day.</p>
      </div></section>

      <div class="container"><div class="contact-wrap">
        <div class="contact-card">
          <img src="${c.img}" alt="${esc(c.owner)}">
          <div class="contact-card__body">
            <h3>${esc(c.owner)}</h3>
            <div class="contact-card__role">${esc(c.role)}</div>
            <div class="contact-list">
              <a href="tel:${c.phone.replace(/\s/g, "")}">${ICN.phone}<span>${esc(c.phone)}<br><small>Call or text</small></span></a>
              <a href="https://wa.me/${c.whatsapp.replace(/[^0-9]/g, "")}">${ICN.chat}<span>WhatsApp<br><small>${esc(c.whatsapp)}</small></span></a>
              <a href="mailto:${c.email}">${ICN.mail}<span>${esc(c.email)}</span></a>
              <div>${ICN.pin}<span>${esc(c.address)}<br><small>${esc(c.hours)}</small></span></div>
            </div>
            <div class="contact-socials">
              ${c.socials.map(([name, url]) => `<a href="${url}" aria-label="${name}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">${socialIco[name] || ""}</svg></a>`).join("")}
            </div>
          </div>
        </div>

        <div class="contact-intro">
          <h2>Plan your Himalayan journey</h2>
          <p>${esc(c.blurb)}</p>
          <form class="contact-form" id="contactForm" novalidate>
            <div class="row2">
              <div><label for="cName">Name</label><input id="cName" name="name" type="text" required placeholder="Your name"></div>
              <div><label for="cEmail">Email</label><input id="cEmail" name="email" type="email" required placeholder="you@example.com"></div>
            </div>
            <div class="row2">
              <div><label for="cPhone">Phone</label>
                <div class="phone-group">
                  <select name="countryCode" class="cc-select" aria-label="Country dialing code">
                    ${COUNTRY_CODES.map(([code, iso]) => `<option value="${code}"${code === "+91" ? " selected" : ""}>${esc(iso)} ${code}</option>`).join("")}
                  </select>
                  <input id="cPhone" name="phone" type="tel" placeholder="98xxx xxxxx" autocomplete="tel-national">
                </div>
              </div>
              <div><label for="cPkg">Trip of interest</label>
                <select id="cPkg" name="package"><option value="">Not sure yet</option>${PACKAGES.map(p => `<option>${esc(p.name)}</option>`).join("")}</select>
              </div>
            </div>
            <div><label for="cMsg">Message</label><textarea id="cMsg" name="message" rows="4" placeholder="Tell us your dates, group size and what you'd love to see…"></textarea></div>
            <div><button type="submit" class="btn btn--primary">Send enquiry</button>
              <span class="lead-msg" id="contactMsg" role="status" aria-live="polite" style="display:inline-block;margin-left:12px"></span></div>
          </form>
        </div>
      </div></div>`;

    const form = view.querySelector("#contactForm");
    const msg = view.querySelector("#contactMsg");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const email = form.querySelector('[name="email"]');
      const name = form.querySelector('[name="name"]');
      if (!name.value.trim() || !email.checkValidity()) { msg.textContent = "Please add your name and a valid email."; msg.classList.add("is-error"); return; }
      msg.classList.remove("is-error");
      const data = Object.fromEntries(new FormData(form).entries());
      if (data.phone) data.phone = ((data.countryCode || "") + " " + data.phone).trim();
      delete data.countryCode;
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true; msg.textContent = "Sending…";
      UI.submitToSheet("contact", data)
        .then(() => { msg.textContent = "✓ Thanks! Your enquiry has been sent — we'll reply within a day."; form.reset(); btn.disabled = false; })
        .catch(() => { msg.textContent = "Network error — please try again."; msg.classList.add("is-error"); btn.disabled = false; });
    });
  };

  /* ---------------- ACTIVITIES + traveller ratings ---------------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function initialsOf(name) {
    return name.split(/\s+/).filter(w => /[A-Za-z]/.test(w[0] || "")).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "★";
  }
  function reviewsBlock() {
    const list = shuffle(REVIEWS);
    const slides = list.map((r, i) => `
      <figure class="review${i === 0 ? " is-active" : ""}">
        <div class="review__bg" style="background-image:url('${r.img}')"></div>
        <div class="review__content">
          <div class="review__stars" aria-label="${r.rating} out of 5">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
          <blockquote>“${esc(r.text)}”</blockquote>
          <figcaption class="review__by">
            <span class="review__avatar" aria-hidden="true">${initialsOf(r.name)}</span>
            <span class="review__who"><strong>${esc(r.name)}</strong><small>${esc(r.place)}</small></span>
          </figcaption>
        </div>
      </figure>`).join("");
    const dots = list.map((_, i) => `<button class="${i === 0 ? "is-active" : ""}" aria-label="Story ${i + 1}"></button>`).join("");
    return `
      <section class="section section--alt">
        ${UI.sectionHead("Loved by travellers", "Traveller stories")}
        <div class="container">
          <div class="reviews" data-reviews>
            <button class="reviews__arrow reviews__arrow--prev" aria-label="Previous story"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div class="reviews__viewport">${slides}</div>
            <button class="reviews__arrow reviews__arrow--next" aria-label="Next story"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>
            <div class="reviews__dots">${dots}</div>
          </div>
        </div>
      </section>`;
  }

  function actCard(a) {
    return `
      <a class="act-card" href="#/packages/${a.placeId}" data-link data-place="${a.placeId}" aria-label="${esc(a.name)} — ${esc(a.place)}">
        <div class="act-card__media"><img loading="lazy" src="${a.img}" alt="${esc(a.name)}"></div>
        <div class="act-card__body">
          <span class="act-card__place">${esc(a.place)}, ${esc(a.state)}</span>
          <span class="act-card__name">${esc(a.name)}</span>
        </div>
      </a>`;
  }
  function blogSection() {
    const cards = FAQS.map(f => `
      <article class="blog-card">
        <a class="blog-card__media" href="#/contact" data-link aria-label="${esc(f.q)}"><img loading="lazy" src="${f.img}" alt=""></a>
        <div class="blog-card__body">
          <span class="blog-card__tag">${esc(f.tag)}</span>
          <h3>${esc(f.q)}</h3>
          <p>${esc(f.excerpt)}</p>
          <a class="link-arrow" href="#/contact" data-link>Ask us more <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
        </div>
      </article>`).join("");
    return `
      <section class="section">
        ${UI.sectionHead("From the blog", "Plan like a local — FAQ", "Quick reads to get you trip-ready.")}
        <div class="container"><div class="blog-grid">${cards}</div></div>
      </section>`;
  }

  ROUTES.activities = function (view, placeFilter) {
    const init = placeFilter || "all";
    const chip = (v, label, active) => `<button class="tab${active ? " is-active" : ""}" data-fg="place" data-fv="${v}">${label}</button>`;
    const chips = (sel) => [chip("all", "All", sel === "all")]
      .concat(PLACES.map(p => chip(p.id, p.name, sel === p.id))).join("");
    const group = (sel) => `<div class="pkg-filtergroup"><span>Destination</span>${chips(sel)}</div>`;

    const lowkey = ACTIVITIES.filter(a => a.tier === "lowkey").map(actCard).join("");
    const picks = ACTIVITIES.filter(a => a.tier === "pick").map(actCard).join("");

    view.innerHTML = `
      ${UI.hero({ eyebrow: "Things to do", title: "Experiences in the Himalaya", lead: "Big-ticket adventures and quiet, hidden corners across both our destinations — tap any to see the trips that include it.", img: HM.alt1 }, true)}

      <div class="pkg-filters"><div class="container"><div class="row">
        ${group(init)}
        <span class="pkg-count" id="actCount"></span>
      </div></div></div>

      <section class="section">
        ${UI.sectionHead("Hidden gems", "Lowkey spots", "Offbeat corners the crowds miss — our local guides' favourites.")}
        <div class="container"><div class="act-grid">${lowkey}</div></div>
      </section>

      <section class="section section--alt">
        ${UI.sectionHead("Most loved", "Traveller's pick", "The experiences guests rave about most.")}
        <div class="container"><div class="act-grid">${picks}</div></div>
      </section>

      ${reviewsBlock()}
      ${blogSection()}
      ${filterFabSheet(group(init))}`;

    const state = { place: init };
    const apply = () => {
      let n = 0;
      view.querySelectorAll(".act-card").forEach(c => {
        const show = state.place === "all" || c.dataset.place === state.place;
        c.hidden = !show; if (show) n++;
      });
      view.querySelector("#actCount").textContent = n + " activit" + (n === 1 ? "y" : "ies");
    };
    view.querySelectorAll("[data-fg]").forEach(b => b.addEventListener("click", () => {
      const v = b.dataset.fv;
      state.place = v;
      view.querySelectorAll('[data-fg="place"]').forEach(x => x.classList.toggle("is-active", x.dataset.fv === v));
      apply();
    }));
    apply();
  };

  /* ---------------- ALBUMS (photo galleries) ---------------- */
  ROUTES.albums = function (view) {
    const blocks = ALBUMS.map(al => `
      <section class="section">
        <div class="container">
          <div class="album-head">
            <span class="eyebrow">${esc(al.location)}</span>
            <h2>${esc(al.title)}</h2>
            <p>${esc(al.note)}</p>
          </div>
          <div class="album-masonry">
            ${al.photos.map(ph => `
              <figure class="photo photo--${ph.shape}">
                <img loading="lazy" decoding="async" src="${ph.img}" alt="${esc(ph.loc)}">
                <figcaption>
                  <span class="photo__loc">${esc(ph.loc)}</span>
                  <span class="photo__date">${esc(ph.date)}</span>
                </figcaption>
              </figure>`).join("")}
          </div>
        </div>
      </section>`).join("");

    view.innerHTML = `
      ${UI.hero({ eyebrow: "Albums", title: "Photo albums", lead: "Moments from the trail across our destinations — browse by place, with locations and dates on every frame.", slides: [HM.alt1, HM.ladakh, HM.hero] }, true)}
      ${blocks}`;
  };

  /* ---------------- search index ---------------- */
  function buildSearchIndex() {
    const idx = [];
    PLACES.forEach(p => idx.push({ title: p.name, img: p.img, route: "#/packages/" + p.id, meta: p.state + " · 3 trips" }));
    PACKAGES.forEach(p => idx.push({ title: p.name, img: p.img, route: "#/package/" + p.id, meta: p.state + " · " + p.days + " days" }));
    window.SEARCH_INDEX = idx;
  }

  /* ---------------- boot ---------------- */
  function boot() {
    UI.buildHeaderNav();
    UI.initHeaderUI();
    UI.initScrollGlass();
    UI.initFilterGlobals();
    UI.initLeadPopup();
    buildSearchIndex();
    UI.syncFavs();
    if (!location.hash) location.hash = "#/home";
    window.__renderRoute();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
