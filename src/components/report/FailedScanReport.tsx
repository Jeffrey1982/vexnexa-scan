'use client';

import type { ScanFailureCode } from '@/lib/scanner/run-axe-scan';

interface FailedScanReportProps {
  domain: string;
  failureCode: ScanFailureCode;
  failureMessage: string;
  attemptedUrls?: string[];
  error?: string;
}

/** Troubleshooting tips per failure code */
const TROUBLESHOOTING: Record<ScanFailureCode, string[]> = {
  blocked_or_refused: [
    'The server may be blocking automated requests or behind a WAF/bot challenge (e.g. Cloudflare).',
    'The site may be temporarily down or refusing connections.',
    'Try scanning again in a few minutes.',
    'If you own this site, whitelist our scanner IP or contact us for a verified scan.',
  ],
  dns_failed: [
    'The domain may not exist or has been recently registered and DNS has not propagated.',
    'Check that the domain is spelled correctly.',
    'The DNS records may be misconfigured — verify A/AAAA records are set.',
  ],
  timeout: [
    'The server took too long to respond.',
    'The site may be experiencing high traffic or performance issues.',
    'Try scanning again later when the server may be less busy.',
  ],
  tls_error: [
    'The site has an expired, self-signed, or otherwise invalid SSL/TLS certificate.',
    'If you recently changed hosting, the certificate may not have been provisioned yet.',
    'Check your certificate status at ssllabs.com/ssltest.',
  ],
  http_error: [
    'The server returned an HTTP error (e.g. 500 Internal Server Error).',
    'The site may be undergoing maintenance.',
    'Try scanning again later.',
  ],
  unknown: [
    'An unexpected error occurred while trying to load the site.',
    'This may be a temporary issue — try scanning again.',
    'If the problem persists, contact us for assistance.',
  ],
};

/** Human-readable label per failure code */
const FAILURE_LABELS: Record<ScanFailureCode, string> = {
  blocked_or_refused: 'Connection Refused / Blocked',
  dns_failed: 'DNS Resolution Failed',
  timeout: 'Connection Timed Out',
  tls_error: 'TLS/SSL Certificate Error',
  http_error: 'HTTP Error',
  unknown: 'Connection Failed',
};

export default function FailedScanReport({
  domain,
  failureCode,
  failureMessage,
  attemptedUrls,
  error,
}: FailedScanReportProps) {
  const tips: string[] = TROUBLESHOOTING[failureCode] ?? TROUBLESHOOTING.unknown;
  const label: string = FAILURE_LABELS[failureCode] ?? 'Scan Failed';

  return (
    <div className="space-y-8">
      {/* ─── Header ─── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
          Scan Failed for {domain}
        </h1>
        <p className="text-text-muted max-w-xl mx-auto">
          We were unable to complete the accessibility scan. Here&apos;s what happened and what you can do.
        </p>
      </div>

      {/* ─── Failure Details Card ─── */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 uppercase tracking-wide flex-shrink-0">
            {label}
          </span>
          <code className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded font-mono">
            {failureCode}
          </code>
        </div>
        <p className="text-sm text-red-800 leading-relaxed">
          {failureMessage || error || 'An unknown error occurred.'}
        </p>
      </div>

      {/* ─── Attempted URLs ─── */}
      {attemptedUrls && attemptedUrls.length > 0 && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-text-primary">URLs Attempted</h2>
          <p className="text-sm text-text-muted">
            We tried the following URL variants to reach your site:
          </p>
          <ul className="space-y-1.5">
            {[...new Set(attemptedUrls)].map((url, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <code className="text-text-muted font-mono text-xs break-all">{url}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Troubleshooting Tips ─── */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Troubleshooting
        </h2>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ─── CTA: Request Verified Scan ─── */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 text-center space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Need a verified scan?
        </h2>
        <p className="text-sm text-text-muted max-w-lg mx-auto">
          If your site requires authentication, has bot protection, or needs special handling,
          our team can run a verified manual scan for you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/"
            className="btn-primary px-6 py-2.5 rounded-lg text-sm"
          >
            Try Scanning Again
          </a>
          <a
            href="https://vexnexa.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-lg text-sm border border-primary text-primary hover:bg-primary/5 transition-colors"
          >
            Request Verified Scan
          </a>
        </div>
      </div>
    </div>
  );
}
