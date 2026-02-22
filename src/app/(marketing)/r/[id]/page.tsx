import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ReportHeader, ScoreCard, Charts, IssueRow, CTASection } from '@/components/report';
import { getReportById } from '@/lib/report-store';

interface PrivateReportPageProps {
  params: { id: string };
  searchParams: { t?: string };
}

export async function generateMetadata({ params }: PrivateReportPageProps): Promise<Metadata> {
  const data = await getReportById(params.id);
  if (!data) {
    return { title: 'Report Not Found', robots: { index: false, follow: false } };
  }

  // Private routes are ALWAYS noindex, nofollow — no canonical
  return {
    title: `Private Report for ${data.domain}`,
    description: `Private WCAG 2.2 accessibility report for ${data.domain}.`,
    robots: { index: false, follow: false },
  };
}

export default async function PrivateReportPage({ params, searchParams }: PrivateReportPageProps) {
  const data = await getReportById(params.id);

  if (!data) {
    notFound();
  }

  // ─── Token validation ───
  const token: string | undefined = searchParams.t;
  if (!token || token !== data.private_token) {
    notFound();
  }

  // ─── If report is public, redirect to canonical public URL ───
  if (data.is_public) {
    redirect(`/report/${encodeURIComponent(data.domain)}`);
  }

  const scanDate: string = new Date(data.last_scanned_at).toLocaleDateString('en-US', {
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
          domain={data.domain}
          score={data.score}
          wcagLevel={data.wcagLevel}
          scanDate={scanDate}
          scopePages={data.scope_pages}
          isPublic={false}
        />

        {/* ─── 2. Score Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScoreCard
            title="Total Issues"
            value={data.totals.totalIssues}
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
            value={data.totals.contrastIssues}
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
            value={data.totals.ariaIssues}
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
            value={data.totals.altTextIssues}
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
        <Charts issueBreakdown={data.issueBreakdown} />

        {/* ─── 4. Issues List ─── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
                Issues Found
              </h2>
              <p className="text-text-muted mt-1">
                {data.issues.length} accessibility issues detected
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {data.issues.map((issue, i) => (
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
