'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

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
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    const cleaned: string = domain.trim();
    if (!cleaned) return;

    setIsScanning(true);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleaned }),
      });

      const data = await res.json();
      // TODO: Remove debug log once redirect is confirmed working
      console.log('[DomainSearchBar] scan response:', JSON.stringify(data));

      if (!res.ok) {
        setError(data.error || `Scan failed (${res.status})`);
        return;
      }

      // Guard: ensure response has required fields
      if (!data.reportId || !data.private_token) {
        console.error('[DomainSearchBar] Missing reportId or private_token in response:', data);
        setError('Scan succeeded but the response is missing the report link. Please try again.');
        return;
      }

      // Build private report URL deterministically
      const target: string = `/r/${data.reportId}?t=${encodeURIComponent(data.private_token)}`;
      console.log('[DomainSearchBar] redirecting to:', target);
      router.push(target);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

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

      {/* Error message */}
      {error && (
        <p className="mt-3 text-sm text-red-600 text-center font-medium">{error}</p>
      )}

      {/* Scanning status */}
      {isScanning && (
        <p className="mt-3 text-sm text-text-muted text-center animate-pulse">
          Scanning homepage for accessibility issues... This may take up to 30 seconds.
        </p>
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
    </form>
  );
}
