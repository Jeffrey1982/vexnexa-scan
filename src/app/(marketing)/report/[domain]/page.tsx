import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ReportHeader, ScoreCard, Charts, IssueRow, CTASection, PublicReportToggle, VexNexaUpsellBanner, FeatureComparison } from '@/components/report';
import { SITE_URL } from '@/lib/site';
import { normalizeDomain, DomainValidationError } from '@/lib/normalize-domain';
import { getReportByDomain, isDomainOptedOut, getRandomPublicReports } from '@/lib/report-store';
import DomainSearchBar from '@/components/DomainSearchBar';

/** ISR: revalidate every 5 minutes for fast TTFB on completed reports */
export const revalidate: number = 300;

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

  const capitalDomain: string = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  const canonicalUrl: string = `${SITE_URL}/report/${encodeURIComponent(normalized)}`;
  const title: string = `${capitalDomain} Accessibility Report – WCAG 2.2 Audit | VexNexa`;
  const description: string = `Automated WCAG 2.2 accessibility scan of ${normalized}. Score: ${data.score}/100. ${data.totals.totalIssues} issues found. View contrast errors, ARIA problems, and improvement tips.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'VexNexa Accessibility Scanner',
      type: 'article',
      publishedTime: data.created_at,
      modifiedTime: data.last_scanned_at,
      images: [
        {
          url: `${SITE_URL}/badge/${encodeURIComponent(normalized)}.svg`,
          width: 200,
          height: 28,
          alt: `Accessibility score: ${data.score}/100 for ${normalized}`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      site: '@vexnexa',
    },
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
  const [data, optedOut] = await Promise.all([
    getReportByDomain(normalized),
    isDomainOptedOut(normalized),
  ]);

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

  const relatedReports = await getRandomPublicReports(normalized, 10);

  const scanDate: string = new Date(data.last_scanned_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const showPublicToggle: boolean = !optedOut;
  const signupUrl: string = `https://vexnexa.com/signup?domain=${encodeURIComponent(data.domain)}&utm_source=scan&utm_medium=report&utm_campaign=claim_report`;

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

        {/* ─── Visit Website Link ─── */}
        <div className="flex items-center gap-4">
          <a
            href={`https://${data.domain}`}
            target="_blank"
            rel="nofollow noopener"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            aria-label={`Visit ${data.domain} (opens in new tab)`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit website
          </a>
          <span className="text-neutral-300">|</span>
          <span className="text-xs text-text-muted">Last scanned: {scanDate}</span>
          <Link
            href={`/?domain=${encodeURIComponent(data.domain)}`}
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            Rescan this website
          </Link>
        </div>

        {/* ─── Executive Summary ─── */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-text-primary mb-6">Executive Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 rounded-xl bg-neutral-50">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Risk Level</p>
              <p className={`text-lg font-bold ${data.score >= 80 ? 'text-green-600' : data.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {data.score >= 80 ? 'Low' : data.score >= 50 ? 'Medium' : 'High'}
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-neutral-50">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Issues Found</p>
              <p className="text-lg font-bold text-text-primary">{data.totals.totalIssues}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-neutral-50">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Pages Scanned</p>
              <p className="text-lg font-bold text-text-primary">{data.scope_pages} (homepage)</p>
            </div>
          </div>
          {data.issues.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Top Issues</h3>
              <div className="space-y-2">
                {data.issues.slice(0, 3).map((issue, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      issue.impact === 'critical' ? 'bg-red-500' :
                      issue.impact === 'serious' ? 'bg-orange-500' :
                      issue.impact === 'moderate' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="font-medium text-text-primary">{issue.ruleName}</span>
                    <span className="text-text-muted">— {issue.wcagReference}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ─── Claim This Report ─── */}
        <div className="card p-5 sm:p-6 border-l-4 border-l-primary">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-text-primary text-sm">Own this website? Claim this report.</p>
              <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-text-muted">
                <li className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-teal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Run full-site scans
                </li>
                <li className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-teal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Track improvements
                </li>
                <li className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-teal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Export reports
                </li>
                <li className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-teal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Monitoring alerts
                </li>
              </ul>
            </div>
            <a
              href={signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-primary hover:opacity-90 transition-opacity text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Create account on VexNexa to claim this report"
            >
              Create account on VexNexa
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

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

        {/* ─── 4. Findings Table ─── */}
        {data.issues.length > 0 && (
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary mb-2">Findings</h2>
            <p className="text-text-muted mb-6">{data.issues.length} accessibility issues detected across {data.scope_pages} page</p>
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Severity</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">WCAG</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider">Issue</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider hidden md:table-cell">Suggested Fix</th>
                    <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wider hidden lg:table-cell">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {data.issues.map((issue, i) => {
                    const severityColors: Record<string, string> = {
                      critical: 'bg-red-100 text-red-700',
                      serious: 'bg-orange-100 text-orange-700',
                      moderate: 'bg-yellow-100 text-yellow-700',
                      minor: 'bg-blue-100 text-blue-700',
                    };
                    return (
                      <tr key={i} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold capitalize ${severityColors[issue.impact] ?? 'bg-neutral-100 text-neutral-700'}`}>
                            {issue.impact}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-teal-700 whitespace-nowrap">{issue.wcagReference}</td>
                        <td className="px-4 py-3 font-medium text-text-primary">{issue.ruleName}</td>
                        <td className="px-4 py-3 text-text-muted text-xs leading-relaxed hidden md:table-cell max-w-xs truncate">{issue.howToFix}</td>
                        <td className="px-4 py-3 text-text-muted text-xs font-mono hidden lg:table-cell max-w-[200px] truncate">{issue.selector ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─── 5. Detailed Issues ─── */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary">
                Detailed Findings &amp; Fix Guidance
              </h2>
              <p className="text-text-muted mt-1">
                Expand each issue for code examples and remediation steps
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
                headline: `Accessibility Report for ${data.domain}`,
                description: `Automated WCAG 2.2 accessibility scan of ${data.domain}. Accessibility score: ${data.score}/100.`,
                about: 'Website Accessibility Audit',
                datePublished: data.created_at,
                dateModified: data.last_scanned_at,
                mainEntityOfPage: `${SITE_URL}/report/${encodeURIComponent(data.domain)}`,
                publisher: {
                  '@type': 'Organization',
                  name: 'VexNexa',
                  url: 'https://vexnexa.com',
                },
                author: {
                  '@type': 'Organization',
                  name: 'VexNexa',
                  url: 'https://vexnexa.com',
                },
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

        {/* ─── 7. Common Accessibility Issues SEO Block ─── */}
        <section className="card p-8 sm:p-10">
          <div className="prose prose-lg max-w-none">
            <h2>Common Accessibility Issues Found on Websites</h2>

            <p>
              Automated accessibility scans like this report for <strong>{data.domain}</strong> typically
              uncover several recurring categories of issues. Understanding these common problems helps
              developers and site owners prioritize fixes effectively.
            </p>

            <h3>Color Contrast Issues</h3>
            <p>
              Insufficient color contrast between text and background is one of the most frequent WCAG
              violations. WCAG 2.2 Success Criterion 1.4.3 requires a minimum contrast ratio of 4.5:1
              for normal text and 3:1 for large text. On <strong>{data.domain}</strong>, contrast issues
              can make content unreadable for users with low vision or color blindness.
            </p>

            <h3>Missing Alt Text</h3>
            <p>
              Images without descriptive <code>alt</code> attributes are invisible to screen reader users.
              WCAG 2.2 Success Criterion 1.1.1 requires that all non-decorative images have meaningful
              text alternatives. This is one of the simplest yet most impactful fixes a website like{' '}
              <strong>{data.domain}</strong> can make.
            </p>

            <h3>ARIA Misuse</h3>
            <p>
              Accessible Rich Internet Applications (ARIA) attributes help convey dynamic content to
              assistive technologies. However, incorrect or redundant ARIA usage — such as missing
              required child roles, invalid <code>aria-*</code> values, or conflicting native semantics —
              can actually make a page <em>less</em> accessible than having no ARIA at all.
            </p>

            <h3>Semantic Structure Problems</h3>
            <p>
              Proper heading hierarchy (<code>h1</code> through <code>h6</code>), landmark regions
              (<code>nav</code>, <code>main</code>, <code>aside</code>), and list structures help users
              navigate content efficiently with assistive technologies. Skipped heading levels, missing
              landmarks, or div-based layouts without semantic meaning reduce usability for keyboard and
              screen reader users visiting <strong>{data.domain}</strong>.
            </p>
          </div>
        </section>

        {/* ─── 8. Feature Comparison ─── */}
        <FeatureComparison domain={data.domain} />

        {/* ─── 9. Badge Embed Code ─── */}
        <section className="card p-6 sm:p-8">
          <h3 className="text-lg font-semibold font-heading text-text-primary mb-3">Embed Accessibility Badge</h3>
          <p className="text-sm text-text-muted mb-4">
            Show your accessibility score on your website. Copy the code below:
          </p>
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SITE_URL}/badge/${encodeURIComponent(data.domain)}.svg`}
              alt={`Accessibility score: ${data.score} – VexNexa`}
              width={200}
              height={28}
            />
          </div>
          <div className="relative">
            <pre className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-text-muted overflow-x-auto">
              <code>{`<a href="${SITE_URL}/report/${encodeURIComponent(data.domain)}" target="_blank" rel="noopener">
  <img src="${SITE_URL}/badge/${encodeURIComponent(data.domain)}.svg" alt="Accessibility score for ${data.domain}" />
</a>`}</code>
            </pre>
          </div>
        </section>

        {/* ─── 10. More Accessibility Reports (internal linking) ─── */}
        {relatedReports.length > 0 && (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-text-primary mb-6">More Accessibility Reports</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {relatedReports.map((r) => (
                <Link
                  key={r.domain}
                  href={`/report/${encodeURIComponent(r.domain)}`}
                  className="card p-4 text-center hover:border-primary-200 transition-all group"
                >
                  <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">{r.domain}</p>
                  <p className="text-xs text-text-muted mt-1">Score: {r.score}/100</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── 11. Navigation ─── */}
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

        {/* ─── 12. VexNexa CTA ─── */}
        <CTASection
          title="Test Your Own Website with VexNexa"
          description="Get instant WCAG 2.2 scans, automated accessibility reports, and continuous monitoring. Identify and fix website accessibility issues before they become compliance problems."
          buttonText="Try VexNexa Free"
          buttonHref="https://vexnexa.com"
        />

        {/* ─── Audit Footer ─── */}
        <footer className="border-t border-neutral-200 pt-8 mt-4 space-y-4 text-center">
          <p className="text-sm text-text-muted">
            Powered by{' '}
            <a
              href="https://vexnexa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              VexNexa
            </a>
            {' '}— Automated Accessibility Monitoring
          </p>
          <p className="text-xs text-neutral-400 max-w-xl mx-auto leading-relaxed">
            This report is generated by an automated scanner and is provided for informational purposes only.
            It does not constitute legal advice or a guarantee of WCAG conformance. For a comprehensive
            accessibility audit, consult a qualified accessibility specialist.
          </p>
          <p className="text-xs text-neutral-400">
            Questions?{' '}
            <a
              href="mailto:support@vexnexa.com"
              className="underline underline-offset-2 hover:text-neutral-600 transition-colors"
            >
              support@vexnexa.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
