import { Locale } from '@/i18n/locales';
import { t } from '@/i18n/helpers';
import { generateMetadata as genMeta } from '@/lib/metadata';

interface ContactPageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  return genMeta({
    locale,
    titleKey: 'contact.title',
    descriptionKey: 'contact.intro',
    path: '/contact',
  });
}

export default function ContactPage({ params }: ContactPageProps) {
  const locale = params.locale as Locale;

  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-6">{t(locale, 'contact.title')}</h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-lg text-neutral-600 mb-8">{t(locale, 'contact.intro')}</p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              {t(locale, 'contact.email.label')}
            </h2>
            <a
              href={`mailto:${t(locale, 'contact.email.value')}`}
              className="text-primary-600 hover:text-primary-700 text-lg font-medium"
            >
              {t(locale, 'contact.email.value')}
            </a>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
              {t(locale, 'contact.support.title')}
            </h2>
            <p className="text-neutral-700">{t(locale, 'contact.support.content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
              {t(locale, 'contact.privacy.title')}
            </h2>
            <p className="text-neutral-700">{t(locale, 'contact.privacy.content')}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
