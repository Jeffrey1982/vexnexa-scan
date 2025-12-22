import { Locale, defaultLocale } from './locales';
import { translations, TranslationKey } from './translations';

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations[defaultLocale][key] || key;
}

export function getTranslations(locale: Locale) {
  return translations[locale];
}
