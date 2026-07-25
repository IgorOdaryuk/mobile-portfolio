import seed from '../data/seed.json';
import type { Seed } from '../types';
import { productMap, reviewsFor, isOnSale } from '../selectors';

const data = seed as unknown as Seed;
const byId = productMap(data.products);

describe('catalog integrity', () => {
  it('has a reasonable number of products and reviews', () => {
    expect(data.products.length).toBeGreaterThanOrEqual(12);
    expect(data.reviews.length).toBeGreaterThan(20);
  });

  it('product ids are unique', () => {
    const ids = data.products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every product has at least one variant with a positive price', () => {
    for (const p of data.products) {
      expect(p.variants.length).toBeGreaterThan(0);
      for (const v of p.variants) expect(v.priceCents).toBeGreaterThan(0);
    }
  });

  it('variant ids are unique within a product', () => {
    for (const p of data.products) {
      const ids = p.variants.map((v) => v.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('ratings are within 0..5 and review counts positive', () => {
    for (const p of data.products) {
      expect(p.rating).toBeGreaterThanOrEqual(0);
      expect(p.rating).toBeLessThanOrEqual(5);
      expect(p.reviewCount).toBeGreaterThan(0);
    }
  });

  it('every review points at a real product', () => {
    for (const r of data.reviews) expect(byId[r.productId]).toBeDefined();
  });

  it('sale products have compareAt strictly above price', () => {
    const sale = data.products.filter(isOnSale);
    expect(sale.length).toBeGreaterThan(0);
    for (const p of sale) expect(p.compareAtCents!).toBeGreaterThan(p.priceCents);
  });

  it('every category is represented', () => {
    const cats = new Set(data.products.map((p) => p.category));
    for (const c of ['skincare', 'body', 'wellness', 'suncare']) expect(cats.has(c as any)).toBe(true);
  });

  it('has at least one bestseller and one subscribable product', () => {
    expect(data.products.some((p) => p.bestseller)).toBe(true);
    expect(data.products.some((p) => p.subscribable)).toBe(true);
  });

  it('every product has some reviews generated', () => {
    for (const p of data.products) expect(reviewsFor(data.reviews, p.id).length).toBeGreaterThan(0);
  });
});
