import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ReportHeader, ScoreCard, Charts, IssueRow, CTASection, PublicReportToggle, VexNexaUpsellBanner, FeatureComparison } from '@/components/report';
import { SITE_URL } from '@/lib/site';
import { normalizeDomain, DomainValidationError } from '@/lib/normalize-domain';
import { getReportByDomain, isDomainOptedOut } from '@/lib/report-store';
import DomainSearchBar from '@/components/DomainSearchBar';

interface ReportPageProps {
  params: { domain: string };
}

function tryNormalize(raw: string): string | null {
  try {
    return normalizeDomain(raw);
  } catch (e) {
    if (e instanceof DomainValidationError) return null;
    throw e;
  }
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const normalized: string | null = tryNormalize(params.domain);
  if (!normalized) {
    return { title: 'Invalid Domain', robots: { index: false, follow: false } };
  }

  const data = await getReportByDomain(normalized);
  const optedOut: boolean = await isDomainOptedOut(normalized);

  if (!data || !data.is_public || optedOut) {
    return {
      title: `Accessibility Report for ${normalized}`,
      description: `WCAG 2.2 accessibility audit results for ${normalized}.`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Accessibility Report for ${normalized}`,
    description: `WCAG 2.2 accessibility audit results for ${normalized}. Score: ${data.score}/100. View issues found and how to fix them.`,
    alternates: {
      canonical: `${SITE_URL}/report/${encodeURIComponent(normalized)}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  // ─── Normalize + redirect if needed ───
  const normalized: string | null = tryNormalize(params.domain);
  if (!normalized) {
    return (
      <div className="section-padding">
        <div className="section-container max-w-2xl text-center py-20">
          <h1 className="text-2xl font-bold font-heading text-text-primary mb-4">Invalid Domain</h1>
          <p className="text-text-muted mb-8">The domain provided is not valid. Please enter a valid website URL.</p>
          <DomainSearchBar />
        </div>
      </div>
    );
  }

  const decoded: string = decodeURIComponent(params.domain);
  if (decoded !== normalized) {
    redirect(`/report/${encodeURIComponent(normalized)}`);
  }

  // ─── Load data from store ───
  const data = await getReportByDomain(normalized);
  const optedOut: boolean = await isDomainOptedOut(normalized);

  if (!data) {
    return (
      <div className="section-padding">
        <div className="section-container max-w-2xl text-center py-20">
          <h1 className="text-2xl font-bold font-heading text-text-primary mb-4">
            No Report Yet for {normalized}
          </h1>
          <p className="text-text-muted mb-8">
            We haven&apos;t scanned this domain yet. Run a free scan to generate a report.
          </p>
          <DomainSearchBar />
        </div>
      </div>
    );
  }

  const scanDate: string = new Date(data.last_scanned_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const showPublicToggle: boolean = !optedOut;

  return (
    <div className="section-padding">
      <div className="section-container space-y-12">
        {/* ─── 1. Report Header ─── */}
        <ReportHeader
          domain={data.domain}
          score={data.score}
          wcagLevel={data.wcagLevel}
          scanDate={scanDate}
          scopePages={data.scope_pages}
          isPublic={data.is_public && !optedOut}
        />

        {/* ─── Public Report Opt-In Toggle (after header for conversion) ─── */}
        {showPublicToggle && (
          <PublicReportToggle
            domain={data.domain}
            reportId={data.id}
            privateToken={data.private_token}
            initialIsPublic={data.is_public}
          />
        )}

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

        {/* ─── 5. Upsell Banner ─── */}
        <VexNexaUpsellBanner domain={data.domain} />

        {/* ─── 6. JSON-LD Structured Data (public only) ─── */}
        {data.is_public && !optedOut && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'TechArticle',
                headline: `Accessibility Audit Report for ${data.domain}`,
                description: `WCAG 2.2 compliance audit for ${data.domain}. Accessibility score: ${data.score}/100.`,
                about: {
                  '@type': 'WebSite',
                  name: data.domain,
                  url: `https://${data.domain}`,
                },
                author: {
                  '@type': 'Organization',
                  name: 'VexNexa',
                  url: 'https://vexnexa.com',
                },
                datePublished: data.created_at,
                dateModified: data.last_scanned_at,
                mainEntityOfPage: `${SITE_URL}/report/${encodeURIComponent(data.domain)}`,
                keywords: 'accessibility audit, WCAG 2.2 compliance, website accessibility issues',
              }),
            }}
          />
        )}

        {/* ─── 6. Educational SEO Content ─── */}
        <section className="card p-8 sm:p-10">
          <div className="prose prose-lg max-w-none">
            <h2>Accessibility Report for {data.domain}</h2>

            <p>
              This <strong>accessibility audit</strong> for <strong>{data.domain}</strong> was performed
              using an automated WCAG 2.2 compliance scanner. The scan evaluates the website against the
              Web Content Accessibility Guidelines (WCAG) 2.2 Level AA criteria — the internationally
              recognized standard for <strong>website accessibility</strong>.
            </p>

            <h3>What is WCAG 2.2 Compliance?</h3>
            <p>
              The <strong>Web Content Accessibility Guidelines (WCAG)</strong> are developed by the W3C
              and define how to make web content more accessible to people with disabilities. WCAG 2.2,
              the latest version, is organized around four principles:
            </p>

            <ul>
              <li>
                <strong>Perceivable</strong> — Content must be presentable in ways users can perceive,
                including text alternatives for images, video captions, and sufficient color contrast.
              </li>
              <li>
                <strong>Operable</strong> — All functionality must be available from a keyboard, with
                enough time for users to read and interact with content.
              </li>
              <li>
                <strong>Understandable</strong> — Text must be readable and web pages must behave
                predictably.
              </li>
              <li>
                <strong>Robust</strong> — Content must work reliably across browsers and assistive
                technologies like screen readers.
              </li>
            </ul>

            <h3>Why Website Accessibility Matters for {data.domain}</h3>
            <p>
              <strong>Website accessibility issues</strong> affect an estimated 1.3 billion people
              worldwide. Beyond legal compliance requirements in many jurisdictions, an accessible website
              reaches a wider audience, improves SEO performance, and demonstrates a commitment to
              inclusivity.
            </p>
            <p>
              The {data.totals.totalIssues} issues identified in this <strong>accessibility audit</strong> for{' '}
              <strong>{data.domain}</strong> represent concrete opportunities to improve the experience
              for all users. Common improvements include fixing color contrast ratios, adding alt text to
              images, ensuring proper ARIA attributes, and maintaining logical heading structure.
            </p>

            <h3>How This Automated Scan Works</h3>
            <p>
              This report was generated by scanning the homepage of {data.domain} using axe-core, the
              industry-standard accessibility testing engine. The scanner checks against WCAG 2.2 Level AA
              success criteria and produces a score from 0 to 100 based on the number and severity of
              issues found. While automated scans catch many common <strong>website accessibility issues</strong>,
              a comprehensive <strong>accessibility audit</strong> should also include manual testing with
              assistive technologies.
            </p>

            <h3>WCAG Conformance Levels</h3>
            <ul>
              <li><strong>Level A</strong> — Minimum accessibility. Addresses the most basic barriers.</li>
              <li><strong>Level AA</strong> — Recommended target for most organizations. Required by many regulations.</li>
              <li><strong>Level AAA</strong> — Highest level. Not required as a general policy.</li>
            </ul>
          </div>
        </section>

        {/* ─── 7. Feature Comparison ─── */}
        <FeatureComparison domain={data.domain} />

        {/* ─── 8. Internal Linking ─── */}
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

        {/* ─── 8. VexNexa CTA ─── */}
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
