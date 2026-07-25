/**
 * Eat2Beat design tokens.
 * Two palettes with an identical shape — a calm "health app" LIGHT set (emerald
 * energy accent, warm coral for over-budget, three fixed macro hues) and a
 * matching DARK set. Colour choices are the only thing that differs between
 * themes; radii, spacing and fonts are shared.
 *
 * Consumers never import a palette directly — they read the active one from the
 * theme context (`useTheme()` / `useStyles()` in ./theme-context). `C` is kept
 * as a light-mode alias so pure, non-React modules (and `MACROS`, whose hues are
 * brand-stable across themes) can still reference tokens at module scope.
 */

export const LIGHT = {
  // surfaces
  bg: '#F4F7F5', // faint green-tinted paper
  card: '#FFFFFF',
  cardBorder: '#E4EAE6',
  ring: '#EDF1EE', // empty track for progress rings/bars

  // text
  text: '#0F1A16',
  textDim: '#5E6B65',
  textFaint: '#95A29B',

  // brand / status
  primary: '#0F9E6E', // emerald — "on track / energy"
  primaryDark: '#0B7E4C',
  primarySoft: '#E1F4EC',
  accent: '#2FD3A6', // mint — the second stop of the signature gradient
  over: '#F0603F', // coral — over budget / warning
  overSoft: '#FCE9E5',

  // macros (stable across the whole app / both themes)
  protein: '#5B6CFF',
  proteinSoft: '#E9EBFF',
  carbs: '#F5A524',
  carbsSoft: '#FDF0DA',
  fat: '#E8608C',
  fatSoft: '#FBE7EE',

  // water card
  water: '#3BA7E6',
  waterSoft: '#E2F2FB',
  waterBorder: '#CDE7F7',
  waterStrong: '#12557E',
  waterText: '#1C6A9E',
  waterDim: '#4F94BD',

  // sample-data badge
  sampleBg: '#FDF0DA',
  sampleFg: '#9A6B12',

  shadow: 'rgba(15, 26, 22, 0.06)',
} as const;

export type Palette = { -readonly [K in keyof typeof LIGHT]: string };
export type ThemeMode = 'light' | 'dark';

export const DARK: Palette = {
  // surfaces
  bg: '#0E1512',
  card: '#16201B',
  cardBorder: '#243029',
  ring: '#22322B',

  // text
  text: '#EAF2EC',
  textDim: '#9DB0A6',
  textFaint: '#6A7D73',

  // brand / status
  primary: '#1FCB86',
  primaryDark: '#16A46B',
  primarySoft: '#123528',
  accent: '#57ECC6', // mint — the second stop of the signature gradient
  over: '#FF6A52',
  overSoft: '#3A1E19',

  // macros — identical hues, brand-stable
  protein: '#5B6CFF',
  proteinSoft: '#1D2140',
  carbs: '#F5A524',
  carbsSoft: '#33290F',
  fat: '#E8608C',
  fatSoft: '#361B25',

  // water card
  water: '#4FB3EE',
  waterSoft: '#122A38',
  waterBorder: '#1E3C4E',
  waterStrong: '#BFE4F8',
  waterText: '#9BD0F0',
  waterDim: '#6FA6C6',

  // sample-data badge
  sampleBg: '#2A2312',
  sampleFg: '#E8C878',

  shadow: 'rgba(0, 0, 0, 0.5)',
};

export const PALETTES: Record<ThemeMode, Palette> = { light: LIGHT, dark: DARK };

/** Light-mode alias for module-scope / non-React consumers. */
export const C: Palette = LIGHT;

export const MACROS = {
  protein: { key: 'protein', label: 'Protein', color: C.protein, soft: C.proteinSoft, kcalPerG: 4 },
  carbs: { key: 'carbs', label: 'Carbs', color: C.carbs, soft: C.carbsSoft, kcalPerG: 4 },
  fat: { key: 'fat', label: 'Fat', color: C.fat, soft: C.fatSoft, kcalPerG: 9 },
} as const;

export const RADIUS = { sm: 12, md: 16, lg: 20, xl: 26, pill: 999 } as const;

export const SPACE = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 } as const;

export const FONT = {
  // Space Grotesk for numbers/headings, Plus Jakarta Sans for body.
  display: 'SpaceGrotesk_700Bold',
  displayMed: 'SpaceGrotesk_500Medium',
  body: 'PlusJakartaSans_500Medium',
  bodyBold: 'PlusJakartaSans_700Bold',
  bodySemi: 'PlusJakartaSans_600SemiBold',
} as const;
