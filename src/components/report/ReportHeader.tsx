interface ReportHeaderProps {
  domain: string;
  score: number;
  wcagLevel: string;
  scanDate?: string;
  scopePages?: number;
  isPublic?: boolean;
}

function getScoreColor(score: number): { ring: string; text: string; bg: string } {
  if (score >= 90) return { ring: 'stroke-green-500', text: 'text-green-600', bg: 'bg-green-50' };
  if (score >= 70) return { ring: 'stroke-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-50' };
  if (score >= 50) return { ring: 'stroke-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' };
  return { ring: 'stroke-red-500', text: 'text-red-600', bg: 'bg-red-50' };
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Poor';
}

export default function ReportHeader({ domain, score, wcagLevel, scanDate, scopePages = 1, isPublic }: ReportHeaderProps) {
  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-card overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-primary" />

        <div className="p-8 sm:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Score circle */}
            <div className="relative flex-shrink-0">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#E3E5E8"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  className={colors.ring}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold font-heading ${colors.text}`}>{score}</span>
                <span className="text-xs text-text-muted font-medium mt-0.5">/ 100</span>
              </div>
            </div>

            {/* Domain info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-medium text-text-muted mb-1">Accessibility Report</p>
              <h1 className="text-3xl sm:text-4xl font-bold font-heading text-text-primary mb-3 break-all">
                {domain}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {getScoreLabel(score)}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-teal-50 text-teal border border-teal-200">
                  WCAG {wcagLevel}
                </span>
                {scanDate && (
                  <span className="text-sm text-text-muted">
                    Scanned {scanDate}
                  </span>
                )}
              </div>

              {/* Scope line */}
              <p className="text-xs text-text-muted flex items-center justify-center md:justify-start gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Scope: {scopePages} page scanned (homepage) &bull; Automated scan
                {isPublic !== undefined && (
                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${isPublic ? 'bg-teal-50 text-teal' : 'bg-neutral-100 text-text-muted'}`}>
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer block */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-highlight-50 border border-highlight-200">
        <svg className="w-5 h-5 text-highlight-800 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-highlight-900 leading-relaxed">
          <span className="font-semibold">Automated results are indicative</span> and may not catch all accessibility issues. A manual review by an accessibility specialist is recommended for full compliance.
        </p>
      </div>
    </div>
  );
}
