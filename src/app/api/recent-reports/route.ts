import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export interface RecentReport {
  domain: string;
  score: number;
  total_issues: number;
}

export async function GET(): Promise<NextResponse<RecentReport[]>> {
  const sb = getSupabaseServer();

  const { data, error } = await sb
    .from('scan_reports')
    .select('domain, score, data')
    .eq('is_public', true)
    .eq('opted_out', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[/api/recent-reports] Supabase error:', JSON.stringify(error));
  }

  if (error || !data) {
    return NextResponse.json([], { status: 200 });
  }

  const reports: RecentReport[] = (data as { domain: string; score: number; data: Record<string, unknown> }[]).map(
    (row) => {
      const totals = row.data?.totals as { totalIssues?: number } | undefined;
      return {
        domain: row.domain,
        score: row.score,
        total_issues: totals?.totalIssues ?? 0,
      };
    },
  );

  return NextResponse.json(reports, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
