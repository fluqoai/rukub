// Middleware: protect /admin/* (except /admin/login) by checking session cookie.
// Also sets the `x-pathname` header so server layouts can know the current route.

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'rukub_admin_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token || token.length < 16) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Forward pathname so server components can read it via headers().
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin/:path*'],
};
