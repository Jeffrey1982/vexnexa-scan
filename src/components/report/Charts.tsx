'use client';

interface ChartBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

function ChartBar({ label, value, maxValue, color }: ChartBarProps) {
  const percentage: number = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text-primary">{label}</span>
        <span className="font-semibold text-text-primary">{value}</span>
      </div>
      <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}

interface IssueBreakdownData {
  contrast: number;
  aria: number;
  altText: number;
  structure: number;
  forms: number;
  navigation: number;
}

interface ScoreDistributionData {
  label: string;
  value: number;
  color: string;
}

interface ChartsProps {
  issueBreakdown: IssueBreakdownData;
  scoreDistribution?: ScoreDistributionData[];
}

export default function Charts({ issueBreakdown, scoreDistribution }: ChartsProps) {
  const breakdownItems: { label: string; value: number; color: string }[] = [
    { label: 'Contrast Issues', value: issueBreakdown.contrast, color: 'bg-red-500' },
    { label: 'ARIA Issues', value: issueBreakdown.aria, color: 'bg-orange-500' },
    { label: 'Missing Alt Text', value: issueBreakdown.altText, color: 'bg-yellow-500' },
    { label: 'Structure Issues', value: issueBreakdown.structure, color: 'bg-blue-500' },
    { label: 'Form Issues', value: issueBreakdown.forms, color: 'bg-purple-500' },
    { label: 'Navigation Issues', value: issueBreakdown.navigation, color: 'bg-teal' },
  ];

  const maxValue: number = Math.max(...breakdownItems.map((item) => item.value), 1);

  // Donut chart data
  const donutData: ScoreDistributionData[] = scoreDistribution || [
    { label: 'Critical', value: issueBreakdown.contrast, color: '#EF4444' },
    { label: 'Serious', value: issueBreakdown.aria, color: '#F97316' },
    { label: 'Moderate', value: issueBreakdown.altText + issueBreakdown.structure, color: '#EAB308' },
    { label: 'Minor', value: issueBreakdown.forms + issueBreakdown.navigation, color: '#3B82F6' },
  ];

  const total: number = donutData.reduce((sum, d) => sum + d.value, 0);
  const radius: number = 60;
  const circumference: number = 2 * Math.PI * radius;

  let cumulativeOffset: number = 0;
  const donutSegments: { offset: number; length: number; color: string; label: string; value: number }[] = donutData
    .filter((d) => d.value > 0)
    .map((d) => {
      const length: number = total > 0 ? (d.value / total) * circumference : 0;
      const segment = {
        offset: cumulativeOffset,
        length,
        color: d.color,
        label: d.label,
        value: d.value,
      };
      cumulativeOffset += length;
      return segment;
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Bar chart — Issue Breakdown */}
      <div className="card p-6 sm:p-8">
        <h3 className="text-lg font-semibold font-heading text-text-primary mb-6">
          Issue Breakdown
        </h3>
        <div className="space-y-5">
          {breakdownItems.map((item) => (
            <ChartBar
              key={item.label}
              label={item.label}
              value={item.value}
              maxValue={maxValue}
              color={item.color}
            />
          ))}
        </div>
      </div>

      {/* Donut chart — Impact Distribution */}
      <div className="card p-6 sm:p-8">
        <h3 className="text-lg font-semibold font-heading text-text-primary mb-6">
          Impact Distribution
        </h3>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#E3E5E8"
                strokeWidth="16"
              />
              {donutSegments.map((seg, i) => (
                <circle
                  key={i}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="16"
                  strokeDasharray={`${seg.length} ${circumference - seg.length}`}
                  strokeDashoffset={-seg.offset}
                  strokeLinecap="butt"
                  className="transition-all duration-700"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-heading text-text-primary">{total}</span>
              <span className="text-xs text-text-muted">Total Issues</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full max-w-xs">
            {donutData.map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm text-text-muted">{d.label}</span>
                <span className="text-sm font-semibold text-text-primary ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
