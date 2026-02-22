'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

interface RecentReport {
  domain: string;
  score: number;
  total_issues: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-teal';
  if (score >= 60) return 'text-orange-500';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-green-50';
  if (score >= 75) return 'bg-teal-50';
  if (score >= 60) return 'bg-orange-50';
  return 'bg-red-50';
}

function getScoreRing(score: number): string {
  if (score >= 90) return 'ring-green-200';
  if (score >= 75) return 'ring-teal-200';
  if (score >= 60) return 'ring-orange-200';
  return 'ring-red-200';
}

function getLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Needs Work';
  return 'Poor';
}

export default function RecentReportsCarousel() {
  const [reports, setReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanCount, setScanCount] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchReports = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/recent-reports');
      if (res.ok) {
        const data: RecentReport[] = await res.json();
        setReports(data);
      }
    } catch {
      // silently fail, keep existing data
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScanCount = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/scan-count');
      if (res.ok) {
        const data: { count: number } = await res.json();
        setScanCount(data.count);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchScanCount();
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      fetchReports();
      fetchScanCount();
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchReports, fetchScanCount]);

  const scroll = (direction: 'left' | 'right'): void => {
    if (!scrollRef.current) return;
    const cardWidth: number = scrollRef.current.firstElementChild
      ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 16
      : 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth * 2 : cardWidth * 2,
      behavior: 'smooth',
    });
  };

  // ─── Loading skeleton ───
  if (loading) {
    return (
      <section id="examples" className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary mb-4">
              Latest Accessibility Reports
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Real scan results from websites audited with VexNexa Scanner.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-100 rounded w-3/4" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-neutral-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ─── Empty fallback ───
  if (reports.length === 0) {
    return (
      <section id="examples" className="section-padding bg-white">
        <div className="section-container">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-heading text-text-primary mb-3">Be the first to scan a website</h2>
            <p className="text-text-muted mb-6">No public reports yet. Run a free accessibility scan and your report could appear here.</p>
            <button
              type="button"
              onClick={() => {
                const hero = document.getElementById('hero-scanner');
                if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-primary hover:opacity-90 transition-opacity text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
              </svg>
              Scan a website now
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="examples" className="section-padding bg-white">
      <div className="section-container">
        {/* ─── Header ─── */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary mb-2">
              Latest Accessibility Reports
            </h2>
            <p className="text-lg text-text-muted max-w-2xl">
              Real scan results from websites audited with VexNexa Scanner.
              {scanCount !== null && scanCount > 0 && (
                <span className="inline-flex items-center gap-1.5 ml-2 text-sm font-medium text-teal">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                  {scanCount.toLocaleString()} scan{scanCount !== 1 ? 's' : ''} in the last 24h
                </span>
              )}
            </p>
          </div>
          {/* Desktop nav arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-9 h-9 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-text-muted hover:text-primary hover:border-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Scroll carousel left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-9 h-9 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-text-muted hover:text-primary hover:border-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Scroll carousel right"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ─── Carousel ─── */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mb-4 scrollbar-hide"
          role="list"
          aria-label="Recent accessibility reports"
        >
          {reports.map((report) => (
            <Link
              key={report.domain}
              href={`/report/${encodeURIComponent(report.domain)}`}
              role="listitem"
              className="flex-none w-[calc(100%-1rem)] sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] snap-start card p-6 group hover:border-primary-200 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl ${getScoreBg(report.score)} ring-1 ${getScoreRing(report.score)} flex items-center justify-center`}>
                  <span className={`text-lg font-bold font-heading ${getScoreColor(report.score)}`}>
                    {report.score}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                    {report.domain}
                  </p>
                  <p className={`text-xs font-medium ${getScoreColor(report.score)}`}>
                    {getLabel(report.score)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{report.total_issues} issues found</span>
                <svg
                  className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* ─── Recently Scanned Websites (text links) ─── */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <h3 className="text-lg font-semibold font-heading text-text-primary mb-4">
            Recently Scanned Websites
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {reports.map((report) => (
              <Link
                key={report.domain}
                href={`/report/${encodeURIComponent(report.domain)}`}
                className="text-sm text-primary hover:text-primary-hover underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                {report.domain}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
