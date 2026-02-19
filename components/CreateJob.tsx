import React, { useState, useCallback, useEffect } from 'react';
import { JobPosting, WorkMode, SeniorityLevel, TeamMember, JobType, JobSkill, MemberRole } from '../types';
import { generateJobDescription } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useJobPermissions } from '../hooks/useJobPermissions';
import { applyHMPreferencesToJob, hasExistingWorkStyleValues, JobWithHMMetadata } from '../services/hmPreferencesService';
import {
    ArrowLeft, ArrowRight, Zap, Award, Heart, CheckCircle, Users, UserCheck,
    Trash2, Plus, X, Clock, Globe, Shield, DollarSign, Briefcase, GraduationCap, Target, Sparkles, Building2, AlertTriangle, Lock, User, FileText, Loader2, ChevronDown, ChevronUp, Search
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import SkillPillEditor from './SkillPillEditor';
import ImpactScopeSelector from './ImpactScopeSelector';
import RoleTitleAutocomplete from './RoleTitleAutocomplete';
import ReadOnlyField, { ReadOnlySection, AutoPopulatedBadge } from './ReadOnlyField';
import JobApprovalPanel from './JobApprovalPanel';
import { CULTURAL_VALUES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES, SKILLS_LIST } from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';
import { WORK_INTENSITY_OPTIONS, AUTONOMY_LEVEL_OPTIONS, TEAM_SIZE_PREF_OPTIONS, AMBIGUITY_TOLERANCE_OPTIONS, COLLABORATION_FREQ_OPTIONS, TIMEZONE_OVERLAP_OPTIONS } from '../constants/workStyleData';
import { COMMON_TECH_STACK } from '../constants/companyData';
import { COMMON_LANGUAGES, LANGUAGE_PROFICIENCY_LEVELS, COMMON_TIMEZONES, TIMEZONE_OVERLAP_OPTIONS as LOGISTICS_TIMEZONE_OVERLAP } from '../constants/languageData';
import { getSkillLevelForSeniority, getImpactScopeForSeniority } from '../constants/seniorityData';
import { CERTIFICATION_CATEGORIES } from '../constants/certifications';
import { fetchCertifications, fetchRegulatoryDomains, groupCertificationsByCategory } from '../utils/certifications';
import type { Certification, RegulatoryDomain } from '../types';

interface Props {
    onPublish: (job: JobPosting) => void;
    onCancel: () => void;
    teamMembers: TeamMember[];
    teamMembersLoading?: boolean;
    companyProfile?: any;
}

const STEPS = [
    { id: 1, title: 'Basics', icon: FileText },
    { id: 2, title: 'Requirements', icon: Target },
    { id: 3, title: 'Team', icon: Users },
    { id: 4, title: 'Compensation', icon: DollarSign },
    { id: 5, title: 'Culture', icon: Heart },
    { id: 6, title: 'Review', icon: CheckCircle }
];

const CreateJob: React.FC<Props> = ({ onPublish, onCancel, teamMembers, teamMembersLoading = false, companyProfile }) => {
    const { user, teamRole } = useAuth();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [hmPrefsApplied, setHmPrefsApplied] = useState(false);
    const [hmPrefsSource, setHmPrefsSource] = useState<string | null>(null);
    const [certSectionOpen, setCertSectionOpen] = useState(false);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [regulatoryDomainsList, setRegulatoryDomainsList] = useState<RegulatoryDomain[]>([]);
    const [certLoading, setCertLoading] = useState(false);
    const [certSearch, setCertSearch] = useState('');
    const [jobData, setJobData] = useState<JobWithHMMetadata>({
        title: '', description: '', location: '', workMode: WorkMode.Remote, seniority: SeniorityLevel.Senior,
        contractTypes: [JobType.FullTime], requiredSkills: [], values: [], perks: [], desiredTraits: [], requiredTraits: [],
        salaryCurrency: 'USD', salaryMin: undefined, salaryMax: undefined, responsibilities: [], keyDeliverables: [],
        successMetrics: [], techStack: [], requiredImpactScope: 3, workStyleRequirements: companyProfile?.workStyleCulture || {},
        workStyleDealbreakers: [], teamRequirements: companyProfile?.teamStructure || {}, teamDealbreakers: [],
        approvals: { hiringManager: { status: 'pending', assignedTo: '' }, finance: { status: 'pending', assignedTo: '' } },
        preferredLanguages: [], requiredTimezoneOverlap: undefined,
        visaSponsorshipAvailable: false, equityOffered: false, relocationAssistance: false,
        requiredCertifications: [], preferredCertifications: [], regulatoryDomains: []
    });

    // Fetch certifications & regulatory domains when section is opened
    useEffect(() => {
        if (!certSectionOpen || certifications.length > 0) return;
        setCertLoading(true);
        Promise.all([fetchCertifications(), fetchRegulatoryDomains()])
            .then(([certs, domains]) => {
                setCertifications(certs);
                setRegulatoryDomainsList(domains);
            })
            .catch(err => console.error('Failed to fetch certifications:', err))
            .finally(() => setCertLoading(false));
    }, [certSectionOpen]);

    // Get permissions based on team role
    const permissions = useJobPermissions(jobData, teamRole, user?.id);

    // Auto-populate from HM preferences when HM is assigned
    useEffect(() => {
        async function applyHMPrefs() {
            const hmId = jobData.approvals?.hiringManager?.assignedTo;
            if (!hmId || hmPrefsApplied) return;
            if (hasExistingWorkStyleValues(jobData)) return;

            const updatedJob = await applyHMPreferencesToJob(jobData, hmId);
            if (updatedJob) {
                setJobData(prev => ({ ...prev, ...updatedJob }));
                setHmPrefsApplied(true);
                // Find HM name from team members
                const hm = teamMembers.find(m => m.id === hmId || m.user_id === hmId);
                setHmPrefsSource(hm?.name || null);
            }
        }
        applyHMPrefs();
    }, [jobData.approvals?.hiringManager?.assignedTo, hmPrefsApplied, teamMembers]);

    // Approval handlers
    const handleApprove = async (role: 'hiringManager' | 'finance') => {
        const currentApprovals = jobData.approvals || {};
        const updatedApprovals = {
            ...currentApprovals,
            [role]: {
                ...currentApprovals[role],
                status: 'approved',
                date: new Date().toISOString()
            }
        };

        // Check if all approvals are complete
        const allApproved = updatedApprovals.hiringManager?.status === 'approved' &&
                          updatedApprovals.finance?.status === 'approved';

        setJobData(prev => ({
            ...prev,
            approvals: updatedApprovals,
            status: allApproved ? 'published' : 'pending_approval'
        }));

        // TODO: Send notification to job creator and other stakeholders
    };

    const handleRequestChanges = async (role: 'hiringManager' | 'finance', feedback: string) => {
        const currentApprovals = jobData.approvals || {};
        const updatedApprovals = {
            ...currentApprovals,
            [role]: {
                ...currentApprovals[role],
                status: 'rejected',
                feedback,
                date: new Date().toISOString()
            }
        };

        setJobData(prev => ({
            ...prev,
            approvals: updatedApprovals,
            status: 'draft'
        }));

        // TODO: Send notification to job creator with feedback
    };

    const handleAssignApprover = (role: 'hiringManager' | 'finance', userId: string) => {
        setJobData(prev => ({
            ...prev,
            approvals: {
                ...prev.approvals,
                [role]: {
                    status: 'pending',
                    assignedTo: userId
                }
            }
        }));

        // Reset HM prefs flag if assigning new HM
        if (role === 'hiringManager') {
            setHmPrefsApplied(false);
        }

        // TODO: Send notification to assigned approver
    };

    const handleUpdateSkill = (index: number, updated: JobSkill) => {
        const ns = [...(jobData.requiredSkills || [])]; ns[index] = updated;
        setJobData({ ...jobData, requiredSkills: ns });
    };

    const handleRemoveSkill = (index: number) => {
        setJobData({ ...jobData, requiredSkills: jobData.requiredSkills?.filter((_, i) => i !== index) });
    };

    // Handler for role title autocomplete
    const handleTitleChange = useCallback((title: string) => {
        setJobData(prev => ({ ...prev, title }));
    }, []);

    const handleRoleSelect = useCallback((
        roleId: string | undefined,
        roleName: string,
        templateSkills: JobSkill[]
    ) => {
        console.log('[CreateJob] handleRoleSelect called:', { roleId, roleName, templateSkillsCount: templateSkills.length, templateSkills });

        setJobData(prev => {
            // Get skill level based on current seniority
            const skillLevel = getSkillLevelForSeniority(prev.seniority);
            console.log('[CreateJob] Using skill level for seniority:', prev.seniority, '→', skillLevel);

            // Apply seniority-based skill level to template skills
            const adjustedTemplateSkills = templateSkills.map(skill => ({
                ...skill,
                required_level: skillLevel
            }));

            // Merge template skills with any existing manually-added skills
            const existingSkills = prev.requiredSkills || [];
            const templateSkillNames = new Set(adjustedTemplateSkills.map(s => s.name.toLowerCase()));

            // Keep manually added skills that aren't in the template
            const manualSkills = existingSkills.filter(
                s => !templateSkillNames.has(s.name.toLowerCase())
            );

            // Combine: template skills first, then manual additions
            const mergedSkills = [...adjustedTemplateSkills, ...manualSkills];

            // Also set impact scope based on seniority
            const impactScope = getImpactScopeForSeniority(prev.seniority);

            const newState = {
                ...prev,
                title: roleName,
                canonicalRoleId: roleId,
                requiredSkills: roleId ? mergedSkills : existingSkills,
                requiredImpactScope: roleId ? impactScope : prev.requiredImpactScope
            };

            console.log('[CreateJob] Updated jobData.requiredSkills:', newState.requiredSkills);
            console.log('[CreateJob] Updated requiredImpactScope:', newState.requiredImpactScope);
            return newState;
        });
    }, []);

    // Handler for seniority change - updates skill levels and impact scope
    const handleSeniorityChange = useCallback((newSeniority: SeniorityLevel) => {
        setJobData(prev => {
            const skillLevel = getSkillLevelForSeniority(newSeniority);
            const impactScope = getImpactScopeForSeniority(newSeniority);

            console.log('[CreateJob] Seniority changed to:', newSeniority, '→ skill level:', skillLevel, ', impact scope:', impactScope);

            // Update skill levels for all existing skills
            const updatedSkills = (prev.requiredSkills || []).map(skill => ({
                ...skill,
                required_level: skillLevel
            }));

            return {
                ...prev,
                seniority: newSeniority,
                requiredSkills: updatedSkills,
                requiredImpactScope: impactScope
            };
        });
    }, []);

    const handleGenerateDescription = async () => {
        if (!jobData.title) return;
        setIsGenerating(true);
        try {
            const gen = await generateJobDescription(jobData.title, (jobData.requiredSkills as any) || []);
            setJobData({ ...jobData, description: gen });
        } catch (e) { console.error(e); } finally { setIsGenerating(false); }
    };

    // Warnings-based validation: allow step progression but show warnings
    const getStepWarnings = (currentStep: number): string[] => {
        const warnings: string[] = [];

        if (currentStep === 1) {
            if (!jobData.title) warnings.push('Job title is recommended');
            if (!jobData.location) warnings.push('Location is recommended');
        }
        if (currentStep === 2) {
            if ((jobData.requiredSkills?.length || 0) < 1) {
                warnings.push('At least one skill is recommended');
            }
        }
        if (currentStep === 3) {
            // Team Preferences - no strict requirements, just suggestions
            if (!jobData.workStyleRequirements?.workIntensity && !jobData.workStyleRequirements?.autonomyLevel) {
                warnings.push('Consider setting work style preferences for better candidate matching');
            }
        }
        if (currentStep === 4) {
            // Compensation - salary warning
            if (!jobData.salaryMin && !jobData.salaryMax) {
                warnings.push('Salary range not set - Finance approval will be required');
            }
        }
        // Step 5 (Company Culture) is read-only, no warnings needed
        // Step 6 (Finalize) has its own publish validation

        return warnings;
    };

    // Strict validation only for final publish
    const canPublish = (): boolean => {
        return !!(
            jobData.title &&
            jobData.location &&
            (jobData.requiredSkills?.length || 0) >= 1 &&
            (jobData.salaryMin || jobData.salaryMax)
        );
    };

    // Allow step navigation even with warnings (except step 1 minimum requirements)
    const validate = () => {
        // Only block if absolutely necessary (title is truly required)
        if (step === 1) return !!jobData.title;
        return true; // Allow progression with warnings for other steps
    };

    const DealbreakerToggle = ({ field, list, onToggle }: any) => (
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={list.includes(field)} onChange={onToggle} className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-700 text-red-600 focus:ring-red-500" />
            <span className={`text-[10px] font-bold uppercase ${list.includes(field) ? 'text-red-600' : 'text-gray-400 dark:text-gray-500'}`}>Required</span>
        </label>
    );

    const renderStep = () => {
        switch (step) {
            case 1: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="font-heading text-3xl text-primary">Role Basics</h2><p className="text-muted">Essential details for the position.</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RoleTitleAutocomplete
                            value={jobData.title || ''}
                            canonicalRoleId={jobData.canonicalRoleId}
                            onTitleChange={handleTitleChange}
                            onRoleSelect={handleRoleSelect}
                        />
                        <div><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Location *</label><input value={jobData.location || ''} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 border rounded-2xl font-bold focus:ring-2 focus:ring-accent-coral outline-none" placeholder="e.g., London, UK or Remote" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Seniority</label><select value={jobData.seniority} onChange={e => handleSeniorityChange(e.target.value as SeniorityLevel)} className="w-full p-4 border rounded-2xl bg-white dark:bg-surface font-bold">{Object.values(SeniorityLevel).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                        <div><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Work Mode</label><div className="flex gap-2">{Object.values(WorkMode).map(m => <button key={m} onClick={() => setJobData({...jobData, workMode: m})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${jobData.workMode === m ? 'border-accent-coral bg-accent-coral-bg text-accent-coral' : 'border-border text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:border-gray-700'}`}>{m}</button>)}</div></div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2"><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase">Job Description</label><button onClick={handleGenerateDescription} disabled={isGenerating || !jobData.title} className="text-xs font-black text-accent-coral uppercase flex items-center gap-1 hover:text-accent-coral disabled:opacity-50"><Sparkles className="w-3 h-3"/> {isGenerating ? 'Generating...' : 'Generate AI Description'}</button></div>
                        <textarea value={jobData.description || ''} onChange={e => setJobData({...jobData, description: e.target.value})} rows={6} className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-accent-coral outline-none resize-none" placeholder="Describe the mission and daily life of the role..." />
                    </div>
                </div>
            );
            case 2: {
                // Debug logging for Requirements step
                console.log('[CreateJob] Step 2 render - jobData.requiredSkills:', jobData.requiredSkills);
                console.log('[CreateJob] Step 2 render - jobData.canonicalRoleId:', jobData.canonicalRoleId);

                const hasTemplateSkills = !!(jobData.canonicalRoleId && jobData.requiredSkills && jobData.requiredSkills.length > 0);

                return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="font-heading text-3xl text-primary">Requirements</h2><p className="text-muted">Precision levels for technical skills.</p></div>
                    {hasTemplateSkills && (
                        <div className="bg-accent-coral-bg border border-accent-coral-bg rounded-2xl p-4">
                            <p className="text-sm text-accent-coral">
                                <span className="font-bold">Skills pre-populated from role template ({jobData.requiredSkills?.length} skills).</span> You can edit, add, or remove skills as needed.
                            </p>
                        </div>
                    )}
                    <GroupedMultiSelect label="Search Technical Skills *" options={SKILLS_LIST} selected={jobData.requiredSkills?.map(s => s.name) || []} onChange={names => {
                        const existing = jobData.requiredSkills || [];
                        const skillLevel = getSkillLevelForSeniority(jobData.seniority);
                        const updated = names.map(n => existing.find(e => e.name === n) || { name: n, required_level: skillLevel, weight: 'preferred' });
                        setJobData({...jobData, requiredSkills: updated as any});
                    }} grouped={true} searchable={true} hideSelectedTags={true} />
                    <SkillPillEditor
                        skills={jobData.requiredSkills || []}
                        onUpdateSkill={handleUpdateSkill}
                        onRemoveSkill={handleRemoveSkill}
                    />
                    <div className="pt-8 border-t"><h3 className="text-xl font-black mb-4 flex items-center"><Target className="w-5 h-5 mr-2 text-accent-coral"/> Required Impact Scope</h3><ImpactScopeSelector currentScope={jobData.requiredImpactScope} onChangeCurrent={s => setJobData({...jobData, requiredImpactScope: s})} maxSelections={1} /></div>

                    {/* Certifications & Compliance - Collapsible */}
                    <div className="pt-8 border-t">
                        <button
                            type="button"
                            onClick={() => setCertSectionOpen(!certSectionOpen)}
                            className="w-full flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-xl font-black flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500"/>
                                    Certifications & Regulatory Experience
                                    <span className="ml-2 text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Optional</span>
                                </h3>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 text-left">For roles requiring specific credentials or compliance expertise</p>
                            </div>
                            {certSectionOpen ? <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                        </button>

                        {certSectionOpen && (
                            <div className="mt-6 space-y-8">
                                {certLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 text-gray-400 dark:text-gray-500 animate-spin" />
                                        <span className="ml-3 text-sm text-gray-400 dark:text-gray-500 font-bold">Loading certifications...</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search */}
                                        {certifications.length > 15 && (
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                <input
                                                    value={certSearch}
                                                    onChange={e => setCertSearch(e.target.value)}
                                                    placeholder="Search certifications..."
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-transparent rounded-xl text-sm font-bold focus:bg-white dark:bg-surface focus:ring-2 focus:ring-accent-coral outline-none"
                                                />
                                            </div>
                                        )}

                                        {/* Required Certifications */}
                                        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                                            <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Must-have certifications</label>
                                            <p className="text-xs text-amber-600 mb-4">Candidates without these won't be matched</p>
                                            {certifications.length === 0 ? (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No certifications available</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {Object.entries(groupCertificationsByCategory(
                                                        certSearch
                                                            ? certifications.filter(c => c.name.toLowerCase().includes(certSearch.toLowerCase()))
                                                            : certifications
                                                    )).map(([category, certs]) => {
                                                        const categoryLabel = CERTIFICATION_CATEGORIES.find(c => c.value === category)?.label || category;
                                                        const selectedInCategory = certs.filter(c => (jobData.requiredCertifications || []).includes(c.id)).length;
                                                        return (
                                                            <div key={category}>
                                                                <p className="text-xs font-black text-amber-800 mb-2">
                                                                    {categoryLabel}
                                                                    {selectedInCategory > 0 && <span className="ml-1 text-amber-600">({selectedInCategory} selected)</span>}
                                                                </p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                                                    {certs.map(cert => {
                                                                        const isRequired = (jobData.requiredCertifications || []).includes(cert.id);
                                                                        const isPreferred = (jobData.preferredCertifications || []).includes(cert.id);
                                                                        return (
                                                                            <label key={cert.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${isRequired ? 'bg-amber-100' : 'hover:bg-amber-100/50'} ${isPreferred ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isRequired}
                                                                                    disabled={isPreferred}
                                                                                    onChange={() => {
                                                                                        const current = jobData.requiredCertifications || [];
                                                                                        const updated = isRequired ? current.filter(id => id !== cert.id) : [...current, cert.id];
                                                                                        setJobData({...jobData, requiredCertifications: updated});
                                                                                    }}
                                                                                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                                                                />
                                                                                <span className={`text-sm font-bold ${isRequired ? 'text-amber-900' : 'text-gray-700 dark:text-gray-300 dark:text-gray-600'}`}>{cert.name}</span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Preferred Certifications */}
                                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-[2rem] border border-border">
                                            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Nice-to-have certifications</label>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Candidates with these will rank higher</p>
                                            {certifications.length === 0 ? (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No certifications available</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {Object.entries(groupCertificationsByCategory(
                                                        certSearch
                                                            ? certifications.filter(c => c.name.toLowerCase().includes(certSearch.toLowerCase()))
                                                            : certifications
                                                    )).map(([category, certs]) => {
                                                        const categoryLabel = CERTIFICATION_CATEGORIES.find(c => c.value === category)?.label || category;
                                                        const selectedInCategory = certs.filter(c => (jobData.preferredCertifications || []).includes(c.id)).length;
                                                        return (
                                                            <div key={category}>
                                                                <p className="text-xs font-black text-muted mb-2">
                                                                    {categoryLabel}
                                                                    {selectedInCategory > 0 && <span className="ml-1 text-gray-400 dark:text-gray-500">({selectedInCategory} selected)</span>}
                                                                </p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                                                    {certs.map(cert => {
                                                                        const isPreferred = (jobData.preferredCertifications || []).includes(cert.id);
                                                                        const isRequired = (jobData.requiredCertifications || []).includes(cert.id);
                                                                        return (
                                                                            <label key={cert.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${isPreferred ? 'bg-white dark:bg-surface' : 'hover:bg-white dark:bg-surface/70'} ${isRequired ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isPreferred}
                                                                                    disabled={isRequired}
                                                                                    onChange={() => {
                                                                                        const current = jobData.preferredCertifications || [];
                                                                                        const updated = isPreferred ? current.filter(id => id !== cert.id) : [...current, cert.id];
                                                                                        setJobData({...jobData, preferredCertifications: updated});
                                                                                    }}
                                                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-accent-coral focus:ring-accent-coral"
                                                                                />
                                                                                <span className={`text-sm font-bold ${isPreferred ? 'text-primary' : 'text-muted'}`}>{cert.name}</span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Regulatory Domains */}
                                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-[2rem] border border-border">
                                            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Regulatory experience needed</label>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Industries where compliance knowledge is critical for this role</p>
                                            {regulatoryDomainsList.length === 0 ? (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No regulatory domains available</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {regulatoryDomainsList.map(domain => {
                                                        const isSelected = (jobData.regulatoryDomains || []).includes(domain.id);
                                                        return (
                                                            <label key={domain.id} className={`flex items-start gap-2.5 p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-white dark:bg-surface border border-accent-coral-light' : 'hover:bg-white dark:bg-surface/70'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {
                                                                        const current = jobData.regulatoryDomains || [];
                                                                        const updated = isSelected ? current.filter(id => id !== domain.id) : [...current, domain.id];
                                                                        setJobData({...jobData, regulatoryDomains: updated});
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
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
            }
            case 3: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8">
                        <h2 className="font-heading text-3xl text-primary">Team Preferences</h2>
                        <p className="text-muted">Define the working style and traits for this role</p>
                    </div>

                    {/* Auto-populated from HM preferences notice */}
                    {hmPrefsApplied && hmPrefsSource && (
                        <div className="bg-accent-coral-bg border border-accent-coral-light rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-accent-coral" />
                                <div>
                                    <p className="font-bold text-accent-coral">Auto-populated from {hmPrefsSource}'s team preferences</p>
                                    <p className="text-sm text-accent-coral">Fields below have been pre-filled and can be customized for this role.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(1)} // Navigate to settings
                                className="text-xs font-bold text-accent-coral hover:text-accent-coral underline"
                            >
                                View My Defaults
                            </button>
                        </div>
                    )}

                    {/* Work Environment Section */}
                    <div className="bg-accent-green-bg p-8 rounded-[2rem] border border-accent-green-bg">
                        <h3 className="text-lg font-black text-accent-green mb-6 flex items-center">
                            <Globe className="w-5 h-5 mr-2"/> Work Environment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-[10px] font-black text-accent-green uppercase tracking-widest">Work Intensity</label>
                                    <DealbreakerToggle field="workIntensity" list={jobData.workStyleDealbreakers || []} onToggle={() => { const l = jobData.workStyleDealbreakers || []; setJobData({...jobData, workStyleDealbreakers: l.includes('workIntensity') ? l.filter(x => x !== 'workIntensity') : [...l, 'workIntensity']}); }} />
                                </div>
                                <select value={jobData.workStyleRequirements?.workIntensity || ''} onChange={e => setJobData({...jobData, workStyleRequirements: {...jobData.workStyleRequirements, workIntensity: e.target.value as any}})} className="w-full p-4 bg-white dark:bg-surface border border-accent-green-bg rounded-xl font-bold">
                                    <option value="">Inherit Company Default</option>
                                    {WORK_INTENSITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-[10px] font-black text-accent-green uppercase tracking-widest">Autonomy Level</label>
                                    <DealbreakerToggle field="autonomyLevel" list={jobData.workStyleDealbreakers || []} onToggle={() => { const l = jobData.workStyleDealbreakers || []; setJobData({...jobData, workStyleDealbreakers: l.includes('autonomyLevel') ? l.filter(x => x !== 'autonomyLevel') : [...l, 'autonomyLevel']}); }} />
                                </div>
                                <select value={jobData.workStyleRequirements?.autonomyLevel || ''} onChange={e => setJobData({...jobData, workStyleRequirements: {...jobData.workStyleRequirements, autonomyLevel: e.target.value as any}})} className="w-full p-4 bg-white dark:bg-surface border border-accent-green-bg rounded-xl font-bold">
                                    <option value="">Inherit Company Default</option>
                                    {AUTONOMY_LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="block text-[10px] font-black text-accent-green uppercase tracking-widest">Ambiguity Tolerance</label>
                                    <DealbreakerToggle field="ambiguityTolerance" list={jobData.workStyleDealbreakers || []} onToggle={() => { const l = jobData.workStyleDealbreakers || []; setJobData({...jobData, workStyleDealbreakers: l.includes('ambiguityTolerance') ? l.filter(x => x !== 'ambiguityTolerance') : [...l, 'ambiguityTolerance']}); }} />
                                </div>
                                <select value={jobData.workStyleRequirements?.ambiguityTolerance || ''} onChange={e => setJobData({...jobData, workStyleRequirements: {...jobData.workStyleRequirements, ambiguityTolerance: e.target.value as any}})} className="w-full p-4 bg-white dark:bg-surface border border-accent-green-bg rounded-xl font-bold">
                                    <option value="">Inherit Company Default</option>
                                    {AMBIGUITY_TOLERANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Team Collaboration Section */}
                    <div className="bg-accent-green-bg p-8 rounded-[2rem] border border-accent-green">
                        <h3 className="text-lg font-black text-accent-green mb-6 flex items-center">
                            <Users className="w-5 h-5 mr-2"/> Team Collaboration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-accent-green uppercase tracking-widest">Team Size Preference</label>
                                <select value={jobData.teamRequirements?.teamSizePreference || ''} onChange={e => setJobData({...jobData, teamRequirements: {...jobData.teamRequirements, teamSizePreference: e.target.value as any}})} className="w-full p-4 bg-white dark:bg-surface border border-accent-green rounded-xl font-bold">
                                    <option value="">Any Team Size</option>
                                    {TEAM_SIZE_PREF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-accent-green uppercase tracking-widest">Collaboration Frequency</label>
                                <select value={jobData.teamRequirements?.collaborationFrequency || ''} onChange={e => setJobData({...jobData, teamRequirements: {...jobData.teamRequirements, collaborationFrequency: e.target.value as any}})} className="w-full p-4 bg-white dark:bg-surface border border-accent-green rounded-xl font-bold">
                                    <option value="">Inherit Company Default</option>
                                    {COLLABORATION_FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Character Traits Section */}
                    <div className="bg-accent-coral-bg p-8 rounded-[2rem] border border-accent-coral-bg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-accent-coral flex items-center">
                                <Heart className="w-5 h-5 mr-2"/> Character Traits
                            </h3>
                            {hmPrefsApplied && hmPrefsSource && (jobData.requiredTraits?.length || jobData.desiredTraits?.length) && (
                                <AutoPopulatedBadge sourceName={hmPrefsSource} />
                            )}
                        </div>
                        <GroupedMultiSelect
                            label="Required Character Traits (Strict Matching)"
                            options={CHARACTER_TRAITS_CATEGORIES}
                            selected={jobData.requiredTraits || []}
                            onChange={v => setJobData({...jobData, requiredTraits: v})}
                            grouped={true}
                            maxSelections={5}
                            helpText="These traits are non-negotiable requirements for this role."
                        />
                        <div className="mt-6">
                            <GroupedMultiSelect
                                label="Preferred Character Traits"
                                options={CHARACTER_TRAITS_CATEGORIES}
                                selected={jobData.desiredTraits || []}
                                onChange={v => setJobData({...jobData, desiredTraits: v})}
                                grouped={true}
                                maxSelections={5}
                                helpText="Nice-to-have traits that improve match quality."
                            />
                        </div>
                    </div>
                </div>
            );
            case 4: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8">
                        <h2 className="font-heading text-3xl text-primary">Compensation & Perks</h2>
                        <p className="text-muted">Budget, benefits, and contract details</p>
                    </div>

                    {/* Salary Section */}
                    {permissions.canEditCompensation ? (
                        <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100">
                            <h3 className="text-lg font-black text-green-900 mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2"/> Salary Range *</h3>
                            {/* Show pending approval indicator when HM fills salary */}
                            {!permissions.canApproveCompensation && (jobData.salaryMin || jobData.salaryMax) && jobData.approvals?.finance?.status !== 'approved' && (
                                <div className="mb-4 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Salary proposal pending finance approval</span>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="block text-[10px] font-black text-green-700 uppercase mb-2">Currency</label><select value={jobData.salaryCurrency} onChange={e => setJobData({...jobData, salaryCurrency: e.target.value})} className="w-full p-4 rounded-xl border border-green-200 font-bold bg-white dark:bg-surface"><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></div>
                                <div><label className="block text-[10px] font-black text-green-700 uppercase mb-2">Minimum</label><input type="number" value={jobData.salaryMin || ''} onChange={e => setJobData({...jobData, salaryMin: parseInt(e.target.value) || undefined})} className="w-full p-4 rounded-xl border border-green-200 font-bold focus:ring-2 focus:ring-green-300 outline-none" placeholder="e.g. 100000" /></div>
                                <div><label className="block text-[10px] font-black text-green-700 uppercase mb-2">Maximum</label><input type="number" value={jobData.salaryMax || ''} onChange={e => setJobData({...jobData, salaryMax: parseInt(e.target.value) || undefined})} className="w-full p-4 rounded-xl border border-green-200 font-bold focus:ring-2 focus:ring-green-300 outline-none" placeholder="e.g. 150000" /></div>
                            </div>
                            <div className="mt-4 flex items-center gap-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={jobData.equityOffered || false} onChange={e => setJobData({...jobData, equityOffered: e.target.checked})} className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500" />
                                    <span className="font-bold text-green-800">Equity Offered</span>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <ReadOnlySection title="Compensation" source="finance" sourceName="Finance Team">
                            <div className="bg-green-50 p-6 rounded-xl">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ReadOnlyField label="Currency" value={jobData.salaryCurrency || 'USD'} source="finance" />
                                    <ReadOnlyField label="Minimum" value={jobData.salaryMin ? `${jobData.salaryMin.toLocaleString()}` : 'Not set'} source="finance" variant="currency" />
                                    <ReadOnlyField label="Maximum" value={jobData.salaryMax ? `${jobData.salaryMax.toLocaleString()}` : 'Not set'} source="finance" variant="currency" />
                                </div>
                            </div>
                        </ReadOnlySection>
                    )}

                    {/* Benefits & Incentives */}
                    <div className="bg-accent-coral-bg p-8 rounded-[2rem] border border-accent-coral-bg">
                        <h3 className="text-lg font-black text-accent-coral mb-6 flex items-center"><Award className="w-5 h-5 mr-2"/> Benefits & Incentives</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">Relocation Help</p>
                                    <p className="text-xs text-muted">Assistance provided</p>
                                </div>
                                <button type="button" onClick={() => setJobData({...jobData, relocationAssistance: !jobData.relocationAssistance})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${jobData.relocationAssistance ? 'bg-accent-coral' : 'bg-border'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-surface shadow transition-transform ${jobData.relocationAssistance ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-surface rounded-xl border">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-gray-200">Visa Sponsorship</p>
                                    <p className="text-xs text-muted">Can sponsor visas</p>
                                </div>
                                <button type="button" onClick={() => setJobData({...jobData, visaSponsorshipAvailable: !jobData.visaSponsorshipAvailable})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${jobData.visaSponsorshipAvailable ? 'bg-accent-coral' : 'bg-border'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-surface shadow transition-transform ${jobData.visaSponsorshipAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        <GroupedMultiSelect label="Role Perks" options={PERKS_CATEGORIES} selected={jobData.perks || []} onChange={v => setJobData({...jobData, perks: v})} grouped={true} placeholder="e.g. Unlimited PTO, 4-Day Work Week..." />
                    </div>

                    {/* Contract Details */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2rem] border">
                        <h3 className="text-lg font-black text-primary mb-6 flex items-center"><Briefcase className="w-5 h-5 mr-2"/> Contract Details</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-3">Contract Types</label>
                                <div className="flex flex-wrap gap-3">
                                    {Object.values(JobType).map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                const current = jobData.contractTypes || [];
                                                const updated = current.includes(type)
                                                    ? current.filter(t => t !== type)
                                                    : [...current, type];
                                                setJobData({...jobData, contractTypes: updated});
                                            }}
                                            className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                                                (jobData.contractTypes || []).includes(type)
                                                    ? 'border-accent-coral bg-accent-coral-bg text-accent-coral'
                                                    : 'border-border text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:border-gray-700'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Language & Timezone Requirements */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2rem] border">
                        <h3 className="text-lg font-black text-primary mb-6 flex items-center"><Globe className="w-5 h-5 mr-2"/> Language & Timezone</h3>
                        <div className="space-y-6">
                            {/* Language Requirements */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-3">Language Requirements</label>
                                <div className="space-y-3">
                                    {(jobData.preferredLanguages || []).map((lang, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <select value={lang.language} onChange={e => { const updated = [...(jobData.preferredLanguages || [])]; updated[idx] = {...updated[idx], language: e.target.value}; setJobData({...jobData, preferredLanguages: updated}); }} className="flex-1 p-3 bg-white dark:bg-surface border rounded-xl font-bold">
                                                <option value="">Select language...</option>
                                                {COMMON_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                            </select>
                                            <select value={lang.minimumLevel} onChange={e => { const updated = [...(jobData.preferredLanguages || [])]; updated[idx] = {...updated[idx], minimumLevel: e.target.value as any}; setJobData({...jobData, preferredLanguages: updated}); }} className="w-40 p-3 bg-white dark:bg-surface border rounded-xl font-bold">
                                                {LANGUAGE_PROFICIENCY_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                            </select>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={lang.required || false} onChange={e => { const updated = [...(jobData.preferredLanguages || [])]; updated[idx] = {...updated[idx], required: e.target.checked}; setJobData({...jobData, preferredLanguages: updated}); }} className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-accent-coral" />
                                                <span className="text-xs font-bold text-muted uppercase">Required</span>
                                            </label>
                                            <button type="button" onClick={() => setJobData({...jobData, preferredLanguages: jobData.preferredLanguages?.filter((_, i) => i !== idx)})} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500"><X className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setJobData({...jobData, preferredLanguages: [...(jobData.preferredLanguages || []), {language: '', minimumLevel: 'professional', required: false}]})} className="flex items-center gap-2 text-xs font-black text-accent-coral uppercase tracking-wider hover:text-accent-coral">
                                        <Plus className="w-4 h-4"/> Add Language
                                    </button>
                                </div>
                            </div>

                            {/* Timezone Overlap */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-3">Required Timezone Overlap</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {LOGISTICS_TIMEZONE_OVERLAP.map(opt => (
                                        <button key={opt.value} type="button" onClick={() => setJobData({...jobData, requiredTimezoneOverlap: opt.value as any})} className={`p-3 rounded-xl border-2 text-left transition-all ${jobData.requiredTimezoneOverlap === opt.value ? 'border-accent-coral bg-accent-coral-bg text-accent-coral' : 'border-border bg-white dark:bg-surface hover:border-gray-300 dark:border-gray-700'}`}>
                                            <p className="font-bold text-sm">{opt.label}</p>
                                            <p className="text-xs text-muted">{opt.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
            case 5: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8">
                        <h2 className="font-heading text-3xl text-primary">Company Culture</h2>
                        <p className="text-muted">These values are inherited from your company profile</p>
                    </div>

                    {/* Notice about company values */}
                    <div className="bg-gray-100 dark:bg-gray-800 border border-border rounded-2xl p-4 flex items-center gap-3">
                        <Lock className="w-5 h-5 text-muted" />
                        <div className="flex-1">
                            <p className="font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">Company-wide values shown to candidates</p>
                            <p className="text-sm text-muted">To change these, go to Company Settings.</p>
                        </div>
                        <button type="button" className="text-xs font-bold text-accent-coral hover:text-accent-coral underline">
                            Edit Company Profile
                        </button>
                    </div>

                    {/* Company Values - Read Only Display */}
                    <div className="bg-white dark:bg-surface p-8 rounded-[2rem] border-2 border-border">
                        <h3 className="text-lg font-black text-primary mb-6 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-red-500"/> Company Values
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {(companyProfile?.values || ['Innovation', 'Transparency', 'Growth']).map((value: string, idx: number) => (
                                <span key={idx} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:text-gray-600 rounded-full font-bold text-sm">
                                    {value}
                                </span>
                            ))}
                        </div>
                        {(!companyProfile?.values || companyProfile.values.length === 0) && (
                            <p className="text-gray-400 dark:text-gray-500 text-sm italic">No company values set. Add values in Company Settings.</p>
                        )}
                    </div>

                    {/* Company Mission - Read Only */}
                    {companyProfile?.missionStatement && (
                        <div className="bg-white dark:bg-surface p-8 rounded-[2rem] border-2 border-border">
                            <h3 className="text-lg font-black text-primary mb-4 flex items-center">
                                <Target className="w-5 h-5 mr-2 text-accent-coral"/> Company Mission
                            </h3>
                            <p className="text-muted leading-relaxed">{companyProfile.missionStatement}</p>
                        </div>
                    )}

                    {/* Work Environment - Read Only */}
                    <div className="bg-white dark:bg-surface p-8 rounded-[2rem] border-2 border-border">
                        <h3 className="text-lg font-black text-primary mb-6 flex items-center">
                            <Building2 className="w-5 h-5 mr-2 text-accent-green"/> Company Environment
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Remote Policy</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{companyProfile?.remotePolicy || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Company Size</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{companyProfile?.companySizeRange || companyProfile?.teamSize || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Growth Stage</p>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{companyProfile?.growthStage || companyProfile?.fundingStage || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Role-Specific Values - Editable */}
                    <div className="bg-accent-coral-bg p-8 rounded-[2rem] border border-accent-coral-bg">
                        <h3 className="text-lg font-black text-accent-coral mb-4 flex items-center">
                            <Zap className="w-5 h-5 mr-2"/> Role-Specific Values
                            <span className="ml-2 text-xs font-bold text-accent-coral bg-accent-coral-bg px-2 py-1 rounded-full">Editable</span>
                        </h3>
                        <p className="text-sm text-accent-coral mb-4">Add values specific to this role that complement company culture.</p>
                        <GroupedMultiSelect
                            label="Additional Role Values"
                            options={CULTURAL_VALUES}
                            selected={jobData.values || []}
                            onChange={v => setJobData({...jobData, values: v})}
                            maxSelections={5}
                            placeholder="e.g. Remote-First Culture, Documentation-Oriented..."
                        />
                    </div>
                </div>
            );
            case 6: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="font-heading text-3xl text-primary">Finalize & Publish</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white dark:bg-surface border-2 border-border rounded-3xl"><h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase mb-4 flex items-center"><Briefcase className="w-4 h-4 mr-2"/> Summary</h3><div className="space-y-1"><p className="font-black text-xl">{jobData.title}</p><p className="text-muted font-bold">{jobData.location} · {jobData.workMode}</p></div></div>
                        <div className="p-6 bg-white dark:bg-surface border-2 border-border rounded-3xl"><h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase mb-4 flex items-center"><DollarSign className="w-4 h-4 mr-2"/> Budget</h3><p className="font-black text-xl text-green-600">{jobData.salaryCurrency} {jobData.salaryMin?.toLocaleString()} - {jobData.salaryMax?.toLocaleString()}</p></div>
                    </div>

                    {/* HM Preferences Applied Indicator */}
                    {hmPrefsApplied && hmPrefsSource && (
                        <div className="bg-accent-coral-bg p-4 rounded-xl border border-accent-coral-light flex items-center gap-3">
                            <User className="w-5 h-5 text-accent-coral" />
                            <div>
                                <p className="font-bold text-accent-coral">Work style preferences applied from {hmPrefsSource}</p>
                                <p className="text-sm text-accent-coral">Team culture, work environment, and trait requirements have been auto-populated.</p>
                            </div>
                        </div>
                    )}

                    {/* Approval Panel */}
                    <JobApprovalPanel
                        job={jobData}
                        teamRole={teamRole}
                        currentUserId={user?.id}
                        teamMembers={teamMembers}
                        teamMembersLoading={teamMembersLoading}
                        onApprove={handleApprove}
                        onRequestChanges={handleRequestChanges}
                        onAssignApprover={handleAssignApprover}
                    />

                    {/* Approval Assignment Section */}
                    {permissions.canAssignApprovers && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-[2rem] border border-border">
                            <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase mb-6 flex items-center"><UserCheck className="w-4 h-4 mr-2"/> Assign Approvers</h3>
                            {teamMembersLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Hiring Manager</label>
                                        <div className="animate-pulse h-14 bg-border rounded-xl flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Finance Approval</label>
                                        <div className="animate-pulse h-14 bg-border rounded-xl flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 text-gray-400 dark:text-gray-500 animate-spin" />
                                        </div>
                                    </div>
                                </div>
                            ) : teamMembers.length === 0 ? (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <p className="text-sm text-amber-700 font-medium">
                                        No team members found. Add team members in Company Settings to assign approvers.
                                    </p>
                                    <p className="text-xs text-amber-600 mt-2">
                                        Team members with roles (admin, hiring_manager, finance) can be assigned as approvers.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Hiring Manager</label>
                                        {teamMembers.filter(m => m.role === 'hiring_manager' || m.role === 'admin').length === 0 ? (
                                            <p className="text-sm text-muted p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">No hiring managers available. Add team members with the "hiring_manager" or "admin" role.</p>
                                        ) : (
                                            <select
                                                value={jobData.approvals?.hiringManager?.assignedTo || ''}
                                                onChange={e => handleAssignApprover('hiringManager', e.target.value)}
                                                className="w-full p-4 rounded-xl border bg-white dark:bg-surface font-bold"
                                            >
                                                <option value="">Select Hiring Manager...</option>
                                                {teamMembers
                                                    .filter(m => m.role === 'hiring_manager' || m.role === 'admin')
                                                    .map(m => (
                                                        <option key={m.id} value={m.user_id || m.id}>
                                                            {m.name || m.email} ({m.role})
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Finance Approval</label>
                                        {teamMembers.filter(m => m.role === 'finance' || m.role === 'admin').length === 0 ? (
                                            <p className="text-sm text-muted p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">No finance approvers available. Add team members with the "finance" or "admin" role.</p>
                                        ) : (
                                            <select
                                                value={jobData.approvals?.finance?.assignedTo || ''}
                                                onChange={e => handleAssignApprover('finance', e.target.value)}
                                                className="w-full p-4 rounded-xl border bg-white dark:bg-surface font-bold"
                                            >
                                                <option value="">Select Finance Approver...</option>
                                                {teamMembers
                                                    .filter(m => m.role === 'finance' || m.role === 'admin')
                                                    .map(m => (
                                                        <option key={m.id} value={m.user_id || m.id}>
                                                            {m.name || m.email} ({m.role})
                                                        </option>
                                                    ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Debug info in dev mode */}
                            {process.env.NODE_ENV === 'development' && (
                                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                                    Debug: {teamMembersLoading ? 'Loading...' : `${teamMembers.length} team members loaded`}
                                    {teamMembers.length > 0 && ` (HM: ${teamMembers.filter(m => m.role === 'hiring_manager' || m.role === 'admin').length}, Finance: ${teamMembers.filter(m => m.role === 'finance' || m.role === 'admin').length})`}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto my-8 px-4 pb-24">
            <div className="flex items-center justify-center gap-2 mb-12">
                {STEPS.map((s, i) => <React.Fragment key={s.id}><button onClick={() => i + 1 < step && setStep(i + 1)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${step === s.id ? 'bg-accent-coral text-white shadow-xl scale-110' : step > s.id ? 'bg-green-100 text-green-700' : 'bg-white dark:bg-surface text-gray-300 dark:text-gray-600 border border-border'}`}><s.icon className="w-3.5 h-3.5"/><span className="hidden sm:inline">{s.title}</span></button>{i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-100 dark:bg-gray-800'}`} />}</React.Fragment>)}
            </div>
            <div className="bg-white dark:bg-surface rounded-[2.5rem] shadow-2xl border border-border overflow-hidden min-h-[600px] flex flex-col">
                <div className="flex-1 p-10 overflow-y-auto">{renderStep()}</div>
                <div className="bg-gray-50 dark:bg-gray-900 p-10 border-t">
                    {/* Warnings display */}
                    {getStepWarnings(step).length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                            <p className="text-amber-800 text-sm font-bold flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Before continuing:
                            </p>
                            <ul className="text-amber-700 text-sm mt-2 space-y-1">
                                {getStepWarnings(step).map(w => <li key={w}>• {w}</li>)}
                            </ul>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <button onClick={() => step > 1 ? setStep(step - 1) : onCancel()} className="flex items-center text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest hover:text-primary transition-colors"><ArrowLeft className="w-4 h-4 mr-2"/> Back</button>
                        <div className="flex gap-4">
                            <button onClick={onCancel} className="px-6 py-4 text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest hover:text-primary">Cancel</button>
                            <button
                                onClick={() => step < 6 ? setStep(step + 1) : onPublish(jobData as any)}
                                disabled={step === 6 ? !canPublish() : !validate()}
                                className={`flex items-center px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${(step === 6 ? canPublish() : validate()) ? 'bg-gray-900 text-white hover:bg-black' : 'bg-border text-gray-400 dark:text-gray-500 cursor-not-allowed'}`}
                            >
                                {step === 6 ? 'Publish Live' : 'Next Step'} <ArrowRight className="w-4 h-4 ml-2"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateJob;
