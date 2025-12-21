import React, { useState } from 'react';
import { 
  CandidateProfile, WorkMode, JobType, Skill, SeniorityLevel 
} from '../types';
import { 
  ArrowRight, ArrowLeft, CheckCircle, User, Zap, GraduationCap, 
  Briefcase, DollarSign, Heart, Smile, Building, TrendingUp, Sparkles, MapPin, Clock, Users
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import SkillLevelSelector from './SkillLevelSelector';
import ImpactScopeSelector from './ImpactScopeSelector';
import ProfileReviewCard from './ProfileReviewCard';
import WorkStyleSelector from './WorkStyleSelector';
import TeamCollaborationSelector from './TeamCollaborationSelector';
import { 
  CULTURAL_VALUES, 
  INDUSTRIES, 
  PERKS_CATEGORIES, 
  CHARACTER_TRAITS_CATEGORIES,
  SKILLS_LIST
} from '../constants/matchingData';
import { EDUCATION_LEVELS, EDUCATION_FIELDS } from '../constants/educationData';
import { COMPANY_SIZE_RANGES, COMPANY_SIZE_DESCRIPTIONS } from '../constants/companyData';

interface Props {
  profile: CandidateProfile;
  onUpdate: (data: Partial<CandidateProfile>) => void;
  onComplete: () => void;
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

const NonNegotiableToggle = ({ fieldName, isChecked, onToggle }: any) => (
  <div className="flex items-center gap-3 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
    <button type="button" onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isChecked ? 'bg-red-500' : 'bg-blue-500'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
    <span className={`text-sm font-bold ${isChecked ? 'text-red-700' : 'text-blue-700'}`}>{isChecked ? '🔒 Non-negotiable' : '✨ Flexible'}</span>
  </div>
);

const CandidateOnboarding: React.FC<Props> = ({ profile, onUpdate, onComplete }) => {
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
          <ImpactScopeSelector selected={profile.desiredImpactScopes || []} onChange={scopes => onUpdate({ desiredImpactScopes: scopes })} />
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
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Work Style</h2><p className="text-gray-500">How do you work best?</p></div>
          <WorkStyleSelector preferences={profile.workStylePreferences || {}} onChange={p => onUpdate({ workStylePreferences: p })} />
        </div>
      );
      case 'teamprefs': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Team Environment</h2><p className="text-gray-500">What kind of team helps you thrive?</p></div>
          <TeamCollaborationSelector preferences={profile.teamCollaborationPreferences || {}} onChange={p => onUpdate({ teamCollaborationPreferences: p })} />
        </div>
      );
      case 'preferences': return (
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Logistics</h2></div>
          <input value={profile.location} onChange={e => onUpdate({ location: e.target.value })} className="w-full p-4 border border-gray-200 rounded-2xl" placeholder="Location" />
          <div className="flex gap-2">
            {Object.values(WorkMode).map(m => <button key={m} onClick={() => onUpdate({ preferredWorkMode: (profile.preferredWorkMode||[]).includes(m) ? profile.preferredWorkMode.filter(x => x !== m) : [...(profile.preferredWorkMode||[]), m] })} className={`px-4 py-2 rounded-xl border ${profile.preferredWorkMode?.includes(m) ? 'bg-blue-600 text-white' : 'bg-white'}`}>{m}</button>)}
          </div>
        </div>
      );
      case 'compensation': return (
        <div className="space-y-8 max-w-lg mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Compensation</h2></div>
          <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-100">
            <input type="number" value={profile.salaryMin || ''} onChange={e => onUpdate({ salaryMin: parseInt(e.target.value) })} className="w-full p-4 rounded-xl text-3xl font-black text-green-900 text-center" placeholder="Min Annual Salary" />
            <select value={profile.noticePeriod} onChange={e => onUpdate({ noticePeriod: e.target.value })} className="w-full mt-4 p-4 rounded-xl border border-gray-200"><option value="">Notice Period</option>{['Immediate', '2 Weeks', '1 Month'].map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
        </div>
      );
      case 'review': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center"><h2 className="text-4xl font-black text-gray-900 mb-2">Review</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <ProfileReviewCard title="Basics" icon={User} completionPercent={100} summary={profile.name} onEdit={() => setIdx(0)} />
             <ProfileReviewCard title="Skills" icon={Zap} completionPercent={100} summary={`${profile.skills?.length} skills`} onEdit={() => setIdx(2)} />
             <ProfileReviewCard title="Work Style" icon={Clock} completionPercent={profile.workStylePreferences ? 100 : 0} summary="Optimized" onEdit={() => setIdx(3)} />
          </div>
          <button onClick={onComplete} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl">Go Live</button>
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
        <button onClick={handleNext} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold flex items-center">Continue <ArrowRight className="ml-2 w-4 h-4"/></button>
      </div>
    </div>
  );
};
export default CandidateOnboarding;
