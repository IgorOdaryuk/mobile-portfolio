/**
 * Eat2Beat design tokens.
 * A calm, "health app" light palette — emerald energy accent, warm coral for
 * over-budget states, and three fixed macro hues used everywhere macros appear.
 * Kept framework-free so it can be imported by components, screens and tests.
 */

export const C = {
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
  primary: '#12A867', // emerald — "on track / energy"
  primaryDark: '#0B7E4C',
  primarySoft: '#E4F5EC',
  over: '#E8563F', // coral — over budget / warning
  overSoft: '#FCE9E5',

  // macros (stable across the whole app)
  protein: '#5B6CFF',
  proteinSoft: '#E9EBFF',
  carbs: '#F5A524',
  carbsSoft: '#FDF0DA',
  fat: '#E8608C',
  fatSoft: '#FBE7EE',

  // misc
  water: '#3BA7E6',
  waterSoft: '#E2F2FB',
  shadow: 'rgba(15, 26, 22, 0.06)',
} as const;

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
