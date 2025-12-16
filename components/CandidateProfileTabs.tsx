
import React, { useState } from 'react';
import { CandidateProfile, SeniorityLevel, WorkMode, JobType } from '../types';
import { 
  User, Briefcase, Award, Heart, CheckCircle, Zap, DollarSign, 
  MapPin, Clock, Lock, Unlock, Edit2, Plus, Trash2, Layout, Smile, ShieldCheck
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import VerificationDashboard from './VerificationDashboard';
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
              
              {/* Skills Section - REPLACED */}
              <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
                      <Award className="w-5 h-5 mr-2 text-gray-400" /> Skills
                  </h3>
                  <div className="space-y-3">
                      {(profile.skills || []).map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl group hover:bg-gray-100 transition-all">
                          <span className="font-bold text-gray-900">{skill.name}</span>
                          <div className="flex items-center gap-3">
                          <button
                              onClick={() => {
                              const newSkills = [...(profile.skills || [])];
                              newSkills[idx] = { ...skill, years: Math.max(0, skill.years - 0.5) };
                              onUpdate({ skills: newSkills });
                              }}
                              className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
                          >
                              -
                          </button>
                          <span className="font-bold text-gray-600 w-12 text-center">
                              {skill.years}y
                          </span>
                          <button
                              onClick={() => {
                              const newSkills = [...(profile.skills || [])];
                              newSkills[idx] = { ...skill, years: skill.years + 0.5 };
                              onUpdate({ skills: newSkills });
                              }}
                              className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
                          >
                              +
                          </button>
                          <button
                              onClick={() => {
                              const newSkills = (profile.skills || []).filter((_, i) => i !== idx);
                              onUpdate({ skills: newSkills });
                              }}
                              className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                          </div>
                      </div>
                      ))}
                      
                      {/* Add Skill Section */}
                      <div className="flex gap-2 pt-2">
                      <input
                          type="text"
                          placeholder="Skill name (e.g., React)"
                          className="flex-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                          onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                              const skillName = (e.target as HTMLInputElement).value.trim();
                              if (skillName) {
                              onUpdate({ 
                                  skills: [...(profile.skills || []), { name: skillName, years: 1 }] 
                              });
                              (e.target as HTMLInputElement).value = '';
                              }
                          }
                          }}
                      />
                      <button
                          onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement);
                          const skillName = input.value.trim();
                          if (skillName) {
                              onUpdate({ 
                              skills: [...(profile.skills || []), { name: skillName, years: 1 }] 
                              });
                              input.value = '';
                          }
                          }}
                          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center"
                      >
                          <Plus className="w-4 h-4 mr-2" /> Add Skill
                      </button>
                      </div>
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
                  <div>
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
                            profile.preferredWorkMode?.includes(mode) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
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
                            profile.contractTypes?.includes(type) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                  <h3 className="font-bold text-green-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" /> Compensation
                  </h3>
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
            </div>
          )}

          {activeTab === 'verifications' && (
            <VerificationDashboard candidateId={profile.id} stats={profile.verification_stats} />
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
