import React from 'react';
import { Lock, User, Building, DollarSign } from 'lucide-react';

interface ReadOnlyFieldProps {
  label: string;
  value: string | number | undefined | null;
  source?: 'admin' | 'hiring_manager' | 'finance' | 'company_default' | 'hm_preferences';
  sourceName?: string;
  className?: string;
  variant?: 'default' | 'currency' | 'list';
  listItems?: string[];
  helpText?: string;
}

const getSourceIcon = (source: ReadOnlyFieldProps['source']) => {
  switch (source) {
    case 'admin':
      return <User className="w-3 h-3" />;
    case 'hiring_manager':
    case 'hm_preferences':
      return <User className="w-3 h-3" />;
    case 'finance':
      return <DollarSign className="w-3 h-3" />;
    case 'company_default':
      return <Building className="w-3 h-3" />;
    default:
      return <Lock className="w-3 h-3" />;
  }
};

const getSourceLabel = (
  source: ReadOnlyFieldProps['source'],
  sourceName?: string
): string => {
  if (!source) return 'View only';

  switch (source) {
    case 'admin':
      return sourceName ? `Set by ${sourceName}` : 'Set by Admin';
    case 'hiring_manager':
      return sourceName ? `Set by ${sourceName}` : 'Set by Hiring Manager';
    case 'hm_preferences':
      return sourceName ? `From ${sourceName}'s preferences` : 'From HM preferences';
    case 'finance':
      return sourceName ? `Set by ${sourceName}` : 'Set by Finance';
    case 'company_default':
      return 'Company default';
    default:
      return 'View only';
  }
};

const getSourceColor = (source: ReadOnlyFieldProps['source']) => {
  switch (source) {
    case 'admin':
      return 'bg-accent-green-bg text-accent-green border-accent-green-bg';
    case 'hiring_manager':
    case 'hm_preferences':
      return 'bg-accent-coral-bg text-accent-coral border-accent-coral-light';
    case 'finance':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'company_default':
      return 'bg-gray-50 dark:bg-gray-900 text-muted border-border';
    default:
      return 'bg-gray-50 dark:bg-gray-900 text-muted border-border';
  }
};

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  source,
  sourceName,
  className = '',
  variant = 'default',
  listItems,
  helpText
}) => {
  const displayValue = value ?? 'Not set';
  const sourceLabel = getSourceLabel(source, sourceName);
  const sourceColor = getSourceColor(source);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {label}
        </label>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${sourceColor}`}>
          {getSourceIcon(source)}
          <span>{sourceLabel}</span>
        </div>
      </div>

      {helpText && (
        <p className="text-xs text-muted mb-2">{helpText}</p>
      )}

      {variant === 'list' && listItems ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl">
          {listItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {listItems.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">None specified</p>
          )}
        </div>
      ) : variant === 'currency' ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl">
          <p className="text-xl font-black text-primary">
            {typeof value === 'number' ? value.toLocaleString() : displayValue}
          </p>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl">
          <p className="font-bold text-primary">
            {displayValue}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReadOnlyField;

/**
 * A read-only section wrapper that displays a lock banner
 */
interface ReadOnlySectionProps {
  title: string;
  children: React.ReactNode;
  source?: ReadOnlyFieldProps['source'];
  sourceName?: string;
}

export const ReadOnlySection: React.FC<ReadOnlySectionProps> = ({
  title,
  children,
  source,
  sourceName
}) => {
  const sourceLabel = getSourceLabel(source, sourceName);
  const sourceColor = getSourceColor(source);

  return (
    <div className="relative">
      {/* Banner */}
      <div className={`flex items-center justify-between px-4 py-2 rounded-t-2xl border border-b-0 ${sourceColor}`}>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-bold">{title} (View Only)</span>
        </div>
        <span className="text-xs font-medium">{sourceLabel}</span>
      </div>
      {/* Content with muted styling */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-border rounded-b-2xl">
        <div className="opacity-90 pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Component to show that a field was auto-populated from HM preferences
 */
interface AutoPopulatedBadgeProps {
  sourceName: string;
  className?: string;
}

export const AutoPopulatedBadge: React.FC<AutoPopulatedBadgeProps> = ({
  sourceName,
  className = ''
}) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-accent-coral-bg text-accent-coral rounded-full text-[10px] font-bold border border-accent-coral-light ${className}`}>
    <User className="w-3 h-3" />
    From {sourceName}'s preferences
  </span>
);
