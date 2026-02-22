interface ScoreCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'orange' | 'teal' | 'red' | 'yellow';
  subtitle?: string;
}

const colorMap: Record<ScoreCardProps['color'], { bg: string; icon: string; border: string }> = {
  orange: {
    bg: 'bg-primary-50',
    icon: 'text-primary',
    border: 'border-primary-200',
  },
  teal: {
    bg: 'bg-teal-50',
    icon: 'text-teal',
    border: 'border-teal-200',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
  },
  yellow: {
    bg: 'bg-highlight-50',
    icon: 'text-highlight-800',
    border: 'border-highlight-200',
  },
};

export default function ScoreCard({ title, value, icon, color, subtitle }: ScoreCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`card p-6 ${colors.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-muted mb-1">{title}</p>
          <p className="text-3xl font-bold font-heading text-text-primary tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <span className={colors.icon}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
