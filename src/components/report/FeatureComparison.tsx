'use client';

interface FeatureComparisonProps {
  domain: string;
}

interface FeatureGroup {
  title: string;
  features: string[];
}

const freeFeatures: string[] = [
  '1 page scan (homepage only)',
  'Instant score and issue highlights',
  'Basic fix guidance + code examples',
  'Optional public report link',
];

const platformGroups: FeatureGroup[] = [
  {
    title: 'Scanning & Coverage',
    features: [
      'Full-site scan (multi-page crawling)',
      'Multiple scan profiles (desktop / mobile)',
      'Scheduled scans (daily / weekly / monthly)',
      'Historical comparisons (before / after)',
    ],
  },
  {
    title: 'Monitoring & Alerts',
    features: [
      'Continuous monitoring',
      'Alerting when regressions happen',
      'Trend charts for score and issue counts',
    ],
  },
  {
    title: 'Reporting & Exports',
    features: [
      'Branded PDF export',
      'HTML shareable report links',
      'Word export for audits and compliance',
      'White-label options (agency use)',
    ],
  },
  {
    title: 'Workflow & Teams',
    features: [
      'Project dashboard (multiple domains)',
      'Issue filtering, severity, WCAG mapping',
      'Share with teammates / seats',
      'Client-ready reports and exports',
    ],
  },
  {
    title: 'Compliance & Assurance',
    features: [
      'Evidence-ready compliance reporting',
      'Audit trail / timestamped results',
      'Organization details for invoices',
    ],
  },
];

function CheckIcon(): React.ReactElement {
  return (
    <svg className="w-4 h-4 text-teal flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function trackEvent(name: string): void {
  if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).gtag === 'function') {
    (window as unknown as Record<string, (...args: unknown[]) => void>).gtag('event', name, {
      event_category: 'upsell',
    });
  }
}

export default function FeatureComparison({ domain }: FeatureComparisonProps) {
  const signupUrl: string = `https://vexnexa.com/signup?utm_source=scan&utm_medium=report&utm_campaign=free_scan_upsell&utm_content=${encodeURIComponent(domain)}`;

  return (
    <section id="vexnexa-features" className="scroll-mt-8" aria-labelledby="features-heading">
      <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold font-heading text-text-primary mb-8 text-center">
        Free Scan vs VexNexa Platform
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Free Scan column */}
        <div className="card p-6 sm:p-8 border-2 border-neutral-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold font-heading text-text-primary">Free Scan</h3>
              <p className="text-xs text-text-muted">scan.vexnexa.com</p>
            </div>
          </div>

          <ul className="space-y-3" role="list">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <CheckIcon />
                <span className="text-sm text-text-primary">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-5 border-t border-neutral-200">
            <p className="text-xs text-text-muted text-center">You are here</p>
          </div>
        </div>

        {/* VexNexa Platform column */}
        <div className="card p-6 sm:p-8 border-2 border-primary-200 bg-gradient-to-b from-primary-50/50 to-white relative">
          <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl rounded-tr-xl bg-primary text-white text-xs font-semibold">
            Recommended
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold font-heading text-text-primary">VexNexa Platform</h3>
              <p className="text-xs text-text-muted">vexnexa.com</p>
            </div>
          </div>

          <div className="space-y-5">
            {platformGroups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{group.title}</p>
                <ul className="space-y-2" role="list">
                  {group.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span className="text-sm text-text-primary">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-primary-200 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('upsell_cta_click')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-primary hover:opacity-90 transition-opacity text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Create free VexNexa account"
            >
              Create Free Account
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://vexnexa.com/pricing?utm_source=scan&utm_medium=report&utm_campaign=free_scan_upsell"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
