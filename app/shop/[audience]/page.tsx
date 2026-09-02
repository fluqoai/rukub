import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ShopPageClient } from '@/components/sections/ShopPageClient';
import { getPublicProducts } from '@/lib/public-products';
import type { Audience } from '@/lib/products';

const validAudiences = ['women', 'men', 'shared'] as const;
type ValidAudience = (typeof validAudiences)[number];

function isValidAudience(value: string): value is ValidAudience {
  return (validAudiences as readonly string[]).includes(value);
}

export const dynamic = 'force-dynamic';

export function generateMetadata({
  params,
}: {
  params: { audience: string };
}): Metadata {
  if (!isValidAudience(params.audience)) return { title: 'قسم غير موجود' };
  const titles: Record<ValidAudience, string> = {
    women: 'إكسسوارات سيارات للنساء · ركوب',
    men: 'إكسسوارات سيارات للرجال · ركوب',
    shared: 'إكسسوارات سيارات مشتركة · ركوب',
  };
  return { title: titles[params.audience] };
}

export default async function ShopAudiencePage({
  params,
}: {
  params: { audience: string };
}) {
  if (!isValidAudience(params.audience)) notFound();
  const audience = params.audience as ValidAudience;
  const products = await getPublicProducts({ audience });
  return <ShopPageClient audience={audience as Audience} products={products} />;
}
