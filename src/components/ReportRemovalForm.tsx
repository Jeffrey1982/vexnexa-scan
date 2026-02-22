'use client';

import { useState, FormEvent } from 'react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ReportRemovalForm() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successDomain, setSuccessDomain] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const domain: string = (formData.get('domain') as string) ?? '';
    const email: string = (formData.get('email') as string) ?? '';
    const reason: string = (formData.get('reason') as string) ?? '';

    try {
      const res = await fetch('/api/report-removal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, email, reason }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        setErrorMsg(data.error || `Error ${res.status}`);
        setStatus('error');
        return;
      }

      setSuccessDomain(domain);
      setStatus('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="card p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold font-heading text-text-primary">Request Received</h2>
        <p className="text-text-muted leading-relaxed">
          Your removal request for <span className="font-semibold">{successDomain}</span> has been
          processed. The report has been set to private and will no longer be indexed.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-8 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Domain field */}
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-text-primary mb-2">
            Domain
          </label>
          <input
            type="text"
            id="domain"
            name="domain"
            placeholder="example.com"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-text-primary placeholder:text-neutral-400"
            required
          />
          <p className="mt-1.5 text-xs text-text-muted">
            The domain exactly as it appears in the report URL.
          </p>
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
            Contact Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="admin@example.com"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-text-primary placeholder:text-neutral-400"
            required
          />
          <p className="mt-1.5 text-xs text-text-muted">
            We&apos;ll use this to verify ownership and confirm removal.
          </p>
        </div>

        {/* Reason field */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-text-primary mb-2">
            Reason for Removal <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            placeholder="Please describe why you'd like this report removed..."
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-text-primary placeholder:text-neutral-400 resize-y"
          />
        </div>

        {/* Error message */}
        {status === 'error' && errorMsg && (
          <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn-primary w-full disabled:opacity-50"
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Removal Request'}
        </button>
      </form>

      {/* Info notice */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-teal-50 border border-teal-200">
        <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-sm text-teal-800 leading-relaxed">
          <p className="font-semibold mb-1">What happens next?</p>
          <ul className="space-y-1 list-disc list-inside text-xs">
            <li>We verify you own or control the domain.</li>
            <li>The public report is set to private within 48 hours.</li>
            <li>The report URL will return a 404 for search engines.</li>
            <li>No page content is ever stored — only derived accessibility metrics.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
