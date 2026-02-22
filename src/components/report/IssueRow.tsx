interface IssueRowProps {
  ruleName: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  wcagReference: string;
  howToFix: string;
  codeExample?: string;
}

const impactConfig: Record<IssueRowProps['impact'], { label: string; bg: string; text: string; dot: string }> = {
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  serious: { label: 'Serious', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  moderate: { label: 'Moderate', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  minor: { label: 'Minor', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
};

export default function IssueRow({ ruleName, impact, wcagReference, howToFix, codeExample }: IssueRowProps) {
  const config = impactConfig[impact];

  return (
    <div className="card p-6 space-y-4">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <h3 className="text-lg font-semibold font-heading text-text-primary flex-1">
          {ruleName}
        </h3>
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Impact badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
          </span>
          {/* WCAG reference badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
            {wcagReference}
          </span>
        </div>
      </div>

      {/* How to fix */}
      <div>
        <p className="text-sm font-medium text-text-muted mb-1">How to fix</p>
        <p className="text-sm text-text-primary leading-relaxed">{howToFix}</p>
      </div>

      {/* Code example */}
      {codeExample && (
        <div>
          <p className="text-sm font-medium text-text-muted mb-2">Code example</p>
          <pre className="bg-neutral-900 text-neutral-100 rounded-xl p-4 text-sm overflow-x-auto leading-relaxed">
            <code>{codeExample}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
