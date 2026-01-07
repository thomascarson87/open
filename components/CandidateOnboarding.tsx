
import React, { useState } from 'react';
import { 
  CandidateProfile, WorkMode, JobType, Skill, SeniorityLevel, LanguageEntry 
} from '../types';
import { 
  ArrowRight, ArrowLeft, CheckCircle, User, Zap, GraduationCap, 
  Briefcase, DollarSign, Heart, Smile, Building, TrendingUp, Sparkles, MapPin, Clock, Users, Globe, X, Plus, Loader2
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import SkillLevelSelector from './SkillLevelSelector';
import ImpactScopeSelector from './ImpactScopeSelector';
import ProfileReviewCard from './ProfileReviewCard';
import { 
  CULTURAL_VALUES, 
  INDUSTRIES, 
  PERKS_CATEGORIES, 
  CHARACTER_TRAITS_CATEGORIES,
  SKILLS_LIST
} from '../constants/matchingData';
import { 
  WORK_HOURS_OPTIONS, 
  WORK_INTENSITY_OPTIONS, 
  AUTONOMY_LEVEL_OPTIONS,
  TEAM_SIZE_PREF_OPTIONS,
  TEAM_DISTRIBUTION_OPTIONS,
  TIMEZONE_OVERLAP_OPTIONS,
  TIMEZONE_OPTIONS,
  LANGUAGE_OPTIONS,
  LANGUAGE_PROFICIENCY_OPTIONS
} from '../constants/workStyleData';

interface Props {
  profile: CandidateProfile;
  onUpdate: (data: Partial<CandidateProfile>) => void;
  onComplete: () => void;
  isSaving?: boolean;
}

const STEPS = [
  { id: 'basics', title: 'The Basics', icon: User, required: true },
  { id: 'experience', title: 'Experience Level', icon: TrendingUp, required: true },
  { id: 'skills', title: 'Skills & Expertise', icon: Zap, required: true },
  { id: 'workstyle', title: 'Work Style', icon: Clock, required: false },
  { id: 'teamprefs', title: 'Team Environment', icon: Users, required: false },
  { id: 'preferences', title: 'Logistics', icon: Briefcase, required: true },
  { id: 'compensation', title: 'Compensation', icon: DollarSign, required: true },
  { id: 'review', title: 'Review & Complete', icon: CheckCircle, required: true },
];

const LanguageSelector: React.FC<{ languages: LanguageEntry[], onChange: (l: LanguageEntry[]) => void }> = ({ languages, onChange }) => {
  return (
    <div className="space-y-3">
      {languages.map((lang, idx) => (
        <div key={idx} className="flex gap-3 items-center">
          <select value={lang.language} onChange={e => { const nl = [...languages]; nl[idx].language = e.target.value; onChange(nl); }} className="flex-1 p-3 border border-gray-200 rounded-lg bg-white">
            <option value="">Select language...</option>
            {LANGUAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select value={lang.proficiency} onChange={e => { const nl = [...languages]; nl[idx].proficiency = e.target.value as any; onChange(nl); }} className="w-40 p-3 border border-gray-200 rounded-lg bg-white">
            {LANGUAGE_PROFICIENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button type="button" onClick={() => onChange(languages.filter((_, i) => i !== idx))} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...languages, { language: '', proficiency: 'professional' }])} className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:text-blue-700"><Plus className="w-4 h-4" /> Add Language</button>
    </div>
  );
};

const CandidateOnboarding: React.FC<Props> = ({ profile, onUpdate, onComplete, isSaving }) => {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx];

  const handleNext = () => {
    if (idx < STEPS.length - 1) setIdx(idx + 1);
    else onComplete();
    window.scrollTo(0,0);
  };

  const renderContent = () => {
    switch (step.id) {
      case 'basics': return (
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">The Basics</h2><p className="text-gray-500">Help us understand the professional behind the code.</p></div>
          <div className="space-y-6">
            <input value={profile.name} onChange={e => onUpdate({ name: e.target.value })} className="w-full p-4 border border-gray-200 rounded-2xl font-bold" placeholder="Full Name" />
            <input value={profile.headline} onChange={e => onUpdate({ headline: e.target.value })} className="w-full p-4 border border-gray-200 rounded-2xl font-bold" placeholder="Headline" />
            <textarea value={profile.bio} onChange={e => onUpdate({ bio: e.target.value })} rows={4} className="w-full p-4 border border-gray-200 rounded-2xl" placeholder="Bio..." />
          </div>
        </div>
      );
      case 'experience': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Experience</h2></div>
          <div className="bg-gray-900 text-white p-8 rounded-3xl">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Total Experience (Years)</label>
            <input type="range" min="0" max="25" step="0.5" value={profile.totalYearsExperience || 0} onChange={e => onUpdate({ totalYearsExperience: parseFloat(e.target.value) })} className="w-full accent-blue-500" />
            <div className="text-2xl font-black mt-4">{profile.totalYearsExperience || 0} Years</div>
          </div>
          <ImpactScopeSelector currentScope={profile.currentImpactScope} desiredScopes={profile.desiredImpactScopes} onChangeCurrent={s => onUpdate({ currentImpactScope: s })} onChangeDesired={s => onUpdate({ desiredImpactScopes: s })} />
        </div>
      );
      case 'skills': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Skills</h2></div>
          <GroupedMultiSelect label="Core Skills" options={SKILLS_LIST} selected={profile.skills?.map(s => s.name) || []} onChange={names => onUpdate({ skills: names.map(n => profile.skills.find(s => s.name === n) || { name: n, level: 3 }) })} grouped={true} searchable={true} />
          {profile.skills?.map((s, i) => <SkillLevelSelector key={s.name} skill={s} onUpdate={u => { const ns = [...profile.skills]; ns[i] = { ...s, ...u }; onUpdate({ skills: ns }); }} onRemove={() => onUpdate({ skills: profile.skills.filter(x => x.name !== s.name) })} />)}
        </div>
      );
      case 'workstyle': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Work Style</h2><p className="text-gray-500">How do you work best? (Optional but helps matching)</p></div>
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center"><Globe className="w-5 h-5 mr-2 text-blue-500"/> Timezone & Languages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Timezone</label>
                        <select value={profile.timezone || ''} onChange={e => onUpdate({ timezone: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-white">
                            <option value="">Select timezone...</option>
                            {TIMEZONE_OPTIONS.map(tz => <option key={tz.value} value={tz.value}>{tz.label} ({tz.offset})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Languages</label>
                        <LanguageSelector languages={profile.languages || []} onChange={l => onUpdate({ languages: l })} />
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold mb-4">Pace & Autonomy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Work Intensity</label>
                        <div className="flex flex-wrap gap-2">
                            {WORK_INTENSITY_OPTIONS.map(opt => <button key={opt.value} onClick={() => onUpdate({ workStylePreferences: { ...profile.workStylePreferences, workIntensity: opt.value } })} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${profile.workStylePreferences?.workIntensity === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>{opt.label}</button>)}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Autonomy Level</label>
                        <div className="flex flex-wrap gap-2">
                            {AUTONOMY_LEVEL_OPTIONS.map(opt => <button key={opt.value} onClick={() => onUpdate({ workStylePreferences: { ...profile.workStylePreferences, autonomyLevel: opt.value } })} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${profile.workStylePreferences?.autonomyLevel === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>{opt.label}</button>)}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      );
      case 'teamprefs': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Team Environment</h2><p className="text-gray-500">What kind of team helps you thrive?</p></div>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Team Distribution</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TEAM_DISTRIBUTION_OPTIONS.map(opt => <button key={opt.value} onClick={() => onUpdate({ teamCollaborationPreferences: { ...profile.teamCollaborationPreferences, teamDistribution: opt.value } })} className={`p-4 rounded-xl border-2 text-left transition-all ${profile.teamCollaborationPreferences?.teamDistribution === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}><div className="font-bold text-sm">{opt.label}</div><div className="text-xs text-gray-500">{opt.description}</div></button>)}
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-4">Timezone Overlap Requirement</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TIMEZONE_OVERLAP_OPTIONS.map(opt => <button key={opt.value} onClick={() => onUpdate({ teamCollaborationPreferences: { ...profile.teamCollaborationPreferences, timezoneOverlap: opt.value } })} className={`p-3 rounded-xl border-2 text-center transition-all ${profile.teamCollaborationPreferences?.timezoneOverlap === opt.value ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-gray-300'}`}><div className="font-bold text-xs">{opt.label}</div></button>)}
                </div>
            </div>
          </div>
        </div>
      );
      case 'preferences': return (
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Logistics</h2></div>
          <input value={profile.location} onChange={e => onUpdate({ location: e.target.value })} className="w-full p-4 border border-gray-200 rounded-2xl font-bold" placeholder="Location" />
          <div className="flex gap-2">
            {Object.values(WorkMode).map(m => <button key={m} onClick={() => onUpdate({ preferredWorkMode: (profile.preferredWorkMode||[]).includes(m) ? profile.preferredWorkMode.filter(x => x !== m) : [...(profile.preferredWorkMode||[]), m] })} className={`px-4 py-2 rounded-xl border font-bold ${profile.preferredWorkMode?.includes(m) ? 'bg-blue-600 text-white' : 'bg-white'}`}>{m}</button>)}
          </div>
        </div>
      );
      case 'compensation': return (
        <div className="space-y-8 max-w-lg mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Compensation</h2></div>
          <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-100">
            <input type="number" value={profile.salaryMin || ''} onChange={e => onUpdate({ salaryMin: parseInt(e.target.value) })} className="w-full p-4 rounded-xl text-3xl font-black text-green-900 text-center" placeholder="Min Annual Salary" />
            <select value={profile.noticePeriod} onChange={e => onUpdate({ noticePeriod: e.target.value })} className="w-full mt-4 p-4 rounded-xl border border-gray-200 font-bold"><option value="">Notice Period</option>{['Immediate', '2 Weeks', '1 Month'].map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
        </div>
      );
      case 'review': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Review</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <ProfileReviewCard title="Basics" icon={User} completionPercent={100} summary={profile.name} onEdit={() => setIdx(0)} />
             <ProfileReviewCard title="Skills" icon={Zap} completionPercent={100} summary={`${profile.skills?.length} skills`} onEdit={() => setIdx(2)} />
             <ProfileReviewCard title="Work Style" icon={Clock} completionPercent={Object.keys(profile.workStylePreferences || {}).length > 0 ? 100 : 0} summary={`${Object.keys(profile.workStylePreferences || {}).length}/10 set`} onEdit={() => setIdx(3)} />
             <ProfileReviewCard title="Team Prefs" icon={Users} completionPercent={Object.keys(profile.teamCollaborationPreferences || {}).length > 0 ? 100 : 0} summary="Configured" onEdit={() => setIdx(4)} />
          </div>
          <button 
            onClick={onComplete} 
            disabled={isSaving}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSaving ? <><Loader2 className="w-6 h-6 animate-spin" /> Saving...</> : 'Go Live'}
          </button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-50">
        <div className="font-black text-xl">OPEN</div>
        <div className="text-xs font-bold text-gray-400 uppercase">Step {idx + 1} of {STEPS.length}</div>
      </div>
      <div className="flex-1 py-12 px-4">{renderContent()}</div>
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-between items-center z-50">
        <button onClick={() => idx > 0 && setIdx(idx - 1)} className={`font-bold ${idx === 0 ? 'opacity-0' : ''}`}>Back</button>
        <button 
          onClick={handleNext} 
          disabled={isSaving}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold flex items-center disabled:opacity-70 transition-opacity"
        >
          {step.id === 'review' && isSaving ? 'Completing...' : 'Continue'} <ArrowRight className="ml-2 w-4 h-4"/>
        </button>
      </div>
    </div>
  );
};
export default CandidateOnboarding;
