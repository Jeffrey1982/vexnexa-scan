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

  if (error) {
    console.error('[report-store] upsert error:', error.message);
    throw new Error(`Failed to save report: ${error.message}`);
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

  if (error || !data) return null;
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
  await sb
    .from('scan_opt_outs')
    .upsert({ domain }, { onConflict: 'domain' });

  // Force existing report to private + mark opted_out
  await sb
    .from('scan_reports')
    .update({ is_public: false, opted_out: true })
    .eq('domain', domain);
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
