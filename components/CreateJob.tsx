import React, { useState, useCallback } from 'react';
import { JobPosting, WorkMode, SeniorityLevel, TeamMember, JobType, JobSkill } from '../types';
import { generateJobDescription } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import {
    ArrowLeft, ArrowRight, Zap, Award, Heart, CheckCircle, Users, UserCheck,
    Trash2, Plus, X, Clock, Globe, Shield, DollarSign, Briefcase, GraduationCap, Target, Sparkles, Building2, AlertTriangle
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import SkillPillEditor from './SkillPillEditor';
import ImpactScopeSelector from './ImpactScopeSelector';
import RoleTitleAutocomplete from './RoleTitleAutocomplete';
import { CULTURAL_VALUES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES, SKILLS_LIST } from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';
import { WORK_INTENSITY_OPTIONS, AUTONOMY_LEVEL_OPTIONS, TEAM_SIZE_PREF_OPTIONS, AMBIGUITY_TOLERANCE_OPTIONS, COLLABORATION_FREQ_OPTIONS, TIMEZONE_OVERLAP_OPTIONS } from '../constants/workStyleData';
import { COMMON_TECH_STACK } from '../constants/companyData';
import { COMMON_LANGUAGES, LANGUAGE_PROFICIENCY_LEVELS, COMMON_TIMEZONES, TIMEZONE_OVERLAP_OPTIONS as LOGISTICS_TIMEZONE_OVERLAP } from '../constants/languageData';
import { getSkillLevelForSeniority, getImpactScopeForSeniority } from '../constants/seniorityData';

interface Props {
    onPublish: (job: JobPosting) => void;
    onCancel: () => void;
    teamMembers: TeamMember[];
    companyProfile?: any;
}

const STEPS = [
    { id: 1, title: 'Basics', icon: Briefcase },
    { id: 2, title: 'Requirements', icon: Zap },
    { id: 3, title: 'Environment', icon: Globe },
    { id: 4, title: 'Culture Fit', icon: Heart },
    { id: 5, title: 'Finalize', icon: CheckCircle }
];

const CreateJob: React.FC<Props> = ({ onPublish, onCancel, teamMembers, companyProfile }) => {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [jobData, setJobData] = useState<Partial<JobPosting>>({
        title: '', description: '', location: '', workMode: WorkMode.Remote, seniority: SeniorityLevel.Senior,
        contractTypes: [JobType.FullTime], requiredSkills: [], values: [], perks: [], desiredTraits: [], requiredTraits: [],
        salaryCurrency: 'USD', salaryMin: undefined, salaryMax: undefined, responsibilities: [], key_deliverables: [],
        success_metrics: [], tech_stack: [], required_impact_scope: 3, workStyleRequirements: companyProfile?.workStyleCulture || {},
        workStyleDealbreakers: [], teamRequirements: companyProfile?.teamStructure || {}, teamDealbreakers: [],
        approvals: { hiringManager: { status: 'pending', assignedTo: '' }, finance: { status: 'pending', assignedTo: '' } },
        preferredLanguages: [], requiredTimezoneOverlap: undefined,
        visaSponsorshipAvailable: false, equityOffered: false, relocationAssistance: false
    });

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
                canonical_role_id: roleId,
                requiredSkills: roleId ? mergedSkills : existingSkills,
                required_impact_scope: roleId ? impactScope : prev.required_impact_scope
            };

            console.log('[CreateJob] Updated jobData.requiredSkills:', newState.requiredSkills);
            console.log('[CreateJob] Updated required_impact_scope:', newState.required_impact_scope);
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
                required_impact_scope: impactScope
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

    const validate = () => {
        if (step === 1) return jobData.title && jobData.location;
        if (step === 2) return (jobData.requiredSkills?.length || 0) >= 1;
        if (step === 3) return jobData.salaryMin || jobData.salaryMax;
        return true;
    };

    const DealbreakerToggle = ({ field, list, onToggle }: any) => (
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={list.includes(field)} onChange={onToggle} className="w-3.5 h-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500" />
            <span className={`text-[10px] font-bold uppercase ${list.includes(field) ? 'text-red-600' : 'text-gray-400'}`}>Required</span>
        </label>
    );

    const renderStep = () => {
        switch (step) {
            case 1: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Role Basics</h2><p className="text-gray-500">Essential details for the position.</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RoleTitleAutocomplete
                            value={jobData.title || ''}
                            canonicalRoleId={jobData.canonical_role_id}
                            onTitleChange={handleTitleChange}
                            onRoleSelect={handleRoleSelect}
                        />
                        <div><label className="block text-xs font-black text-gray-400 uppercase mb-2">Location *</label><input value={jobData.location || ''} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 border rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g., London, UK or Remote" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-xs font-black text-gray-400 uppercase mb-2">Seniority</label><select value={jobData.seniority} onChange={e => handleSeniorityChange(e.target.value as SeniorityLevel)} className="w-full p-4 border rounded-2xl bg-white font-bold">{Object.values(SeniorityLevel).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                        <div><label className="block text-xs font-black text-gray-400 uppercase mb-2">Work Mode</label><div className="flex gap-2">{Object.values(WorkMode).map(m => <button key={m} onClick={() => setJobData({...jobData, workMode: m})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${jobData.workMode === m ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>{m}</button>)}</div></div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2"><label className="block text-xs font-black text-gray-400 uppercase">Job Description</label><button onClick={handleGenerateDescription} disabled={isGenerating || !jobData.title} className="text-xs font-black text-blue-600 uppercase flex items-center gap-1 hover:text-blue-700 disabled:opacity-50"><Sparkles className="w-3 h-3"/> {isGenerating ? 'Generating...' : 'Generate AI Description'}</button></div>
                        <textarea value={jobData.description || ''} onChange={e => setJobData({...jobData, description: e.target.value})} rows={6} className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none resize-none" placeholder="Describe the mission and daily life of the role..." />
                    </div>
                </div>
            );
            case 2: {
                // Debug logging for Requirements step
                console.log('[CreateJob] Step 2 render - jobData.requiredSkills:', jobData.requiredSkills);
                console.log('[CreateJob] Step 2 render - jobData.canonical_role_id:', jobData.canonical_role_id);

                const hasTemplateSkills = !!(jobData.canonical_role_id && jobData.requiredSkills && jobData.requiredSkills.length > 0);

                return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Requirements</h2><p className="text-gray-500">Precision levels for technical skills.</p></div>
                    {hasTemplateSkills && (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                            <p className="text-sm text-blue-700">
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
                    <div className="pt-8 border-t"><h3 className="text-xl font-black mb-4 flex items-center"><Target className="w-5 h-5 mr-2 text-blue-500"/> Required Impact Scope</h3><ImpactScopeSelector currentScope={jobData.required_impact_scope} onChangeCurrent={s => setJobData({...jobData, required_impact_scope: s})} maxSelections={1} /></div>
                </div>
            );
            }
            case 3: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Environment</h2><p className="text-gray-500">Budget, benefits, and logistics.</p></div>
                    <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100">
                        <h3 className="text-lg font-black text-green-900 mb-6 flex items-center"><DollarSign className="w-5 h-5 mr-2"/> Salary Range *</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-[10px] font-black text-green-700 uppercase mb-2">Currency</label><select value={jobData.salaryCurrency} onChange={e => setJobData({...jobData, salaryCurrency: e.target.value})} className="w-full p-4 rounded-xl border border-green-200 font-bold bg-white"><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></div>
                            <div><label className="block text-[10px] font-black text-green-700 uppercase mb-2">Minimum</label><input type="number" value={jobData.salaryMin || ''} onChange={e => setJobData({...jobData, salaryMin: parseInt(e.target.value) || undefined})} className="w-full p-4 rounded-xl border border-green-200 font-bold focus:ring-2 focus:ring-green-300 outline-none" placeholder="e.g. 100000" /></div>
                            <div><label className="block text-[10px] font-black text-green-700 uppercase mb-2">Maximum</label><input type="number" value={jobData.salaryMax || ''} onChange={e => setJobData({...jobData, salaryMax: parseInt(e.target.value) || undefined})} className="w-full p-4 rounded-xl border border-green-200 font-bold focus:ring-2 focus:ring-green-300 outline-none" placeholder="e.g. 150000" /></div>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                        <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center"><Award className="w-5 h-5 mr-2"/> Benefits & Incentives</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border">
                                <div>
                                    <p className="font-bold text-gray-800">Equity Offered</p>
                                    <p className="text-xs text-gray-500">Stock options available</p>
                                </div>
                                <button type="button" onClick={() => setJobData({...jobData, equityOffered: !jobData.equityOffered})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${jobData.equityOffered ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${jobData.equityOffered ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border">
                                <div>
                                    <p className="font-bold text-gray-800">Relocation Help</p>
                                    <p className="text-xs text-gray-500">Assistance provided</p>
                                </div>
                                <button type="button" onClick={() => setJobData({...jobData, relocationAssistance: !jobData.relocationAssistance})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${jobData.relocationAssistance ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${jobData.relocationAssistance ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border">
                                <div>
                                    <p className="font-bold text-gray-800">Visa Sponsorship</p>
                                    <p className="text-xs text-gray-500">Can sponsor visas</p>
                                </div>
                                <button type="button" onClick={() => setJobData({...jobData, visaSponsorshipAvailable: !jobData.visaSponsorshipAvailable})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${jobData.visaSponsorshipAvailable ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${jobData.visaSponsorshipAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Language Requirements */}
                    <div className="bg-gray-50 p-8 rounded-[2rem] border">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center"><Globe className="w-5 h-5 mr-2"/> Language Requirements</h3>
                        <div className="space-y-4">
                            {(jobData.preferredLanguages || []).map((lang, idx) => (
                                <div key={idx} className="flex gap-3 items-center">
                                    <select
                                        value={lang.language}
                                        onChange={e => {
                                            const updated = [...(jobData.preferredLanguages || [])];
                                            updated[idx] = {...updated[idx], language: e.target.value};
                                            setJobData({...jobData, preferredLanguages: updated});
                                        }}
                                        className="flex-1 p-4 bg-white border rounded-xl font-bold"
                                    >
                                        <option value="">Select language...</option>
                                        {COMMON_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                    <select
                                        value={lang.minimumLevel}
                                        onChange={e => {
                                            const updated = [...(jobData.preferredLanguages || [])];
                                            updated[idx] = {...updated[idx], minimumLevel: e.target.value as any};
                                            setJobData({...jobData, preferredLanguages: updated});
                                        }}
                                        className="w-48 p-4 bg-white border rounded-xl font-bold"
                                    >
                                        {LANGUAGE_PROFICIENCY_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                    <label className="flex items-center gap-2 px-4">
                                        <input
                                            type="checkbox"
                                            checked={lang.required || false}
                                            onChange={e => {
                                                const updated = [...(jobData.preferredLanguages || [])];
                                                updated[idx] = {...updated[idx], required: e.target.checked};
                                                setJobData({...jobData, preferredLanguages: updated});
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                                        />
                                        <span className="text-xs font-bold text-gray-500 uppercase">Required</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setJobData({...jobData, preferredLanguages: jobData.preferredLanguages?.filter((_, i) => i !== idx)})}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setJobData({...jobData, preferredLanguages: [...(jobData.preferredLanguages || []), {language: '', minimumLevel: 'professional', required: false}]})}
                                className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-wider hover:text-blue-700"
                            >
                                <Plus className="w-4 h-4"/> Add Language Requirement
                            </button>
                        </div>
                    </div>

                    {/* Timezone Overlap */}
                    <div className="bg-gray-50 p-8 rounded-[2rem] border">
                        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center"><Clock className="w-5 h-5 mr-2"/> Timezone Requirements</h3>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-3">Required Overlap with Team</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {LOGISTICS_TIMEZONE_OVERLAP.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setJobData({...jobData, requiredTimezoneOverlap: opt.value as any})}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            jobData.requiredTimezoneOverlap === opt.value
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <p className="font-black text-sm">{opt.label}</p>
                                        <p className="text-xs text-gray-500">{opt.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-black flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500"/> Role-Specific Work Style</h3><span className="text-[10px] font-bold text-gray-400 uppercase">Overrides Company Defaults</span></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><div className="flex justify-between items-center"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Intensity</label><DealbreakerToggle field="workIntensity" list={jobData.workStyleDealbreakers || []} onToggle={() => { const l = jobData.workStyleDealbreakers || []; setJobData({...jobData, workStyleDealbreakers: l.includes('workIntensity') ? l.filter(x => x !== 'workIntensity') : [...l, 'workIntensity']}); }} /></div><select value={jobData.workStyleRequirements?.workIntensity || ''} onChange={e => setJobData({...jobData, workStyleRequirements: {...jobData.workStyleRequirements, workIntensity: e.target.value as any}})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold"><option value="">Inherit Company Default</option>{WORK_INTENSITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                            <div className="space-y-2"><div className="flex justify-between items-center"><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Autonomy</label><DealbreakerToggle field="autonomyLevel" list={jobData.workStyleDealbreakers || []} onToggle={() => { const l = jobData.workStyleDealbreakers || []; setJobData({...jobData, workStyleDealbreakers: l.includes('autonomyLevel') ? l.filter(x => x !== 'autonomyLevel') : [...l, 'autonomyLevel']}); }} /></div><select value={jobData.workStyleRequirements?.autonomyLevel || ''} onChange={e => setJobData({...jobData, workStyleRequirements: {...jobData.workStyleRequirements, autonomyLevel: e.target.value as any}})} className="w-full p-4 bg-gray-50 border rounded-xl font-bold"><option value="">Inherit Company Default</option>{AUTONOMY_LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                        </div>
                    </div>
                </div>
            );
            case 4: return (
                <div className="space-y-12 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Culture Fit</h2><p className="text-gray-500">Values and traits that define success here.</p></div>
                    <GroupedMultiSelect label="Core Team Values" options={CULTURAL_VALUES} selected={jobData.values || []} onChange={v => setJobData({...jobData, values: v})} maxSelections={5} placeholder="e.g. Remote-First Culture, Documentation-Oriented..." />
                    <GroupedMultiSelect label="Role Perks" options={PERKS_CATEGORIES} selected={jobData.perks || []} onChange={v => setJobData({...jobData, perks: v})} grouped={true} placeholder="e.g. Unlimited PTO, 4-Day Work Week..." />
                    <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                        <GroupedMultiSelect label="Required Character Traits (Strict Matching)" options={CHARACTER_TRAITS_CATEGORIES} selected={jobData.requiredTraits || []} onChange={v => setJobData({...jobData, requiredTraits: v})} grouped={true} maxSelections={3} helpText="These traits are non-negotiable requirements for this role." />
                    </div>
                </div>
            );
            case 5: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Finalize & Publish</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white border-2 border-gray-100 rounded-3xl"><h3 className="text-sm font-black text-gray-400 uppercase mb-4 flex items-center"><Briefcase className="w-4 h-4 mr-2"/> Summary</h3><div className="space-y-1"><p className="font-black text-xl">{jobData.title}</p><p className="text-gray-500 font-bold">{jobData.location} · {jobData.workMode}</p></div></div>
                        <div className="p-6 bg-white border-2 border-gray-100 rounded-3xl"><h3 className="text-sm font-black text-gray-400 uppercase mb-4 flex items-center"><DollarSign className="w-4 h-4 mr-2"/> Budget</h3><p className="font-black text-xl text-green-600">{jobData.salaryCurrency} {jobData.salaryMin?.toLocaleString()} - {jobData.salaryMax?.toLocaleString()}</p></div>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-200">
                        <h3 className="text-sm font-black text-gray-400 uppercase mb-6 flex items-center"><UserCheck className="w-4 h-4 mr-2"/> Approvals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Hiring Manager</label><select value={jobData.approvals?.hiringManager?.assignedTo} onChange={e => setJobData({...jobData, approvals: {...jobData.approvals, hiringManager: {status: 'pending', assignedTo: e.target.value}}})} className="w-full p-4 rounded-xl border bg-white font-bold"><option value="">Unassigned</option>{teamMembers.filter(m => m.role === 'hiring_manager' || m.role === 'admin').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                            <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Finance Approval</label><select value={jobData.approvals?.finance?.assignedTo} onChange={e => setJobData({...jobData, approvals: {...jobData.approvals, finance: {status: 'pending', assignedTo: e.target.value}}})} className="w-full p-4 rounded-xl border bg-white font-bold"><option value="">Unassigned</option>{teamMembers.filter(m => m.role === 'finance' || m.role === 'admin').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                        </div>
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto my-8 px-4 pb-24">
            <div className="flex items-center justify-center gap-2 mb-12">
                {STEPS.map((s, i) => <React.Fragment key={s.id}><button onClick={() => i + 1 < step && setStep(i + 1)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${step === s.id ? 'bg-blue-600 text-white shadow-xl scale-110' : step > s.id ? 'bg-green-100 text-green-700' : 'bg-white text-gray-300 border border-gray-100'}`}><s.icon className="w-3.5 h-3.5"/><span className="hidden sm:inline">{s.title}</span></button>{i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${step > i + 1 ? 'bg-green-400' : 'bg-gray-100'}`} />}</React.Fragment>)}
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="flex-1 p-10 overflow-y-auto">{renderStep()}</div>
                <div className="bg-gray-50 p-10 border-t flex justify-between items-center">
                    <button onClick={() => step > 1 ? setStep(step - 1) : onCancel()} className="flex items-center text-gray-400 font-black uppercase tracking-widest hover:text-gray-900 transition-colors"><ArrowLeft className="w-4 h-4 mr-2"/> Back</button>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="px-6 py-4 text-gray-400 font-black uppercase tracking-widest hover:text-gray-900">Cancel</button>
                        <button onClick={() => step < 5 ? setStep(step + 1) : onPublish(jobData as any)} disabled={!validate()} className={`flex items-center px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${validate() ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>{step === 5 ? 'Publish Live' : 'Next Step'} <ArrowRight className="w-4 h-4 ml-2"/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateJob;
