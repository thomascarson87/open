import React, { useState } from 'react';
import { 
  CandidateProfile, WorkMode, JobType, Skill, SeniorityLevel 
} from '../types';
import { 
  ArrowRight, ArrowLeft, CheckCircle, User, Zap, GraduationCap, 
  Briefcase, DollarSign, Heart, Smile, Building, TrendingUp, Sparkles, MapPin, Check
} from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import SkillLevelSelector from './SkillLevelSelector';
import ImpactScopeSelector from './ImpactScopeSelector';
import ProfileReviewCard from './ProfileReviewCard';
import { 
  CULTURAL_VALUES, 
  INDUSTRIES, 
  PERKS_CATEGORIES, 
  CHARACTER_TRAITS_CATEGORIES,
  SKILLS_LIST,
  SKILL_LEVEL_METADATA
} from '../constants/matchingData';
import { EDUCATION_LEVELS, EDUCATION_FIELDS } from '../constants/educationData';
import { COMPANY_SIZE_RANGES, COMPANY_SIZE_DESCRIPTIONS } from '../constants/companyData';

interface Props {
  profile: CandidateProfile;
  onUpdate: (data: Partial<CandidateProfile>) => void;
  onComplete: () => void;
}

const STEPS = [
  { id: 'basics', title: 'The Basics', icon: User, required: true },
  { id: 'experience', title: 'Experience Level', icon: TrendingUp, required: true },
  { id: 'skills', title: 'Skills & Expertise', icon: Zap, required: true },
  { id: 'education', title: 'Education', icon: GraduationCap, required: false },
  { id: 'preferences', title: 'Work Preferences', icon: Briefcase, required: true },
  { id: 'compensation', title: 'Compensation', icon: DollarSign, required: true },
  { id: 'values', title: 'Values', icon: Heart, required: false },
  { id: 'personality', title: 'Personality', icon: Smile, required: false },
  { id: 'culture', title: 'Culture & Perks', icon: Building, required: false },
  { id: 'review', title: 'Review & Complete', icon: CheckCircle, required: true },
];

const NonNegotiableToggle = ({ 
  fieldName, 
  isChecked, 
  onToggle 
}: { 
  fieldName: string; 
  isChecked: boolean; 
  onToggle: () => void;
}) => (
  <div className="flex items-center gap-3 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isChecked ? 'bg-red-500 focus:ring-red-500' : 'bg-blue-500 focus:ring-blue-500'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        isChecked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
    <span className={`text-sm font-bold ${isChecked ? 'text-red-700' : 'text-blue-700'}`}>
      {isChecked ? '🔒 Non-negotiable (Dealbreaker)' : '✨ Flexible Preference'}
    </span>
  </div>
);

const CandidateOnboarding: React.FC<Props> = ({ profile, onUpdate, onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  const step = STEPS[currentStepIdx];
  const progress = ((currentStepIdx + 1) / STEPS.length) * 100;

  const isNonNegotiable = (fieldName: string) => profile.nonNegotiables?.includes(fieldName) || false;
  const toggleNonNegotiable = (fieldName: string) => {
    const current = profile.nonNegotiables || [];
    onUpdate({
      nonNegotiables: current.includes(fieldName) 
        ? current.filter(f => f !== fieldName)
        : [...current, fieldName]
    });
  };

  const handleNext = () => {
    const validation = validateStep(step.id);
    if (!validation.valid) {
      alert(validation.errors[0]);
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      if (currentStepIdx < STEPS.length - 1) {
        setCurrentStepIdx(prev => prev + 1);
      } else {
        onComplete();
      }
      setAnimating(false);
      window.scrollTo(0, 0);
    }, 300);
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStepIdx(prev => prev - 1);
        setAnimating(false);
        window.scrollTo(0, 0);
      }, 300);
    }
  };

  const validateStep = (stepId: string) => {
    const errors: string[] = [];
    switch (stepId) {
      case 'basics':
        if (!profile.name?.trim()) errors.push('Name is required');
        if (!profile.headline?.trim()) errors.push('Headline is required');
        if ((profile.bio?.length || 0) < 50) errors.push('Bio must be at least 50 characters');
        break;
      case 'experience':
        if ((profile.desiredImpactScopes?.length || 0) === 0) errors.push('Select at least one impact scope');
        break;
      case 'skills':
        if ((profile.skills?.length || 0) < 3) errors.push('Add at least 3 skills');
        break;
      case 'preferences':
        if ((profile.preferredWorkMode?.length || 0) === 0) errors.push('Select at least one work mode');
        if ((profile.contractTypes?.length || 0) === 0) errors.push('Select at least one contract type');
        if (!profile.location?.trim()) errors.push('Location is required');
        break;
      case 'compensation':
        if (!profile.salaryMin || profile.salaryMin <= 0) errors.push('Minimum salary is required');
        if (!profile.noticePeriod) errors.push('Notice period is required');
        break;
    }
    return { valid: errors.length === 0, errors };
  };

  const getSectionCompletion = (stepId: string) => {
    const val = validateStep(stepId);
    return val.valid ? 100 : 0;
  };

  const renderContent = () => {
    switch (step.id) {
      case 'basics':
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Let's build your profile</h2>
              <p className="text-gray-500 text-lg">Help us understand the professional behind the code.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name *</label>
                <input 
                  value={profile.name} 
                  onChange={e => onUpdate({ name: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-blue-50 outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Headline / Current Role *</label>
                <input 
                  value={profile.headline} 
                  onChange={e => onUpdate({ headline: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-blue-50 outline-none"
                  placeholder="e.g. Senior Backend Engineer (Node.js)"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">About You *</label>
                  <span className={`text-xs font-bold ${profile.bio?.length < 50 ? 'text-red-400' : 'text-green-500'}`}>
                    {profile.bio?.length || 0}/500 chars (Min 50)
                  </span>
                </div>
                <textarea 
                  value={profile.bio} 
                  onChange={e => onUpdate({ bio: e.target.value.slice(0, 500) })}
                  rows={6}
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-base leading-relaxed focus:ring-4 focus:ring-blue-50 outline-none resize-none"
                  placeholder="Tell companies about your journey, your biggest achievements, and what you're looking for next..."
                />
              </div>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Experience & Level</h2>
              <p className="text-gray-500 text-lg">Companies match by total experience and breadth of impact.</p>
            </div>
            
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Professional Experience *</label>
                <div className="flex items-center gap-6">
                  <input 
                    type="range" min="0" max="25" step="0.5"
                    value={profile.totalYearsExperience || 0}
                    onChange={e => onUpdate({ totalYearsExperience: parseFloat(e.target.value) })}
                    className="flex-1 h-3 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="bg-blue-600 px-6 py-2 rounded-2xl font-black text-2xl w-32 text-center">
                    {profile.totalYearsExperience || 0} <span className="text-xs">Yrs</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Desired Impact Scope *</label>
              <ImpactScopeSelector 
                selected={profile.desiredImpactScopes || []}
                onChange={scopes => onUpdate({ desiredImpactScopes: scopes })}
              />
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
             <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Skills & Expertise</h2>
              <div className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <Sparkles className="w-4 h-4 mr-2" />
                Levels matter more than years for precise matching
              </div>
            </div>

            <GroupedMultiSelect 
              label="What are your core technical skills?"
              options={SKILLS_LIST}
              selected={profile.skills?.map(s => s.name) || []}
              onChange={names => {
                const existing = profile.skills || [];
                const newSkills = names.map(name => {
                  const match = existing.find(s => s.name === name);
                  return match || { name, level: 3 as any, years: undefined, description: '' };
                });
                onUpdate({ skills: newSkills });
              }}
              grouped={true}
              searchable={true}
              placeholder="Search technologies (e.g. React, Node.js, AWS...)"
            />

            <div className="space-y-4">
              {profile.skills?.map((skill, idx) => (
                <SkillLevelSelector 
                  key={skill.name}
                  skill={skill}
                  onUpdate={updates => {
                    const newSkills = [...profile.skills];
                    newSkills[idx] = { ...skill, ...updates };
                    onUpdate({ skills: newSkills });
                  }}
                  onRemove={() => onUpdate({ skills: profile.skills.filter(s => s.name !== skill.name) })}
                />
              ))}
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Education</h2>
              <p className="text-gray-500">Academic credentials provide context for your professional growth.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Highest Level</label>
                <select 
                  value={profile.education_level || ''}
                  onChange={e => onUpdate({ education_level: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg focus:ring-4 focus:ring-blue-50 outline-none"
                >
                  <option value="">Select Level...</option>
                  {EDUCATION_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>

              {profile.education_level === 'Self-Taught' && (
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-900 font-medium">Self-taught developers are highly valued on Open! Your verified skills will be your strongest credentials.</p>
                </div>
              )}

              {profile.education_level && profile.education_level !== 'Self-Taught' && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Field of Study</label>
                    <select 
                      value={profile.education_field || ''}
                      onChange={e => onUpdate({ education_field: e.target.value })}
                      className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg focus:ring-4 focus:ring-blue-50 outline-none"
                    >
                      <option value="">Select Field...</option>
                      {EDUCATION_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Institution</label>
                    <input 
                      value={profile.education_institution || ''}
                      onChange={e => onUpdate({ education_institution: e.target.value })}
                      className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg focus:ring-4 focus:ring-blue-50 outline-none"
                      placeholder="e.g. Stanford University"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Graduation Year</label>
                    <input 
                      type="number"
                      value={profile.education_graduation_year || ''}
                      onChange={e => onUpdate({ education_graduation_year: parseInt(e.target.value) || undefined })}
                      className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-lg focus:ring-4 focus:ring-blue-50 outline-none"
                      placeholder="e.g. 2018"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Work Preferences</h2>
              <p className="text-gray-500">Your non-negotiables define the search boundaries.</p>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Work Mode *</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(WorkMode).map(mode => (
                    <button
                      key={mode}
                      onClick={() => {
                        const current = profile.preferredWorkMode || [];
                        onUpdate({ preferredWorkMode: current.includes(mode) ? current.filter(m => m !== mode) : [...current, mode] });
                      }}
                      className={`p-5 rounded-2xl border-2 transition-all font-black text-sm ${
                        profile.preferredWorkMode?.includes(mode) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-300 text-gray-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <NonNegotiableToggle 
                  fieldName="work_mode" 
                  isChecked={isNonNegotiable('work_mode')} 
                  onToggle={() => toggleNonNegotiable('work_mode')} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Location *</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <input 
                    value={profile.location} 
                    onChange={e => onUpdate({ location: e.target.value })}
                    className="w-full pl-14 p-5 bg-white border border-gray-200 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-blue-50 outline-none"
                    placeholder="e.g. London, UK"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-600">Open to Relocation?</span>
                  <button 
                    onClick={() => onUpdate({ willingToRelocate: !profile.willingToRelocate })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      profile.willingToRelocate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {profile.willingToRelocate ? 'YES' : 'NO'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Contract Type *</label>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.values(JobType).map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const current = profile.contractTypes || [];
                        onUpdate({ contractTypes: current.includes(type) ? current.filter(t => t !== type) : [...current, type] });
                      }}
                      className={`px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all ${
                        profile.contractTypes?.includes(type) ? 'bg-gray-900 border-gray-900 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <NonNegotiableToggle 
                  fieldName="contract_type" 
                  isChecked={isNonNegotiable('contract_type')} 
                  onToggle={() => toggleNonNegotiable('contract_type')} 
                />
              </div>
            </div>
          </div>
        );

      case 'compensation':
        return (
          <div className="space-y-8 max-w-lg mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Compensation</h2>
              <p className="text-gray-500">Total transparency ensures zero wasted interviews.</p>
            </div>

            <div className="bg-green-50 p-8 rounded-[40px] border-4 border-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 text-center">
                <label className="block text-xs font-bold text-green-700 uppercase tracking-widest mb-6">Minimum Annual Base Salary *</label>
                <div className="flex items-center justify-center gap-3">
                  <select 
                    value={profile.salaryCurrency || 'USD'}
                    onChange={e => onUpdate({ salaryCurrency: e.target.value })}
                    className="bg-white border-2 border-green-200 text-green-900 text-xl font-black p-4 rounded-2xl outline-none"
                  >
                    <option value="USD">$</option>
                    <option value="GBP">£</option>
                    <option value="EUR">€</option>
                  </select>
                  <input 
                    type="number"
                    value={profile.salaryMin || ''} 
                    onChange={e => onUpdate({ salaryMin: parseInt(e.target.value) || 0 })}
                    className="flex-1 p-4 bg-white border-2 border-green-200 rounded-2xl text-3xl font-black text-green-900 outline-none focus:border-green-400 text-center"
                    placeholder="100,000"
                  />
                </div>
                <div className="mt-6">
                   <NonNegotiableToggle 
                    fieldName="salary_min" 
                    isChecked={isNonNegotiable('salary_min')} 
                    onToggle={() => toggleNonNegotiable('salary_min')} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notice Period *</label>
              <select 
                value={profile.noticePeriod || ''}
                onChange={e => onUpdate({ noticePeriod: e.target.value })}
                className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-blue-50 outline-none cursor-pointer"
              >
                <option value="">Select notice...</option>
                {['Immediate', '2 Weeks', '1 Month', '2 Months', '3 Months+'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <NonNegotiableToggle 
                fieldName="notice_period" 
                isChecked={isNonNegotiable('notice_period')} 
                onToggle={() => toggleNonNegotiable('notice_period')} 
              />
            </div>
          </div>
        );

      case 'values':
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-black text-gray-900 mb-2">What drives you?</h2>
              <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold">
                <Heart className="w-4 h-4 mr-2" />
                Matching values = 3x better engagement
              </div>
            </div>
            <GroupedMultiSelect
              label="Select your top 5 workplace values"
              options={CULTURAL_VALUES}
              selected={profile.values || []}
              onChange={vals => onUpdate({ values: vals })}
              placeholder="What matters most in your next role?"
              maxSelections={5}
            />
          </div>
        );

      case 'personality':
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Work Personality</h2>
              <p className="text-gray-500">Personality fit increases placement success by 40%.</p>
            </div>
            <GroupedMultiSelect
              label="Select character traits that describe you"
              options={CHARACTER_TRAITS_CATEGORIES}
              selected={profile.characterTraits || []}
              onChange={traits => onUpdate({ characterTraits: traits })}
              placeholder="Choose up to 10 traits..."
              grouped={true}
              maxSelections={10}
            />
            
            <div className="border-t border-gray-100 pt-8 mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <Smile className="w-5 h-5 mr-2 text-blue-500" /> Professional Assessments (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Myers-Briggs</label>
                    <input 
                      value={profile.personalityAssessments?.myersBriggs || ''}
                      onChange={e => onUpdate({ personalityAssessments: { ...profile.personalityAssessments, myersBriggs: e.target.value.toUpperCase() } })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                      placeholder="e.g. INTJ"
                      maxLength={4}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Enneagram</label>
                    <input 
                      value={profile.personalityAssessments?.enneagram || ''}
                      onChange={e => onUpdate({ personalityAssessments: { ...profile.personalityAssessments, enneagram: e.target.value } })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                      placeholder="e.g. Type 5"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">DiSC</label>
                    <input 
                      value={profile.personalityAssessments?.disc || ''}
                      onChange={e => onUpdate({ personalityAssessments: { ...profile.personalityAssessments, disc: e.target.value } })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                      placeholder="e.g. Di"
                    />
                 </div>
              </div>
            </div>
          </div>
        );

      case 'culture':
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
             <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Culture & Perks</h2>
              <p className="text-gray-500">The finishing touches to find your ideal team environment.</p>
            </div>

            <GroupedMultiSelect
              label="Interested Industries"
              options={INDUSTRIES}
              selected={profile.interestedIndustries || []}
              onChange={inds => onUpdate({ interestedIndustries: inds })}
              placeholder="Select industries..."
              maxSelections={5}
            />

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Preferred Company Size</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COMPANY_SIZE_RANGES.map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      const current = profile.preferredCompanySize || [];
                      onUpdate({ 
                        preferredCompanySize: current.includes(size) 
                          ? current.filter(s => s !== size) 
                          : [...current, size] 
                      });
                    }}
                    className={`p-4 rounded-xl border-2 transition-all font-bold text-xs ${
                      profile.preferredCompanySize?.includes(size) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {COMPANY_SIZE_DESCRIPTIONS[size]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
               <GroupedMultiSelect
                label="Desired Perks & Benefits"
                options={PERKS_CATEGORIES}
                selected={profile.desiredPerks || []}
                onChange={perks => onUpdate({ desiredPerks: perks })}
                placeholder="Pick your top perks..."
                grouped={true}
                maxSelections={8}
              />
              <NonNegotiableToggle 
                fieldName="perks" 
                isChecked={isNonNegotiable('perks')} 
                onToggle={() => toggleNonNegotiable('perks')} 
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-4xl font-black text-gray-900 mb-2">Review Profile</h2>
              <p className="text-gray-500 text-lg">You're one step away from precision matching.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileReviewCard 
                title="Basics" icon={User} completionPercent={getSectionCompletion('basics')} 
                summary={`${profile.name} · ${profile.headline}`} 
                onEdit={() => setCurrentStepIdx(0)} 
              />
              <ProfileReviewCard 
                title="Experience" icon={TrendingUp} completionPercent={getSectionCompletion('experience')} 
                summary={`${profile.totalYearsExperience} Yrs Experience · ${profile.desiredImpactScopes?.length} Scopes selected`} 
                onEdit={() => setCurrentStepIdx(1)} 
              />
              <ProfileReviewCard 
                title="Skills" icon={Zap} completionPercent={getSectionCompletion('skills')} 
                summary={`${profile.skills?.length} skills configured with proficiency levels`} 
                onEdit={() => setCurrentStepIdx(2)} 
              />
              <ProfileReviewCard 
                title="Education" 
                icon={GraduationCap} 
                completionPercent={profile.education_level ? 100 : 0} 
                summary={profile.education_level 
                  ? `${profile.education_level}${profile.education_field ? ` in ${profile.education_field}` : ''}${profile.education_institution ? ` @ ${profile.education_institution}` : ''}`
                  : 'No education data entered (optional)'
                } 
                onEdit={() => setCurrentStepIdx(3)} 
              />
              <ProfileReviewCard 
                title="Preferences" icon={Briefcase} completionPercent={getSectionCompletion('preferences')} 
                summary={`${profile.preferredWorkMode?.join(', ')} · ${profile.location}`} 
                onEdit={() => setCurrentStepIdx(4)} 
              />
              <ProfileReviewCard 
                title="Compensation" icon={DollarSign} completionPercent={getSectionCompletion('compensation')} 
                summary={`${profile.salaryMin?.toLocaleString()} ${profile.salaryCurrency} Min · ${profile.noticePeriod} Notice`} 
                onEdit={() => setCurrentStepIdx(5)} 
              />
              <ProfileReviewCard 
                title="Culture & Fit" icon={Building} completionPercent={100} 
                summary={`${profile.values?.length} values · ${profile.desiredPerks?.length} perks`} 
                onEdit={() => setCurrentStepIdx(8)} 
              />
            </div>

            <div className="bg-blue-600 p-8 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div>
                <h3 className="text-2xl font-black mb-1">Ready to go live?</h3>
                <p className="text-blue-100">By completing your profile, you'll become visible to high-intent hiring managers.</p>
              </div>
              <button 
                onClick={onComplete}
                className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-lg flex items-center gap-3"
              >
                Complete Profile <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center font-black text-white text-lg">O</div>
             <div>
                <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest">Candidate Onboarding</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                   {STEPS.map((s, idx) => (
                      <div key={s.id} className={`h-1 rounded-full transition-all duration-500 ${
                        idx < currentStepIdx ? 'w-4 bg-green-500' : idx === currentStepIdx ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'
                      }`} />
                   ))}
                </div>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <step.icon className="w-3.5 h-3.5" />
            Step {currentStepIdx + 1}: {step.title}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 py-12 px-4">
        <div className={`transition-all duration-300 transform ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {renderContent()}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="sticky bottom-0 z-40 bg-white border-t border-gray-100 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button 
            onClick={handleBack}
            disabled={currentStepIdx === 0}
            className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all ${
              currentStepIdx === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-4">
            {!step.required && (
              <button onClick={handleNext} className="text-sm font-bold text-gray-400 hover:text-gray-900 px-4">
                Skip for now
              </button>
            )}
            <button 
              onClick={handleNext}
              className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm md:text-base hover:bg-black shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 transform active:scale-95"
            >
              {currentStepIdx === STEPS.length - 1 ? 'Complete Profile' : 'Continue'} 
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateOnboarding;
