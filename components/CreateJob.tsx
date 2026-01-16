import React, { useState } from 'react';
import { JobPosting, WorkMode, SeniorityLevel, TeamMember, JobType, JobSkill } from '../types';
import { generateJobDescription } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { 
    ArrowLeft, ArrowRight, Zap, Award, Heart, CheckCircle, Users, UserCheck, 
    Trash2, Plus, X, Clock, Globe, Shield, DollarSign, Briefcase, GraduationCap, Target, Sparkles, Building2, AlertTriangle
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import JobSkillRequirementSelector from './JobSkillRequirementSelector';
import ImpactScopeSelector from './ImpactScopeSelector';
import { CULTURAL_VALUES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES, SKILLS_LIST } from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';
import { WORK_INTENSITY_OPTIONS, AUTONOMY_LEVEL_OPTIONS, TEAM_SIZE_PREF_OPTIONS, AMBIGUITY_TOLERANCE_OPTIONS, COLLABORATION_FREQ_OPTIONS, TIMEZONE_OVERLAP_OPTIONS } from '../constants/workStyleData';
import { COMMON_TECH_STACK } from '../constants/companyData';

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
        approvals: { hiringManager: { status: 'pending', assignedTo: '' }, finance: { status: 'pending', assignedTo: '' } }
    });

    const handleUpdateSkill = (index: number, updated: JobSkill) => {
        const ns = [...(jobData.requiredSkills || [])]; ns[index] = updated;
        setJobData({ ...jobData, requiredSkills: ns });
    };

    const handleRemoveSkill = (index: number) => {
        setJobData({ ...jobData, requiredSkills: jobData.requiredSkills?.filter((_, i) => i !== index) });
    };

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
                        <div><label className="block text-xs font-black text-gray-400 uppercase mb-2">Role Title *</label><input value={jobData.title || ''} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 border rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g., Senior Full-Stack Engineer" /></div>
                        <div><label className="block text-xs font-black text-gray-400 uppercase mb-2">Location *</label><input value={jobData.location || ''} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 border rounded-2xl font-bold focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g., London, UK or Remote" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-xs font-black text-gray-400 uppercase mb-2">Seniority</label><select value={jobData.seniority} onChange={e => setJobData({...jobData, seniority: e.target.value as any})} className="w-full p-4 border rounded-2xl bg-white font-bold">{Object.values(SeniorityLevel).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                        <div><label className="block text-xs font-black text-gray-400 uppercase mb-2">Work Mode</label><div className="flex gap-2">{Object.values(WorkMode).map(m => <button key={m} onClick={() => setJobData({...jobData, workMode: m})} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${jobData.workMode === m ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>{m}</button>)}</div></div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2"><label className="block text-xs font-black text-gray-400 uppercase">Job Description</label><button onClick={handleGenerateDescription} disabled={isGenerating || !jobData.title} className="text-xs font-black text-blue-600 uppercase flex items-center gap-1 hover:text-blue-700 disabled:opacity-50"><Sparkles className="w-3 h-3"/> {isGenerating ? 'Generating...' : 'Generate AI Description'}</button></div>
                        <textarea value={jobData.description || ''} onChange={e => setJobData({...jobData, description: e.target.value})} rows={6} className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none resize-none" placeholder="Describe the mission and daily life of the role..." />
                    </div>
                </div>
            );
            case 2: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Requirements</h2><p className="text-gray-500">Precision levels for technical skills.</p></div>
                    <GroupedMultiSelect label="Search Technical Skills *" options={SKILLS_LIST} selected={jobData.requiredSkills?.map(s => s.name) || []} onChange={names => {
                        const existing = jobData.requiredSkills || [];
                        const updated = names.map(n => existing.find(e => e.name === n) || { name: n, required_level: 3, weight: 'preferred' });
                        setJobData({...jobData, requiredSkills: updated as any});
                    }} grouped={true} searchable={true} />
                    <div className="space-y-4">{jobData.requiredSkills?.map((s, i) => <JobSkillRequirementSelector key={s.name} skill={s} onChange={u => handleUpdateSkill(i, u)} onRemove={() => handleRemoveSkill(i)} />)}</div>
                    <div className="pt-8 border-t"><h3 className="text-xl font-black mb-4 flex items-center"><Target className="w-5 h-5 mr-2 text-blue-500"/> Required Impact Scope</h3><ImpactScopeSelector currentScope={jobData.required_impact_scope} onChangeCurrent={s => setJobData({...jobData, required_impact_scope: s})} maxSelections={1} /></div>
                </div>
            );
            case 3: return (
                <div className="space-y-8 animate-in slide-in-from-right-4">
                    <div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">Environment</h2><p className="text-gray-500">Budget and work style alignment.</p></div>
                    <div className="bg-green-50 p-8 rounded-[2rem] border border-green-100">
                        <h3 className="text-lg font-black text-green-900 mb-6 flex items-center"><DollarSign className="w-5 h-5 mr-2"/> Salary Range *</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-[10px] font-black text-green-700 uppercase mb-2">Currency</label><select value={jobData.salaryCurrency} onChange={e => setJobData({...jobData, salaryCurrency: e.target.value})} className="w-full p-4 rounded-xl border border-green-200 font-bold bg-white"><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></div>
                            <div><label className="block text-[10px] font-black text-green-700 uppercase mb-2">Minimum</label><input type="number" value={jobData.salaryMin || ''} onChange={e => setJobData({...jobData, salaryMin: parseInt(e.target.value) || undefined})} className="w-full p-4 rounded-xl border border-green-200 font-bold focus:ring-2 focus:ring-green-300 outline-none" placeholder="e.g. 100000" /></div>
                            <div><label className="block text-[10px] font-black text-green-700 uppercase mb-2">Maximum</label><input type="number" value={jobData.salaryMax || ''} onChange={e => setJobData({...jobData, salaryMax: parseInt(e.target.value) || undefined})} className="w-full p-4 rounded-xl border border-green-200 font-bold focus:ring-2 focus:ring-green-300 outline-none" placeholder="e.g. 150000" /></div>
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
