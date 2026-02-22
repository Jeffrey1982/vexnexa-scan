import { NextRequest, NextResponse } from 'next/server';
import { getReportByDomain } from '@/lib/report-store';
import { normalizeDomain, DomainValidationError } from '@/lib/normalize-domain';

export const dynamic = 'force-dynamic';

function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e'; // green
  if (score >= 70) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { domain: string } },
): Promise<NextResponse> {
  // Strip .svg extension from domain param
  const rawDomain: string = params.domain.replace(/\.svg$/i, '');

  let normalized: string;
  try {
    normalized = normalizeDomain(rawDomain);
  } catch (e) {
    if (e instanceof DomainValidationError) {
      return new NextResponse('Invalid domain', { status: 400 });
    }
    throw e;
  }

  const report = await getReportByDomain(normalized);

  if (!report || !report.is_public) {
    // Return a generic "no data" badge
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="20">
  <rect width="180" height="20" rx="3" fill="#555"/>
  <text x="90" y="14" fill="#fff" font-family="Inter,sans-serif" font-size="11" text-anchor="middle">Accessibility: No data</text>
</svg>`;
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  const score: number = report.score;
  const color: string = getScoreColor(score);
  const label: string = getScoreLabel(score);

  const labelWidth = 110;
  const scoreWidth = 90;
  const totalWidth: number = labelWidth + scoreWidth;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${scoreWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Inter,DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">Accessibility</text>
    <text x="${labelWidth / 2}" y="14">Accessibility</text>
    <text x="${labelWidth + scoreWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${score} · ${label}</text>
    <text x="${labelWidth + scoreWidth / 2}" y="14">${score} · ${label}</text>
  </g>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
