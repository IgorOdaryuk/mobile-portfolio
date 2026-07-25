import {
  entryMacros,
  sumMacros,
  dayTotals,
  mealBreakdown,
  remaining,
  progress,
  macroCaloriePct,
  lastNDates,
  dailyKcalSeries,
  streak,
  averageKcal,
  foodMap,
} from '../selectors';
import type { Entry, Food } from '../types';

const FOODS: Food[] = [
  { id: 'a', name: 'Chicken', emoji: '🍗', serving: '100 g', kcal: 200, protein: 30, carbs: 0, fat: 8 },
  { id: 'b', name: 'Rice', emoji: '🍚', serving: '1 cup', kcal: 200, protein: 4, carbs: 45, fat: 1 },
  { id: 'c', name: 'Oil', emoji: '🫒', serving: '1 tbsp', kcal: 120, protein: 0, carbs: 0, fat: 14 },
];
const foods = foodMap(FOODS);

const E = (over: Partial<Entry>): Entry => ({
  id: 'e', date: '2026-07-25', meal: 'lunch', foodId: 'a', servings: 1, ...over,
});

describe('entryMacros', () => {
  it('multiplies food macros by servings and rounds', () => {
    expect(entryMacros(E({ foodId: 'a', servings: 1.5 }), foods)).toEqual({
      kcal: 300, protein: 45, carbs: 0, fat: 12,
    });
  });
  it('returns zeros for an unknown food', () => {
    expect(entryMacros(E({ foodId: 'zzz' }), foods)).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('sumMacros / dayTotals', () => {
  const entries: Entry[] = [
    E({ id: 'e1', foodId: 'a', servings: 1 }),
    E({ id: 'e2', foodId: 'b', servings: 2 }),
    E({ id: 'e3', foodId: 'c', servings: 1, date: '2026-07-24' }), // different day
  ];
  it('sums only the requested day', () => {
    expect(dayTotals(entries, foods, '2026-07-25')).toEqual({ kcal: 600, protein: 38, carbs: 90, fat: 10 });
  });
  it('sumMacros of empty list is all zeros', () => {
    expect(sumMacros([])).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('mealBreakdown', () => {
  it('groups by meal in canonical order with subtotals', () => {
    const entries: Entry[] = [
      E({ id: 'e1', meal: 'breakfast', foodId: 'b', servings: 1 }),
      E({ id: 'e2', meal: 'dinner', foodId: 'a', servings: 1 }),
    ];
    const bd = mealBreakdown(entries, foods, '2026-07-25');
    expect(bd.map((m) => m.meal)).toEqual(['breakfast', 'lunch', 'dinner', 'snack']);
    expect(bd[0].totals.kcal).toBe(200);
    expect(bd[1].entries).toHaveLength(0);
    expect(bd[2].totals.protein).toBe(30);
  });
});

describe('remaining / progress', () => {
  it('remaining is goal minus consumed and can go negative', () => {
    expect(remaining(1800, 2200)).toBe(400);
    expect(remaining(2400, 2200)).toBe(-200);
  });
  it('progress clamps between 0 and 1', () => {
    expect(progress(1100, 2200)).toBeCloseTo(0.5);
    expect(progress(5000, 2200)).toBe(1);
    expect(progress(100, 0)).toBe(0);
  });
});

describe('macroCaloriePct', () => {
  it('splits calories by macro and always sums to 100', () => {
    // 30g protein(120) + 45g carbs(180) + 8g fat(72) = 372 kcal
    const pct = macroCaloriePct({ kcal: 372, protein: 30, carbs: 45, fat: 8 });
    expect(pct.protein + pct.carbs + pct.fat).toBe(100);
    expect(pct.carbs).toBeGreaterThan(pct.protein);
  });
  it('returns zeros when there are no macros', () => {
    expect(macroCaloriePct({ kcal: 0, protein: 0, carbs: 0, fat: 0 })).toEqual({ protein: 0, carbs: 0, fat: 0 });
  });
});

describe('lastNDates', () => {
  it('returns N consecutive ISO dates ending inclusive, oldest first', () => {
    expect(lastNDates('2026-07-25', 3)).toEqual(['2026-07-23', '2026-07-24', '2026-07-25']);
  });
  it('crosses month boundaries correctly', () => {
    expect(lastNDates('2026-08-01', 2)).toEqual(['2026-07-31', '2026-08-01']);
  });
});

describe('streak', () => {
  const entries: Entry[] = [
    E({ id: 'e1', date: '2026-07-25' }),
    E({ id: 'e2', date: '2026-07-24' }),
    E({ id: 'e3', date: '2026-07-23' }),
    // gap on 07-22
    E({ id: 'e4', date: '2026-07-21' }),
  ];
  it('counts consecutive logged days back from end', () => {
    expect(streak(entries, '2026-07-25')).toBe(3);
  });
  it('is zero when the end date has no entries', () => {
    expect(streak(entries, '2026-07-26')).toBe(0);
  });
});

describe('dailyKcalSeries / averageKcal', () => {
  const entries: Entry[] = [
    E({ id: 'e1', date: '2026-07-24', foodId: 'a', servings: 1 }), // 200
    E({ id: 'e2', date: '2026-07-25', foodId: 'b', servings: 1 }), // 200
  ];
  it('produces one point per day in range', () => {
    const s = dailyKcalSeries(entries, foods, '2026-07-25', 3);
    expect(s).toEqual([
      { date: '2026-07-23', kcal: 0 },
      { date: '2026-07-24', kcal: 200 },
      { date: '2026-07-25', kcal: 200 },
    ]);
  });
  it('averages only days with data', () => {
    const s = dailyKcalSeries(entries, foods, '2026-07-25', 3);
    expect(averageKcal(s)).toBe(200);
    expect(averageKcal([])).toBe(0);
  });
});
