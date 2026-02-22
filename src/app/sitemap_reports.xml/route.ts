import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/site';
import { getPublicReports } from '@/lib/report-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const reports = await getPublicReports(5000);

  const urls: string[] = reports.map((report) => {
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
