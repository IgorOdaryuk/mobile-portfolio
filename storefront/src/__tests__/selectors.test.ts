import {
  productMap,
  unitPriceCents,
  resolveLines,
  cartSummary,
  cartCount,
  filterAndSort,
  reviewsFor,
  averageReviewRating,
  isOnSale,
  discountPct,
  money,
  validateCheckout,
  isCheckoutValid,
  relatedProducts,
  isLowStock,
  freeShipRemaining,
  standardShippingCents,
  promoRate,
  promoDiscountCents,
} from '../selectors';
import { FREE_SHIP_CENTS, STANDARD_SHIP_CENTS } from '../theme';
import { SUBSCRIBE_DISCOUNT } from '../theme';
import type { Product, Review, CartLine } from '../types';

const mk = (over: Partial<Product>): Product => {
  const id = over.id ?? 'p1';
  const price = over.priceCents ?? 3000;
  return {
    id,
    name: 'Test Serum',
    tagline: 'does things',
    category: 'skincare',
    vessel: 'dropper',
    tint: 'sage',
    priceCents: price,
    rating: 4.5,
    reviewCount: 100,
    subscribable: true,
    bestseller: false,
    stock: 40,
    benefits: [],
    ingredients: '',
    variants: [
      { id: `${id}v0`, label: '30 ml', priceCents: price },
      { id: `${id}v1`, label: '50 ml', priceCents: price + 1500 },
    ],
    ...over,
  };
};

const products = [
  mk({ id: 'p1', name: 'Alpha', priceCents: 3000, rating: 4.9, bestseller: true }),
  mk({ id: 'p2', name: 'Beta', category: 'body', priceCents: 1800, rating: 4.2, compareAtCents: 2400 }),
  mk({ id: 'p3', name: 'Gamma', category: 'body', priceCents: 5200, rating: 4.6 }),
];
const byId = productMap(products);

describe('unitPriceCents', () => {
  const p = products[0];
  it('returns variant price when not subscribed', () => {
    expect(unitPriceCents(p, p.variants[1], false)).toBe(4500);
  });
  it('applies subscribe-and-save discount when subscribed', () => {
    expect(unitPriceCents(p, p.variants[0], true)).toBe(Math.round(3000 * (1 - SUBSCRIBE_DISCOUNT)));
    expect(unitPriceCents(p, p.variants[0], true)).toBe(2550);
  });
});

describe('cartSummary', () => {
  const lines: CartLine[] = [
    { productId: 'p1', variantId: 'p1v1', qty: 2, subscribe: false }, // 4500 x2 = 9000
    { productId: 'p2', variantId: 'p2v0', qty: 1, subscribe: true }, // 1800 -> 1530
  ];
  it('counts items across lines', () => {
    expect(cartSummary(lines, byId).itemCount).toBe(3);
    expect(cartCount(lines)).toBe(3);
  });
  it('computes subtotal at full price', () => {
    expect(cartSummary(lines, byId).subtotalCents).toBe(9000 + 1800);
  });
  it('computes total with subscribe discount applied', () => {
    expect(cartSummary(lines, byId).totalCents).toBe(9000 + 1530);
  });
  it('reports savings as subtotal minus total', () => {
    const s = cartSummary(lines, byId);
    expect(s.savingsCents).toBe(s.subtotalCents - s.totalCents);
    expect(s.savingsCents).toBe(270);
  });
  it('flags a subscription in the cart', () => {
    expect(cartSummary(lines, byId).hasSubscription).toBe(true);
  });
  it('skips lines whose product or variant is missing', () => {
    const bad: CartLine[] = [{ productId: 'nope', variantId: 'x', qty: 5, subscribe: false }];
    expect(cartSummary(bad, byId).itemCount).toBe(0);
  });
});

describe('filterAndSort', () => {
  it('filters by category', () => {
    expect(filterAndSort(products, 'body', 'featured').map((p) => p.id).sort()).toEqual(['p2', 'p3']);
  });
  it('sorts by price ascending / descending', () => {
    expect(filterAndSort(products, 'all', 'price-asc').map((p) => p.priceCents)).toEqual([1800, 3000, 5200]);
    expect(filterAndSort(products, 'all', 'price-desc').map((p) => p.priceCents)).toEqual([5200, 3000, 1800]);
  });
  it('sorts by rating', () => {
    expect(filterAndSort(products, 'all', 'rating')[0].id).toBe('p1');
  });
  it('puts bestsellers first for featured', () => {
    expect(filterAndSort(products, 'all', 'featured')[0].bestseller).toBe(true);
  });
  it('matches a search query on name/tagline', () => {
    expect(filterAndSort(products, 'all', 'featured', 'beta').map((p) => p.id)).toEqual(['p2']);
  });
});

describe('sale helpers', () => {
  it('detects sale + percent off', () => {
    expect(isOnSale(products[1])).toBe(true);
    expect(discountPct(products[1])).toBe(25); // 1800 vs 2400
    expect(isOnSale(products[0])).toBe(false);
    expect(discountPct(products[0])).toBe(0);
  });
});

describe('reviews', () => {
  const reviews: Review[] = [
    { id: 'r1', productId: 'p1', author: 'A', rating: 5, title: '', body: '', date: '' },
    { id: 'r2', productId: 'p1', author: 'B', rating: 4, title: '', body: '', date: '' },
    { id: 'r3', productId: 'p2', author: 'C', rating: 3, title: '', body: '', date: '' },
  ];
  it('filters by product', () => {
    expect(reviewsFor(reviews, 'p1')).toHaveLength(2);
  });
  it('averages actual reviews, else falls back', () => {
    expect(averageReviewRating(reviews, 'p1', 4.0)).toBe(4.5);
    expect(averageReviewRating(reviews, 'p9', 4.3)).toBe(4.3);
  });
});

describe('money', () => {
  it('drops cents for whole dollars, keeps them otherwise', () => {
    expect(money(3400)).toBe('$34');
    expect(money(1530)).toBe('$15.30');
    expect(money(0)).toBe('$0');
    expect(money(599)).toBe('$5.99');
  });
});

describe('relatedProducts', () => {
  const cat = [
    mk({ id: 'p1', category: 'skincare', bestseller: true, rating: 4.9 }),
    mk({ id: 'p2', category: 'skincare', bestseller: false, rating: 4.2 }),
    mk({ id: 'p3', category: 'body', bestseller: true, rating: 4.8 }),
    mk({ id: 'p4', category: 'body', bestseller: false, rating: 4.1 }),
  ];
  it('excludes the current product', () => {
    const r = relatedProducts(cat, cat[0], 4);
    expect(r.map((p) => p.id)).not.toContain('p1');
  });
  it('prefers same category first, bestsellers ranked up', () => {
    const r = relatedProducts(cat, cat[0], 4);
    expect(r[0].id).toBe('p2'); // only other skincare comes first
    expect(r[1].id).toBe('p3'); // then bestseller from other category
  });
  it('caps the result at n', () => {
    expect(relatedProducts(cat, cat[0], 2)).toHaveLength(2);
  });
});

describe('merchandising helpers', () => {
  it('flags low stock only within the threshold', () => {
    expect(isLowStock(mk({ stock: 4 }))).toBe(true);
    expect(isLowStock(mk({ stock: 40 }))).toBe(false);
    expect(isLowStock(mk({ stock: 0 }))).toBe(false);
  });
  it('computes free-ship remaining and standard shipping', () => {
    expect(freeShipRemaining(FREE_SHIP_CENTS - 1000)).toBe(1000);
    expect(freeShipRemaining(FREE_SHIP_CENTS + 500)).toBe(0);
    expect(standardShippingCents(FREE_SHIP_CENTS - 1)).toBe(STANDARD_SHIP_CENTS);
    expect(standardShippingCents(FREE_SHIP_CENTS)).toBe(0);
  });
  it('applies the promo code case-insensitively', () => {
    expect(promoRate('solva10')).toBeGreaterThan(0);
    expect(promoRate('SOLVA10')).toBeGreaterThan(0);
    expect(promoRate('nope')).toBe(0);
    expect(promoDiscountCents(10000, 'SOLVA10')).toBe(1000);
    expect(promoDiscountCents(10000, 'bad')).toBe(0);
  });
});

describe('validateCheckout', () => {
  const ok = { name: 'Alex Morgan', email: 'alex@example.com', address: '742 Sunset Blvd', city: 'Austin, TX 78704' };
  it('passes a complete valid form', () => {
    expect(validateCheckout(ok)).toEqual({});
    expect(isCheckoutValid(ok)).toBe(true);
  });
  it('flags empty required fields', () => {
    const e = validateCheckout({ name: '  ', email: '', address: '', city: '' });
    expect(Object.keys(e).sort()).toEqual(['address', 'city', 'email', 'name']);
    expect(isCheckoutValid({ ...ok, name: '' })).toBe(false);
  });
  it('rejects a malformed email', () => {
    expect(validateCheckout({ ...ok, email: 'alex@' }).email).toBeDefined();
    expect(validateCheckout({ ...ok, email: 'alex.example.com' }).email).toBeDefined();
    expect(validateCheckout({ ...ok, email: 'a@b.co' }).email).toBeUndefined();
  });
});
