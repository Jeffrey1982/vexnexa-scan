import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ReportHeader, ScoreCard, Charts, IssueRow, CTASection, PublicReportToggle } from '@/components/report';
import { getReportById, isDomainOptedOut } from '@/lib/report-store';

interface PrivateReportPageProps {
  params: { id: string };
  searchParams: { t?: string };
}

export async function generateMetadata({ params }: PrivateReportPageProps): Promise<Metadata> {
  const data = await getReportById(params.id);
  if (!data) {
    return { title: 'Report Not Found', robots: { index: false, follow: false } };
  }

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

  const optedOut: boolean = await isDomainOptedOut(data.domain);

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

        <ReportHeader
          domain={data.domain}
          score={data.score}
          wcagLevel={data.wcagLevel}
          scanDate={scanDate}
          scopePages={data.scope_pages}
          isPublic={false}
        />

        {/* Public Report Toggle */}
        {!optedOut && (
          <PublicReportToggle
            domain={data.domain}
            reportId={data.id}
            privateToken={data.private_token}
            initialIsPublic={data.is_public}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScoreCard title="Total Issues" value={data.totals.totalIssues} color="orange" subtitle="Across all categories"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
          />
          <ScoreCard title="Contrast Issues" value={data.totals.contrastIssues} color="red" subtitle="WCAG 1.4.3 violations"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          />
          <ScoreCard title="ARIA Issues" value={data.totals.ariaIssues} color="yellow" subtitle="Missing or invalid ARIA"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
          />
          <ScoreCard title="Missing Alt Text" value={data.totals.altTextIssues} color="teal" subtitle="Images without alt attributes"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
        </div>

        <Charts issueBreakdown={data.issueBreakdown} />

        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">Issues Found</h2>
              <p className="text-text-muted mt-1">{data.issues.length} accessibility issues detected</p>
            </div>
          </div>
          <div className="space-y-4">
            {data.issues.map((issue, i) => (
              <IssueRow key={i} ruleName={issue.ruleName} impact={issue.impact} wcagReference={issue.wcagReference} howToFix={issue.howToFix} codeExample={issue.codeExample} />
            ))}
          </div>
        </section>

        {/* Internal Linking */}
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
            </svg>
            Back to Scanner
          </Link>
          <span className="text-neutral-300">|</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Scan Another Website
          </Link>
        </nav>

        {/* VexNexa CTA */}
        <CTASection
          title="Test Your Own Website with VexNexa"
          description="Get instant WCAG 2.2 scans, automated accessibility reports, and continuous monitoring. Identify and fix website accessibility issues before they become compliance problems."
          buttonText="Try VexNexa Free"
          buttonHref="https://vexnexa.com"
        />
      </div>
    </div>
  );
}
