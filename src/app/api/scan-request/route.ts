import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limiter';
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

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limit
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

    // Generate reference ID
    const refId = generateRefId();

    // Log sanitized request (in production, this would be saved to database)
    const logData = sanitizeForLog({
      ref: refId,
      url: normalizedUrl,
      email: body.email,
      ip: clientIp,
      timestamp: new Date().toISOString(),
    });

    console.log('[SCAN_REQUEST]', JSON.stringify(logData, null, 2));

    // Return success response
    return NextResponse.json(
      {
        ok: true,
        ref: refId,
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
