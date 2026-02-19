
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CandidateProfile, SeniorityLevel, WorkMode, JobType, Skill, LanguageEntry, Certification, CandidateCertification, RegulatoryDomain } from '../types';
import {
  User, Briefcase, Award, Heart, CheckCircle, Zap, DollarSign,
  MapPin, Clock, Lock, Unlock, Edit2, Plus, Trash2, Layout,
  ShieldCheck, Globe, Users, X, Info, Target, GraduationCap, Loader2, TrendingUp,
  Phone, Building2, Plane, Sparkles, Download, Smile, Shield, Calendar, Search
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { COMPANY_FOCUS_TYPES, MISSION_ORIENTATIONS, WORK_STYLES, CERTIFICATION_CATEGORIES } from '../constants/certifications';
import { fetchCertifications, fetchRegulatoryDomains, groupCertificationsByCategory } from '../utils/certifications';
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
    <div className="flex items-center gap-3 mt-3 bg-white dark:bg-surface p-3 rounded-xl border border-border shadow-sm">
      <button type="button" onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-coral ${isChecked ? 'bg-red-500' : 'bg-accent-coral'}`} role="switch" aria-checked={isChecked}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-surface shadow transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className={`text-sm font-bold ${isChecked ? 'text-red-700' : 'text-accent-coral'}`}>{isChecked ? 'Non-negotiable' : 'Flexible'}</span>
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
          <select value={l.language} onChange={e => update(i, { language: e.target.value })} className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 border border-border rounded-lg text-sm font-medium"><option value="">Select language...</option>{LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <select value={l.proficiency} onChange={e => update(i, { proficiency: e.target.value as any })} className="w-32 p-2 bg-gray-50 dark:bg-gray-900 border border-border rounded-lg text-sm font-medium">{LANGUAGE_PROFICIENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          <button type="button" onClick={() => remove(i)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-xs font-black text-accent-coral uppercase tracking-wider hover:text-accent-coral"><Plus className="w-3.5 h-3.5" /> Add Language</button>
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

  // Certification state
  const [candidateCerts, setCandidateCerts] = useState<(CandidateCertification & { certification?: Certification })[]>([]);
  const [certTaxonomy, setCertTaxonomy] = useState<Certification[]>([]);
  const [regulatoryDomainsList, setRegulatoryDomainsList] = useState<RegulatoryDomain[]>([]);
  const [certDataLoaded, setCertDataLoaded] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CandidateCertification | null>(null);
  const [certSaving, setCertSaving] = useState(false);
  const [certModalSearch, setCertModalSearch] = useState('');
  const [certModalData, setCertModalData] = useState({
    certificationId: '',
    status: 'active' as 'active' | 'expired' | 'in_progress',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
  });

  // Fetch cert taxonomy + candidate certs + regulatory domains
  useEffect(() => {
    if (certDataLoaded) return;
    const load = async () => {
      const [certs, domains] = await Promise.all([
        fetchCertifications().catch(() => [] as Certification[]),
        fetchRegulatoryDomains().catch(() => [] as RegulatoryDomain[]),
      ]);
      setCertTaxonomy(certs);
      setRegulatoryDomainsList(domains);

      // Fetch candidate's certifications
      const { data } = await supabase
        .from('candidate_certifications')
        .select('*, certification:certifications(*)')
        .eq('candidate_id', profile.id)
        .order('created_at', { ascending: false });
      if (data) setCandidateCerts(data);
      setCertDataLoaded(true);
    };
    load();
  }, [profile.id, certDataLoaded]);

  // Certification CRUD handlers
  const openAddCertModal = useCallback(() => {
    setEditingCert(null);
    setCertModalData({ certificationId: '', status: 'active', issueDate: '', expiryDate: '', credentialId: '' });
    setCertModalSearch('');
    setIsCertModalOpen(true);
  }, []);

  const openEditCertModal = useCallback((cert: CandidateCertification & { certification?: Certification }) => {
    setEditingCert(cert);
    setCertModalData({
      certificationId: cert.certificationId,
      status: cert.status,
      issueDate: cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
    });
    setCertModalSearch('');
    setIsCertModalOpen(true);
  }, []);

  const handleSaveCert = useCallback(async () => {
    if (!certModalData.certificationId || !certModalData.status) return;
    setCertSaving(true);

    if (editingCert) {
      // Update existing
      const { error } = await supabase
        .from('candidate_certifications')
        .update({
          status: certModalData.status,
          issue_date: certModalData.issueDate || null,
          expiry_date: certModalData.expiryDate || null,
          credential_id: certModalData.credentialId || null,
        })
        .eq('id', editingCert.id);

      if (!error) {
        setCandidateCerts(prev => prev.map(c =>
          c.id === editingCert.id
            ? { ...c, status: certModalData.status, issueDate: certModalData.issueDate || null, expiryDate: certModalData.expiryDate || null, credentialId: certModalData.credentialId || null }
            : c
        ));
      }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('candidate_certifications')
        .insert({
          candidate_id: profile.id,
          certification_id: certModalData.certificationId,
          status: certModalData.status,
          issue_date: certModalData.issueDate || null,
          expiry_date: certModalData.expiryDate || null,
          credential_id: certModalData.credentialId || null,
        })
        .select('*, certification:certifications(*)')
        .single();

      if (!error && data) {
        setCandidateCerts(prev => [data, ...prev]);
      }
    }

    setCertSaving(false);
    setIsCertModalOpen(false);
    setEditingCert(null);
  }, [certModalData, editingCert, profile.id]);

  const handleDeleteCert = useCallback(async (certId: string) => {
    const { error } = await supabase
      .from('candidate_certifications')
      .delete()
      .eq('id', certId);

    if (!error) {
      setCandidateCerts(prev => prev.filter(c => c.id !== certId));
    }
  }, []);

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
    <button onClick={() => setActiveTab(id)} className={`flex items-center px-6 py-4 font-black text-xs uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === id ? 'border-accent-coral text-accent-coral bg-accent-coral-bg/50' : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900'}`}><Icon className="w-4 h-4 mr-2" />{label}</button>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-48 bg-accent-coral rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-coral to-accent-green flex items-center justify-center text-4xl font-black shadow-inner border-4 border-white/10">{profile.name?.charAt(0) || '?'}</div>
            <div>
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="font-heading text-4xl tracking-tight">{profile.name}</h1>
                {profile.status && profile.status !== 'not_looking' && (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    profile.status === 'actively_looking' ? 'bg-green-500 text-white' :
                    profile.status === 'open_to_offers' ? 'bg-accent-coral text-white' :
                    profile.status === 'casually_browsing' ? 'bg-yellow-500 text-primary' :
                    'bg-white dark:bg-surface/10 text-accent-coral-light'
                  }`}>
                    {getStatusOption(profile.status)?.label || profile.status?.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-xl font-medium max-w-lg">
                {profile.headline || 'Add a headline to stand out'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white dark:bg-surface/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6 shadow-2xl">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className="text-accent-coral transition-all duration-1000 ease-out" strokeDasharray={`${completion}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-2xl tabular-nums">{completion}%</div>
              </div>
              <div>
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Strength</h3>
                <p className={`text-sm font-bold ${completeness.strengthColor.replace('text-', 'text-')}`}>
                  {completeness.strengthLabel}
                </p>
              </div>
            </div>
            <button
              onClick={() => exportProfileAsCV(profile)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface/10 hover:bg-white dark:bg-surface/20 text-white rounded-xl border border-white/10 transition-colors text-sm font-bold"
            >
              <Download className="w-4 h-4" />
              Export CV
            </button>
          </div>
        </div>
        {/* Profile completion tips */}
        {completion < 80 && completeness.tips.length > 0 && (
          <div className="mt-6 p-4 bg-accent-coral/10 rounded-2xl border border-accent-coral/20">
            <p className="text-sm font-bold text-accent-coral-light mb-2">Complete your profile to improve matches:</p>
            <ul className="text-sm text-accent-coral-light/80 space-y-1">
              {completeness.tips.map((tip, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-coral-light rounded-full" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-surface rounded-[2rem] shadow-xl border border-border overflow-hidden min-h-[700px] flex flex-col">
        <div className="flex border-b border-border overflow-x-auto no-scrollbar scroll-smooth"><TabButton id="overview" label="Basics" icon={Layout} /><TabButton id="career" label="Career" icon={Briefcase} /><TabButton id="preferences" label="Logistics" icon={DollarSign} /><TabButton id="values" label="Culture & Dynamics" icon={Heart} /><TabButton id="verifications" label="Verified" icon={ShieldCheck} /></div>
        <div className="flex-1 p-8 md:p-12 overflow-y-auto">
          
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              {/* Name & Headline Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={e => onUpdate({ name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-accent-coral/20 focus:bg-white dark:bg-surface transition-all outline-none font-bold text-gray-800 dark:text-gray-200"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">This is how you'll appear to recruiters</p>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={profile.headline || ''}
                    onChange={e => onUpdate({ headline: e.target.value })}
                    placeholder="e.g., Senior Product Designer | B2B SaaS Specialist"
                    maxLength={100}
                    className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-accent-coral/20 focus:bg-white dark:bg-surface transition-all outline-none font-bold text-gray-800 dark:text-gray-200"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Summarize your role and expertise</p>
                </div>
              </div>

              {/* Status Section */}
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  Job Search Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {JOB_SEARCH_STATUS_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => onUpdate({ status: option.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        profile.status === option.value
                          ? 'border-accent-coral bg-accent-coral-bg'
                          : 'border-border hover:border-gray-300 dark:border-gray-700 bg-white dark:bg-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.badgeColor}`} />
                        <span className="font-bold text-sm">{option.label}</span>
                      </div>
                      <p className="text-xs text-muted mt-1">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Bio</label>
                    <textarea
                      value={profile.bio || ''}
                      onChange={e => onUpdate({ bio: e.target.value })}
                      className="w-full p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-accent-coral/20 focus:bg-white dark:bg-surface transition-all outline-none h-48 text-gray-700 dark:text-gray-300 dark:text-gray-600 font-medium"
                      placeholder="Describe your journey, what drives you, and what you're looking for..."
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{(profile.bio?.length || 0)}/500 characters</p>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Location</label>
                    <LocationAutocomplete
                      value={profile.location || ''}
                      onChange={(value) => onUpdate({ location: value })}
                      placeholder="Search city..."
                      focusRegion="europe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                      <Globe className="w-4 h-4 inline mr-2" />Timezone
                    </label>
                    <select
                      value={profile.timezone || ''}
                      onChange={e => onUpdate({ timezone: e.target.value })}
                      className="w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-transparent focus:border-accent-coral/20 focus:bg-white dark:bg-surface transition-all outline-none font-bold text-gray-800 dark:text-gray-200"
                    >
                      <option value="">Select timezone...</option>
                      {TIMEZONE_OPTIONS.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label} ({tz.offset})</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Important for remote work matching</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-accent-coral to-accent-green rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                    <Zap className="absolute top-4 right-4 w-12 h-12 opacity-10" />
                    <h3 className="font-black text-lg mb-4 flex items-center"><Zap className="w-5 h-5 mr-2" /> Optimization</h3>
                    <p className="text-accent-coral-bg leading-relaxed font-medium mb-6">Detailed skills increase match accuracy by 40%.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-500">
              {/* Role & Seniority Section */}
              <section className="bg-gradient-to-br from-accent-coral to-accent-green rounded-[2.5rem] p-8 border border-accent-coral-bg">
                <h3 className="text-2xl font-black text-primary mb-2 flex items-center">
                  <Briefcase className="w-6 h-6 mr-2 text-accent-coral" /> Your Role & Seniority
                </h3>
                <p className="text-muted text-sm font-medium mb-8">
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

              {/* Technical Skills Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-primary mb-1 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-yellow-500" /> Technical Skills
                    </h3>
                    <p className="text-muted text-sm font-medium">
                      {profile.primaryRoleName ? `Skills for ${profile.primaryRoleName}. ` : ''}
                      Click any skill to adjust level and years.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSkillSelectorOpen(true)}
                    className="bg-accent-coral text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-accent-coral transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 inline mr-2" /> Add Skill
                  </button>
                </div>
                {profile.primaryRoleId && skillsAsJobSkills.length > 0 && (
                  <div className="bg-accent-coral-bg border border-accent-coral-bg rounded-2xl p-4 mb-6">
                    <p className="text-sm text-accent-coral">
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
                  <h3 className="text-2xl font-black text-primary mb-1 flex items-center">
                    <Target className="w-6 h-6 mr-2 text-accent-coral" /> Impact Scope
                  </h3>
                  <p className="text-muted text-sm font-medium mb-8">
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
              
              {/* Languages Section */}
              <section className="pt-12 border-t">
                <h3 className="text-2xl font-black text-primary mb-2 flex items-center"><Globe className="w-6 h-6 mr-2 text-accent-green" /> Languages</h3>
                <p className="text-muted text-sm font-medium mb-8">Languages you speak - important for international teams and global roles.</p>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border">
                  <LanguageManager languages={profile.languages || []} onChange={l => onUpdate({ languages: l })} />
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
                <div className="mt-6 bg-accent-coral-bg p-6 rounded-3xl border border-accent-coral-bg flex items-center gap-4">
                  <GraduationCap className="w-10 h-10 text-accent-coral"/>
                  <p className="text-xs font-bold text-accent-coral">Highlight bootcamps or self-taught paths—many Open partners value non-traditional excellence.</p>
                </div>
              </section>

              {/* Certifications Section */}
              <section className="pt-12 border-t">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-primary mb-1 flex items-center">
                      <Shield className="w-6 h-6 mr-2 text-amber-500" /> My Certifications
                    </h3>
                    <p className="text-muted text-sm font-medium">Professional credentials that verify your expertise.</p>
                  </div>
                  <button
                    onClick={openAddCertModal}
                    className="bg-amber-600 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 inline mr-2" /> Add Cert
                  </button>
                </div>

                {!certDataLoaded ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 text-gray-400 dark:text-gray-500 animate-spin" />
                    <span className="ml-3 text-sm text-gray-400 dark:text-gray-500 font-bold">Loading certifications...</span>
                  </div>
                ) : candidateCerts.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-border">
                    <Shield className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3 opacity-50" />
                    <h4 className="text-lg font-bold text-gray-400 dark:text-gray-500">No certifications added yet</h4>
                    <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto mt-1">
                      Add your first certification to show employers your verified credentials.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {candidateCerts.map(cert => (
                      <div key={cert.id} className="bg-surface rounded-2xl border border-border p-5 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-primary truncate">{cert.certification?.name || 'Unknown Certification'}</h4>
                            {cert.certification?.provider && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{cert.certification.provider}</p>
                            )}
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ml-3 flex-shrink-0 ${
                            cert.status === 'active' ? 'bg-green-100 text-green-700' :
                            cert.status === 'in_progress' ? 'bg-accent-coral-bg text-accent-coral' :
                            'bg-gray-100 dark:bg-gray-800 text-muted'
                          }`}>
                            {cert.status === 'in_progress' ? 'In Progress' : cert.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500 font-medium mb-3">
                          {cert.issueDate && (
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Issued {cert.issueDate}</span>
                          )}
                          {cert.expiryDate && (
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Expires {cert.expiryDate}</span>
                          )}
                          {cert.credentialId && (
                            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {cert.credentialId}</span>
                          )}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditCertModal(cert)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-muted hover:text-accent-coral hover:bg-accent-coral-bg rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCert(cert.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 max-w-4xl">
              {/* Work Modes */}
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Work Modes</label>
                <div className="flex flex-wrap gap-3">
                  {Object.values(WorkMode).map(m => (
                    <button key={m} onClick={() => { const c = profile.preferredWorkMode || []; onUpdate({ preferredWorkMode: c.includes(m) ? c.filter(x => x !== m) : [...c, m] }); }} className={`px-6 py-3 rounded-2xl text-sm font-black transition-all border-2 ${profile.preferredWorkMode?.includes(m) ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white dark:bg-surface text-muted border-border hover:border-border'}`}>{m}</button>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t">
                  <NonNegotiableToggle fieldName="work_mode" isChecked={profile.nonNegotiables?.includes('work_mode') || false} onToggle={() => toggleNonNegotiable('work_mode')} />
                </div>
              </div>

              {/* Compensation */}
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center"><DollarSign className="w-4 h-4 mr-2" />Compensation</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-muted mb-2">Minimum Salary</label>
                    <div className="flex items-center gap-2 bg-white dark:bg-surface p-2 rounded-xl border">
                      <div className="bg-accent-coral text-white px-3 py-2 rounded-lg font-black text-sm">{profile.salaryCurrency || 'USD'}</div>
                      <input type="number" value={profile.salaryMin || ''} onChange={e => onUpdate({ salaryMin: parseInt(e.target.value) || undefined })} className="w-full bg-transparent p-2 text-xl font-black text-primary outline-none" placeholder="80000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted mb-2">Target/Max Salary</label>
                    <div className="flex items-center gap-2 bg-white dark:bg-surface p-2 rounded-xl border">
                      <div className="bg-green-600 text-white px-3 py-2 rounded-lg font-black text-sm">{profile.salaryCurrency || 'USD'}</div>
                      <input type="number" value={profile.salaryMax || ''} onChange={e => onUpdate({ salaryMax: parseInt(e.target.value) || undefined })} className="w-full bg-transparent p-2 text-xl font-black text-primary outline-none" placeholder="120000" />
                    </div>
                  </div>
                </div>
                {/* Equity Toggle */}
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border mt-6">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">Open to Equity</p>
                    <p className="text-sm text-muted">Accept stock options as compensation</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdate({ openToEquity: !profile.openToEquity })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.openToEquity ? 'bg-green-500' : 'bg-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-surface shadow transition-transform ${profile.openToEquity ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <NonNegotiableToggle fieldName="salary_min" isChecked={profile.nonNegotiables?.includes('salary_min') || false} onToggle={() => toggleNonNegotiable('salary_min')} />
                </div>
              </div>

              {/* Location & Relocation */}
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center"><Plane className="w-4 h-4 mr-2" />Location & Relocation</label>
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">Open to Relocation</p>
                    <p className="text-sm text-muted">Would consider moving for the right role</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdate({ willingToRelocate: !profile.willingToRelocate })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.willingToRelocate ? 'bg-accent-coral' : 'bg-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-surface shadow transition-transform ${profile.willingToRelocate ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="mt-6">
                  <label className="block text-xs font-bold text-muted mb-2">Preferred Timezone (if different from current)</label>
                  <select
                    value={profile.preferredTimezone || ''}
                    onChange={e => onUpdate({ preferredTimezone: e.target.value || undefined })}
                    className="w-full p-4 bg-white dark:bg-surface border rounded-xl font-bold"
                  >
                    <option value="">Same as current</option>
                    {COMMON_TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company Size Preferences */}
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center"><Building2 className="w-4 h-4 mr-2" />Preferred Company Size</label>
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
                            ? 'border-accent-coral bg-accent-coral-bg text-accent-coral'
                            : 'border-border bg-white dark:bg-surface hover:border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <p className="font-black text-sm">{size.label}</p>
                        <p className="text-xs text-muted">{size.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Company Preferences */}
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center"><Target className="w-4 h-4 mr-2" />Company Preferences</label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">What type of companies do you want to work for? Select all that apply.</p>

                {/* Company Focus Type */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-muted mb-3">Company Focus</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {COMPANY_FOCUS_TYPES.map(opt => {
                      const isSelected = (profile.preferredCompanyFocus || []).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const current = profile.preferredCompanyFocus || [];
                            const updated = isSelected ? current.filter(v => v !== opt.value) : [...current, opt.value];
                            onUpdate({ preferredCompanyFocus: updated });
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-accent-coral bg-accent-coral-bg text-accent-coral'
                              : 'border-border bg-white dark:bg-surface hover:border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected && <CheckCircle className="w-4 h-4 text-accent-coral" />}
                            <span className="font-black text-sm">{opt.label}</span>
                          </div>
                          <p className="text-xs text-muted mt-1">{opt.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mission Orientation */}
                <div className="mb-8">
                  <label className="block text-xs font-bold text-muted mb-3">Mission Orientation</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {MISSION_ORIENTATIONS.map(opt => {
                      const isSelected = (profile.preferredMissionOrientation || []).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const current = profile.preferredMissionOrientation || [];
                            const updated = isSelected ? current.filter(v => v !== opt.value) : [...current, opt.value];
                            onUpdate({ preferredMissionOrientation: updated });
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-accent-coral bg-accent-coral-bg text-accent-coral'
                              : 'border-border bg-white dark:bg-surface hover:border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected && <CheckCircle className="w-4 h-4 text-accent-coral" />}
                            <span className="font-black text-sm">{opt.label}</span>
                          </div>
                          <p className="text-xs text-muted mt-1">{opt.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Work Style */}
                <div>
                  <label className="block text-xs font-bold text-muted mb-3">Work Style</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {WORK_STYLES.map(opt => {
                      const isSelected = (profile.preferredWorkStyle || []).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const current = profile.preferredWorkStyle || [];
                            const updated = isSelected ? current.filter(v => v !== opt.value) : [...current, opt.value];
                            onUpdate({ preferredWorkStyle: updated });
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-accent-coral bg-accent-coral-bg text-accent-coral'
                              : 'border-border bg-white dark:bg-surface hover:border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected && <CheckCircle className="w-4 h-4 text-accent-coral" />}
                            <span className="font-black text-sm">{opt.label}</span>
                          </div>
                          <p className="text-xs text-muted mt-1">{opt.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Regulatory Experience */}
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center"><Shield className="w-4 h-4 mr-2" />Regulatory Experience</label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Select industries where you understand compliance requirements. This helps match you with regulated industry roles.</p>
                {!certDataLoaded ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin" />
                    <span className="ml-2 text-sm text-gray-400 dark:text-gray-500 font-bold">Loading...</span>
                  </div>
                ) : regulatoryDomainsList.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">No regulatory domains available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {regulatoryDomainsList.map(domain => {
                      const isSelected = (profile.regulatoryExperience || []).includes(domain.id);
                      return (
                        <label
                          key={domain.id}
                          className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                            isSelected
                              ? 'border-accent-coral bg-accent-coral-bg'
                              : 'border-border bg-white dark:bg-surface hover:border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const current = profile.regulatoryExperience || [];
                              const updated = isSelected ? current.filter(id => id !== domain.id) : [...current, domain.id];
                              onUpdate({ regulatoryExperience: updated });
                            }}
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-700 text-accent-coral focus:ring-accent-coral"
                          />
                          <div>
                            <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-muted'}`}>{domain.name}</span>
                            {domain.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{domain.description}</p>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Call Availability */}
              <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2.5rem] border">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center"><Phone className="w-4 h-4 mr-2" />Call Availability</label>
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">Available for Quick Calls</p>
                    <p className="text-sm text-muted">Show recruiters you're ready to chat</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdate({ callReady: !profile.callReady })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.callReady ? 'bg-green-500' : 'bg-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-surface shadow transition-transform ${profile.callReady ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {profile.callReady && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-muted mb-2">Scheduling Link</label>
                    <input
                      type="url"
                      value={profile.callLink || ''}
                      onChange={e => onUpdate({ callLink: e.target.value || undefined })}
                      placeholder="https://calendly.com/your-link"
                      className="w-full p-4 bg-white dark:bg-surface border rounded-xl font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
              {/* Cultural Values */}
              <section>
                <h3 className="text-2xl font-black text-primary mb-2 flex items-center"><Heart className="w-6 h-6 mr-2 text-pink-500" /> Cultural Values</h3>
                <p className="text-muted font-medium mb-8">Principles guiding your work - select up to 5 that resonate most.</p>
                <GroupedMultiSelect label="" options={CULTURAL_VALUES} selected={profile.values || []} onChange={v => onUpdate({ values: v })} maxSelections={5} />
              </section>

              {/* Character Traits */}
              <section className="pt-12 border-t">
                <h3 className="text-2xl font-black text-primary mb-2 flex items-center"><Smile className="w-6 h-6 mr-2 text-accent-green" /> Character Traits</h3>
                <p className="text-muted font-medium mb-8">How colleagues would describe your personality.</p>
                <GroupedMultiSelect label="" options={CHARACTER_TRAITS_CATEGORIES} selected={profile.characterTraits || []} onChange={v => onUpdate({ characterTraits: v })} grouped={true} maxSelections={8} />
              </section>

              {/* Work Style Preferences */}
              <section className="pt-12 border-t">
                <h3 className="text-2xl font-black text-primary mb-2 flex items-center"><Clock className="w-6 h-6 mr-2 text-accent-coral" /> Work Style Preferences</h3>
                <p className="text-muted text-sm font-medium mb-8">How you prefer to work day-to-day. These help match you with compatible teams.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Work Schedule</label>
                    <select value={profile.workStylePreferences?.workHours || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, workHours: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {WORK_HOURS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Work Intensity</label>
                    <select value={profile.workStylePreferences?.workIntensity || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, workIntensity: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {WORK_INTENSITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Autonomy Level</label>
                    <select value={profile.workStylePreferences?.autonomyLevel || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, autonomyLevel: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {AUTONOMY_LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Decision Making</label>
                    <select value={profile.workStylePreferences?.decisionMaking || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, decisionMaking: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {DECISION_MAKING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Project Duration</label>
                    <select value={profile.workStylePreferences?.projectDuration || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, projectDuration: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {PROJECT_DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Context Switching</label>
                    <select value={profile.workStylePreferences?.contextSwitching || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, contextSwitching: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {CONTEXT_SWITCHING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Change Frequency</label>
                    <select value={profile.workStylePreferences?.changeFrequency || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, changeFrequency: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {CHANGE_FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Risk Tolerance</label>
                    <select value={profile.workStylePreferences?.riskTolerance || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, riskTolerance: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {RISK_TOLERANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Innovation vs Stability</label>
                    <select value={profile.workStylePreferences?.innovationStability || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, innovationStability: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {INNOVATION_STABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Ambiguity Tolerance</label>
                    <select value={profile.workStylePreferences?.ambiguityTolerance || ''} onChange={e => onUpdate({ workStylePreferences: {...profile.workStylePreferences, ambiguityTolerance: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {AMBIGUITY_TOLERANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* Team & Collaboration */}
              <section className="pt-12 border-t">
                <h3 className="text-2xl font-black text-primary mb-2 flex items-center"><Users className="w-6 h-6 mr-2 text-green-500" /> Team & Collaboration</h3>
                <p className="text-muted text-sm font-medium mb-8">What team environment helps you thrive? These preferences improve culture fit matching.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Ideal Team Size</label>
                    <select value={profile.teamCollaborationPreferences?.teamSizePreference || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, teamSizePreference: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {TEAM_SIZE_PREF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Ideal Org Size</label>
                    <select value={profile.teamCollaborationPreferences?.orgSizePreference || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, orgSizePreference: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {ORG_SIZE_PREF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Reporting Structure</label>
                    <select value={profile.teamCollaborationPreferences?.reportingStructure || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, reportingStructure: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {REPORTING_STRUCTURE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Team Distribution</label>
                    <select value={profile.teamCollaborationPreferences?.teamDistribution || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, teamDistribution: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {TEAM_DISTRIBUTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Collaboration Frequency</label>
                    <select value={profile.teamCollaborationPreferences?.collaborationFrequency || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, collaborationFrequency: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {COLLABORATION_FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Timezone Overlap</label>
                    <select value={profile.teamCollaborationPreferences?.timezoneOverlap || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, timezoneOverlap: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {TIMEZONE_OVERLAP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Pair Programming</label>
                    <select value={profile.teamCollaborationPreferences?.pairProgramming || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, pairProgramming: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {PAIR_PROGRAMMING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Cross-Functional Work</label>
                    <select value={profile.teamCollaborationPreferences?.crossFunctional || ''} onChange={e => onUpdate({ teamCollaborationPreferences: {...profile.teamCollaborationPreferences, crossFunctional: e.target.value as any }})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {CROSS_FUNCTIONAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* Manager & Growth Preferences */}
              <section className="pt-12 border-t">
                <h3 className="text-2xl font-black text-primary mb-2 flex items-center"><Sparkles className="w-6 h-6 mr-2 text-accent-green" /> Manager & Growth Preferences</h3>
                <p className="text-muted text-sm font-medium mb-8">Help us match you with managers whose style fits your preferences.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Preferred Leadership Style</label>
                    <select value={profile.preferredLeadershipStyle || ''} onChange={e => onUpdate({ preferredLeadershipStyle: e.target.value as any })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {LEADERSHIP_STYLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{LEADERSHIP_STYLE_OPTIONS.find(o => o.value === profile.preferredLeadershipStyle)?.description}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Preferred Feedback Frequency</label>
                    <select value={profile.preferredFeedbackFrequency || ''} onChange={e => onUpdate({ preferredFeedbackFrequency: e.target.value as any })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {FEEDBACK_FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{FEEDBACK_FREQUENCY_OPTIONS.find(o => o.value === profile.preferredFeedbackFrequency)?.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Communication Style</label>
                    <select value={profile.preferredCommunicationStyle || ''} onChange={e => onUpdate({ preferredCommunicationStyle: e.target.value as any })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {COMMUNICATION_PREFERENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{COMMUNICATION_PREFERENCE_OPTIONS.find(o => o.value === profile.preferredCommunicationStyle)?.description}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Meeting Culture</label>
                    <select value={profile.preferredMeetingCulture || ''} onChange={e => onUpdate({ preferredMeetingCulture: e.target.value as any })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {MEETING_CULTURE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{MEETING_CULTURE_OPTIONS.find(o => o.value === profile.preferredMeetingCulture)?.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Conflict Resolution</label>
                    <select value={profile.preferredConflictResolution || ''} onChange={e => onUpdate({ preferredConflictResolution: e.target.value as any })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {CONFLICT_RESOLUTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{CONFLICT_RESOLUTION_OPTIONS.find(o => o.value === profile.preferredConflictResolution)?.description}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Mentorship Style</label>
                    <select value={profile.preferredMentorshipStyle || ''} onChange={e => onUpdate({ preferredMentorshipStyle: e.target.value as any })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {MENTORSHIP_APPROACH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{MENTORSHIP_APPROACH_OPTIONS.find(o => o.value === profile.preferredMentorshipStyle)?.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Growth Goals</label>
                    <select value={profile.growthGoals || ''} onChange={e => onUpdate({ growthGoals: e.target.value as any })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border rounded-xl font-bold">
                      <option value="">Not Specified</option>
                      {GROWTH_EXPECTATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{GROWTH_EXPECTATION_OPTIONS.find(o => o.value === profile.growthGoals)?.description}</p>
                  </div>
                  <div className="bg-accent-green-bg p-6 rounded-3xl border border-accent-green-bg flex items-center gap-4">
                    <Sparkles className="w-10 h-10 text-accent-green flex-shrink-0"/>
                    <p className="text-xs font-bold text-accent-green">These preferences help match you with hiring managers whose leadership style complements how you work best.</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'verifications' && <VerificationDashboard candidateId={profile.id} stats={profile.verificationStats} skills={profile.skills} />}
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 px-12 py-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
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
      
      {/* Certification Add/Edit Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsCertModalOpen(false)}>
          <div className="bg-white dark:bg-surface rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-8 pt-8 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-primary">{editingCert ? 'Edit Certification' : 'Add Certification'}</h3>
                <button onClick={() => setIsCertModalOpen(false)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-muted hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Certification Selector (only for new) */}
              {!editingCert && (
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    Certification <span className="text-red-500">*</span>
                  </label>
                  {certTaxonomy.length > 10 && (
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        value={certModalSearch}
                        onChange={e => setCertModalSearch(e.target.value)}
                        placeholder="Search certifications..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm font-bold focus:bg-white dark:bg-surface focus:ring-2 focus:ring-accent-coral outline-none border border-border"
                      />
                    </div>
                  )}
                  <div className="max-h-48 overflow-y-auto border border-border rounded-xl">
                    {Object.entries(groupCertificationsByCategory(
                      certModalSearch
                        ? certTaxonomy.filter(c => c.name.toLowerCase().includes(certModalSearch.toLowerCase()))
                        : certTaxonomy
                    )).map(([category, certs]) => {
                      const categoryLabel = CERTIFICATION_CATEGORIES.find(c => c.value === category)?.label || category;
                      const alreadyAdded = new Set(candidateCerts.map(c => c.certificationId));
                      const availableCerts = certs.filter(c => !alreadyAdded.has(c.id));
                      if (availableCerts.length === 0) return null;
                      return (
                        <div key={category}>
                          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest sticky top-0">{categoryLabel}</div>
                          {availableCerts.map(cert => (
                            <button
                              key={cert.id}
                              type="button"
                              onClick={() => setCertModalData(prev => ({ ...prev, certificationId: cert.id }))}
                              className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${
                                certModalData.certificationId === cert.id
                                  ? 'bg-accent-coral-bg text-accent-coral'
                                  : 'text-gray-700 dark:text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900'
                              }`}
                            >
                              {cert.name}
                              {cert.provider && <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">({cert.provider})</span>}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {editingCert && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Certification</p>
                  <p className="font-bold text-primary">{editingCert.certification?.name || 'Unknown'}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {([
                    { value: 'active', label: 'Active', color: 'green' },
                    { value: 'in_progress', label: 'In Progress', color: 'blue' },
                    { value: 'expired', label: 'Expired', color: 'gray' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCertModalData(prev => ({ ...prev, status: opt.value }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${
                        certModalData.status === opt.value
                          ? opt.color === 'green' ? 'border-green-500 bg-green-50 text-green-700'
                            : opt.color === 'blue' ? 'border-accent-coral bg-accent-coral-bg text-accent-coral'
                            : 'border-gray-400 bg-gray-50 dark:bg-gray-900 text-muted'
                          : 'border-border bg-white dark:bg-surface text-muted hover:border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Issue Date</label>
                  <input
                    type="date"
                    value={certModalData.issueDate}
                    onChange={e => setCertModalData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-border font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-accent-coral outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Expiry Date</label>
                  <input
                    type="date"
                    value={certModalData.expiryDate}
                    onChange={e => setCertModalData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-border font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-accent-coral outline-none"
                  />
                </div>
              </div>

              {/* Credential ID */}
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Credential ID</label>
                <input
                  type="text"
                  value={certModalData.credentialId}
                  onChange={e => setCertModalData(prev => ({ ...prev, credentialId: e.target.value }))}
                  placeholder="e.g., ABC-123-XYZ"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-border font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-accent-coral outline-none"
                />
              </div>
            </div>

            <div className="px-8 py-6 border-t border-border flex gap-3">
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="flex-1 py-3 rounded-xl border-2 border-border text-muted font-black text-sm uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCert}
                disabled={certSaving || (!editingCert && !certModalData.certificationId)}
                className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {certSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {editingCert ? 'Update' : 'Add Certification'}
              </button>
            </div>
          </div>
        </div>
      )}

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
