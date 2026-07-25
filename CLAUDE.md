# mobile-portfolio — agent context

A portfolio monorepo of React Native / Expo apps, each built from real operational
pain and taken to a shippable bar (tested, CI/CD, live web demo). Repo:
https://github.com/IgorOdaryuk/mobile-portfolio

**The running log of what/why is [`PROGRESS.md`](./PROGRESS.md)** — read it for history and
per-app detail. This file is the *operational* context: how the repo is laid out, how to
build/shoot/test/deploy, and the rules that must not be broken.

## Apps (each is a self-contained Expo project)

| Folder | App | Genre | Live | Identity (kept deliberately distinct) |
|---|---|---|---|---|
| `client-hub/` | Client Hub | Field-service CRM | `/client-hub/` | **"Field-ops console"** — Archivo + **JetBrains Mono** (mono on every number/label), cool graphite/steel, hairline rules, sharp near-square corners, burnt-orange signal accent |
| `storefront/` | Solva | Clean-skincare e-commerce | `/storefront/` | Warm premium boutique — **Fraunces** serif, warm palette, inline-SVG product art; light **and** dark theme |
| `eat2beat/` | Eat2Beat | Calorie/macro tracker | `/eat2beat/` | Rounded health/fitness — Space Grotesk + Plus Jakarta |
| `hub/` | Landing | — | `/` (Pages root) | Static landing that links to the three apps |

Live base: https://igorodaryuk.github.io/mobile-portfolio/

The three apps must **not** read as one template — that's a standing goal. When touching one
app's look, keep it in its own lane (fonts, corners, palette, density) and don't drift it
toward the others.

## Stack (all apps)

Expo SDK 57 · React Native 0.86 · React 19 · TypeScript (strict). `react-native-svg` for
charts/art, `@expo/vector-icons`, `expo-linear-gradient`, AsyncStorage for persistence.
Custom `useState` tab nav (not react-navigation). 100% synthetic seed data
(`scripts/gen_*.py`, fixed seed) with a visible SAMPLE badge — no real customer data.

> Per-app `AGENTS.md`: **Expo has changed — read the versioned docs at
> https://docs.expo.dev/versions/v57.0.0/ before writing Expo code.**

## Build / run

```bash
cd <app> && npm install
npm run web            # Expo web (the build everything is verified against)
npm run typecheck      # tsc --noEmit (strict) — must stay clean
npm test               # jest
```

Native iOS/Android are **not** built in this env — everything is verified on the web build.
Position the apps as functional front-end demos (no backend/auth), not shipped SaaS.

## Screenshots (portfolio captures)

Each app draws its own iPhone frame on a transparent backdrop, captured with headless Chrome.

1. Start Metro in CI mode (it caches — always `--clear` after code edits and restart):
   `EXPO_OFFLINE=1 CI=1 BROWSER=none npx expo start --web --port 8081 --clear`
2. Warm the exact `_expo` bundle URL once (first compile is slow; virtual-time won't wait for it).
3. `bash scripts/shoot.sh` (per app) → per-screen PNGs; `python3 scripts/hero.py` → hero composite.
   Chrome: `--headless=new --force-device-scale-factor=2 --default-background-color=00000000`
   `--virtual-time-budget=7000`, wrapped in `timeout`, one temp `--user-data-dir` per shot.
4. URL params make captures deterministic: `?tab=` `?client=` `?product=` `?theme=dark`
   `?seedcart=1` `?modal=new`, etc.

**RN-web gotcha:** a horizontal `ScrollView` collapses its height and clips content — for
chip/tag rows use flex-row+wrap **or** give the ScrollView an explicit `height`.

## Tests

- Pure logic lives in `src/selectors.ts` (framework-free) — the bulk of the tests.
- Component/screen render tests use **@testing-library/react-native** (currently Solva only).
  RTL v14 + React 19 gotchas (see also memory `reference_mobile_portfolio_rtl_gotchas`):
  - `render()` is **async** — always `await` it; after a state change use `findBy*`.
  - Interactions via **`userEvent`** (`await user.press(...)`), not `fireEvent` — it wraps
    updates in act() and avoids "overlapping act()" noise (manual `act()` wrapping does not).
  - Provider-hydrating **screen** tests go in their **own file** (jest isolates module
    registry per file; many sibling component tests in one file cause act contamination).
  - `jest.setup.js` (via `setupFiles`) mocks AsyncStorage + stubs `@expo/vector-icons`
    (avoids expo-font→expo-asset under jest) + gives jest-expo's partial `window` a
    `location.search`.

## Deploy

Auto on push to `master` via GitHub Actions: a **CI matrix** (typecheck + jest per app) and
a **Deploy** job that exports all web builds to GitHub Pages (Client Hub… see the deploy
workflow for the current path layout — the hub landing sits at the Pages root). After a
deploy, verify the live URL with `curl` (200 + the `_expo` bundle loads / contains the
expected change), not just that the workflow went green.

## ⚠️ Hard rules

- **Never `pkill -f "Google Chrome"` / `pkill Chrome`** — it kills Igor's real windows.
  Only kill a hung *headless* instance by its temp `--user-data-dir`; prefer `timeout`.
- **`eat2beat/` is worked by a parallel agent — do NOT touch it** (git conflicts). Commit
  only the folders you changed (+ root docs). Before pushing: `git pull --rebase origin
  master` then push (folders don't overlap → clean).
- Keep the three apps visually distinct (see identity table).
- tsc strict must stay clean and jest green before committing; reshoot + rebuild hero after
  any visual change, and verify the live deploy.

## Status (2026-07-26)

All three apps + the hub landing are in production and portfolio-ready. Latest work:
Client Hub de-templated into its "field-ops console" identity (#13) with a mono-label
legibility pass; Solva gained 15 RTL render tests (#15, 51 tests total). Full detail and
the app-by-app breakdown are in [`PROGRESS.md`](./PROGRESS.md).
