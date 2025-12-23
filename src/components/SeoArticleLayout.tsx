import { ReactNode } from 'react';

interface SeoArticleLayoutProps {
  title: string;
  children: ReactNode;
}

export default function SeoArticleLayout({ title, children }: SeoArticleLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Article Card */}
        <article className="bg-white border border-neutral-500 rounded-lg shadow-sm">
          {/* Header */}
          <header className="px-6 sm:px-8 lg:px-12 pt-8 sm:pt-10 lg:pt-12 pb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-900 mb-3 leading-tight">
              {title}
            </h1>
            <p className="text-sm text-neutral-700">
              Updated: {currentYear}
            </p>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none px-6 sm:px-8 lg:px-12 pb-8">
            {children}
          </div>

          {/* Mid-Content CTA */}
          <aside className="mx-6 sm:mx-8 lg:mx-12 mb-8 p-6 bg-accent-50 border-l-4 border-accent-600 rounded-r-lg">
            <h2 className="text-xl font-semibold text-primary-900 mb-2">
              Ready to Test Your Website?
            </h2>
            <p className="text-primary-900 mb-4">
              Get a comprehensive WCAG 2.1 AA accessibility report delivered to your inbox in minutes.
              No account required, completely free.
            </p>
            <a
              href="https://scan.vexnexa.com"
              className="inline-block bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-accent-700 transition-colors duration-200 no-underline"
            >
              Run Free Accessibility Scan →
            </a>
          </aside>

          {/* Bottom Padding */}
          <div className="pb-8"></div>
        </article>

        {/* Bottom CTA Card */}
        <div className="mt-8 bg-gradient-to-br from-secondary-600 to-secondary-800 border border-secondary-700 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Start Your Accessibility Journey Today
          </h2>
          <p className="text-secondary-50 text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of websites ensuring their content is accessible to all users.
            Get your free WCAG scan now—no signup, no credit card, just results.
          </p>
          <a
            href="https://scan.vexnexa.com"
            className="inline-block bg-white text-secondary-700 font-bold px-8 py-4 rounded-lg hover:bg-neutral-50 transition-colors duration-200 text-lg shadow-md no-underline"
          >
            Get Your Free Scan
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-neutral-700">
          <p>
            Powered by{' '}
            <a href="https://scan.vexnexa.com" className="text-secondary-600 hover:text-secondary-700 font-medium">
              VexNexA
            </a>
            {' '}— Professional WCAG Accessibility Testing
          </p>
        </div>
      </div>
    </div>
  );
}
