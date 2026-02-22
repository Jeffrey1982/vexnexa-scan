import type { Metadata } from 'next';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import DomainSearchBar from '@/components/DomainSearchBar';
import { CTASection } from '@/components/report';
import RecentReportsCarousel from '@/components/RecentReportsCarousel';

export const metadata: Metadata = {
  title: 'VexNexa Scanner — Free WCAG Accessibility Audit',
  description:
    'Scan any website for WCAG 2.2 accessibility issues. Get a detailed report with actionable fixes, contrast analysis, ARIA audits, and more — completely free.',
};

const features: { icon: React.ReactNode; title: string; description: string }[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'WCAG 2.2 Compliant',
    description: 'Audits against the latest WCAG 2.2 Level AA guidelines with detailed rule references.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Results',
    description: 'Get a comprehensive accessibility report in seconds, not hours. No signup required.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'Actionable Fixes',
    description: 'Every issue comes with code examples and step-by-step instructions to resolve it.',
  },
];

const steps: { step: string; title: string; description: string }[] = [
  { step: '01', title: 'Enter Your URL', description: 'Type in any website domain you want to audit for accessibility.' },
  { step: '02', title: 'We Scan Your Site', description: 'Our engine crawls your page and tests against 80+ WCAG 2.2 rules.' },
  { step: '03', title: 'Get Your Report', description: 'Receive a detailed breakdown of issues, scores, and how to fix each one.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 to-transparent pointer-events-none" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative section-container pt-20 pb-16 sm:pt-28 sm:pb-24 lg:pt-36 lg:pb-32">
            <div className="max-w-4xl mx-auto text-center">
              <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-sm font-medium text-primary mb-8 group/badge">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Free WCAG 2.2 Scanner
                <svg className="w-4 h-4 text-primary/60 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-3 rounded-xl bg-white border border-neutral-200 shadow-elevated text-xs text-text-muted leading-relaxed opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-200 z-20 pointer-events-none">
                  <p className="font-semibold text-text-primary mb-1">What does the free scan include?</p>
                  <p>Scans 1 page (your homepage) against 80+ WCAG 2.2 Level AA rules. Results are automated and indicative. For full-site monitoring, visit VexNexa.</p>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-text-primary leading-tight mb-6">
                Find Accessibility Issues{' '}
                <span className="gradient-text">Before Your Users Do</span>
              </h1>

              <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                Scan any website for WCAG 2.2 compliance issues. Get a detailed report with
                scores, visual charts, and actionable code fixes — completely free.
              </p>

              <DomainSearchBar size="large" showMicrocopy />

              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Results in seconds
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No signup required
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  100% free &amp; private
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── What You Get in VexNexa ─── */}
        <section className="section-padding bg-white border-b border-neutral-200">
          <div className="section-container">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-text-primary mb-3">
                Unlock More with VexNexa
              </h2>
              <p className="text-text-muted max-w-xl mx-auto">
                This free scanner checks 1 page. Create a free VexNexa account for the full platform.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto mb-8">
              {[
                { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Full-site scans' },
                { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Scheduled monitoring' },
                { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, text: 'Pro reports (PDF / HTML / Word)' },
                { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>, text: 'White-label (agencies)' },
                { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, text: 'Dashboards & trend charts' },
                { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, text: 'Team seats & client workflows' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-teal-50 text-teal flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-text-primary pt-1">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href="https://vexnexa.com/signup?utm_source=scan&utm_medium=home&utm_campaign=free_scan_upsell"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-primary hover:opacity-90 transition-opacity shadow-card hover:shadow-card-hover text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Create free account on VexNexa"
              >
                Create free account on VexNexa
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ─── Features Section ─── */}
        <section className="section-padding bg-white">
          <div className="section-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary mb-4">
                Why Use VexNexa Scanner?
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                Built for developers, designers, and teams who care about making the web accessible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="card p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold font-heading text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-muted leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section id="how-it-works" className="section-padding">
          <div className="section-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary mb-4">
                How It Works
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                Three simple steps to a fully accessible website.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((step, i) => (
                <div key={step.step} className="relative">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-px bg-neutral-200 -translate-x-1/2 z-0" />
                  )}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary text-white flex items-center justify-center text-xl font-bold font-heading mb-5">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold font-heading text-text-primary mb-3">
                      {step.title}
                    </h3>
                    <p className="text-text-muted leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Recent Reports Carousel ─── */}
        <RecentReportsCarousel />

        {/* ─── CTA Section ─── */}
        <section className="section-padding">
          <div className="section-container">
            <CTASection />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
