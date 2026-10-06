import { NextRequest, NextResponse } from 'next/server';

// UX redirect only. The NestJS API is the real authority for every request.
export function middleware(req: NextRequest) {
  if (req.cookies.has('access_token')) return NextResponse.next();
  const login = req.nextUrl.pathname.startsWith('/admin') ? '/admin-login' : '/applicant-login';
  return NextResponse.redirect(new URL(login, req.url));
}
export const config = { matcher: ['/admin/:path*', '/applicant/:path*'] };
