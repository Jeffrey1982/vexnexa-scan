import { NextRequest, NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/site';
import { getPublicReports } from '@/lib/report-store';

export const dynamic = 'force-dynamic';

const MAX_PER_SITEMAP = 5000;

export async function GET(req: NextRequest) {
  // Support ?page=N for sitemap splitting (0-indexed, default 0)
  const pageParam: string | null = req.nextUrl.searchParams.get('page');
  const page: number = pageParam ? Math.max(0, parseInt(pageParam, 10) || 0) : 0;

  // Fetch all public reports (capped at a reasonable upper bound)
  const allReports = await getPublicReports(50000);
  const totalPages: number = Math.max(1, Math.ceil(allReports.length / MAX_PER_SITEMAP));

  // If there are multiple pages and no page param, return a sitemap index
  if (allReports.length > MAX_PER_SITEMAP && pageParam === null) {
    const sitemaps: string[] = [];
    for (let i = 0; i < totalPages; i++) {
      sitemaps.push(`  <sitemap>
    <loc>${SITE_URL}/sitemap_reports.xml?page=${i}</loc>
  </sitemap>`);
    }

    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.join('\n')}
</sitemapindex>`;

    return new NextResponse(indexXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  // Return a single sitemap page
  const start: number = page * MAX_PER_SITEMAP;
  const slice = allReports.slice(start, start + MAX_PER_SITEMAP);

  const urls: string[] = slice.map((report) => {
    const lastmod: string = new Date(report.last_scanned_at).toISOString().split('T')[0];
    return `  <url>
    <loc>${SITE_URL}/report/${encodeURIComponent(report.domain)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

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
