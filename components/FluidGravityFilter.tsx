import React, { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { MatchWeights } from '../hooks/useCircularWeights';
import { useIsMobile } from '../hooks/useMediaQuery';
import GravityCircle from './gravity/GravityCircle';
import GravitySparkline from './gravity/GravitySparkline';
import GravitySheet from './gravity/GravitySheet';
import GravityPopover from './gravity/GravityPopover';
import GravityPresets from './gravity/GravityPresets';
import { COLORS, PRESETS } from './gravity/constants';

// Re-export for backwards compatibility
export type { MatchWeights };

interface FluidGravityFilterProps {
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  onReset: () => void;
}

// Shift weight toward one dimension (for keyboard navigation)
function shiftWeight(weights: MatchWeights, dimension: keyof MatchWeights, amount: number): MatchWeights {
  const newValue = Math.max(0, Math.min(100, weights[dimension] + amount));
  const diff = newValue - weights[dimension];

  const others = (['skills', 'compensation', 'culture'] as const).filter((k) => k !== dimension);
  const otherTotal = others.reduce((sum, k) => sum + weights[k], 0);

  if (otherTotal === 0) {
    return { ...weights, [dimension]: newValue };
  }

  const result = { ...weights, [dimension]: newValue };
  for (const key of others) {
    const ratio = weights[key] / otherTotal;
    result[key] = Math.max(0, Math.round(weights[key] - diff * ratio));
  }

  // Ensure sum is exactly 100
  const sum = result.skills + result.compensation + result.culture;
  if (sum !== 100) {
    result.culture += 100 - sum;
  }

  return result;
}

const WeightBars: React.FC<{ weights: MatchWeights }> = ({ weights }) => (
  <div className="space-y-3">
    {/* Skills */}
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-700">Skills Match</span>
        <span className={`text-sm font-black ${COLORS.skills.text}`}>{weights.skills}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${COLORS.skills.bg} rounded-full transition-all duration-200`}
          style={{ width: `${weights.skills}%` }}
        />
      </div>
    </div>

    {/* Compensation */}
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-700">Compensation</span>
        <span className={`text-sm font-black ${COLORS.compensation.text}`}>{weights.compensation}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${COLORS.compensation.bg} rounded-full transition-all duration-200`}
          style={{ width: `${weights.compensation}%` }}
        />
      </div>
    </div>

    {/* Culture */}
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-700">Culture Fit</span>
        <span className={`text-sm font-black ${COLORS.culture.text}`}>{weights.culture}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${COLORS.culture.bg} rounded-full transition-all duration-200`}
          style={{ width: `${weights.culture}%` }}
        />
      </div>
    </div>
  </div>
);

const ExpandedContent: React.FC<{
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  onReset: () => void;
}> = ({ weights, onChange, onReset }) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const STEP = 5;
      let newWeights: MatchWeights | null = null;

      switch (e.key) {
        case 'ArrowUp':
          newWeights = shiftWeight(weights, 'skills', STEP);
          break;
        case 'ArrowDown':
          newWeights = shiftWeight(weights, 'skills', -STEP);
          break;
        case 'ArrowLeft':
          newWeights = shiftWeight(weights, 'culture', STEP);
          break;
        case 'ArrowRight':
          newWeights = shiftWeight(weights, 'compensation', STEP);
          break;
        case '1':
          newWeights = PRESETS.balanced;
          break;
        case '2':
          newWeights = PRESETS.skillsFirst;
          break;
        case '3':
          newWeights = PRESETS.compensationFirst;
          break;
        case '4':
          newWeights = PRESETS.cultureFirst;
          break;
        default:
          return;
      }

      if (newWeights) {
        e.preventDefault();
        onChange(newWeights);
      }
    },
    [weights, onChange]
  );

  return (
    <div
      className="flex flex-col md:flex-row gap-5 items-start"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Circle */}
      <div className="flex-shrink-0 flex justify-center md:justify-start">
        <GravityCircle
          weights={weights}
          onChange={onChange}
          size="md"
          interactive={true}
          showLabels={true}
        />
      </div>

      {/* Weight display and presets */}
      <div className="flex flex-col gap-3 flex-1 min-w-[180px]">
        <WeightBars weights={weights} />

        {/* Preset buttons */}
        <GravityPresets weights={weights} onChange={onChange} variant="ghost" />

        {/* Reset button */}
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset to Balanced
        </button>

        {/* Keyboard hint */}
        <p className="text-[10px] text-gray-400 text-center">
          Use arrow keys or click presets
        </p>
      </div>
    </div>
  );
};

const FluidGravityFilter: React.FC<FluidGravityFilterProps> = ({
  weights,
  onChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="relative mb-8 sticky top-20 z-30">
      {/* Sparkline (always visible when collapsed) */}
      <GravitySparkline
        weights={weights}
        onExpand={() => setIsExpanded(true)}
        className={isExpanded && !isMobile ? 'opacity-0 pointer-events-none' : ''}
      />

      {/* Mobile: Bottom Sheet */}
      {isMobile && (
        <GravitySheet
          isOpen={isExpanded}
          onClose={() => setIsExpanded(false)}
          title="What Matters Most to You?"
        >
          <ExpandedContent weights={weights} onChange={onChange} onReset={onReset} />
        </GravitySheet>
      )}

      {/* Desktop: Popover */}
      {!isMobile && (
        <GravityPopover
          isOpen={isExpanded}
          onClose={() => setIsExpanded(false)}
          title="What Matters Most to You?"
        >
          <ExpandedContent weights={weights} onChange={onChange} onReset={onReset} />
        </GravityPopover>
      )}
    </div>
  );
};

export default FluidGravityFilter;
