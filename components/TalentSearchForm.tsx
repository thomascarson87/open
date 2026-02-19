
import React, { useState, useEffect } from 'react';
import { TalentSearchCriteria, SeniorityLevel, WorkMode, JobType, JobSkill, Certification, RegulatoryDomain } from '../types';
import GroupedMultiSelect from './GroupedMultiSelect';
import SkillPillEditor from './SkillPillEditor';
import RoleFilter from './RoleFilter';
import { CULTURAL_VALUES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES, SKILLS_LIST, INDUSTRIES } from '../constants/matchingData';
import { EDUCATION_LEVELS } from '../constants/educationData';
import { CERTIFICATION_CATEGORIES } from '../constants/certifications';
import { fetchCertifications, fetchRegulatoryDomains, groupCertificationsByCategory } from '../utils/certifications';
import { ArrowRight, ArrowLeft, Search, Lock, Unlock, Zap, Info, Users, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface SelectedRole {
  id: string;
  name: string;
  slug: string;
  family_id: string;
  family_name: string;
}

interface Props {
  initialCriteria: TalentSearchCriteria;
  onSearch: (criteria: TalentSearchCriteria) => void;
}

const TalentSearchForm: React.FC<Props> = ({ initialCriteria, onSearch }) => {
  const [step, setStep] = useState(1);
  const [criteria, setCriteria] = useState<TalentSearchCriteria>(initialCriteria);
  const [selectedRoles, setSelectedRoles] = useState<SelectedRole[]>([]);
  const [certSectionOpen, setCertSectionOpen] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [regulatoryDomainsList, setRegulatoryDomainsList] = useState<RegulatoryDomain[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [certSearch, setCertSearch] = useState('');

  // Fetch certifications & regulatory domains when section is opened
  useEffect(() => {
    if (!certSectionOpen || certifications.length > 0) return;
    setCertLoading(true);
    Promise.all([fetchCertifications(), fetchRegulatoryDomains()])
      .then(([certs, domains]) => {
        setCertifications(certs);
        setRegulatoryDomainsList(domains);
      })
      .catch(err => console.error('Failed to fetch certifications:', err))
      .finally(() => setCertLoading(false));
  }, [certSectionOpen]);

  const toggleDealBreaker = (field: string) => {
      setCriteria(prev => ({
          ...prev,
          dealBreakers: prev.dealBreakers?.includes(field) 
            ? prev.dealBreakers.filter(f => f !== field)
            : [...(prev.dealBreakers || []), field]
      }));
  };

  const isDealBreaker = (field: string) => criteria.dealBreakers?.includes(field);

  const DealBreakerToggle = ({ field }: { field: string }) => (
      <button 
        onClick={() => toggleDealBreaker(field)}
        className={`ml-2 p-1 rounded-full transition-all flex items-center text-[10px] font-bold ${isDealBreaker(field) ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 border border-transparent'}`}
        title={isDealBreaker(field) ? "Strict Match Required" : "Flexible Match"}
      >
          {isDealBreaker(field) ? <><Lock className="w-3 h-3 mr-1" /> Strict</> : <><Unlock className="w-3 h-3 mr-1" /> Flex</>}
      </button>
  );

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden min-h-[500px] flex flex-col">
       {/* Steps Header */}
       <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-border flex justify-between items-center">
           <div className="flex space-x-2">
               {[1, 2, 3, 4].map(s => (
                   <div key={s} className={`h-2 w-12 rounded-full transition-all ${s <= step ? 'bg-gray-900' : 'bg-border'}`}></div>
               ))}
           </div>
           <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Step {step} of 4</div>
       </div>

       <div className="flex-1 p-8 overflow-y-auto">
           {step === 1 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <h2 className="font-heading text-xl text-primary mb-4">Core Requirements</h2>

                   {/* Role Filter - High signal, top of form */}
                   <div className="bg-accent-coral-bg/50 p-6 rounded-2xl border border-accent-coral-bg">
                       <div className="flex items-center gap-2 mb-4">
                           <Users className="w-5 h-5 text-accent-coral" />
                           <h3 className="text-sm font-bold text-accent-coral">Role-Based Search</h3>
                           <span className="text-[10px] font-bold text-accent-coral bg-accent-coral-bg px-2 py-0.5 rounded-full">High Signal</span>
                       </div>
                       <RoleFilter
                           selectedRoles={selectedRoles}
                           includeRelatedRoles={criteria.includeRelatedRoles || false}
                           onRolesChange={(roles, skills) => {
                               setSelectedRoles(roles);
                               setCriteria(prev => ({
                                   ...prev,
                                   roleIds: roles.map(r => r.id),
                                   requiredSkills: skills
                               }));
                           }}
                           onIncludeRelatedChange={(include) => {
                               setCriteria(prev => ({
                                   ...prev,
                                   includeRelatedRoles: include
                               }));
                           }}
                           defaultSkillLevel={3}
                       />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">Job Title (Free Text)</label>
                           <input
                              value={criteria.title || ''}
                              onChange={e => setCriteria({...criteria, title: e.target.value})}
                              placeholder="e.g. Senior Product Manager"
                              className="w-full p-3 border border-border rounded-xl"
                           />
                           <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Use for additional title matching beyond role filter</p>
                       </div>

                       <div>
                           <div className="flex justify-between">
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 mb-2">Location</label>
                               <DealBreakerToggle field="location"/>
                           </div>
                           <input
                              value={criteria.location || ''}
                              onChange={e => setCriteria({...criteria, location: e.target.value})}
                              placeholder="City, Country"
                              className="w-full p-3 border border-border rounded-xl"
                           />
                       </div>
                   </div>

                   <div>
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">Seniority Level</label>
                            <DealBreakerToggle field="seniority"/>
                       </div>
                       <div className="flex flex-wrap gap-2">
                            {Object.values(SeniorityLevel).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setCriteria(p => ({
                                        ...p,
                                        seniority: p.seniority?.includes(level) 
                                            ? p.seniority.filter(l => l !== level)
                                            : [...(p.seniority || []), level]
                                    }))}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${criteria.seniority?.includes(level) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white dark:bg-surface text-muted border-border'}`}
                                >
                                    {level}
                                </button>
                            ))}
                       </div>
                   </div>

                   <div>
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">Work Mode</label>
                            <DealBreakerToggle field="work_mode"/>
                       </div>
                       <div className="flex flex-wrap gap-2">
                            {Object.values(WorkMode).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setCriteria(p => ({
                                        ...p,
                                        workMode: p.workMode?.includes(mode) 
                                            ? p.workMode.filter(m => m !== mode)
                                            : [...(p.workMode || []), mode]
                                    }))}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${criteria.workMode?.includes(mode) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white dark:bg-surface text-muted border-border'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                       </div>
                   </div>

                   <div className="pt-4 border-t border-border">
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">Education Requirements</label>
                            <DealBreakerToggle field="education"/>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <select 
                                    value={criteria.requiredEducationLevel || ''}
                                    onChange={e => setCriteria({...criteria, requiredEducationLevel: e.target.value})}
                                    className="w-full p-3 border border-border rounded-xl bg-white dark:bg-surface"
                                >
                                    <option value="">Any Education Level</option>
                                    {EDUCATION_LEVELS.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={criteria.educationRequired || false}
                                        onChange={e => setCriteria({...criteria, educationRequired: e.target.checked})}
                                        className="mr-2 w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-primary focus:ring-accent-coral" 
                                    />
                                    <span className="text-sm text-muted">Strict requirement (no experience substitution)</span>
                                </label>
                            </div>
                       </div>
                       <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Leave blank to match all education levels</p>
                   </div>
               </div>
           )}

           {step === 2 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-heading text-xl text-primary">Technical Skills</h2>
                        <div className="flex items-center bg-accent-coral-bg text-accent-coral px-3 py-1 rounded-full text-xs font-bold">
                            <Zap className="w-3 h-3 mr-1" /> Precision Level Matching
                        </div>
                    </div>

                    <div className="bg-accent-coral-bg/50 p-4 rounded-xl border border-accent-coral-bg flex items-start gap-3 mb-6">
                        <Info className="w-5 h-5 text-accent-coral mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-accent-coral leading-relaxed">
                            {selectedRoles.length > 0
                                ? <>Skills from selected role template(s) are pre-populated below. Click any skill to adjust proficiency level.</>
                                : <>Set required proficiency levels (1-5) instead of just years. This improves matching by focusing on what candidates can actually <strong>do</strong>. Default is <strong>Level 3 (Applying)</strong>.</>
                            }
                        </p>
                    </div>

                    <GroupedMultiSelect
                        label="Search and Add Skills"
                        options={SKILLS_LIST}
                        selected={criteria.requiredSkills?.map(s => s.name) || []}
                        onChange={(names) => {
                            const current = criteria.requiredSkills || [];
                            const filtered = current.filter(s => names.includes(s.name));
                            names.forEach(n => {
                                if(!filtered.find(s => s.name === n)) {
                                    // Default to Level 3 (Applying)
                                    filtered.push({
                                        name: n,
                                        required_level: 3,
                                        minimumYears: undefined,
                                        weight: 'required'
                                    });
                                }
                            });
                            setCriteria({...criteria, requiredSkills: filtered});
                        }}
                        grouped={true}
                        searchable={true}
                        hideSelectedTags={true}
                    />

                    {criteria.requiredSkills && criteria.requiredSkills.length > 0 ? (
                        <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-muted uppercase tracking-widest">Configure Proficiency Requirements</h3>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{criteria.requiredSkills.length} selected</span>
                             </div>
                             <SkillPillEditor
                                skills={criteria.requiredSkills}
                                onChange={(skills) => setCriteria({...criteria, requiredSkills: skills})}
                             />
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-border">
                             <Zap className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3 opacity-50" />
                             <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500">No skills added yet</h3>
                             <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
                                {selectedRoles.length > 0
                                    ? 'Select a role on Step 1 to auto-populate skills, or add skills manually above.'
                                    : 'Select technologies from the list above to set your proficiency requirements.'}
                             </p>
                        </div>
                    )}

                    {/* Certifications & Compliance - Collapsible */}
                    <div className="pt-8 border-t">
                        <button
                            type="button"
                            onClick={() => setCertSectionOpen(!certSectionOpen)}
                            className="w-full flex items-center justify-between group"
                        >
                            <div>
                                <h3 className="text-lg font-black flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500"/>
                                    Certifications & Regulatory Experience
                                    <span className="ml-2 text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Optional</span>
                                </h3>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 text-left">Filter by specific credentials or compliance expertise</p>
                            </div>
                            {certSectionOpen ? <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                        </button>

                        {certSectionOpen && (
                            <div className="mt-6 space-y-8">
                                {certLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-600 rounded-full animate-spin" />
                                        <span className="ml-3 text-sm text-gray-400 dark:text-gray-500 font-bold">Loading certifications...</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search */}
                                        {certifications.length > 15 && (
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                <input
                                                    value={certSearch}
                                                    onChange={e => setCertSearch(e.target.value)}
                                                    placeholder="Search certifications..."
                                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-transparent rounded-xl text-sm font-bold focus:bg-white dark:bg-surface focus:ring-2 focus:ring-accent-coral outline-none"
                                                />
                                            </div>
                                        )}

                                        {/* Required Certifications */}
                                        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                                            <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Must-have certifications</label>
                                            <p className="text-xs text-amber-600 mb-4">Only show candidates with these credentials</p>
                                            {certifications.length === 0 ? (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No certifications available</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {Object.entries(groupCertificationsByCategory(
                                                        certSearch
                                                            ? certifications.filter(c => c.name.toLowerCase().includes(certSearch.toLowerCase()))
                                                            : certifications
                                                    )).map(([category, certs]) => {
                                                        const categoryLabel = CERTIFICATION_CATEGORIES.find(c => c.value === category)?.label || category;
                                                        const selectedInCategory = certs.filter(c => (criteria.requiredCertifications || []).includes(c.id)).length;
                                                        return (
                                                            <div key={category}>
                                                                <p className="text-xs font-black text-amber-800 mb-2">
                                                                    {categoryLabel}
                                                                    {selectedInCategory > 0 && <span className="ml-1 text-amber-600">({selectedInCategory} selected)</span>}
                                                                </p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                                                    {certs.map(cert => {
                                                                        const isRequired = (criteria.requiredCertifications || []).includes(cert.id);
                                                                        const isPreferred = (criteria.preferredCertifications || []).includes(cert.id);
                                                                        return (
                                                                            <label key={cert.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${isRequired ? 'bg-amber-100' : 'hover:bg-amber-100/50'} ${isPreferred ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isRequired}
                                                                                    disabled={isPreferred}
                                                                                    onChange={() => {
                                                                                        const current = criteria.requiredCertifications || [];
                                                                                        const updated = isRequired ? current.filter(id => id !== cert.id) : [...current, cert.id];
                                                                                        setCriteria({...criteria, requiredCertifications: updated});
                                                                                    }}
                                                                                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                                                                />
                                                                                <span className={`text-sm font-bold ${isRequired ? 'text-amber-900' : 'text-gray-700 dark:text-gray-300 dark:text-gray-600'}`}>{cert.name}</span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Preferred Certifications */}
                                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-[2rem] border border-border">
                                            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Nice-to-have certifications</label>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Candidates with these will rank higher</p>
                                            {certifications.length === 0 ? (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No certifications available</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {Object.entries(groupCertificationsByCategory(
                                                        certSearch
                                                            ? certifications.filter(c => c.name.toLowerCase().includes(certSearch.toLowerCase()))
                                                            : certifications
                                                    )).map(([category, certs]) => {
                                                        const categoryLabel = CERTIFICATION_CATEGORIES.find(c => c.value === category)?.label || category;
                                                        const selectedInCategory = certs.filter(c => (criteria.preferredCertifications || []).includes(c.id)).length;
                                                        return (
                                                            <div key={category}>
                                                                <p className="text-xs font-black text-muted mb-2">
                                                                    {categoryLabel}
                                                                    {selectedInCategory > 0 && <span className="ml-1 text-gray-400 dark:text-gray-500">({selectedInCategory} selected)</span>}
                                                                </p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                                                    {certs.map(cert => {
                                                                        const isPreferred = (criteria.preferredCertifications || []).includes(cert.id);
                                                                        const isRequired = (criteria.requiredCertifications || []).includes(cert.id);
                                                                        return (
                                                                            <label key={cert.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${isPreferred ? 'bg-white dark:bg-surface' : 'hover:bg-white dark:bg-surface/70'} ${isRequired ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isPreferred}
                                                                                    disabled={isRequired}
                                                                                    onChange={() => {
                                                                                        const current = criteria.preferredCertifications || [];
                                                                                        const updated = isPreferred ? current.filter(id => id !== cert.id) : [...current, cert.id];
                                                                                        setCriteria({...criteria, preferredCertifications: updated});
                                                                                    }}
                                                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-accent-coral focus:ring-accent-coral"
                                                                                />
                                                                                <span className={`text-sm font-bold ${isPreferred ? 'text-primary' : 'text-muted'}`}>{cert.name}</span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Regulatory Domains */}
                                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-[2rem] border border-border">
                                            <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-1">Regulatory experience needed</label>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Filter for candidates with compliance expertise in these areas</p>
                                            {regulatoryDomainsList.length === 0 ? (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No regulatory domains available</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {regulatoryDomainsList.map(domain => {
                                                        const isSelected = (criteria.regulatoryDomains || []).includes(domain.id);
                                                        return (
                                                            <label key={domain.id} className={`flex items-start gap-2.5 p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-white dark:bg-surface border border-accent-coral-light' : 'hover:bg-white dark:bg-surface/70'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {
                                                                        const current = criteria.regulatoryDomains || [];
                                                                        const updated = isSelected ? current.filter(id => id !== domain.id) : [...current, domain.id];
                                                                        setCriteria({...criteria, regulatoryDomains: updated});
                                                                    }}
                                                                    className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-700 text-accent-coral focus:ring-accent-coral"
                                                                />
                                                                <div>
                                                                    <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-muted'}`}>{domain.name}</span>
                                                                    {domain.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{domain.description}</p>}
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
               </div>
           )}

           {step === 3 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <h2 className="font-heading text-xl text-primary mb-4">Culture Fit</h2>
                   
                   <GroupedMultiSelect
                        label="Company Values"
                        options={CULTURAL_VALUES}
                        selected={criteria.values || []}
                        onChange={vals => setCriteria({...criteria, values: vals})}
                        placeholder="Select values..."
                        maxSelections={5}
                   />
                   
                   <GroupedMultiSelect
                        label="Desired Traits"
                        options={CHARACTER_TRAITS_CATEGORIES}
                        selected={criteria.desiredTraits || []}
                        onChange={vals => setCriteria({...criteria, desiredTraits: vals})}
                        placeholder="Ideal candidate traits..."
                        grouped={true}
                        maxSelections={5}
                   />

                   <GroupedMultiSelect
                        label="Industry Experience"
                        options={INDUSTRIES}
                        selected={criteria.interestedIndustries || []}
                        onChange={vals => setCriteria({...criteria, interestedIndustries: vals})}
                        placeholder="Relevant industries..."
                        maxSelections={5}
                   />
               </div>
           )}

            {step === 4 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <h2 className="font-heading text-xl text-primary mb-4">Practical Details</h2>

                   <div>
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">Budget Max (Annual)</label>
                            <DealBreakerToggle field="salary"/>
                       </div>
                       <div className="flex gap-2">
                            <select 
                                value={criteria.salaryCurrency}
                                onChange={e => setCriteria({...criteria, salaryCurrency: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl font-bold"
                            >
                                <option value="USD">USD</option>
                                <option value="GBP">GBP</option>
                                <option value="EUR">EUR</option>
                            </select>
                            <input 
                                type="number"
                                value={criteria.salaryMax || ''}
                                onChange={e => setCriteria({...criteria, salaryMax: parseInt(e.target.value)})}
                                className="flex-1 p-3 border border-border rounded-xl"
                                placeholder="e.g. 150000"
                            />
                       </div>
                   </div>

                   <div>
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600">Contract Types</label>
                            <DealBreakerToggle field="contract_type"/>
                       </div>
                       <div className="flex flex-wrap gap-2">
                            {Object.values(JobType).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setCriteria(p => ({
                                        ...p,
                                        contractTypes: p.contractTypes?.includes(type) 
                                            ? p.contractTypes.filter(t => t !== type)
                                            : [...(p.contractTypes || []), type]
                                    }))}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${criteria.contractTypes?.includes(type) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white dark:bg-surface text-muted border-border'}`}
                                >
                                    {type}
                                </button>
                            ))}
                       </div>
                   </div>

                   <GroupedMultiSelect
                        label="Perks Offered"
                        options={PERKS_CATEGORIES}
                        selected={criteria.desiredPerks || []}
                        onChange={vals => setCriteria({...criteria, desiredPerks: vals})}
                        grouped={true}
                   />
               </div>
           )}
       </div>

       <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-border flex justify-between">
           {step > 1 ? (
               <button onClick={() => setStep(s => s - 1)} className="flex items-center text-muted font-bold hover:text-primary">
                   <ArrowLeft className="w-4 h-4 mr-2"/> Back
               </button>
           ) : <div/>}

           {step < 4 ? (
               <button onClick={() => setStep(s => s + 1)} className="flex items-center bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-transform active:scale-95">
                   Next Step <ArrowRight className="w-4 h-4 ml-2"/>
               </button>
           ) : (
               <button onClick={() => onSearch(criteria)} className="flex items-center bg-accent-coral text-white px-8 py-3 rounded-xl font-bold hover:bg-accent-coral shadow-lg transition-all active:scale-95">
                   <Search className="w-4 h-4 mr-2"/> Run Match
               </button>
           )}
       </div>
    </div>
  );
};

export default TalentSearchForm;
