
import React, { useState } from 'react';
import { CandidateProfile, JobType, WorkMode, SeniorityLevel } from '../types';
import { 
  ArrowRight, ArrowLeft, Check, Sparkles, Heart, Zap, 
  Briefcase, Globe, DollarSign, Award, Smile 
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
  onComplete: () => void;
}

const STEPS = [
  { id: 'basics', title: 'The Basics', required: true },
  { id: 'preferences', title: 'Preferences', required: true },
  { id: 'compensation', title: 'Compensation', required: true },
  { id: 'values', title: 'Values', required: false },
  { id: 'personality', title: 'Personality', required: false },
  { id: 'culture', title: 'Culture', required: false },
  { id: 'skills', title: 'Skills', required: false },
  { id: 'education', title: 'Education', required: false }, // Added Education Step
];

const CandidateOnboarding: React.FC<Props> = ({ profile, onUpdate, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const handleNext = () => {
    setAnimating(true);
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(c => c + 1);
      } else {
        onComplete();
      }
      setAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(c => c - 1);
        setAnimating(false);
      }, 300);
    }
  };

  const updateProfile = (data: Partial<CandidateProfile>) => {
    onUpdate(data);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const stepData = STEPS[currentStep];

  const renderStepContent = () => {
    switch (stepData.id) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Let's start with the basics</h2>
              <p className="text-gray-500 text-lg">We'll start simple and you can always add more later.</p>
            </div>
            
            <div className="space-y-4 max-w-lg mx-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input 
                  value={profile.name} 
                  onChange={e => updateProfile({ name: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Name"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Headline / Role</label>
                <input 
                  value={profile.headline} 
                  onChange={e => updateProfile({ headline: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Short Bio</label>
                <textarea 
                  value={profile.bio} 
                  onChange={e => updateProfile({ bio: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-base font-medium outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2">What are you looking for?</h2>
              <p className="text-gray-500 text-lg">Tell us what your ideal next role looks like.</p>
            </div>

            <div className="space-y-8 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Work Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(WorkMode).map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        const current = profile.preferredWorkMode || [];
                        const exists = current.includes(mode);
                        updateProfile({
                          preferredWorkMode: exists 
                            ? current.filter(m => m !== mode)
                            : [...current, mode]
                        });
                      }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        profile.preferredWorkMode?.includes(mode)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      <div className="font-bold">{mode}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Contract Type</label>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.values(JobType).map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const current = profile.contractTypes || [];
                        const exists = current.includes(type);
                        updateProfile({
                          contractTypes: exists 
                            ? current.filter(t => t !== type)
                            : [...current, type]
                        });
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                        profile.contractTypes?.includes(type)
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Preferred Location</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    value={profile.location} 
                    onChange={e => updateProfile({ location: e.target.value })}
                    className="w-full pl-12 p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder="e.g. London, UK or Remote"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'compensation':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Let's talk money</h2>
              <p className="text-gray-500 text-lg">Transparency matters. What are your expectations?</p>
            </div>

            <div className="max-w-lg mx-auto space-y-8">
              <div className="bg-green-50 p-8 rounded-3xl border border-green-100 text-center">
                <label className="block text-sm font-bold text-green-800 mb-4 uppercase tracking-wide">Minimum Annual Base Salary</label>
                <div className="flex items-center justify-center gap-2">
                  <select 
                    value={profile.salaryCurrency || 'USD'}
                    onChange={e => updateProfile({ salaryCurrency: e.target.value })}
                    className="bg-white border border-green-200 text-green-900 text-xl font-bold p-3 rounded-xl outline-none"
                  >
                    <option value="USD">$ USD</option>
                    <option value="GBP">£ GBP</option>
                    <option value="EUR">€ EUR</option>
                  </select>
                  <input 
                    type="number"
                    value={profile.salaryMin || ''} 
                    onChange={e => updateProfile({ salaryMin: parseInt(e.target.value) || 0 })}
                    className="w-48 p-3 bg-white border border-green-200 rounded-xl text-2xl font-black text-green-900 outline-none focus:ring-2 focus:ring-green-500 text-center placeholder-green-200"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Availability / Notice Period</label>
                <select 
                  value={profile.noticePeriod || ''}
                  onChange={e => updateProfile({ noticePeriod: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Select notice period...</option>
                  <option value="Immediate">Immediately available</option>
                  <option value="2 Weeks">2 Weeks</option>
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months+</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'values':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-gray-900 mb-2">What drives you?</h2>
              <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <Sparkles className="w-4 h-4 mr-2" />
                Matching values = 3x better engagement
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
              <GroupedMultiSelect
                label=""
                options={CULTURAL_VALUES}
                selected={profile.values || []}
                onChange={vals => updateProfile({ values: vals })}
                placeholder="Select your top 5 values..."
                maxSelections={5}
                helpText="Pick the values that matter most to you in a workplace."
              />
            </div>
          </div>
        );

      case 'personality':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Your work personality</h2>
              <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <Smile className="w-4 h-4 mr-2" />
                Personality fit increases placement success by 40%
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <GroupedMultiSelect
                label=""
                options={CHARACTER_TRAITS_CATEGORIES}
                selected={profile.characterTraits || []}
                onChange={traits => updateProfile({ characterTraits: traits })}
                placeholder="Select traits that describe you..."
                grouped={true}
                maxSelections={10}
              />
            </div>
          </div>
        );

      case 'culture':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Ideal Environment</h2>
              <div className="inline-flex items-center bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <Heart className="w-4 h-4 mr-2" />
                Culture fit = 2x retention rates
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
              <GroupedMultiSelect
                label="Industries of Interest"
                options={INDUSTRIES}
                selected={profile.interestedIndustries || []}
                onChange={inds => updateProfile({ interestedIndustries: inds })}
                placeholder="Select industries..."
                maxSelections={5}
              />

              <GroupedMultiSelect
                label="Desired Perks"
                options={PERKS_CATEGORIES}
                selected={profile.desiredPerks || []}
                onChange={perks => updateProfile({ desiredPerks: perks })}
                placeholder="Select perks..."
                grouped={true}
                maxSelections={5}
              />
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Show off your skills</h2>
              <div className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <Zap className="w-4 h-4 mr-2" />
                Detailed skills = more precise role matching
              </div>
            </div>

            <div className="max-w-3xl mx-auto">
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
                   updateProfile({ skills: newSkills });
                }}
                placeholder="Search technologies..."
                grouped={true}
                searchable={true}
              />
              
              {profile.skills.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   {profile.skills.map((skill, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <span className="font-bold text-sm text-gray-700">{skill.name}</span>
                            <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => {
                                    const updated = [...profile.skills];
                                    updated[idx].years = Math.max(0, updated[idx].years - 1);
                                    updateProfile({ skills: updated });
                                  }}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600 font-bold"
                                >-</button>
                                <span className="text-xs font-bold w-12 text-center">{skill.years} yrs</span>
                                <button 
                                  onClick={() => {
                                    const updated = [...profile.skills];
                                    updated[idx].years = updated[idx].years + 1;
                                    updateProfile({ skills: updated });
                                  }}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-gray-600 font-bold"
                                >+</button>
                            </div>
                        </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Your Educational Background</h2>
              <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <Award className="w-4 h-4 mr-2" />
                Education details improve matches by 20%
              </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Highest Education Level</label>
                <select
                  value={profile.education_level || ''}
                  onChange={e => updateProfile({ education_level: e.target.value as any })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select education level...</option>
                  {EDUCATION_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {profile.education_level && profile.education_level !== 'Self-Taught' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Field of Study</label>
                    <input
                      value={profile.education_field || ''}
                      onChange={e => updateProfile({ education_field: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Computer Science, Business, Engineering"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Institution</label>
                    <input
                      value={profile.education_institution || ''}
                      onChange={e => updateProfile({ education_institution: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Stanford University, Lambda School"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Header */}
      <div className="w-full bg-gray-50 h-2">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Step {currentStep + 1} of {STEPS.length}: <span className="text-gray-900">{stepData.title}</span>
        </div>
        {!stepData.required && (
          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase">Optional</span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 overflow-y-auto">
        <div className={`transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-100 p-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button 
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center font-bold px-6 py-3 rounded-xl transition-colors ${
              currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>

          <div className="flex gap-4">
            {!stepData.required && (
              <button 
                onClick={handleNext}
                className="px-6 py-3 text-gray-500 font-bold hover:text-gray-900 transition-colors"
              >
                Skip for now
              </button>
            )}
            
            <button 
              onClick={handleNext}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg flex items-center transition-transform hover:-translate-y-0.5"
            >
              {currentStep === STEPS.length - 1 ? 'Complete Profile' : 'Continue'} 
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateOnboarding;
