import { NextRequest, NextResponse } from 'next/server';
import { normalizeDomain, DomainValidationError } from '@/lib/normalize-domain';
import { validateDomainInput } from '@/lib/domain-validation';
import { getClientIp } from '@/lib/client-ip';
import { checkScanRateLimit, isAdminRequest, recordDomainScan, recordIpScan } from '@/lib/rate-limit-report';
import { isDomainOptedOut, getReportByDomain, upsertReport } from '@/lib/report-store';
import { createScanJob, findActiveJobForDomain, updateScanJob } from '@/lib/scan-job-store-supabase';
import { logScanEvent } from '@/lib/scan-logger';
import { resolveDomainSafe } from '@/lib/dns-guard';
import { runAxeScan } from '@/lib/scanner/run-axe-scan';
import { SITE_URL } from '@/lib/site';
import type { ScanReport, IssueBreakdown } from '@/lib/report-types';

// ─── Vercel runtime controls ───
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ScanRequestBody {
  url: string;
  makePublic?: boolean;
}

// ─── POST /api/scan ───

/**
 * POST /api/scan
 * Creates a scan job in Supabase, executes the scan inline, and returns
 * the jobId. The frontend polls GET /api/scan/[id] for the final status.
 *
 * Body: { url: string, makePublic?: boolean }
 * Returns: { jobId, domain, status }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip: string = getClientIp(request);
  const admin: boolean = isAdminRequest(request);

  try {
    const body: ScanRequestBody = await request.json();

    // ─── Input validation ───
    if (!body.url || typeof body.url !== 'string') {
      logScanEvent({
        event: 'scan_request', ip, domain: '', timestamp: new Date().toISOString(),
        result: 'rejected', error: 'Missing url field',
      });
      return NextResponse.json(
        { error: 'url is required and must be a string' },
        { status: 400 },
      );
    }

    // Bot protection (empty, localhost, internal IP, long strings, blocked TLDs)
    const validation = validateDomainInput(body.url);
    if (!validation.valid) {
      logScanEvent({
        event: 'scan_request', ip, domain: body.url.substring(0, 100),
        timestamp: new Date().toISOString(), result: 'rejected',
        error: validation.error,
      });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 },
      );
    }

    // ─── Normalize domain ───
    let domain: string;
    try {
      domain = normalizeDomain(body.url);
    } catch (e) {
      if (e instanceof DomainValidationError) {
        logScanEvent({
          event: 'scan_request', ip, domain: body.url.substring(0, 100),
          timestamp: new Date().toISOString(), result: 'rejected',
          error: e.message,
        });
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      throw e;
    }

    // ─── SSRF: DNS resolution check (block if resolves to private IP) ───
    const dnsCheck = await resolveDomainSafe(domain, admin);
    if (!dnsCheck.safe) {
      logScanEvent({
        event: 'scan_request', ip, domain,
        timestamp: new Date().toISOString(), result: 'rejected',
        error: dnsCheck.reason,
      });
      return NextResponse.json(
        { error: dnsCheck.reason },
        { status: 400 },
      );
    }

    // ─── Rate limiting (admin bypass built in) ───
    const rateResult = checkScanRateLimit(domain, ip, request);
    if (rateResult) {
      logScanEvent({
        event: 'scan_request', ip, domain, timestamp: new Date().toISOString(),
        result: 'rate_limited', error: rateResult.message,
      });
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: rateResult.message,
          retryAfterSec: rateResult.retryAfterSec,
          ipLimit: rateResult.ipLimit,
          domainCooldownHours: rateResult.domainCooldownHours,
        },
        { status: 429 },
      );
    }

    // ─── Opted-out check ───
    const optedOut: boolean = await isDomainOptedOut(domain);
    const makePublic: boolean = body.makePublic === true && !optedOut;

    // ─── Deduplicate: if a scan for this domain is already queued/running ───
    const existingJob = await findActiveJobForDomain(domain);
    if (existingJob) {
      return NextResponse.json({
        jobId: existingJob.id,
        domain: existingJob.domain,
        status: existingJob.status,
        message: 'A scan for this domain is already in progress.',
      });
    }

    // ─── Build scan URL ───
    const hasProtocol: boolean = /^https?:\/\//i.test(body.url.trim());
    const scanUrl: string = hasProtocol
      ? body.url.trim()
      : `https://${domain}/`;

    // ─── Create job in Supabase ───
    const job = await createScanJob({
      domain,
      scanUrl,
      ip,
      isAdmin: admin,
    });

    logScanEvent({
      event: 'scan_request', ip, domain, timestamp: new Date().toISOString(),
      result: 'queued', jobId: job.id, isAdmin: admin || undefined,
    });

    // ─── Execute scan inline ───
    // Runs the scan synchronously so the job reaches a terminal state
    // before the frontend's first poll. maxDuration=60s gives enough time.
    const startMs: number = Date.now();

    await updateScanJob(job.id, {
      status: 'running',
      started_at: new Date().toISOString(),
    });

    try {
      const scanResults = await runAxeScan({ url: scanUrl, domain });

      const issueBreakdown: IssueBreakdown = {
        contrast: scanResults.issueBreakdown['contrast'] ?? 0,
        aria: scanResults.issueBreakdown['aria'] ?? 0,
        altText: scanResults.issueBreakdown['altText'] ?? 0,
        structure: scanResults.issueBreakdown['structure'] ?? 0,
        forms: scanResults.issueBreakdown['forms'] ?? 0,
        navigation: scanResults.issueBreakdown['navigation'] ?? 0,
      };

      const reportIssues = scanResults.issues.map((issue) => ({
        ruleName: issue.ruleName,
        impact: issue.impact,
        wcagReference: issue.wcagReference,
        howToFix: issue.howToFix,
        selector: issue.selectors?.[0],
        codeExample: issue.codeExample,
      }));

      // ─── Create or update report in scan_reports ───
      const existing: ScanReport | null = await getReportByDomain(domain);
      const now: string = new Date().toISOString();

      const report: ScanReport = existing
        ? {
            ...existing,
            score: scanResults.score,
            totals: scanResults.totals,
            issueBreakdown,
            issues: reportIssues,
            last_scanned_at: now,
            is_public: makePublic ? true : existing.is_public,
          }
        : {
            id: crypto.randomUUID(),
            domain,
            score: scanResults.score,
            wcagLevel: scanResults.wcagLevel,
            is_public: makePublic,
            private_token: crypto.randomUUID(),
            scope_pages: 1,
            last_scanned_at: now,
            created_at: now,
            totals: scanResults.totals,
            issueBreakdown,
            issues: reportIssues,
          };

      const saved: ScanReport = await upsertReport(report);

      // Record rate limit counters
      if (!admin) {
        recordIpScan(ip);
        recordDomainScan(domain);
      }

      const durationMs: number = Date.now() - startMs;

      // ─── Mark job completed ───
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
        event: 'scan_request', ip, domain, timestamp: new Date().toISOString(),
        result: 'completed', jobId: job.id, isAdmin: admin || undefined, durationMs,
      });
    } catch (scanErr) {
      const errorMsg: string = scanErr instanceof Error ? scanErr.message : String(scanErr);
      const durationMs: number = Date.now() - startMs;

      // Record rate limit counters even on failure
      if (!admin) {
        recordIpScan(ip);
        recordDomainScan(domain);
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
        event: 'scan_request', ip, domain, timestamp: new Date().toISOString(),
        result: 'failed', jobId: job.id, durationMs, error: errorMsg.substring(0, 500),
      });
    }

    // Always return the jobId — frontend polls for final status
    return NextResponse.json({
      jobId: job.id,
      domain: job.domain,
      status: 'queued',
    });
  } catch (err) {
    const message: string = err instanceof Error ? err.message : String(err);
    console.error('[/api/scan] Unhandled error:', message);

    logScanEvent({
      event: 'scan_request', ip, domain: '', timestamp: new Date().toISOString(),
      result: 'failed', error: message.substring(0, 500),
    });

    return NextResponse.json(
      { error: 'Scan failed', message: message.substring(0, 500) },
      { status: 500 },
    );
  }
}
