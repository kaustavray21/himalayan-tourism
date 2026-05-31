# Build Plan — "Discover Australia" (australia.com clone)

A single-page app that **replicates the layout, design system, and component patterns**
of australia.com/en-in. One `index.html` holds every "page" as a hidden view; a small
vanilla-JS router swaps views in/out (no reload). Styling is split across several CSS files.

> **Content note:** We reproduce the *structure & visual design* 1:1, but fill it with
> original placeholder copy and royalty-free imagery (Unsplash) instead of Tourism
> Australia's proprietary text/photos. Swapping in real assets later is trivial.

---

## 1. File / Folder Structure

```
website/
├── index.html                 # single entry — header, footer, all <section> views
├── css/
│   ├── reset.css              # normalize + box-sizing
│   ├── variables.css          # design tokens (colors, type scale, spacing, shadows)
│   ├── base.css               # typography, body, links, utility classes
│   ├── layout.css             # header, mega-menu, footer, page grid containers
│   ├── components.css         # cards, carousels, tabs, buttons, badges, banners
│   └── responsive.css         # all media queries (mobile / tablet / desktop)
├── js/
│   ├── data.js                # JS objects: nav menus, cards, destinations, activities
│   ├── router.js              # hash-based view switching (#/home, #/places-to-go …)
│   ├── components.js          # carousel, tabbed carousel, mega-menu, mobile menu, wishlist, search
│   └── main.js                # boot: render dynamic content, wire events, init router
└── assets/                    # (optional) local images / svg icons / logo
```

---

## 2. Routing Model (the "move components with JS" requirement)

- **Hash router** in `router.js`. Each `<section data-view="home">` is a full page kept in
  `index.html`; only the active one is shown (`.is-active`), the rest get `hidden`.
- Routes:
  - `#/` or `#/home` → Home
  - `#/be-inspired`
  - `#/places-to-go`
  - `#/things-to-do`
  - `#/plan-your-trip`
  - `#/destination/:slug` → reusable Destination Detail template (Sydney, Melbourne, …)
- Router updates: active nav highlight, document title, scroll-to-top, `aria-current`.
- Shared **header** and **footer** live outside the views and persist across navigation.

---

## 3. Global Components (shared across all views)

### Header / Mega-Menu
- Sticky top bar: **logo** (left), primary nav (center), utility icons (map, ❤ wishlist, 🔍 search) (right).
- Primary nav (4 items), each opens a **mega-menu dropdown** built from `data.js`:
  - **Be inspired** — Travel stories, Inspiration, Discovery tools, Videos, Deals
  - **Places to go** — Cities, States/Territories, Beaches, Islands, Country, Outback, Nature
  - **Things to do** — Aboriginal, Arts & culture, Festivals, Food & drink, Adventure, Walks, Road trips, Nature, Wildlife, Eco, Wellness, Luxury, Family, Backpacking
  - **Plan your trip** — Beginner's guide, Trip planner, Budget, Itineraries, Accommodation, Tours, Transport, Visa & entry, Weather, Best time to visit, Events calendar
- Desktop: hover/click dropdown. Mobile: hamburger → full-screen accordion menu.
- Search overlay + slide-in wishlist drawer (stored in `localStorage`).

### Footer (same on every view)
- Indigenous acknowledgment band.
- Region / language selector row.
- Social media icon row.
- Legal/site links: Privacy, Terms, Accessibility, Sitemap, Cookies.
- External/related-site links + copyright & disclaimer.

### Reusable building blocks (in `components.css` + `components.js`)
- **Card** (image-dominant, title below/overlay, optional badge, wishlist heart).
- **Horizontal carousel** (scroll-snap track + prev/next arrows).
- **Tabbed carousel** (category filter chips switch the carousel's card set).
- **Full-width promo banner** (image + heading + body + CTA button).
- **Hero** (full-bleed image, overlay headline + intro + share buttons).
- **CTA button** (primary teal, secondary outline).

---

## 4. Per-Page Composition

### HOME (`#/home`)
1. Hero — full-bleed image, big headline, intro line.
2. Featured Inspiration Grid — 4 image-text cards.
3. Sustainable Travel promo banner (full-width + CTA).
4. "Unmissable Experiences" — horizontal carousel.
5. "Top Places to Go" — **tabbed carousel** (Popular / Cities / Beaches / Islands / Country / Outback / Nature).
6. "Top Things to Do" — **tabbed carousel** (Popular / Nature / Culture / Adventure / Family / Relaxation / Food & drink / Events).

### BE INSPIRED (`#/be-inspired`)
1. Hero. 2. Travel-stories grid. 3. Video gallery row. 4. Deals & packages carousel. 5. Discovery-tool promo banner.

### PLACES TO GO (`#/places-to-go`)
1. Hero. 2. Interactive "explore the map" banner. 3. Cities carousel. 4. States & Territories grid. 5. Beaches / Islands / Outback tabbed carousel. 6. Featured destination promo banner.

### THINGS TO DO (`#/things-to-do`)
1. Hero ("Things to do" + intro + share).
2. "Top Things to See & Do" — grid.
3. "Try Something New" — horizontal carousel of articles.
4. "Best Accessible Experiences" — image+text banner + CTA.
5. "Explore by Activity" — category carousel.
6. "Explore Other Interests" — second category carousel.
7. "Experience It Now" — grid with **Load more** button.

### PLAN YOUR TRIP (`#/plan-your-trip`)
1. Hero. 2. Quick-links grid (Visa, Weather, Budget, Transport, Best time). 3. Trip-planner promo banner. 4. Practical-info accordion (FAQ). 5. Deals carousel.

### DESTINATION DETAIL (`#/destination/:slug`) — reusable template
1. Hero (destination name). 2. Intro + highlights. 3. "Things to do here" carousel. 4. Gallery grid. 5. Map embed placeholder. 6. Nearby destinations carousel.

---

## 5. Design System (tokens in `variables.css`)

- **Colors:** white/neutral backgrounds (image-dominant), near-black text (`#1a1a1a`),
  **teal/turquoise accent** (`~#00A9CE`) for CTAs & links, subtle gold secondary accent,
  light-grey section dividers.
- **Typography:** clean sans-serif stack (Inter / Helvetica Neue / system). 3-level scale:
  display (hero), section heading, body. Generous line-height.
- **Spacing:** 8px base scale; large vertical rhythm between sections (60–96px desktop).
- **Buttons:** primary = solid teal pill; secondary = outline; arrows = circular icon buttons.
- **Cards:** rounded corners, image aspect-ratio locked, hover lift + heart toggle.
- **Layout:** max-width container (~1280px), responsive grid, lots of whitespace.

---

## 6. Behaviour / JS (`components.js`)
- Mega-menu open/close (hover + keyboard + click-outside), mobile accordion.
- Carousels: arrow scroll, drag/swipe, scroll-snap, arrow disable at ends.
- Tabbed carousels: chip click re-renders track from `data.js`.
- Wishlist: heart toggle → `localStorage`, count badge, drawer list.
- Search overlay: filter `data.js` items by title.
- "Load more": append next batch of cards.
- Lazy-loaded images (`loading="lazy"`), `defer`ed scripts, reduced-motion support, a11y focus states.

---

## 7. Build Order (execution steps)
1. Scaffold folders + empty files.
2. `variables.css` + `reset.css` + `base.css` (design tokens & typography).
3. `index.html` shell: header, footer, empty view sections, CSS/JS links.
4. `layout.css`: header, mega-menu, footer.
5. `data.js`: all menu + card content.
6. `components.js` + `components.css`: cards, carousels, tabs, menu behaviour.
7. `router.js` + `main.js`: wire routing + render dynamic content.
8. Build each view (Home → Be Inspired → Places → Things → Plan → Destination).
9. `responsive.css`: mobile/tablet polish.
10. Final pass: a11y, lazy-loading, wishlist/search, cross-view QA.

---

## Open questions before we execute
1. **Content/images:** OK to use original placeholder copy + Unsplash images (recommended,
   avoids copyright), or do you specifically want their exact text/photos pulled in?
2. **Scope:** Build all 5 top pages + destination template, or start with Home + 2 pages first?
3. **CSS approach:** Hand-written CSS (as planned, gives the separate-files structure you
   asked for) — confirm you do *not* want Tailwind here.
