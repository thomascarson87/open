
import React, { useState, useCallback, useMemo } from 'react';
import { CandidateProfile, SeniorityLevel, WorkMode, JobType, Skill, LanguageEntry } from '../types';
import {
  User, Briefcase, Award, Heart, CheckCircle, Zap, DollarSign,
  MapPin, Clock, Lock, Unlock, Edit2, Plus, Trash2, Layout,
  ShieldCheck, Globe, Users, X, Info, Target, GraduationCap, Loader2, TrendingUp,
  Phone, Building2, Plane, Sparkles, Download, Smile
} from 'lucide-react';
import { LocationAutocomplete } from './ui/LocationAutocomplete';
import { calculateProfileCompleteness } from '../utils/profileCompleteness';
import { JOB_SEARCH_STATUS_OPTIONS, getStatusOption } from '../constants/candidateStatusOptions';
import { exportProfileAsCV } from '../services/cvExportService';
import { ExperienceSection } from './candidate/ExperienceSection';
import { ExperienceEditPanel } from './candidate/ExperienceEditPanel';
import { EducationSection } from './candidate/EducationSection';
import { EducationEditPanel } from './candidate/EducationEditPanel';
import GroupedMultiSelect from './GroupedMultiSelect';
import { Experience, Education } from '../types';
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
    CONTEXT_SWITCHING_OPTIONS, CHANGE_FREQUENCY_OPTIONS, DECISION_MAKING_OPTIONS, RISK_TOLERANCE_OPTIONS,
    INNOVATION_STABILITY_OPTIONS, ORG_SIZE_PREF_OPTIONS, REPORTING_STRUCTURE_OPTIONS, PAIR_PROGRAMMING_OPTIONS,
    CROSS_FUNCTIONAL_OPTIONS
} from '../constants/workStyleData';
import { getSkillLevelForSeniority, getImpactScopeForSeniority } from '../constants/seniorityData';
import {
    LEADERSHIP_STYLE_OPTIONS, FEEDBACK_FREQUENCY_OPTIONS, COMMUNICATION_PREFERENCE_OPTIONS,
    MEETING_CULTURE_OPTIONS, CONFLICT_RESOLUTION_OPTIONS, GROWTH_EXPECTATION_OPTIONS,
    MENTORSHIP_APPROACH_OPTIONS
} from '../constants/hiringManagerData';

// Helper function to determine primary education for matching fields
function getPrimaryEducation(education: Education[]): Education | null {
  if (education.length === 0) return null;

  // Prioritize: ongoing > highest degree > most recent
  const ongoing = education.find(e => e.isOngoing);
  if (ongoing) return ongoing;

  // Sort by degree level (rough hierarchy)
  const degreeRank = (d: string) => {
    const ranks: Record<string, number> = {
      'PhD / Doctorate': 6,
      'Professional Degree (MD, JD, etc.)': 5,
      "Master's Degree": 4,
      "Bachelor's Degree": 3,
      'Associate Degree': 2,
      'Bootcamp / Certificate Program': 1,
    };
    return ranks[d] || 0;
  };

  return education.sort((a, b) => {
    const rankDiff = degreeRank(b.degree) - degreeRank(a.degree);
    if (rankDiff !== 0) return rankDiff;
    return (b.graduationYear || 0) - (a.graduationYear || 0);
  })[0];
}

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

  // Experience panel state
  const [experienceToEdit, setExperienceToEdit] = useState<Experience | null>(null);
  const [showExperiencePanel, setShowExperiencePanel] = useState(false);

  // Education panel state
  const [educationToEdit, setEducationToEdit] = useState<Education | null>(null);
  const [showEducationPanel, setShowEducationPanel] = useState(false);

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

  // Experience handlers
  const handleEditExperience = useCallback((exp: Experience) => {
    setExperienceToEdit(exp);
    setShowExperiencePanel(true);
  }, []);

  const handleAddExperience = useCallback(() => {
    setExperienceToEdit(null);
    setShowExperiencePanel(true);
  }, []);

  const handleSaveExperience = useCallback((exp: Experience) => {
    const existing = profile.experience || [];
    const index = existing.findIndex(e => e.id === exp.id);

    let updated: Experience[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = exp;
    } else {
      updated = [...existing, exp];
    }
    onUpdate({ experience: updated });
  }, [profile.experience, onUpdate]);

  const handleDeleteExperience = useCallback((id: string) => {
    const updated = (profile.experience || []).filter(e => e.id !== id);
    onUpdate({ experience: updated });
  }, [profile.experience, onUpdate]);

  // Education handlers
  const handleEditEducation = useCallback((edu: Education) => {
    setEducationToEdit(edu);
    setShowEducationPanel(true);
  }, []);

  const handleAddEducation = useCallback(() => {
    setEducationToEdit(null);
    setShowEducationPanel(true);
  }, []);

  const handleSaveEducation = useCallback((edu: Education) => {
    const existing = profile.educationHistory || [];
    const index = existing.findIndex(e => e.id === edu.id);

    let updated: Education[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = edu;
    } else {
      updated = [...existing, edu];
    }

    // Also update the flat fields with the highest/most recent education
    const primary = getPrimaryEducation(updated);
    onUpdate({
      educationHistory: updated,
      education_level: primary?.degree,
      education_field: primary?.fieldOfStudy,
      education_institution: primary?.institution,
      education_graduation_year: primary?.graduationYear || undefined,
    });
  }, [profile.educationHistory, onUpdate]);

  const handleDeleteEducation = useCallback((id: string) => {
    const updated = (profile.educationHistory || []).filter(e => e.id !== id);
    const primary = getPrimaryEducation(updated);
    onUpdate({
      educationHistory: updated,
      education_level: primary?.degree,
      education_field: primary?.fieldOfStudy,
      education_institution: primary?.institution,
      education_graduation_year: primary?.graduationYear || undefined,
    });
  }, [profile.educationHistory, onUpdate]);

  // Use the real profile completeness calculator
  const completeness = useMemo(() => calculateProfileCompleteness(profile), [profile]);
  const completion = completeness.percentage;

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
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight">{profile.name}</h1>
                {profile.status && profile.status !== 'not_looking' && (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    profile.status === 'actively_looking' ? 'bg-green-500 text-white' :
                    profile.status === 'open_to_offers' ? 'bg-blue-500 text-white' :
                    profile.status === 'casually_browsing' ? 'bg-yellow-500 text-gray-900' :
                    'bg-white/10 text-blue-400'
                  }`}>
                    {getStatusOption(profile.status)?.label || profile.status?.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xl font-medium max-w-lg">
                {profile.headline || 'Add a headline to stand out'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-2xl">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-blue-500 transition-all duration-1000 ease-out" strokeDasharray={`${completion}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-2xl tabular-nums">{completion}%</div>
              </div>
              <div>
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-1">Strength</h3>
                <p className={`text-sm font-bold ${completeness.strengthColor.replace('text-', 'text-')}`}>
                  {completeness.strengthLabel}
                </p>
              </div>
            </div>
            <button
              onClick={() => exportProfileAsCV(profile)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors text-sm font-bold"
            >
              <Download className="w-4 h-4" />
              Export CV
            </button>
          </div>
        </div>
        {/* Profile completion tips */}
        {completion < 80 && completeness.tips.length > 0 && (
          <div className="mt-6 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <p className="text-sm font-bold text-blue-300 mb-2">Complete your profile to improve matches:</p>
            <ul className="text-sm text-blue-200/80 space-y-1">
              {completeness.tips.map((tip, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden min-h-[700px] flex flex-col">
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar scroll-smooth"><TabButton id="overview" label="Basics" icon={Layout} /><TabButton id="career" label="Career & Style" icon={Briefcase} /><TabButton id="preferences" label="Logistics" icon={DollarSign} /><TabButton id="values" label="Culture" icon={Heart} /><TabButton id="verifications" label="Verified" icon={ShieldCheck} /></div>
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              {/* Headline & Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={profile.headline || ''}
                    onChange={e => onUpdate({ headline: e.target.value })}
                    placeholder="e.g., Senior Product Designer | B2B SaaS Specialist"
                    maxLength={100}
                    className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all outline-none font-bold text-gray-800"
                  />
                  <p className="text-xs text-gray-400 mt-2">Summarize your role and expertise in one line</p>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Job Search Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {JOB_SEARCH_STATUS_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => onUpdate({ status: option.value })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          profile.status === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${option.badgeColor}`} />
                          <span className="font-bold text-sm">{option.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Bio</label>
                    <textarea
                      value={profile.bio || ''}
                      onChange={e => onUpdate({ bio: e.target.value })}
                      className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 focus:bg-white transition-all outline-none h-48 text-gray-700 font-medium"
                      placeholder="Describe your journey, what drives you, and what you're looking for..."
                    />
                    <p className="text-xs text-gray-400 mt-2">{(profile.bio?.length || 0)}/500 characters</p>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Location</label>
                    <LocationAutocomplete
                      value={profile.location || ''}
                      onChange={(value) => onUpdate({ location: value })}
                      placeholder="Search city..."
                      focusRegion="europe"
                    />
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <Zap className="absolute top-4 right-4 w-12 h-12 opacity-10" />
                    <h3 className="font-black text-lg mb-4 flex items-center"><Zap className="w-5 h-5 mr-2" /> Optimization</h3>
                    <p className="text-blue-50 leading-relaxed font-medium mb-6">Detailed skills increase match accuracy by 40%.</p>
                  </div>
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
              
              <section className="pt-12 border-t">
                <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center"><Clock className="w-6 h-6 mr-2 text-blue-500" /> Work Style Preferences</h3>
                <p className="text-gray-500 text-sm font-medium mb-8">How you prefer to work day-to-day. These help match you with compatible teams.</p>

                {/* Row 1: Pace & Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Work Schedule</label>
                    <select value={profile.workStylePreferences?.workHours || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, workHours: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {WORK_HOURS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Work Intensity</label>
                    <select value={profile.workStylePreferences?.workIntensity || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, workIntensity: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {WORK_INTENSITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 2: Autonomy & Decision Making */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Autonomy Level</label>
                    <select value={profile.workStylePreferences?.autonomyLevel || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, autonomyLevel: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {AUTONOMY_LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Decision Making</label>
                    <select value={profile.workStylePreferences?.decisionMaking || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, decisionMaking: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {DECISION_MAKING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 3: Projects & Tasks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Project Duration</label>
                    <select value={profile.workStylePreferences?.projectDuration || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, projectDuration: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {PROJECT_DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Context Switching</label>
                    <select value={profile.workStylePreferences?.contextSwitching || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, contextSwitching: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {CONTEXT_SWITCHING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 4: Change & Risk */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Change Frequency</label>
                    <select value={profile.workStylePreferences?.changeFrequency || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, changeFrequency: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {CHANGE_FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Risk Tolerance</label>
                    <select value={profile.workStylePreferences?.riskTolerance || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, riskTolerance: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {RISK_TOLERANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 5: Innovation & Ambiguity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Innovation vs Stability</label>
                    <select value={profile.workStylePreferences?.innovationStability || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, innovationStability: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {INNOVATION_STABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ambiguity Tolerance</label>
                    <select value={profile.workStylePreferences?.ambiguityTolerance || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, ambiguityTolerance: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {AMBIGUITY_TOLERANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="pt-12 border-t">
                <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center"><Users className="w-6 h-6 mr-2 text-green-500" /> Team & Collaboration</h3>
                <p className="text-gray-500 text-sm font-medium mb-8">What team environment helps you thrive? These preferences improve culture fit matching.</p>

                {/* Row 1: Team & Org Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ideal Team Size</label>
                    <select value={profile.teamCollaborationPreferences?.teamSizePreference || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, teamSizePreference: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {TEAM_SIZE_PREF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ideal Org Size</label>
                    <select value={profile.teamCollaborationPreferences?.orgSizePreference || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, orgSizePreference: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {ORG_SIZE_PREF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 2: Structure & Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Reporting Structure</label>
                    <select value={profile.teamCollaborationPreferences?.reportingStructure || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, reportingStructure: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {REPORTING_STRUCTURE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Team Distribution</label>
                    <select value={profile.teamCollaborationPreferences?.teamDistribution || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, teamDistribution: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {TEAM_DISTRIBUTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 3: Collaboration Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Collaboration Frequency</label>
                    <select value={profile.teamCollaborationPreferences?.collaborationFrequency || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, collaborationFrequency: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {COLLABORATION_FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Timezone Overlap</label>
                    <select value={profile.teamCollaborationPreferences?.timezoneOverlap || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, timezoneOverlap: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {TIMEZONE_OVERLAP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 4: Working Together */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pair Programming</label>
                    <select value={profile.teamCollaborationPreferences?.pairProgramming || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, pairProgramming: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {PAIR_PROGRAMMING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cross-Functional Work</label>
                    <select value={profile.teamCollaborationPreferences?.crossFunctional || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, crossFunctional: e.target.value as any }})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {CROSS_FUNCTIONAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="pt-12 border-t">
                <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center"><Sparkles className="w-6 h-6 mr-2 text-purple-500" /> Manager & Growth Preferences</h3>
                <p className="text-gray-500 text-sm font-medium mb-8">Help us match you with managers whose style fits your preferences.</p>

                {/* Row 1: Leadership & Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preferred Leadership Style</label>
                    <select value={profile.preferredLeadershipStyle || ''} onChange={e => onUpdate({ preferredLeadershipStyle: e.target.value as any })} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {LEADERSHIP_STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{LEADERSHIP_STYLE_OPTIONS.find(o => o.value === profile.preferredLeadershipStyle)?.description}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preferred Feedback Frequency</label>
                    <select value={profile.preferredFeedbackFrequency || ''} onChange={e => onUpdate({ preferredFeedbackFrequency: e.target.value as any })} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {FEEDBACK_FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{FEEDBACK_FREQUENCY_OPTIONS.find(o => o.value === profile.preferredFeedbackFrequency)?.description}</p>
                  </div>
                </div>

                {/* Row 2: Communication & Meetings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Communication Style</label>
                    <select value={profile.preferredCommunicationStyle || ''} onChange={e => onUpdate({ preferredCommunicationStyle: e.target.value as any })} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {COMMUNICATION_PREFERENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{COMMUNICATION_PREFERENCE_OPTIONS.find(o => o.value === profile.preferredCommunicationStyle)?.description}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Meeting Culture</label>
                    <select value={profile.preferredMeetingCulture || ''} onChange={e => onUpdate({ preferredMeetingCulture: e.target.value as any })} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {MEETING_CULTURE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{MEETING_CULTURE_OPTIONS.find(o => o.value === profile.preferredMeetingCulture)?.description}</p>
                  </div>
                </div>

                {/* Row 3: Conflict & Mentorship */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Conflict Resolution</label>
                    <select value={profile.preferredConflictResolution || ''} onChange={e => onUpdate({ preferredConflictResolution: e.target.value as any })} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {CONFLICT_RESOLUTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{CONFLICT_RESOLUTION_OPTIONS.find(o => o.value === profile.preferredConflictResolution)?.description}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mentorship Style</label>
                    <select value={profile.preferredMentorshipStyle || ''} onChange={e => onUpdate({ preferredMentorshipStyle: e.target.value as any })} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {MENTORSHIP_APPROACH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{MENTORSHIP_APPROACH_OPTIONS.find(o => o.value === profile.preferredMentorshipStyle)?.description}</p>
                  </div>
                </div>

                {/* Row 4: Growth Goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Growth Goals</label>
                    <select value={profile.growthGoals || ''} onChange={e => onUpdate({ growthGoals: e.target.value as any })} className="w-full p-4 bg-gray-50 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {GROWTH_EXPECTATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{GROWTH_EXPECTATION_OPTIONS.find(o => o.value === profile.growthGoals)?.description}</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 flex items-center gap-4">
                    <Sparkles className="w-10 h-10 text-purple-500 flex-shrink-0"/>
                    <p className="text-xs font-bold text-purple-800">These preferences help match you with hiring managers whose leadership style complements how you work best.</p>
                  </div>
                </div>
              </section>

              <section className="pt-12 border-t"><h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center"><Globe className="w-6 h-6 mr-2 text-indigo-500" /> Localization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Your Timezone</label><select value={profile.timezone || ''} onChange={e => onUpdate({ timezone: e.target.value })} className="w-full p-4 bg-gray-50 rounded-2xl font-black focus:ring-2 focus:ring-blue-100 outline-none"><option value="">Select...</option>{TIMEZONE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} ({o.offset})</option>)}</select></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">Languages</label><LanguageManager languages={profile.languages || []} onChange={l => onUpdate({ languages: l })} /></div>
                </div>
              </section>
              
              {/* Work Experience Section */}
              <section className="pt-12 border-t">
                <ExperienceSection
                  experiences={profile.experience || []}
                  onEdit={handleEditExperience}
                  onAdd={handleAddExperience}
                  isEditable={true}
                />
              </section>

              {/* Education Section */}
              <section className="pt-12 border-t">
                <EducationSection
                  education={profile.educationHistory || []}
                  onEdit={handleEditEducation}
                  onAdd={handleAddEducation}
                  isEditable={true}
                />
                <div className="mt-6 bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
                  <GraduationCap className="w-10 h-10 text-blue-500"/>
                  <p className="text-xs font-bold text-blue-800">Highlight bootcamps or self-taught paths—many Open partners value non-traditional excellence.</p>
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

      {/* Experience Edit Panel */}
      <ExperienceEditPanel
        experience={experienceToEdit}
        isOpen={showExperiencePanel}
        onClose={() => setShowExperiencePanel(false)}
        onSave={handleSaveExperience}
        onDelete={handleDeleteExperience}
      />

      {/* Education Edit Panel */}
      <EducationEditPanel
        education={educationToEdit}
        isOpen={showEducationPanel}
        onClose={() => setShowEducationPanel(false)}
        onSave={handleSaveEducation}
        onDelete={handleDeleteEducation}
      />
    </div>
  );
};

export default CandidateProfileTabs;
