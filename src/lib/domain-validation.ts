// ─── Domain Validation & Bot Protection ───
// Rejects scans for empty, invalid, localhost, internal IP, metadata endpoints,
// blocked TLDs, and abusive inputs. This is the first line of defense — the
// dns-guard module provides a second layer via actual DNS resolution.

/** Maximum allowed length for a domain input string */
const MAX_INPUT_LENGTH: number = 253;

/** Private/internal IPv4 ranges (prefix-based check) */
const PRIVATE_IPV4_PREFIXES: string[] = [
  '0.',                                                         // 0.0.0.0/8
  '10.',                                                        // 10.0.0.0/8
  '100.64.', '100.65.', '100.66.', '100.67.',                  // 100.64.0.0/10 (carrier NAT)
  '100.68.', '100.69.', '100.70.', '100.71.',
  '100.72.', '100.73.', '100.74.', '100.75.',
  '100.76.', '100.77.', '100.78.', '100.79.',
  '100.80.', '100.81.', '100.82.', '100.83.',
  '100.84.', '100.85.', '100.86.', '100.87.',
  '100.88.', '100.89.', '100.90.', '100.91.',
  '100.92.', '100.93.', '100.94.', '100.95.',
  '100.96.', '100.97.', '100.98.', '100.99.',
  '100.100.', '100.101.', '100.102.', '100.103.',
  '100.104.', '100.105.', '100.106.', '100.107.',
  '100.108.', '100.109.', '100.110.', '100.111.',
  '100.112.', '100.113.', '100.114.', '100.115.',
  '100.116.', '100.117.', '100.118.', '100.119.',
  '100.120.', '100.121.', '100.122.', '100.123.',
  '100.124.', '100.125.', '100.126.', '100.127.',
  '127.',                                                       // 127.0.0.0/8 (loopback)
  '169.254.',                                                   // 169.254.0.0/16 (link-local)
  '172.16.', '172.17.', '172.18.', '172.19.',                  // 172.16.0.0/12
  '172.20.', '172.21.', '172.22.', '172.23.',
  '172.24.', '172.25.', '172.26.', '172.27.',
  '172.28.', '172.29.', '172.30.', '172.31.',
  '192.168.',                                                   // 192.168.0.0/16
  '224.', '225.', '226.', '227.',                               // 224.0.0.0/4 (multicast)
  '228.', '229.', '230.', '231.',
  '232.', '233.', '234.', '235.',
  '236.', '237.', '238.', '239.',
  '240.', '241.', '242.', '243.',                               // 240.0.0.0/4 (reserved)
  '244.', '245.', '246.', '247.',
  '248.', '249.', '250.', '251.',
  '252.', '253.', '254.', '255.',
];

/** Blocked hostnames */
const BLOCKED_HOSTNAMES: Set<string> = new Set([
  'localhost',
  'localhost.localdomain',
  'broadcasthost',
  'ip6-localhost',
  'ip6-loopback',
  'ip6-localnet',
  'ip6-mcastprefix',
  'ip6-allnodes',
  'ip6-allrouters',
  // Cloud metadata endpoints
  'metadata.google.internal',
  'metadata.google.com',
  'metadata',
  'instance-data',
]);

/** Blocked TLD suffixes (non-routable / reserved) */
const BLOCKED_TLD_SUFFIXES: string[] = [
  '.local',
  '.internal',
  '.test',
  '.example',
  '.invalid',
  '.localhost',
  '.onion',
];

/** IPv6 loopback / link-local patterns */
const IPV6_BLOCKED_PATTERNS: RegExp[] = [
  /^::1$/,
  /^\[::1\]$/,
  /^fe80:/i,
  /^fc00:/i,
  /^fd[0-9a-f]{2}:/i,
  /^ff[0-9a-f]{2}:/i,  // multicast
];

export interface DomainValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a raw domain string for bot protection.
 * Call this BEFORE normalizeDomain() to catch abuse early.
 */
export function validateDomainInput(raw: string): DomainValidationResult {
  // 1. Empty / missing
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'Domain is required.' };
  }

  const trimmed: string = raw.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Domain cannot be empty.' };
  }

  // 2. Extremely long strings (abuse / buffer overflow attempts)
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `Domain input too long (max ${MAX_INPUT_LENGTH} characters).` };
  }

  // 3. Strip protocol for hostname checks
  let hostname: string = trimmed.toLowerCase();
  hostname = hostname.replace(/^https?:\/\//, '');
  // Strip port
  hostname = hostname.replace(/:\d+$/, '');
  // Strip path
  const slashIdx: number = hostname.indexOf('/');
  if (slashIdx !== -1) {
    hostname = hostname.substring(0, slashIdx);
  }
  // Strip trailing dots
  hostname = hostname.replace(/\.+$/, '');

  // 4. Blocked hostnames (localhost, metadata endpoints, etc.)
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { valid: false, error: 'Scanning localhost or local hostnames is not allowed.' };
  }

  // 5. Blocked TLD suffixes (.local, .internal, .test, .example, etc.)
  for (const suffix of BLOCKED_TLD_SUFFIXES) {
    if (hostname.endsWith(suffix) || hostname === suffix.substring(1)) {
      return { valid: false, error: `Scanning domains with "${suffix}" TLD is not allowed.` };
    }
  }

  // 6. Cloud metadata IP (169.254.169.254)
  if (hostname === '169.254.169.254') {
    return { valid: false, error: 'Scanning cloud metadata endpoints is not allowed.' };
  }

  // 7. IPv4 private/internal ranges
  if (isPrivateIPv4(hostname)) {
    return { valid: false, error: 'Scanning internal/private IP addresses is not allowed.' };
  }

  // 8. IPv6 loopback / link-local / multicast
  for (const pattern of IPV6_BLOCKED_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, error: 'Scanning internal IPv6 addresses is not allowed.' };
    }
  }

  // 9. Must contain at least one dot (basic TLD check) — unless it's a bare IP
  if (!hostname.includes('.') && !isIPv4(hostname)) {
    return { valid: false, error: 'Invalid domain: must contain a dot (e.g. example.com).' };
  }

  // 10. No spaces or control characters
  if (/[\s\x00-\x1f]/.test(hostname)) {
    return { valid: false, error: 'Domain contains invalid characters.' };
  }

  // 11. Reject broadcast / null IPs
  if (hostname === '0.0.0.0' || hostname === '255.255.255.255') {
    return { valid: false, error: 'Scanning broadcast or null IP addresses is not allowed.' };
  }

  return { valid: true };
}

/** Check if a string is a valid IPv4 address */
function isIPv4(s: string): boolean {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(s);
}

/** Check if an IPv4 address is in a private/internal range */
function isPrivateIPv4(s: string): boolean {
  if (!isIPv4(s)) return false;
  return PRIVATE_IPV4_PREFIXES.some((prefix) => s.startsWith(prefix));
}
