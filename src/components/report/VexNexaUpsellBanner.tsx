'use client';

interface VexNexaUpsellBannerProps {
  domain: string;
}

const bullets: { icon: React.ReactNode; text: string }[] = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Full-site scanning (crawl multiple pages)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    text: 'Scheduled monitoring & change detection',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    text: 'Export reports (PDF / HTML / Word) with branding',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    text: 'Team-friendly dashboards & issue tracking',
  },
];

function buildSignupUrl(domain: string, content: string): string {
  return `https://vexnexa.com/signup?utm_source=scan&utm_medium=report&utm_campaign=free_scan_upsell&utm_content=${encodeURIComponent(content)}`;
}

function trackEvent(name: string): void {
  if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).gtag === 'function') {
    (window as unknown as Record<string, (...args: unknown[]) => void>).gtag('event', name, {
      event_category: 'upsell',
    });
  }
}

export default function VexNexaUpsellBanner({ domain }: VexNexaUpsellBannerProps) {
  const signupUrl: string = buildSignupUrl(domain, domain);

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-teal-50"
      aria-label="Upgrade to VexNexa platform"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10">
          {/* Left: copy */}
          <div className="flex-1 mb-6 lg:mb-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary text-xs font-semibold mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Next Step
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-heading text-text-primary mb-3">
              Want the full report and ongoing monitoring?
            </h3>
            <p className="text-text-muted leading-relaxed mb-5">
              This free scan checks 1 page (homepage). In VexNexa you can scan full sites,
              track accessibility over time, and export professional reports.
            </p>

            <ul className="space-y-3" role="list">
              {bullets.map((b) => (
                <li key={b.text} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-50 text-teal flex items-center justify-center">
                    {b.icon}
                  </span>
                  <span className="text-sm text-text-primary font-medium pt-1">{b.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: CTAs */}
          <div className="flex flex-col items-start lg:items-center lg:justify-center gap-4 lg:min-w-[220px]">
            <a
              href={signupUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('upsell_cta_click')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-primary hover:opacity-90 transition-opacity shadow-card hover:shadow-card-hover text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Create free VexNexa account"
            >
              Create free account
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="#vexnexa-features"
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              aria-label="See all VexNexa features"
            >
              See all features &darr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
