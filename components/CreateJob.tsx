import React, { useState, useEffect } from 'react';
import { JobPosting, WorkMode, SeniorityLevel, TeamMember, JobType, JobSkill } from '../types';
import { generateJobDescription } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { 
    ArrowLeft, ArrowRight, Zap, Award, Heart, CheckCircle, Users, UserCheck, 
    Trash2, Plus, X, ChevronDown, ChevronUp, Clock, Globe, Shield, 
    DollarSign, Briefcase, GraduationCap, Target, FileText, Sparkles,
    Building2, AlertTriangle
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import JobSkillRequirementSelector from './JobSkillRequirementSelector';
import ImpactScopeSelector from './ImpactScopeSelector';
import { 
    CULTURAL_VALUES, 
    PERKS_CATEGORIES, 
    CHARACTER_TRAITS_CATEGORIES, 
    SKILLS_LIST, 
    SKILL_LEVEL_METADATA,
    INDUSTRIES 
} from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';
import { 
    WORK_INTENSITY_OPTIONS, 
    AUTONOMY_LEVEL_OPTIONS, 
    TEAM_SIZE_PREF_OPTIONS,
    AMBIGUITY_TOLERANCE_OPTIONS,
    COLLABORATION_FREQ_OPTIONS,
    TIMEZONE_OVERLAP_OPTIONS,
    CHANGE_FREQUENCY_OPTIONS,
    INNOVATION_STABILITY_OPTIONS
} from '../constants/workStyleData';
import { COMMON_TECH_STACK } from '../constants/companyData';

interface Props {
    onPublish: (job: JobPosting) => void;
    onCancel: () => void;
    teamMembers: TeamMember[];
    companyProfile?: any;
}

const STEPS = [
    { id: 1, title: 'Role Basics', icon: Briefcase },
    { id: 2, title: 'Skills & Requirements', icon: Zap },
    { id: 3, title: 'Compensation & Logistics', icon: DollarSign },
    { id: 4, title: 'Culture & Environment', icon: Heart },
    { id: 5, title: 'Review & Publish', icon: CheckCircle }
];

const CreateJob: React.FC<Props> = ({ onPublish, onCancel, teamMembers, companyProfile }) => {
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [jobData, setJobData] = useState<Partial<JobPosting>>({
        title: '',
        description: '',
        location: '',
        workMode: WorkMode.Remote,
        seniority: SeniorityLevel.Senior,
        contractTypes: [JobType.FullTime],
        requiredSkills: [],
        values: [],
        perks: [],
        desiredTraits: [],
        requiredTraits: [],
        salaryCurrency: 'USD',
        salaryMin: undefined,
        salaryMax: undefined,
        responsibilities: [],
        key_deliverables: [],
        success_metrics: [],
        tech_stack: [],
        required_impact_scope: 3,
        required_education_level: undefined,
        education_required: false,
        team_structure: '',
        growth_opportunities: '',
        impact_statement: '',
        // Work Style (inherit from company defaults)
        workStyleRequirements: companyProfile?.workStyleCulture || {},
        workStyleDealbreakers: [],
        teamRequirements: companyProfile?.teamStructure || {},
        teamDealbreakers: [],
        // Approvals
        approvals: { 
            hiringManager: { status: 'pending', assignedTo: '' }, 
            finance: { status: 'pending', assignedTo: '' } 
        }
    });

    const handleAddSkill = (skillName: string) => {
        if (!skillName || jobData.requiredSkills?.some(s => s.name === skillName)) return;
        const newSkill: JobSkill = { name: skillName, required_level: 3, weight: 'preferred' };
        setJobData({ ...jobData, requiredSkills: [...(jobData.requiredSkills || []), newSkill] });
    };

    const handleUpdateSkill = (index: number, updated: JobSkill) => {
        const newSkills = [...(jobData.requiredSkills || [])];
        newSkills[index] = updated;
        setJobData({ ...jobData, requiredSkills: newSkills });
    };

    const handleRemoveSkill = (index: number) => {
        setJobData({ ...jobData, requiredSkills: jobData.requiredSkills?.filter((_, i) => i !== index) });
    };

    const handleAddResponsibility = () => {
        setJobData({ ...jobData, responsibilities: [...(jobData.responsibilities || []), ''] });
    };

    const handleUpdateResponsibility = (index: number, value: string) => {
        const newResp = [...(jobData.responsibilities || [])];
        newResp[index] = value;
        setJobData({ ...jobData, responsibilities: newResp });
    };

    const handleRemoveResponsibility = (index: number) => {
        setJobData({ ...jobData, responsibilities: jobData.responsibilities?.filter((_, i) => i !== index) });
    };

    const toggleWorkStyleDealbreaker = (field: string) => {
        const current = jobData.workStyleDealbreakers || [];
        const exists = current.includes(field);
        setJobData({ ...jobData, workStyleDealbreakers: exists ? current.filter(f => f !== field) : [...current, field] });
    };

    const toggleTeamDealbreaker = (field: string) => {
        const current = jobData.teamDealbreakers || [];
        const exists = current.includes(field);
        setJobData({ ...jobData, teamDealbreakers: exists ? current.filter(f => f !== field) : [...current, field] });
    };

    const handleGenerateDescription = async () => {
        if (!jobData.title) return;
        setIsGenerating(true);
        try {
            const generated = await generateJobDescription(jobData.title, (jobData.requiredSkills as any) || []);
            setJobData({ ...jobData, description: generated });
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const validateStep = (stepNum: number): boolean => {
        switch (stepNum) {
            case 1: return !!(jobData.title && jobData.location && jobData.seniority);
            case 2: return (jobData.requiredSkills?.length || 0) >= 1;
            case 3: return !!(jobData.salaryMin || jobData.salaryMax);
            default: return true;
        }
    };

    const canProceed = validateStep(step);

    const handleSubmit = () => onPublish(jobData as JobPosting);

    const DealbreakerToggle = ({ field, list, onToggle }: { field: string; list: string[]; onToggle: () => void }) => (
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={list.includes(field)} onChange={onToggle} className="w-3.5 h-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500" />
            <span className={`text-[10px] font-bold uppercase ${list.includes(field) ? 'text-red-600' : 'text-gray-400'}`}>Required</span>
        </label>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                        <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Role Basics</h2><p className="text-gray-500 mt-2">Define the core details of this position</p></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Role Title *</label><input value={jobData.title || ''} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g., Senior Full-Stack Engineer" /></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Location *</label><input value={jobData.location || ''} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g., San Francisco, CA or Remote - US" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Seniority Level *</label><select value={jobData.seniority || ''} onChange={e => setJobData({...jobData, seniority: e.target.value as SeniorityLevel})} className="w-full p-4 border border-gray-200 rounded-xl bg-white font-bold outline-none">{Object.values(SeniorityLevel).map(level => (<option key={level} value={level}>{level}</option>))}</select></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-2">Work Mode *</label><div className="flex gap-2">{Object.values(WorkMode).map(mode => (<button key={mode} type="button" onClick={() => setJobData({...jobData, workMode: mode})} className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${jobData.workMode === mode ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{mode}</button>))}</div></div>
                        </div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Contract Types</label><div className="flex flex-wrap gap-2">{Object.values(JobType).map(type => (<button key={type} type="button" onClick={() => { const current = jobData.contractTypes || []; const exists = current.includes(type); setJobData({ ...jobData, contractTypes: exists ? current.filter(t => t !== type) : [...current, type] }); }} className={`px-4 py-2 rounded-lg font-bold text-sm border-2 transition-all ${jobData.contractTypes?.includes(type) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{type}</button>))}</div></div>
                        <div><div className="flex items-center justify-between mb-2"><label className="block text-sm font-bold text-gray-700">Job Description</label><button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !jobData.title} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"><Sparkles className="w-4 h-4" />{isGenerating ? 'Generating...' : 'Generate with AI'}</button></div><textarea value={jobData.description || ''} onChange={e => setJobData({...jobData, description: e.target.value})} rows={6} className="w-full p-4 border border-gray-200 rounded-xl outline-none resize-none" placeholder="Describe the role and team..." /></div>
                        <div><div className="flex items-center justify-between mb-2"><label className="block text-sm font-bold text-gray-700">Key Responsibilities</label><button type="button" onClick={handleAddResponsibility} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button></div><div className="space-y-2">{(jobData.responsibilities || []).map((resp, idx) => (<div key={idx} className="flex gap-2"><input value={resp} onChange={e => handleUpdateResponsibility(idx, e.target.value)} className="flex-1 p-3 border border-gray-200 rounded-lg outline-none" placeholder="e.g., Design scalable backend services" /><button type="button" onClick={() => handleRemoveResponsibility(idx)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button></div>))}{(jobData.responsibilities?.length || 0) === 0 && (<div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200"><p className="text-gray-400 text-sm">No responsibilities added yet</p></div>)}</div></div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                        <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Skills & Requirements</h2><p className="text-gray-500 mt-2">Define the technical skills and qualifications</p></div>
                        <GroupedMultiSelect label="Required Skills *" options={SKILLS_LIST} selected={jobData.requiredSkills?.map(s => s.name) || []} onChange={(names) => { const existing = jobData.requiredSkills || []; const newSkills = names.map(name => { const existingSkill = existing.find(s => s.name === name); if (existingSkill) return existingSkill; return { name, required_level: 3 as any, weight: 'preferred' as any }; }); setJobData({ ...jobData, requiredSkills: newSkills }); }} grouped={true} searchable={true} placeholder="Search and add skills..." />
                        <div className="space-y-4">{(jobData.requiredSkills || []).map((skill, idx) => (<JobSkillRequirementSelector key={skill.name} skill={skill} onChange={(updated) => handleUpdateSkill(idx, updated)} onRemove={() => handleRemoveSkill(idx)} />))}</div>
                        <div className="pt-8 border-t border-gray-100"><h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><GraduationCap className="w-5 h-5 mr-2 text-purple-500" /> Education</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-bold text-gray-700 mb-2">Required Education</label><select value={jobData.required_education_level || ''} onChange={e => setJobData({...jobData, required_education_level: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-white"><option value="">Not required</option>{EDUCATION_LEVELS.map(level => (<option key={level} value={level}>{level}</option>))}</select></div><div><label className="block text-sm font-bold text-gray-700 mb-2">Preferred Education</label><select value={jobData.preferred_education_level || ''} onChange={e => setJobData({...jobData, preferred_education_level: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-white"><option value="">Not specified</option>{EDUCATION_LEVELS.map(level => (<option key={level} value={level}>{level}</option>))}</select></div></div></div>
                        <div className="pt-8 border-t border-gray-100"><h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Target className="w-5 h-5 mr-2 text-blue-500" /> Impact Scope</h3><ImpactScopeSelector currentScope={jobData.required_impact_scope} onChangeCurrent={(scope) => setJobData({...jobData, required_impact_scope: scope})} maxSelections={1} /></div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                        <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Compensation & Logistics</h2></div>
                        <div className="bg-green-50 p-8 rounded-2xl border border-green-100">
                            <h3 className="text-lg font-bold text-green-900 mb-6 flex items-center"><DollarSign className="w-5 h-5 mr-2" /> Salary Range *</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div><label className="block text-sm font-bold text-green-800 mb-2">Currency</label><select value={jobData.salaryCurrency || 'USD'} onChange={e => setJobData({...jobData, salaryCurrency: e.target.value})} className="w-full p-3 border border-green-200 rounded-xl bg-white font-bold"><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></div>
                                <div><label className="block text-sm font-bold text-green-800 mb-2">Minimum</label><input type="number" value={jobData.salaryMin || ''} onChange={e => setJobData({...jobData, salaryMin: parseInt(e.target.value) || undefined})} className="w-full p-3 border border-green-200 rounded-xl font-bold" /></div>
                                <div><label className="block text-sm font-bold text-green-800 mb-2">Maximum</label><input type="number" value={jobData.salaryMax || ''} onChange={e => setJobData({...jobData, salaryMax: parseInt(e.target.value) || undefined})} className="w-full p-3 border border-green-200 rounded-xl font-bold" /></div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500" /> Work Style Requirements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2"><div className="flex justify-between items-center"><label className="block text-xs font-black text-gray-500 uppercase">Intensity</label><DealbreakerToggle field="workIntensity" list={jobData.workStyleDealbreakers || []} onToggle={() => toggleWorkStyleDealbreaker('workIntensity')} /></div><select value={jobData.workStyleRequirements?.workIntensity || ''} onChange={e => setJobData({...jobData, workStyleRequirements: { ...jobData.workStyleRequirements, workIntensity: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-gray-50 text-sm font-bold"><option value="">Use Company Default</option>{WORK_INTENSITY_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}</select></div>
                                <div className="space-y-2"><div className="flex justify-between items-center"><label className="block text-xs font-black text-gray-500 uppercase">Autonomy</label><DealbreakerToggle field="autonomyLevel" list={jobData.workStyleDealbreakers || []} onToggle={() => toggleWorkStyleDealbreaker('autonomyLevel')} /></div><select value={jobData.workStyleRequirements?.autonomyLevel || ''} onChange={e => setJobData({...jobData, workStyleRequirements: { ...jobData.workStyleRequirements, autonomyLevel: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-gray-50 text-sm font-bold"><option value="">Use Company Default</option>{AUTONOMY_LEVEL_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}</select></div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                        <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Culture & Environment</h2></div>
                        <GroupedMultiSelect label="Team Values" options={CULTURAL_VALUES} selected={jobData.values || []} onChange={vals => setJobData({...jobData, values: vals})} maxSelections={5} />
                        <GroupedMultiSelect label="Perks & Benefits" options={PERKS_CATEGORIES} selected={jobData.perks || []} onChange={vals => setJobData({...jobData, perks: vals})} grouped={true} />
                        <GroupedMultiSelect label="Desired Traits" options={CHARACTER_TRAITS_CATEGORIES} selected={jobData.desiredTraits || []} onChange={vals => setJobData({...jobData, desiredTraits: vals})} grouped={true} />
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                        <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Review & Publish</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-blue-500" /> Basics</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-bold text-gray-500">Title:</span> {jobData.title}</p>
                                    <p><span className="font-bold text-gray-500">Location:</span> {jobData.location}</p>
                                </div>
                                <button onClick={() => setStep(1)} className="mt-4 text-sm text-blue-600 font-bold hover:underline">Edit</button>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-500" /> Skills</h3>
                                <div className="flex flex-wrap gap-2">{(jobData.requiredSkills || []).slice(0, 5).map(s => (<span key={s.name} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">{s.name}</span>))}</div>
                                <button onClick={() => setStep(2)} className="mt-4 text-sm text-blue-600 font-bold hover:underline">Edit</button>
                            </div>
                        </div>
                        {teamMembers.length > 0 && (
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center"><UserCheck className="w-5 h-5 mr-2 text-purple-500" /> Approvals</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-bold text-gray-700 mb-2">Hiring Manager</label><select value={jobData.approvals?.hiringManager?.assignedTo || ''} onChange={e => setJobData({...jobData, approvals: {...jobData.approvals, hiringManager: { status: 'pending', assignedTo: e.target.value }}})} className="w-full p-3 border border-gray-200 rounded-xl bg-white"><option value="">Select approver...</option>{teamMembers.filter(m => m.role === 'hiring_manager' || m.role === 'admin').map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}</select></div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-2">Finance</label><select value={jobData.approvals?.finance?.assignedTo || ''} onChange={e => setJobData({...jobData, approvals: {...jobData.approvals, finance: { status: 'pending', assignedTo: e.target.value }}})} className="w-full p-3 border border-gray-200 rounded-xl bg-white"><option value="">Select approver...</option>{teamMembers.filter(m => m.role === 'finance' || m.role === 'admin').map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}</select></div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-5xl mx-auto my-8 px-4 pb-24">
            <div className="flex items-center justify-center gap-2 mb-8">{STEPS.map((s, idx) => (<React.Fragment key={s.id}><button onClick={() => setStep(s.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${step === s.id ? 'bg-blue-600 text-white shadow-lg scale-105' : step > s.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}><s.icon className="w-4 h-4" /><span className="hidden md:inline">{s.title}</span></button>{idx < STEPS.length - 1 && (<div className={`w-8 h-0.5 ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />)}</React.Fragment>))}</div>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="flex-1 p-8 overflow-y-auto">{renderStepContent()}</div>
                <div className="bg-gray-50 p-8 border-t flex justify-between items-center"><button onClick={() => step > 1 ? setStep(step - 1) : onCancel()} className="font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2"><ArrowLeft className="w-4 h-4" />{step === 1 ? 'Cancel' : 'Back'}</button><div className="flex gap-4"><button onClick={onCancel} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900">Save Draft</button><button onClick={() => step < 5 ? setStep(step + 1) : handleSubmit()} disabled={!canProceed && step < 5} className={`px-10 py-3 rounded-xl font-black shadow-lg transition-all flex items-center gap-2 ${canProceed || step === 5 ? 'bg-gray-900 text-white hover:bg-black' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>{step === 5 ? 'Publish Job' : 'Next Step'}<ArrowRight className="w-4 h-4" /></button></div></div>
            </div>
        </div>
    );
};

export default CreateJob;
