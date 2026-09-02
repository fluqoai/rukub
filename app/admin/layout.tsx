// Pass-through layout for /admin/*.
// The protected pages are in (protected)/ with their own auth-checking layout.
// The login page is at /admin/login (no auth needed).
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
