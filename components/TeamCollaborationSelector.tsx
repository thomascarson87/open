import React, { useState } from 'react';
import { Users, Building2, GitMerge, MessageSquare, Globe, Clock, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { TeamCollaborationPreferences } from '../types';
import {
  // Fixed: Imported missing or misnamed constants
  TEAM_SIZE_PREF_OPTIONS,
  ORG_SIZE_PREF_OPTIONS,
  COLLABORATION_FREQ_OPTIONS,
  PAIR_PROGRAMMING_OPTIONS,
  TEAM_DISTRIBUTION_OPTIONS
} from '../constants/workStyleData';

interface Props {
  preferences: TeamCollaborationPreferences;
  onChange: (prefs: TeamCollaborationPreferences) => void;
  showDescriptions?: boolean;
}

const OptionSelector: React.FC<any> = ({ label, icon, options, value, onChange, showDescription = true }) => {
  const selectedOption = options.find((o: any) => o.value === value);
  return (
    <div className="space-y-3">
      <label className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">
        {icon} <span className="ml-2">{label}</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((option: any) => (
          <button key={option.value} type="button" onClick={() => onChange(option.value)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${value === option.value ? 'border-green-600 bg-green-50 text-green-900' : 'border-border bg-white dark:bg-surface text-muted hover:border-gray-300 dark:border-gray-700'}`}>
            <div className="flex items-center gap-2">
              {option.icon && <span className="text-lg">{option.icon}</span>}
              <span className="font-bold text-sm">{option.label}</span>
            </div>
          </button>
        ))}
      </div>
      {showDescription && selectedOption && (
        <div className="flex items-start gap-2 bg-green-50/50 p-3 rounded-lg border border-green-100/50">
          <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-green-800">{selectedOption.description}</p>
        </div>
      )}
    </div>
  );
};

const TeamCollaborationSelector: React.FC<Props> = ({ preferences, onChange, showDescriptions = true }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ structure: true, collab: false });
  const toggle = (s: string) => setExpanded(p => ({ ...p, [s]: !p[s] }));
  const update = (k: keyof TeamCollaborationPreferences, v: any) => onChange({ ...preferences, [k]: v });

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-2xl overflow-hidden">
        <button type="button" onClick={() => toggle('structure')} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800">
          <div className="flex items-center gap-3"><Building2 className="w-5 h-5 text-accent-green" /><span className="font-bold">Team Structure</span></div>
          {expanded.structure ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expanded.structure && (
          <div className="p-6 space-y-8 border-t border-border">
            {/* Fixed: Option constant names updated */}
            <OptionSelector label="Team Size" icon={<Users className="w-4 h-4" />} options={TEAM_SIZE_PREF_OPTIONS} value={preferences.teamSizePreference} onChange={(v: any) => update('teamSizePreference', v)} />
            <OptionSelector label="Org Size" icon={<Building2 className="w-4 h-4" />} options={ORG_SIZE_PREF_OPTIONS} value={preferences.orgSizePreference} onChange={(v: any) => update('orgSizePreference', v)} />
          </div>
        )}
      </div>
      <div className="border border-border rounded-2xl overflow-hidden">
        <button type="button" onClick={() => toggle('collab')} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800">
          <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-accent-green" /><span className="font-bold">Collaboration</span></div>
          {expanded.collab ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {expanded.collab && (
          <div className="p-6 space-y-8 border-t border-border">
            {/* Fixed: Option constant name updated */}
            <OptionSelector label="Sync Frequency" icon={<Clock className="w-4 h-4" />} options={COLLABORATION_FREQ_OPTIONS} value={preferences.collaborationFrequency} onChange={(v: any) => update('collaborationFrequency', v)} />
            <OptionSelector label="Pair Programming" icon={<Users className="w-4 h-4" />} options={PAIR_PROGRAMMING_OPTIONS} value={preferences.pairProgramming} onChange={(v: any) => update('pairProgramming', v)} />
          </div>
        )}
      </div>
    </div>
  );
};
export default TeamCollaborationSelector;
