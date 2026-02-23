import { NextRequest, NextResponse } from 'next/server';
import { normalizeDomain, DomainValidationError } from '@/lib/normalize-domain';
import { validateDomainInput } from '@/lib/domain-validation';
import { getClientIp } from '@/lib/client-ip';
import { checkScanRateLimit, isAdminRequest } from '@/lib/rate-limit-report';
import { isDomainOptedOut } from '@/lib/report-store';
import { createScanJob, findActiveJobForDomain } from '@/lib/scan-job-store-supabase';
import { logScanEvent } from '@/lib/scan-logger';
import { resolveDomainSafe } from '@/lib/dns-guard';

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
 * Creates a scan job in Supabase and returns immediately.
 * The worker endpoint (/api/scan/worker) processes queued jobs via Vercel Cron.
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
    // makePublic is stored in result_json metadata (not a scan_jobs column)
    // so the worker can apply it to scan_reports.is_public on completion.
    const job = await createScanJob({
      domain,
      scanUrl,
      ip,
      isAdmin: admin,
    });

    // Seed result_json with the makePublic intent for the worker
    if (makePublic) {
      const { updateScanJob } = await import('@/lib/scan-job-store-supabase');
      await updateScanJob(job.id, {
        result_json: { _makePublic: true },
      });
    }

    logScanEvent({
      event: 'scan_request', ip, domain, timestamp: new Date().toISOString(),
      result: 'queued', jobId: job.id, isAdmin: admin || undefined,
    });

    return NextResponse.json({
      jobId: job.id,
      domain: job.domain,
      status: job.status,
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
