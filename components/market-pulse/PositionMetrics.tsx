import React from 'react';
import { ProfileStrength, CandidateVisibility } from '../../services/marketIntelligence';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  isLoading?: boolean;
  isPlaceholder?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  trend,
  isLoading,
  isPlaceholder
}) => {
  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-500';
      default: return 'text-gray-400 dark:text-gray-500';
    }
  };

  const getTrendArrow = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3" />
        <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-2" />
        <div className="h-3 w-24 bg-gray-50 dark:bg-gray-900 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`bg-surface rounded-xl border border-border p-5 ${isPlaceholder ? 'opacity-50' : ''}`}>
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-primary">
          {value}
        </span>
        {trend && trend.percentage > 0 && (
          <span className={`text-xs font-bold ${getTrendColor(trend.direction)}`}>
            {getTrendArrow(trend.direction)} {trend.percentage}%
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>
      )}
      {isPlaceholder && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">Coming soon</p>
      )}
    </div>
  );
};

interface PositionMetricsProps {
  profileStrength: ProfileStrength | null;
  visibility: CandidateVisibility | null;
  isLoading: boolean;
}

const PositionMetrics: React.FC<PositionMetricsProps> = ({
  profileStrength,
  visibility,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Profile Strength */}
      <MetricCard
        label="Profile Strength"
        value={isLoading ? '—' : `${profileStrength?.score ?? 0}%`}
        subtext={
          profileStrength && profileStrength.score < 100
            ? `${profileStrength.breakdown.filter(b => !b.completed).length} sections to complete`
            : 'Profile complete'
        }
        isLoading={isLoading}
      />

      {/* Profile Views */}
      <MetricCard
        label="Profile Views"
        value={isLoading ? '—' : visibility?.last30Days ?? 0}
        subtext="Last 30 days"
        trend={
          visibility
            ? {
                direction: visibility.trend,
                percentage: visibility.trendPercentage
              }
            : undefined
        }
        isLoading={isLoading}
      />

      {/* Percentile Placeholder */}
      <MetricCard
        label="Market Percentile"
        value="—"
        isLoading={isLoading}
        isPlaceholder={!isLoading}
      />
    </div>
  );
};

export default PositionMetrics;
