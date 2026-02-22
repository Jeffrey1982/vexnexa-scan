import { NextRequest } from 'next/server';

/**
 * Extract the client IP from a Next.js request.
 * Checks x-forwarded-for first (Vercel/proxy), then falls back to
 * x-real-ip, then '127.0.0.1'.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded: string | null = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be comma-separated; take the first (client) IP
    return forwarded.split(',')[0].trim();
  }

  const realIp: string | null = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return '127.0.0.1';
}
