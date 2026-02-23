import { NextRequest, NextResponse } from 'next/server';
import { fetchQueuedJobs, updateScanJob, cleanupExpiredJobs } from '@/lib/scan-job-store-supabase';
import type { ScanJob } from '@/lib/scan-job-store-supabase';
import { runAxeScan } from '@/lib/scanner/run-axe-scan';
import { getReportByDomain, upsertReport } from '@/lib/report-store';
import { recordDomainScan, recordIpScan } from '@/lib/rate-limit-report';
import { logScanEvent } from '@/lib/scan-logger';
import { SITE_URL } from '@/lib/site';
import type { ScanReport, IssueBreakdown } from '@/lib/report-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for processing multiple jobs

/** Max jobs to process per invocation */
const BATCH_SIZE: number = 3;

/**
 * GET /api/scan/worker
 * Protected worker endpoint called by Vercel Cron every minute.
 * Picks up queued scan jobs from Supabase and processes them sequentially.
 *
 * Vercel Cron sends GET requests with Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // ─── Auth: require CRON_SECRET via Authorization header ───
  const authHeader: string | null = request.headers.get('authorization');
  const cronSecret: string = process.env.CRON_SECRET ?? '';

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ─── Cleanup expired jobs first ───
  const cleaned: number = await cleanupExpiredJobs();
  if (cleaned > 0) {
    console.log(`[worker] Cleaned up ${cleaned} expired jobs`);
  }

  // ─── Fetch queued jobs ───
  const jobs: ScanJob[] = await fetchQueuedJobs(BATCH_SIZE);

  if (jobs.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No queued jobs.' });
  }

  console.log(`[worker] Processing ${jobs.length} queued jobs`);

  const results: Array<{ jobId: string; status: string }> = [];

  for (const job of jobs) {
    const startMs: number = Date.now();

    // Mark as running
    await updateScanJob(job.id, {
      status: 'running',
      started_at: new Date().toISOString(),
    });

    try {
      const scanResults = await runAxeScan({ url: job.scanUrl, domain: job.domain });

      // ─── Map issueBreakdown ───
      const issueBreakdown: IssueBreakdown = {
        contrast: scanResults.issueBreakdown['contrast'] ?? 0,
        aria: scanResults.issueBreakdown['aria'] ?? 0,
        altText: scanResults.issueBreakdown['altText'] ?? 0,
        structure: scanResults.issueBreakdown['structure'] ?? 0,
        forms: scanResults.issueBreakdown['forms'] ?? 0,
        navigation: scanResults.issueBreakdown['navigation'] ?? 0,
      };

      // ─── Map issues to ReportIssue format ───
      const reportIssues = scanResults.issues.map((issue) => ({
        ruleName: issue.ruleName,
        impact: issue.impact,
        wcagReference: issue.wcagReference,
        howToFix: issue.howToFix,
        selector: issue.selectors?.[0],
        codeExample: issue.codeExample,
      }));

      // ─── Create or update report in scan_reports ───
      const existing: ScanReport | null = await getReportByDomain(job.domain);
      const now: string = new Date().toISOString();

      // makePublic intent is stored in result_json metadata by POST /api/scan
      const wantPublic: boolean = job.resultJson?._makePublic === true;

      const report: ScanReport = existing
        ? {
            ...existing,
            score: scanResults.score,
            totals: scanResults.totals,
            issueBreakdown,
            issues: reportIssues,
            last_scanned_at: now,
            is_public: wantPublic ? true : existing.is_public,
          }
        : {
            id: crypto.randomUUID(),
            domain: job.domain,
            score: scanResults.score,
            wcagLevel: scanResults.wcagLevel,
            is_public: wantPublic,
            private_token: crypto.randomUUID(),
            scope_pages: 1,
            last_scanned_at: now,
            created_at: now,
            totals: scanResults.totals,
            issueBreakdown,
            issues: reportIssues,
          };

      const saved: ScanReport = await upsertReport(report);

      // ─── Record rate limit counters (only for non-admin) ───
      if (!job.isAdmin && job.ip) {
        recordIpScan(job.ip);
        recordDomainScan(job.domain);
      }

      const durationMs: number = Date.now() - startMs;

      // ─── Write results back to scan_jobs ───
      await updateScanJob(job.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
        result_json: {
          reportId: saved.id,
          private_token: saved.private_token,
          domain: saved.domain,
          score: saved.score,
          publicUrl: `${SITE_URL}/report/${encodeURIComponent(saved.domain)}`,
          privateUrl: `${SITE_URL}/r/${saved.id}?t=${saved.private_token}`,
          timings: scanResults.timings,
        },
      });

      logScanEvent({
        event: 'scan_request',
        ip: job.ip ?? 'worker',
        domain: job.domain,
        timestamp: new Date().toISOString(),
        result: 'completed',
        jobId: job.id,
        isAdmin: job.isAdmin || undefined,
        durationMs,
      });

      results.push({ jobId: job.id, status: 'completed' });
    } catch (e) {
      const errorMsg: string = e instanceof Error ? e.message : String(e);
      const durationMs: number = Date.now() - startMs;

      // Record counters even on failure
      if (!job.isAdmin && job.ip) {
        recordIpScan(job.ip);
        recordDomainScan(job.domain);
      }

      const isRedirectIssue: boolean =
        errorMsg.includes('repeated navigation') || errorMsg.includes('context destruction');

      await updateScanJob(job.id, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
        error: isRedirectIssue
          ? 'Site keeps redirecting during scan. Try scanning the final URL or retry.'
          : errorMsg.substring(0, 500),
      });

      logScanEvent({
        event: 'scan_request',
        ip: job.ip ?? 'worker',
        domain: job.domain,
        timestamp: new Date().toISOString(),
        result: 'failed',
        jobId: job.id,
        isAdmin: job.isAdmin || undefined,
        durationMs,
        error: errorMsg.substring(0, 500),
      });

      results.push({ jobId: job.id, status: 'failed' });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}
