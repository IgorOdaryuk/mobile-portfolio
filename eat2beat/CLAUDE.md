@AGENTS.md

# Eat2Beat — project context (read first)

Phone-first calorie & macro tracker. **Expo SDK 57 · RN 0.86 · React 19 · TypeScript (strict).**
Portfolio flagship — 100% synthetic data, no backend. Live demo:
https://igorodaryuk.github.io/mobile-portfolio/eat2beat/

## Architecture — follow these conventions

- **`src/theme.ts`** — `LIGHT` / `DARK` palettes (identical shape) + `MACROS`, `RADIUS`, `SPACE`, `FONT`.
  `C` is a light-mode alias for module-scope / non-React consumers only.
- **`src/theme-context.tsx`** — `ThemeProvider`, `useTheme()` → `{ C, mode, toggle, setMode }`,
  and `useStyles(makeStyles)`. **Styled components must** define a module-level
  `const makeStyles = (C: Palette) => StyleSheet.create({...})` and call
  `const styles = useStyles(makeStyles)` — NEVER import palette colours at module scope.
  Sub-components in the same file each call `useStyles`/`useTheme` themselves.
- **`src/motion.ts`** — `ANIMATE` flag (false when web URL has `?static=1`). Entrance animations
  use built-in `Animated` (not Reanimated) and MUST render the settled/final state when `!ANIMATE`,
  or headless screenshots freeze on frame 0.
- **`src/selectors.ts`** — ALL numeric logic, pure, no React / no clock reads. Unit-tested.
  Includes: day totals, macro split, streak, `computeGoals` (Mifflin-St Jeor), weight stats,
  `buildInsights`, `loggingActivity` (heatmap levels).
- **`src/store.tsx`** — AsyncStorage store: `entries`, `water`, `weight`, `goals`, `bio`
  (`STORAGE_KEY = eat2beat_state_v2`). Exposes `addEntry/removeEntry/addWater/logWeight/setProfile`.
- **Screens:** Today · Diary · Trends · Weight · Goals · AddFood · FoodDetail. Tab nav + iPhone
  web frame in `App.tsx`. URL params drive initial state (see README).
- **Seed:** `scripts/gen_seed.py` (fixed RNG seed 2026). Goals are computed by the SAME
  Mifflin-St Jeor formula as the app (mirrored in Python) — a test asserts parity. Regenerate →
  `src/data/seed.json`.

## Features built (2026-07)

Dark/light theme + header toggle · Weight tab (SVG trend + goal + log stepper) · editable goals +
Mifflin-St Jeor onboarding · Trends auto-insights + GitHub-style logging heatmap · signature
emerald→mint gradient (calorie ring, FAB, weight line, wordmark) · entrance motion (ring sweep +
count-up, macro-bar fill) · a11y roles/labels · FlatList search · food emoji in tinted chips.

## The bar — keep green before every commit

- `npx tsc --noEmit` → clean
- `npx jest --ci` → **37 tests green**. Don't break existing; add tests for new pure logic.

## Screenshots / Metro (operational)

- Metro on **port 8083** (8082 is taken by another process):
  `EXPO_OFFLINE=1 CI=1 BROWSER=none npx expo start --web --port 8083 --clear`
- CI-mode Metro does **NOT** hot-reload — restart it after any code edit before re-shooting.
- `scripts/shoot.sh` (headless Chrome + the app's own iPhone frame) captures with `?static=1`
  to freeze motion. `scripts/hero.py` writes `screenshots/_hero.html` (gitignored) → render to
  `screenshots/hero.png` with Chrome.
- ⚠️ NEVER `pkill` Chrome — it kills the user's real windows. Kill headless only by its temp
  `--user-data-dir`, or wrap Chrome in `timeout` and don't touch processes.

## Repo discipline

- Commit **only `eat2beat/` files**. `storefront/` is another agent; don't touch root
  `README.md` / `PROGRESS.md` / `.github/`.
- Before pushing: `git pull --rebase origin master` then `git push` (folders don't overlap).

## Related work (separate repo, for context)

The GitHub profile `IgorOdaryuk/IgorOdaryuk` was repositioned to **GEO / AI-visibility + local SEO**
and given a Mobile-development section linking here. Not part of this repo.
