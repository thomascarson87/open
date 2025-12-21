import React, { useState } from 'react';
import { JobPosting, WorkMode, SeniorityLevel, TeamMember, JobType, JobSkill } from '../types';
import { generateJobDescription } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, ArrowRight, Zap, Award, Heart, CheckCircle, Users, UserCheck, Trash2, Plus, X, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import ImpactScopeSelector from './ImpactScopeSelector';
import { CULTURAL_VALUES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES, SKILLS_LIST, SKILL_LEVEL_METADATA } from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';
import { WORK_INTENSITY_OPTIONS, AUTONOMY_LEVEL_OPTIONS, TEAM_SIZE_OPTIONS } from '../constants/workStyleData';

interface Props {
    onPublish: (job: JobPosting) => void;
    onCancel: () => void;
    teamMembers: TeamMember[];
}

const CreateJob: React.FC<Props> = ({ onPublish, onCancel, teamMembers }) => {
    const [step, setStep] = useState(1);
    const [jobData, setJobData] = useState<Partial<JobPosting>>({
        companyName: "TechFlow Inc.",
        workMode: WorkMode.Remote,
        requiredSkills: [],
        values: [],
        perks: [],
        desiredTraits: [],
        requiredTraits: [],
        seniority: SeniorityLevel.Senior,
        contractTypes: [JobType.FullTime],
        salaryCurrency: 'USD',
        approvals: { hiringManager: { status: 'pending', assignedTo: '' }, finance: { status: 'pending', assignedTo: '' } },
        responsibilities: [],
        key_deliverables: [],
        tech_stack: [],
        required_impact_scope: 3,
        workStyleRequirements: {},
        workStyleDealBreakers: [],
        teamRequirements: {},
        teamDealBreakers: []
    });

    const handleSubmit = () => onPublish(jobData as JobPosting);

    return (
        <div className="max-w-5xl mx-auto my-8 px-4 pb-24">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="flex-1 p-8">
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                        <div className="grid grid-cols-2 gap-8">
                            <div><label className="block text-sm font-bold text-gray-700">Role Title</label><input value={jobData.title || ''} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 border rounded-xl" /></div>
                            <div><label className="block text-sm font-bold text-gray-700">Location</label><input value={jobData.location || ''} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 border rounded-xl" /></div>
                        </div>

                        {/* Work Environment Section */}
                        <div className="pt-6 border-t">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500" /> Environment Fit</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Work Intensity</label>
                                    <select value={jobData.workStyleRequirements?.workIntensity || ''} onChange={e => setJobData({...jobData, workStyleRequirements: { ...jobData.workStyleRequirements, workIntensity: e.target.value as any }})} className="w-full p-3 border rounded-xl">
                                        <option value="">Company Default</option>
                                        {WORK_INTENSITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Team Size</label>
                                    <select value={jobData.teamRequirements?.teamSizePreference || ''} onChange={e => setJobData({...jobData, teamRequirements: { ...jobData.teamRequirements, teamSizePreference: e.target.value as any }})} className="w-full p-3 border rounded-xl">
                                        <option value="">Any</option>
                                        {TEAM_SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && <div>Step 2: Skills...</div>}
                </div>

                <div className="bg-gray-50 p-8 border-t flex justify-between">
                    <button onClick={() => setStep(step - 1)} className={step === 1 ? 'invisible' : ''}>Back</button>
                    <button onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()} className="bg-black text-white px-8 py-3 rounded-xl font-bold">
                        {step === 3 ? 'Publish Job' : 'Next Step'}
                    </button>
                </div>
            </div>
        </div>
    );
};
export default CreateJob;
