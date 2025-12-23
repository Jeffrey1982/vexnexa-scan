import { NextResponse } from 'next/server';

const CANONICAL_HOST = 'https://scan.vexnexa.com';
const LOCALES = ['en', 'nl', 'de', 'fr', 'es'] as const;

// Core pages only - no SEO guides, no blog
const CORE_PAGES = [
  {
    slug: '',
    priority: '1.0',
  },
  {
    slug: 'privacy',
    priority: '0.5',
  },
  {
    slug: 'contact',
    priority: '0.9',
  },
];

export async function GET() {
  const lastmod = new Date().toISOString().split('T')[0];

  const urls: string[] = [];

  for (const page of CORE_PAGES) {
    for (const locale of LOCALES) {
      const path = page.slug ? `/${locale}/${page.slug}` : `/${locale}`;
      const url = `${CANONICAL_HOST}${path}`;

      urls.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
