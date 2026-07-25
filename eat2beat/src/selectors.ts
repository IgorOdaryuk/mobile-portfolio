/**
 * Pure, framework-free derivation logic for Eat2Beat.
 * Everything the UI shows about calories/macros is computed here from the raw
 * entry list + food DB, so it can be unit-tested in isolation. No React, no RN.
 */
import type { ActivityKey, Bio, Entry, Food, Goals, GoalDir, Macros, MealKey, Sex } from './types';
import { MEAL_ORDER } from './types';

const ZERO: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

export function foodMap(foods: Food[]): Record<string, Food> {
  const m: Record<string, Food> = {};
  for (const f of foods) m[f.id] = f;
  return m;
}

/** Macros for a single entry (food macros × servings), rounded to whole numbers. */
export function entryMacros(entry: Entry, foods: Record<string, Food>): Macros {
  const f = foods[entry.foodId];
  if (!f) return { ...ZERO };
  const s = entry.servings;
  return {
    kcal: Math.round(f.kcal * s),
    protein: Math.round(f.protein * s),
    carbs: Math.round(f.carbs * s),
    fat: Math.round(f.fat * s),
  };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { ...ZERO },
  );
}

export function entriesForDate(entries: Entry[], date: string): Entry[] {
  return entries.filter((e) => e.date === date);
}

/** Total macros consumed on a given day. */
export function dayTotals(entries: Entry[], foods: Record<string, Food>, date: string): Macros {
  return sumMacros(entriesForDate(entries, date).map((e) => entryMacros(e, foods)));
}

/** Entries for a day grouped by meal, in canonical meal order, each with its subtotal. */
export function mealBreakdown(
  entries: Entry[],
  foods: Record<string, Food>,
  date: string,
): { meal: MealKey; entries: Entry[]; totals: Macros }[] {
  const forDay = entriesForDate(entries, date);
  return MEAL_ORDER.map((meal) => {
    const mealEntries = forDay.filter((e) => e.meal === meal);
    return {
      meal,
      entries: mealEntries,
      totals: sumMacros(mealEntries.map((e) => entryMacros(e, foods))),
    };
  });
}

/** kcal remaining vs goal. Negative means over budget. */
export function remaining(consumedKcal: number, goalKcal: number): number {
  return goalKcal - consumedKcal;
}

/** Clamped 0..1 progress ratio. */
export function progress(consumed: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.max(0, Math.min(1, consumed / goal));
}

/** Percent split of calories coming from each macro (protein/carbs each 4 kcal/g, fat 9). */
export function macroCaloriePct(m: Macros): { protein: number; carbs: number; fat: number } {
  const pC = m.protein * 4;
  const cC = m.carbs * 4;
  const fC = m.fat * 9;
  const total = pC + cC + fC;
  if (total <= 0) return { protein: 0, carbs: 0, fat: 0 };
  const p = Math.round((pC / total) * 100);
  const c = Math.round((cC / total) * 100);
  return { protein: p, carbs: c, fat: Math.max(0, 100 - p - c) };
}

/** Per-day kcal for the N days ending at `endDate` (inclusive), oldest first. */
export function dailyKcalSeries(
  entries: Entry[],
  foods: Record<string, Food>,
  endDate: string,
  days: number,
): { date: string; kcal: number }[] {
  const dates = lastNDates(endDate, days);
  return dates.map((date) => ({ date, kcal: dayTotals(entries, foods, date).kcal }));
}

/** List of ISO dates ending at endDate (inclusive), oldest first. Pure date math (UTC). */
export function lastNDates(endDate: string, days: number): string[] {
  const end = Date.parse(endDate + 'T00:00:00Z');
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end - i * 86400000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/**
 * Logging streak ending at `endDate`: consecutive days (walking backwards) that
 * have at least one entry. The end date counts only if it has entries.
 */
export function streak(entries: Entry[], endDate: string): number {
  const logged = new Set(entries.map((e) => e.date));
  let count = 0;
  let cursor = Date.parse(endDate + 'T00:00:00Z');
  while (logged.has(new Date(cursor).toISOString().slice(0, 10))) {
    count++;
    cursor -= 86400000;
  }
  return count;
}

/** Average daily kcal across the given series, rounded. */
export function averageKcal(series: { kcal: number }[]): number {
  const withData = series.filter((d) => d.kcal > 0);
  if (withData.length === 0) return 0;
  return Math.round(withData.reduce((s, d) => s + d.kcal, 0) / withData.length);
}

/* ------------------------------------------------------------------ */
/* Goal math — Mifflin-St Jeor BMR → TDEE → calorie & macro targets.   */
/* ------------------------------------------------------------------ */

/** Activity multipliers applied to BMR to estimate TDEE. */
export const ACTIVITY_FACTOR: Record<ActivityKey, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

/** kcal offset from maintenance for each goal direction. */
export const GOAL_KCAL_DELTA: Record<GoalDir, number> = {
  lose: -500,
  maintain: 0,
  gain: 350,
};

/** Grams of protein per kg of body weight targeted for each goal. */
const PROTEIN_PER_KG: Record<GoalDir, number> = {
  lose: 2.0,
  maintain: 1.8,
  gain: 1.8,
};

const round10 = (n: number) => Math.round(n / 10) * 10;

/** Mifflin-St Jeor resting metabolic rate (kcal/day). */
export function mifflinBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(base + (sex === 'male' ? 5 : -161));
}

/** Total daily energy expenditure = BMR × activity factor. */
export function tdee(bmr: number, activity: ActivityKey): number {
  return Math.round(bmr * ACTIVITY_FACTOR[activity]);
}

/**
 * Full goal set derived from the onboarding inputs. Calories are TDEE plus the
 * goal offset (floored at a safe 1200), protein scales with body weight, fat is
 * 25% of calories, carbs take the remainder, and water is 35 ml/kg.
 */
export function computeGoals(bio: Bio): Goals {
  const bmr = mifflinBmr(bio.sex, bio.weightKg, bio.heightCm, bio.age);
  const maintenance = tdee(bmr, bio.activity);
  const kcal = Math.max(1200, round10(maintenance + GOAL_KCAL_DELTA[bio.goal]));
  const protein = Math.round(bio.weightKg * PROTEIN_PER_KG[bio.goal]);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  const waterMl = round10(bio.weightKg * 35);
  return { kcal, protein, carbs, fat, waterMl };
}

/* ------------------------------------------------------------------ */
/* Body-weight trend.                                                  */
/* ------------------------------------------------------------------ */

/** Logged weights within the N-day window ending at endDate, oldest first. */
export function weightSeries(
  weightByDate: Record<string, number>,
  endDate: string,
  days: number,
): { date: string; kg: number }[] {
  return lastNDates(endDate, days)
    .filter((d) => weightByDate[d] != null)
    .map((d) => ({ date: d, kg: weightByDate[d] }));
}

export type WeightStats = {
  current: number | null;
  start: number | null;
  changeKg: number;
  min: number | null;
  max: number | null;
  count: number;
};

/** Summary stats for a weight series (start → current change, min/max). */
export function weightStats(series: { date: string; kg: number }[]): WeightStats {
  if (series.length === 0) {
    return { current: null, start: null, changeKg: 0, min: null, max: null, count: 0 };
  }
  const kgs = series.map((d) => d.kg);
  const current = kgs[kgs.length - 1];
  const start = kgs[0];
  return {
    current,
    start,
    changeKg: Math.round((current - start) * 10) / 10,
    min: Math.min(...kgs),
    max: Math.max(...kgs),
    count: series.length,
  };
}

/* ------------------------------------------------------------------ */
/* Insights — plain-language auto-observations for the Trends screen.  */
/* ------------------------------------------------------------------ */

export type InsightTone = 'good' | 'warn' | 'info';
export type Insight = { id: string; tone: InsightTone; text: string };

/**
 * Derive a short list of observations from the last `window` logged days.
 * Pure and deterministic so it can be unit-tested against fixed seed data.
 */
export function buildInsights(
  entries: Entry[],
  foods: Record<string, Food>,
  goals: Goals,
  endDate: string,
  window = 7,
): Insight[] {
  const out: Insight[] = [];
  // Consider only days that actually have entries, within the window.
  const days = lastNDates(endDate, window)
    .map((date) => ({ date, totals: dayTotals(entries, foods, date) }))
    .filter((d) => d.totals.kcal > 0);
  const logged = days.length;
  if (logged === 0) {
    return [{ id: 'empty', tone: 'info', text: 'No meals logged in the last week yet — start logging to unlock insights.' }];
  }

  // 1) Protein adherence (within 90% of goal counts as a hit).
  const proteinMiss = days.filter((d) => d.totals.protein < goals.protein * 0.9).length;
  if (proteinMiss === 0) {
    out.push({ id: 'protein', tone: 'good', text: `Protein on point — you hit your ${goals.protein} g target every one of the last ${logged} logged days.` });
  } else {
    out.push({ id: 'protein', tone: 'warn', text: `Protein came up short on ${proteinMiss} of ${logged} logged days — aim for ${goals.protein} g to protect muscle.` });
  }

  // 2) Average calories vs goal.
  const avg = averageKcal(days.map((d) => ({ kcal: d.totals.kcal })));
  const diff = avg - goals.kcal;
  if (diff > goals.kcal * 0.05) {
    out.push({ id: 'kcal', tone: 'warn', text: `Averaging ${avg} kcal/day — about ${diff} over your ${goals.kcal} goal.` });
  } else if (diff < -goals.kcal * 0.15) {
    out.push({ id: 'kcal', tone: 'info', text: `Averaging ${avg} kcal/day — running ${Math.abs(diff)} under your ${goals.kcal} goal.` });
  } else {
    out.push({ id: 'kcal', tone: 'good', text: `Calories dialed in — averaging ${avg} vs a ${goals.kcal} kcal goal.` });
  }

  // 3) Days landing within 10% of the calorie goal.
  const onTarget = days.filter((d) => Math.abs(d.totals.kcal - goals.kcal) <= goals.kcal * 0.1).length;
  out.push({
    id: 'ontarget',
    tone: onTarget >= Math.ceil(logged / 2) ? 'good' : 'info',
    text: `${onTarget} of ${logged} logged days landed within 10% of your calorie goal.`,
  });

  // 4) Logging streak.
  const s = streak(entries, endDate);
  if (s >= 3) {
    out.push({ id: 'streak', tone: 'good', text: `🔥 ${s}-day logging streak — consistency is doing the heavy lifting.` });
  }

  return out;
}
