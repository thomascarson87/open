import React, { useState } from 'react';
import { JobPosting, WorkMode, SeniorityLevel, TeamMember, JobType, JobSkill } from '../types';
import { generateJobDescription } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, ArrowRight, Zap, Award, Heart, CheckCircle, Users, UserCheck, Trash2, Plus, X, ChevronDown, ChevronUp, Clock, Globe, Shield } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import ImpactScopeSelector from './ImpactScopeSelector';
import { CULTURAL_VALUES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES, SKILLS_LIST, SKILL_LEVEL_METADATA } from '../constants/matchingData';
import { 
  WORK_INTENSITY_OPTIONS, 
  AUTONOMY_LEVEL_OPTIONS, 
  TEAM_SIZE_PREF_OPTIONS,
  AMBIGUITY_TOLERANCE_OPTIONS,
  COLLABORATION_FREQ_OPTIONS,
  TIMEZONE_OVERLAP_OPTIONS
} from '../constants/workStyleData';

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
        workStyleDealbreakers: [],
        teamRequirements: {},
        teamDealbreakers: []
    });

    const toggleWorkStyleDealbreaker = (field: string) => {
        const current = jobData.workStyleDealbreakers || [];
        const exists = current.includes(field);
        setJobData({
            ...jobData,
            workStyleDealbreakers: exists ? current.filter(f => f !== field) : [...current, field]
        });
    };

    const toggleTeamDealbreaker = (field: string) => {
        const current = jobData.teamDealbreakers || [];
        const exists = current.includes(field);
        setJobData({
            ...jobData,
            teamDealbreakers: exists ? current.filter(f => f !== field) : [...current, field]
        });
    };

    const DealbreakerToggle = ({ field, isChecked, onToggle }: any) => (
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={isChecked} onChange={onToggle} className="w-3.5 h-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500" />
            <span className={`text-[10px] font-bold uppercase ${isChecked ? 'text-red-600' : 'text-gray-400'}`}>Dealbreaker</span>
        </label>
    );

    const handleSubmit = () => onPublish(jobData as JobPosting);

    return (
        <div className="max-w-5xl mx-auto my-8 px-4 pb-24">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                <div className="flex-1 p-8">
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4">
                        <div className="grid grid-cols-2 gap-8">
                            <div><label className="block text-sm font-bold text-gray-700">Role Title</label><input value={jobData.title || ''} onChange={e => setJobData({...jobData, title: e.target.value})} className="w-full p-4 border rounded-xl font-bold" /></div>
                            <div><label className="block text-sm font-bold text-gray-700">Location</label><input value={jobData.location || ''} onChange={e => setJobData({...jobData, location: e.target.value})} className="w-full p-4 border rounded-xl" /></div>
                        </div>

                        {/* Work Style Requirements */}
                        <div className="pt-6 border-t">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-500" /> Work Style Requirements</h3>
                                <span className="text-xs text-gray-400 font-bold">Overrides company defaults</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><label className="block text-[10px] font-black text-gray-500 uppercase">Work Intensity</label><DealbreakerToggle isChecked={jobData.workStyleDealbreakers?.includes('workIntensity')} onToggle={() => toggleWorkStyleDealbreaker('workIntensity')} /></div>
                                    <select value={jobData.workStyleRequirements?.workIntensity || ''} onChange={e => setJobData({...jobData, workStyleRequirements: { ...jobData.workStyleRequirements, workIntensity: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-gray-50 text-sm font-bold">
                                        <option value="">Use Company Default</option>
                                        {WORK_INTENSITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><label className="block text-[10px] font-black text-gray-500 uppercase">Autonomy</label><DealbreakerToggle isChecked={jobData.workStyleDealbreakers?.includes('autonomyLevel')} onToggle={() => toggleWorkStyleDealbreaker('autonomyLevel')} /></div>
                                    <select value={jobData.workStyleRequirements?.autonomyLevel || ''} onChange={e => setJobData({...jobData, workStyleRequirements: { ...jobData.workStyleRequirements, autonomyLevel: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-gray-50 text-sm font-bold">
                                        <option value="">Use Company Default</option>
                                        {AUTONOMY_LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><label className="block text-[10px] font-black text-gray-500 uppercase">Ambiguity</label><DealbreakerToggle isChecked={jobData.workStyleDealbreakers?.includes('ambiguityTolerance')} onToggle={() => toggleWorkStyleDealbreaker('ambiguityTolerance')} /></div>
                                    <select value={jobData.workStyleRequirements?.ambiguityTolerance || ''} onChange={e => setJobData({...jobData, workStyleRequirements: { ...jobData.workStyleRequirements, ambiguityTolerance: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-gray-50 text-sm font-bold">
                                        <option value="">Any</option>
                                        {AMBIGUITY_TOLERANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Team Requirements */}
                        <div className="pt-6 border-t">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-green-500" /> Team Dynamics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase">Team Size</label>
                                    <select value={jobData.teamRequirements?.teamSizePreference || ''} onChange={e => setJobData({...jobData, teamRequirements: { ...jobData.teamRequirements, teamSizePreference: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-gray-50 text-sm font-bold">
                                        <option value="">Any Size</option>
                                        {TEAM_SIZE_PREF_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><label className="block text-[10px] font-black text-gray-500 uppercase">Sync Style</label><DealbreakerToggle isChecked={jobData.teamDealbreakers?.includes('collaborationFrequency')} onToggle={() => toggleTeamDealbreaker('collaborationFrequency')} /></div>
                                    <select value={jobData.teamRequirements?.collaborationFrequency || ''} onChange={e => setJobData({...jobData, teamRequirements: { ...jobData.teamRequirements, collaborationFrequency: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-gray-50 text-sm font-bold">
                                        <option value="">Use Company Default</option>
                                        {COLLABORATION_FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><label className="block text-[10px] font-black text-gray-500 uppercase">TZ Overlap</label><DealbreakerToggle isChecked={jobData.teamDealbreakers?.includes('timezoneOverlap')} onToggle={() => toggleTeamDealbreaker('timezoneOverlap')} /></div>
                                    <select value={jobData.teamRequirements?.timezoneOverlap || ''} onChange={e => setJobData({...jobData, teamRequirements: { ...jobData.teamRequirements, timezoneOverlap: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-gray-50 text-sm font-bold">
                                        <option value="">Any</option>
                                        {TIMEZONE_OVERLAP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && <div>Step 2: Skills...</div>}
                </div>

                <div className="bg-gray-50 p-8 border-t flex justify-between items-center">
                    {/* Fixed: Replaced idx and setIdx with step and setStep */}
                    <button onClick={() => setStep(step - 1)} className={`font-bold text-gray-500 ${step === 1 ? 'invisible' : ''}`}>Back</button>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                        <button onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()} className="bg-gray-900 text-white px-10 py-3 rounded-xl font-black shadow-lg hover:bg-black transition-all">
                            {step === 3 ? 'Publish Job' : 'Next Step'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CreateJob;
