import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import DomainSearchBar from '@/components/DomainSearchBar';
import { CTASection } from '@/components/report';

export const metadata: Metadata = {
  title: 'VexNexa Scanner — Free WCAG Accessibility Audit',
  description:
    'Scan any website for WCAG 2.2 accessibility issues. Get a detailed report with actionable fixes, contrast analysis, ARIA audits, and more — completely free.',
};

const exampleReports: { domain: string; score: number; issues: number; label: string }[] = [
  { domain: 'github.com', score: 82, issues: 14, label: 'Good' },
  { domain: 'stripe.com', score: 91, issues: 6, label: 'Excellent' },
  { domain: 'bbc.co.uk', score: 74, issues: 23, label: 'Good' },
  { domain: 'shopify.com', score: 67, issues: 31, label: 'Needs Work' },
];

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

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 50) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-green-50';
  if (score >= 70) return 'bg-yellow-50';
  if (score >= 50) return 'bg-orange-50';
  return 'bg-red-50';
}

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

        {/* ─── Example Reports ─── */}
        <section id="examples" className="section-padding bg-white">
          <div className="section-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary mb-4">
                Example Reports
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                See what a VexNexa accessibility report looks like for popular websites.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {exampleReports.map((report) => (
                <Link
                  key={report.domain}
                  href={`/report/${report.domain}`}
                  className="card p-6 group hover:border-primary-200 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${getScoreBg(report.score)} flex items-center justify-center`}>
                      <span className={`text-lg font-bold font-heading ${getScoreColor(report.score)}`}>
                        {report.score}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                        {report.domain}
                      </p>
                      <p className="text-xs text-text-muted">{report.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">{report.issues} issues found</span>
                    <svg className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

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
