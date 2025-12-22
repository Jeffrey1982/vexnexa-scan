import { Locale } from '@/i18n/locales';
import { t } from '@/i18n/helpers';
import { generateMetadata as genMeta } from '@/lib/metadata';

interface PrivacyPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  return genMeta({
    locale,
    titleKey: 'privacy.title',
    descriptionKey: 'privacy.intro',
    path: '/privacy',
  });
}

export default function PrivacyPage({ params }: PrivacyPageProps) {
  const locale = params.locale as Locale;

  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-6">{t(locale, 'privacy.title')}</h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-lg text-neutral-600 mb-8">{t(locale, 'privacy.intro')}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
              {t(locale, 'privacy.section1.title')}
            </h2>
            <p className="text-neutral-700">{t(locale, 'privacy.section1.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
              {t(locale, 'privacy.section2.title')}
            </h2>
            <p className="text-neutral-700">{t(locale, 'privacy.section2.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
              {t(locale, 'privacy.section3.title')}
            </h2>
            <p className="text-neutral-700">{t(locale, 'privacy.section3.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
              {t(locale, 'privacy.section4.title')}
            </h2>
            <p className="text-neutral-700">{t(locale, 'privacy.section4.content')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
