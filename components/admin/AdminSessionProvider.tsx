'use client';

// Lightweight client-side context so client components can read the admin
// without re-fetching. Server components pass admin via prop; client
// components consume from this context.

import { createContext, useContext, type ReactNode } from 'react';

export type Admin = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
};

const AdminContext = createContext<Admin | null>(null);

export function AdminSessionProvider({ admin, children }: { admin: Admin; children: ReactNode }) {
  return <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>;
}

export function useAdmin(): Admin | null {
  return useContext(AdminContext);
}
