import { NextRequest, NextResponse } from 'next/server';
import { getReportById, setReportVisibility, isDomainOptedOut } from '@/lib/report-store';

interface VisibilityRequestBody {
  is_public: boolean;
}

/**
 * PATCH /api/report/[id]/visibility
 * Toggle a report's public/private visibility.
 *
 * Security:
 *  - Requires x-report-token header matching report.private_token
 *  - If domain is opted-out, forces is_public=false and returns 403
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    const reportId: string = params.id;
    const token: string | null = request.headers.get('x-report-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing x-report-token header' },
        { status: 401 },
      );
    }

    const body: VisibilityRequestBody = await request.json();

    if (typeof body.is_public !== 'boolean') {
      return NextResponse.json(
        { error: 'is_public must be a boolean' },
        { status: 400 },
      );
    }

    // Load report
    const report = await getReportById(reportId);
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 },
      );
    }

    // Validate token
    if (report.private_token !== token) {
      return NextResponse.json(
        { error: 'Invalid report token' },
        { status: 403 },
      );
    }

    // Check opted-out
    const optedOut: boolean = await isDomainOptedOut(report.domain);
    if (optedOut && body.is_public) {
      // Force private for opted-out domains
      await setReportVisibility(reportId, false);
      return NextResponse.json(
        { error: 'This domain has opted out of public reports.' },
        { status: 403 },
      );
    }

    const updated = await setReportVisibility(reportId, body.is_public);
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      reportId: updated.id,
      domain: updated.domain,
      is_public: updated.is_public,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update report visibility' },
      { status: 500 },
    );
  }
}
