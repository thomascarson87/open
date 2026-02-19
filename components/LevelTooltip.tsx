import React from 'react';
import { SkillLevelMetadata } from '../types';

interface Props {
  metadata: SkillLevelMetadata;
  position?: 'top' | 'bottom';
}

const LevelTooltip: React.FC<Props> = ({ metadata, position = 'top' }) => {
  const positionClasses = position === 'top' 
    ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' 
    : 'top-full mt-2 left-1/2 -translate-x-1/2';

  return (
    <div className={`absolute z-50 bg-gray-900 text-white p-4 rounded-xl shadow-xl w-64 md:w-80 pointer-events-none transition-all duration-200 ${positionClasses}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{metadata.icon}</span>
        <span className="font-bold text-lg">{metadata.label}</span>
      </div>
      <p className="text-sm text-gray-300 dark:text-gray-600 mb-3 leading-tight">{metadata.descriptor}</p>
      
      <div className="space-y-2 mb-3">
        <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Observable Behaviors</div>
        <ul className="text-xs space-y-1.5">
          {metadata.behaviors.map((behavior, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-accent-coral-light mt-0.5">•</span>
              <span>{behavior}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="border-t border-gray-800 pt-2 mt-2">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          <span className="font-bold text-muted uppercase">Example:</span> {metadata.example}
        </p>
      </div>
      
      {/* Arrow */}
      <div className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 ${
        position === 'top' ? 'top-full -mt-1.5' : 'bottom-full -mb-1.5'
      }`}></div>
    </div>
  );
};

export default LevelTooltip;
