import { Metadata } from 'next';
import { Locale, locales } from '@/i18n/locales';
import { t } from '@/i18n/helpers';
import { TranslationKey } from '@/i18n/translations';

interface PageMetadataProps {
  locale: Locale;
  titleKey?: TranslationKey;
  descriptionKey?: TranslationKey;
  path?: string;
}

const BASE_URL = 'https://scan.vexnexa.com';

export function generateMetadata({
  locale,
  titleKey = 'meta.title',
  descriptionKey = 'meta.description',
  path = '',
}: PageMetadataProps): Metadata {
  const title = t(locale, titleKey);
  const description = t(locale, descriptionKey);

  // Canonical URL - exact URL for this locale and path
  const canonicalUrl = `${BASE_URL}/${locale}${path}`;

  // Build hreflang alternates for all locales
  const languages: Record<string, string> = {};

  for (const loc of locales) {
    languages[loc] = `${BASE_URL}/${loc}${path}`;
  }

  // x-default points to English version
  languages['x-default'] = `${BASE_URL}/en${path}`;

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'VexnexaScan',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
