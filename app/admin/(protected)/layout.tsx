// Server-side layout for protected admin pages.
// 1) Middleware already gates access by cookie presence.
// 2) This layout re-verifies the session and redirects to /admin/login if invalid.

import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getCurrentAdmin } from '@/lib/admin-auth-server';
import { AdminSessionProvider } from '@/components/admin/AdminSessionProvider';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <AdminSessionProvider admin={admin}>
      <div className="flex min-h-screen bg-linen-100/50">
        <AdminSidebar admin={admin} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </AdminSessionProvider>
  );
}
