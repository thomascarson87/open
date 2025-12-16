
import React, { useState } from 'react';
import { Skill, SkillLevelMetadata } from '../types';
import { SKILLS_LIST, SKILL_LEVEL_METADATA } from '../constants/matchingData';
import { Info, Plus, Trash2, ChevronDown, Check } from 'lucide-react';

interface Props {
  skill: Skill;
  onChange: (updatedSkill: Skill) => void;
  onRemove: () => void;
  isNew?: boolean;
}

const SkillLevelSelector: React.FC<Props> = ({ skill, onChange, onRemove, isNew }) => {
  const [showDescription, setShowDescription] = useState(false);
  const [skillInput, setSkillInput] = useState(skill.name);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const flatSkills = Object.values(SKILLS_LIST).flat();
  const suggestions = flatSkills.filter(s => 
    s.toLowerCase().includes(skillInput.toLowerCase()) && 
    skillInput.length > 0 && 
    s !== skillInput
  ).slice(0, 5);

  const handleLevelChange = (level: 1 | 2 | 3 | 4 | 5) => {
    onChange({ ...skill, level });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value.slice(0, 200);
    onChange({ ...skill, description: text });
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 transition-all hover:shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        
        {/* Skill Name Input */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => {
                setSkillInput(e.target.value);
                setShowSuggestions(true);
            }}
            onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => {
                    if (skillInput.trim().length > 0) {
                        onChange({ ...skill, name: skillInput.trim() });
                    } else {
                        setSkillInput(skill.name); // Revert if empty
                    }
                    setShowSuggestions(false);
                }, 200);
            }}
            className="w-full p-2 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Skill Name (e.g. React)"
          />
          {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((s) => (
                      <div 
                        key={s} 
                        className="p-2 hover:bg-gray-50 cursor-pointer text-sm"
                        onClick={() => {
                            setSkillInput(s);
                            onChange({ ...skill, name: s });
                            setShowSuggestions(false);
                        }}
                      >
                          {s}
                      </div>
                  ))}
              </div>
          )}
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const meta = SKILL_LEVEL_METADATA[lvl as number];
            const isSelected = skill.level === lvl;
            return (
              <div key={lvl} className="relative group">
                <button
                  onClick={() => handleLevelChange(lvl as any)}
                  className={`w-10 h-10 flex flex-col items-center justify-center rounded-md transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-sm scale-105' 
                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className="text-sm">{meta.icon}</span>
                  <span className="text-[10px] font-bold">{lvl}</span>
                </button>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                  <div className="font-bold text-sm mb-1 flex items-center">
                      {meta.icon} {meta.label}
                  </div>
                  <div className="text-gray-300 italic mb-2">"{meta.descriptor}"</div>
                  <ul className="list-disc list-inside space-y-1 mb-2 text-gray-300">
                      {meta.behaviors.slice(0, 2).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                  <div className="border-t border-gray-700 pt-1 mt-1 text-gray-400">
                      Ex: {meta.example}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action / Years */}
        <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-1">
                <span className="text-xs text-gray-400 mr-2 uppercase font-bold">Yrs</span>
                <input 
                    type="number"
                    min="0"
                    step="0.5"
                    value={skill.years || ''}
                    onChange={(e) => onChange({ ...skill, years: parseFloat(e.target.value) })}
                    className="w-12 text-center text-sm font-bold outline-none"
                    placeholder="0"
                />
            </div>
            <button 
                onClick={onRemove}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Selected Level Info */}
      <div className="mb-4 bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex items-start gap-3">
          <div className="mt-0.5"><Info className="w-4 h-4 text-blue-500" /></div>
          <div className="flex-1 text-sm text-blue-900">
              <span className="font-bold">{SKILL_LEVEL_METADATA[skill.level].label}: </span>
              {SKILL_LEVEL_METADATA[skill.level].descriptor}
          </div>
      </div>

      {/* Description */}
      <div>
          <textarea
            value={skill.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Optional: Proof of expertise (e.g. Built 5 production apps serving 100K+ users...)"
            className="w-full p-3 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 outline-none resize-none h-20"
          />
          <div className="text-right text-xs text-gray-400 mt-1">
              {(skill.description?.length || 0)}/200
          </div>
      </div>
    </div>
  );
};

export default SkillLevelSelector;
