import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, isValidLocale, type Locale } from './i18n/locales';

const LOCALE_COOKIE_NAME = 'vx_locale';

function getLocaleFromCookie(request: NextRequest): Locale | null {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }
  return null;
}

function getLocaleFromAcceptLanguage(request: NextRequest): Locale | null {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return null;

  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,nl;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';');
      const q = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;
      return { code: code.split('-')[0].toLowerCase(), q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    if (isValidLocale(code)) {
      return code;
    }
  }

  return null;
}

function getPreferredLocale(request: NextRequest): Locale {
  // 1. Check cookie
  const cookieLocale = getLocaleFromCookie(request);
  if (cookieLocale) return cookieLocale;

  // 2. Check Accept-Language header
  const acceptLocale = getLocaleFromAcceptLanguage(request);
  if (acceptLocale) return acceptLocale;

  // 3. Default
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Let the root "/" be handled by app/page.tsx (new marketing home page)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // For any other path without locale, redirect to the same path with preferred locale
  // (This handles edge cases, but main paths should be under /[locale])
  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url, { status: 308 });
}

export const config = {
  matcher: [
    // Match all pathnames except:
    // - api routes
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico, robots.txt, etc.
    // - /report routes (public report pages)
    // - /r routes (private token-based report pages)
    // - /report-removal (opt-out route)
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.svg|logo.*\\.svg|robots.txt|sitemap|badge|report|r/|report-removal).*)',
  ],
};
