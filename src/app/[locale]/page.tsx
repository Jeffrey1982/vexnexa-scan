import { Locale } from '@/i18n/locales';
import { t } from '@/i18n/helpers';
import ScanForm from '@/components/ScanForm';

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params }: HomePageProps) {
  const locale = params.locale as Locale;

  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-4">
            {t(locale, 'landing.h1')}
          </h1>
          <p className="text-lg text-neutral-600 mb-8">{t(locale, 'landing.subtitle')}</p>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t(locale, 'trust.scan_time')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{t(locale, 'trust.no_obligation')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span>{t(locale, 'trust.objective')}</span>
            </div>
          </div>

          {/* Benefits list */}
          <ul className="text-left max-w-xl mx-auto space-y-3 mb-12">
            <li className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-neutral-700">{t(locale, 'landing.bullet1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-neutral-700">{t(locale, 'landing.bullet2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-neutral-700">{t(locale, 'landing.bullet3')}</span>
            </li>
          </ul>
        </div>

        {/* Form */}
        <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-8">
          <ScanForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
