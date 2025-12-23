import { NextResponse } from 'next/server';

const CANONICAL_HOST = 'https://scan.vexnexa.com';

export async function GET() {
  const lastmod = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${CANONICAL_HOST}/sitemap_content.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
