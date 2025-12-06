

import React, { useState } from 'react';
import { TalentSearchCriteria, SeniorityLevel, WorkMode, JobType, JobSkill } from '../types';
import GroupedMultiSelect from './GroupedMultiSelect';
import { CULTURAL_VALUES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES, SKILLS_LIST, INDUSTRIES } from '../constants/matchingData';
import { ArrowRight, ArrowLeft, Search, Lock, Unlock } from 'lucide-react';

interface Props {
  initialCriteria: TalentSearchCriteria;
  onSearch: (criteria: TalentSearchCriteria) => void;
}

const EDUCATION_LEVELS = [
    'High School', 
    'Associate Degree', 
    "Bachelor's Degree", 
    "Master's Degree", 
    'PhD/Doctorate', 
    'Professional Certification', 
    'Bootcamp Graduate', 
    'Self-Taught', 
    'Other'
];

const TalentSearchForm: React.FC<Props> = ({ initialCriteria, onSearch }) => {
  const [step, setStep] = useState(1);
  const [criteria, setCriteria] = useState<TalentSearchCriteria>(initialCriteria);

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
        className={`ml-2 p-1 rounded-full transition-all flex items-center text-[10px] font-bold ${isDealBreaker(field) ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-gray-50 text-gray-400 border border-transparent'}`}
        title={isDealBreaker(field) ? "Strict Match Required" : "Flexible Match"}
      >
          {isDealBreaker(field) ? <><Lock className="w-3 h-3 mr-1" /> Strict</> : <><Unlock className="w-3 h-3 mr-1" /> Flex</>}
      </button>
  );

  const updateSkill = (name: string, field: keyof JobSkill, value: any) => {
    setCriteria(prev => ({
        ...prev,
        requiredSkills: prev.requiredSkills?.map(s => s.name === name ? { ...s, [field]: value } : s)
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
       {/* Steps Header */}
       <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
           <div className="flex space-x-2">
               {[1, 2, 3, 4].map(s => (
                   <div key={s} className={`h-2 w-12 rounded-full transition-all ${s <= step ? 'bg-gray-900' : 'bg-gray-200'}`}></div>
               ))}
           </div>
           <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step {step} of 4</div>
       </div>

       <div className="flex-1 p-8 overflow-y-auto">
           {step === 1 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Core Requirements</h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Job Title / Role</label>
                           <input 
                              value={criteria.title || ''}
                              onChange={e => setCriteria({...criteria, title: e.target.value})}
                              placeholder="e.g. Senior Product Manager"
                              className="w-full p-3 border border-gray-200 rounded-xl"
                           />
                       </div>
                       
                       <div>
                           <div className="flex justify-between">
                               <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                               <DealBreakerToggle field="location"/>
                           </div>
                           <input 
                              value={criteria.location || ''}
                              onChange={e => setCriteria({...criteria, location: e.target.value})}
                              placeholder="City, Country"
                              className="w-full p-3 border border-gray-200 rounded-xl"
                           />
                       </div>
                   </div>

                   <div>
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">Seniority Level</label>
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
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${criteria.seniority?.includes(level) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                                >
                                    {level}
                                </button>
                            ))}
                       </div>
                   </div>

                   <div>
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">Work Mode</label>
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
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${criteria.workMode?.includes(mode) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                       </div>
                   </div>

                   <div className="pt-4 border-t border-gray-100">
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">Education Requirements</label>
                            <DealBreakerToggle field="education"/>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <select 
                                    value={criteria.required_education_level || ''}
                                    onChange={e => setCriteria({...criteria, required_education_level: e.target.value})}
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-white"
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
                                        checked={criteria.education_required || false}
                                        onChange={e => setCriteria({...criteria, education_required: e.target.checked})}
                                        className="mr-2 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" 
                                    />
                                    <span className="text-sm text-gray-600">Strict requirement (no experience substitution)</span>
                                </label>
                            </div>
                       </div>
                       <p className="text-xs text-gray-400 mt-2">Leave blank to match all education levels</p>
                   </div>
               </div>
           )}

           {step === 2 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Skills</h2>
                    
                    <GroupedMultiSelect 
                        label="Required Skills"
                        options={SKILLS_LIST}
                        selected={criteria.requiredSkills.map(s => s.name)}
                        onChange={(names) => {
                            const current = criteria.requiredSkills || [];
                            const filtered = current.filter(s => names.includes(s.name));
                            names.forEach(n => {
                                if(!filtered.find(s => s.name === n)) {
                                    filtered.push({ name: n, minimumYears: 2, weight: 'required' });
                                }
                            });
                            setCriteria({...criteria, requiredSkills: filtered});
                        }}
                        grouped={true}
                        searchable={true}
                    />

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {criteria.requiredSkills.map((skill, idx) => (
                             <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                 <span className="font-bold text-gray-700 w-1/3 text-sm">{skill.name}</span>
                                 <div className="flex items-center space-x-2">
                                     <span className="text-xs text-gray-500">Min Years:</span>
                                     <input 
                                        type="number" 
                                        value={skill.minimumYears}
                                        onChange={e => updateSkill(skill.name, 'minimumYears', parseInt(e.target.value))}
                                        className="w-12 p-1 border rounded text-center font-bold text-sm"
                                     />
                                     <button 
                                        onClick={() => updateSkill(skill.name, 'weight', skill.weight === 'required' ? 'preferred' : 'required')}
                                        className={`px-2 py-1 rounded text-xs font-bold ${skill.weight === 'required' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
                                     >
                                         {skill.weight === 'required' ? 'Required' : 'Preferred'}
                                     </button>
                                 </div>
                             </div>
                         ))}
                    </div>
               </div>
           )}

           {step === 3 && (
               <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Culture Fit</h2>
                   
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
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Practical Details</h2>

                   <div>
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">Budget Max (Annual)</label>
                            <DealBreakerToggle field="salary"/>
                       </div>
                       <div className="flex gap-2">
                            <select 
                                value={criteria.salaryCurrency}
                                onChange={e => setCriteria({...criteria, salaryCurrency: e.target.value})}
                                className="p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                            >
                                <option value="USD">USD</option>
                                <option value="GBP">GBP</option>
                                <option value="EUR">EUR</option>
                            </select>
                            <input 
                                type="number"
                                value={criteria.salaryMax || ''}
                                onChange={e => setCriteria({...criteria, salaryMax: parseInt(e.target.value)})}
                                className="flex-1 p-3 border border-gray-200 rounded-xl"
                                placeholder="e.g. 150000"
                            />
                       </div>
                   </div>

                   <div>
                       <div className="flex justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-700">Contract Types</label>
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
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${criteria.contractTypes?.includes(type) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
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

       <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
           {step > 1 ? (
               <button onClick={() => setStep(s => s - 1)} className="flex items-center text-gray-600 font-bold hover:text-gray-900">
                   <ArrowLeft className="w-4 h-4 mr-2"/> Back
               </button>
           ) : <div/>}

           {step < 4 ? (
               <button onClick={() => setStep(s => s + 1)} className="flex items-center bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black">
                   Next Step <ArrowRight className="w-4 h-4 ml-2"/>
               </button>
           ) : (
               <button onClick={() => onSearch(criteria)} className="flex items-center bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg">
                   <Search className="w-4 h-4 mr-2"/> Run Match
               </button>
           )}
       </div>
    </div>
  );
};

export default TalentSearchForm;
