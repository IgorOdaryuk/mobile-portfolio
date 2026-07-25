#!/usr/bin/env python3
"""
Generate a 100% synthetic catalog for Solva (clean skincare / wellness demo store).

Deterministic (fixed RNG seed) so tests can assert exact numbers and screenshots
are reproducible. Solva and every product/review are fictional. NO real brand data.

Output: src/data/seed.json  ->  { products, reviews }
Run:    python3 scripts/gen_catalog.py
"""
import json
import random
from pathlib import Path

rng = random.Random(11)

# name, tagline, category, vessel, tint, price, compareAt(0=none), subscribable,
# bestseller, benefits(list), ingredients, variants[(label, price)]
P = [
    ("Dew Veil", "Hydrating essence", "skincare", "dropper", "sky", 3400, 0, True, True,
     ["Plumps + hydrates", "Barrier support", "Fragrance-free"],
     "Hyaluronic acid, panthenol, glycerin, squalane.",
     [("30 ml", 3400), ("50 ml", 4800)]),
    ("Midnight Repair", "Retinal night serum", "skincare", "dropper", "lilac", 5200, 0, True, True,
     ["Smooths fine lines", "Evens tone", "Encapsulated retinal"],
     "0.1% retinal, bakuchiol, niacinamide, ceramides.",
     [("15 ml", 3600), ("30 ml", 5200)]),
    ("Calm Balm", "Barrier repair cream", "skincare", "jar", "sage", 4200, 4800, True, True,
     ["Soothes redness", "48h moisture", "For sensitive skin"],
     "Colloidal oatmeal, shea butter, ceramide NP, allantoin.",
     [("50 ml", 4200)]),
    ("Clear Ritual", "Gentle gel cleanser", "skincare", "bottle", "sage", 2600, 0, True, False,
     ["Non-stripping", "Removes SPF", "pH balanced"],
     "Coco-glucoside, glycerin, green tea, aloe.",
     [("150 ml", 2600), ("250 ml", 3600)]),
    ("Rosewater Mist", "Toning face mist", "skincare", "bottle", "blush", 2200, 0, False, False,
     ["Refreshes midday", "Preps skin", "Antioxidant boost"],
     "Rosa damascena water, panthenol, vitamin B5.",
     [("100 ml", 2200)]),
    ("Bright Eyes", "Caffeine eye gel", "skincare", "tube", "sky", 2900, 0, True, False,
     ["De-puffs", "Brightens circles", "Cooling roller"],
     "Caffeine, peptides, hyaluronic acid, cucumber.",
     [("15 ml", 2900)]),
    ("Silk Body Oil", "Nourishing dry oil", "body", "dropper", "sand", 3800, 0, True, True,
     ["Fast-absorbing", "Softens skin", "Subtle glow"],
     "Jojoba, squalane, sweet almond, vitamin E.",
     [("100 ml", 3800)]),
    ("Renew Scrub", "Sugar body polish", "body", "jar", "terra", 3200, 0, False, False,
     ["Buffs smooth", "No microplastics", "Leaves no residue"],
     "Cane sugar, shea, coconut oil, sweet orange.",
     [("200 ml", 3200)]),
    ("Everyday Lotion", "Whipped body cream", "body", "tube", "sage", 2800, 0, True, False,
     ["Lightweight", "24h softness", "Fragrance-free"],
     "Shea, glycerin, oat lipids, ceramides.",
     [("200 ml", 2800), ("400 ml", 4200)]),
    ("Hand Salve", "Repair hand cream", "body", "tube", "blush", 1800, 0, True, False,
     ["Rescues dry hands", "Non-greasy", "Pocket size"],
     "Shea, beeswax, panthenol, chamomile.",
     [("50 ml", 1800)]),
    ("Glow Within", "Skin + hair gummies", "wellness", "pouch", "sand", 3000, 0, True, True,
     ["Biotin + zinc", "Vegan", "Berry flavor"],
     "Biotin, zinc, vitamin C, folate.",
     [("30-day", 3000), ("60-day", 5400)]),
    ("Deep Calm", "Magnesium sleep drink", "wellness", "pouch", "lilac", 3400, 0, True, True,
     ["Eases into sleep", "Magnesium glycinate", "Caffeine-free"],
     "Magnesium glycinate, L-theanine, chamomile.",
     [("30 servings", 3400)]),
    ("Daily Greens", "Adaptogen blend", "wellness", "pouch", "sage", 4400, 4900, True, False,
     ["Energy + focus", "Mushroom blend", "No jitters"],
     "Lion's mane, ashwagandha, matcha, spirulina.",
     [("30 servings", 4400)]),
    ("Inner Light", "Marine collagen", "wellness", "pouch", "blush", 3900, 0, True, False,
     ["Skin elasticity", "Unflavored", "Type I + III"],
     "Hydrolyzed marine collagen, vitamin C.",
     [("30 servings", 3900)]),
    ("Sun Fluid SPF50", "Invisible daily sunscreen", "suncare", "tube", "sand", 3000, 0, True, True,
     ["No white cast", "Broad spectrum", "Under makeup"],
     "Zinc oxide 12%, niacinamide, vitamin E.",
     [("50 ml", 3000)]),
    ("After Sun Gel", "Cooling aloe gel", "suncare", "tube", "sky", 2000, 2600, False, False,
     ["Soothes heat", "Instant cool", "Aloe + cucumber"],
     "Aloe vera 90%, cucumber, panthenol, menthol.",
     [("150 ml", 2000)]),
    ("Lip Shield SPF30", "Tinted lip balm", "suncare", "tube", "terra", 1400, 0, True, False,
     ["Sun protection", "Sheer tint", "Non-waxy"],
     "Zinc oxide, shea, raspberry seed oil.",
     [("Rose", 1400), ("Clear", 1400)]),
]

FIRST = ["Maya", "Jordan", "Priya", "Sam", "Chloe", "Devon", "Aisha", "Noah", "Elena",
         "Marcus", "Sofia", "Kai", "Hannah", "Diego", "Nina", "Owen", "Leah", "Tariq",
         "Grace", "Ivan", "Zoe", "Ruby", "Theo", "Mila", "Jonah"]
LAST_I = ["M.", "K.", "R.", "S.", "B.", "T.", "L.", "P.", "V.", "C.", "H.", "N."]
TITLES = ["Holy grail", "Repurchasing", "Better than expected", "A staple now",
          "Gentle + effective", "My skin loves this", "Worth it", "Subtle but real",
          "Perfect for summer", "Finally something that works"]
BODIES = [
    "Two weeks in and my skin looks calmer. No irritation at all.",
    "Absorbs fast and doesn't pill under sunscreen. Been repurchasing.",
    "A little goes a long way — the bottle lasts forever.",
    "Fragrance-free and my sensitive skin is happy. Big win.",
    "Noticed less redness after a month. Sticking with it.",
    "Texture is lovely, not greasy. Fits my morning routine.",
    "Subscribed and save is a no-brainer for a daily product.",
    "Packaging is minimal and it actually works. Recommend.",
    "Great for travel, didn't leak. Doing the job.",
    "My partner keeps stealing it, had to order a second.",
]


def cents_products():
    out = []
    for i, row in enumerate(P):
        (name, tag, cat, vessel, tint, price, cmp, sub, best, benefits, ing, variants) = row
        rating = round(rng.uniform(4.2, 4.9), 1)
        reviews = rng.randint(38, 640)
        out.append({
            "id": f"p{i:02d}",
            "name": name,
            "tagline": tag,
            "category": cat,
            "vessel": vessel,
            "tint": tint,
            "priceCents": price,
            **({"compareAtCents": cmp} if cmp else {}),
            "rating": rating,
            "reviewCount": reviews,
            "subscribable": sub,
            "bestseller": best,
            "benefits": benefits,
            "ingredients": ing,
            "variants": [{"id": f"p{i:02d}v{j}", "label": lbl, "priceCents": pr}
                         for j, (lbl, pr) in enumerate(variants)],
        })
    return out


def gen_reviews(products):
    out = []
    n = 0
    for p in products:
        k = rng.randint(2, 4)
        for _ in range(k):
            r = min(5, max(3, round(p["rating"] + rng.choice([-1, 0, 0, 0, 1]))))
            out.append({
                "id": f"r{n:03d}",
                "productId": p["id"],
                "author": f"{rng.choice(FIRST)} {rng.choice(LAST_I)}",
                "rating": r,
                "title": rng.choice(TITLES),
                "body": rng.choice(BODIES),
                "date": f"2026-0{rng.randint(3,7)}-{rng.randint(10,28)}",
            })
            n += 1
    return out


def main():
    products = cents_products()
    reviews = gen_reviews(products)
    seed = {"products": products, "reviews": reviews}
    out = Path(__file__).resolve().parent.parent / "src" / "data" / "seed.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(seed, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {out} — {len(products)} products, {len(reviews)} reviews")


if __name__ == "__main__":
    main()
