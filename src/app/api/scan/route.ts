import { NextRequest, NextResponse } from 'next/server';
import { normalizeDomain, DomainValidationError } from '@/lib/normalize-domain';
import { getClientIp } from '@/lib/client-ip';
import { checkScanRateLimit, recordDomainScan, recordIpScan } from '@/lib/rate-limit-report';
import { getReportByDomain, upsertReport, isDomainOptedOut } from '@/lib/report-store';
import { SITE_URL } from '@/lib/site';
import { runAxeScan, ScanError } from '@/lib/scanner/run-axe-scan';
import type { ScanReport, IssueBreakdown } from '@/lib/report-types';

// ─── Vercel runtime controls ───
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ScanRequestBody {
  url: string;
  makePublic?: boolean;
}

/**
 * POST /api/scan
 * Run a real Playwright + axe-core accessibility scan on a single page.
 *
 * Body: { url: string, makePublic?: boolean }
 * Returns: { reportId, domain, is_public, private_token, publicUrl, privateUrl, timings }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ScanRequestBody = await request.json();

    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { error: 'url is required and must be a string' },
        { status: 400 },
      );
    }

    // ─── Normalize domain ───
    let domain: string;
    try {
      domain = normalizeDomain(body.url);
    } catch (e) {
      if (e instanceof DomainValidationError) {
        return NextResponse.json(
          { error: e.message },
          { status: 400 },
        );
      }
      throw e;
    }

    // ─── Rate limiting ───
    const ip: string = getClientIp(request);
    const rateLimitMsg: string | null = checkScanRateLimit(domain, ip);
    if (rateLimitMsg) {
      return NextResponse.json(
        { error: rateLimitMsg },
        { status: 429 },
      );
    }

    // ─── Opted-out check ───
    const optedOut: boolean = await isDomainOptedOut(domain);
    const makePublic: boolean = body.makePublic === true && !optedOut;

    // ─── Build scan URL ───
    const hasProtocol: boolean = /^https?:\/\//i.test(body.url.trim());
    const scanUrl: string = hasProtocol
      ? body.url.trim()
      : `https://${domain}/`;

    // ─── Run real scan ───
    let scanResults: Awaited<ReturnType<typeof runAxeScan>>;
    try {
      scanResults = await runAxeScan({ url: scanUrl, domain });
    } catch (e) {
      if (e instanceof ScanError) {
        // Record counters even on failure to prevent abuse
        recordIpScan(ip);
        recordDomainScan(domain);

        return NextResponse.json(
          { error: e.message },
          { status: e.statusCode },
        );
      }
      throw e;
    }

    // ─── Map issueBreakdown to typed IssueBreakdown ───
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

    // ─── Create or update report ───
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

    // ─── Record rate limit counters ───
    recordIpScan(ip);
    recordDomainScan(domain);

    return NextResponse.json({
      reportId: saved.id,
      domain: saved.domain,
      is_public: saved.is_public,
      private_token: saved.private_token,
      publicUrl: `${SITE_URL}/report/${encodeURIComponent(saved.domain)}`,
      privateUrl: `${SITE_URL}/r/${saved.id}?t=${saved.private_token}`,
      timings: scanResults.timings,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
