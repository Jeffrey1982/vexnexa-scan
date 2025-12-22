import { notFound } from 'next/navigation';
import { isValidLocale, type Locale } from '@/i18n/locales';
import { generateMetadata as genMeta } from '@/lib/metadata';
import { t } from '@/i18n/helpers';
import LanguageSelector from '@/components/LanguageSelector';
import Link from 'next/link';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  if (!isValidLocale(locale)) {
    return {};
  }
  return genMeta({ locale });
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = params.locale;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="text-xl font-semibold text-neutral-900">
            VexnexaScan
          </Link>
          <LanguageSelector currentLocale={locale as Locale} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-600">{t(locale as Locale, 'footer.rights')}</p>
            <nav className="flex gap-6">
              <Link
                href={`/${locale}/privacy`}
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                {t(locale as Locale, 'nav.privacy')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                {t(locale as Locale, 'nav.contact')}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
