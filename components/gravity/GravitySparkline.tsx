import React from 'react';
import { ChevronDown, Sliders } from 'lucide-react';
import GravityCircle from './GravityCircle';
import { MatchWeights } from '../../hooks/useCircularWeights';
import { COLORS } from './constants';

interface GravitySparklineProps {
  weights: MatchWeights;
  onExpand: () => void;
  className?: string;
}

const GravitySparkline: React.FC<GravitySparklineProps> = ({
  weights,
  onExpand,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl
        px-4 py-3
        flex items-center gap-4
        cursor-pointer hover:shadow-xl transition-all duration-200
        ${className}
      `}
      onClick={onExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpand();
        }
      }}
      aria-label="Open match priority filter"
    >
      {/* Icon */}
      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
        <Sliders className="w-4 h-4 text-blue-600" />
      </div>

      {/* Mini circle preview */}
      <div className="flex-shrink-0">
        <GravityCircle
          weights={weights}
          size="sm"
          interactive={false}
          showLabels={false}
        />
      </div>

      {/* Percentage pills */}
      <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
        <span
          className={`
            px-2.5 py-1 rounded-full text-xs font-bold
            ${COLORS.skills.bgLight} ${COLORS.skills.text}
            whitespace-nowrap
          `}
        >
          Skills {weights.skills}%
        </span>
        <span
          className={`
            px-2.5 py-1 rounded-full text-xs font-bold
            ${COLORS.compensation.bgLight} ${COLORS.compensation.text}
            whitespace-nowrap
          `}
        >
          Comp {weights.compensation}%
        </span>
        <span
          className={`
            px-2.5 py-1 rounded-full text-xs font-bold
            ${COLORS.culture.bgLight} ${COLORS.culture.text}
            whitespace-nowrap
          `}
        >
          Culture {weights.culture}%
        </span>
      </div>

      {/* Expand indicator */}
      <div className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

export default GravitySparkline;
