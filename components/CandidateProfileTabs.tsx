
import React, { useState } from 'react';
import { CandidateProfile, SeniorityLevel, WorkMode, JobType, Skill } from '../types';
import { 
  User, Briefcase, Award, Heart, CheckCircle, Zap, DollarSign, 
  MapPin, Clock, Lock, Unlock, Edit2, Plus, Trash2, Layout, Smile, ShieldCheck
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import VerificationDashboard from './VerificationDashboard';
import SkillLevelSelector from './SkillLevelSelector';
import ImpactScopeSelector from './ImpactScopeSelector';
import { 
  CULTURAL_VALUES, 
  INDUSTRIES, 
  PERKS_CATEGORIES, 
  CHARACTER_TRAITS_CATEGORIES, 
  SKILLS_LIST 
} from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';

// ===================================================================
// NON-NEGOTIABLE TOGGLE SECTION - CRITICAL MATCHING FEATURE
// DO NOT REMOVE: These toggles are presidential for the matching algorithm
// Removing them breaks the 8-dimensional matching system
// ===================================================================
const NonNegotiableToggle = ({ 
  fieldName, 
  isChecked, 
  onToggle 
}: { 
  fieldName: string; 
  isChecked: boolean; 
  onToggle: () => void;
}) => {
  return (
    <div className="flex items-center gap-3 mt-3">
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isChecked 
            ? 'bg-red-500 focus:ring-red-500' 
            : 'bg-blue-500 focus:ring-blue-500'
        }`}
        role="switch"
        aria-checked={isChecked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${
        isChecked ? 'text-red-700' : 'text-blue-700'
      }`}>
        {isChecked ? '🔒 Non-negotiable' : '✨ Flexible'}
      </span>
    </div>
  );
};

interface Props {
  profile: CandidateProfile;
  onUpdate: (data: Partial<CandidateProfile>) => void;
  onSave: () => void;
}

const CandidateProfileTabs: React.FC<Props> = ({ profile, onUpdate, onSave }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'career' | 'preferences' | 'values' | 'verifications'>('overview');

  const calculateCompletion = () => {
    let score = 0;
    if (profile.name && profile.headline) score += 20;
    if (profile.skills?.length > 0) score += 10;
    if (profile.salaryMin) score += 10;
    if (profile.values?.length > 0) score += 10;
    if (profile.characterTraits?.length > 0) score += 10;
    if (profile.experience?.length > 0) score += 10;
    if (profile.education_level) score += 10;
    if (profile.desiredPerks?.length > 0) score += 5;
    if (profile.interestedIndustries?.length > 0) score += 5;
    if (profile.bio) score += 5;
    if (profile.location) score += 5;
    
    return Math.min(100, score);
  };

  const completion = calculateCompletion();

  // Helper to ensure skills have levels (migration logic for frontend)
  const ensureSkillLevels = (skills: Skill[]) => {
      return skills.map(s => {
          if (s.level) return s;
          // Estimate level from years if missing
          const years = s.years || 0;
          let estimatedLevel: 1|2|3|4|5 = 1;
          if (years >= 1) estimatedLevel = 2;
          if (years >= 3) estimatedLevel = 3;
          if (years >= 5) estimatedLevel = 4;
          if (years >= 8) estimatedLevel = 5;
          return { ...s, level: estimatedLevel };
      });
  };

  const currentSkills = ensureSkillLevels(profile.skills || []);

  const handleUpdateSkill = (updatedSkill: Skill, index: number) => {
      const newSkills = [...currentSkills];
      newSkills[index] = updatedSkill;
      onUpdate({ skills: newSkills });
  };

  const handleRemoveSkill = (index: number) => {
      const newSkills = currentSkills.filter((_, i) => i !== index);
      onUpdate({ skills: newSkills });
  };

  const handleAddSkill = () => {
      onUpdate({ skills: [...currentSkills, { name: '', level: 1, years: 0 }] });
  };

  // NON-NEGOTIABLE HELPERS - DO NOT REMOVE
  const isNonNegotiable = (fieldName: string): boolean => {
    return profile.nonNegotiables?.includes(fieldName) || false;
  };

  const toggleNonNegotiable = (fieldName: string) => {
    const current = profile.nonNegotiables || [];
    const exists = current.includes(fieldName);
    
    onUpdate({
      nonNegotiables: exists 
        ? current.filter(f => f !== fieldName)
        : [...current, fieldName]
    });
  };

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
          <TabButton id="verifications" label="Verifications" icon={ShieldCheck} />
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
              
              {/* Impact Scope Section */}
              <ImpactScopeSelector 
                  // Fixed: use camelCase properties from CandidateProfile
                  currentScope={profile.currentImpactScope}
                  desiredScopes={profile.desiredImpactScopes}
                  onChangeCurrent={(scope) => onUpdate({ currentImpactScope: scope as any })}
                  onChangeDesired={(scopes) => onUpdate({ desiredImpactScopes: scopes as any })}
              />

              {/* Skills Section - ENHANCED */}
              <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                      <Award className="w-5 h-5 mr-2 text-gray-400" /> Skills & Proficiency
                  </h3>
                  <div className="space-y-4">
                      {currentSkills.map((skill, idx) => (
                          <SkillLevelSelector
                              key={idx}
                              skill={skill}
                              onChange={(updated) => handleUpdateSkill(updated, idx)}
                              onRemove={() => handleRemoveSkill(idx)}
                          />
                      ))}
                      
                      <button
                          onClick={handleAddSkill}
                          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-bold hover:border-gray-400 hover:text-gray-700 transition-all flex items-center justify-center"
                      >
                          <Plus className="w-5 h-5 mr-2" /> Add Skill
                      </button>
                  </div>
              </div>

              {/* Experience Section - REPLACED */}
              <div className="pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-gray-400" /> Work Experience
                      </h3>
                      <button
                      onClick={() => {
                          const newExp = {
                          id: crypto.randomUUID(),
                          role: 'New Role',
                          company: 'Company Name',
                          duration: '1 year',
                          startDate: new Date().toISOString().split('T')[0],
                          endDate: null,
                          isCurrentRole: true,
                          type: 'Full-time',
                          description: '',
                          achievements: [],
                          skillsAcquired: []
                          };
                          onUpdate({ experience: [...(profile.experience || []), newExp] });
                      }}
                      className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition-all flex items-center"
                      >
                      <Plus className="w-4 h-4 mr-1" /> Add Experience
                      </button>
                  </div>

                  <div className="space-y-4">
                      {(profile.experience || []).map((exp, idx) => (
                      <div key={exp.id} className="bg-gray-50 p-6 rounded-xl relative group">
                          <button
                          onClick={() => {
                              const newExp = (profile.experience || []).filter((_, i) => i !== idx);
                              onUpdate({ experience: newExp });
                          }}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                          >
                          <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                          <input
                              value={exp.role}
                              onChange={(e) => {
                              const newExp = [...(profile.experience || [])];
                              newExp[idx] = { ...exp, role: e.target.value };
                              onUpdate({ experience: newExp });
                              }}
                              className="font-bold text-lg bg-white p-2 rounded border border-gray-200"
                              placeholder="Role"
                          />
                          <input
                              value={exp.company}
                              onChange={(e) => {
                              const newExp = [...(profile.experience || [])];
                              newExp[idx] = { ...exp, company: e.target.value };
                              onUpdate({ experience: newExp });
                              }}
                              className="text-gray-600 bg-white p-2 rounded border border-gray-200"
                              placeholder="Company"
                          />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-3">
                          <input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => {
                              const newExp = [...(profile.experience || [])];
                              newExp[idx] = { ...exp, startDate: e.target.value };
                              onUpdate({ experience: newExp });
                              }}
                              className="text-sm bg-white p-2 rounded border border-gray-200"
                          />
                          <input
                              type="date"
                              value={exp.endDate || ''}
                              onChange={(e) => {
                              const newExp = [...(profile.experience || [])];
                              newExp[idx] = { ...exp, endDate: e.target.value, isCurrentRole: !e.target.value };
                              onUpdate({ experience: newExp });
                              }}
                              disabled={exp.isCurrentRole}
                              className="text-sm bg-white p-2 rounded border border-gray-200 disabled:bg-gray-100"
                          />
                          <label className="flex items-center text-sm">
                              <input
                              type="checkbox"
                              checked={exp.isCurrentRole}
                              onChange={(e) => {
                                  const newExp = [...(profile.experience || [])];
                                  newExp[idx] = { ...exp, isCurrentRole: e.target.checked, endDate: e.target.checked ? null : exp.endDate };
                                  onUpdate({ experience: newExp });
                              }}
                              className="mr-2"
                              />
                              Current Role
                          </label>
                          </div>
                          
                          <textarea
                          value={exp.description || ''}
                          onChange={(e) => {
                              const newExp = [...(profile.experience || [])];
                              newExp[idx] = { ...exp, description: e.target.value };
                              onUpdate({ experience: newExp });
                          }}
                          className="w-full text-sm bg-white p-3 rounded border border-gray-200 resize-none"
                          rows={3}
                          placeholder="Describe your role and responsibilities..."
                          />
                      </div>
                      ))}
                  </div>
              </div>

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
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Work Mode</label>
                    <div className="flex flex-wrap gap-2">
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
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${
                            profile.preferredWorkMode?.includes(mode) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    {/* CRITICAL: Non-negotiable toggle */}
                    {profile.preferredWorkMode && profile.preferredWorkMode.length > 0 && (
                      <NonNegotiableToggle
                        fieldName="work_mode"
                        isChecked={isNonNegotiable('work_mode')}
                        onToggle={() => toggleNonNegotiable('work_mode')}
                      />
                    )}
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Contract Types</label>
                    <div className="flex flex-wrap gap-2">
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
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${
                            profile.contractTypes?.includes(type) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {/* CRITICAL: Non-negotiable toggle */}
                    {profile.contractTypes && profile.contractTypes.length > 0 && (
                        <NonNegotiableToggle
                        fieldName="contract_type"
                        isChecked={isNonNegotiable('contract_type')}
                        onToggle={() => toggleNonNegotiable('contract_type')}
                        />
                    )}
                  </div>
               </div>

               <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                  <h3 className="font-bold text-green-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" /> Compensation
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Minimum Salary */}
                    <div>
                        <label className="block text-sm font-bold text-green-800 mb-2">Minimum Salary</label>
                        <div className="flex items-center gap-4">
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
                        {/* CRITICAL: Non-negotiable toggle for salary */}
                        {profile.salaryMin && profile.salaryMin > 0 && (
                            <NonNegotiableToggle
                            fieldName="salary_min"
                            isChecked={isNonNegotiable('salary_min')}
                            onToggle={() => toggleNonNegotiable('salary_min')}
                            />
                        )}
                    </div>

                    {/* Current Bonuses */}
                    <div>
                        <label className="block text-sm font-bold text-green-800 mb-2">Current Bonus Structure</label>
                        <input
                        value={profile.currentBonuses || ''}
                        onChange={e => onUpdate({ currentBonuses: e.target.value })}
                        className="w-full bg-white border border-green-200 rounded-lg p-2 text-green-900"
                        placeholder="e.g., 10% annual + equity"
                        />
                    </div>

                    {/* Notice Period */}
                    <div>
                        <label className="block text-sm font-bold text-green-800 mb-2">Notice Period</label>
                        <select
                            value={profile.noticePeriod || ''}
                            onChange={e => onUpdate({ noticePeriod: e.target.value })}
                            className="w-full bg-white border border-green-200 rounded-lg p-2 font-medium text-green-900"
                        >
                            <option value="">Select...</option>
                            <option value="Immediate">Immediately available</option>
                            <option value="2 Weeks">2 Weeks</option>
                            <option value="1 Month">1 Month</option>
                            <option value="2 Months">2 Months</option>
                            <option value="3 Months">3 Months+</option>
                        </select>
                        
                        {/* CRITICAL: Non-negotiable toggle for notice period */}
                        {profile.noticePeriod && (
                            <NonNegotiableToggle
                            fieldName="notice_period"
                            isChecked={isNonNegotiable('notice_period')}
                            onToggle={() => toggleNonNegotiable('notice_period')}
                            />
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
               <div className="pt-8 border-t border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                    <Smile className="w-5 h-5 mr-2 text-gray-400" /> Personality Assessments
                  </h3>
                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Myers-Briggs Type (MBTI)</label>
                      <input
                        value={profile.myers_briggs || ''}
                        onChange={e => onUpdate({ myers_briggs: e.target.value.toUpperCase() })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 uppercase"
                        placeholder="e.g., INTJ, ENFP"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Enneagram Type</label>
                      <select
                        value={profile.enneagram_type || ''}
                        onChange={e => onUpdate({ enneagram_type: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Not specified</option>
                        {['Type 1', 'Type 2', 'Type 3', 'Type 4', 'Type 5', 'Type 6', 'Type 7', 'Type 8', 'Type 9'].map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
               <GroupedMultiSelect
                  label="Industry Interests"
                  options={INDUSTRIES}
                  selected={profile.interestedIndustries || []}
                  onChange={inds => onUpdate({ interestedIndustries: inds })}
                  maxSelections={5}
               />

               {/* Desired Perks - DO NOT REMOVE */}
               <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                  <GroupedMultiSelect
                    label="Desired Perks & Benefits"
                    options={PERKS_CATEGORIES}
                    selected={profile.desiredPerks || []}
                    onChange={perks => onUpdate({ desiredPerks: perks })}
                    placeholder="Select perks..."
                    grouped={true}
                    maxSelections={8}
                    helpText="Healthcare, equity, flexible hours, etc."
                  />
                  
                  {/* CRITICAL: Non-negotiable toggle for perks */}
                  {profile.desiredPerks && profile.desiredPerks.length > 0 && (
                    <NonNegotiableToggle
                      fieldName="perks"
                      isChecked={isNonNegotiable('perks')}
                      onToggle={() => toggleNonNegotiable('perks')}
                    />
                  )}
               </div>
            </div>
          )}

          {activeTab === 'verifications' && (
            <VerificationDashboard candidateId={profile.id} stats={profile.verification_stats} skills={profile.skills} />
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
