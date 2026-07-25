export type Category = 'skincare' | 'body' | 'wellness' | 'suncare';

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'skincare', label: 'Skincare' },
  { key: 'body', label: 'Body' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'suncare', label: 'Suncare' },
];

/** Illustration shape drawn in SVG for a product tile. */
export type Vessel = 'bottle' | 'jar' | 'tube' | 'dropper' | 'pouch';

export type Variant = {
  id: string;
  label: string; // e.g. "30 ml", "Unscented"
  priceCents: number;
};

export type Product = {
  id: string;
  name: string;
  tagline: string;
  category: Category;
  vessel: Vessel;
  tint: string; // key into PRODUCT_TINTS
  priceCents: number; // default / from price
  compareAtCents?: number; // strike-through when on sale
  rating: number; // 0..5, one decimal
  reviewCount: number;
  subscribable: boolean;
  bestseller: boolean;
  benefits: string[];
  ingredients: string;
  variants: Variant[];
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
};

/** A line in the cart. */
export type CartLine = {
  productId: string;
  variantId: string;
  qty: number;
  subscribe: boolean;
};

export type Seed = {
  products: Product[];
  reviews: Review[];
};
