import { NextRequest, NextResponse } from 'next/server';
import { getReportById } from '@/lib/report-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/report/[id]?t=<private_token>
 * Fetch a report by ID. Requires valid private token.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const token: string | null = request.nextUrl.searchParams.get('t');

  if (!token) {
    return NextResponse.json(
      { error: 'Missing token parameter' },
      { status: 401 },
    );
  }

  const report = await getReportById(params.id);

  if (!report) {
    return NextResponse.json(
      { error: 'Report not found' },
      { status: 404 },
    );
  }

  if (report.private_token !== token) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 403 },
    );
  }

  return NextResponse.json({ report });
}
