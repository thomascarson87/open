
import React, { useState } from 'react';
import { Skill } from '../types';
import { SKILL_LEVEL_METADATA } from '../constants/matchingData';
import { Trash2, Info } from 'lucide-react';
import LevelTooltip from './LevelTooltip';

interface Props {
  skill: Skill;
  onUpdate?: (updates: Partial<Skill>) => void;
  onChange?: (updated: Skill) => void;
  onRemove: () => void;
}

const SkillLevelSelector: React.FC<Props> = ({ skill, onUpdate, onChange, onRemove }) => {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  const handleLevelChange = (level: 1 | 2 | 3 | 4 | 5) => {
    if (onUpdate) onUpdate({ level });
    if (onChange) onChange({ ...skill, level });
  };

  const handleYearsChange = (years: number | undefined) => {
    if (onUpdate) onUpdate({ years });
    if (onChange) onChange({ ...skill, years });
  };

  const handleDescriptionChange = (description: string) => {
    if (onUpdate) onUpdate({ description });
    if (onChange) onChange({ ...skill, description });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all hover:shadow-md hover:border-blue-200">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-gray-900 border border-gray-200">
            {skill.name}
          </div>
          <div className="text-sm font-bold text-blue-600">
            Level {skill.level}: {SKILL_LEVEL_METADATA[skill.level].label}
          </div>
        </div>
        <button 
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove skill"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Level Buttons */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Proficiency Level *</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((lvl) => {
              const meta = SKILL_LEVEL_METADATA[lvl as number];
              const isSelected = skill.level === lvl;
              
              return (
                <div 
                  key={lvl} 
                  className="relative flex-1"
                  onMouseEnter={() => setHoveredLevel(lvl)}
                  onMouseLeave={() => setHoveredLevel(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleLevelChange(lvl as any)}
                    className={`w-full py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl md:text-2xl">{meta.icon}</span>
                    <span className="text-xs font-black">{lvl}</span>
                  </button>
                  {hoveredLevel === lvl && <LevelTooltip metadata={meta} />}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900 leading-tight">
              <span className="font-bold">{SKILL_LEVEL_METADATA[skill.level].label}: </span>
              {SKILL_LEVEL_METADATA[skill.level].descriptor}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Years Input */}
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Years (Optional)</label>
            <input 
              type="number"
              min="0"
              step="0.5"
              value={skill.years || ''}
              onChange={(e) => handleYearsChange(parseFloat(e.target.value) || undefined)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="e.g. 4.5"
            />
          </div>

          {/* Description / Proof */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Proof of Work (Optional)</label>
            <textarea 
              value={skill.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value.slice(0, 200))}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none resize-none h-12"
              placeholder="e.g. Led architectural migration from JS to TS for 2M users..."
              maxLength={200}
            />
            <div className="text-right text-[10px] text-gray-400 mt-1">
              {skill.description?.length || 0}/200 chars
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillLevelSelector;
