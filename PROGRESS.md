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

## Next up — App #2 (TBD)
Add a **second, distinct** mobile app to this portfolio (different domain from Client Hub;
two varied finished apps read stronger than one). App idea to be decided at kickoff —
**not** Practice Tracker (Flutter/Dart) for now; its scope isn't settled yet. Follow the
same bar: clean TS, several screens, nothing crashes, tests + CI, live demo, screenshots.
