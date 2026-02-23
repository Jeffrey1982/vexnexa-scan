'use client';

import { useState, useRef, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import PostScanModal, { shouldShowPostScanModal } from './PostScanModal';
import { FailedScanReport } from '@/components/report';
import type { ScanFailureCode } from '@/lib/scanner/run-axe-scan';

/** Minimum ms between scan submissions (debounce) */
const DEBOUNCE_MS: number = 2000;

/** Polling interval for scan job status (ms) */
const POLL_INTERVAL_MS: number = 2000;

/** Maximum polling duration before giving up (ms) */
const POLL_TIMEOUT_MS: number = 90_000;

/** Hard cap on number of poll requests */
const MAX_POLLS: number = 45;

/** Terminal job states — stop polling immediately */
const TERMINAL_STATES: Set<string> = new Set(['completed', 'failed', 'rejected', 'rate_limited']);

interface DomainSearchBarProps {
  placeholder?: string;
  buttonText?: string;
  size?: 'default' | 'large';
  showMicrocopy?: boolean;
}

export default function DomainSearchBar({
  placeholder = 'Enter a website URL (e.g. example.com)',
  buttonText = 'Scan Now',
  size = 'default',
  showMicrocopy = false,
}: DomainSearchBarProps) {
  const [domain, setDomain] = useState<string>('');
  const [makePublic, setMakePublic] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<string | null>(null);
  const [scannedDomain, setScannedDomain] = useState<string>('');
  const [failureDetails, setFailureDetails] = useState<{
    code: ScanFailureCode;
    message: string;
    attemptedUrls?: string[];
    domain: string;
  } | null>(null);
  const router = useRouter();

  // Debounce: track last submit timestamp
  const lastSubmitRef = useRef<number>(0);
  // Prevent duplicate in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setFailureDetails(null);

    const cleaned: string = domain.trim();
    if (!cleaned) return;

    // Debounce: reject if submitted too recently
    const now: number = Date.now();
    if (now - lastSubmitRef.current < DEBOUNCE_MS) {
      return;
    }
    lastSubmitRef.current = now;

    // Prevent duplicate: abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsScanning(true);

    try {
      // ─── Step 1: Create scan job ───
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleaned, makePublic }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || `Scan failed (${res.status})`);
        return;
      }

      if (!data.jobId) {
        setError('Unexpected response from server. Please try again.');
        return;
      }

      // ─── Step 2: Poll for results ───
      const pollStart: number = Date.now();
      let pollCount: number = 0;

      while (Date.now() - pollStart < POLL_TIMEOUT_MS && pollCount < MAX_POLLS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        pollCount++;

        // Check if aborted while waiting
        if (controller.signal.aborted) return;

        const pollRes = await fetch(`/api/scan/${data.jobId}`, {
          signal: controller.signal,
        });
        const job = await pollRes.json();

        // Stop immediately on any terminal state
        if (TERMINAL_STATES.has(job.status)) {
          if (job.status === 'completed') {
            if (!job.reportId || !job.private_token) {
              setError('Scan completed but the response is missing the report link. Please try again.');
              return;
            }

            const target: string = `/r/${job.reportId}?t=${encodeURIComponent(job.private_token)}`;

            if (shouldShowPostScanModal()) {
              setScannedDomain(job.domain ?? cleaned);
              setModalTarget(target);
            } else {
              router.push(target);
            }
            return;
          }

          // failed / rejected / rate_limited — show structured failure if available
          if (job.failure_code) {
            setFailureDetails({
              code: job.failure_code as ScanFailureCode,
              message: job.failure_message || job.error || 'Navigation failed',
              attemptedUrls: job.attempted_urls as string[] | undefined,
              domain: job.domain ?? cleaned,
            });
          } else {
            setError(job.error || `Scan ${job.status.replace('_', ' ')}. Please try again.`);
          }
          return;
        }

        // Still queued/running — continue polling
      }

      // Timeout or max polls reached
      setError('Scan is taking longer than expected. Please try again later.');
    } catch (err: unknown) {
      // Don't show error if we intentionally aborted
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError('Network error. Please try again.');
    } finally {
      setIsScanning(false);
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, makePublic, router]);

  const isLarge: boolean = size === 'large';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className={`flex items-center bg-white border-2 border-neutral-300 rounded-2xl shadow-card focus-within:border-primary focus-within:shadow-card-hover transition-all duration-200 ${isLarge ? 'p-2' : 'p-1.5'}`}>
        {/* Search icon */}
        <div className={`flex-shrink-0 text-text-muted ${isLarge ? 'pl-4' : 'pl-3'}`}>
          <svg className={`${isLarge ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder={placeholder}
          disabled={isScanning}
          className={`flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-neutral-400 disabled:opacity-50 ${isLarge ? 'px-4 py-3 text-lg' : 'px-3 py-2 text-base'}`}
          aria-label="Website URL to scan"
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={isScanning}
          className={`flex-shrink-0 btn-primary disabled:opacity-70 ${isLarge ? 'px-8 py-3 text-base rounded-xl' : 'px-6 py-2.5 text-sm rounded-lg'}`}
        >
          {isScanning ? (
            <>
              <svg className={`animate-spin mr-2 ${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning...
            </>
          ) : (
            <>
              {buttonText}
              <svg className={`ml-2 ${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Structured failure report */}
      {failureDetails && (
        <div className="mt-6">
          <FailedScanReport
            domain={failureDetails.domain}
            failureCode={failureDetails.code}
            failureMessage={failureDetails.message}
            attemptedUrls={failureDetails.attemptedUrls}
          />
        </div>
      )}

      {/* Simple error message (non-navigation failures) */}
      {error && !failureDetails && (
        <p className="mt-3 text-sm text-red-600 text-center font-medium">{error}</p>
      )}

      {/* Scanning status */}
      {isScanning && (
        <p className="mt-3 text-sm text-text-muted text-center animate-pulse">
          Scanning homepage for accessibility issues... This may take up to 30 seconds.
        </p>
      )}

      {/* Publish public report checkbox */}
      {!isScanning && (
        <label className="mt-3 flex items-center justify-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={makePublic}
            onChange={(e) => setMakePublic(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary accent-[#0F5C5C]"
          />
          <span className="text-sm text-text-muted">Publish public report</span>
        </label>
      )}

      {showMicrocopy && !isScanning && !error && (
        <p className="mt-3 text-xs text-text-muted text-center leading-relaxed">
          Free scan checks 1 page (homepage). Full site monitoring and scheduled scans are available in{' '}
          <a
            href="https://vexnexa.com"
            className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            VexNexa
          </a>
          .
        </p>
      )}
      {/* Post-scan upsell modal */}
      {modalTarget && (
        <PostScanModal
          domain={scannedDomain}
          onClose={() => {
            setModalTarget(null);
            router.push(modalTarget);
          }}
        />
      )}
    </form>
  );
}
