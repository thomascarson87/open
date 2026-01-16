import React, { useState } from 'react';
import { Clock, Zap, Target, Brain, Users, GitBranch, AlertTriangle, Sparkles, Shuffle, TrendingUp, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { WorkStylePreferences } from '../types';
import {
  WORK_HOURS_OPTIONS,
  WORK_INTENSITY_OPTIONS,
  PROJECT_DURATION_OPTIONS,
  CONTEXT_SWITCHING_OPTIONS,
  AUTONOMY_LEVEL_OPTIONS,
  DECISION_MAKING_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  INNOVATION_STABILITY_OPTIONS,
  AMBIGUITY_TOLERANCE_OPTIONS,
  CHANGE_FREQUENCY_OPTIONS
} from '../constants/workStyleData';

interface Props {
  preferences: WorkStylePreferences;
  onChange: (prefs: WorkStylePreferences) => void;
  showDescriptions?: boolean;
}

const OptionSelector: React.FC<any> = ({ label, icon, options, value, onChange, showDescription = true }) => {
  const selectedOption = options.find((o: any) => o.value === value);
  return (
    <div className="space-y-3">
      <label className="flex items-center text-sm font-bold text-gray-700">
        {icon} <span className="ml-2">{label}</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {options.map((option: any) => (
          <button key={option.value} type="button" onClick={() => onChange(option.value)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${value === option.value ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}`}>
            <div className="flex items-center gap-2">
              {option.icon && <span className="text-lg">{option.icon}</span>}
              <span className="font-bold text-sm">{option.label}</span>
            </div>
          </button>
        ))}
      </div>
      {showDescription && selectedOption && (
        <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">{selectedOption.description}</p>
        </div>
      )}
    </div>
  );
};

const WorkStyleSelector: React.FC<Props> = ({ preferences, onChange, showDescriptions = true }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ schedule: true, autonomy: false, risk: false });
  const toggle = (s: string) => setExpanded(p => ({ ...p, [s]: !p[s] }));
  const update = (k: keyof WorkStylePreferences, v: any) => onChange({ ...preferences, [k]: v });

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button type="button" onClick={() => toggle('schedule')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
          <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-600" /><span className="font-bold">Schedule & Pace</span></div>
          {expanded.schedule ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expanded.schedule && (
          <div className="p-6 space-y-8 border-t border-gray-100">
            <OptionSelector label="Work Hours" icon={<Clock className="w-4 h-4" />} options={WORK_HOURS_OPTIONS} value={preferences.workHours} onChange={(v: any) => update('workHours', v)} />
            <OptionSelector label="Intensity" icon={<Zap className="w-4 h-4" />} options={WORK_INTENSITY_OPTIONS} value={preferences.workIntensity} onChange={(v: any) => update('workIntensity', v)} />
          </div>
        )}
      </div>
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <button type="button" onClick={() => toggle('autonomy')} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
          <div className="flex items-center gap-3"><Brain className="w-5 h-5 text-purple-600" /><span className="font-bold">Autonomy</span></div>
          {expanded.autonomy ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expanded.autonomy && (
          <div className="p-6 space-y-8 border-t border-gray-100">
            <OptionSelector label="Autonomy Level" icon={<Users className="w-4 h-4" />} options={AUTONOMY_LEVEL_OPTIONS} value={preferences.autonomyLevel} onChange={(v: any) => update('autonomyLevel', v)} />
          </div>
        )}
      </div>
    </div>
  );
};
export default WorkStyleSelector;