import seed from '../data/seed.json';
import type { Seed } from '../types';
import { foodMap, dayTotals, entriesForDate, streak, computeGoals, weightSeries } from '../selectors';

const data = seed as unknown as Seed;
const foods = foodMap(data.foods);

describe('seed data integrity', () => {
  it('has foods, entries and a today date', () => {
    expect(data.foods.length).toBeGreaterThan(20);
    expect(data.entries.length).toBeGreaterThan(50);
    expect(data.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('every entry references a food that exists in the DB', () => {
    for (const e of data.entries) {
      expect(foods[e.foodId]).toBeDefined();
    }
  });

  it('every entry has a positive serving and a valid meal', () => {
    const meals = new Set(['breakfast', 'lunch', 'dinner', 'snack']);
    for (const e of data.entries) {
      expect(e.servings).toBeGreaterThan(0);
      expect(meals.has(e.meal)).toBe(true);
    }
  });

  it('food ids are unique', () => {
    const ids = data.foods.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("today is a partial day (logged but dinner intentionally empty)", () => {
    const todays = entriesForDate(data.entries, data.today);
    expect(todays.length).toBeGreaterThan(0);
    expect(todays.some((e) => e.meal === 'dinner')).toBe(false);
  });

  it('today totals stay within a believable calorie range', () => {
    const totals = dayTotals(data.entries, foods, data.today);
    expect(totals.kcal).toBeGreaterThan(200);
    expect(totals.kcal).toBeLessThan(data.profile.goals.kcal + 500);
  });

  it('produces a multi-day logging streak ending today', () => {
    expect(streak(data.entries, data.today)).toBeGreaterThanOrEqual(7);
  });

  it('goals are sensible', () => {
    const g = data.profile.goals;
    expect(g.kcal).toBeGreaterThan(1200);
    expect(g.protein).toBeGreaterThan(0);
    expect(g.waterMl).toBeGreaterThan(0);
  });

  it('stored goals match what the bio computes (generator ↔ selector parity)', () => {
    expect(data.profile.goals).toEqual(computeGoals(data.profile.bio));
  });

  it('has a multi-week body-weight trend ending today', () => {
    const series = weightSeries(data.profile.weightByDate, data.today, 30);
    expect(series.length).toBeGreaterThanOrEqual(14);
    // today is always logged, and every reading is a believable body weight
    expect(series[series.length - 1].date).toBe(data.today);
    for (const p of series) expect(p.kg).toBeGreaterThan(40);
    expect(data.profile.weightGoalKg).toBeGreaterThan(0);
  });
});
