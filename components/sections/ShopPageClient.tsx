'use client';

import { type Audience } from '@/lib/products';
import type { PublicProduct } from '@/lib/public-products';
import { SectionHero } from './SectionHero';
import { SectionFilters } from './SectionFilters';
import { Container } from '@/components/ui/Container';

type ShopPageClientProps = {
  audience: Audience;
  products: PublicProduct[];
};

export function ShopPageClient({ audience, products }: ShopPageClientProps) {
  return (
    <main>
      <SectionHero audience={audience} products={products} />
      <section className="py-12 md:py-16">
        <Container>
          <SectionFilters audience={audience} products={products} />
        </Container>
      </section>
    </main>
  );
}
