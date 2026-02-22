// ─── Rate Limiting & Domain Cooldown for Report Scans ───
//
// TODO: Replace in-memory Maps with a persistent store (Redis, Firestore, or
// Vercel KV) before production deployment. In-memory state is lost on
// serverless cold starts and does not share across instances.

/** Cooldown period: 1 scan per domain per 24 hours */
const DOMAIN_COOLDOWN_MS: number = 24 * 60 * 60 * 1000;

/** General rate limit: max scans per IP per hour */
const MAX_SCANS_PER_IP_PER_HOUR: number = 10;

/** In-memory store for domain cooldowns: domain → last scan timestamp */
const domainCooldowns: Map<string, number> = new Map();

/** In-memory store for IP rate limits: IP → array of scan timestamps */
const ipScanTimestamps: Map<string, number[]> = new Map();

/**
 * Check if a domain is within its cooldown period.
 * Returns the remaining cooldown in ms, or 0 if the domain can be scanned.
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

/**
 * Check if an IP has exceeded the hourly scan rate limit.
 * Returns true if the IP is rate-limited.
 */
export function isIpRateLimited(ip: string): boolean {
  const now: number = Date.now();
  const oneHourAgo: number = now - 60 * 60 * 1000;

  const timestamps: number[] = ipScanTimestamps.get(ip) || [];
  const recentTimestamps: number[] = timestamps.filter((t) => t > oneHourAgo);

  ipScanTimestamps.set(ip, recentTimestamps);

  return recentTimestamps.length >= MAX_SCANS_PER_IP_PER_HOUR;
}

/**
 * Record a scan for an IP address.
 */
export function recordIpScan(ip: string): void {
  const timestamps: number[] = ipScanTimestamps.get(ip) || [];
  timestamps.push(Date.now());
  ipScanTimestamps.set(ip, timestamps);
}

/**
 * Combined check: returns an error message if rate-limited, or null if OK.
 */
export function checkScanRateLimit(domain: string, ip: string): string | null {
  // TODO: In production, these checks should query a persistent store

  if (isIpRateLimited(ip)) {
    return `Rate limit exceeded. Maximum ${MAX_SCANS_PER_IP_PER_HOUR} scans per hour.`;
  }

  const cooldown: number = getDomainCooldownRemaining(domain);
  if (cooldown > 0) {
    const hoursRemaining: number = Math.ceil(cooldown / (60 * 60 * 1000));
    return `This domain was recently scanned. Please try again in ~${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}.`;
  }

  return null;
}
