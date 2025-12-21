import React, { useState } from 'react';
import { CandidateProfile, SeniorityLevel, WorkMode, JobType, Skill, LanguageEntry } from '../types';
import { 
  User, Briefcase, Award, Heart, CheckCircle, Zap, DollarSign, 
  MapPin, Clock, Lock, Unlock, Edit2, Plus, Trash2, Layout, 
  Smile, ShieldCheck, Globe, Users, X, Info, Target, GraduationCap
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import VerificationDashboard from './VerificationDashboard';
import SkillLevelSelector from './SkillLevelSelector';
import ImpactScopeSelector from './ImpactScopeSelector';
import { 
  CULTURAL_VALUES, 
  INDUSTRIES, 
  PERKS_CATEGORIES, 
  CHARACTER_TRAITS_CATEGORIES, 
  SKILLS_LIST 
} from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';
import { 
    WORK_HOURS_OPTIONS,
    WORK_INTENSITY_OPTIONS,
    AUTONOMY_LEVEL_OPTIONS,
    AMBIGUITY_TOLERANCE_OPTIONS,
    TEAM_SIZE_PREF_OPTIONS,
    TEAM_DISTRIBUTION_OPTIONS,
    COLLABORATION_FREQ_OPTIONS,
    TIMEZONE_OVERLAP_OPTIONS,
    TIMEZONE_OPTIONS,
    LANGUAGE_OPTIONS,
    LANGUAGE_PROFICIENCY_OPTIONS,
    PROJECT_DURATION_OPTIONS,
    CONTEXT_SWITCHING_OPTIONS,
    DECISION_MAKING_OPTIONS,
    RISK_TOLERANCE_OPTIONS,
    INNOVATION_STABILITY_OPTIONS,
    CHANGE_FREQUENCY_OPTIONS,
    PAIR_PROGRAMMING_OPTIONS,
    CROSS_FUNCTIONAL_OPTIONS,
    REPORTING_STRUCTURE_OPTIONS,
    ORG_SIZE_PREF_OPTIONS
} from '../constants/workStyleData';

const NonNegotiableToggle = ({ fieldName, isChecked, onToggle }: { fieldName: string; isChecked: boolean; onToggle: () => void; }) => {
  return (
    <div className="flex items-center gap-3 mt-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
      <button 
        type="button"
        onClick={onToggle} 
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isChecked ? 'bg-red-500' : 'bg-blue-500'}`} 
        role="switch" 
        aria-checked={isChecked}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className={`text-sm font-bold ${isChecked ? 'text-red-700' : 'text-blue-700'}`}>
        {isChecked ? '🔒 Non-negotiable' : '✨ Flexible'}
      </span>
    </div>
  );
};

const LanguageManager: React.FC<{ languages: LanguageEntry[], onChange: (l: LanguageEntry[]) => void }> = ({ languages, onChange }) => {
  const addLanguage = () => onChange([...languages, { language: '', proficiency: 'professional' }]);
  const removeLanguage = (idx: number) => onChange(languages.filter((_, i) => i !== idx));
  const updateLanguage = (idx: number, updates: Partial<LanguageEntry>) => {
    const newList = [...languages];
    newList[idx] = { ...newList[idx], ...updates };
    onChange(newList);
  };

  return (
    <div className="space-y-3">
      {languages.map((lang, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <select 
            value={lang.language} 
            onChange={e => updateLanguage(idx, { language: e.target.value })}
            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"
          >
            <option value="">Select language...</option>
            {LANGUAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select 
            value={lang.proficiency} 
            onChange={e => updateLanguage(idx, { proficiency: e.target.value as any })}
            className="w-32 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"
          >
            {LANGUAGE_PROFICIENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button type="button" onClick={() => removeLanguage(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button 
        type="button" 
        onClick={addLanguage} 
        className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider hover:text-blue-700"
      >
        <Plus className="w-3.5 h-3.5" /> Add Language
      </button>
    </div>
  );
};

interface Props {
  profile: CandidateProfile;
  onUpdate: (data: Partial<CandidateProfile>) => void;
  onSave: () => void;
}

const CandidateProfileTabs: React.FC<Props> = ({ profile, onUpdate, onSave }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'career' | 'preferences' | 'values' | 'verifications'>('overview');

  const calculateCompletion = () => {
    let score = 0;
    if (profile.name && profile.headline) score += 20;
    if (profile.bio) score += 10;
    if (profile.skills && profile.skills.length > 0) score += 20;
    if (profile.experience && profile.experience.length > 0) score += 15;
    if (profile.salaryMin) score += 10;
    if (profile.values && profile.values.length > 0) score += 15;
    if (profile.timezone) score += 5;
    if (profile.languages && profile.languages.length > 0) score += 5;
    return Math.min(100, score);
  };

  const completion = calculateCompletion();

  const handleUpdateSkill = (updatedSkill: Skill, index: number) => {
      const newSkills = [...(profile.skills || [])];
      newSkills[index] = updatedSkill;
      onUpdate({ skills: newSkills });
  };

  const toggleNonNegotiable = (fieldName: string) => {
    const current = profile.nonNegotiables || [];
    const exists = current.includes(fieldName);
    onUpdate({ nonNegotiables: exists ? current.filter(f => f !== fieldName) : [...current, fieldName] });
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex items-center px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
          : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />{label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      {/* Profile Header Card */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-48 bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 p-32 bg-purple-600 rounded-full blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black shadow-inner border-4 border-white/10">
              {profile.name?.charAt(0) || '?'}
            </div>
            <div>
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight">{profile.name}</h1>
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 border border-white/5">
                  {profile.status?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-400 text-xl font-medium max-w-lg">{profile.headline}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-2xl">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90 shadow-sm" viewBox="0 0 36 36">
                <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className="text-blue-500 transition-all duration-1000 ease-out" strokeDasharray={`${completion}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-2xl tabular-nums">
                {completion}%
              </div>
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-1">Profile Strength</h3>
              <p className="text-sm font-bold text-blue-400">Precision Match Ready</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden min-h-[700px] flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth">
          <TabButton id="overview" label="Basics" icon={Layout} />
          <TabButton id="career" label="Career & Work Style" icon={Briefcase} />
          <TabButton id="preferences" label="Logistics" icon={DollarSign} />
          <TabButton id="values" label="Culture Fit" icon={Heart} />
          <TabButton id="verifications" label="Verifications" icon={ShieldCheck} />
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Professional Bio</label>
                    <textarea 
                      value={profile.bio || ''} 
                      onChange={e => onUpdate({ bio: e.target.value })} 
                      className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none h-48 text-gray-700 leading-relaxed font-medium"
                      placeholder="Tell companies about your journey, what you've built, and what you're looking for next..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Current Location</label>
                    <div className="flex items-center bg-gray-50 rounded-2xl px-5 py-4 border-2 border-transparent focus-within:border-blue-500/20 focus-within:bg-white transition-all shadow-inner">
                      <MapPin className="w-5 h-5 text-gray-400 mr-4" />
                      <input 
                        value={profile.location || ''} 
                        onChange={e => onUpdate({ location: e.target.value })} 
                        className="bg-transparent w-full font-bold text-gray-800 outline-none" 
                        placeholder="e.g. London, United Kingdom"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <Zap className="absolute top-4 right-4 w-12 h-12 opacity-10" />
                    <h3 className="font-black text-lg mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2" /> Match Optimization Tip
                    </h3>
                    <p className="text-blue-50 leading-relaxed font-medium mb-6">
                      A detailed bio that mentions your favorite stack and specific project wins increases your match rate by up to 40%.
                    </p>
                    <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
                      <ShieldCheck className="w-6 h-6 text-blue-200" />
                      <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                        Profiles are anonymous until you accept an invite.
                      </p>
                    </div>
                  </div>
                  
                  {/* Theme Settings Restored */}
                  <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center">
                      <Smile className="w-4 h-4 mr-2" /> Profile Aesthetics
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Accent Color</label>
                        <div className="flex gap-3">
                          {['blue', 'purple', 'green', 'orange', 'pink', 'slate'].map(color => (
                            <button
                              key={color}
                              onClick={() => onUpdate({ themeColor: color as any })}
                              className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${
                                profile.themeColor === color ? 'border-gray-900 scale-125' : 'border-transparent'
                              } bg-${color}-500 shadow-sm`}
                              style={{ backgroundColor: `var(--tw-color-${color}-500)` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CAREER TAB */}
          {activeTab === 'career' && (
            <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-500">
              {/* Impact Scope Restored */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1 flex items-center">
                      <Target className="w-6 h-6 mr-2 text-blue-500" /> Impact Scope
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">How wide is your sphere of influence?</p>
                  </div>
                </div>
                <ImpactScopeSelector 
                  currentScope={profile.currentImpactScope} 
                  desiredScopes={profile.desiredImpactScopes} 
                  onChangeCurrent={(scope) => onUpdate({ currentImpactScope: scope })} 
                  onChangeDesired={(scopes) => onUpdate({ desiredImpactScopes: scopes })} 
                />
              </section>

              {/* Skills CRUD Restored */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-yellow-500" /> Technical Skills
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">Precision matching depends on these levels.</p>
                  </div>
                  <button 
                    onClick={() => onUpdate({ skills: [...(profile.skills || []), { name: '', level: 1, years: 0 }] })}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    <Plus className="w-4 h-4" /> Add Skill
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.skills?.map((skill, idx) => (
                    <SkillLevelSelector 
                      key={idx} 
                      skill={skill} 
                      onChange={(updated) => handleUpdateSkill(updated, idx)} 
                      onRemove={() => onUpdate({ skills: profile.skills.filter((_, i) => i !== idx) })} 
                    />
                  ))}
                </div>
              </section>

              {/* Work Style Preferences - NEW RESTORATION */}
              <section className="pt-12 border-t border-gray-100">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-1 flex items-center">
                    <Clock className="w-6 h-6 mr-2 text-blue-500" /> Work Style Preferences
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">Define your optimized working environment.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Work Hours */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Schedule</label>
                    <select
                      value={profile.workStylePreferences?.workHours || ''}
                      onChange={e => onUpdate({ 
                        workStylePreferences: { ...profile.workStylePreferences, workHours: e.target.value as any }
                      })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:bg-white transition-all outline-none"
                    >
                      <option value="">Not specified</option>
                      {WORK_HOURS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  
                  {/* Intensity */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pace</label>
                    <select
                      value={profile.workStylePreferences?.workIntensity || ''}
                      onChange={e => onUpdate({ 
                        workStylePreferences: { ...profile.workStylePreferences, workIntensity: e.target.value as any }
                      })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:bg-white transition-all outline-none"
                    >
                      <option value="">Not specified</option>
                      {WORK_INTENSITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  {/* Autonomy */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Management Style</label>
                    <select
                      value={profile.workStylePreferences?.autonomyLevel || ''}
                      onChange={e => onUpdate({ 
                        workStylePreferences: { ...profile.workStylePreferences, autonomyLevel: e.target.value as any }
                      })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:bg-white transition-all outline-none"
                    >
                      <option value="">Not specified</option>
                      {AUTONOMY_LEVEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Ambiguity */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ambiguity Tolerance</label>
                        <select
                            value={profile.workStylePreferences?.ambiguityTolerance || ''}
                            onChange={e => onUpdate({ 
                                workStylePreferences: { ...profile.workStylePreferences, ambiguityTolerance: e.target.value as any }
                            })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:bg-white transition-all outline-none"
                        >
                            <option value="">Not specified</option>
                            {AMBIGUITY_TOLERANCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    {/* Change Frequency */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Change Frequency</label>
                        <select
                            value={profile.workStylePreferences?.changeFrequency || ''}
                            onChange={e => onUpdate({ 
                                workStylePreferences: { ...profile.workStylePreferences, changeFrequency: e.target.value as any }
                            })}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:bg-white transition-all outline-none"
                        >
                            <option value="">Not specified</option>
                            {CHANGE_FREQUENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
              </section>

              {/* Team Preferences - NEW RESTORATION */}
              <section className="pt-12 border-t border-gray-100">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-1 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-green-500" /> Team & Collaboration
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">What kind of team helps you thrive?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team Size */}
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Preferred Team Size</label>
                    <div className="grid grid-cols-2 gap-2">
                        {TEAM_SIZE_PREF_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onUpdate({ 
                                    teamCollaborationPreferences: { ...profile.teamCollaborationPreferences, teamSizePreference: opt.value }
                                })}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                    profile.teamCollaborationPreferences?.teamSizePreference === opt.value
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                  </div>
                  
                  {/* Distribution */}
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Distribution Preference</label>
                    <div className="grid grid-cols-1 gap-2">
                        {TEAM_DISTRIBUTION_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onUpdate({ 
                                    teamCollaborationPreferences: { ...profile.teamCollaborationPreferences, teamDistribution: opt.value as any }
                                })}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all text-left ${
                                    profile.teamCollaborationPreferences?.teamDistribution === opt.value
                                        ? 'bg-green-600 text-white border-green-600 shadow-lg'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {opt.label} — <span className="opacity-70 font-normal">{opt.description}</span>
                            </button>
                        ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Localization - NEW RESTORATION */}
              <section className="pt-12 border-t border-gray-100">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-gray-900 mb-1 flex items-center">
                    <Globe className="w-6 h-6 mr-2 text-indigo-500" /> Timezone & Languages
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">Critical for remote-first alignment.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Primary Timezone</label>
                    <select
                      value={profile.timezone || ''}
                      onChange={e => onUpdate({ timezone: e.target.value })}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl font-bold text-gray-800 outline-none transition-all"
                    >
                      <option value="">Select timezone...</option>
                      {TIMEZONE_OPTIONS.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label} ({tz.offset})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Languages</label>
                    <LanguageManager 
                        languages={profile.languages || []} 
                        onChange={l => onUpdate({ languages: l })} 
                    />
                  </div>
                </div>
              </section>

              {/* Education Level Restored */}
              <section className="pt-12 border-t border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Highest Level of Education</label>
                    <select 
                      value={profile.education_level || ''} 
                      onChange={e => onUpdate({ education_level: e.target.value })} 
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/20 rounded-2xl font-bold text-gray-800 outline-none transition-all"
                    >
                      <option value="">Not specified</option>
                      {EDUCATION_LEVELS.map(level => (<option key={level} value={level}>{level}</option>))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                    <GraduationCap className="w-10 h-10 text-blue-500" />
                    <p className="text-xs font-medium text-blue-800 leading-relaxed">
                      If you're a Bootcamp grad or Self-Taught, make sure to highlight this! Many Open partners value specialized non-traditional backgrounds.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* LOGISTICS TAB */}
          {activeTab === 'preferences' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Work Mode Restored */}
                  <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Preferred Work Modes</label>
                    <div className="flex flex-wrap gap-3">
                      {Object.values(WorkMode).map(m => (
                        <button 
                          key={m} 
                          onClick={() => {
                            const current = profile.preferredWorkMode || [];
                            const exists = current.includes(m);
                            onUpdate({ preferredWorkMode: exists ? current.filter(x => x !== m) : [...current, m] });
                          }} 
                          className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border-2 ${
                            profile.preferredWorkMode?.includes(m) 
                              ? 'bg-gray-900 text-white border-gray-900 shadow-xl' 
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <NonNegotiableToggle 
                        fieldName="work_mode" 
                        isChecked={profile.nonNegotiables?.includes('work_mode') || false} 
                        onToggle={() => toggleNonNegotiable('work_mode')} 
                      />
                    </div>
                  </div>

                  {/* Salary Restored */}
                  <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Minimum Annual Salary</label>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-200 shadow-inner">
                      <div className="bg-blue-600 text-white p-3 rounded-xl font-black text-lg">
                        {profile.salaryCurrency || 'USD'}
                      </div>
                      <input 
                        type="number" 
                        value={profile.salaryMin || ''} 
                        onChange={e => onUpdate({ salaryMin: parseInt(e.target.value) })} 
                        className="w-full bg-transparent p-2 text-2xl font-black text-gray-900 outline-none" 
                        placeholder="e.g. 120000"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest text-center">
                      Currency: {profile.salaryCurrency || 'USD'}
                    </p>
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <NonNegotiableToggle 
                        fieldName="salary_min" 
                        isChecked={profile.nonNegotiables?.includes('salary_min') || false} 
                        onToggle={() => toggleNonNegotiable('salary_min')} 
                      />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* VALUES TAB */}
          {activeTab === 'values' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
               <div className="max-w-3xl">
                  <div className="mb-10">
                    <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center">
                      <Heart className="w-6 h-6 mr-2 text-pink-500" /> Core Cultural Values
                    </h3>
                    <p className="text-gray-500 font-medium">Which principles guide your best work?</p>
                  </div>
                  <GroupedMultiSelect 
                    label="" 
                    options={CULTURAL_VALUES} 
                    selected={profile.values || []} 
                    onChange={vals => onUpdate({ values: vals })} 
                    maxSelections={5} 
                    placeholder="Search and select up to 5 values..."
                  />
               </div>

               <div className="max-w-3xl pt-12 border-t border-gray-100">
                  <div className="mb-10">
                    <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center">
                      <Smile className="w-6 h-6 mr-2 text-purple-500" /> Character Traits
                    </h3>
                    <p className="text-gray-500 font-medium">How would colleagues describe your personality?</p>
                  </div>
                  <GroupedMultiSelect 
                    label="" 
                    options={CHARACTER_TRAITS_CATEGORIES} 
                    selected={profile.characterTraits || []} 
                    onChange={traits => onUpdate({ characterTraits: traits })} 
                    grouped={true} 
                    maxSelections={8}
                    placeholder="Search character traits..."
                  />
               </div>
            </div>
          )}

          {/* VERIFICATIONS TAB */}
          {activeTab === 'verifications' && (
            <div className="animate-in fade-in duration-500">
               <VerificationDashboard 
                candidateId={profile.id} 
                stats={profile.verification_stats} 
                skills={profile.skills} 
              />
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="bg-gray-50 px-12 py-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
            <Clock className="w-4 h-4" />
            Auto-save active
          </div>
          <button 
            onClick={onSave} 
            className="w-full md:w-auto bg-gray-900 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center shadow-2xl hover:scale-[1.02] transform active:scale-95"
          >
            <CheckCircle className="w-5 h-5 mr-3" /> Save & Go Live
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileTabs;
