'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Truck,
  Bell,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAdmin, type Admin } from './AdminSessionProvider';

const navItems = [
  { key: 'dashboard', label: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
  { key: 'orders', label: 'الطلبات', href: '/admin/orders', icon: ShoppingCart },
  { key: 'products', label: 'المنتجات', href: '/admin/products', icon: Package },
  { key: 'notifications', label: 'الإشعارات', href: '/admin/notifications', icon: Bell },
  { key: 'shipping', label: 'الشحن والتسليم', href: '/admin/shipping', icon: Truck },
  { key: 'analytics', label: 'التحليلات', href: '/admin/analytics', icon: BarChart3 },
  { key: 'customers', label: 'العملاء', href: '/admin/customers', icon: Users },
  { key: 'settings', label: 'الإعدادات', href: '/admin/settings', icon: Settings },
];

type SidebarProps = { admin: Admin };

export function AdminSidebar({ admin }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    router.push('/admin/login');
    router.refresh();
  };

  const initial = (admin.full_name || admin.email).charAt(0).toUpperCase();
  const displayName = admin.full_name || admin.email.split('@')[0];

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-shrink-0 flex-col border-l border-ink-900/10 bg-ink-900 text-linen-50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-linen-50/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-500 text-linen-50">
          <span className="font-mono text-sm font-bold">ر</span>
        </div>
        <div>
          <p className="text-sm font-semibold">ركوب</p>
          <p className="text-[10px] uppercase tracking-wider text-linen-300/60">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-sage-500 text-linen-50'
                  : 'text-linen-200/80 hover:bg-linen-50/5 hover:text-linen-50'
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-linen-50/10 p-3">
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-linen-50/5 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-500 text-xs font-semibold">
            {initial}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-medium">{displayName}</p>
            <p className="truncate text-[10px] text-linen-300/60" dir="ltr">{admin.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-linen-200/80 transition-colors hover:bg-linen-50/5 hover:text-linen-50"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          <span>تسجيل الخروج</span>
        </button>
        <Link
          href="/"
          className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-linen-200/60 transition-colors hover:bg-linen-50/5 hover:text-linen-50"
        >
          <Chevron className="h-3 w-3" />
          <span>العودة للمتجر</span>
        </Link>
      </div>
    </aside>
  );
}
