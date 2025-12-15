
import React, { useState } from 'react';
import { CandidateProfile, SeniorityLevel, WorkMode, JobType } from '../types';
import { 
  User, Briefcase, Award, Heart, CheckCircle, Zap, DollarSign, 
  MapPin, Clock, Lock, Unlock, Edit2, Plus, Trash2, Layout, Smile
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import { 
  CULTURAL_VALUES, 
  INDUSTRIES, 
  PERKS_CATEGORIES, 
  CHARACTER_TRAITS_CATEGORIES, 
  SKILLS_LIST 
} from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';

interface Props {
  profile: CandidateProfile;
  onUpdate: (data: Partial<CandidateProfile>) => void;
  onSave: () => void;
}

const CandidateProfileTabs: React.FC<Props> = ({ profile, onUpdate, onSave }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'career' | 'preferences' | 'values'>('overview');

  // Match Quality Calculation
  const calculateCompletion = () => {
    let score = 0;
    
    // Required fields (40 points)
    if (profile.name && profile.headline) score += 20;
    if (profile.skills?.length > 0) score += 10;
    if (profile.salaryMin) score += 10;
    
    // High-value optional fields (40 points)
    if (profile.values?.length > 0) score += 10;
    if (profile.characterTraits?.length > 0) score += 10;
    if (profile.experience?.length > 0) score += 10;
    if (profile.education_level) score += 10;
    
    // Nice-to-have fields (20 points)
    if (profile.desiredPerks?.length > 0) score += 5;
    if (profile.interestedIndustries?.length > 0) score += 5;
    if (profile.bio) score += 5;
    if (profile.location) score += 5;
    
    return Math.min(100, score);
  };

  const completion = calculateCompletion();

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-6 py-4 font-bold text-sm transition-all border-b-2 ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      
      {/* Header with Match Quality */}
      <div className="bg-gray-900 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black">{profile.name}</h1>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-gray-400">
                {profile.status?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-400 text-lg">{profile.headline}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-green-500 transition-all duration-1000 ease-out" strokeDasharray={`${completion}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-black text-xl">
                {completion}%
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Match Quality Score</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">
                {completion < 50 ? 'Add more details to match with top companies.' : 
                 completion < 80 ? 'Good! Add values & traits to stand out.' : 
                 'Excellent! You are visible to premium roles.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          <TabButton id="overview" label="Overview" icon={Layout} />
          <TabButton id="career" label="Career & Skills" icon={Briefcase} />
          <TabButton id="preferences" label="Preferences" icon={DollarSign} />
          <TabButton id="values" label="Values & Culture" icon={Heart} />
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Short Bio</label>
                    <textarea 
                      value={profile.bio || ''} 
                      onChange={e => onUpdate({ bio: e.target.value })}
                      className="w-full p-4 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none resize-none h-32"
                      placeholder="Tell your story..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Location</label>
                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <input 
                        value={profile.location || ''} 
                        onChange={e => onUpdate({ location: e.target.value })}
                        className="bg-transparent w-full font-medium outline-none"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2" /> Improvement Tips
                  </h3>
                  <ul className="space-y-3">
                    {!profile.values?.length && (
                      <li className="flex items-start text-sm text-blue-800">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                        Add your core values to find culturally aligned teams.
                      </li>
                    )}
                    {!profile.characterTraits?.length && (
                      <li className="flex items-start text-sm text-blue-800">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                        Select personality traits to improve match accuracy by 40%.
                      </li>
                    )}
                    {(!profile.experience || profile.experience.length === 0) && (
                      <li className="flex items-start text-sm text-blue-800">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                        Add at least one past role to show your track record.
                      </li>
                    )}
                  </ul>
                  <button onClick={() => setActiveTab('career')} className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">
                    Enhance Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'career' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300">
              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-gray-400" /> Technical Skills
                </h3>
                <GroupedMultiSelect
                  label=""
                  options={SKILLS_LIST}
                  selected={profile.skills.map(s => s.name)}
                  onChange={(names) => {
                     const currentMap = new Map(profile.skills.map(s => [s.name, s]));
                     const newSkills = names.map(name => {
                         const existing = currentMap.get(name);
                         return existing ? existing : { name, years: 1 };
                     });
                     onUpdate({ skills: newSkills });
                  }}
                  placeholder="Add technologies..."
                  grouped={true}
                  searchable={true}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   {profile.skills.map((skill, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="font-bold text-sm text-gray-700">{skill.name}</span>
                            <div className="flex items-center space-x-1">
                                <span className="text-xs font-bold bg-white px-2 py-1 rounded shadow-sm">{skill.years}y</span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

              {/* Experience */}
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                  <Briefcase className="w-5 h-5 mr-2 text-gray-400" /> Work Experience
                </h3>
                
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="space-y-4">
                    {profile.experience.map((exp, idx) => (
                      <div key={exp.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">{exp.role}</h4>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                          </div>
                          <button
                            onClick={() => {
                              const updated = profile.experience.filter((_, i) => i !== idx);
                              onUpdate({ experience: updated });
                            }}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500 mb-4">Add your work history to showcase your journey.</p>
                  </div>
                )}
                
                <button
                  onClick={() => alert('Experience editor modal would open here')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Experience
                </button>
              </div>

              {/* Education */}
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                  <Award className="w-5 h-5 mr-2 text-gray-400" /> Education
                </h3>
                
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Education Level</label>
                    <select
                      value={profile.education_level || ''}
                      onChange={e => onUpdate({ education_level: e.target.value as any })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Not specified</option>
                      {EDUCATION_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {profile.education_level && profile.education_level !== 'Self-Taught' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Field of Study</label>
                        <input
                          value={profile.education_field || ''}
                          onChange={e => onUpdate({ education_field: e.target.value })}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                          placeholder="e.g., Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Institution</label>
                        <input
                          value={profile.education_institution || ''}
                          onChange={e => onUpdate({ education_institution: e.target.value })}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                          placeholder="e.g., Stanford University"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300 max-w-3xl">
               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Work Mode</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.values(WorkMode).map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          const current = profile.preferredWorkMode || [];
                          const exists = current.includes(mode);
                          onUpdate({
                            preferredWorkMode: exists ? current.filter(m => m !== mode) : [...current, mode]
                          });
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border ${
                          profile.preferredWorkMode?.includes(mode) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  {profile.preferredWorkMode && profile.preferredWorkMode.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={profile.nonNegotiables?.includes('work_mode')}
                        onChange={() => {
                          const current = profile.nonNegotiables || [];
                          const exists = current.includes('work_mode');
                          onUpdate({
                            nonNegotiables: exists 
                              ? current.filter(f => f !== 'work_mode')
                              : [...current, 'work_mode']
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className={`font-medium ${profile.nonNegotiables?.includes('work_mode') ? 'text-blue-700' : 'text-gray-700'}`}>
                        {profile.nonNegotiables?.includes('work_mode') ? '🔒 Non-negotiable' : '✨ Flexible'}
                      </span>
                    </label>
                  )}
               </div>

               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Contract Types</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.values(JobType).map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          const current = profile.contractTypes || [];
                          const exists = current.includes(type);
                          onUpdate({
                            contractTypes: exists ? current.filter(t => t !== type) : [...current, type]
                          });
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border ${
                          profile.contractTypes?.includes(type) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {profile.contractTypes && profile.contractTypes.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={profile.nonNegotiables?.includes('contract_type')}
                        onChange={() => {
                          const current = profile.nonNegotiables || [];
                          const exists = current.includes('contract_type');
                          onUpdate({
                            nonNegotiables: exists 
                              ? current.filter(f => f !== 'contract_type')
                              : [...current, 'contract_type']
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className={`font-medium ${profile.nonNegotiables?.includes('contract_type') ? 'text-blue-700' : 'text-gray-700'}`}>
                        {profile.nonNegotiables?.includes('contract_type') ? '🔒 Non-negotiable' : '✨ Flexible'}
                      </span>
                    </label>
                  )}
               </div>

               <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                  <h3 className="font-bold text-green-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" /> Compensation
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-green-800 mb-2">Minimum Salary</label>
                      <div className="flex items-center gap-4 mb-2">
                         <select 
                            value={profile.salaryCurrency || 'USD'}
                            onChange={e => onUpdate({ salaryCurrency: e.target.value })}
                            className="bg-white border border-green-200 rounded-lg p-2 font-bold text-green-800"
                         >
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                            <option value="EUR">EUR</option>
                         </select>
                         <input 
                            type="number" 
                            value={profile.salaryMin || ''}
                            onChange={e => onUpdate({ salaryMin: parseInt(e.target.value) })}
                            className="bg-white border border-green-200 rounded-lg p-2 font-bold text-green-800 flex-1"
                            placeholder="Min Annual Salary"
                         />
                      </div>
                      
                      {profile.salaryMin && profile.salaryMin > 0 && (
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={profile.nonNegotiables?.includes('salary_min')}
                            onChange={() => {
                              const current = profile.nonNegotiables || [];
                              const exists = current.includes('salary_min');
                              onUpdate({
                                nonNegotiables: exists 
                                  ? current.filter(f => f !== 'salary_min')
                                  : [...current, 'salary_min']
                              });
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-green-600"
                          />
                          <span className={`font-medium ${profile.nonNegotiables?.includes('salary_min') ? 'text-green-900' : 'text-green-700'}`}>
                            {profile.nonNegotiables?.includes('salary_min') ? '🔒 Hard minimum' : '✨ Open to negotiation'}
                          </span>
                        </label>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-green-800 mb-2">Current Bonus Structure</label>
                      <input
                        value={profile.currentBonuses || ''}
                        onChange={e => onUpdate({ currentBonuses: e.target.value })}
                        className="w-full bg-white border border-green-200 rounded-lg p-2 text-green-900"
                        placeholder="e.g., 10% annual + equity"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-green-800 mb-2">Notice Period</label>
                      <select
                        value={profile.noticePeriod || ''}
                        onChange={e => onUpdate({ noticePeriod: e.target.value })}
                        className="w-full bg-white border border-green-200 rounded-lg p-2 font-medium text-green-900 mb-2"
                      >
                        <option value="">Select...</option>
                        <option value="Immediate">Immediately available</option>
                        <option value="2 Weeks">2 Weeks</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2 Months">2 Months</option>
                        <option value="3 Months">3 Months+</option>
                      </select>
                      
                      {profile.noticePeriod && (
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={profile.nonNegotiables?.includes('notice_period')}
                            onChange={() => {
                              const current = profile.nonNegotiables || [];
                              const exists = current.includes('notice_period');
                              onUpdate({
                                nonNegotiables: exists 
                                  ? current.filter(f => f !== 'notice_period')
                                  : [...current, 'notice_period']
                              });
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-green-600"
                          />
                          <span className={`font-medium ${profile.nonNegotiables?.includes('notice_period') ? 'text-green-900' : 'text-green-700'}`}>
                            {profile.nonNegotiables?.includes('notice_period') ? '🔒 Cannot start sooner' : '✨ Flexible'}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
               <GroupedMultiSelect
                  label="Cultural Values"
                  options={CULTURAL_VALUES}
                  selected={profile.values || []}
                  onChange={vals => onUpdate({ values: vals })}
                  placeholder="What matters to you?"
                  maxSelections={5}
               />
               
               <GroupedMultiSelect
                  label="Personality Traits"
                  options={CHARACTER_TRAITS_CATEGORIES}
                  selected={profile.characterTraits || []}
                  onChange={traits => onUpdate({ characterTraits: traits })}
                  grouped={true}
                  maxSelections={10}
               />

               {/* Personality Assessments */}
               <div className="pt-8 border-t border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                    <Smile className="w-5 h-5 mr-2 text-gray-400" /> Personality Assessments
                  </h3>
                  
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-6">
                    <p className="text-sm text-blue-900 mb-4">
                      Optional: Add your personality assessment results to help us find teams where you'll thrive.
                    </p>
                  </div>

                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Myers-Briggs Type (MBTI)
                      </label>
                      <input
                        value={profile.myers_briggs || ''}
                        onChange={e => onUpdate({ myers_briggs: e.target.value.toUpperCase() })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 uppercase"
                        placeholder="e.g., INTJ, ENFP"
                        maxLength={4}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Don't know your type? <a href="https://www.16personalities.com" target="_blank" className="text-blue-600 hover:underline">Take a free test</a>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Enneagram Type
                      </label>
                      <select
                        value={profile.enneagram_type || ''}
                        onChange={e => onUpdate({ enneagram_type: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Not specified</option>
                        <option value="Type 1">Type 1 - The Reformer</option>
                        <option value="Type 2">Type 2 - The Helper</option>
                        <option value="Type 3">Type 3 - The Achiever</option>
                        <option value="Type 4">Type 4 - The Individualist</option>
                        <option value="Type 5">Type 5 - The Investigator</option>
                        <option value="Type 6">Type 6 - The Loyalist</option>
                        <option value="Type 7">Type 7 - The Enthusiast</option>
                        <option value="Type 8">Type 8 - The Challenger</option>
                        <option value="Type 9">Type 9 - The Peacemaker</option>
                      </select>
                    </div>

                    {(profile.myers_briggs || profile.enneagram_type) && (
                      <button
                        onClick={() => onUpdate({ 
                          assessment_completed_at: new Date().toISOString() 
                        })}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Mark assessments as completed
                      </button>
                    )}
                  </div>
                </div>

               <GroupedMultiSelect
                  label="Industry Interests"
                  options={INDUSTRIES}
                  selected={profile.interestedIndustries || []}
                  onChange={inds => onUpdate({ interestedIndustries: inds })}
                  maxSelections={5}
               />

               <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <GroupedMultiSelect
                    label="Desired Perks & Benefits"
                    options={PERKS_CATEGORIES}
                    selected={profile.desiredPerks || []}
                    onChange={perks => onUpdate({ desiredPerks: perks })}
                    placeholder="Select perks..."
                    grouped={true}
                    maxSelections={8}
                  />
                  
                  {profile.desiredPerks && profile.desiredPerks.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer text-sm mt-4">
                      <input
                        type="checkbox"
                        checked={profile.nonNegotiables?.includes('perks')}
                        onChange={() => {
                          const current = profile.nonNegotiables || [];
                          const exists = current.includes('perks');
                          onUpdate({
                            nonNegotiables: exists 
                              ? current.filter(f => f !== 'perks')
                              : [...current, 'perks']
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600"
                      />
                      <span className={`font-medium ${profile.nonNegotiables?.includes('perks') ? 'text-purple-900' : 'text-purple-700'}`}>
                        {profile.nonNegotiables?.includes('perks') ? '🔒 These are must-haves' : '✨ Nice to have'}
                      </span>
                    </label>
                  )}
               </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end">
           <button onClick={onSave} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg transition-all flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" /> Save Profile
           </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileTabs;
