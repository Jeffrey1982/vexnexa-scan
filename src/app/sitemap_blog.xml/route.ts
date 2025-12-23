import { NextResponse } from 'next/server';

const CANONICAL_HOST = 'https://scan.vexnexa.com';

// Blog posts - currently none for scan.vexnexa.com
// Blog content lives on vexnexa.com
const BLOG_POSTS: Array<{ slug: string; lastmod: string }> = [];

export async function GET() {
  const urls: string[] = [];

  for (const post of BLOG_POSTS) {
    urls.push(`  <url>
    <loc>${CANONICAL_HOST}/blog/${post.slug}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
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
