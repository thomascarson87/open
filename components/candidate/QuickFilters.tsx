
import React from 'react';
import { ApplicationFilter } from '../../types';

interface QuickFiltersProps {
  current: ApplicationFilter;
  onChange: (filter: ApplicationFilter) => void;
  counts: Record<ApplicationFilter, number>;
}

const FILTERS: { id: ApplicationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offers', label: 'Offers' },
  { id: 'closed', label: 'Closed' }
];

const QuickFilters: React.FC<QuickFiltersProps> = ({ current, onChange, counts }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {FILTERS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap
            transition-all flex-shrink-0
            ${current === f.id
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }
          `}
        >
          {f.label}
          {counts[f.id] > 0 && (
            <span className={`ml-1.5 ${current === f.id ? 'text-gray-400' : 'text-gray-400'}`}>
              {counts[f.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default QuickFilters;
