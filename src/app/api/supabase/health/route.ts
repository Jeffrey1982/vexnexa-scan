import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/supabase/health
 * Verify Supabase connectivity and that the scan_reports table exists.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const sb = getSupabaseServer();

    const { data, error, status, statusText } = await sb
      .from('scan_reports')
      .select('id')
      .limit(1);

    if (error) {
      const raw: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
      console.error('[supabase-health] query error:', raw);

      const isMissingTable: boolean =
        error.message?.includes('relation') ||
        error.message?.includes('does not exist') ||
        error.code === '42P01';

      return NextResponse.json(
        {
          ok: false,
          error: raw,
          status,
          statusText,
          hint: isMissingTable
            ? 'Create scan_reports table via SQL migration. Run supabase/migrations/001_scan_reports.sql in the Supabase SQL Editor.'
            : 'Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars. Verify the service_role key (not the anon key) is used.',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      rowCount: data?.length ?? 0,
      hint: 'Supabase connection is healthy. scan_reports table exists.',
    });
  } catch (err) {
    const message: string = err instanceof Error ? err.message : String(err);
    console.error('[supabase-health] exception:', message);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint: 'Exception before Supabase query — likely missing env vars.',
      },
      { status: 500 },
    );
  }
}
