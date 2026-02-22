'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportHeader, ScoreCard, Charts, IssueRow, CTASection } from '@/components/report';
import type { ScanReport } from '@/lib/report-types';

interface PrivateReportViewProps {
  reportId: string;
}

export default function PrivateReportView({ reportId }: PrivateReportViewProps) {
  const searchParams = useSearchParams();
  const token: string | null = searchParams.get('t');

  const [report, setReport] = useState<ScanReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing access token.');
      setLoading(false);
      return;
    }

    const fetchReport = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/report/${reportId}?t=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || `Failed to load report (${res.status})`);
          return;
        }

        setReport(data.report as ScanReport);
      } catch {
        setError('Network error loading report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, token]);

  if (loading) {
    return (
      <div className="section-padding">
        <div className="section-container flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <svg className="animate-spin w-10 h-10 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-text-muted text-lg">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="section-padding">
        <div className="section-container flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4 max-w-md">
            <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-bold text-text-primary">Report Not Available</h2>
            <p className="text-text-muted">{error || 'This report could not be found or the access link is invalid.'}</p>
            <a href="/" className="inline-block btn-primary px-6 py-2.5 rounded-lg text-sm mt-4">
              Scan a Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  const scanDate: string = new Date(report.last_scanned_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="section-padding">
      <div className="section-container space-y-12">
        {/* Private report notice */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-300">
          <svg className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm text-text-muted leading-relaxed">
            <span className="font-semibold text-text-primary">Private report</span> — This link is only accessible to people who have it. It is not indexed by search engines.
          </p>
        </div>

        {/* ─── 1. Report Header ─── */}
        <ReportHeader
          domain={report.domain}
          score={report.score}
          wcagLevel={report.wcagLevel}
          scanDate={scanDate}
          scopePages={report.scope_pages}
          isPublic={false}
        />

        {/* ─── 2. Score Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScoreCard
            title="Total Issues"
            value={report.totals.totalIssues}
            color="orange"
            subtitle="Across all categories"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          />
          <ScoreCard
            title="Contrast Issues"
            value={report.totals.contrastIssues}
            color="red"
            subtitle="WCAG 1.4.3 violations"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
          <ScoreCard
            title="ARIA Issues"
            value={report.totals.ariaIssues}
            color="yellow"
            subtitle="Missing or invalid ARIA"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            }
          />
          <ScoreCard
            title="Missing Alt Text"
            value={report.totals.altTextIssues}
            color="teal"
            subtitle="Images without alt attributes"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        {/* ─── 3. Visual Charts ─── */}
        <Charts issueBreakdown={report.issueBreakdown} />

        {/* ─── 4. Issues List ─── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
                Issues Found
              </h2>
              <p className="text-text-muted mt-1">
                {report.issues.length} accessibility issues detected
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {report.issues.map((issue, i) => (
              <IssueRow
                key={i}
                ruleName={issue.ruleName}
                impact={issue.impact}
                wcagReference={issue.wcagReference}
                howToFix={issue.howToFix}
                codeExample={issue.codeExample}
              />
            ))}
          </div>
        </section>

        {/* ─── 5. Call to Action ─── */}
        <CTASection
          title="Scan Your Own Website"
          description="Run a free WCAG 2.2 accessibility audit on your website. Get detailed scores, issue breakdowns, and code-level fixes in seconds."
          buttonText="Start Free Scan"
          buttonHref="/"
        />
      </div>
    </div>
  );
}
