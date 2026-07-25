/**
 * Solva design tokens — a premium DTC skincare/wellness aesthetic.
 * Two palettes with an identical shape: a warm cream LIGHT set and an "espresso"
 * DARK set (deep warm brown, not flat grey — keeps the boutique feel). Only the
 * colours differ between modes; radii, spacing and fonts are shared.
 *
 * Consumers read the active palette from the theme context (`useTheme()` /
 * `useStyles()` in ./theme-context). `C` stays as a LIGHT alias so pure,
 * non-React modules can still reference tokens at module scope.
 */

export const LIGHT = {
  // surfaces
  bg: '#F6F2EC', // warm cream paper
  card: '#FFFFFF',
  cardAlt: '#EFE9E0', // tinted tiles / product backdrops
  line: '#E4DBCE',
  barBg: 'rgba(255,255,255,0.96)',

  // text (all pass WCAG AA on bg/card — faint darkened from #A79C8D which failed)
  ink: '#26221D', // near-black warm
  inkDim: '#6E655A',
  inkFaint: '#776E60',
  onSage: '#FFFFFF', // text on the sage hero / buttons

  // brand
  sage: '#4B6150', // deep botanical green (primary actions)
  sageSoft: '#E5ECE5',
  terra: '#C2603E', // terracotta accent (sale, highlights)
  terraSoft: '#F3E1D7',
  terraText: '#8A4930',
  gold: '#B8923F', // stars / ratings

  white: '#FFFFFF',
  shadow: 'rgba(38, 34, 29, 0.10)',
};

export const DARK: typeof LIGHT = {
  // surfaces — warm espresso, not grey
  bg: '#181310',
  card: '#241D18',
  cardAlt: '#2E251E',
  line: '#3A2F27',
  barBg: 'rgba(24,19,16,0.96)',

  // text (faint bumped from #8A7E6F to pass AA on dark cards)
  ink: '#F4EEE6',
  inkDim: '#B7AB9C',
  inkFaint: '#A29686',
  onSage: '#F4EEE6',

  // brand — a touch brighter so it reads on espresso
  sage: '#7FA080',
  sageSoft: '#25332A',
  terra: '#E0805C',
  terraSoft: '#3A2418',
  terraText: '#E9B79C',
  gold: '#D4A94E',

  white: '#241D18', // "raised" surface in dark (buttons keep sage/terra fills)
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export type Palette = typeof LIGHT;
export type ThemeMode = 'light' | 'dark';
export const PALETTES: Record<ThemeMode, Palette> = { light: LIGHT, dark: DARK };

/** Light-mode alias for module-scope / non-React consumers. */
export const C = LIGHT;

/** Accent tints for the generated SVG product illustrations (brand-stable). */
export const PRODUCT_TINTS: Record<string, { fill: string; cap: string }> = {
  sage: { fill: '#CBD8CB', cap: '#4B6150' },
  terra: { fill: '#EEC0AC', cap: '#C2603E' },
  blush: { fill: '#EBD0CE', cap: '#B06B6B' },
  sand: { fill: '#E7D8BE', cap: '#B8923F' },
  sky: { fill: '#C9D8DD', cap: '#5B7C86' },
  lilac: { fill: '#D8CFE0', cap: '#7A6E96' },
};

export const RADIUS = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;
export const SPACE = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 } as const;

export const FONT = {
  // Fraunces (soft modern serif) for display — the beauty-brand signature that
  // sets Solva apart from the other portfolio apps. Plus Jakarta Sans for body.
  display: 'Fraunces_600SemiBold',
  displayLight: 'Fraunces_500Medium',
  body: 'PlusJakartaSans_500Medium',
  bodyReg: 'PlusJakartaSans_400Regular',
  bodySemi: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;

/**
 * Primary CTA fill is brand-stable across themes (a constant deep sage with
 * white text) so buttons always read well — the theme's `sage` token shifts
 * lighter in dark mode, which would wash out white button text.
 */
export const BTN = { fill: '#3F5445', text: '#FFFFFF', done: '#2A231D' } as const;

/** Subscribe-and-save discount rate applied to a subscribed line item. */
export const SUBSCRIBE_DISCOUNT = 0.15;
