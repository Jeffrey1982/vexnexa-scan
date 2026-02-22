import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export interface PublicReportPreview {
  id: string;
  domain: string;
  score: number;
  totals: { totalIssues?: number } | null;
  created_at: string;
}

export async function getPublicReports(limit: number = 12): Promise<PublicReportPreview[]> {
  const { data, error } = await supabase
    .from('scan_reports')
    .select('id, domain, score, created_at, data')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getPublicReports]', error);
    return [];
  }

  console.log('[getPublicReports] rows:', data?.length);

  if (!data) return [];

  return data.map((row: { id: string; domain: string; score: number; created_at: string; data: Record<string, unknown> | null }) => {
    const d = row.data ?? {};
    const totals = (d.totals as { totalIssues?: number } | undefined) ?? null;
    return {
      id: row.id,
      domain: row.domain,
      score: row.score,
      totals,
      created_at: row.created_at,
    };
  });
}
