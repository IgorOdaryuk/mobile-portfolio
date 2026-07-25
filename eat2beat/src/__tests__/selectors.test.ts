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
  mifflinBmr,
  tdee,
  computeGoals,
  weightSeries,
  weightStats,
  buildInsights,
  loggingActivity,
} from '../selectors';
import type { Bio, Entry, Food, Goals } from '../types';

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

describe('mifflinBmr / tdee', () => {
  it('applies the male and female Mifflin-St Jeor constants', () => {
    // 10*78 + 6.25*178 - 5*29 + 5 = 1752.5 -> 1753
    expect(mifflinBmr('male', 78, 178, 29)).toBe(1753);
    // 10*60 + 6.25*165 - 5*30 - 161 = 1320.25 -> 1320
    expect(mifflinBmr('female', 60, 165, 30)).toBe(1320);
  });
  it('scales BMR by the activity factor', () => {
    expect(tdee(1753, 'moderate')).toBe(2717); // 1753 * 1.55
    expect(tdee(1600, 'sedentary')).toBe(1920); // 1600 * 1.2
  });
});

describe('computeGoals', () => {
  const bio: Bio = { sex: 'male', heightCm: 178, weightKg: 78, age: 29, activity: 'moderate', goal: 'lose' };
  it('derives calories, macros and water from the bio', () => {
    expect(computeGoals(bio)).toEqual({ kcal: 2220, protein: 156, carbs: 260, fat: 62, waterMl: 2730 });
  });
  it('a gain goal adds calories vs a lose goal', () => {
    expect(computeGoals({ ...bio, goal: 'gain' }).kcal).toBeGreaterThan(computeGoals(bio).kcal);
  });
  it('never prescribes below the 1200 kcal floor', () => {
    const tiny: Bio = { sex: 'male', heightCm: 150, weightKg: 40, age: 20, activity: 'sedentary', goal: 'lose' };
    expect(computeGoals(tiny).kcal).toBe(1200);
  });
});

describe('weightSeries / weightStats', () => {
  const byDate = { '2026-07-22': 80, '2026-07-23': 79.6, '2026-07-25': 79 }; // 07-24 skipped
  it('returns only logged days in the window, oldest first', () => {
    expect(weightSeries(byDate, '2026-07-25', 4)).toEqual([
      { date: '2026-07-22', kg: 80 },
      { date: '2026-07-23', kg: 79.6 },
      { date: '2026-07-25', kg: 79 },
    ]);
  });
  it('summarises start -> current change and min/max', () => {
    const s = weightSeries(byDate, '2026-07-25', 4);
    expect(weightStats(s)).toEqual({ current: 79, start: 80, changeKg: -1, min: 79, max: 80, count: 3 });
  });
  it('handles an empty series', () => {
    expect(weightStats([])).toEqual({ current: null, start: null, changeKg: 0, min: null, max: null, count: 0 });
  });
});

describe('buildInsights', () => {
  const GOALS: Goals = { kcal: 2000, protein: 150, carbs: 200, fat: 60, waterMl: 2500 };
  const IFOODS = foodMap([
    { id: 'full', name: 'Full day', emoji: '🍽️', serving: '1 day', kcal: 2000, protein: 150, carbs: 200, fat: 60 },
    { id: 'over', name: 'Big day', emoji: '🍔', serving: '1 day', kcal: 2600, protein: 100, carbs: 300, fat: 90 },
  ]);
  const day = (id: string, date: string, foodId: string): Entry => ({ id, date, meal: 'lunch', foodId, servings: 1 });

  it('flags an on-track week as all-good with a streak', () => {
    const entries = [
      day('a', '2026-07-23', 'full'),
      day('b', '2026-07-24', 'full'),
      day('c', '2026-07-25', 'full'),
    ];
    const ins = buildInsights(entries, IFOODS, GOALS, '2026-07-25', 7);
    expect(ins[0].id).toBe('protein');
    expect(ins[0].tone).toBe('good');
    expect(ins.find((i) => i.id === 'kcal')?.tone).toBe('good');
    expect(ins.find((i) => i.id === 'streak')).toBeDefined();
  });

  it('warns when protein is short and calories run over', () => {
    const entries = [day('a', '2026-07-25', 'over')];
    const ins = buildInsights(entries, IFOODS, GOALS, '2026-07-25', 7);
    expect(ins.find((i) => i.id === 'protein')?.tone).toBe('warn');
    expect(ins.find((i) => i.id === 'kcal')?.tone).toBe('warn');
    // a single logged day yields no multi-day streak insight
    expect(ins.find((i) => i.id === 'streak')).toBeUndefined();
  });

  it('returns a friendly placeholder when nothing is logged', () => {
    const ins = buildInsights([], IFOODS, GOALS, '2026-07-25', 7);
    expect(ins).toHaveLength(1);
    expect(ins[0].id).toBe('empty');
  });
});

describe('loggingActivity', () => {
  const entries: Entry[] = [
    E({ id: 'a', date: '2026-07-25' }),
    E({ id: 'b', date: '2026-07-25' }),
    E({ id: 'c', date: '2026-07-25' }),
    E({ id: 'd', date: '2026-07-24' }),
    // 07-23 has nothing
  ];
  it('maps counts to intensity levels 0–3, oldest first', () => {
    const grid = loggingActivity(entries, '2026-07-25', 3);
    expect(grid.map((g) => g.date)).toEqual(['2026-07-23', '2026-07-24', '2026-07-25']);
    expect(grid.map((g) => g.level)).toEqual([0, 1, 2]); // 0 items→0, 1→1, 3→2
    expect(grid[2].count).toBe(3);
  });
});
