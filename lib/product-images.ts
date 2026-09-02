// Atmospheric product images using Picsum (random real photos).
// Each seed returns a consistent image. The product icon overlay in
// components provides context for what the photo represents.

const picsum = (seed: string, w = 1200, h = 1200) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Curated lifestyle photos (used in LifestyleScenes + ProductGallery fallback).
// Each product gets 4 unique images + 3 shared lifestyle scenes.
const SHARED_LIFESTYLE = [
  picsum('car-life-1', 1200, 1200),
  picsum('car-life-2', 1200, 1200),
  picsum('car-life-3', 1200, 1200),
];

export const lifestylePhotos = {
  dashboard: picsum('lifestyle-dash', 1600, 1200),
  steering: picsum('lifestyle-steer', 1600, 1200),
  interior: picsum('lifestyle-int', 1600, 1200),
  road: picsum('lifestyle-road', 1600, 1200),
  night: picsum('lifestyle-night', 1600, 1200),
  family: picsum('lifestyle-fam', 1600, 1200),
  detail: picsum('lifestyle-det', 1600, 1200),
  desert: picsum('lifestyle-des', 1600, 1200),
};

export const productImages: Record<string, string[]> = {
  p01: [picsum('p01-1', 1200, 1200), picsum('p01-2', 1200, 1200), ...SHARED_LIFESTYLE],
  p02: [picsum('p02-1', 1200, 1200), picsum('p02-2', 1200, 1200), picsum('p02-3', 1200, 1200), picsum('p02-4', 1200, 1200)],
  p03: [picsum('p03-1', 1200, 1200), picsum('p03-2', 1200, 1200), picsum('p03-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p04: [picsum('p04-1', 1200, 1200), picsum('p04-2', 1200, 1200), picsum('p04-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p05: [picsum('p05-1', 1200, 1200), picsum('p05-2', 1200, 1200), picsum('p05-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p06: [picsum('p06-1', 1200, 1200), picsum('p06-2', 1200, 1200), picsum('p06-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p07: [picsum('p07-1', 1200, 1200), picsum('p07-2', 1200, 1200), picsum('p07-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p08: [picsum('p08-1', 1200, 1200), picsum('p08-2', 1200, 1200), picsum('p08-3', 1200, 1200), picsum('p08-4', 1200, 1200)],
  p09: [picsum('p09-1', 1200, 1200), picsum('p09-2', 1200, 1200), picsum('p09-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p10: [picsum('p10-1', 1200, 1200), picsum('p10-2', 1200, 1200), picsum('p10-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p11: [picsum('p11-1', 1200, 1200), picsum('p11-2', 1200, 1200), picsum('p11-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p12: [picsum('p12-1', 1200, 1200), picsum('p12-2', 1200, 1200), picsum('p12-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p13: [picsum('p13-1', 1200, 1200), picsum('p13-2', 1200, 1200), picsum('p13-3', 1200, 1200), picsum('p13-4', 1200, 1200)],
  p14: [picsum('p14-1', 1200, 1200), picsum('p14-2', 1200, 1200), picsum('p14-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p15: [picsum('p15-1', 1200, 1200), picsum('p15-2', 1200, 1200), picsum('p15-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p16: [picsum('p16-1', 1200, 1200), picsum('p16-2', 1200, 1200), picsum('p16-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p17: [picsum('p17-1', 1200, 1200), picsum('p17-2', 1200, 1200), picsum('p17-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p18: [picsum('p18-1', 1200, 1200), picsum('p18-2', 1200, 1200), picsum('p18-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p19: [picsum('p19-1', 1200, 1200), picsum('p19-2', 1200, 1200), picsum('p19-3', 1200, 1200), ...SHARED_LIFESTYLE],
  p20: [picsum('p20-1', 1200, 1200), picsum('p20-2', 1200, 1200), picsum('p20-3', 1200, 1200), ...SHARED_LIFESTYLE],
};

export function getProductImages(productId: string): string[] {
  return (
    productImages[productId] ?? [
      picsum('default-1', 1200, 1200),
      picsum('default-2', 1200, 1200),
      picsum('default-3', 1200, 1200),
      picsum('default-4', 1200, 1200),
    ]
  );
}
