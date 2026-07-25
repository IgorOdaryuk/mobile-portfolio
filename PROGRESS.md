# Mobile Portfolio — Progress Log

A portfolio of mobile apps built from real operational pain. Repo:
https://github.com/IgorOdaryuk/mobile-portfolio

---

## App #1 — Client Hub ✅ COMPLETE (portfolio-ready)

Phone-first field-service CRM (appliance repair / HVAC / cleaning on Housecall Pro /
Jobber). Folder: [`client-hub/`](./client-hub).

- **Live demo:** https://igorodaryuk.github.io/mobile-portfolio/
- **Stack:** Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict)
- **Screens (5):** Home (KPIs + charts) · Clients (search/filter) · Board (kanban) ·
  Tasks (auto-generated) · Client 360 (detail)

### What's done
- **Interactive, not a mockup:** New Client form with validation, working Call / Text /
  Schedule / Invoice (`Linking` + pipeline stage advance), task check-off.
- **Persistence:** AsyncStorage-backed store (`src/store.tsx`) — added clients & checked
  tasks survive reload.
- **Live KPIs:** `computeKpis` derives dashboard numbers from the client list (adding a
  client updates counts). Unit-tested for parity with the data generator.
- **Real charts (react-native-svg):** data-driven monthly-revenue bars + lead-source donut.
- **Clean architecture:** data logic in `src/selectors.ts` (pure, framework-free),
  components presentational, design tokens in `src/theme.ts`.
- **Quality gates:** 22 Jest unit tests + `tsc --noEmit` (strict) run in **GitHub Actions
  CI** (green) on every push. Badges in the README.
- **Auto-deploy:** GitHub Actions exports the Expo web build and publishes to GitHub Pages.
- **Data:** 100% synthetic (`scripts/gen_seed.py`, fixed seed) with a visible "SAMPLE
  DATA" badge. No real customer data anywhere. Demo business is fictional ("Northline").

### Screenshots
`client-hub/screenshots/` — `hero.png` (composite), plus `01`–`06` per screen (transparent
PNGs; captured from the Expo web build inside an iPhone frame via headless Chrome).

### Honest limitations (for correct positioning)
- Verified in the **web build only**; native iOS/Android builds not run in this env.
- **No backend / auth** — local synthetic data + AsyncStorage. It's a functional
  front-end demo, not a product wired to real HCP/Jobber.
- Custom `useState` tab navigation (not react-navigation) — fine for this scope.
- **Light theme only** — dark mode was intentionally skipped (large re-theming refactor,
  low differentiation vs. what's already there).

Position it as: *"full-functioning field-service CRM demo — RN/Expo/TS, tested, CI/CD,
live demo,"* not as a shipped SaaS.

---

## Reusable know-how (for the next apps)
- **Portfolio screenshots without a simulator:** Expo web (`npx expo start --web`) + an
  iPhone frame drawn in `App.tsx` (faux status bar, dynamic island) + headless Chrome
  (`--headless=new --force-device-scale-factor=2 --default-background-color=00000000`
  for transparent PNGs). `?tab=` / `?client=` / `?modal=` URL params make captures
  deterministic. Composite hero = HTML with data-URI images → Chrome.
- Metro caches in CI mode; after edits restart with
  `EXPO_OFFLINE=1 CI=1 BROWSER=none npx expo start --web --port 8081 --clear`.
- Deploy: `web.output: "single"` (SPA, no expo-router) + `experiments.baseUrl` = repo path.

---

## App #2 — Eat2Beat ✅ COMPLETE (portfolio-ready)

Calorie & macro tracker (food diary). Folder: [`eat2beat/`](./eat2beat). Chosen as a
**distinct** second domain (health/fitness) vs. Client Hub's CRM, so the portfolio spans
two clearly different app types. Originally an empty Expo scaffold + a Swift repo on
GitHub — rebuilt in RN to the same bar (the Swift port is deferred until Igor upgrades his
Mac; this RN version is its design reference).

- **Live demo:** https://igorodaryuk.github.io/mobile-portfolio/eat2beat/
- **Stack:** Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict)
- **Screens (5):** Today (calorie ring + macros + water + meals) · Add Food (search →
  meal/servings → live nutrition preview) · Diary (14-day strip + per-day breakdown) ·
  Trends (14-day bars vs goal, streak, macro donut) · Food detail.

### What's done
- **Interactive:** add-food flow writes a real entry (Today ring/macros/subtotals update
  live); remove entry; +1 cup water. AsyncStorage store → logs persist across reload.
- **Pure logic in `src/selectors.ts`** (day totals, macro-calorie split, streak, daily
  series) — framework-free, unit-tested. Dates via pure `src/dateutil.ts` (no clock reads).
- **Real SVG charts** (`react-native-svg`): calorie ring, macro bars, weekly bars w/ goal
  line, macro donut. No static chart images.
- **Quality gates:** 23 Jest tests + `tsc --noEmit` (strict). CI now runs a **matrix** over
  both apps (client-hub + eat2beat).
- **Auto-deploy:** deploy workflow builds **both** apps → Client Hub at Pages root,
  Eat2Beat at `/eat2beat`.
- **Data:** 100% synthetic 14-day log (`scripts/gen_seed.py`, fixed seed), fictional user
  "Alex Rivera", visible SAMPLE DATA badge. No real health data.

### Screenshots
`eat2beat/screenshots/` — `hero.png` (4-device composite) + `01`–`06` per screen
(transparent iPhone-frame PNGs, same headless-Chrome pipeline as Client Hub; capture
script committed at `scripts/shoot.sh`, hero builder at `scripts/hero.py`).

### Honest limitations
- Web build verified only; native iOS/Android not built in this env.
- No backend/auth — local synthetic data + AsyncStorage. Functional front-end demo.
- Custom `useState` tab nav (not react-navigation); light theme only.

---

## GitHub candidate scan (for RN-freelance portfolio, Upwork RN goal)
Reviewed Igor's repos for apps portable to RN. Portfolio genre plan (recruiters search by
app *type*): 1) Client Hub — CRM ✅ · 2) Eat2Beat — health ✅ · 3) `local-seo-pulse-mobile`
→ SEO/GBP tracker · 4) `ReactStore` → **e-commerce** (top Upwork category, missing) ·
5) `premium-course-hub` → e-learning. Swift repos (`Eat2Beat`, `MusicianPracticeTracker`)
deferred until native tooling/Mac upgrade.

## App #4 — Solva storefront ✅ COMPLETE (portfolio-ready)

Premium DTC **clean-skincare e-commerce** app. Folder: [`storefront/`](./storefront).
Niche chosen from summer-2026 trend research (health/beauty is the fastest-growing DTC
category with repeat-purchase behaviour). Built for a real goal (Igor's friend Sasha's
future store) **and** as the Upwork-facing showcase — e-commerce is the most-requested RN
gig type and the portfolio had no shop.

- **Live demo:** https://igorodaryuk.github.io/mobile-portfolio/storefront/
- **Stack:** Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict)
- **Screens (6):** Shop (hero + categories + bestsellers) · Product (SVG gallery, size
  variants, subscribe-and-save, reviews) · Category (search + filter + sort) · Cart ·
  Checkout (form + delivery + order-placed) · Saved (wishlist).

### What's done / why it reads well to a client
- **Real commerce logic:** size variants drive price everywhere; **subscribe-and-save**
  (15% off per line); cart add/merge/qty/remove with a **tab badge**; live
  subtotal/savings/total; wishlist; filter + sort + search. All pure + unit-tested.
- **Persistence:** AsyncStorage cart + wishlist survive reload.
- **Design:** premium warm palette, **inline-SVG product illustrations** (bottle/jar/tube/
  dropper/pouch, tinted per product) — cohesive boutique look with zero image assets.
- **Quality gates:** 27 Jest tests + `tsc --noEmit` (strict). CI matrix now covers all
  three apps; deploy builds all three (Client Hub at root, Eat2Beat + Solva at subpaths).
- **Data:** 100% synthetic catalog (`scripts/gen_catalog.py`, fixed seed). Fictional brand
  "Solva", 17 products, 54 reviews, SAMPLE STORE badge. No real brand/customer data.

### Honest limitations
- Web build verified; native iOS/Android not built in this env.
- No backend/auth/payments — local synthetic catalog + AsyncStorage. Front-end demo.
- Custom `useState` navigation; light theme only.

---

## Next up — App #5
`local-seo-pulse-mobile` → **Local SEO / GBP tracker** (rank grid, GBP insights, reviews).
Same bar. Genre plan for Upwork now covers: CRM · health · **e-commerce** · (SEO next).
