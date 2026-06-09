import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  // ── Skip static assets, API routes, and auth-related paths ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/icons')
  ) {
    return NextResponse.next();
  }

  // ── Extract subdomain ──
  // Production: admin.manditrader.com → "admin"
  // Local dev:  admin.localhost:3000  → "admin"
  let subdomain = '';
  
  if (hostname.includes(ROOT_DOMAIN)) {
    subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '');
  } else if (hostname.includes('localhost')) {
    // Local development: extract subdomain from localhost
    const parts = hostname.split('.');
    if (parts.length > 1) {
      subdomain = parts[0];
    }
  }

  // Remove port from subdomain if present
  subdomain = subdomain.split(':')[0];

  // ── Get auth token ──
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // ── ADMIN SUBDOMAIN (admin.domain.com) ──
  if (subdomain === 'admin') {
    // Redirect unauthenticated users to login
    if (!token && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname === '/login') {
      return NextResponse.next();
    }

    // Only SUPER_ADMIN can access admin panel
    if (token && token.role !== 'SUPER_ADMIN' && pathname !== '/login') {
      return NextResponse.rewrite(new URL('/unauthorized', request.url));
    }

    // Rewrite to admin route group
    const rewriteUrl = new URL(`/admin${pathname === '/' ? '' : pathname}`, request.url);
    rewriteUrl.search = url.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  // ── APP SUBDOMAIN (app.domain.com) ──
  if (subdomain === 'app' || subdomain === '' || subdomain === 'www') {
    // Redirect unauthenticated users to login
    if (!token && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname === '/login') {
      return NextResponse.next();
    }

    // SUPER_ADMIN should go to admin panel
    if (token && token.role === 'SUPER_ADMIN' && pathname !== '/login') {
      return NextResponse.redirect(
        new URL(`http${hostname.includes('localhost') ? '' : 's'}://admin.${ROOT_DOMAIN}`, request.url)
      );
    }

    // Rewrite to app route group
    const rewriteUrl = new URL(`/app${pathname === '/' ? '' : pathname}`, request.url);
    rewriteUrl.search = url.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  // ── Unknown subdomain → redirect to app ──
  return NextResponse.redirect(
    new URL(`http${hostname.includes('localhost') ? '' : 's'}://app.${ROOT_DOMAIN}`, request.url)
  );
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes (/api/...)
     * - static files (/_next/static/...)
     * - image optimization (/_next/image/...)
     * - favicon, manifest, service worker
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)',
  ],
};
