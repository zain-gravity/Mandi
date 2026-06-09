import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';


export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const pathname = url.pathname;

  let ROOT_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN;
  if (!ROOT_DOMAIN) {
    if (hostname.includes('localhost')) {
      ROOT_DOMAIN = 'localhost:3000';
    } else if (hostname.endsWith('.vercel.app')) {
      // e.g. admin.mandi-sepia.vercel.app -> mandi-sepia.vercel.app
      const parts = hostname.split('.');
      if (parts.length > 3) {
         ROOT_DOMAIN = parts.slice(-3).join('.');
      } else {
         ROOT_DOMAIN = hostname;
      }
    } else {
      // For custom domains like domain.com
      const parts = hostname.split('.');
      if (parts.length > 2) {
         ROOT_DOMAIN = parts.slice(-2).join('.');
      } else {
         ROOT_DOMAIN = hostname;
      }
    }
  }

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
  let subdomain = '';
  
  if (hostname === ROOT_DOMAIN) {
    subdomain = '';
  } else if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '');
  } else if (hostname.includes('localhost')) {
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
      if (hostname.endsWith('.vercel.app')) {
        // On Vercel preview domains, subdomains require manual configuration.
        // So we fallback to path-based routing: just redirect to /admin path instead of admin.domain.com
        if (!pathname.startsWith('/admin')) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
      }
      
      return NextResponse.redirect(
        new URL(`http${hostname.includes('localhost') ? '' : 's'}://admin.${ROOT_DOMAIN}`, request.url)
      );
    }

    // Redirect root to dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Rewrite to app folder if not already there
    let targetPath = pathname;
    if (!pathname.startsWith('/app')) {
      targetPath = `/app${pathname === '/' ? '' : pathname}`;
    }
    
    const rewriteUrl = new URL(targetPath, request.url);
    rewriteUrl.search = url.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  // ── Unknown subdomain → redirect to app ──
  if (hostname.endsWith('.vercel.app')) {
     return NextResponse.redirect(new URL(`/app`, request.url));
  }

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
