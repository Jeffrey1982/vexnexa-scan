import { supabaseAdmin } from './supabase-admin';

export interface PublicReportPreview {
  domain: string;
  score: number;
  totals: { totalIssues?: number } | null;
  created_at: string;
}

/**
 * Server-side query for public reports.
 * Uses the service role admin client (bypasses RLS).
 * Returns up to `limit` most recent public, non-opted-out reports.
 * Throws on Supabase error so callers can handle it.
 */
export async function getPublicReports(limit: number = 12): Promise<PublicReportPreview[]> {
  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from('scan_reports')
    .select('domain, score, data, created_at')
    .eq('is_public', true)
    .eq('opted_out', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getPublicReports] Supabase error:', JSON.stringify(error));
    throw new Error(`[getPublicReports] Supabase query failed: ${error.message}`);
  }

  if (!data) return [];

  return (data as { domain: string; score: number; data: Record<string, unknown> | null; created_at: string }[]).map(
    (row) => {
      const d = row.data ?? {};
      const totals = (d.totals as { totalIssues?: number } | undefined) ?? null;
      return {
        domain: row.domain,
        score: row.score,
        totals,
        created_at: row.created_at,
      };
    },
  );
}
