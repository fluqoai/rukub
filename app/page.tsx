import { Hero } from '@/components/landing/Hero';
import { ThreePaths } from '@/components/landing/ThreePaths';
import { FeaturedProducts } from '@/components/landing/FeaturedProducts';
import { WhyUs } from '@/components/landing/WhyUs';

export default function Home() {
  return (
    <main>
      <Hero />
      <ThreePaths />
      <FeaturedProducts />
      <WhyUs />
    </main>
  );
}
