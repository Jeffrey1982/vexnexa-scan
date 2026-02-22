import type { Metadata } from 'next';
import ReportRemovalForm from '@/components/ReportRemovalForm';

export const metadata: Metadata = {
  title: 'Request Report Removal',
  description: 'Request the removal of a public accessibility report from VexNexa Scanner.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReportRemovalPage() {
  return (
    <div className="section-padding">
      <div className="section-container max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary mb-4">
            Request Report Removal
          </h1>
          <p className="text-lg text-text-muted leading-relaxed">
            If you are the owner of a domain and would like a public report removed,
            please submit a request below.
          </p>
        </div>

        <ReportRemovalForm />
      </div>
    </div>
  );
}
