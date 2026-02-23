// ─── Rate Limiting & Domain Cooldown for Report Scans ───
//
// In-memory rate limiting. State is lost on serverless cold starts and does
// not share across instances — acceptable for Vercel's single-region default.
// For multi-region, migrate to Vercel KV or Upstash Redis.

import { NextRequest } from 'next/server';

// ─── Configuration ───

/** Max scans per IP within the sliding window */
const MAX_SCANS_PER_IP: number = 5;

/** Sliding window for IP rate limit (10 minutes) */
const IP_WINDOW_MS: number = 10 * 60 * 1000;

/** Cooldown period: 1 scan per domain per 6 hours */
const DOMAIN_COOLDOWN_MS: number = 6 * 60 * 60 * 1000;

/** Domain cooldown in hours (for API response) */
const DOMAIN_COOLDOWN_HOURS: number = 6;

/** Header name for admin bypass */
const ADMIN_HEADER: string = 'x-vexnexa-admin';

/** Expected admin secret (env-driven; falls back to 'true' for dev) */
function getAdminSecret(): string {
  return process.env.VEXNEXA_ADMIN_SECRET ?? 'true';
}

// ─── In-memory stores ───

/** domain → last scan timestamp */
const domainCooldowns: Map<string, number> = new Map();

/** IP → array of scan timestamps */
const ipScanTimestamps: Map<string, number[]> = new Map();

// ─── Periodic cleanup to prevent memory leaks ───

const CLEANUP_INTERVAL_MS: number = 5 * 60 * 1000;
let lastCleanup: number = Date.now();

function maybeCleanup(): void {
  const now: number = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [domain, ts] of domainCooldowns) {
    if (now - ts >= DOMAIN_COOLDOWN_MS) {
      domainCooldowns.delete(domain);
    }
  }

  for (const [ip, timestamps] of ipScanTimestamps) {
    const recent: number[] = timestamps.filter((t) => now - t < IP_WINDOW_MS);
    if (recent.length === 0) {
      ipScanTimestamps.delete(ip);
    } else {
      ipScanTimestamps.set(ip, recent);
    }
  }
}

// ─── Admin check ───

/**
 * Returns true if the request carries a valid admin bypass header.
 */
export function isAdminRequest(request: NextRequest): boolean {
  const headerValue: string | null = request.headers.get(ADMIN_HEADER);
  if (!headerValue) return false;
  return headerValue === getAdminSecret();
}

// ─── Domain cooldown ───

/**
 * Returns remaining cooldown in ms, or 0 if the domain can be scanned.
 */
export function getDomainCooldownRemaining(domain: string): number {
  const lastScan: number | undefined = domainCooldowns.get(domain);
  if (!lastScan) return 0;

  const elapsed: number = Date.now() - lastScan;
  if (elapsed >= DOMAIN_COOLDOWN_MS) {
    domainCooldowns.delete(domain);
    return 0;
  }

  return DOMAIN_COOLDOWN_MS - elapsed;
}

/**
 * Record a scan for a domain (sets cooldown).
 */
export function recordDomainScan(domain: string): void {
  domainCooldowns.set(domain, Date.now());
}

// ─── IP rate limit ───

/**
 * Returns true if the IP has exceeded the scan limit within the window.
 */
export function isIpRateLimited(ip: string): boolean {
  const now: number = Date.now();
  const windowStart: number = now - IP_WINDOW_MS;

  const timestamps: number[] = ipScanTimestamps.get(ip) || [];
  const recentTimestamps: number[] = timestamps.filter((t) => t > windowStart);

  ipScanTimestamps.set(ip, recentTimestamps);

  return recentTimestamps.length >= MAX_SCANS_PER_IP;
}

/**
 * Record a scan for an IP address.
 */
export function recordIpScan(ip: string): void {
  const timestamps: number[] = ipScanTimestamps.get(ip) || [];
  timestamps.push(Date.now());
  ipScanTimestamps.set(ip, timestamps);
}

// ─── Structured rate limit result ───

export interface RateLimitResult {
  message: string;
  retryAfterSec: number;
  ipLimit: number;
  domainCooldownHours: number;
}

// ─── Combined check ───

/**
 * Combined rate limit check. Returns a structured result if rate-limited, or null if OK.
 * Admin requests bypass all limits.
 */
export function checkScanRateLimit(domain: string, ip: string, request?: NextRequest): RateLimitResult | null {
  maybeCleanup();

  // Admin bypass
  if (request && isAdminRequest(request)) {
    return null;
  }

  // IP rate limit
  if (isIpRateLimited(ip)) {
    // Estimate retry: time until the oldest timestamp in the window expires
    const timestamps: number[] = ipScanTimestamps.get(ip) || [];
    const oldest: number = timestamps.length > 0 ? timestamps[0] : Date.now();
    const retryMs: number = Math.max(0, (oldest + IP_WINDOW_MS) - Date.now());

    return {
      message: `Rate limit exceeded. Maximum ${MAX_SCANS_PER_IP} scans per ${IP_WINDOW_MS / 60_000} minutes. Please wait and try again.`,
      retryAfterSec: Math.ceil(retryMs / 1000),
      ipLimit: MAX_SCANS_PER_IP,
      domainCooldownHours: DOMAIN_COOLDOWN_HOURS,
    };
  }

  // Domain cooldown
  const cooldown: number = getDomainCooldownRemaining(domain);
  if (cooldown > 0) {
    const hoursRemaining: number = Math.ceil(cooldown / (60 * 60 * 1000));
    const minutesRemaining: number = Math.ceil(cooldown / (60 * 1000));
    const display: string = hoursRemaining >= 1
      ? `~${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`
      : `~${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;

    return {
      message: `This domain was recently scanned. Please try again in ${display}.`,
      retryAfterSec: Math.ceil(cooldown / 1000),
      ipLimit: MAX_SCANS_PER_IP,
      domainCooldownHours: DOMAIN_COOLDOWN_HOURS,
    };
  }

  return null;
}
