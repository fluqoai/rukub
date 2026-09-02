import { Hero } from '@/components/landing/Hero';
import { ThreePaths } from '@/components/landing/ThreePaths';
import { FeaturedProducts } from '@/components/landing/FeaturedProducts';
import { Bundles } from '@/components/landing/Bundles';
import { CJShowcase } from '@/components/landing/CJShowcase';
import { WhyUs } from '@/components/landing/WhyUs';
import { Testimonials } from '@/components/landing/Testimonials';
import { Newsletter } from '@/components/landing/Newsletter';

export default function Home() {
  return (
    <main>
      <Hero />
      <ThreePaths />
      <FeaturedProducts />
      <Bundles />
      <CJShowcase />
      <WhyUs />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
