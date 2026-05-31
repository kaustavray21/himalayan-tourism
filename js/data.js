/* ============================================================
   data.js — site content
   Himalayan Tourism: 2 destinations, each with 3 trips (3/5/7 days).
   Prices in INR (range). Distinct photos per thumbnail via an
   image pool. Original demo copy.
   ============================================================ */

/* ---------- Image pool (distinct landscape photos) ----------
   U(i, w, h) builds a cropped Unsplash URL; broken ones fall back. */
const ID = [
  "1486911278844-a81c5267e227", "1454942901704-3c44c11b2ad1", "1469474968028-56623f02e42e",
  "1464822759023-fed622ff2c3b", "1506905925346-21bda4d32df4", "1454496522488-7a8e488e8606",
  "1470071459604-3b5ec3a7fe05", "1418065460487-3e41a6c84dc5", "1483728642387-6c3bdd6c93e5",
  "1501785888041-af3ef285b470", "1439853949127-fa647821eba0", "1472791108553-c9405341e398",
  "1455156218388-5e61b526818b", "1444080748397-f442aa95c3e5", "1432405972618-c60b0225b8f9",
  "1458668383970-8ddd3927deed", "1426604966848-d7adac402bff", "1470770841072-f978cf4d019e",
  "1519681393784-d120267933ba", "1485470733090-0aae1788d5af", "1506197603052-3cc9c3a201bd",
  "1444464666168-49d633b86797", "1470115636492-6d2b56f9146d", "1467811884108-c95be0e4f7b2",
  "1508739773434-c26b3d09e071", "1504280390367-361c6d9f38f4", "1597074866923-dc0589150358",
  "1626621341517-bbf3d33990ef", "1543341724-c6f823532b5d", "1551632811-561732d1e306"
];
const U = (i, w, h) => `https://images.unsplash.com/photo-${ID[((i % ID.length) + ID.length) % ID.length]}?auto=format&fit=crop&w=${w || 800}&h=${h || 600}&q=70`;
const OWNER_IMG = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&h=600&q=70";

/* Named images still referenced around the app */
const HM = {
  hero: U(0, 1600, 900), alt1: U(2, 1600, 900), alt3: U(4, 1600, 900),
  ladakh: U(26, 1200, 800), valley: U(2, 1200, 800), trek: U(29, 1200, 800),
  food: U(25, 1200, 800), owner: OWNER_IMG
};

/* INR helpers */
const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const round500 = (n) => Math.round(n / 500) * 500;

/* ---------- Destinations (2) — distinct images per place, package & activity ---------- */
const PLACES = [
  {
    id: "manali", name: "Manali", state: "Himachal Pradesh", img: U(2, 1200, 800), base: 4000,
    difficulty: "Easy–Moderate", bestTime: "Mar–Jun · Oct–Feb",
    blurb: "Pine valleys, the Solang adventure bowl and the gateway to Rohtang and the high passes.",
    highlights: ["Solang Valley", "Hadimba Temple", "Old Manali cafés", "Rohtang Pass views"],
    food: "Himachali dham, siddu with ghee, trout, and hot Maggi at mountain dhabas.",
    stay: "Riverside resort / cottage",
    pkgImgs: [U(9, 800, 600), U(10, 800, 600), U(11, 800, 600)],
    /* index 0–2 = traveller's pick · 3–5 = lowkey spots */
    activities: [
      { n: "Paragliding at Solang", img: U(3, 800, 800) },
      { n: "Visit Hadimba Temple", img: U(4, 800, 800) },
      { n: "Old Manali café hop", img: U(5, 800, 800) },
      { n: "Vashisht hot springs", img: U(6, 800, 800) },
      { n: "Riverside walk on the Beas", img: U(7, 800, 800) },
      { n: "Drive toward Rohtang Pass", img: U(8, 800, 800) }
    ]
  },
  {
    id: "leh-ladakh", name: "Leh–Ladakh", state: "Ladakh", img: U(26, 1200, 800), base: 6000,
    difficulty: "Moderate", bestTime: "Jun–Sep",
    blurb: "High-altitude desert of whitewashed monasteries, turquoise Pangong and the world's highest passes.",
    highlights: ["Pangong Tso", "Khardung La", "Thiksey Monastery", "Nubra dunes"],
    food: "Ladakhi thukpa & momos, skyu stew, apricot desserts and butter tea.",
    stay: "Leh hotel / lakeside camp",
    pkgImgs: [U(18, 800, 600), U(19, 800, 600), U(27, 800, 600)],
    activities: [
      { n: "Camp by Pangong Tso", img: U(12, 800, 800) },
      { n: "Drive over Khardung La", img: U(13, 800, 800) },
      { n: "Sunrise at Thiksey Monastery", img: U(28, 800, 800) },
      { n: "Camel ride on Hunder dunes", img: U(15, 800, 800) },
      { n: "Visit Shey & Hemis", img: U(16, 800, 800) },
      { n: "Leh market & Shanti Stupa", img: U(17, 800, 800) }
    ]
  }
];

/* ---------- 3 durations ---------- */
const DURATIONS = [
  { key: "short", days: 3, tag: "weekend escapes", mult: 1.00 },
  { key: "medium", days: 5, tag: "the classic trip", mult: 1.00 },
  { key: "long", days: 7, tag: "grand tours", mult: 0.95 }
];
const DURLABEL = { short: "3 Days", medium: "5 Days", long: "7 Days" };

function buildItinerary(place, days) {
  const a = place.activities, n = a.length, it = [];
  for (let d = 1; d <= days; d++) {
    let title, acts;
    if (d === 1) { title = "Arrival in " + place.name; acts = ["Arrive & check in", a[0].n]; }
    else if (d === days) { title = "Departure from " + place.name; acts = ["Breakfast & souvenir shopping", "Transfer for onward journey"]; }
    else { title = "Exploring " + place.name + " — Day " + d; acts = [a[(2 * d - 2) % n].n, a[(2 * d - 1) % n].n]; }
    it.push({ day: d, title: title, activities: acts, food: place.food, stay: place.stay });
  }
  return it;
}

/* Generate packages: PLACES × DURATIONS, each with its own thumbnail */
const PACKAGES = [];
PLACES.forEach(place => {
  DURATIONS.forEach((dur, di) => {
    const min = round500(place.base * dur.days * dur.mult);
    const max = round500(min * 1.25);
    PACKAGES.push({
      id: place.id + "-" + dur.days + "d",
      name: place.name + " · " + dur.days + " Days",
      placeId: place.id, placeName: place.name, state: place.state,
      region: place.state, days: dur.days, durKey: dur.key,
      img: place.pkgImgs[di] || place.img, difficulty: place.difficulty, bestTime: place.bestTime,
      priceMin: min, priceMax: max, priceText: inr(min) + " – " + inr(max),
      summary: place.blurb, highlights: place.highlights, foodNote: place.food,
      inclusions: [
        (dur.days - 1) + " nights " + place.stay.toLowerCase(),
        "Daily breakfast & dinner", "Private transfers & sightseeing",
        "Local licensed guide", "All permits & taxes"
      ],
      itinerary: buildItinerary(place, dur.days)
    });
  });
});
const pkgsByPlace = (placeId) => PACKAGES.filter(p => p.placeId === placeId);

/* ---------- Activities (distinct image each) ---------- */
const ACTIVITIES = [];
PLACES.forEach(p => p.activities.forEach((a, i) =>
  ACTIVITIES.push({ id: p.id + "-a" + i, name: a.n, img: a.img, placeId: p.id, place: p.name, state: p.state, tier: i < 3 ? "pick" : "lowkey" })));

/* ---------- Traveller reviews (with background photo + photo placeholder) ---------- */
const REVIEWS = [
  { name: "Aarav & Meera", place: "Leh–Ladakh", rating: 5, img: U(12, 1200, 800), text: "Camping beside Pangong Tso under a billion stars was the most magical night of our lives. Every tiny detail was handled." },
  { name: "Sophie L.", place: "Manali", rating: 5, img: U(3, 1200, 800), text: "Paragliding over Solang Valley — terrifying and unforgettable! Our guide kept us calm and laughing the whole way down." },
  { name: "Rohan D.", place: "Leh–Ladakh", rating: 5, img: U(13, 1200, 800), text: "Crossing Khardung La and waking up in Nubra felt like another planet. Flawlessly organised from start to finish." },
  { name: "The Khanna family", place: "Manali", rating: 5, img: U(5, 1200, 800), text: "Old Manali cafés, the hot springs and lazy riverside afternoons — the perfect, stress-free family trip." },
  { name: "James & Kate", place: "Leh–Ladakh", rating: 4, img: U(28, 1200, 800), text: "Sunrise prayers at Thiksey Monastery gave us goosebumps. Loved how permits and stays were all sorted for us." },
  { name: "Pooja M.", place: "Manali", rating: 5, img: U(8, 1200, 800), text: "Hadimba Temple in the cedar forest was so peaceful, and the Rohtang drive was unreal. Already booking the next one." }
];

/* ---------- Blog-style FAQ (distinct images) ---------- */
const FAQS = [
  { tag: "Know before you go", q: "When is the best time to visit?", img: U(4, 800, 600), excerpt: "Manali shines from March–June and again Oct–Feb for snow; Leh–Ladakh's passes open roughly June–September. We'll match your dates to the right destination." },
  { tag: "Health", q: "How do I handle the high altitude?", img: U(26, 800, 600), excerpt: "On Ladakh trips we build in an acclimatisation day in Leh, keep the pace gentle, and brief you on hydration — so you enjoy the heights safely." },
  { tag: "Planning", q: "What should I pack?", img: U(29, 800, 600), excerpt: "Layers, a warm jacket even in summer, sturdy shoes, sunscreen and a refillable bottle. We send a full destination-specific checklist after you book." },
  { tag: "Food", q: "Will there be food for my diet?", img: U(25, 800, 600), excerpt: "From Himachali dham to Ladakhi thukpa, there's plenty for every palate — and we arrange vegetarian, vegan and Jain meals on request." }
];

/* ---------- Photo albums (varied sizes; transparent location/date) ---------- */
const ALBUMS = [
  {
    id: "manali", title: "Manali & the Kullu Valley", location: "Himachal Pradesh, India",
    note: "Cedar forests, river camps and snow-dusted high passes.",
    photos: [
      { img: U(3, 760, 1000), shape: "tall", loc: "Solang Valley", date: "Apr 2026" },
      { img: U(4, 1000, 640), shape: "wide", loc: "Hadimba Temple", date: "Mar 2026" },
      { img: U(5, 800, 800), shape: "sq", loc: "Old Manali", date: "Apr 2026" },
      { img: U(8, 760, 1000), shape: "tall", loc: "Rohtang Pass", date: "May 2026" },
      { img: U(7, 1000, 640), shape: "wide", loc: "Beas riverside", date: "Apr 2026" },
      { img: U(6, 800, 800), shape: "sq", loc: "Vashisht springs", date: "Mar 2026" },
      { img: U(10, 1000, 640), shape: "wide", loc: "Kullu Valley", date: "Oct 2025" },
      { img: U(9, 760, 1000), shape: "tall", loc: "Solang ridge", date: "Jan 2026" }
    ]
  },
  {
    id: "ladakh", title: "Ladakh, the high desert", location: "Ladakh, India",
    note: "Monasteries, turquoise lakes and the world's highest roads.",
    photos: [
      { img: U(12, 1000, 640), shape: "wide", loc: "Pangong Tso", date: "Jul 2026" },
      { img: U(28, 760, 1000), shape: "tall", loc: "Thiksey Monastery", date: "Jun 2026" },
      { img: U(13, 800, 800), shape: "sq", loc: "Khardung La", date: "Jul 2026" },
      { img: U(17, 760, 1000), shape: "tall", loc: "Shanti Stupa, Leh", date: "Aug 2026" },
      { img: U(16, 1000, 640), shape: "wide", loc: "Hemis Monastery", date: "Jun 2026" },
      { img: U(15, 800, 800), shape: "sq", loc: "Hunder dunes", date: "Jul 2026" },
      { img: U(19, 1000, 640), shape: "wide", loc: "Nubra Valley", date: "Aug 2026" },
      { img: U(18, 760, 1000), shape: "tall", loc: "Leh old town", date: "Sep 2026" }
    ]
  }
];

/* ---------- Simplified hover navigation ---------- */
const NAV = [
  { label: "Destinations", kind: "grid",
    links: PLACES.map(p => [p.name, "#/packages/" + p.id]),
    footLabel: "See all destinations", footRoute: "#/packages" },
  { label: "Trips", kind: "list",
    links: DURATIONS.map(d => [DURLABEL[d.key] + " — " + d.tag, "#/packages/dur/" + d.key]),
    footLabel: "Browse all packages", footRoute: "#/packages" }
];

/* ---------- HOME ---------- */
const HOME = {
  hero: {
    eyebrow: "Welcome to the Himalayas",
    title: "Where the mountains call",
    lead: "Handcrafted trips to two Himalayan favourites — Manali and Leh–Ladakh. Pick a place, pick your pace, and we'll plan the rest.",
    slides: [U(0, 1600, 900), U(26, 1600, 900), U(2, 1600, 900), U(13, 1600, 900), U(4, 1600, 900)],
    primary: ["Explore packages", "#/packages"],
    secondary: ["Talk to us", "#/contact"]
  },
  featuredIds: ["leh-ladakh-5d", "manali-5d", "leh-ladakh-7d", "manali-3d", "leh-ladakh-3d", "manali-7d"]
};

/* ---------- Contact / owner ---------- */
const CONTACT = {
  brand: "Himalayan Tourism",
  owner: "Tenzin Sherpa",
  role: "Founder & Lead Mountain Guide",
  blurb: "Guiding across the Indian Himalaya since 2006, Tenzin and our small team of local experts plan every journey by hand — small groups, fair wages for our drivers and guides, and a deep respect for the mountains and the people who call them home.",
  phone: "+91 98100 12345",
  whatsapp: "+91 98100 12345",
  email: "hello@himalayantourism.example",
  address: "Mall Road, Manali 175131, Himachal Pradesh, India",
  hours: "Mon–Sat · 9:00–18:00 (IST)",
  img: OWNER_IMG,
  socials: [["Instagram", "#"], ["Facebook", "#"], ["WhatsApp", "#"], ["YouTube", "#"]]
};

/* ---------- Country dialing codes (contact form dropdown) — [dial, ISO] ---------- */
const COUNTRY_CODES = [
  ["+91","IN"], ["+977","NP"], ["+975","BT"], ["+94","LK"], ["+880","BD"],
  ["+1","US"], ["+44","GB"], ["+61","AU"], ["+64","NZ"],
  ["+971","AE"], ["+966","SA"], ["+974","QA"], ["+965","KW"], ["+968","OM"],
  ["+65","SG"], ["+60","MY"], ["+66","TH"], ["+62","ID"], ["+63","PH"],
  ["+81","JP"], ["+82","KR"], ["+86","CN"], ["+852","HK"], ["+886","TW"],
  ["+49","DE"], ["+33","FR"], ["+39","IT"], ["+34","ES"], ["+31","NL"],
  ["+41","CH"], ["+43","AT"], ["+32","BE"], ["+351","PT"], ["+353","IE"],
  ["+46","SE"], ["+47","NO"], ["+45","DK"], ["+358","FI"], ["+48","PL"],
  ["+30","GR"], ["+420","CZ"], ["+36","HU"], ["+7","RU"], ["+90","TR"],
  ["+972","IL"], ["+20","EG"], ["+27","ZA"], ["+254","KE"], ["+234","NG"],
  ["+55","BR"], ["+52","MX"], ["+54","AR"], ["+56","CL"], ["+92","PK"]
];
