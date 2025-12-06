import React, { useState } from 'react';
import { JobPosting, WorkMode, SeniorityLevel, TeamMember, JobType, JobSkill } from '../types';
import { generateJobDescription } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, ArrowRight, Zap, Award, Heart, CheckCircle, Users, UserCheck, Trash2, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import { 
  CULTURAL_VALUES, 
  PERKS_CATEGORIES, 
  CHARACTER_TRAITS_CATEGORIES,
  SKILLS_LIST
} from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';

interface Props {
    onPublish: (job: JobPosting) => void;
    onCancel: () => void;
    teamMembers: TeamMember[];
}

const CreateJob: React.FC<Props> = ({ onPublish, onCancel, teamMembers }) => {
    const [step, setStep] = useState(1);
    const [jobData, setJobData] = useState<Partial<JobPosting>>({
        companyName: "TechFlow Inc.",
        workMode: WorkMode.REMOTE,
        requiredSkills: [],
        values: [],
        perks: [],
        desiredTraits: [],
        requiredTraits: [],
        seniority: SeniorityLevel.SENIOR,
        contractTypes: [JobType.FULL_TIME],
        salaryCurrency: 'USD',
        approvals: { hiringManager: { status: 'pending', assignedTo: '' }, finance: { status: 'pending', assignedTo: '' } },
        responsibilities: [],
        key_deliverables: [],
        tech_stack: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [techInput, setTechInput] = useState("");
    const [showRoleDetails, setShowRoleDetails] = useState(true);

    const handleSuggest = async () => {
        if (!jobData.title) return;
        setIsLoading(true);
        const desc = await generateJobDescription(jobData.title, []);
        setJobData(prev => ({ ...prev, description: desc }));
        setIsLoading(false);
    };

    const updateSkill = (name: string, field: keyof JobSkill, value: any) => {
        setJobData(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills?.map(s => s.name === name ? { ...s, [field]: value } : s)
        }));
    };

    const addResponsibility = () => {
        setJobData(prev => ({
            ...prev,
            responsibilities: [...(prev.responsibilities || []), '']
        }));
    };

    const updateResponsibility = (idx: number, val: string) => {
        const updated = [...(jobData.responsibilities || [])];
        updated[idx] = val;
        setJobData(prev => ({ ...prev, responsibilities: updated }));
    };

    const removeResponsibility = (idx: number) => {
        setJobData(prev => ({
            ...prev,
            responsibilities: prev.responsibilities?.filter((_, i) => i !== idx)
        }));
    };

    const addDeliverable = () => {
        setJobData(prev => ({
            ...prev,
            key_deliverables: [...(prev.key_deliverables || []), '']
        }));
    };

    const updateDeliverable = (idx: number, val: string) => {
        const updated = [...(jobData.key_deliverables || [])];
        updated[idx] = val;
        setJobData(prev => ({ ...prev, key_deliverables: updated }));
    };

    const removeDeliverable = (idx: number) => {
        setJobData(prev => ({
            ...prev,
            key_deliverables: prev.key_deliverables?.filter((_, i) => i !== idx)
        }));
    };

    const addTechStack = () => {
        if (techInput.trim()) {
            setJobData(prev => ({
                ...prev,
                tech_stack: [...(prev.tech_stack || []), techInput.trim()]
            }));
            setTechInput("");
        }
    };

    const removeTechStack = (tech: string) => {
        setJobData(prev => ({
            ...prev,
            tech_stack: prev.tech_stack?.filter(t => t !== tech)
        }));
    };

    const handleSubmit = () => {
        onPublish(jobData as JobPosting);
    };

    return (
        <div className="max-w-5xl mx-auto my-8 px-4 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-900">Cancel</button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-center mb-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step >= 1 ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <div className={`w-24 h-1 mx-2 transition-colors ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step >= 2 ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <div className={`w-24 h-1 mx-2 transition-colors ${step >= 3 ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step >= 3 ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>3</div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="flex-1 p-8">
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Role Title</label>
                                <input 
                                    value={jobData.title || ''}
                                    onChange={e => setJobData({...jobData, title: e.target.value})}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium focus:ring-2 focus:ring-gray-900 outline-none"
                                    placeholder="e.g. Senior Frontend Engineer"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-gray-700">Location</label>
                                <input
                                    value={jobData.location || ''}
                                    onChange={e => setJobData({...jobData, location: e.target.value})}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium outline-none"
                                    placeholder="e.g. London, UK"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Seniority</label>
                                <select 
                                    value={jobData.seniority}
                                    onChange={e => setJobData({...jobData, seniority: e.target.value as SeniorityLevel})}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none"
                                >
                                    {Object.values(SeniorityLevel).map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Work Mode</label>
                                <select 
                                    value={jobData.workMode}
                                    onChange={e => setJobData({...jobData, workMode: e.target.value as WorkMode})}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none"
                                >
                                    {Object.values(WorkMode).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                             </div>
                             <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Salary Range</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number"
                                        placeholder="Min"
                                        value={jobData.salaryMin || ''}
                                        onChange={e => setJobData({...jobData, salaryMin: parseInt(e.target.value)})}
                                        className="w-full p-3 border border-gray-200 rounded-xl"
                                    />
                                    <input 
                                        type="number"
                                        placeholder="Max"
                                        value={jobData.salaryMax || ''}
                                        onChange={e => setJobData({...jobData, salaryMax: parseInt(e.target.value)})}
                                        className="w-full p-3 border border-gray-200 rounded-xl"
                                    />
                                </div>
                             </div>
                        </div>
                        
                        {/* Education Requirements */}
                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <h3 className="text-sm font-bold text-gray-700 mb-4">Education Requirements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Minimum Education Required</label>
                                    <select
                                        value={jobData.required_education_level || ''}
                                        onChange={e => setJobData({...jobData, required_education_level: e.target.value})}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none"
                                    >
                                        <option value="">No Requirement</option>
                                        {EDUCATION_LEVELS.map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Preferred Education (Nice to Have)</label>
                                    <select
                                        value={jobData.preferred_education_level || ''}
                                        onChange={e => setJobData({...jobData, preferred_education_level: e.target.value})}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none"
                                    >
                                        <option value="">No Preference</option>
                                        {EDUCATION_LEVELS.map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={jobData.education_required || false}
                                    onChange={e => setJobData({...jobData, education_required: e.target.checked})}
                                    className="mr-2 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                />
                                Education is strictly required (cannot be substituted with experience)
                            </label>
                            <p className="text-xs text-gray-400 mt-2">Leaving blank allows candidates with any education level</p>
                        </div>

                        <div>
                             <div className="flex justify-between items-center mb-2">
                                 <label className="block text-sm font-bold text-gray-700">Job Description</label>
                                 <button 
                                    onClick={handleSuggest} 
                                    disabled={!jobData.title || isLoading}
                                    className="text-xs flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 disabled:opacity-50"
                                 >
                                     <Zap className="w-3 h-3 mr-1" /> {isLoading ? 'Generating...' : 'Auto-Generate with AI'}
                                 </button>
                             </div>
                             <textarea 
                                value={jobData.description || ''}
                                onChange={e => setJobData({...jobData, description: e.target.value})}
                                className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm leading-relaxed outline-none focus:bg-white focus:ring-2 focus:ring-gray-100"
                                placeholder="Describe the role, responsibilities, and what makes your team unique..."
                             />
                        </div>

                        {/* Structured Fields Section */}
                        <div className="border rounded-2xl border-gray-200 overflow-hidden">
                            <button 
                                onClick={() => setShowRoleDetails(!showRoleDetails)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-bold text-gray-900">Role Details (Recommended)</span>
                                {showRoleDetails ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                            </button>
                            
                            {showRoleDetails && (
                                <div className="p-6 space-y-6 bg-white border-t border-gray-100">
                                    {/* Impact Statement */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Impact Statement
                                        </label>
                                        <textarea 
                                            value={jobData.impact_statement || ''}
                                            onChange={e => setJobData({...jobData, impact_statement: e.target.value})}
                                            maxLength={200}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                            placeholder="In this role, you'll directly impact..."
                                        />
                                        <p className="text-xs text-gray-400 mt-1 text-right">{jobData.impact_statement?.length || 0}/200</p>
                                    </div>

                                    {/* Key Responsibilities */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Key Responsibilities
                                        </label>
                                        <div className="space-y-2">
                                            {jobData.responsibilities?.map((resp, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input 
                                                        value={resp}
                                                        onChange={e => updateResponsibility(idx, e.target.value)}
                                                        className="flex-1 p-3 border border-gray-200 rounded-xl text-sm"
                                                        placeholder="e.g. Lead product roadmap"
                                                    />
                                                    <button 
                                                        onClick={() => removeResponsibility(idx)}
                                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={addResponsibility}
                                                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center px-1"
                                            >
                                                <Plus className="w-4 h-4 mr-1"/> Add Responsibility
                                            </button>
                                        </div>
                                    </div>

                                    {/* Key Deliverables */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Key Deliverables
                                        </label>
                                        <div className="space-y-2">
                                            {jobData.key_deliverables?.map((del, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input 
                                                        value={del}
                                                        onChange={e => updateDeliverable(idx, e.target.value)}
                                                        className="flex-1 p-3 border border-gray-200 rounded-xl text-sm"
                                                        placeholder="e.g. Ship feature X in Q1"
                                                    />
                                                    <button 
                                                        onClick={() => removeDeliverable(idx)}
                                                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={addDeliverable}
                                                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center px-1"
                                            >
                                                <Plus className="w-4 h-4 mr-1"/> Add Deliverable
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tech Stack */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Tech Stack
                                        </label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {jobData.tech_stack?.map((tech, idx) => (
                                                <span key={idx} className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                                                    {tech}
                                                    <button onClick={() => removeTechStack(tech)} className="ml-2 text-gray-400 hover:text-gray-600">
                                                        <X className="w-3 h-3"/>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                value={techInput}
                                                onChange={e => setTechInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if(e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addTechStack();
                                                    }
                                                }}
                                                className="flex-1 p-3 border border-gray-200 rounded-xl text-sm"
                                                placeholder="Type technology and press Enter (e.g. React, AWS)"
                                            />
                                            <button 
                                                onClick={addTechStack}
                                                className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                         {/* Skills */}
                         <div>
                             <h3 className="text-lg font-bold mb-4 flex items-center"><Award className="w-5 h-5 mr-2" /> Technical Skills & Requirements</h3>
                             <GroupedMultiSelect 
                                label="Add Skills"
                                options={SKILLS_LIST}
                                selected={jobData.requiredSkills?.map(s => s.name) || []}
                                onChange={(names) => {
                                    // Remove unselected
                                    const current = jobData.requiredSkills || [];
                                    const filtered = current.filter(s => names.includes(s.name));
                                    // Add new
                                    names.forEach(n => {
                                        if(!filtered.find(s => s.name === n)) {
                                            filtered.push({ name: n, minimumYears: 2, weight: 'preferred' });
                                        }
                                    });
                                    setJobData({...jobData, requiredSkills: filtered});
                                }}
                                grouped={true}
                                searchable={true}
                             />
                             
                             <div className="space-y-3 mt-4">
                                 {jobData.requiredSkills?.map((skill, idx) => (
                                     <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                         <span className="font-bold text-gray-700 w-1/3">{skill.name}</span>
                                         <div className="flex items-center space-x-4">
                                             <div className="flex items-center space-x-2">
                                                 <span className="text-xs text-gray-500 uppercase">Min Years:</span>
                                                 <input 
                                                    type="number" 
                                                    value={skill.minimumYears}
                                                    onChange={e => updateSkill(skill.name, 'minimumYears', parseInt(e.target.value))}
                                                    className="w-16 p-1 border rounded text-center font-bold"
                                                 />
                                             </div>
                                             <div className="flex gap-1">
                                                 <button 
                                                    onClick={() => updateSkill(skill.name, 'weight', 'preferred')}
                                                    className={`px-3 py-1 rounded text-xs font-bold ${skill.weight === 'preferred' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                                                 >
                                                     Nice to have
                                                 </button>
                                                 <button 
                                                    onClick={() => updateSkill(skill.name, 'weight', 'required')}
                                                    className={`px-3 py-1 rounded text-xs font-bold ${skill.weight === 'required' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-400'}`}
                                                 >
                                                     Required
                                                 </button>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                             <div>
                                 <h3 className="text-lg font-bold mb-4 flex items-center"><Heart className="w-5 h-5 mr-2" /> Culture & Values</h3>
                                 <GroupedMultiSelect
                                    label="Team Values"
                                    options={CULTURAL_VALUES}
                                    selected={jobData.values || []}
                                    onChange={vals => setJobData({...jobData, values: vals})}
                                    placeholder="Select values..."
                                    maxSelections={5}
                                 />
                             </div>
                             <div>
                                 <h3 className="text-lg font-bold mb-4 flex items-center"><UserCheck className="w-5 h-5 mr-2" /> Personality Traits</h3>
                                 <GroupedMultiSelect
                                    label="Desired Traits"
                                    options={CHARACTER_TRAITS_CATEGORIES}
                                    selected={jobData.desiredTraits || []}
                                    onChange={traits => setJobData({...jobData, desiredTraits: traits})}
                                    grouped={true}
                                    maxSelections={5}
                                 />
                             </div>
                         </div>

                         <div>
                             <h3 className="text-lg font-bold mb-4">Perks & Benefits</h3>
                             <GroupedMultiSelect
                                label="What do you offer?"
                                options={PERKS_CATEGORIES}
                                selected={jobData.perks || []}
                                onChange={p => setJobData({...jobData, perks: p})}
                                grouped={true}
                             />
                         </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold">Almost There!</h2>
                            <p className="text-gray-500">Configure approval workflows before publishing.</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
                            <h3 className="font-bold text-gray-900 flex items-center">
                                <Users className="w-5 h-5 mr-2" /> Approval Chain
                            </h3>
                            
                            {/* Hiring Manager */}
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                                <div>
                                    <div className="font-bold text-sm">Hiring Manager</div>
                                    <div className="text-xs text-gray-500">Must approve job details</div>
                                </div>
                                <select 
                                    className="p-2 border rounded-lg text-sm min-w-[200px]"
                                    value={jobData.approvals?.hiringManager?.assignedTo || ''}
                                    onChange={e => setJobData({
                                        ...jobData, 
                                        approvals: { 
                                            ...jobData.approvals, 
                                            hiringManager: { status: 'pending', assignedTo: e.target.value } 
                                        } 
                                    })}
                                >
                                    <option value="">Select Manager...</option>
                                    {teamMembers.filter(m => m.role === 'hiring_manager' || m.role === 'admin').map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Finance */}
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                                <div>
                                    <div className="font-bold text-sm">Finance Controller</div>
                                    <div className="text-xs text-gray-500">Must approve salary budget</div>
                                </div>
                                <select 
                                    className="p-2 border rounded-lg text-sm min-w-[200px]"
                                    value={jobData.approvals?.finance?.assignedTo || ''}
                                    onChange={e => setJobData({
                                        ...jobData, 
                                        approvals: { 
                                            ...jobData.approvals, 
                                            finance: { status: 'pending', assignedTo: e.target.value } 
                                        } 
                                    })}
                                >
                                    <option value="">Select Finance Rep...</option>
                                    {teamMembers.filter(m => m.role === 'finance' || m.role === 'admin').map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700 border border-blue-100">
                            Once submitted, this job will be in <b>Pending Approval</b> state until all stakeholders approve.
                        </div>
                    </div>
                )}
                </div>

                <div className="bg-gray-50 p-8 border-t border-gray-100 flex justify-between items-center">
                    {step > 1 ? (
                        <button onClick={() => setStep(s => s - 1)} className="flex items-center text-gray-600 font-bold hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2"/> Back
                        </button>
                    ) : <div></div>}
                    
                    {step < 3 ? (
                        <button onClick={() => setStep(s => s + 1)} className="flex items-center bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg transition-transform hover:-translate-y-0.5">
                            Next Step <ArrowRight className="w-4 h-4 ml-2"/>
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="flex items-center bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg transition-transform hover:-translate-y-0.5">
                            <CheckCircle className="w-4 h-4 mr-2"/> Submit for Approval
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateJob;
