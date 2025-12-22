'use client';

import { Locale } from '@/i18n/locales';
import { t } from '@/i18n/helpers';

interface SuccessPanelProps {
  locale: Locale;
  refId: string;
}

export default function SuccessPanel({ locale, refId }: SuccessPanelProps) {
  return (
    <div className="space-y-6">
      {/* Success message */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-primary-600"
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
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-primary-900 mb-2">
              {t(locale, 'success.title')}
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-primary-800">{t(locale, 'success.ref')}:</span>
              <code className="bg-white px-2 py-1 rounded border border-primary-200 text-primary-900 font-mono">
                {refId}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          {t(locale, 'success.next.title')}
        </h3>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              1
            </span>
            <span className="text-neutral-700 pt-0.5">{t(locale, 'success.next.step1')}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </span>
            <span className="text-neutral-700 pt-0.5">{t(locale, 'success.next.step2')}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              3
            </span>
            <span className="text-neutral-700 pt-0.5">{t(locale, 'success.next.step3')}</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
