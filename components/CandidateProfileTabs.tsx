
import React, { useState, useCallback } from 'react';
import { CandidateProfile, SeniorityLevel, WorkMode, JobType, Skill, LanguageEntry } from '../types';
import {
  User, Briefcase, Award, Heart, CheckCircle, Zap, DollarSign,
  MapPin, Clock, Lock, Unlock, Edit2, Plus, Trash2, Layout,
  Smile, ShieldCheck, Globe, Users, X, Info, Target, GraduationCap, Loader2, TrendingUp,
  Phone, Building2, Plane
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import VerificationDashboard from './VerificationDashboard';
import ImpactScopeSelector from './ImpactScopeSelector';
import SkillSelectorModal from './SkillSelectorModal';
import CandidateRoleSelector from './CandidateRoleSelector';
import SkillPillEditor from './SkillPillEditor';
import { CULTURAL_VALUES, INDUSTRIES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES, SKILLS_LIST } from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';
import { COMMON_TIMEZONES, COMPANY_SIZE_OPTIONS } from '../constants/languageData';
import {
    WORK_HOURS_OPTIONS, WORK_INTENSITY_OPTIONS, AUTONOMY_LEVEL_OPTIONS, AMBIGUITY_TOLERANCE_OPTIONS,
    TEAM_SIZE_PREF_OPTIONS, TEAM_DISTRIBUTION_OPTIONS, COLLABORATION_FREQ_OPTIONS, TIMEZONE_OVERLAP_OPTIONS,
    TIMEZONE_OPTIONS, LANGUAGE_OPTIONS, LANGUAGE_PROFICIENCY_OPTIONS, PROJECT_DURATION_OPTIONS,
    CONTEXT_SWITCHING_OPTIONS, CHANGE_FREQUENCY_OPTIONS
} from '../constants/workStyleData';
import { getSkillLevelForSeniority, getImpactScopeForSeniority } from '../constants/seniorityData';

const NonNegotiableToggle = ({ fieldName, isChecked, onToggle }: { fieldName: string; isChecked: boolean; onToggle: () => void; }) => {
  return (
    <div className="flex items-center gap-3 mt-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
      <button type="button" onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isChecked ? 'bg-red-500' : 'bg-blue-500'}`} role="switch" aria-checked={isChecked}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className={`text-sm font-bold ${isChecked ? 'text-red-700' : 'text-blue-700'}`}>{isChecked ? 'Non-negotiable' : 'Flexible'}</span>
    </div>
  );
};

const LanguageManager: React.FC<{ languages: LanguageEntry[], onChange: (l: LanguageEntry[]) => void }> = ({ languages, onChange }) => {
  const add = () => onChange([...languages, { language: '', proficiency: 'professional' }]);
  const remove = (idx: number) => onChange(languages.filter((_, i) => i !== idx));
  const update = (idx: number, u: Partial<LanguageEntry>) => { const nl = [...languages]; nl[idx] = { ...nl[idx], ...u }; onChange(nl); };
  return (
    <div className="space-y-3">
      {languages.map((l, i) => (
        <div key={i} className="flex gap-2 items-center">
          <select value={l.language} onChange={e => update(i, { language: e.target.value })} className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium"><option value="">Select language...</option>{LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <select value={l.proficiency} onChange={e => update(i, { proficiency: e.target.value as any })} className="w-32 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium">{LANGUAGE_PROFICIENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <button type="button" onClick={() => remove(i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider hover:text-blue-700"><Plus className="w-3.5 h-3.5" /> Add Language</button>
    </div>
  );
};

interface Props {
  profile: CandidateProfile;
  onUpdate: (data: Partial<CandidateProfile>) => void;
  onSave: () => void;
  isSaving?: boolean;
}

const CandidateProfileTabs: React.FC<Props> = ({ profile, onUpdate, onSave, isSaving }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'career' | 'preferences' | 'values' | 'verifications'>('overview');
  const [isSkillSelectorOpen, setIsSkillSelectorOpen] = useState(false);

  // Handler for primary role selection - updates skills and impact scope
  const handlePrimaryRoleChange = useCallback((
    role: { id: string; name: string } | undefined,
    templateSkills: Skill[]
  ) => {
    if (!role) {
      // Clearing primary role - keep existing skills but clear role info
      onUpdate({
        primaryRoleId: undefined,
        primaryRoleName: undefined,
      });
      return;
    }

    // Merge template skills with existing manually-added skills
    const existingSkills = profile.skills || [];
    const templateSkillNames = new Set(templateSkills.map(s => s.name.toLowerCase()));
    const manualSkills = existingSkills.filter(
      s => !templateSkillNames.has(s.name.toLowerCase())
    );
    const mergedSkills = [...templateSkills, ...manualSkills];

    // Update impact scope based on seniority
    const impactScope = getImpactScopeForSeniority(profile.currentSeniority);

    onUpdate({
      primaryRoleId: role.id,
      primaryRoleName: role.name,
      skills: mergedSkills,
      currentImpactScope: impactScope,
    });
  }, [profile.skills, profile.currentSeniority, onUpdate]);

  // Handler for secondary roles - merges additional skills
  const handleSecondaryRolesChange = useCallback((
    roles: { id: string; name: string }[],
    additionalSkills: Skill[]
  ) => {
    // Merge new skills without duplicating
    const existingSkillNames = new Set((profile.skills || []).map(s => s.name.toLowerCase()));
    const newSkills = additionalSkills.filter(
      s => !existingSkillNames.has(s.name.toLowerCase())
    );

    onUpdate({
      secondaryRoles: roles,
      skills: [...(profile.skills || []), ...newSkills],
    });
  }, [profile.skills, onUpdate]);

  // Handler for seniority change - updates all skill levels and impact scope
  const handleSeniorityChange = useCallback((seniority: SeniorityLevel) => {
    const skillLevel = getSkillLevelForSeniority(seniority);
    const impactScope = getImpactScopeForSeniority(seniority);

    // Update all skill levels
    const updatedSkills = (profile.skills || []).map(skill => ({
      ...skill,
      level: skillLevel,
    }));

    onUpdate({
      currentSeniority: seniority,
      skills: updatedSkills,
      currentImpactScope: impactScope,
    });
  }, [profile.skills, onUpdate]);

  // Convert Skill to JobSkill format for SkillPillEditor
  const skillsAsJobSkills = (profile.skills || []).map(s => ({
    name: s.name,
    required_level: s.level,
    minimumYears: s.years,
    weight: 'preferred' as const,
  }));

  // Handler for updating a skill from SkillPillEditor
  const handleUpdateSkillFromPill = useCallback((index: number, updated: { name: string; required_level: 1|2|3|4|5; minimumYears?: number; weight: 'required' | 'preferred' }) => {
    const skills = [...(profile.skills || [])];
    skills[index] = {
      name: updated.name,
      level: updated.required_level,
      years: updated.minimumYears,
    };
    onUpdate({ skills });
  }, [profile.skills, onUpdate]);

  // Handler for removing a skill
  const handleRemoveSkillFromPill = useCallback((index: number) => {
    const skills = (profile.skills || []).filter((_, i) => i !== index);
    onUpdate({ skills });
  }, [profile.skills, onUpdate]);

  const calculateCompletion = () => {
    let score = 0;
    if (profile.name && profile.headline) score += 20;
    if (profile.bio) score += 10;
    if (profile.skills?.length > 0) score += 20;
    if (profile.experience?.length > 0) score += 15;
    if (profile.salaryMin) score += 10;
    if (profile.values?.length > 0) score += 15;
    if (profile.timezone) score += 5;
    if (profile.languages?.length > 0) score += 5;
    return Math.min(100, score);
  };

  const completion = calculateCompletion();

  const toggleNonNegotiable = (f: string) => {
    const c = profile.nonNegotiables || [];
    onUpdate({ nonNegotiables: c.includes(f) ? c.filter(x => x !== f) : [...c, f] });
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}><Icon className="w-4 h-4 mr-2" />{label}</button>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-48 bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black shadow-inner border-4 border-white/10">{profile.name?.charAt(0) || '?'}</div>
            <div>
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2"><h1 className="text-4xl font-black tracking-tight">{profile.name}</h1><span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 border border-white/5">{profile.status?.replace('_', ' ')}</span></div>
              <p className="text-gray-400 text-xl font-medium max-w-lg">{profile.headline}</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-2xl">
            <div className="relative w-24 h-24"><svg className="w-full h-full -rotate-90" viewBox="0 0 36 36"><path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" /><path className="text-blue-500 transition-all duration-1000 ease-out" strokeDasharray={`${completion}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" /></svg><div className="absolute inset-0 flex items-center justify-center font-black text-2xl tabular-nums">{completion}%</div></div>
            <div><h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-1">Strength</h3><p className="text-sm font-bold text-blue-400">Match Ready</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden min-h-[700px] flex flex-col">
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth"><TabButton id="overview" label="Basics" icon={Layout} /><TabButton id="career" label="Career & Style" icon={Briefcase} /><TabButton id="preferences" label="Logistics" icon={DollarSign} /><TabButton id="values" label="Culture" icon={Heart} /><TabButton id="verifications" label="Verified" icon={ShieldCheck} /></div>
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Bio</label><textarea value={profile.bio || ''} onChange={e => onUpdate({ bio: e.target.value })} className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all outline-none h-48 text-gray-700 font-medium" placeholder="Describe your journey..." /></div>
                  <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Location</label><div className="flex items-center bg-gray-50 rounded-2xl px-5 py-4 border-2 border-transparent focus-within:border-blue-500/20 focus-within:bg-white transition-all"><MapPin className="w-5 h-5 text-gray-400 mr-4" /><input value={profile.location || ''} onChange={e => onUpdate({ location: e.target.value })} className="bg-transparent w-full font-bold text-gray-800 outline-none" /></div></div>
                </div>
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden"><Zap className="absolute top-4 right-4 w-12 h-12 opacity-10" /><h3 className="font-black text-lg mb-4 flex items-center"><Zap className="w-5 h-5 mr-2" /> Optimization</h3><p className="text-blue-50 leading-relaxed font-medium mb-6">Detailed skills increase match accuracy by 40%.</p></div>
                  <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100"><h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6 flex items-center"><Smile className="w-4 h-4 mr-2" /> Theme</h3><div className="flex gap-3">{['blue', 'purple', 'green', 'orange', 'pink', 'slate'].map(c => <button key={c} onClick={() => onUpdate({ themeColor: c as any })} className={`w-8 h-8 rounded-full transition-all transform hover:scale-110 ${profile.themeColor === c ? 'ring-2 ring-gray-900 ring-offset-2 scale-110' : ''} bg-${c}-500 shadow-sm`} style={{backgroundColor:`var(--tw-color-${c}-500)`}} />)}</div></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-500">
              {/* Role & Seniority Section */}
              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2.5rem] p-8 border border-blue-100">
                <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-6 h-6 mr-2 text-blue-600" /> Your Role & Seniority
                </h3>
                <p className="text-gray-500 text-sm font-medium mb-8">
                  Select your primary role to auto-populate relevant skills. Skill levels adjust based on seniority.
                </p>
                <CandidateRoleSelector
                  primaryRole={profile.primaryRoleId ? { id: profile.primaryRoleId, name: profile.primaryRoleName || '' } : undefined}
                  secondaryRoles={profile.secondaryRoles}
                  currentSeniority={profile.currentSeniority}
                  onPrimaryRoleChange={handlePrimaryRoleChange}
                  onSecondaryRolesChange={handleSecondaryRolesChange}
                  onSeniorityChange={handleSeniorityChange}
                />
              </section>

              {/* Professional Tenure */}
              <section className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 shadow-inner">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center"><TrendingUp className="w-6 h-6 mr-2 text-blue-600" /> Professional Tenure</h3>
                    <p className="text-gray-500 text-sm font-medium mb-6">How many years of relevant industry experience do you have?</p>
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="25"
                          step="0.5"
                          value={profile.totalYearsExperience || 0}
                          onChange={e => onUpdate({ totalYearsExperience: parseFloat(e.target.value) })}
                          className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <span>0 Years</span>
                          <span>25+ Years</span>
                        </div>
                      </div>
                      <div className="w-24 relative">
                        <input
                          type="number"
                          value={profile.totalYearsExperience || ''}
                          onChange={e => onUpdate({ totalYearsExperience: parseFloat(e.target.value) || 0 })}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl text-center font-black text-lg focus:ring-2 focus:ring-blue-100 outline-none"
                          placeholder="0.0"
                        />
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">YRS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Technical Skills Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-yellow-500" /> Technical Skills
                    </h3>
                    <p className="text-gray-500 text-sm font-medium">
                      {profile.primaryRoleName ? `Skills for ${profile.primaryRoleName}. ` : ''}
                      Click any skill to adjust level and years.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSkillSelectorOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 inline mr-2" /> Add Skill
                  </button>
                </div>
                {profile.primaryRoleId && skillsAsJobSkills.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                    <p className="text-sm text-blue-700">
                      <span className="font-bold">Skills auto-populated from {profile.primaryRoleName}.</span> Levels set based on your seniority. Click any skill to customize.
                    </p>
                  </div>
                )}
                <SkillPillEditor
                  skills={skillsAsJobSkills}
                  onUpdateSkill={handleUpdateSkillFromPill}
                  onRemoveSkill={handleRemoveSkillFromPill}
                />
              </section>

              {/* Impact Scope */}
              <section>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 mb-1 flex items-center">
                    <Target className="w-6 h-6 mr-2 text-blue-500" /> Impact Scope
                  </h3>
                  <p className="text-gray-500 text-sm font-medium mb-8">
                    Role-agnostic influence breadth. {profile.currentSeniority ? `Auto-set based on ${profile.currentSeniority} level.` : ''}
                  </p>
                </div>
                <ImpactScopeSelector
                  currentScope={profile.currentImpactScope}
                  desiredScopes={profile.desiredImpactScopes}
                  onChangeCurrent={s => onUpdate({ currentImpactScope: s })}
                  onChangeDesired={s => onUpdate({ desiredImpactScopes: s })}
                />
              </section>
              
              <section className="pt-12 border-t"><h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center"><Clock className="w-6 h-6 mr-2 text-blue-500" /> Work Style Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Work Schedule</label><select value={profile.workStylePreferences?.workHours || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, workHours: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold"><option value="">Not Specified</option>{WORK_HOURS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Work Intensity</label><select value={profile.workStylePreferences?.workIntensity || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, workIntensity: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold"><option value="">Not Specified</option>{WORK_INTENSITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Autonomy</label><select value={profile.workStylePreferences?.autonomyLevel || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, autonomyLevel: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold"><option value="">Not Specified</option>{AUTONOMY_LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ambiguity Tolerance</label><select value={profile.workStylePreferences?.ambiguityTolerance || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, ambiguityTolerance: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold"><option value="">Not Specified</option>{AMBIGUITY_TOLERANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Change Frequency</label><select value={profile.workStylePreferences?.changeFrequency || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, changeFrequency: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold"><option value="">Not Specified</option>{CHANGE_FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                </div>
              </section>

              <section className="pt-12 border-t"><h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center"><Users className="w-6 h-6 mr-2 text-green-500" /> Team & Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-gray-50 p-6 rounded-3xl border"><label className="block text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Distribution Preference</label><div className="space-y-2">{TEAM_DISTRIBUTION_OPTIONS.map(o => <button key={o.value} onClick={() => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, teamDistribution: o.value as any }})} className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${profile.teamCollaborationPreferences?.teamDistribution === o.value ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}><div className="font-black text-sm">{o.label}</div><div className={`text-[10px] ${profile.teamCollaborationPreferences?.teamDistribution === o.value ? 'text-green-100' : 'text-gray-400'}`}>{o.description}</div></button>)}</div></div>
                   <div className="bg-gray-50 p-6 rounded-3xl border"><label className="block text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Timezone Overlap</label><div className="grid grid-cols-2 gap-2">{TIMEZONE_OVERLAP_OPTIONS.map(o => <button key={o.value} onClick={() => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, timezoneOverlap: o.value as any }})} className={`p-4 rounded-2xl border-2 text-xs font-black transition-all ${profile.teamCollaborationPreferences?.timezoneOverlap === o.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>{o.label}</button>)}</div></div>
                </div>
              </section>

              <section className="pt-12 border-t"><h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center"><Globe className="w-6 h-6 mr-2 text-indigo-500" /> Localization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Your Timezone</label><select value={profile.timezone || ''} onChange={e => onUpdate({ timezone: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl font-black focus:ring-2 focus:ring-blue-100 outline-none"><option value="">Select...</option>{TIMEZONE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} ({o.offset})</option>)}</select></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Languages</label><LanguageManager languages={profile.languages || []} onChange={l => onUpdate({ languages: l })} /></div>
                </div>
              </section>
              
              <section className="pt-12 border-t">
                <h3 className="text-2xl font-black text-gray-900 mb-6">Education</h3>
                <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-3">Highest Degree</label>
                    <select value={profile.education_level || ''} onChange={e => onUpdate({ education_level: e.target.value })} className="w-full p-4 bg-gray-50 border rounded-2xl font-bold">
                      {EDUCATION_LEVELS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase mb-3">Graduation Year</label>
                    <input
                      type="number"
                      value={profile.education_graduation_year || ''}
                      onChange={e => onUpdate({ education_graduation_year: parseInt(e.target.value) || undefined })}
                      placeholder="2020"
                      min="1950"
                      max={new Date().getFullYear() + 10}
                      className="w-full p-4 bg-gray-50 border rounded-2xl font-bold"
                    />
                  </div>
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
                    <GraduationCap className="w-10 h-10 text-blue-500"/>
                    <p className="text-xs font-bold text-blue-800">Highlight bootcamps or self-taught paths—many Open partners value non-traditional excellence.</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl">
              {/* Work Modes */}
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Work Modes</label>
                <div className="flex flex-wrap gap-3">
                  {Object.values(WorkMode).map(m => (
                    <button key={m} onClick={() => { const c = profile.preferredWorkMode || []; onUpdate({ preferredWorkMode: c.includes(m) ? c.filter(x => x !== m) : [...c, m] }); }} className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border-2 ${profile.preferredWorkMode?.includes(m) ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>{m}</button>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t">
                  <NonNegotiableToggle fieldName="work_mode" isChecked={profile.nonNegotiables?.includes('work_mode') || false} onToggle={() => toggleNonNegotiable('work_mode')} />
                </div>
              </div>

              {/* Compensation */}
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center"><DollarSign className="w-4 h-4 mr-2" />Compensation</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Minimum Salary</label>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border">
                      <div className="bg-blue-600 text-white px-3 py-2 rounded-lg font-black text-sm">{profile.salaryCurrency || 'USD'}</div>
                      <input type="number" value={profile.salaryMin || ''} onChange={e => onUpdate({ salaryMin: parseInt(e.target.value) || undefined })} className="w-full bg-transparent p-2 text-xl font-black text-gray-900 outline-none" placeholder="80000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">Target/Max Salary</label>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border">
                      <div className="bg-green-600 text-white px-3 py-2 rounded-lg font-black text-sm">{profile.salaryCurrency || 'USD'}</div>
                      <input type="number" value={profile.salaryMax || ''} onChange={e => onUpdate({ salaryMax: parseInt(e.target.value) || undefined })} className="w-full bg-transparent p-2 text-xl font-black text-gray-900 outline-none" placeholder="120000" />
                    </div>
                  </div>
                </div>
                {/* Equity Toggle */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border mt-6">
                  <div>
                    <p className="font-bold text-gray-800">Open to Equity</p>
                    <p className="text-sm text-gray-500">Accept stock options as compensation</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdate({ openToEquity: !profile.openToEquity })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.openToEquity ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${profile.openToEquity ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <NonNegotiableToggle fieldName="salary_min" isChecked={profile.nonNegotiables?.includes('salary_min') || false} onToggle={() => toggleNonNegotiable('salary_min')} />
                </div>
              </div>

              {/* Location & Relocation */}
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center"><Plane className="w-4 h-4 mr-2" />Location & Relocation</label>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border">
                  <div>
                    <p className="font-bold text-gray-800">Open to Relocation</p>
                    <p className="text-sm text-gray-500">Would consider moving for the right role</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdate({ willingToRelocate: !profile.willingToRelocate })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.willingToRelocate ? 'bg-blue-500' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${profile.willingToRelocate ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="mt-6">
                  <label className="block text-xs font-bold text-gray-500 mb-2">Preferred Timezone (if different from current)</label>
                  <select
                    value={profile.preferredTimezone || ''}
                    onChange={e => onUpdate({ preferredTimezone: e.target.value || undefined })}
                    className="w-full p-4 bg-white border rounded-xl font-bold"
                  >
                    <option value="">Same as current</option>
                    {COMMON_TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company Size Preferences */}
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center"><Building2 className="w-4 h-4 mr-2" />Preferred Company Size</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMPANY_SIZE_OPTIONS.map(size => {
                    const isSelected = (profile.preferredCompanySize || []).includes(size.value);
                    return (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => {
                          const current = profile.preferredCompanySize || [];
                          const updated = isSelected
                            ? current.filter(s => s !== size.value)
                            : [...current, size.value];
                          onUpdate({ preferredCompanySize: updated });
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className="font-black text-sm">{size.label}</p>
                        <p className="text-xs text-gray-500">{size.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Call Availability */}
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center"><Phone className="w-4 h-4 mr-2" />Call Availability</label>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border">
                  <div>
                    <p className="font-bold text-gray-800">Available for Quick Calls</p>
                    <p className="text-sm text-gray-500">Show recruiters you're ready to chat</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdate({ callReady: !profile.callReady })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.callReady ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${profile.callReady ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {profile.callReady && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Scheduling Link</label>
                    <input
                      type="url"
                      value={profile.callLink || ''}
                      onChange={e => onUpdate({ callLink: e.target.value || undefined })}
                      placeholder="https://calendly.com/your-link"
                      className="w-full p-4 bg-white border rounded-xl font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 max-w-3xl">
              <div><h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center"><Heart className="w-6 h-6 mr-2 text-pink-500" /> Cultural Values</h3><p className="text-gray-500 font-medium mb-10">Principles guiding your work.</p><GroupedMultiSelect label="" options={CULTURAL_VALUES} selected={profile.values || []} onChange={v => onUpdate({ values: v })} maxSelections={5} /></div>
              <div className="pt-12 border-t"><div><h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center"><Smile className="w-6 h-6 mr-2 text-purple-500" /> Character Traits</h3><p className="text-gray-500 font-medium mb-10">Colleague personality perception.</p><GroupedMultiSelect label="" options={CHARACTER_TRAITS_CATEGORIES} selected={profile.characterTraits || []} onChange={v => onUpdate({ characterTraits: v })} grouped={true} maxSelections={8} /></div></div>
            </div>
          )}

          {activeTab === 'verifications' && <VerificationDashboard candidateId={profile.id} stats={profile.verification_stats} skills={profile.skills} />}
        </div>
        <div className="bg-gray-50 px-12 py-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
            <Clock className="w-4 h-4"/> Syncing to Open Market
          </div>
          <button 
            onClick={onSave} 
            disabled={isSaving}
            className="w-full md:w-auto bg-gray-900 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center shadow-2xl hover:scale-[1.02] transform active:scale-95 disabled:opacity-70"
          >
            {isSaving ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Saving...</> : <><CheckCircle className="w-5 h-5 mr-3"/> Save & Go Live</>}
          </button>
        </div>
      </div>
      
      {/* Skill Selector Modal */}
      <SkillSelectorModal
        isOpen={isSkillSelectorOpen}
        onClose={() => setIsSkillSelectorOpen(false)}
        onSelectSkill={(skillName) => {
          onUpdate({ 
            skills: [...(profile.skills || []), { name: skillName, level: 3, years: 0 }] 
          });
        }}
        alreadySelected={profile.skills?.map(s => s.name) || []}
      />
    </div>
  );
};

export default CandidateProfileTabs;
