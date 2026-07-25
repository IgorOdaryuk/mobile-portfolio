/** Pure date-formatting helpers. All take an explicit ISO date — no clock reads. */

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parts(iso: string): { y: number; m: number; d: number; wd: number } {
  const t = Date.parse(iso + 'T00:00:00Z');
  const dt = new Date(t);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth(), d: dt.getUTCDate(), wd: dt.getUTCDay() };
}

/** "Fri, Jul 25" */
export function longDate(iso: string): string {
  const p = parts(iso);
  return `${WEEKDAY[p.wd]}, ${MONTH[p.m]} ${p.d}`;
}

/** "Jul 25" */
export function shortDate(iso: string): string {
  const p = parts(iso);
  return `${MONTH[p.m]} ${p.d}`;
}

/** Single-letter weekday, e.g. "F". */
export function weekdayLetter(iso: string): string {
  return WEEKDAY[parts(iso).wd][0];
}

/** "Mon" */
export function weekdayShort(iso: string): string {
  return WEEKDAY[parts(iso).wd];
}

export function dayOfMonth(iso: string): number {
  return parts(iso).d;
}
