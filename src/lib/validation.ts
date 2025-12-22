export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(url: string): string {
  // Add https:// if no protocol is present
  let normalized = url.trim();

  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  // Validate and normalize
  try {
    const urlObj = new URL(normalized);
    // Force https
    urlObj.protocol = 'https:';
    return urlObj.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

export function generateRefId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let refId = 'VX-';
  for (let i = 0; i < 10; i++) {
    refId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return refId;
}

export function sanitizeForLog(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };

  // Mask email (show first 2 chars and domain)
  if (typeof sanitized.email === 'string') {
    const email = sanitized.email;
    const [localPart, domain] = email.split('@');
    if (localPart && domain) {
      const masked = localPart.substring(0, 2) + '***';
      sanitized.email = `${masked}@${domain}`;
    }
  }

  return sanitized;
}
