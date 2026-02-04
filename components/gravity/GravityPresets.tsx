import React from 'react';
import { MatchWeights } from '../../hooks/useCircularWeights';
import { PRESETS, PresetKey, weightsMatchPreset } from './constants';

interface GravityPresetsProps {
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  variant?: 'default' | 'ghost';
  compact?: boolean;
}

const PRESET_CONFIG: Record<PresetKey, { label: string; shortLabel: string; activeClass: string; inactiveClass: string }> = {
  balanced: {
    label: 'Balanced',
    shortLabel: 'Balanced',
    activeClass: '!bg-gray-900 text-white border-gray-900',
    inactiveClass: 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200',
  },
  skillsFirst: {
    label: 'Skills-First',
    shortLabel: 'Skills',
    activeClass: '!bg-blue-600 text-white border-blue-600',
    inactiveClass: 'bg-white text-blue-700 hover:bg-blue-50 border-blue-200',
  },
  compensationFirst: {
    label: 'Comp-First',
    shortLabel: 'Comp',
    activeClass: '!bg-green-600 text-white border-green-600',
    inactiveClass: 'bg-white text-green-700 hover:bg-green-50 border-green-200',
  },
  cultureFirst: {
    label: 'Culture-First',
    shortLabel: 'Culture',
    activeClass: '!bg-purple-600 text-white border-purple-600',
    inactiveClass: 'bg-white text-purple-700 hover:bg-purple-50 border-purple-200',
  },
};

const GravityPresets: React.FC<GravityPresetsProps> = ({
  weights,
  onChange,
  variant = 'default',
  compact = false,
}) => {
  const activePreset = (Object.keys(PRESETS) as PresetKey[]).find((key) =>
    weightsMatchPreset(weights, PRESETS[key])
  );

  const baseClass = compact
    ? 'px-2 py-1 rounded-md text-[10px] font-bold transition-all border'
    : 'px-3 py-2 rounded-lg text-xs font-bold transition-all border';

  const containerClass = compact
    ? 'flex flex-col gap-1'
    : 'grid grid-cols-2 gap-2';

  return (
    <div className={containerClass}>
      {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
        const config = PRESET_CONFIG[key];
        const isActive = activePreset === key;
        const label = compact ? config.shortLabel : config.label;

        return (
          <button
            key={key}
            onClick={() => onChange(PRESETS[key])}
            className={`
              ${baseClass}
              ${isActive ? config.activeClass : config.inactiveClass}
              active:scale-95
              whitespace-nowrap
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default GravityPresets;
