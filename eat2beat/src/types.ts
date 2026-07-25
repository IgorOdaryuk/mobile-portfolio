export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_ORDER: MealKey[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_LABEL: Record<MealKey, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

/** A food in the (synthetic) database. Macros are per one `serving`. */
export type Food = {
  id: string;
  name: string;
  brand?: string;
  emoji: string;
  /** Human label for one serving, e.g. "1 cup (240 ml)". */
  serving: string;
  kcal: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
};

/** One logged food entry on a given day. */
export type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  meal: MealKey;
  foodId: string;
  servings: number;
};

export type Goals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
};

export type Profile = {
  name: string;
  goals: Goals;
  /** ml of water logged, keyed by date. */
  waterByDate: Record<string, number>;
};

export type Macros = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Seed = {
  today: string;
  profile: Profile;
  foods: Food[];
  entries: Entry[];
};
