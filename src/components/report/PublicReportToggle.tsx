'use client';

import { useState } from 'react';

interface PublicReportToggleProps {
  domain: string;
  reportId: string;
  privateToken: string;
  initialIsPublic: boolean;
  onToggle?: (isPublic: boolean) => void;
}

export default function PublicReportToggle({
  domain,
  reportId,
  privateToken,
  initialIsPublic,
  onToggle,
}: PublicReportToggleProps) {
  const [isPublic, setIsPublic] = useState<boolean>(initialIsPublic);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = (): void => {
    setError(null);
    if (!isPublic) {
      setShowConfirm(true);
    } else {
      updateVisibility(false);
    }
  };

  const confirmPublic = (): void => {
    setShowConfirm(false);
    updateVisibility(true);
  };

  const updateVisibility = async (newValue: boolean): Promise<void> => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/report/${reportId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-report-token': privateToken,
        },
        body: JSON.stringify({ is_public: newValue }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        setError(data.error || `Error ${res.status}`);
        return;
      }

      setIsPublic(newValue);
      onToggle?.(newValue);
    } catch (err) {
      console.error('Failed to update report visibility:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const siteUrl: string = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scan.vexnexa.com';
  const publicUrl: string = `${siteUrl}/report/${encodeURIComponent(domain)}`;

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold font-heading text-text-primary mb-1">
            Public Report
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Make this report public to share results and allow search engines to index it.
          </p>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          disabled={isUpdating}
          onClick={handleToggle}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
            isPublic ? 'bg-primary' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isPublic ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-text-muted leading-relaxed flex items-start gap-1.5">
        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Public reports show only derived accessibility metrics. No page content is stored.
      </p>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 space-y-3">
          <p className="text-sm text-text-primary font-medium">
            Make this report publicly accessible?
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            A public report for <span className="font-semibold">{domain}</span> will be visible at{' '}
            <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-neutral-200">
              /report/{domain}
            </code>{' '}
            and indexed by search engines. Only derived metrics are shown — no page content is stored.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={confirmPublic}
              disabled={isUpdating}
              className="btn-primary text-sm px-4 py-2 rounded-lg"
            >
              {isUpdating ? 'Updating...' : 'Confirm & Publish'}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}

      {/* Public URL display */}
      {isPublic && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-teal-50 border border-teal-200">
          <svg className="w-4 h-4 text-teal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <code className="text-xs text-teal font-medium truncate flex-1">{publicUrl}</code>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(publicUrl)}
            className="text-xs font-medium text-teal hover:text-teal-700 transition-colors flex-shrink-0"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
