import React from 'react';
import { JobSkill } from '../types';
import { SKILL_LEVEL_METADATA } from '../constants/matchingData';
import { Info, Trash2 } from 'lucide-react';

interface Props {
  skill: JobSkill;
  onChange: (updatedSkill: JobSkill) => void;
  onRemove: () => void;
}

const JobSkillRequirementSelector: React.FC<Props> = ({ skill, onChange, onRemove }) => {
  
  const handleLevelChange = (level: 1 | 2 | 3 | 4 | 5) => {
    onChange({ ...skill, required_level: level });
  };

  const handleWeightToggle = (weight: 'required' | 'preferred') => {
    onChange({ ...skill, weight });
  };

  return (
    <div className="bg-white rounded-xl p-5 border-2 border-gray-200 transition-all hover:shadow-sm">
      
      {/* Skill Name Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-900">{skill.name}</h4>
        <button 
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          title="Remove skill"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Level Selector */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-3 text-center md:text-left">
          Required Proficiency Level <span className="text-red-500">*</span>
        </label>
        
        <div className="flex items-center justify-center md:justify-start gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 w-full md:w-fit">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const meta = SKILL_LEVEL_METADATA[lvl as number];
            const isSelected = skill.required_level === lvl;
            
            return (
              <div key={lvl} className="relative group flex-1 md:flex-initial">
                <button
                  type="button"
                  onClick={() => handleLevelChange(lvl as any)}
                  className={`w-full md:w-12 h-12 flex flex-col items-center justify-center rounded-md transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-md scale-105' 
                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className="text-base">{meta.icon}</span>
                  <span className="text-[10px] font-bold mt-0.5">{lvl}</span>
                </button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                  <div className="font-bold text-sm mb-1 flex items-center">
                    {meta.icon} {meta.label}
                  </div>
                  <div className="text-gray-300 italic mb-2">"{meta.descriptor}"</div>
                  <ul className="list-disc list-inside space-y-1 mb-2 text-gray-300">
                    {meta.behaviors.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                  <div className="border-t border-gray-700 pt-2 mt-2 text-gray-400 text-[11px]">
                    Example: {meta.example}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Level Info */}
      <div className="mb-4 bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0"><Info className="w-4 h-4 text-blue-500" /></div>
        <div className="flex-1 text-sm text-blue-900">
          <span className="font-bold">{SKILL_LEVEL_METADATA[skill.required_level].label}: </span>
          {SKILL_LEVEL_METADATA[skill.required_level].descriptor}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        {/* Optional Min Years */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Min Years <span className="text-gray-400">(optional guideline)</span>
          </label>
          <input 
            type="number"
            min="0"
            step="0.5"
            value={skill.minimumYears || ''}
            onChange={(e) => onChange({ 
              ...skill, 
              minimumYears: parseFloat(e.target.value) || undefined 
            })}
            className="w-full md:w-24 p-2 text-center text-sm font-bold border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Any"
          />
        </div>

        {/* Required/Preferred Toggle */}
        <div className="flex items-center gap-2 flex-1">
          <button
            type="button"
            onClick={() => handleWeightToggle('required')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all border-2 ${
              skill.weight === 'required'
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-gray-100 text-gray-500 border-transparent hover:border-gray-300'
            }`}
          >
            {skill.weight === 'required' ? '✓ Required' : 'Required'}
          </button>
          <button
            type="button"
            onClick={() => handleWeightToggle('preferred')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all border-2 ${
              skill.weight === 'preferred'
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-100 text-gray-500 border-transparent hover:border-gray-300'
            }`}
          >
            {skill.weight === 'preferred' ? '✓ Preferred' : 'Preferred'}
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-[10px] text-gray-400 mt-3 leading-relaxed italic">
        <strong>Required</strong>: Candidates must meet this level. 
        <strong className="ml-1">Preferred</strong>: Nice to have, boosts match score.
      </p>
    </div>
  );
};

export default JobSkillRequirementSelector;