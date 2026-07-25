// Design tokens — "field-ops console" aesthetic.
// Cool graphite/steel surfaces, hairline rules, sharp corners, monospaced numerics,
// a single burnt-orange signal accent. A utilitarian pro-tool, not a boutique app.

export const colors = {
  paper: '#EDEFF2',
  paperDeep: '#E1E5EA',
  card: '#FFFFFF',
  ink: '#14181E',
  inkSoft: '#3B434F',
  muted: '#717B88',
  line: '#DBE0E6',
  lineSoft: '#E8EBEF',

  accent: '#E2570C',
  accentDeep: '#C2410C',
  accentSoft: '#FBE7D8',

  success: '#15803D',
  successSoft: '#DCFCE7',
  warn: '#B45309',
  warnSoft: '#FBEAD2',
  danger: '#DC2626',
  dangerSoft: '#FCE2E2',
  info: '#1D4ED8',
  infoSoft: '#DEE7FE',
  violet: '#6D28D9',
  violetSoft: '#EAE2FB',
};

// dark graphite surfaces for hero / detail headers (cool, technical — not warm brown)
export const hero = {
  grad: ['#1B2027', '#2B333F'] as const,
  detailGrad: ['#191E25', '#313A47'] as const,
  muted: '#8E99A8',
  line: 'rgba(255,255,255,0.10)',
  fill: 'rgba(255,255,255,0.06)',
  accent: '#F6A567',
};

// pipeline stage -> accent color
export const stageColor: Record<string, { fg: string; bg: string }> = {
  'New Lead': { fg: colors.info, bg: colors.infoSoft },
  Scheduled: { fg: colors.violet, bg: colors.violetSoft },
  'In Progress': { fg: colors.warn, bg: colors.warnSoft },
  Completed: { fg: colors.success, bg: colors.successSoft },
  Canceled: { fg: colors.muted, bg: colors.paperDeep },
};

// raw work_status -> label + color
export const statusMeta: Record<string, { label: string; fg: string; bg: string }> = {
  'needs scheduling': { label: 'Needs scheduling', fg: colors.info, bg: colors.infoSoft },
  scheduled: { label: 'Scheduled', fg: colors.violet, bg: colors.violetSoft },
  'in progress': { label: 'In progress', fg: colors.warn, bg: colors.warnSoft },
  'complete unrated': { label: 'Completed', fg: colors.success, bg: colors.successSoft },
  'complete rated': { label: 'Rated', fg: colors.success, bg: colors.successSoft },
  'user canceled': { label: 'Canceled', fg: colors.muted, bg: colors.paperDeep },
  'pro canceled': { label: 'Canceled', fg: colors.muted, bg: colors.paperDeep },
};

// Type system: dense grotesque (Archivo) for text, monospace (JetBrains Mono) for
// every number, label and status tag — tabular alignment + engineering character.
export const font = {
  display: 'Archivo_700Bold',
  displayMed: 'Archivo_600SemiBold',
  bold: 'Archivo_700Bold',
  semi: 'Archivo_600SemiBold',
  med: 'Archivo_500Medium',
  reg: 'Archivo_400Regular',
  mono: 'JetBrainsMono_500Medium',
  monoSemi: 'JetBrainsMono_600SemiBold',
  monoBold: 'JetBrainsMono_700Bold',
};

// Sharp, near-square corners — the pro-tool tell.
export const radius = { sm: 4, md: 6, lg: 8, xl: 10, pill: 999 };

export const shadow = {
  // flat: lean on hairline borders (see ui.Card) instead of soft glow
  card: {
    shadowColor: '#0B1520',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  soft: {
    shadowColor: '#0B1520',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
};

// deterministic avatar color from a string (cooler, flatter set)
const AVATARS = [
  ['#F3D2BC', '#7A3410'],
  ['#C8E1D0', '#1B5E30'],
  ['#CBD8EF', '#1E40AF'],
  ['#DBD1EE', '#5B21B6'],
  ['#F0CFCB', '#9B2033'],
  ['#E7DBB8', '#7A5A0B'],
];
export function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return AVATARS[h % AVATARS.length];
}

export function money(n: number) {
  return '$' + n.toLocaleString('en-US');
}
