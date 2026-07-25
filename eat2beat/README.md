# Eat2Beat — calorie & macro tracker (mobile)

[![CI](https://github.com/IgorOdaryuk/mobile-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/IgorOdaryuk/mobile-portfolio/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)
![Expo](https://img.shields.io/badge/Expo-SDK%2057-000)
![Tests](https://img.shields.io/badge/tests-37%20green-12A867)

**▶ [Live demo](https://igorodaryuk.github.io/mobile-portfolio/eat2beat/)** — the app running in your browser (Expo web build).

A phone-first food diary: log what you eat, watch calories and macros against a daily
goal, track body weight, and read plain-language insights on your week. The daily
**calorie ring** turns coral the moment you go over budget; every food carries protein /
carbs / fat, so the macro split is *derived*, never typed in twice.

Built as a **React Native + Expo + TypeScript (strict)** app with a full **light / dark
theme**. It ships with a **synthetic** 14-day food log + 30-day weight trend, so it runs
with zero backend, and everything you log persists locally (AsyncStorage) across reloads.

![Eat2Beat — all screens](screenshots/hero.png)

## Screens

| Screen | What it shows |
|---|---|
| **Today** ([01](screenshots/01-today.png) · [dark](screenshots/09-today-dark.png)) | Calorie ring, macro bars, water, meals — plus theme toggle + goals shortcut |
| **Add Food** ([search](screenshots/06-search.png) · [detail](screenshots/02-add.png)) | Search the food DB, pick meal + servings, live nutrition preview |
| **Diary** ([03](screenshots/03-diary.png)) | 14-day date strip; any day's totals, macros and meal breakdown |
| **Trends** ([04](screenshots/04-trends.png)) | 14-day calorie bars, macro donut, **auto-insights** + a **logging heatmap** |
| **Weight** ([07](screenshots/07-weight.png) · [dark](screenshots/11-weight-dark.png)) | 30-day weight trend (SVG line + goal), stats, log-today stepper |
| **Goals** ([08](screenshots/08-goals.png)) | Onboarding / edit — Mifflin-St Jeor targets from your bio, live preview |
| **Food detail** ([05](screenshots/05-food.png)) | Per-serving nutrition facts and macro split for any food |

## Features

- **Add food end-to-end** — search → meal → servings → *Add* writes a real entry; the
  Today ring, macros and subtotals update immediately. Entries + water persist (AsyncStorage).
- **Light / dark theme** — full token-based theming via React context, toggled from the
  Today header and persisted; every screen and chart is styled for both.
- **Editable goals + onboarding** — enter sex / age / height / weight / activity / goal and
  targets are computed with the **Mifflin-St Jeor** equation (BMR → TDEE → calories,
  macros, water), with a live preview before you save.
- **Weight tracking** — log daily weight and see a 30-day trend line with a goal marker and
  start→current delta.
- **Auto-insights** — the Trends screen derives plain-language observations (protein
  adherence, average vs goal, days on target, streak) as pure functions.
- **Logging heatmap** — a GitHub-style 5-week grid of how consistently you logged.
- **Entrance motion** — the calorie ring sweeps up and counts, macro bars fill on mount
  (built-in `Animated`, disabled for deterministic screenshots via `?static=1`).
- **All charts are `react-native-svg`** — ring, bars, donut, weight line — driven from data,
  never static images.

## Engineering notes

The interesting decisions, and why:

- **Pure logic, thin UI.** Everything numeric — day totals, macro %, streak, the
  Mifflin-St Jeor goal math, weight stats, insights, heatmap levels — lives in
  `selectors.ts` as pure functions with **no React and no clock reads**. Screens just render
  what selectors return. That's why the logic is unit-tested in isolation (**37 tests**) and
  the app has no "where did this number come from" mystery.
- **Generator ↔ selector parity.** The seed's goals are produced by the *same*
  Mifflin-St Jeor formula the app uses (mirrored in `gen_seed.py`); a test asserts
  `computeGoals(bio) === seed.goals` so the demo data can never drift from the app's math.
- **Theming without prop-drilling.** A `ThemeProvider` exposes the active palette; components
  build styles through `useStyles(makeStyles)`, which memoises the `StyleSheet` per palette
  so it only rebuilds when the theme actually flips — not on every render.
- **Deterministic screenshots.** Web renders inside an iPhone frame; a `?static=1` flag
  short-circuits entrance animations so the headless-Chrome capture shows the settled state
  instead of freezing on the animation's first frame (Chrome's virtual-time clock doesn't
  advance `Animated`'s rAF loop).
- **Trade-off — built-in `Animated`, not Reanimated.** For entrance motion the extra
  dependency + babel plugin wasn't worth it; `Animated` covers ring/bar entrances and keeps
  the web build simple. Reanimated + gesture-driven interactions are the next step.

## Stack

- **React Native 0.86 / Expo SDK 57 / React 19 / TypeScript (strict)**
- `react-native-svg` for the ring / bars / donut / weight line, built-in `Animated` for motion
- Context-based light/dark theming (`theme.ts` + `theme-context.tsx`)
- Type pairing: **Space Grotesk** (display / figures) + **Plus Jakarta Sans** (body)
- Runs on iOS, Android and web from one codebase

## Structure

```
src/
  theme.ts          design tokens — LIGHT/DARK palettes, macro hues, radius/space, type
  theme-context.tsx ThemeProvider · useTheme · useStyles (per-palette memoised styles)
  motion.ts         ANIMATE flag (off during screenshot capture)
  types.ts          Food / Entry / Goals / Bio / Profile / Macros
  selectors.ts      pure logic — totals, macro split, streak, Mifflin-St Jeor goals,
                    weight stats, insights, heatmap — all unit-tested
  dateutil.ts       pure ISO-date formatting (no clock reads)
  store.tsx         AsyncStorage-backed store (entries, water, weight, goals, bio)
  ui.tsx            shared primitives (Card, SectionTitle, SampleBadge, Chip)
  components/       charts.tsx (SVG + Animated) · FoodRow.tsx · icons.tsx
  screens/          Today · AddFood · Diary · Trends · Weight · Goals · FoodDetail
  data/seed.json    synthetic log + weight trend (built by scripts/gen_seed.py)
  __tests__/        jest — selectors + seed integrity (37 tests)
App.tsx             fonts, theme + store providers, tab nav, iPhone web frame
```

## Run it

```bash
npm install
npm run web        # or: npm run ios / npm run android
npm run typecheck  # tsc --noEmit (strict)
npm test           # jest — selectors + seed integrity (37 tests)
```

On web the app renders inside an iPhone frame (faux status bar + dynamic island) so it
screenshots cleanly. URL params set the initial state for deterministic captures:
`?tab=Today|Diary|Trends|Weight`, `?screen=goals`, `?food=<id>`,
`?modal=add&meal=lunch&addfood=<id>`, `?theme=light|dark`, `?static=1` (freeze motion).

## Data

The demo log is **100% synthetic** — generated by `scripts/gen_seed.py` with a fixed RNG
seed, so output is deterministic (tests assert on exact numbers). The demo user
("Alex Rivera"), every food entry and every weigh-in are fictional. **No real health data
is used.** Regenerate:

```bash
python3 scripts/gen_seed.py    # writes src/data/seed.json
```

## Roadmap

- [ ] Reanimated 3 + gesture-handler: swipe-to-delete, shared-element transitions
- [ ] Barcode scan → food lookup (Open Food Facts)
- [ ] Custom foods & recipes
- [ ] HealthKit / Google Fit sync for weight
- [ ] Native builds via Expo → App Store / Play

## License

MIT
