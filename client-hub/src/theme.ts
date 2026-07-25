// Design tokens — "premium field-ops" aesthetic.
// Warm paper background, white cards, burnt-orange accent, characterful type.

export const colors = {
  paper: '#F6F3EF',
  paperDeep: '#EFEAE3',
  card: '#FFFFFF',
  ink: '#1B1712',
  inkSoft: '#4B443C',
  muted: '#8C8378',
  line: '#ECE6DE',
  lineSoft: '#F2EDE6',

  accent: '#E2570C',
  accentDeep: '#C2410C',
  accentSoft: '#FCE9DC',

  success: '#15803D',
  successSoft: '#DCFCE7',
  warn: '#B45309',
  warnSoft: '#FEF0D6',
  danger: '#DC2626',
  dangerSoft: '#FDE4E4',
  info: '#1D4ED8',
  infoSoft: '#DEE7FE',
  violet: '#6D28D9',
  violetSoft: '#EDE4FD',
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

export const font = {
  display: 'SpaceGrotesk_700Bold',
  displayMed: 'SpaceGrotesk_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  semi: 'PlusJakartaSans_600SemiBold',
  med: 'PlusJakartaSans_500Medium',
  reg: 'PlusJakartaSans_400Regular',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

export const shadow = {
  card: {
    shadowColor: '#2A1D10',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  soft: {
    shadowColor: '#2A1D10',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};

// deterministic avatar color from a string
const AVATARS = [
  ['#F9C7A6', '#7A3410'],
  ['#CDE7D3', '#1B5E30'],
  ['#CFE0FB', '#1E40AF'],
  ['#E7D6FB', '#5B21B6'],
  ['#FBD9D4', '#9B2033'],
  ['#F6E4B0', '#7A5A0B'],
];
export function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return AVATARS[h % AVATARS.length];
}

export function money(n: number) {
  return '$' + n.toLocaleString('en-US');
}
