import Link from 'next/link';

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function CTASection({
  title = 'Scan Your Own Website',
  description = 'Discover accessibility issues on your website and get actionable recommendations to improve your WCAG compliance score.',
  buttonText = 'Start Free Scan',
  buttonHref = '/',
}: CTASectionProps) {
  const isExternal: boolean = buttonHref.startsWith('http');

  const buttonClass: string =
    'inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-teal bg-white hover:bg-neutral-50 transition-all duration-200 shadow-elevated hover:shadow-lg text-lg';

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal to-teal-500">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative px-8 py-16 sm:px-12 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
          {title}
        </h2>
        <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-8 leading-relaxed">
          {description}
        </p>
        {isExternal ? (
          <a
            href={buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            {buttonText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <Link href={buttonHref} className={buttonClass}>
            {buttonText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        )}
      </div>
    </section>
  );
}
