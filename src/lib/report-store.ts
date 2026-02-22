// ─── Supabase-Backed Report Store ───
// All page components and API routes should use these functions.
// Data is persisted to Supabase scan_reports + scan_opt_outs tables.

import type { ScanReport } from './report-types';
import { getSupabaseServer } from './supabase-server';

// ─── DB row shape ───

interface ScanReportRow {
  id: string;
  domain: string;
  private_token: string;
  is_public: boolean;
  scope_pages: number;
  score: number;
  wcag_level: string;
  data: Record<string, unknown>;
  created_at: string;
  last_scanned_at: string;
  opted_out: boolean;
}

// ─── Row <-> ScanReport mapping ───

function rowToReport(row: ScanReportRow): ScanReport {
  const d = row.data as Record<string, unknown>;
  return {
    id: row.id,
    domain: row.domain,
    score: row.score,
    wcagLevel: row.wcag_level,
    is_public: row.is_public,
    private_token: row.private_token,
    scope_pages: row.scope_pages,
    last_scanned_at: row.last_scanned_at,
    created_at: row.created_at,
    totals: (d.totals as ScanReport['totals']) ?? { totalIssues: 0, contrastIssues: 0, ariaIssues: 0, altTextIssues: 0 },
    issueBreakdown: (d.issueBreakdown as ScanReport['issueBreakdown']) ?? { contrast: 0, aria: 0, altText: 0, structure: 0, forms: 0, navigation: 0 },
    issues: (d.issues as ScanReport['issues']) ?? [],
  };
}

function reportToRow(report: ScanReport): Omit<ScanReportRow, 'opted_out'> {
  return {
    id: report.id,
    domain: report.domain,
    private_token: report.private_token,
    is_public: report.is_public,
    scope_pages: report.scope_pages,
    score: report.score,
    wcag_level: report.wcagLevel,
    data: {
      totals: report.totals,
      issueBreakdown: report.issueBreakdown,
      issues: report.issues.map((issue) => ({
        ...issue,
        selector: issue.selector?.substring(0, 200),
        codeExample: issue.codeExample?.substring(0, 500),
      })),
    },
    created_at: report.created_at,
    last_scanned_at: report.last_scanned_at,
  };
}

// ─── Public API ───

export async function getReportByDomain(domain: string): Promise<ScanReport | null> {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from('scan_reports')
    .select('*')
    .eq('domain', domain)
    .single();

  if (error || !data) return null;
  return rowToReport(data as ScanReportRow);
}

export async function getReportById(id: string): Promise<ScanReport | null> {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from('scan_reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return rowToReport(data as ScanReportRow);
}

export async function upsertReport(report: ScanReport): Promise<ScanReport> {
  const sb = getSupabaseServer();
  const row = reportToRow(report);

  const { data, error } = await sb
    .from('scan_reports')
    .upsert(row, { onConflict: 'domain' })
    .select('*')
    .single();

  if (error || !data) {
    const raw: string = error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'null';
    console.error('[supabase] upsertReport raw error:', raw);
    console.error('[supabase] upsertReport error keys:', error ? Object.keys(error as unknown as Record<string, unknown>) : 'no error object');
    console.error('[supabase] upsertReport data:', data);
    throw new Error(`Failed to save report: ${raw}`);
  }

  return rowToReport(data as ScanReportRow);
}

export async function setReportVisibility(
  id: string,
  isPublic: boolean,
): Promise<ScanReport | null> {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from('scan_reports')
    .update({ is_public: isPublic })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    const raw: string = error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'null';
    console.error('[supabase] setReportVisibility raw error:', raw);
    console.error('[supabase] setReportVisibility error keys:', error ? Object.keys(error as unknown as Record<string, unknown>) : 'no error object');
    console.error('[supabase] setReportVisibility id:', id, 'data:', data);
    throw new Error(`Failed to update visibility: ${raw}`);
  }

  return rowToReport(data as ScanReportRow);
}

export async function isDomainOptedOut(domain: string): Promise<boolean> {
  const sb = getSupabaseServer();
  const { data } = await sb
    .from('scan_opt_outs')
    .select('domain')
    .eq('domain', domain)
    .single();

  return !!data;
}

export async function requestDomainRemoval(domain: string): Promise<void> {
  const sb = getSupabaseServer();

  // Insert into opt-outs (ignore conflict if already exists)
  const { error: optOutError } = await sb
    .from('scan_opt_outs')
    .upsert({ domain }, { onConflict: 'domain' });

  if (optOutError) {
    const raw: string = JSON.stringify(optOutError, Object.getOwnPropertyNames(optOutError));
    console.error('[supabase] requestDomainRemoval opt-out raw error:', raw);
    console.error('[supabase] requestDomainRemoval opt-out keys:', Object.keys(optOutError as unknown as Record<string, unknown>));
    throw new Error(`Failed to opt-out domain ${domain}: ${raw}`);
  }

  // Force existing report to private + mark opted_out
  const { error: updateError } = await sb
    .from('scan_reports')
    .update({ is_public: false, opted_out: true })
    .eq('domain', domain);

  if (updateError) {
    const raw: string = JSON.stringify(updateError, Object.getOwnPropertyNames(updateError));
    console.error('[supabase] requestDomainRemoval update raw error:', raw);
    console.error('[supabase] requestDomainRemoval update keys:', Object.keys(updateError as unknown as Record<string, unknown>));
    throw new Error(`Failed to update report for opted-out domain ${domain}: ${raw}`);
  }
}

/**
 * Get count of scans performed in the last 24 hours.
 */
export async function getScanCountLast24h(): Promise<number> {
  const sb = getSupabaseServer();
  const since: string = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await sb
    .from('scan_reports')
    .select('id', { count: 'exact', head: true })
    .gte('last_scanned_at', since);

  if (error) {
    console.error('[supabase] getScanCountLast24h error:', JSON.stringify(error));
    return 0;
  }

  return count ?? 0;
}

/**
 * Get random public, non-opted-out reports (for internal linking).
 * Excludes the given domain so the current report isn't shown.
 */
export async function getRandomPublicReports(
  excludeDomain: string,
  limit: number = 10,
): Promise<{ domain: string; score: number }[]> {
  const sb = getSupabaseServer();
  // Supabase doesn't support ORDER BY random(), so fetch more and shuffle client-side
  const { data, error } = await sb
    .from('scan_reports')
    .select('domain, score')
    .eq('is_public', true)
    .eq('opted_out', false)
    .neq('domain', excludeDomain)
    .limit(100);

  if (error || !data) return [];

  const rows = data as { domain: string; score: number }[];
  // Fisher-Yates shuffle
  for (let i = rows.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  return rows.slice(0, limit);
}

/**
 * Get all public, non-opted-out reports (for sitemap).
 * Limited to maxCount entries.
 */
export async function getPublicReports(maxCount: number = 5000): Promise<ScanReport[]> {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from('scan_reports')
    .select('*')
    .eq('is_public', true)
    .eq('opted_out', false)
    .limit(maxCount);

  if (error || !data) return [];
  return (data as ScanReportRow[]).map(rowToReport);
}
