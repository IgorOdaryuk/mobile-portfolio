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
    ("Clear Ritual", "Gentle gel cleanser", "skincare", "pump", "sage", 2600, 0, True, False,
     ["Non-stripping", "Removes SPF", "pH balanced"],
     "Coco-glucoside, glycerin, green tea, aloe.",
     [("150 ml", 2600), ("250 ml", 3600)]),
    ("Rosewater Mist", "Toning face mist", "skincare", "mist", "blush", 2200, 0, False, False,
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
    ("Everyday Lotion", "Whipped body cream", "body", "pump", "sage", 2800, 0, True, False,
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
    ("Deep Calm", "Magnesium sleep drink", "wellness", "jar", "lilac", 3400, 0, True, True,
     ["Eases into sleep", "Magnesium glycinate", "Caffeine-free"],
     "Magnesium glycinate, L-theanine, chamomile.",
     [("30 servings", 3400)]),
    ("Daily Greens", "Adaptogen blend", "wellness", "pouch", "sage", 4400, 4900, True, False,
     ["Energy + focus", "Mushroom blend", "No jitters"],
     "Lion's mane, ashwagandha, matcha, spirulina.",
     [("30 servings", 4400)]),
    ("Inner Light", "Marine collagen", "wellness", "jar", "blush", 3900, 0, True, False,
     ["Skin elasticity", "Unflavored", "Type I + III"],
     "Hydrolyzed marine collagen, vitamin C.",
     [("30 servings", 3900)]),
    ("Sun Fluid SPF50", "Invisible daily sunscreen", "suncare", "pump", "sand", 3000, 0, True, True,
     ["No white cast", "Broad spectrum", "Under makeup"],
     "Zinc oxide 12%, niacinamide, vitamin E.",
     [("50 ml", 3000)]),
    ("After Sun Gel", "Cooling aloe gel", "suncare", "tube", "sky", 2000, 2600, False, False,
     ["Soothes heat", "Instant cool", "Aloe + cucumber"],
     "Aloe vera 90%, cucumber, panthenol, menthol.",
     [("150 ml", 2000)]),
    ("Lip Shield SPF30", "Tinted lip balm", "suncare", "stick", "terra", 1400, 0, True, False,
     ["Sun protection", "Sheer tint", "Non-waxy"],
     "Zinc oxide, shea, raspberry seed oil.",
     [("Rose", 1400), ("Clear", 1400)]),
]

FIRST = ["Maya", "Jordan", "Priya", "Sam", "Chloe", "Devon", "Aisha", "Noah", "Elena",
         "Marcus", "Sofia", "Kai", "Hannah", "Diego", "Nina", "Owen", "Leah", "Tariq",
         "Grace", "Ivan", "Zoe", "Ruby", "Theo", "Mila", "Jonah", "Amara", "Felix",
         "Iris", "Rohan", "Yuki", "Caleb", "Nadia", "Otis", "Vera", "Malik", "June"]
LAST_I = ["M.", "K.", "R.", "S.", "B.", "T.", "L.", "P.", "V.", "C.", "H.", "N.",
          "A.", "D.", "F.", "G.", "W.", "O."]

# Large, varied pools — assigned without replacement across the whole catalog so
# no two reviews read the same. (~70 each vs. 54 reviews needed.)
TITLES = [
    "Holy grail", "Repurchasing for sure", "Better than I expected", "A staple now",
    "Gentle and effective", "My skin loves this", "Worth every penny", "Subtle but real results",
    "Perfect for summer", "Finally something that works", "Won me over", "Quietly excellent",
    "Skeptic converted", "No more breakouts", "Glow is back", "Does exactly what it says",
    "Five stars, no notes", "My new morning must", "Sensitive-skin approved", "Impressed",
    "Lightweight and effective", "Big difference in two weeks", "Calmed my redness",
    "So worth the hype", "Understated but works", "Kept me hydrated all day",
    "Travel bag essential", "Bought one for my mum too", "Zero irritation", "Love the ritual",
    "Fast absorbing", "Not going back", "Solid daily", "Better skin barrier",
    "Good value for the size", "Reordering already", "A gentle powerhouse", "Cleared my texture",
    "Dermatologist-approved feel", "Refreshing", "My skin drinks it up", "No white cast at all",
    "Feels expensive", "Subscription paid off",
]
BODIES = [
    "Two weeks in and my skin looks noticeably calmer — no stinging, no redness.",
    "Absorbs in seconds and never pills under my sunscreen. Already on my second bottle.",
    "A little goes a long way; one pump covers my whole face and the bottle lasts months.",
    "Fully fragrance-free, which my reactive skin really appreciates. No flare-ups.",
    "After a month my post-acne marks are visibly lighter. I'm sold.",
    "The texture is silky, not greasy, and it layers well under makeup.",
    "Subscribing was a no-brainer for something I reach for every single day.",
    "Minimal packaging, honest ingredients, and it genuinely works. Rare combo.",
    "Took it on a two-week trip, no leaks, and my skin stayed balanced the whole time.",
    "My partner keeps borrowing it so I had to order a second one.",
    "I have rosacea-prone cheeks and this is the first thing that hasn't set me off.",
    "Noticed my pores looking tighter by week three. Subtle but definitely there.",
    "Doesn't sting around the eyes, which is huge for me.",
    "Replaced two other products with just this. Simpler routine, better skin.",
    "The pump is precise so there's zero waste. Small thing, but I love it.",
    "Combination skin here — controls my oily T-zone without drying my cheeks.",
    "Layered it over my serum and woke up genuinely dewy, not sticky.",
    "Cheaper per use than my old brand and honestly performs better.",
    "My esthetician actually asked what I'd changed. That's the review.",
    "Non-negotiable in my winter routine now — no more tight, flaky patches.",
    "Sank in fast even in humidity. No greasy film sitting on top.",
    "Bought it on a whim from the summer edit and it's now a permanent fixture.",
    "Three weeks of consistent use and my tone looks so much more even.",
    "Gentle enough for daily use but I can feel it doing something.",
    "The scent-free formula means it plays nice with my other actives.",
    "Held up through a heatwave — light, breathable, no melting-off feeling.",
    "My teenager stole it for their routine, so I guess it's kid-approved too.",
    "Skin felt plumper the very next morning. Didn't expect results that quickly.",
    "Zero irritation even when I overdid it and used it twice a day.",
    "Calmed the redness around my nose within a few days.",
    "Great slip, blends beautifully, and a jar lasts me a solid two months.",
    "I'm mid-forties and this is the first product to actually soften my fine lines.",
    "Perfect under SPF — no pilling, no weird texture, just smooth.",
    "Reordered before I even ran out. That's how much I trust it now.",
    "Barrier felt repaired after a week of my skin being wrecked by travel.",
    "Subtle glow without any shimmer or grease. Exactly what I wanted.",
    "Works as well as products triple the price I've tried.",
    "Finally a formula my eczema doesn't hate.",
    "Kept my skin comfortable through a long-haul flight.",
    "One month in: fewer clogged pores, less congestion on my chin.",
    "Feels like a treat every morning and the results back it up.",
    "No white cast whatsoever, even on my deeper skin tone.",
    "My skin looks like I slept eight hours even when I didn't.",
    "Lightweight but genuinely hydrating — a hard balance to strike.",
    "Bought the bigger size on my second order because I know I'll finish it.",
    "The only thing I didn't have to return this season.",
    "Redness gone, texture smoother, and I've done nothing else different.",
    "Sensitive, hormonal skin here and it's been completely drama-free.",
    "Absorbs clean with no residue on my hands after.",
    "It quietly does its job. No fireworks, just better skin over time.",
]


def cents_products():
    out = []
    for i, row in enumerate(P):
        (name, tag, cat, vessel, tint, price, cmp, sub, best, benefits, ing, variants) = row
        rating = round(rng.uniform(4.2, 4.9), 1)
        reviews = rng.randint(38, 640)
        # Most products well-stocked; a few deliberately low for urgency badges.
        stock = rng.choice([4, 6, 7] + [40, 60, 90, 120, 150] * 4)
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
            "stock": stock,
            "benefits": benefits,
            "ingredients": ing,
            "variants": [{"id": f"p{i:02d}v{j}", "label": lbl, "priceCents": pr}
                         for j, (lbl, pr) in enumerate(variants)],
        })
    return out


def gen_reviews(products):
    # Draw titles/bodies without replacement so no two reviews read the same.
    bodies = BODIES[:]
    titles = TITLES[:]
    rng.shuffle(bodies)
    rng.shuffle(titles)
    bi = ti = 0

    out = []
    n = 0
    for p in products:
        k = rng.randint(2, 4)
        for _ in range(k):
            # Rating leans toward the product's catalog rating, clamped 3..5.
            r = min(5, max(3, round(p["rating"] + rng.choice([-1, 0, 0, 0, 1]))))
            body = bodies[bi % len(bodies)]; bi += 1
            title = titles[ti % len(titles)]; ti += 1
            out.append({
                "id": f"r{n:03d}",
                "productId": p["id"],
                "author": f"{rng.choice(FIRST)} {rng.choice(LAST_I)}",
                "rating": r,
                "title": title,
                "body": body,
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
