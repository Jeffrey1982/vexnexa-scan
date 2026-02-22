'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PostScanModalProps {
  domain: string;
  onClose: () => void;
}

const SESSION_KEY = 'vexnexa_postscan_modal_shown';

function trackEvent(name: string): void {
  if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).gtag === 'function') {
    (window as unknown as Record<string, (...args: unknown[]) => void>).gtag('event', name, {
      event_category: 'upsell',
    });
  }
}

export function shouldShowPostScanModal(): boolean {
  if (typeof window === 'undefined') return false;
  return !sessionStorage.getItem(SESSION_KEY);
}

export function markPostScanModalShown(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, '1');
  }
}

export default function PostScanModal({ domain, onClose }: PostScanModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const lastFocusRef = useRef<HTMLButtonElement>(null);

  const signupUrl: string = `https://vexnexa.com/signup?utm_source=scan&utm_medium=modal&utm_campaign=free_scan_upsell&utm_content=${encodeURIComponent(domain)}`;

  // Track view
  useEffect(() => {
    trackEvent('postscan_modal_view');
    markPostScanModalShown();
  }, []);

  // Focus trap + Esc
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const first = firstFocusRef.current;
        const last = lastFocusRef.current;
        if (!first || !last) return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    firstFocusRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="postscan-title"
      aria-describedby="postscan-desc"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-elevated p-6 sm:p-8">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-5">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h2 id="postscan-title" className="text-xl sm:text-2xl font-bold font-heading text-text-primary mb-3">
          Your free homepage scan is ready.
        </h2>

        <p id="postscan-desc" className="text-text-muted leading-relaxed mb-6">
          Want a full-site report and ongoing monitoring? Create a free VexNexa account to scan
          multiple pages, schedule scans, and export professional reports.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            ref={firstFocusRef}
            href={signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('postscan_modal_click')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-gradient-primary hover:opacity-90 transition-opacity text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Create free VexNexa account"
          >
            Create free VexNexa account
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            ref={lastFocusRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-medium text-text-muted hover:text-text-primary hover:bg-neutral-50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Continue to report
          </button>
        </div>
      </div>
    </div>
  );
}
