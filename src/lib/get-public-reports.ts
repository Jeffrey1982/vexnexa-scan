import { getSupabaseServer } from './supabase-server';

export interface PublicReport {
  domain: string;
  score: number;
  total_issues: number;
  created_at: string;
}

/**
 * Server-side query for public reports.
 * Uses the service role client (bypasses RLS).
 * Returns up to `limit` most recent public, non-opted-out reports.
 */
export async function getPublicReports(limit: number = 12): Promise<PublicReport[]> {
  try {
    const sb = getSupabaseServer();

    const { data, error } = await sb
      .from('scan_reports')
      .select('domain, score, data, created_at')
      .eq('is_public', true)
      .eq('opted_out', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[getPublicReports] Supabase error:', JSON.stringify(error));
      return [];
    }

    if (!data) return [];

    return (data as { domain: string; score: number; data: Record<string, unknown>; created_at: string }[]).map(
      (row) => {
        const totals = row.data?.totals as { totalIssues?: number } | undefined;
        return {
          domain: row.domain,
          score: row.score,
          total_issues: totals?.totalIssues ?? 0,
          created_at: row.created_at,
        };
      },
    );
  } catch (err) {
    const message: string = err instanceof Error ? err.message : String(err);
    console.error('[getPublicReports] Unexpected error:', message);
    return [];
  }
}
