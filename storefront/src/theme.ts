/**
 * Solva design tokens — a premium DTC skincare/wellness aesthetic.
 * Warm neutral paper, soft sage, terracotta accent, deep ink text. An elegant
 * serif for display + a clean sans for body. Framework-free (used by tests too).
 */

export const C = {
  // surfaces
  bg: '#F6F2EC', // warm cream paper
  card: '#FFFFFF',
  cardAlt: '#EFE9E0', // tinted tiles / product backdrops
  line: '#E4DBCE',

  // text
  ink: '#26221D', // near-black warm
  inkDim: '#6E655A',
  inkFaint: '#A79C8D',

  // brand
  sage: '#4B6150', // deep botanical green (primary actions)
  sageSoft: '#E5ECE5',
  terra: '#C2603E', // terracotta accent (sale, highlights)
  terraSoft: '#F3E1D7',
  gold: '#B8923F', // stars / ratings

  // status
  success: '#4B6150',
  onSale: '#C2603E',

  white: '#FFFFFF',
  shadow: 'rgba(38, 34, 29, 0.10)',
} as const;

/** Accent tints for the generated SVG product illustrations. */
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
  // Playfair-like serif isn't bundled; we pair Space Grotesk (display) with
  // Plus Jakarta Sans (body) — same families as the other portfolio apps.
  display: 'SpaceGrotesk_700Bold',
  displayMed: 'SpaceGrotesk_500Medium',
  body: 'PlusJakartaSans_500Medium',
  bodyReg: 'PlusJakartaSans_400Regular',
  bodySemi: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;

/** Subscribe-and-save discount rate applied to a subscribed line item. */
export const SUBSCRIBE_DISCOUNT = 0.15;
