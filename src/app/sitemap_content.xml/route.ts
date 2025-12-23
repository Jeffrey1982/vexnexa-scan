import { NextResponse } from 'next/server';

const CANONICAL_HOST = 'https://scan.vexnexa.com';
const LOCALES = ['en', 'nl', 'de', 'fr', 'es'] as const;

// Define all content pages with their localized slugs
const CONTENT_PAGES = [
  {
    // Homepage - all locales use same path
    slug: '',
    priority: '1.0',
  },
  {
    // Privacy page
    slug: 'privacy',
    priority: '0.5',
  },
  {
    // Contact page
    slug: 'contact',
    priority: '0.7',
  },
  {
    // How to test accessibility (English only)
    slug: 'how-to-test-website-accessibility',
    locales: ['en'],
    priority: '0.9',
  },
  {
    // WCAG 2.1 AA Requirements - English
    slug: 'wcag-2-1-aa-requirements',
    locales: ['en'],
    priority: '0.9',
  },
  {
    // WCAG 2.1 AA Vereisten - Dutch
    slug: 'wcag-2-1-aa-vereisten',
    locales: ['nl'],
    priority: '0.9',
  },
  {
    // WCAG 2.1 AA Anforderungen - German
    slug: 'wcag-2-1-aa-anforderungen',
    locales: ['de'],
    priority: '0.9',
  },
  {
    // Exigences WCAG 2.1 AA - French
    slug: 'exigences-wcag-2-1-aa',
    locales: ['fr'],
    priority: '0.9',
  },
  {
    // Requisitos WCAG 2.1 AA - Spanish
    slug: 'requisitos-wcag-2-1-aa',
    locales: ['es'],
    priority: '0.9',
  },
];

export async function GET() {
  const lastmod = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const urls: string[] = [];

  // Generate URLs for all content pages
  for (const page of CONTENT_PAGES) {
    const locales = page.locales || LOCALES;

    for (const locale of locales) {
      const path = page.slug ? `/${locale}/${page.slug}` : `/${locale}`;
      const url = `${CANONICAL_HOST}${path}`;

      urls.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
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
