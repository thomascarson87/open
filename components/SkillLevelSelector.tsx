
import React, { useState } from 'react';
import { Skill } from '../types';
import { SKILL_LEVEL_METADATA } from '../constants/matchingData';
import { Trash2, Info, Clock, Code } from 'lucide-react';
import LevelTooltip from './LevelTooltip';
import SkillIcon from './SkillIcon';

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
    <div className="bg-surface rounded-2xl border border-border p-6 transition-all hover:shadow-md hover:border-accent-coral-light group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <SkillIcon skillName={skill.name} size={32} />
          <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg font-black text-primary border border-border shadow-sm">
            {skill.name}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-accent-coral bg-accent-coral-bg px-2 py-0.5 rounded-full">
            Level {skill.level}: {SKILL_LEVEL_METADATA[skill.level].label}
          </div>
        </div>
        <button 
          onClick={onRemove}
          className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Remove skill"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-8">
        {/* Level Buttons */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Mastery Profile</label>
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
                        ? 'border-accent-coral bg-accent-coral-bg text-accent-coral shadow-lg scale-105 z-10 relative' 
                        : 'border-gray-50 bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-600 hover:border-border hover:bg-white dark:bg-surface'
                    }`}
                  >
                    <span className="text-xl md:text-2xl">{meta.icon}</span>
                    <span className="text-[10px] font-black">{lvl}</span>
                  </button>
                  {hoveredLevel === lvl && <LevelTooltip metadata={meta} />}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-start gap-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-border">
            <Info className="w-4 h-4 text-accent-coral mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted leading-relaxed font-medium">
              <span className="font-black text-primary uppercase tracking-tighter">{SKILL_LEVEL_METADATA[skill.level].label}:</span> {SKILL_LEVEL_METADATA[skill.level].descriptor}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Years Input */}
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center">
              <Clock className="w-3 h-3 mr-1.5" /> Tenure (Years) *
            </label>
            <div className="relative">
              <input 
                type="number"
                min="0"
                step="0.5"
                required
                value={skill.years || ''}
                onChange={(e) => handleYearsChange(parseFloat(e.target.value) || undefined)}
                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-border rounded-2xl text-xl font-black text-primary focus:bg-white dark:bg-surface focus:border-accent-coral outline-none transition-all"
                placeholder="0.0"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Yrs</div>
            </div>
          </div>

          {/* Description / Proof */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center">
              <Code className="w-3 h-3 mr-1.5" /> Technical Proof
            </label>
            <textarea 
              value={skill.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value.slice(0, 200))}
              className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-border rounded-2xl text-sm font-medium focus:bg-white dark:bg-surface focus:border-accent-coral outline-none resize-none h-16 transition-all"
              placeholder="e.g. Architected highly scalable GraphQL gateway for 500k DAU..."
              maxLength={200}
            />
            <div className="flex justify-between mt-2">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold italic">Briefly describe your strongest contribution.</p>
              <div className="text-[10px] font-black text-gray-300 dark:text-gray-600">
                {skill.description?.length || 0}/200
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillLevelSelector;
