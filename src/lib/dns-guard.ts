// ─── DNS-Based SSRF Guard ───
// Resolves a domain's A/AAAA records and blocks if any IP is private/internal.
// Called server-side before creating a scan job.

import { resolve4, resolve6 } from 'dns/promises';

// ─── Private/internal IPv4 ranges ───

const PRIVATE_IPV4_RANGES: Array<{ prefix: string; bits: number; mask: number }> = [
  { prefix: '0.0.0.0',       bits: 8,  mask: 0xff000000 },   // 0.0.0.0/8
  { prefix: '10.0.0.0',      bits: 8,  mask: 0xff000000 },   // 10.0.0.0/8
  { prefix: '100.64.0.0',    bits: 10, mask: 0xffc00000 },   // 100.64.0.0/10 (carrier NAT)
  { prefix: '127.0.0.0',     bits: 8,  mask: 0xff000000 },   // 127.0.0.0/8 (loopback)
  { prefix: '169.254.0.0',   bits: 16, mask: 0xffff0000 },   // 169.254.0.0/16 (link-local)
  { prefix: '172.16.0.0',    bits: 12, mask: 0xfff00000 },   // 172.16.0.0/12
  { prefix: '192.0.0.0',     bits: 24, mask: 0xffffff00 },   // 192.0.0.0/24
  { prefix: '192.0.2.0',     bits: 24, mask: 0xffffff00 },   // 192.0.2.0/24 (documentation)
  { prefix: '192.168.0.0',   bits: 16, mask: 0xffff0000 },   // 192.168.0.0/16
  { prefix: '198.18.0.0',    bits: 15, mask: 0xfffe0000 },   // 198.18.0.0/15 (benchmarking)
  { prefix: '198.51.100.0',  bits: 24, mask: 0xffffff00 },   // 198.51.100.0/24 (documentation)
  { prefix: '203.0.113.0',   bits: 24, mask: 0xffffff00 },   // 203.0.113.0/24 (documentation)
  { prefix: '224.0.0.0',     bits: 4,  mask: 0xf0000000 },   // 224.0.0.0/4 (multicast)
  { prefix: '240.0.0.0',     bits: 4,  mask: 0xf0000000 },   // 240.0.0.0/4 (reserved)
];

function ipv4ToInt(ip: string): number {
  const parts: number[] = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const ipInt: number = ipv4ToInt(ip);
  for (const range of PRIVATE_IPV4_RANGES) {
    const prefixInt: number = ipv4ToInt(range.prefix);
    if ((ipInt & (range.mask >>> 0)) === (prefixInt & (range.mask >>> 0))) {
      return true;
    }
  }
  return false;
}

// ─── Private/internal IPv6 patterns ───

function isPrivateIPv6(ip: string): boolean {
  const lower: string = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fe80:')) return true;   // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique local
  if (lower.startsWith('ff')) return true;       // multicast
  // IPv4-mapped IPv6 (::ffff:x.x.x.x)
  const v4Mapped: RegExpMatchArray | null = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (v4Mapped && isPrivateIPv4(v4Mapped[1])) return true;
  return false;
}

// ─── Simple TTL cache ───

interface CacheEntry {
  safe: boolean;
  reason: string;
  expiresAt: number;
}

const DNS_CACHE_TTL_MS: number = 60_000; // 1 minute
const dnsCache: Map<string, CacheEntry> = new Map();

// ─── Public API ───

export interface DnsCheckResult {
  safe: boolean;
  reason: string;
}

/**
 * Resolve a domain's DNS records and check if any resolve to private/internal IPs.
 * Returns { safe: true } if all IPs are public, or { safe: false, reason } if blocked.
 *
 * @param domain - The domain to resolve (no protocol, no path)
 * @param isAdmin - If true and ALLOW_PRIVATE_TARGETS env is set, skip the check
 */
export async function resolveDomainSafe(domain: string, isAdmin: boolean = false): Promise<DnsCheckResult> {
  // Admin override (opt-in via env)
  if (isAdmin && process.env.ALLOW_PRIVATE_TARGETS === 'true') {
    return { safe: true, reason: '' };
  }

  // Check cache
  const cached: CacheEntry | undefined = dnsCache.get(domain);
  if (cached && cached.expiresAt > Date.now()) {
    return { safe: cached.safe, reason: cached.reason };
  }

  try {
    // Resolve A and AAAA in parallel
    const [ipv4Results, ipv6Results] = await Promise.allSettled([
      resolve4(domain),
      resolve6(domain),
    ]);

    const allIps: string[] = [];

    if (ipv4Results.status === 'fulfilled') {
      allIps.push(...ipv4Results.value);
    }
    if (ipv6Results.status === 'fulfilled') {
      allIps.push(...ipv6Results.value);
    }

    // If no IPs resolved at all, the domain doesn't exist
    if (allIps.length === 0) {
      const result: DnsCheckResult = {
        safe: false,
        reason: `Domain "${domain}" does not resolve to any IP address.`,
      };
      dnsCache.set(domain, { ...result, expiresAt: Date.now() + DNS_CACHE_TTL_MS });
      return result;
    }

    // Check each resolved IP
    for (const ip of allIps) {
      if (ip.includes(':')) {
        if (isPrivateIPv6(ip)) {
          const result: DnsCheckResult = {
            safe: false,
            reason: `Domain "${domain}" resolves to a private/internal IPv6 address. Scanning is not allowed.`,
          };
          dnsCache.set(domain, { ...result, expiresAt: Date.now() + DNS_CACHE_TTL_MS });
          return result;
        }
      } else {
        if (isPrivateIPv4(ip)) {
          const result: DnsCheckResult = {
            safe: false,
            reason: `Domain "${domain}" resolves to a private/internal IP address. Scanning is not allowed.`,
          };
          dnsCache.set(domain, { ...result, expiresAt: Date.now() + DNS_CACHE_TTL_MS });
          return result;
        }
      }
    }

    // All IPs are public
    const result: DnsCheckResult = { safe: true, reason: '' };
    dnsCache.set(domain, { ...result, expiresAt: Date.now() + DNS_CACHE_TTL_MS });
    return result;
  } catch (err) {
    // DNS resolution failed — could be NXDOMAIN, SERVFAIL, etc.
    const msg: string = err instanceof Error ? err.message : String(err);

    // ENOTFOUND = domain doesn't exist
    if (msg.includes('ENOTFOUND') || msg.includes('ENODATA')) {
      const result: DnsCheckResult = {
        safe: false,
        reason: `Domain "${domain}" could not be resolved (DNS lookup failed).`,
      };
      dnsCache.set(domain, { ...result, expiresAt: Date.now() + DNS_CACHE_TTL_MS });
      return result;
    }

    // For transient DNS errors, allow the scan (fail-open for availability)
    console.warn('[dns-guard] DNS resolution error for', domain, ':', msg);
    return { safe: true, reason: '' };
  }
}
