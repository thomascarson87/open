
import React, { useState, useEffect } from 'react';
import { JobPosting, WorkMode, SeniorityLevel, TeamMember } from '../types';
import { suggestSkillsForRole, generateJobDescription } from '../services/geminiService';
import { Sparkles, ArrowRight, MapPin, DollarSign, Calendar, Info, Users, TrendingUp, Briefcase, CheckCircle, UserCheck } from 'lucide-react';

interface Props {
    onPublish: (job: JobPosting) => void;
    onCancel: () => void;
    teamMembers: TeamMember[];
}

const LOCATIONS = ["Remote", "San Francisco, CA", "New York, NY", "London, UK", "Berlin, DE", "Toronto, CA", "Austin, TX"];
const SALARY_RANGES = ["< $80k", "$80k - $120k", "$120k - $160k", "$160k - $200k", "$200k+"];
const PERK_OPTIONS = ["Health Insurance", "401k / Pension", "Unlimited PTO", "Remote First", "Equity / Stock Options", "Gym Stipend", "Learning Budget", "Free Meals", "Dog Friendly Office"];

const CreateJob: React.FC<Props> = ({ onPublish, onCancel, teamMembers }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form Data
    const [jobData, setJobData] = useState<Partial<JobPosting>>({
        companyName: "TechFlow Inc.", // Ideally fetch from company profile
        workMode: WorkMode.REMOTE,
        requiredSkills: [],
        values: ["Innovation", "User Focus"],
        perks: [],
        seniority: SeniorityLevel.SENIOR,
        approvals: {
            hiringManager: { assignedTo: '', status: 'pending' },
            finance: { assignedTo: '', status: 'pending' }
        }
    });

    // Approver State
    const [selectedHM, setSelectedHM] = useState('');
    const [selectedFinance, setSelectedFinance] = useState('');
    
    // Audience Insight State
    const [reachMetrics, setReachMetrics] = useState({ count: 0, quality: 'Low', suggestions: [] as string[] });

    // Mock "Live" Audience Calculation
    useEffect(() => {
        let count = 350; // Base pool

        // Reduce based on constraints
        if (jobData.workMode !== WorkMode.REMOTE) count -= 120;
        if (jobData.location && jobData.location !== "Remote") count -= 80;
        if (jobData.salaryRange === "< $80k") count -= 100;
        if (jobData.salaryRange === "$80k - $120k") count -= 50;
        
        // Adjust for seniority (Executive roles have fewer candidates)
        if (jobData.seniority === SeniorityLevel.EXECUTIVE || jobData.seniority === SeniorityLevel.DIRECTOR) count = Math.floor(count * 0.2);
        
        // Adjust for skill specificity
        if ((jobData.requiredSkills?.length || 0) > 5) count -= 50;

        // Clamp
        count = Math.max(12, count);

        // Generate suggestions
        const suggestions = [];
        if (jobData.workMode !== WorkMode.REMOTE) suggestions.push("Switching to Remote could increase matches by 3x.");
        if (jobData.salaryRange === "< $80k" || jobData.salaryRange === "$80k - $120k") suggestions.push("Increasing salary to $120k+ unlocks top-tier talent.");
        if ((jobData.requiredSkills?.length || 0) > 6) suggestions.push("Reducing mandatory skills from 6+ helps widen the funnel.");
        if (jobData.location && jobData.location !== "Remote" && jobData.workMode === WorkMode.OFFICE) suggestions.push("Adding 'Hybrid' or relocation support boosts reach.");

        setReachMetrics({
            count,
            quality: count > 100 ? 'High' : (count > 40 ? 'Medium' : 'Niche'),
            suggestions
        });

    }, [jobData.workMode, jobData.location, jobData.salaryRange, jobData.seniority, jobData.requiredSkills]);

    const handleSuggest = async () => {
        if (!jobData.title) return;
        setIsLoading(true);
        const skills = await suggestSkillsForRole(jobData.title);
        const desc = await generateJobDescription(jobData.title, skills);
        setJobData(prev => ({ ...prev, requiredSkills: skills, description: desc }));
        setIsLoading(false);
    };

    const togglePerk = (perk: string) => {
        setJobData(prev => {
            const current = prev.perks || [];
            const newPerks = current.includes(perk) ? current.filter(p => p !== perk) : [...current, perk];
            return { ...prev, perks: newPerks };
        });
    };

    const handleSubmit = () => {
        // Construct final object with approvals
        const finalJob = {
            ...jobData,
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
                {/* Header Steps */}
                <div className="bg-gray-900 px-8 py-6 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-xl font-bold">Post a New Role</h2>
                        <p className="text-gray-400 text-sm">Find your next star engineer.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map(s => (
                             <React.Fragment key={s}>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${step === s ? 'border-white bg-white text-gray-900' : (step > s ? 'border-green-500 bg-green-500 text-white' : 'border-gray-500 text-gray-500')} font-bold`}>
                                    {step > s ? <CheckCircle className="w-5 h-5"/> : s}
                                </div>
                                {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-green-500' : 'bg-gray-700'}`}></div>}
                             </React.Fragment>
                        ))}
                    </div>
                </div>

                {step === 1 && (
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Job Title</label>
                            <input 
                                value={jobData.title || ''}
                                onChange={e => setJobData({...jobData, title: e.target.value})}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 outline-none text-xl font-semibold placeholder-gray-300"
                                placeholder="e.g. Senior Backend Engineer"
                                autoFocus
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select 
                                        value={jobData.location || ''}
                                        onChange={e => setJobData({...jobData, location: e.target.value})}
                                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-900 appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select Location</option>
                                        {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Salary Range</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select 
                                        value={jobData.salaryRange || ''}
                                        onChange={e => setJobData({...jobData, salaryRange: e.target.value})}
                                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-900 appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select Salary Range</option>
                                        {SALARY_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seniority Level</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select 
                                        value={jobData.seniority}
                                        onChange={e => setJobData({...jobData, seniority: e.target.value as SeniorityLevel})}
                                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-900 appearance-none cursor-pointer"
                                    >
                                        {Object.values(SeniorityLevel).map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Mode</label>
                                <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                                    {Object.values(WorkMode).map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setJobData({...jobData, workMode: mode})}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${jobData.workMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input 
                                        type="date"
                                        value={jobData.startDate || ''}
                                        onChange={e => setJobData({...jobData, startDate: e.target.value})}
                                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-start space-x-3">
                                <div className="bg-white p-2 rounded-lg text-indigo-600">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-indigo-900">AI Quick-Fill</h4>
                                    <p className="text-sm text-indigo-700">Let Gemini draft the description and skills based on the title.</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleSuggest}
                                disabled={isLoading || !jobData.title}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md transition-all"
                            >
                                 {isLoading ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"/> : null}
                                 Generate Content
                            </button>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={() => setStep(2)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-black flex items-center shadow-lg transition-transform hover:-translate-y-0.5">
                                Continue <ArrowRight className="w-4 h-4 ml-2"/>
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Description</label>
                                    <textarea 
                                        value={jobData.description || ''}
                                        onChange={e => setJobData({...jobData, description: e.target.value})}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl h-64 focus:ring-2 focus:ring-gray-900 outline-none resize-none leading-relaxed"
                                        placeholder="Describe the role, responsibilities, and team culture..."
                                    />
                                </div>

                                 <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Perks</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PERK_OPTIONS.map(perk => (
                                            <button
                                                key={perk}
                                                onClick={() => togglePerk(perk)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                    jobData.perks?.includes(perk) 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {perk}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                 <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Required Skills</label>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[200px]">
                                         {jobData.requiredSkills?.length === 0 && <p className="text-gray-400 text-sm italic">AI generated skills will appear here...</p>}
                                         <div className="flex flex-wrap gap-2">
                                            {jobData.requiredSkills?.map((skill, i) => (
                                                <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm font-medium text-gray-800 shadow-sm">
                                                    {skill.name} ({skill.years}y)
                                                </span>
                                            ))}
                                         </div>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                                    <div className="flex items-center font-bold mb-2"><Info className="w-4 h-4 mr-2"/> Hiring Tip</div>
                                    Detailed perks and clear salary ranges increase application rates by 40%.
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-gray-100">
                             <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-900 font-medium px-4">Back</button>
                             <div className="space-x-4">
                                 <button onClick={onCancel} className="text-gray-500 hover:text-gray-900 font-medium">Save Draft</button>
                                 <button onClick={() => setStep(3)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg transition-all hover:-translate-y-0.5">
                                    Next: Approvals
                                </button>
                             </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="max-w-3xl mx-auto text-center mb-8">
                             <h3 className="text-2xl font-bold text-gray-900 mb-2">Stakeholder Approvals</h3>
                             <p className="text-gray-500">Assign the necessary team members to review and approve this requisition before it goes live.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Hiring Manager Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 mr-3">
                                        <Briefcase className="w-5 h-5"/>
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-gray-900">Hiring Manager</h4>
                                        <p className="text-xs text-gray-500">Validates role requirements</p>
                                    </div>
                                </div>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                    value={selectedHM}
                                    onChange={e => setSelectedHM(e.target.value)}
                                >
                                    <option value="">Select Manager</option>
                                    {teamMembers.filter(m => ['hiring_manager', 'admin'].includes(m.role)).map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Finance Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700 mr-3">
                                        <DollarSign className="w-5 h-5"/>
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-gray-900">Finance Controller</h4>
                                        <p className="text-xs text-gray-500">Approves budget allocation</p>
                                    </div>
                                </div>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
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
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg transition-all hover:-translate-y-0.5 flex items-center"
                            >
                                <UserCheck className="w-4 h-4 mr-2"/> Request Approvals
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Insight Sidebar */}
            <div className="w-full lg:w-80 space-y-6">
                <div className="bg-gradient-to-br from-indigo-900 to-gray-900 rounded-2xl shadow-xl p-6 text-white">
                    <h3 className="font-bold flex items-center text-indigo-100 mb-6">
                        <Users className="w-5 h-5 mr-2" /> Audience Reach
                    </h3>
                    
                    <div className="flex items-end mb-2">
                        <span className="text-5xl font-extrabold tracking-tight">{reachMetrics.count}</span>
                        <span className="mb-2 ml-2 text-indigo-200 font-medium text-sm">Candidates</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full mb-4 overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${reachMetrics.count > 100 ? 'bg-green-400' : (reachMetrics.count > 40 ? 'bg-yellow-400' : 'bg-red-400')}`}
                            style={{width: `${Math.min(100, (reachMetrics.count / 350) * 100)}%`}} 
                        ></div>
                    </div>
                    <p className="text-sm text-indigo-200 mb-6">
                        Estimated pool size based on {jobData.location || 'location'} and skills.
                    </p>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                         <div className="flex items-center text-sm font-bold text-white mb-2">
                            <TrendingUp className="w-4 h-4 mr-2 text-green-400" /> Optimize Reach
                         </div>
                         <div className="space-y-3">
                             {reachMetrics.suggestions.length > 0 ? (
                                 reachMetrics.suggestions.slice(0, 3).map((sugg, i) => (
                                     <div key={i} className="text-xs text-indigo-100 flex items-start">
                                         <span className="mr-2 text-indigo-400">•</span>
                                         {sugg}
                                     </div>
                                 ))
                             ) : (
                                 <div className="text-xs text-green-300 flex items-center">
                                     <CheckCircleOutline className="w-3 h-3 mr-1" /> Excellent reach settings.
                                 </div>
                             )}
                         </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" /> Seniority Guide
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center text-gray-600">
                            <span>Junior</span>
                            <span className="font-medium">$80k - $120k</span>
                        </div>
                         <div className="flex justify-between items-center text-gray-600">
                            <span>Mid-Level</span>
                            <span className="font-medium">$120k - $160k</span>
                        </div>
                         <div className="flex justify-between items-center text-gray-600">
                            <span>Senior</span>
                            <span className="font-medium">$160k - $210k</span>
                        </div>
                         <div className="flex justify-between items-center text-gray-900 font-bold bg-gray-50 p-2 rounded">
                            <span>{jobData.seniority}</span>
                            <span className="text-green-600">Selected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CheckCircleOutline({className}: {className?: string}) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
}

export default CreateJob;
