

import React, { useState, useEffect } from 'react';
import { JobPosting, WorkMode, SeniorityLevel, TeamMember, JobType, JobSkill } from '../types';
import { suggestSkillsForRole, generateJobDescription } from '../services/geminiService';
import { Sparkles, ArrowRight, MapPin, DollarSign, Calendar, Info, Users, TrendingUp, Briefcase, CheckCircle, UserCheck, Trash2, Plus } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import { 
  CULTURAL_VALUES, 
  PERKS_CATEGORIES,
  CHARACTER_TRAITS_CATEGORIES
} from '../constants/matchingData';

interface Props {
    onPublish: (job: JobPosting) => void;
    onCancel: () => void;
    teamMembers: TeamMember[];
}

const LOCATIONS = ["Remote", "San Francisco, CA", "New York, NY", "London, UK", "Berlin, DE", "Toronto, CA", "Austin, TX"];

const CreateJob: React.FC<Props> = ({ onPublish, onCancel, teamMembers }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form Data
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
        approvals: {
            hiringManager: { assignedTo: '', status: 'pending' },
            finance: { assignedTo: '', status: 'pending' }
        }
    });

    const [selectedHM, setSelectedHM] = useState('');
    const [selectedFinance, setSelectedFinance] = useState('');
    const [newSkill, setNewSkill] = useState<Partial<JobSkill>>({ name: '', minimumYears: 2, weight: 'required' });
    
    // Audience Insight State
    const [reachMetrics, setReachMetrics] = useState({ count: 0, quality: 'Low', suggestions: [] as string[] });

    // Mock Audience Calculation
    useEffect(() => {
        let count = 350;
        if (jobData.workMode !== WorkMode.REMOTE) count -= 120;
        if (jobData.salaryMin && jobData.salaryMin < 80000) count -= 100;
        if (jobData.seniority === SeniorityLevel.EXECUTIVE) count = Math.floor(count * 0.2);
        setReachMetrics({
            count: Math.max(12, count),
            quality: count > 100 ? 'High' : 'Niche',
            suggestions: jobData.workMode !== WorkMode.REMOTE ? ["Switching to Remote increases matches."] : []
        });
    }, [jobData]);

    const handleSuggest = async () => {
        if (!jobData.title) return;
        setIsLoading(true);
        // Mock suggestion mapping for now
        const desc = await generateJobDescription(jobData.title, []);
        setJobData(prev => ({ ...prev, description: desc }));
        setIsLoading(false);
    };

    const addSkill = () => {
        if (!newSkill.name) return;
        setJobData(prev => ({
            ...prev,
            requiredSkills: [...(prev.requiredSkills || []), newSkill as JobSkill]
        }));
        setNewSkill({ name: '', minimumYears: 2, weight: 'required' });
    };

    const removeSkill = (index: number) => {
        setJobData(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills?.filter((_, i) => i !== index)
        }));
    };

    const toggleContractType = (type: JobType) => {
        setJobData(prev => {
            const current = prev.contractTypes || [];
            return { ...prev, contractTypes: current.includes(type) ? current.filter(t => t !== type) : [...current, type] };
        });
    };

    const handleSubmit = () => {
        const finalJob = {
            ...jobData,
            // Format legacy salaryRange string for display
            salaryRange: `${jobData.salaryCurrency} ${jobData.salaryMin ? (jobData.salaryMin/1000)+'k' : '0'} - ${jobData.salaryMax ? (jobData.salaryMax/1000)+'k' : 'Max'}`,
            status: 'pending_approval',
            approvals: {
                hiringManager: { assignedTo: selectedHM, status: 'pending' },
                finance: { assignedTo: selectedFinance, status: 'pending' }
            }
        } as JobPosting;

        onPublish(finalJob);
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 my-8 px-4">
            
            {/* Main Form Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 px-8 py-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold">Post a New Role</h2>
                        <p className="text-gray-400 text-sm">Precise matching enabled.</p>
                    </div>
                    {/* Stepper Steps UI */}
                    <div className="text-sm font-bold">Step {step} of 3</div>
                </div>

                {step === 1 && (
                    <div className="p-8 space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Job Title</label>
                            <input 
                                value={jobData.title || ''}
                                onChange={e => setJobData({...jobData, title: e.target.value})}
                                className="w-full p-4 border border-gray-200 rounded-xl outline-none text-xl font-semibold"
                                placeholder="e.g. Senior Backend Engineer"
                            />
                        </div>
                        
                        {/* Contract & Seniority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seniority Level</label>
                                <select 
                                    value={jobData.seniority}
                                    onChange={e => setJobData({...jobData, seniority: e.target.value as SeniorityLevel})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                >
                                    {Object.values(SeniorityLevel).map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contract Types</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(JobType).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleContractType(type)}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold border ${jobData.contractTypes?.includes(type) ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Numeric Salary */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Compensation Range</label>
                            <div className="flex gap-4">
                                <select 
                                    value={jobData.salaryCurrency}
                                    onChange={e => setJobData({...jobData, salaryCurrency: e.target.value})}
                                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg font-bold"
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                </select>
                                <input 
                                    type="number"
                                    placeholder="Min (e.g. 80000)"
                                    value={jobData.salaryMin || ''}
                                    onChange={e => setJobData({...jobData, salaryMin: parseInt(e.target.value)})}
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                />
                                <span className="self-center text-gray-400">-</span>
                                <input 
                                    type="number"
                                    placeholder="Max (e.g. 120000)"
                                    value={jobData.salaryMax || ''}
                                    onChange={e => setJobData({...jobData, salaryMax: parseInt(e.target.value)})}
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                />
                            </div>
                        </div>

                        {/* Location & Work Mode */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                                <select 
                                    value={jobData.location || ''}
                                    onChange={e => setJobData({...jobData, location: e.target.value})}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                >
                                    <option value="" disabled>Select</option>
                                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Mode</label>
                                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                    {Object.values(WorkMode).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setJobData({...jobData, workMode: mode})}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${jobData.workMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={() => setStep(2)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-black">
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8 space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Description</label>
                            <div className="bg-indigo-50 p-4 rounded-lg mb-4 flex justify-between items-center">
                                <span className="text-sm text-indigo-800 font-medium">Use AI to generate a draft?</span>
                                <button onClick={handleSuggest} disabled={isLoading} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold">
                                    {isLoading ? 'Generating...' : 'Auto-Generate'}
                                </button>
                            </div>
                            <textarea 
                                value={jobData.description || ''}
                                onChange={e => setJobData({...jobData, description: e.target.value})}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-48 outline-none resize-none"
                                placeholder="Describe the role..."
                            />
                        </div>

                        {/* Structured Skills */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Required Skills</label>
                            <div className="flex gap-2 mb-4">
                                <input 
                                    placeholder="Skill Name (e.g. React)"
                                    value={newSkill.name}
                                    onChange={e => setNewSkill({...newSkill, name: e.target.value})}
                                    className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg"
                                />
                                <input 
                                    type="number"
                                    placeholder="Min Years"
                                    value={newSkill.minimumYears}
                                    onChange={e => setNewSkill({...newSkill, minimumYears: parseInt(e.target.value)})}
                                    className="w-24 p-2 bg-gray-50 border border-gray-200 rounded-lg"
                                />
                                <select 
                                    value={newSkill.weight}
                                    onChange={e => setNewSkill({...newSkill, weight: e.target.value as any})}
                                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg"
                                >
                                    <option value="required">Required</option>
                                    <option value="preferred">Preferred</option>
                                </select>
                                <button onClick={addSkill} className="bg-gray-900 text-white p-2 rounded-lg">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                {jobData.requiredSkills?.map((skill, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{skill.name}</span>
                                            <span className="text-xs text-gray-500">{skill.minimumYears}y+</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${skill.weight === 'required' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {skill.weight}
                                            </span>
                                        </div>
                                        <button onClick={() => removeSkill(idx)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                {jobData.requiredSkills?.length === 0 && <div className="text-sm text-gray-400 italic">No skills added yet.</div>}
                            </div>
                        </div>

                        {/* Company Values Section */}
                        <section>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Company Values</h3>
                          <GroupedMultiSelect
                            label="Cultural Values"
                            options={CULTURAL_VALUES}
                            selected={jobData.values || []}
                            onChange={(values) => setJobData(prev => ({ ...prev, values }))}
                            placeholder="What values drive your company?"
                            helpText="Select 5-8 core values that define your culture"
                            maxSelections={10}
                            searchable={true}
                          />
                        </section>

                        {/* Perks & Benefits Section */}
                        <section>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Perks & Benefits</h3>
                          <GroupedMultiSelect
                            label="What You Offer"
                            options={PERKS_CATEGORIES}
                            selected={jobData.perks || []}
                            onChange={(perks) => setJobData(prev => ({ ...prev, perks }))}
                            placeholder="Select the perks you offer"
                            helpText="Be comprehensive - this helps attract the right talent"
                            grouped={true}
                            searchable={true}
                          />
                        </section>

                        {/* Desired Traits Section */}
                        <section>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">Desired Character Traits</h3>
                          
                          <GroupedMultiSelect
                            label="Required Traits (Must Have)"
                            options={CHARACTER_TRAITS_CATEGORIES}
                            selected={jobData.requiredTraits || []}
                            onChange={(traits) => setJobData(prev => ({ ...prev, requiredTraits: traits }))}
                            placeholder="Non-negotiable personality traits"
                            helpText="Select 2-4 must-have traits for this role"
                            maxSelections={5}
                            grouped={true}
                            searchable={true}
                          />

                          <div className="mt-4">
                            <GroupedMultiSelect
                              label="Desired Traits (Nice to Have)"
                              options={CHARACTER_TRAITS_CATEGORIES}
                              selected={jobData.desiredTraits || []}
                              onChange={(traits) => setJobData(prev => ({ ...prev, desiredTraits: traits }))}
                              placeholder="Bonus traits that would be great"
                              helpText="Select 3-5 traits that would be a plus"
                              maxSelections={8}
                              grouped={true}
                              searchable={true}
                            />
                          </div>
                        </section>

                        <div className="flex justify-between pt-6 border-t border-gray-100">
                             <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-900 font-medium px-4">Back</button>
                             <button onClick={() => setStep(3)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black">
                                Next: Approvals
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-8 space-y-8">
                        <div className="text-center mb-8">
                             <h3 className="text-2xl font-bold text-gray-900 mb-2">Stakeholder Approvals</h3>
                             <p className="text-gray-500">Assign team members to review this requisition.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4">Hiring Manager</h4>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                    value={selectedHM}
                                    onChange={e => setSelectedHM(e.target.value)}
                                >
                                    <option value="">Select Manager</option>
                                    {teamMembers.filter(m => ['hiring_manager', 'admin'].includes(m.role)).map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-4">Finance Controller</h4>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                    value={selectedFinance}
                                    onChange={e => setSelectedFinance(e.target.value)}
                                >
                                    <option value="">Select Finance</option>
                                    {teamMembers.filter(m => ['finance', 'admin'].includes(m.role)).map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-gray-100">
                             <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-900 font-medium px-4">Back</button>
                             <button 
                                onClick={handleSubmit}
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black flex items-center"
                            >
                                <UserCheck className="w-4 h-4 mr-2"/> Request Approvals
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar with Reach Metrics (Simplified) */}
            <div className="w-full lg:w-80">
                <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl">
                    <h3 className="font-bold flex items-center mb-6"><Users className="w-5 h-5 mr-2" /> Reach</h3>
                    <div className="text-4xl font-bold mb-1">{reachMetrics.count}</div>
                    <div className="text-sm text-gray-400 mb-6">Estimated Candidates</div>
                    
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-gray-300 uppercase">Suggestions</div>
                        {reachMetrics.suggestions.length > 0 ? (
                            reachMetrics.suggestions.map((s, i) => <div key={i} className="text-xs text-yellow-400">• {s}</div>)
                        ) : <div className="text-xs text-green-400">Great job post settings!</div>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateJob;
