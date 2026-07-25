#!/usr/bin/env python3
"""
Generate 100% synthetic seed data for Eat2Beat (calorie / macro tracker demo).

Deterministic: fixed RNG seed => identical output every run, so unit tests can
assert on exact numbers and screenshots are reproducible. NO real user data.

Output: src/data/seed.json  ->  { today, profile, foods, entries }

Run:  python3 scripts/gen_seed.py
"""
import json
import random
from datetime import date, timedelta
from pathlib import Path

SEED = 2026
DAYS = 14          # today + 13 days of history (for trends)
WEIGHT_DAYS = 30   # body-weight trend spans a longer window than the food log
TODAY = date(2026, 7, 25)

rng = random.Random(SEED)

# --- Onboarding bio + goal math (mirrors src/selectors.ts computeGoals) -----
BIO = {
    "sex": "male",
    "heightCm": 178,
    "weightKg": 78,
    "age": 29,
    "activity": "moderate",
    "goal": "lose",
}
WEIGHT_GOAL_KG = 75.0

ACTIVITY_FACTOR = {
    "sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "athlete": 1.9,
}
GOAL_KCAL_DELTA = {"lose": -500, "maintain": 0, "gain": 350}
PROTEIN_PER_KG = {"lose": 2.0, "maintain": 1.8, "gain": 1.8}


def round10(n):
    return round(n / 10) * 10


def compute_goals(bio):
    w, h, a = bio["weightKg"], bio["heightCm"], bio["age"]
    bmr = round(10 * w + 6.25 * h - 5 * a + (5 if bio["sex"] == "male" else -161))
    maintenance = round(bmr * ACTIVITY_FACTOR[bio["activity"]])
    kcal = max(1200, round10(maintenance + GOAL_KCAL_DELTA[bio["goal"]]))
    protein = round(w * PROTEIN_PER_KG[bio["goal"]])
    fat = round((kcal * 0.25) / 9)
    carbs = max(0, round((kcal - protein * 4 - fat * 9) / 4))
    water_ml = round10(w * 35)
    return {"kcal": kcal, "protein": protein, "carbs": carbs, "fat": fat, "waterMl": water_ml}

# --- Food database (per one serving) ---------------------------------------
# name, brand, emoji, serving, kcal, protein, carbs, fat
FOODS_RAW = [
    ("Oatmeal", "Quaker", "🥣", "1 cup cooked (234 g)", 307, 11, 55, 5),
    ("Greek Yogurt", "Fage 2%", "🥛", "1 container (200 g)", 146, 20, 8, 4),
    ("Blueberries", None, "🫐", "1 cup (148 g)", 84, 1, 21, 0),
    ("Banana", None, "🍌", "1 medium (118 g)", 105, 1, 27, 0),
    ("Scrambled Eggs", None, "🍳", "2 large eggs", 182, 12, 2, 13),
    ("Whole Wheat Toast", None, "🍞", "2 slices", 160, 8, 28, 2),
    ("Peanut Butter", "Jif", "🥜", "2 tbsp (32 g)", 190, 7, 8, 16),
    ("Black Coffee", None, "☕", "1 mug (355 ml)", 5, 0, 0, 0),
    ("Grilled Chicken Breast", None, "🍗", "1 breast (170 g)", 281, 53, 0, 6),
    ("Brown Rice", None, "🍚", "1 cup cooked (195 g)", 216, 5, 45, 2),
    ("Mixed Green Salad", None, "🥗", "1 bowl (200 g)", 90, 3, 10, 5),
    ("Olive Oil", None, "🫒", "1 tbsp (14 g)", 119, 0, 0, 14),
    ("Salmon Fillet", None, "🐟", "1 fillet (170 g)", 367, 40, 0, 22),
    ("Sweet Potato", None, "🍠", "1 medium (130 g)", 112, 2, 26, 0),
    ("Broccoli", None, "🥦", "1 cup (156 g)", 55, 4, 11, 1),
    ("Avocado", None, "🥑", "1/2 fruit (100 g)", 160, 2, 9, 15),
    ("Almonds", None, "🌰", "1 oz (28 g)", 164, 6, 6, 14),
    ("Protein Shake", "Optimum", "🥤", "1 scoop (32 g)", 120, 24, 3, 2),
    ("Apple", None, "🍎", "1 medium (182 g)", 95, 0, 25, 0),
    ("Ground Beef 90%", None, "🥩", "1 patty (113 g)", 199, 22, 0, 12),
    ("Whole Wheat Pasta", None, "🍝", "1 cup cooked (140 g)", 174, 7, 37, 1),
    ("Marinara Sauce", None, "🍅", "1/2 cup (125 g)", 70, 2, 12, 2),
    ("Cheddar Cheese", None, "🧀", "1 slice (28 g)", 113, 7, 0, 9),
    ("Turkey Sandwich", None, "🥪", "1 sandwich", 320, 22, 34, 10),
    ("Dark Chocolate", "Lindt 70%", "🍫", "3 squares (30 g)", 170, 2, 13, 12),
    ("Cottage Cheese", None, "🧀", "1/2 cup (113 g)", 92, 12, 5, 3),
    ("Hummus", None, "🧆", "2 tbsp (30 g)", 70, 2, 6, 5),
    ("Carrot Sticks", None, "🥕", "1 cup (128 g)", 52, 1, 12, 0),
    ("Orange Juice", None, "🧃", "1 cup (248 ml)", 112, 2, 26, 0),
    ("Quinoa", None, "🌾", "1 cup cooked (185 g)", 222, 8, 39, 4),
]


def build_foods():
    foods = []
    for i, (name, brand, emoji, serving, kcal, p, c, f) in enumerate(FOODS_RAW):
        food = {
            "id": f"f{i:02d}",
            "name": name,
            "emoji": emoji,
            "serving": serving,
            "kcal": kcal,
            "protein": p,
            "carbs": c,
            "fat": f,
        }
        if brand:
            food["brand"] = brand
        foods.append(food)
    return foods


# Meal composition templates: pools of food indices to draw from per meal.
POOLS = {
    "breakfast": [0, 1, 2, 3, 4, 5, 6, 7, 28],
    "lunch": [8, 9, 10, 11, 23, 26, 27, 29],
    "dinner": [8, 12, 13, 14, 15, 19, 20, 21, 22, 29],
    "snack": [2, 3, 16, 17, 18, 24, 25, 27],
}
MEAL_TARGET = {"breakfast": 3, "lunch": 3, "dinner": 4, "snack": 2}


def gen_entries(foods):
    entries = []
    n = 0
    for d in range(DAYS):
        day = TODAY - timedelta(days=(DAYS - 1 - d))
        iso = day.isoformat()
        is_today = day == TODAY
        for meal, target in MEAL_TARGET.items():
            # Today is a work-in-progress day: dinner not logged yet, lighter.
            if is_today and meal == "dinner":
                continue
            count = target + rng.choice([-1, 0, 0, 1])
            count = max(1, count)
            pool = POOLS[meal][:]
            rng.shuffle(pool)
            for idx in pool[:count]:
                servings = rng.choice([0.5, 1, 1, 1, 1.5, 2])
                entries.append(
                    {
                        "id": f"e{n:04d}",
                        "date": iso,
                        "meal": meal,
                        "foodId": foods[idx]["id"],
                        "servings": servings,
                    }
                )
                n += 1
    return entries


def gen_water():
    water = {}
    for d in range(DAYS):
        day = TODAY - timedelta(days=(DAYS - 1 - d))
        if day == TODAY:
            water[day.isoformat()] = 1400  # partial day
        else:
            water[day.isoformat()] = rng.choice([1600, 1800, 2000, 2000, 2200, 2500])
    return water


def gen_weight():
    """Gentle downward trend from ~79.6 kg with day-to-day noise; a couple of
    missed weigh-ins to look real. Today and the first day are always present."""
    weight = {}
    start = 79.6
    for d in range(WEIGHT_DAYS):
        day = TODAY - timedelta(days=(WEIGHT_DAYS - 1 - d))
        is_edge = d in (0, WEIGHT_DAYS - 1)
        if not is_edge and rng.random() < 0.12:
            continue  # skipped weigh-in
        trend = start - d * 0.06
        kg = round(trend + rng.uniform(-0.35, 0.35), 1)
        weight[day.isoformat()] = kg
    return weight


def main():
    foods = build_foods()
    entries = gen_entries(foods)
    water = gen_water()
    weight = gen_weight()

    seed = {
        "today": TODAY.isoformat(),
        "profile": {
            "name": "Alex Rivera",
            "goals": compute_goals(BIO),
            "bio": BIO,
            "weightGoalKg": WEIGHT_GOAL_KG,
            "waterByDate": water,
            "weightByDate": weight,
        },
        "foods": foods,
        "entries": entries,
    }

    out = Path(__file__).resolve().parent.parent / "src" / "data" / "seed.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(seed, indent=2, ensure_ascii=False) + "\n")
    print(
        f"wrote {out} — {len(foods)} foods, {len(entries)} entries, "
        f"{len(weight)} weigh-ins, goals={seed['profile']['goals']}"
    )


if __name__ == "__main__":
    main()
