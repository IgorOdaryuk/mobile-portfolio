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

export type Sex = 'male' | 'female';

/** Activity multiplier keys for the TDEE calculation. */
export type ActivityKey = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';

/** Direction of the calorie goal relative to maintenance. */
export type GoalDir = 'lose' | 'maintain' | 'gain';

/** The inputs a user enters during onboarding / goal editing. */
export type Bio = {
  sex: Sex;
  heightCm: number;
  weightKg: number;
  age: number;
  activity: ActivityKey;
  goal: GoalDir;
};

export type Profile = {
  name: string;
  goals: Goals;
  bio: Bio;
  /** Target body weight in kg (used as the goal line on the weight chart). */
  weightGoalKg: number;
  /** ml of water logged, keyed by date. */
  waterByDate: Record<string, number>;
  /** body weight in kg, keyed by date. */
  weightByDate: Record<string, number>;
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
