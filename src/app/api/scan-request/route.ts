import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limiter';
import { domainLimiter } from '@/lib/domain-limiter';
import { scanUrl } from '@/lib/scanner';
import { sendScanResultEmail } from '@/lib/email';
import {
  isValidEmail,
  normalizeUrl,
  generateRefId,
  sanitizeForLog,
} from '@/lib/validation';

interface ScanRequestBody {
  url: string;
  email: string;
  consent: boolean;
  company?: string; // honeypot
}

function getClientIp(request: NextRequest): string {
  // Try to get real IP from various headers (when behind proxy/CDN)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to connection IP (might be proxy IP)
  return request.ip || 'unknown';
}

// Background scan execution - runs async after response is sent
async function executeScanInBackground(
  url: string,
  email: string,
  refId: string
): Promise<void> {
  try {
    console.log(`[BACKGROUND_SCAN] Starting scan for ${url} (ref: ${refId})`);

    // Run the actual scan
    const scanResult = await scanUrl(url);

    console.log(
      `[BACKGROUND_SCAN] Scan completed for ${url} (ref: ${refId}). Success: ${scanResult.success}, Score: ${scanResult.score}`
    );

    // Send email with results
    await sendScanResultEmail({
      to: email,
      scanResult,
      refId,
    });

    console.log(`[BACKGROUND_SCAN] Email sent successfully for ${url} (ref: ${refId})`);
  } catch (error) {
    console.error(`[BACKGROUND_SCAN] Error in background scan (ref: ${refId}):`, error);

    // Try to send a failure email
    try {
      await sendScanResultEmail({
        to: email,
        scanResult: {
          success: false,
          score: 0,
          totalViolations: 0,
          critical: 0,
          serious: 0,
          moderate: 0,
          minor: 0,
          highlights: [],
          scannedUrl: url,
          error: 'An unexpected error occurred during the scan',
        },
        refId,
      });
    } catch (emailError) {
      console.error(
        `[BACKGROUND_SCAN] Failed to send failure email (ref: ${refId}):`,
        emailError
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check IP-based rate limit (3 scans per day)
    const rateLimitResult = rateLimiter.check(clientIp);
    if (!rateLimitResult.allowed) {
      console.log(`[RATE_LIMIT] IP ${clientIp} exceeded rate limit`);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body: ScanRequestBody = await request.json();

    // Honeypot check - reject if filled
    if (body.company && body.company.trim() !== '') {
      console.log(`[HONEYPOT] Request blocked - honeypot filled by IP ${clientIp}`);
      // Return success to fool bots
      return NextResponse.json(
        { ok: true, ref: 'VX-SPAM000000' },
        { status: 200 }
      );
    }

    // Validate consent
    if (!body.consent || body.consent !== true) {
      return NextResponse.json(
        { error: 'Consent is required' },
        { status: 400 }
      );
    }

    // Validate email
    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Validate and normalize URL
    if (!body.url || body.url.trim() === '') {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check domain-based rate limit (1 scan per domain per 24h)
    const domainCheck = domainLimiter.canScan(normalizedUrl);
    if (!domainCheck.allowed) {
      const timeRemaining = domainCheck.timeUntilReset
        ? domainLimiter.formatRemainingTime(domainCheck.timeUntilReset)
        : '24 hours';

      console.log(
        `[DOMAIN_LIMIT] Domain ${normalizedUrl} scanned too recently (${timeRemaining} remaining)`
      );
      return NextResponse.json(
        {
          error: `This domain was recently scanned. Please try again in ${timeRemaining}.`,
        },
        { status: 429 }
      );
    }

    // Generate reference ID
    const refId = generateRefId();

    // Record domain scan
    domainLimiter.recordScan(normalizedUrl);

    // Log sanitized request
    const logData = sanitizeForLog({
      ref: refId,
      url: normalizedUrl,
      email: body.email,
      ip: clientIp,
      timestamp: new Date().toISOString(),
    });

    console.log('[SCAN_REQUEST]', JSON.stringify(logData, null, 2));

    // Start background scan (fire-and-forget)
    // This will continue executing after the response is sent
    executeScanInBackground(normalizedUrl, body.email, refId).catch((error) => {
      console.error(`[SCAN_REQUEST] Background scan promise rejected:`, error);
    });

    // Return immediate success response
    return NextResponse.json(
      {
        ok: true,
        ref: refId,
        message: 'Scan started. Results will be emailed to you shortly.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SCAN_REQUEST_ERROR]', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
