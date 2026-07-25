import type { ImageSourcePropType } from 'react-native';

/**
 * Drop-in real / AI-generated product photos.
 *
 * The catalog renders layered SVG "product mockups" by default. To use real
 * photography instead, drop PNGs into `assets/products/` and map them here by
 * product id — the app will render the photo wherever that product appears,
 * with the SVG as an automatic fallback for any id left unmapped.
 *
 * Example:
 *   p00: require('../../assets/products/p00.png'),
 *   p01: require('../../assets/products/p01.png'),
 *
 * Shoot/generate all products on the same background + lighting for a cohesive
 * grid (see the generation prompt in the README).
 */
export const PRODUCT_IMAGES: Record<string, ImageSourcePropType> = {
  // (empty — using SVG renders until real photos are added)
};

export function productImage(id: string): ImageSourcePropType | null {
  return PRODUCT_IMAGES[id] ?? null;
}
