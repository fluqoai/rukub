import SearchPage from '@/components/search/SearchPageContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'البحث · ركوب',
  description: 'ابحث عن إكسسوارات السيارات في متجر ركوب.',
};

export default function Page() {
  return <SearchPage />;
}
