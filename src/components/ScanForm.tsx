'use client';

import { useState, FormEvent } from 'react';
import { Locale } from '@/i18n/locales';
import { t } from '@/i18n/helpers';
import SuccessPanel from './SuccessPanel';

interface ScanFormProps {
  locale: Locale;
}

interface FormData {
  url: string;
  email: string;
  consent: boolean;
  company: string; // honeypot
}

interface FormErrors {
  url?: string;
  email?: string;
  consent?: string;
  general?: string;
}

export default function ScanForm({ locale }: ScanFormProps) {
  const [formData, setFormData] = useState<FormData>({
    url: '',
    email: '',
    consent: false,
    company: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate URL
    if (!formData.url.trim()) {
      newErrors.url = t(locale, 'form.error.url.required');
    } else {
      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.url.trim())) {
        newErrors.url = t(locale, 'form.error.url.invalid');
      }
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = t(locale, 'form.error.email.required');
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = t(locale, 'form.error.email.invalid');
      }
    }

    // Validate consent
    if (!formData.consent) {
      newErrors.consent = t(locale, 'form.error.consent.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/scan-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: formData.url.trim(),
          email: formData.email.trim(),
          consent: formData.consent,
          company: formData.company, // honeypot
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrors({ general: t(locale, 'form.error.rate_limit') });
        } else {
          setErrors({ general: data.error || t(locale, 'form.error.generic') });
        }
        setIsSubmitting(false);
        return;
      }

      if (data.ok && data.ref) {
        setSuccessRef(data.ref);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ general: t(locale, 'form.error.generic') });
      setIsSubmitting(false);
    }
  };

  // Show success panel if submission succeeded
  if (successRef) {
    return <SuccessPanel locale={locale} refId={successRef} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {errors.general}
        </div>
      )}

      {/* URL field */}
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-primary-900 mb-2">
          {t(locale, 'form.url.label')}
        </label>
        <input
          type="text"
          id="url"
          name="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          placeholder={t(locale, 'form.url.placeholder')}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-accent-600 focus:border-accent-600 outline-none transition-colors ${
            errors.url ? 'border-red-500' : 'border-neutral-500'
          }`}
          aria-invalid={!!errors.url}
          aria-describedby={errors.url ? 'url-error' : undefined}
        />
        {errors.url && (
          <p id="url-error" className="mt-1 text-sm text-red-600">
            {errors.url}
          </p>
        )}
      </div>

      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary-900 mb-2">
          {t(locale, 'form.email.label')}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder={t(locale, 'form.email.placeholder')}
          className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-accent-600 focus:border-accent-600 outline-none transition-colors ${
            errors.email ? 'border-red-500' : 'border-neutral-500'
          }`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      {/* Honeypot field (hidden) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company (do not fill)</label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Consent checkbox */}
      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.consent}
            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
            className="mt-1 w-4 h-4 text-accent-600 border-neutral-500 rounded focus:ring-2 focus:ring-accent-600"
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
          />
          <span className="text-sm text-primary-900">{t(locale, 'form.consent.label')}</span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="mt-1 text-sm text-red-600 ml-7">
            {errors.consent}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent-600 text-white px-6 py-3 rounded-md font-medium hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? t(locale, 'form.submitting') : t(locale, 'form.submit')}
      </button>
    </form>
  );
}
