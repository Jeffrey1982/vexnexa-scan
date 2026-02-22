import type { Metadata } from 'next';
import { Suspense } from 'react';
import PrivateReportView from '@/components/report/PrivateReportView';

interface PrivateReportPageProps {
  params: { id: string };
}

export function generateMetadata(): Metadata {
  // Private routes are ALWAYS noindex, nofollow — no canonical
  return {
    title: 'Private Accessibility Report',
    description: 'Private WCAG 2.2 accessibility report.',
    robots: { index: false, follow: false },
  };
}

export default function PrivateReportPage({ params }: PrivateReportPageProps) {
  return (
    <Suspense fallback={
      <div className="section-padding">
        <div className="section-container flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <svg className="animate-spin w-10 h-10 text-primary mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-text-muted text-lg">Loading report...</p>
          </div>
        </div>
      </div>
    }>
      <PrivateReportView reportId={params.id} />
    </Suspense>
  );
}
