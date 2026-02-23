import { NextRequest, NextResponse } from 'next/server';
import { getScanJob } from '@/lib/scan-job-store-supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/scan/[id]
 * Poll a scan job's status. Returns the job object including results when completed.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'Job ID is required.' },
      { status: 400 },
    );
  }

  const job = await getScanJob(id);

  if (!job) {
    return NextResponse.json(
      { error: 'Job not found. It may have expired or never existed.' },
      { status: 404 },
    );
  }

  // Build response based on status
  const response: Record<string, unknown> = {
    jobId: job.id,
    domain: job.domain,
    status: job.status,
    createdAt: job.createdAt,
  };

  if (job.status === 'completed' && job.resultJson) {
    response.reportId = job.resultJson.reportId;
    response.private_token = job.resultJson.private_token;
    response.publicUrl = job.resultJson.publicUrl;
    response.privateUrl = job.resultJson.privateUrl;
    response.timings = job.resultJson.timings;
  }

  if (job.status === 'failed') {
    response.error = job.error;
  }

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
