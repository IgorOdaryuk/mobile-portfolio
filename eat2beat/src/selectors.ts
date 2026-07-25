/**
 * Pure, framework-free derivation logic for Eat2Beat.
 * Everything the UI shows about calories/macros is computed here from the raw
 * entry list + food DB, so it can be unit-tested in isolation. No React, no RN.
 */
import type { Entry, Food, Macros, MealKey } from './types';
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
