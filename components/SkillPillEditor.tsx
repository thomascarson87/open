import React, { useState, useRef, useEffect } from 'react';
import { JobSkill } from '../types';
import { SKILL_LEVEL_METADATA } from '../constants/matchingData';
import { X } from 'lucide-react';
import SkillIcon from './SkillIcon';

interface SkillPillEditorProps {
  skills: JobSkill[];
  onUpdateSkill: (index: number, updated: JobSkill) => void;
  onRemoveSkill: (index: number) => void;
}

interface SkillPopoverProps {
  skill: JobSkill;
  onUpdate: (updated: JobSkill) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

const SkillPopover: React.FC<SkillPopoverProps> = ({ skill, onUpdate, onClose, anchorRef }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, anchorRef]);

  const handleLevelChange = (level: 1 | 2 | 3 | 4 | 5) => {
    onUpdate({ ...skill, required_level: level });
  };

  const handleWeightChange = (weight: 'required' | 'preferred') => {
    onUpdate({ ...skill, weight });
  };

  const handleYearsChange = (years: number | undefined) => {
    onUpdate({ ...skill, minimumYears: years });
  };

  return (
    <div
      ref={popoverRef}
      className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-50 min-w-[280px]"
    >
      {/* Skill name header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <div className="flex items-center gap-2">
          <SkillIcon skillName={skill.name} size={20} showFallback={false} />
          <span className="font-bold text-gray-900">{skill.name}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Level selector - horizontal */}
      <div className="mb-3">
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">
          Level
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const meta = SKILL_LEVEL_METADATA[lvl];
            const isSelected = skill.required_level === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleLevelChange(lvl as 1 | 2 | 3 | 4 | 5)}
                className={`flex-1 py-2 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={meta.label}
              >
                <span className="text-sm font-bold">{lvl}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          {SKILL_LEVEL_METADATA[skill.required_level].label}: {SKILL_LEVEL_METADATA[skill.required_level].descriptor}
        </p>
      </div>

      {/* Years + Weight row */}
      <div className="flex gap-3">
        {/* Min years dropdown */}
        <div className="flex-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
            Min Years
          </label>
          <select
            value={skill.minimumYears || ''}
            onChange={(e) => handleYearsChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full p-2 text-sm font-bold border rounded-lg bg-white"
          >
            <option value="">Any</option>
            <option value="0.5">0.5+</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="5">5+</option>
            <option value="7">7+</option>
            <option value="10">10+</option>
          </select>
        </div>

        {/* Required/Preferred toggle */}
        <div className="flex-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
            Priority
          </label>
          <div className="flex rounded-lg overflow-hidden border">
            <button
              type="button"
              onClick={() => handleWeightChange('required')}
              className={`flex-1 py-2 text-xs font-bold transition-all ${
                skill.weight === 'required'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              Required
            </button>
            <button
              type="button"
              onClick={() => handleWeightChange('preferred')}
              className={`flex-1 py-2 text-xs font-bold transition-all ${
                skill.weight === 'preferred'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-400 hover:bg-gray-50'
              }`}
            >
              Preferred
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SkillPillProps {
  skill: JobSkill;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (updated: JobSkill) => void;
  onRemove: () => void;
}

const SkillPill: React.FC<SkillPillProps> = ({
  skill,
  isOpen,
  onToggle,
  onUpdate,
  onRemove,
}) => {
  const pillRef = useRef<HTMLDivElement>(null);

  const isRequired = skill.weight === 'required';
  const yearsDisplay = skill.minimumYears ? `${skill.minimumYears}y` : '—';

  return (
    <div className="relative" ref={pillRef}>
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all h-9 ${
          isRequired
            ? 'bg-red-50 border-red-200 hover:border-red-300'
            : 'bg-blue-50 border-blue-200 hover:border-blue-300'
        } ${isOpen ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
        onClick={onToggle}
      >
        {/* Skill icon */}
        <SkillIcon skillName={skill.name} size={18} showFallback={false} />

        {/* Skill name */}
        <span className="font-bold text-gray-800 text-sm whitespace-nowrap">{skill.name}</span>

        {/* Level badge */}
        <span
          className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded text-[11px] font-black ${
            isRequired
              ? 'bg-red-200 text-red-700'
              : 'bg-blue-200 text-blue-700'
          }`}
        >
          {skill.required_level}
        </span>

        {/* Years indicator */}
        <span className={`text-xs font-medium ${skill.minimumYears ? 'text-gray-600' : 'text-gray-400'}`}>
          {yearsDisplay}
        </span>

        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popover */}
      {isOpen && (
        <SkillPopover
          skill={skill}
          onUpdate={onUpdate}
          onClose={onToggle}
          anchorRef={pillRef as React.RefObject<HTMLElement>}
        />
      )}
    </div>
  );
};

const SkillPillEditor: React.FC<SkillPillEditorProps> = ({
  skills,
  onUpdateSkill,
  onRemoveSkill,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (skills.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 border-2 border-dashed rounded-2xl">
        <p className="font-bold">No skills added yet</p>
        <p className="text-sm">Use the search above to add skills</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <SkillPill
          key={skill.name}
          skill={skill}
          index={index}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
          onUpdate={(updated) => onUpdateSkill(index, updated)}
          onRemove={() => onRemoveSkill(index)}
        />
      ))}
    </div>
  );
};

export default SkillPillEditor;
