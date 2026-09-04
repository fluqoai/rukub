// Product photography must come from the actual supplier or an approved studio.
// Empty arrays trigger the branded product placeholder instead of unrelated stock photos.
export const productImages: Record<string, string[]> = {};

export const lifestylePhotos = {
  dashboard: '/brand/rukub-hero.png', steering: '/brand/rukub-hero.png',
  interior: '/brand/rukub-hero.png', road: '/brand/rukub-hero.png',
  night: '/brand/rukub-hero.png', family: '/brand/rukub-hero.png',
  detail: '/brand/rukub-hero.png', desert: '/brand/rukub-hero.png',
};

export function getProductImages(productId: string): string[] {
  return productImages[productId] ?? [];
}
