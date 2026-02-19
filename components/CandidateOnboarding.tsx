
import React, { useState } from 'react';
import { CandidateProfile, WorkMode, Skill } from '../types';
import {
  ArrowRight, ArrowLeft, CheckCircle, User, Zap,
  Briefcase, DollarSign, Heart, Smile, TrendingUp, MapPin, Clock, Users, Globe, Loader2
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import SkillLevelSelector from './SkillLevelSelector';
import ImpactScopeSelector from './ImpactScopeSelector';
import ProfileReviewCard from './ProfileReviewCard';
import {
  CULTURAL_VALUES,
  CHARACTER_TRAITS_CATEGORIES,
  SKILLS_LIST
} from '../constants/matchingData';
import {
  WORK_INTENSITY_OPTIONS,
  AUTONOMY_LEVEL_OPTIONS,
  TEAM_DISTRIBUTION_OPTIONS,
  TIMEZONE_OVERLAP_OPTIONS,
  TIMEZONE_OPTIONS
} from '../constants/workStyleData';

interface Props {
  profile: CandidateProfile;
  onUpdate: (data: Partial<CandidateProfile>) => void;
  onComplete: () => void;
  onSaveExit?: () => void;  // Optional save & exit handler
  isSaving?: boolean;
}

const STEPS = [
  { id: 'basics', title: 'The Basics', icon: User, required: true },
  { id: 'skills', title: 'Skills & Expertise', icon: Zap, required: true },
  { id: 'experience', title: 'Impact Level', icon: TrendingUp, required: true },
  { id: 'culture', title: 'Culture & Dynamics', icon: Heart, required: false },
  { id: 'preferences', title: 'Logistics', icon: Briefcase, required: true },
  { id: 'compensation', title: 'Compensation', icon: DollarSign, required: true },
  { id: 'review', title: 'Review & Complete', icon: CheckCircle, required: true },
];

const CandidateOnboarding: React.FC<Props> = ({ profile, onUpdate, onComplete, onSaveExit, isSaving }) => {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx];

  // Validation: Check minimum required fields for save
  // Minimum to save: just name + location (Stage 1)
  const getValidationStatus = () => {
    const issues: string[] = [];

    // Minimum requirements: name + location
    if (!profile.name || profile.name.trim().length < 2) {
      issues.push('Name (min 2 characters)');
    }
    if (!profile.location || profile.location.trim().length < 2) {
      issues.push('Location');
    }

    // Track additional completion for display (not required for save)
    const hasSkills = profile.skills && profile.skills.length >= 3;
    const hasImpactScope = !!profile.currentImpactScope;

    return {
      canSave: issues.length === 0,  // Just need name + location to save
      issues,
      completedCount: (issues.length === 0 ? 2 : 2 - issues.length) + (hasSkills ? 1 : 0) + (hasImpactScope ? 1 : 0),
      totalRequired: 2,  // Only name + location required
      totalOptional: 4   // Full completion includes skills + impact
    };
  };

  const validation = getValidationStatus();

  const handleNext = () => {
    if (idx < STEPS.length - 1) setIdx(idx + 1);
    else onComplete();
    window.scrollTo(0,0);
  };

  const handleSaveExit = () => {
    if (validation.canSave && onSaveExit) {
      onSaveExit();
    }
  };

  const renderContent = () => {
    switch (step.id) {
      case 'basics': return (
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="text-center"><h2 className="font-heading text-4xl text-primary mb-2">The Basics</h2><p className="text-muted">Help us understand the professional behind the code.</p></div>
          <div className="space-y-6">
            {/* Name - Required */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                value={profile.name}
                onChange={e => onUpdate({ name: e.target.value })}
                className={`w-full p-4 border rounded-2xl font-bold transition-colors ${
                  !profile.name || profile.name.trim().length < 2
                    ? 'border-border focus:border-accent-coral'
                    : 'border-green-300 bg-green-50/30'
                }`}
                placeholder="Your full name"
              />
              {profile.name && profile.name.trim().length < 2 && (
                <p className="text-xs text-amber-600 mt-1">Name must be at least 2 characters</p>
              )}
            </div>

            {/* Location - Required */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  value={profile.location}
                  onChange={e => onUpdate({ location: e.target.value })}
                  className={`w-full p-4 pl-12 border rounded-2xl font-bold transition-colors ${
                    !profile.location || profile.location.trim().length < 2
                      ? 'border-border focus:border-accent-coral'
                      : 'border-green-300 bg-green-50/30'
                  }`}
                  placeholder="City, Country (e.g., San Francisco, USA)"
                />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">
                <Globe className="w-4 h-4 inline mr-1" /> Timezone
              </label>
              <select
                value={profile.timezone || ''}
                onChange={e => onUpdate({ timezone: e.target.value })}
                className="w-full p-4 border border-border rounded-2xl font-bold bg-white dark:bg-surface"
              >
                <option value="">Select timezone...</option>
                {TIMEZONE_OPTIONS.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label} ({tz.offset})</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Important for remote work matching</p>
            </div>

            {/* Headline - Optional */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Headline</label>
              <input value={profile.headline} onChange={e => onUpdate({ headline: e.target.value })} className="w-full p-4 border border-border rounded-2xl font-bold" placeholder="e.g., Senior Full-Stack Engineer" />
            </div>

            {/* Bio - Optional */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Bio</label>
              <textarea value={profile.bio} onChange={e => onUpdate({ bio: e.target.value })} rows={4} className="w-full p-4 border border-border rounded-2xl" placeholder="Tell us about yourself..." />
            </div>
          </div>
        </div>
      );
      case 'experience': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="font-heading text-4xl text-primary mb-2">Impact Level</h2>
            <p className="text-muted">What scope of impact do you have, and where do you want to go?</p>
          </div>
          <ImpactScopeSelector currentScope={profile.currentImpactScope} desiredScopes={profile.desiredImpactScopes} onChangeCurrent={s => onUpdate({ currentImpactScope: s })} onChangeDesired={s => onUpdate({ desiredImpactScopes: s })} />
        </div>
      );
      case 'skills': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center"><h2 className="font-heading text-4xl text-primary mb-2">Skills</h2></div>
          <GroupedMultiSelect label="Core Skills" options={SKILLS_LIST} selected={profile.skills?.map(s => s.name) || []} onChange={names => onUpdate({ skills: names.map(n => profile.skills.find(s => s.name === n) || { name: n, level: 3 }) })} grouped={true} searchable={true} />
          {profile.skills?.map((s, i) => <SkillLevelSelector key={s.name} skill={s} onUpdate={u => { const ns = [...profile.skills]; ns[i] = { ...s, ...u }; onUpdate({ skills: ns }); }} onRemove={() => onUpdate({ skills: profile.skills.filter(x => x.name !== s.name) })} />)}
        </div>
      );
      case 'culture': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="font-heading text-4xl text-primary mb-2">Culture & Dynamics</h2>
            <p className="text-muted">What values and work environment help you thrive? (Optional but improves matching)</p>
          </div>

          {/* Cultural Values */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center"><Heart className="w-5 h-5 mr-2 text-pink-500"/> Cultural Values</h3>
            <p className="text-sm text-muted mb-4">Select up to 5 values that resonate with you.</p>
            <GroupedMultiSelect label="" options={CULTURAL_VALUES} selected={profile.values || []} onChange={v => onUpdate({ values: v })} maxSelections={5} />
          </div>

          {/* Work Style */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-accent-coral"/> Work Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Work Intensity</label>
                <div className="flex flex-wrap gap-2">
                  {WORK_INTENSITY_OPTIONS.map(opt => <button key={opt.value} onClick={() => onUpdate({ workStylePreferences: { ...profile.workStylePreferences, workIntensity: opt.value } })} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${profile.workStylePreferences?.workIntensity === opt.value ? 'bg-accent-coral text-white border-accent-coral' : 'bg-white dark:bg-surface text-muted border-border hover:border-gray-400'}`}>{opt.label}</button>)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Autonomy Level</label>
                <div className="flex flex-wrap gap-2">
                  {AUTONOMY_LEVEL_OPTIONS.map(opt => <button key={opt.value} onClick={() => onUpdate({ workStylePreferences: { ...profile.workStylePreferences, autonomyLevel: opt.value } })} className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${profile.workStylePreferences?.autonomyLevel === opt.value ? 'bg-accent-coral text-white border-accent-coral' : 'bg-white dark:bg-surface text-muted border-border hover:border-gray-400'}`}>{opt.label}</button>)}
                </div>
              </div>
            </div>
          </div>

          {/* Team Environment */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-green-500"/> Team Environment</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">Team Distribution</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TEAM_DISTRIBUTION_OPTIONS.map(opt => <button key={opt.value} onClick={() => onUpdate({ teamCollaborationPreferences: { ...profile.teamCollaborationPreferences, teamDistribution: opt.value } })} className={`p-4 rounded-xl border-2 text-left transition-all ${profile.teamCollaborationPreferences?.teamDistribution === opt.value ? 'border-green-600 bg-green-50' : 'border-border hover:border-gray-300 dark:border-gray-700'}`}><div className="font-bold text-sm">{opt.label}</div><div className="text-xs text-muted">{opt.description}</div></button>)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">Timezone Overlap Requirement</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TIMEZONE_OVERLAP_OPTIONS.map(opt => <button key={opt.value} onClick={() => onUpdate({ teamCollaborationPreferences: { ...profile.teamCollaborationPreferences, timezoneOverlap: opt.value } })} className={`p-3 rounded-xl border-2 text-center transition-all ${profile.teamCollaborationPreferences?.timezoneOverlap === opt.value ? 'border-green-600 bg-green-50' : 'border-border hover:border-gray-300 dark:border-gray-700'}`}><div className="font-bold text-xs">{opt.label}</div></button>)}
                </div>
              </div>
            </div>
          </div>

          {/* Character Traits */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center"><Smile className="w-5 h-5 mr-2 text-accent-green"/> Character Traits</h3>
            <p className="text-sm text-muted mb-4">How would colleagues describe you? Select up to 8.</p>
            <GroupedMultiSelect label="" options={CHARACTER_TRAITS_CATEGORIES} selected={profile.characterTraits || []} onChange={v => onUpdate({ characterTraits: v })} grouped={true} maxSelections={8} />
          </div>
        </div>
      );
      case 'preferences': return (
        <div className="space-y-8 max-w-2xl mx-auto">
          <div className="text-center"><h2 className="font-heading text-4xl text-primary mb-2">Logistics</h2><p className="text-muted">How and where do you want to work?</p></div>

          {/* Show current location (editable, pre-filled from basics) */}
          {profile.location && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300 dark:text-gray-600 font-medium">{profile.location}</span>
              <button onClick={() => setIdx(0)} className="ml-auto text-xs text-accent-coral font-bold hover:text-accent-coral">Edit</button>
            </div>
          )}

          {/* Work Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">Preferred Work Mode</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(WorkMode).map(m => (
                <button
                  key={m}
                  onClick={() => onUpdate({ preferredWorkMode: (profile.preferredWorkMode||[]).includes(m) ? profile.preferredWorkMode.filter(x => x !== m) : [...(profile.preferredWorkMode||[]), m] })}
                  className={`px-5 py-3 rounded-xl border-2 font-bold transition-all ${profile.preferredWorkMode?.includes(m) ? 'bg-accent-coral text-white border-accent-coral' : 'bg-white dark:bg-surface border-border hover:border-gray-400'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Select all that apply</p>
          </div>
        </div>
      );
      case 'compensation': return (
        <div className="space-y-8 max-w-lg mx-auto">
          <div className="text-center"><h2 className="font-heading text-4xl text-primary mb-2">Compensation</h2></div>
          <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-100">
            <input type="number" value={profile.salaryMin || ''} onChange={e => onUpdate({ salaryMin: parseInt(e.target.value) })} className="w-full p-4 rounded-xl text-3xl font-black text-green-900 text-center" placeholder="Min Annual Salary" />
            <select value={profile.noticePeriod} onChange={e => onUpdate({ noticePeriod: e.target.value })} className="w-full mt-4 p-4 rounded-xl border border-border font-bold"><option value="">Notice Period</option>{['Immediate', '2 Weeks', '1 Month'].map(o => <option key={o} value={o}>{o}</option>)}</select>
          </div>
        </div>
      );
      case 'review': return (
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center"><h2 className="font-heading text-4xl text-primary mb-2">Review & Complete</h2><p className="text-muted">Make sure everything looks good before going live.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <ProfileReviewCard title="Basics" icon={User} completionPercent={profile.name && profile.location ? 100 : 50} summary={profile.name || 'Not set'} onEdit={() => setIdx(0)} />
             <ProfileReviewCard title="Skills" icon={Zap} completionPercent={profile.skills?.length >= 3 ? 100 : Math.round((profile.skills?.length || 0) / 3 * 100)} summary={`${profile.skills?.length || 0} skills`} onEdit={() => setIdx(1)} />
             <ProfileReviewCard title="Impact" icon={TrendingUp} completionPercent={profile.currentImpactScope ? 100 : 0} summary={profile.currentImpactScope ? `Level ${profile.currentImpactScope}` : 'Not set'} onEdit={() => setIdx(2)} />
             <ProfileReviewCard title="Culture" icon={Heart} completionPercent={(profile.values?.length || 0) > 0 || Object.keys(profile.workStylePreferences || {}).length > 0 ? 100 : 0} summary={`${profile.values?.length || 0} values`} onEdit={() => setIdx(3)} />
          </div>
          <button
            onClick={onComplete}
            disabled={isSaving}
            className="w-full py-4 bg-accent-coral text-white rounded-2xl font-black text-xl shadow-xl hover:bg-accent-coral transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSaving ? <><Loader2 className="w-6 h-6 animate-spin" /> Saving...</> : 'Go Live'}
          </button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 bg-white dark:bg-surface border-b border-border p-4 flex justify-between items-center z-50">
        <div className="font-black text-xl">OPEN</div>
        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Step {idx + 1} of {STEPS.length}</div>
      </div>
      <div className="flex-1 py-12 px-4">{renderContent()}</div>
      <div className="sticky bottom-0 bg-white dark:bg-surface border-t border-border p-4 md:p-6 z-50">
        <div className="flex justify-between items-center gap-4">
          {/* Back Button */}
          <button onClick={() => idx > 0 && setIdx(idx - 1)} className={`font-bold ${idx === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
            <ArrowLeft className="w-4 h-4 inline mr-1" />Back
          </button>

          {/* Center: Save & Exit with validation */}
          {onSaveExit && (
            <div className="flex-1 flex justify-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={handleSaveExit}
                  disabled={!validation.canSave || isSaving}
                  className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                    validation.canSave
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                  title={!validation.canSave ? `Missing: ${validation.issues.join(', ')}` : 'Save progress and exit'}
                >
                  {isSaving ? 'Saving...' : 'Save & Exit'}
                </button>
                {!validation.canSave && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {validation.completedCount}/{validation.totalRequired} required fields
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleNext}
            disabled={isSaving}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold flex items-center disabled:opacity-70 transition-opacity"
          >
            {step.id === 'review' && isSaving ? 'Completing...' : 'Continue'} <ArrowRight className="ml-2 w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );
};
export default CandidateOnboarding;
