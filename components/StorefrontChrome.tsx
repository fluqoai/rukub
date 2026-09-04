'use client';
import { usePathname } from 'next/navigation';
import { Header } from './landing/Header';
import { Footer } from './landing/Footer';
export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <>{children}</>;
  return <><Header />{children}<Footer /></>;
}
