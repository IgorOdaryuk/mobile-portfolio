/**
 * Pure, framework-free commerce logic for Solva.
 * Cart math, subscribe-and-save discounting, catalog filter/sort and rating
 * aggregates all live here so they can be unit-tested without React/RN.
 */
import type { CartLine, Category, Product, Review, Variant } from './types';
import { SUBSCRIBE_DISCOUNT } from './theme';

export function productMap(products: Product[]): Record<string, Product> {
  const m: Record<string, Product> = {};
  for (const p of products) m[p.id] = p;
  return m;
}

export function findVariant(product: Product, variantId: string): Variant | undefined {
  return product.variants.find((v) => v.id === variantId);
}

/** Unit price for a line, after subscribe-and-save if the line is subscribed. */
export function unitPriceCents(product: Product, variant: Variant, subscribe: boolean): number {
  const base = variant.priceCents;
  return subscribe ? Math.round(base * (1 - SUBSCRIBE_DISCOUNT)) : base;
}

export type ResolvedLine = {
  line: CartLine;
  product: Product;
  variant: Variant;
  unitCents: number;
  lineCents: number;
};

export function resolveLines(lines: CartLine[], products: Record<string, Product>): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const line of lines) {
    const product = products[line.productId];
    if (!product) continue;
    const variant = findVariant(product, line.variantId);
    if (!variant) continue;
    const unitCents = unitPriceCents(product, variant, line.subscribe);
    out.push({ line, product, variant, unitCents, lineCents: unitCents * line.qty });
  }
  return out;
}

export type CartSummary = {
  itemCount: number;
  subtotalCents: number; // full price × qty (before subscribe discount)
  savingsCents: number; // total saved from subscribe-and-save
  totalCents: number; // what you pay
  hasSubscription: boolean;
};

export function cartSummary(lines: CartLine[], products: Record<string, Product>): CartSummary {
  const resolved = resolveLines(lines, products);
  let itemCount = 0;
  let subtotalCents = 0;
  let totalCents = 0;
  let hasSubscription = false;
  for (const r of resolved) {
    itemCount += r.line.qty;
    subtotalCents += r.variant.priceCents * r.line.qty;
    totalCents += r.lineCents;
    if (r.line.subscribe) hasSubscription = true;
  }
  return {
    itemCount,
    subtotalCents,
    savingsCents: subtotalCents - totalCents,
    totalCents,
    hasSubscription,
  };
}

/** Total number of items across all cart lines (for the tab badge). */
export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export function filterAndSort(
  products: Product[],
  category: Category | 'all',
  sort: SortKey,
  query = '',
): Product[] {
  const q = query.trim().toLowerCase();
  let out = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (q && !(p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q))) return false;
    return true;
  });
  switch (sort) {
    case 'price-asc':
      out = out.slice().sort((a, b) => a.priceCents - b.priceCents);
      break;
    case 'price-desc':
      out = out.slice().sort((a, b) => b.priceCents - a.priceCents);
      break;
    case 'rating':
      out = out.slice().sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'featured':
    default:
      out = out.slice().sort((a, b) => Number(b.bestseller) - Number(a.bestseller));
      break;
  }
  return out;
}

export function reviewsFor(reviews: Review[], productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

/** Average of a product's actual review entries (falls back to catalog rating). */
export function averageReviewRating(reviews: Review[], productId: string, fallback: number): number {
  const rs = reviewsFor(reviews, productId);
  if (rs.length === 0) return fallback;
  return Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10;
}

export function isOnSale(product: Product): boolean {
  return typeof product.compareAtCents === 'number' && product.compareAtCents > product.priceCents;
}

/** Percent off, rounded, for a sale product (0 when not on sale). */
export function discountPct(product: Product): number {
  if (!isOnSale(product) || !product.compareAtCents) return 0;
  return Math.round((1 - product.priceCents / product.compareAtCents) * 100);
}

/** Format integer cents as USD, e.g. 3400 -> "$34.00". */
export function money(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

export type CheckoutForm = { name: string; email: string; address: string; city: string };
export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate the checkout form. Returns a per-field error map ({} when valid). */
export function validateCheckout(form: CheckoutForm): CheckoutErrors {
  const e: CheckoutErrors = {};
  if (!form.name.trim()) e.name = 'Enter your name';
  if (!form.email.trim()) e.email = 'Enter your email';
  else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email';
  if (!form.address.trim()) e.address = 'Enter your address';
  if (!form.city.trim()) e.city = 'Enter city, state and ZIP';
  return e;
}

export function isCheckoutValid(form: CheckoutForm): boolean {
  return Object.keys(validateCheckout(form)).length === 0;
}
