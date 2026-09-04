import { Hero } from '@/components/landing/Hero';
import { ThreePaths } from '@/components/landing/ThreePaths';
import { FeaturedProducts } from '@/components/landing/FeaturedProducts';
import { WhyUs } from '@/components/landing/WhyUs';
import { getPublicProducts } from '@/lib/public-products';

export default async function Home() {
  const products = await getPublicProducts();
  return (
    <main>
      <Hero />
      <ThreePaths />
      <FeaturedProducts products={products} />
      <WhyUs />
    </main>
  );
}
