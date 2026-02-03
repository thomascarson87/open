import React from 'react';
import { MatchWeights } from '../../hooks/useCircularWeights';
import { PRESETS, PresetKey, weightsMatchPreset } from './constants';

interface GravityPresetsProps {
  weights: MatchWeights;
  onChange: (weights: MatchWeights) => void;
  variant?: 'default' | 'ghost';
}

const PRESET_CONFIG: Record<PresetKey, { label: string; activeClass: string; inactiveClass: string }> = {
  balanced: {
    label: 'Balanced',
    activeClass: 'bg-gray-900 text-white border-gray-900',
    inactiveClass: 'text-gray-600 hover:bg-gray-50 border-gray-200',
  },
  skillsFirst: {
    label: 'Skills-First',
    activeClass: 'bg-blue-600 text-white border-blue-600',
    inactiveClass: 'text-blue-700 hover:bg-blue-50 border-blue-200',
  },
  compensationFirst: {
    label: 'Comp-First',
    activeClass: 'bg-green-600 text-white border-green-600',
    inactiveClass: 'text-green-700 hover:bg-green-50 border-green-200',
  },
  cultureFirst: {
    label: 'Culture-First',
    activeClass: 'bg-purple-600 text-white border-purple-600',
    inactiveClass: 'text-purple-700 hover:bg-purple-50 border-purple-200',
  },
};

const GravityPresets: React.FC<GravityPresetsProps> = ({
  weights,
  onChange,
  variant = 'default',
}) => {
  const activePreset = (Object.keys(PRESETS) as PresetKey[]).find((key) =>
    weightsMatchPreset(weights, PRESETS[key])
  );

  const baseClass = variant === 'ghost'
    ? 'px-3 py-2 rounded-lg text-xs font-bold transition-all border bg-transparent'
    : 'px-3 py-2 rounded-lg text-xs font-bold transition-all border';

  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
        const config = PRESET_CONFIG[key];
        const isActive = activePreset === key;

        return (
          <button
            key={key}
            onClick={() => onChange(PRESETS[key])}
            className={`
              ${baseClass}
              ${isActive ? config.activeClass : config.inactiveClass}
              active:scale-95
            `}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

export default GravityPresets;
