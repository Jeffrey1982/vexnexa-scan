import { Metadata } from 'next';
import { Locale } from '@/i18n/locales';
import { t } from '@/i18n/helpers';
import { TranslationKey } from '@/i18n/translations';

interface PageMetadataProps {
  locale: Locale;
  titleKey?: TranslationKey;
  descriptionKey?: TranslationKey;
  path?: string;
}

export function generateMetadata({
  locale,
  titleKey = 'meta.title',
  descriptionKey = 'meta.description',
  path = '',
}: PageMetadataProps): Metadata {
  const title = t(locale, titleKey);
  const description = t(locale, descriptionKey);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scan.vexnexa.com';
  const url = `${baseUrl}/${locale}${path}`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
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
