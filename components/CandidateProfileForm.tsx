

import React, { useState, useRef } from 'react';
import { CandidateProfile, ThemeColor, ThemeFont, JobType, Experience, SeniorityLevel } from '../types';
import CandidateDetails from './CandidateDetails';
import { Sparkles, Plus, X, Check, Award, Heart, Lock, Unlock, Image as ImageIcon, Briefcase, GripVertical, MapPin, DollarSign, Clock, UserCheck, Trash2, Edit2 } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import { 
  CULTURAL_VALUES, 
  INDUSTRIES, 
  PERKS_CATEGORIES, 
  CHARACTER_TRAITS_CATEGORIES,
  SKILLS_LIST
} from '../constants/matchingData';

interface Props {
  profile: CandidateProfile;
  onSave: (p: CandidateProfile) => void;
}

const THEME_COLORS: { id: ThemeColor, hex: string, name: string }[] = [
    { id: 'blue', hex: '#3b82f6', name: 'Ocean' },
    { id: 'purple', hex: '#8b5cf6', name: 'Royal' },
    { id: 'green', hex: '#10b981', name: 'Emerald' },
    { id: 'orange', hex: '#f97316', name: 'Sunset' },
    { id: 'pink', hex: '#ec4899', name: 'Berry' },
    { id: 'slate', hex: '#475569', name: 'Classic' },
];

const SectionCard = ({ 
    title, 
    icon, 
    children, 
    className = "", 
    themeColor 
}: { 
    title: string, 
    icon: React.ReactNode, 
    children?: React.ReactNode, 
    className?: string,
    themeColor: ThemeColor 
}) => (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group transition-all hover:shadow-md ${className}`}>
        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-20 cursor-move text-gray-400">
            <GripVertical className="w-5 h-5" />
        </div>
        <h3 className={`text-xl font-bold mb-6 flex items-center`} style={{ color: THEME_COLORS.find(c => c.id === themeColor)?.hex }}>
            <span className={`mr-3 p-2 rounded-xl bg-opacity-10`} style={{ backgroundColor: THEME_COLORS.find(c => c.id === themeColor)?.hex + '20' }}>{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);

const CandidateProfileForm: React.FC<Props> = ({ profile, onSave }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [formData, setFormData] = useState<CandidateProfile>(profile);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  
  // Experience Modal State
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expModalTab, setExpModalTab] = useState<'manual' | 'ai'>('manual');
  const [editingExp, setEditingExp] = useState<Partial<Experience>>({});
  const [newAchievement, setNewAchievement] = useState("");

  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
      onSave(formData);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
           const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
           setFormData(p => ({...p, avatarUrls: [...p.avatarUrls, ...newUrls]}));
      }
  };

  const toggleNonNegotiable = (field: string) => {
      setFormData(prev => ({
          ...prev,
          nonNegotiables: prev.nonNegotiables.includes(field)
            ? prev.nonNegotiables.filter(f => f !== field)
            : [...prev.nonNegotiables, field]
      }));
  };

  const isNonNegotiable = (field: string) => formData.nonNegotiables.includes(field);

  const updateSkillYears = (name: string, delta: number) => {
      setFormData(prev => ({
          ...prev,
          skills: prev.skills.map(s => s.name === name ? { ...s, years: Math.max(0, s.years + delta) } : s)
      }));
  };

  // --- EXPERIENCE LOGIC ---

  const openExpModal = (exp?: Experience) => {
      if (exp) {
          setEditingExp({ ...exp });
      } else {
          setEditingExp({
              id: Date.now().toString(),
              achievements: [],
              skillsAcquired: [],
              isCurrentRole: false,
              type: 'Full-time'
          });
      }
      setExpModalTab('manual');
      setIsExpModalOpen(true);
  };

  const saveExperience = () => {
      if (!editingExp.role || !editingExp.company || !editingExp.startDate) return;
      
      // Calculate duration string
      const start = new Date(editingExp.startDate);
      const end = editingExp.isCurrentRole || !editingExp.endDate ? new Date() : new Date(editingExp.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      const durationStr = `${years > 0 ? `${years} yrs ` : ''}${months} mos`;
      
      const displayDate = `${editingExp.startDate} - ${editingExp.isCurrentRole ? 'Present' : editingExp.endDate}`;

      const finalExp: Experience = {
          id: editingExp.id!,
          role: editingExp.role!,
          company: editingExp.company!,
          startDate: editingExp.startDate!,
          endDate: editingExp.endDate || null,
          isCurrentRole: editingExp.isCurrentRole || false,
          type: editingExp.type || 'Full-time',
          description: editingExp.description || '',
          achievements: editingExp.achievements || [],
          skillsAcquired: editingExp.skillsAcquired || [],
          duration: `${displayDate} • ${durationStr}`
      };

      setFormData(prev => {
          const exists = prev.experience.find(e => e.id === finalExp.id);
          if (exists) {
              return { ...prev, experience: prev.experience.map(e => e.id === finalExp.id ? finalExp : e) };
          }
          return { ...prev, experience: [...prev.experience, finalExp] };
      });

      setIsExpModalOpen(false);
  };

  const NegotiableToggle = ({ field }: { field: string }) => (
      <button 
        onClick={() => toggleNonNegotiable(field)}
        className={`ml-2 p-1.5 rounded-full transition-all flex items-center text-xs font-bold ${isNonNegotiable(field) ? 'bg-red-50 text-red-500 ring-1 ring-red-200' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
        title={isNonNegotiable(field) ? "Marked as Non-negotiable" : "Marked as Flexible"}
      >
          {isNonNegotiable(field) ? <><Lock className="w-3 h-3 mr-1" /> Non-negotiable</> : <><Unlock className="w-3 h-3 mr-1" /> Flexible</>}
      </button>
  );

  if (!isEditing) {
      return (
          <CandidateDetails 
            candidate={formData} 
            onBack={() => {}} 
            onUnlock={() => {}} 
            onMessage={() => {}} 
            onSchedule={() => {}}
            isOwner={true}
            onEdit={() => setIsEditing(true)}
          />
      );
  }

  return (
    <div className={`max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 font-${formData.themeFont}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-6 gap-4">
        <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Edit Profile</h1>
            <p className="text-gray-500 mt-2">Design your career story. Make it truly yours.</p>
        </div>
        <button
            onClick={handleSave}
            className={`text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-lg flex items-center`}
            style={{ backgroundColor: THEME_COLORS.find(c => c.id === formData.themeColor)?.hex }}
        >
            <Check className="w-4 h-4 mr-2" /> Save & Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Identity Card */}
            <SectionCard title="Identity & Bio" icon={<Sparkles className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Avatar */}
                    <div className="relative group w-32 h-32 flex-shrink-0 mx-auto md:mx-0">
                        <div 
                            className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer bg-gray-100"
                            onClick={() => setActivePhotoIndex((activePhotoIndex + 1) % (formData.avatarUrls.length || 1))}
                        >
                            {formData.avatarUrls.length > 0 ? (
                                <img src={formData.avatarUrls[activePhotoIndex % formData.avatarUrls.length]} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon className="w-8 h-8"/></div>
                            )}
                        </div>
                        <button 
                            onClick={() => photoInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md text-gray-600 hover:text-gray-900 border border-gray-200"
                        >
                            <Plus className="w-4 h-4"/>
                        </button>
                        <input type="file" ref={photoInputRef} className="hidden" multiple accept="image/*" onChange={handlePhotoUpload}/>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full font-bold text-xl border-b border-gray-200 focus:border-gray-900 outline-none pb-2 bg-transparent"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Headline</label>
                                <input value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} className="w-full text-lg border-b border-gray-200 focus:border-gray-900 outline-none pb-2 bg-transparent"/>
                            </div>
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-400 uppercase">Short Bio</label>
                             <textarea 
                                value={formData.bio} 
                                onChange={e => setFormData({...formData, bio: e.target.value})} 
                                className="w-full p-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none resize-none h-24"
                                placeholder="Tell your story in 140 characters..."
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div>
                         <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Current Status</label>
                         <select 
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value as any})}
                            className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none font-medium text-gray-700 cursor-pointer"
                        >
                             <option value="actively_looking">Actively Looking</option>
                             <option value="open_to_offers">Open to Offers</option>
                             <option value="happy_but_listening">Happy, but listening</option>
                             <option value="not_looking">Not Looking</option>
                         </select>
                    </div>
                     <div>
                         <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Location</label>
                            <NegotiableToggle field="location" />
                         </div>
                         <div className="flex items-center bg-gray-50 rounded-xl px-3">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2"/>
                            <input 
                                value={formData.location} 
                                onChange={e => setFormData({...formData, location: e.target.value})}
                                className="w-full py-3 bg-transparent border-none outline-none font-medium text-gray-700"
                            />
                         </div>
                    </div>
                </div>
            </SectionCard>

            {/* Cultural Values Section */}
            <SectionCard title="Your Values" icon={<Heart className="w-5 h-5"/>} themeColor={formData.themeColor}>
              <GroupedMultiSelect
                label="Cultural Values"
                options={CULTURAL_VALUES}
                selected={formData.values}
                onChange={(values) => setFormData(prev => ({ ...prev, values }))}
                placeholder="What matters to you in a workplace?"
                helpText="Select the top values that are most important to you (5-10 recommended)"
                maxSelections={10}
                searchable={true}
              />
            </SectionCard>

            {/* Work Experience */}
            <SectionCard title="Work Experience" icon={<Briefcase className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <div className="space-y-4">
                    {formData.experience.map((exp) => (
                         <div key={exp.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 group hover:border-blue-200 transition-colors">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h4 className="font-bold text-gray-900">{exp.role}</h4>
                                     <div className="text-sm text-gray-600 font-medium">{exp.company}</div>
                                     <div className="text-xs text-gray-400 mt-1">{exp.duration}</div>
                                 </div>
                                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openExpModal(exp)} className="p-2 bg-white rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setFormData(p => ({...p, experience: p.experience.filter(e => e.id !== exp.id)}))} className="p-2 bg-white rounded-lg border border-gray-200 text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                             </div>
                         </div>
                    ))}
                     <button 
                        onClick={() => openExpModal()}
                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add Position
                    </button>
                </div>
            </SectionCard>
            
            {/* Skills */}
             <SectionCard title="Skills" icon={<Award className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <GroupedMultiSelect
                    label="Add Skills"
                    options={SKILLS_LIST}
                    selected={formData.skills.map(s => s.name)}
                    onChange={(selectedNames) => {
                        setFormData(prev => {
                            // Keep existing with their years, add new with 1 year default
                            const currentMap = new Map(prev.skills.map(s => [s.name, s]));
                            const newSkills = selectedNames.map(name => currentMap.get(name) || { name, years: 1 });
                            return { ...prev, skills: newSkills };
                        });
                    }}
                    placeholder="Search technical skills..."
                    searchable={true}
                    grouped={true}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {formData.skills.map((skill, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="font-medium text-sm text-gray-700">{skill.name}</span>
                            <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
                                <button onClick={() => updateSkillYears(skill.name, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-500">-</button>
                                <span className="text-xs font-bold w-8 text-center">{skill.years}y</span>
                                <button onClick={() => updateSkillYears(skill.name, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500">+</button>
                            </div>
                        </div>
                    ))}
                </div>
             </SectionCard>

            {/* Industry Interests Section */}
            <SectionCard title="Industry Interests" icon={<Briefcase className="w-5 h-5"/>} themeColor={formData.themeColor}>
              <GroupedMultiSelect
                label="Industries You're Interested In"
                options={INDUSTRIES}
                selected={formData.interestedIndustries || []}
                onChange={(industries) => setFormData(prev => ({ ...prev, interestedIndustries: industries }))}
                placeholder="Which industries excite you?"
                helpText="Select 2-5 industries where you'd like to work"
                maxSelections={5}
                searchable={true}
              />
            </SectionCard>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
             <SectionCard title="Character" icon={<UserCheck className="w-5 h-5"/>} themeColor={formData.themeColor}>
              <GroupedMultiSelect
                label="Character Traits"
                options={CHARACTER_TRAITS_CATEGORIES}
                selected={formData.characterTraits}
                onChange={(traits) => setFormData(prev => ({ ...prev, characterTraits: traits }))}
                placeholder="What are your strongest traits?"
                helpText="Select 5-8 traits that best describe your work style"
                maxSelections={10}
                grouped={true}
                searchable={true}
              />
            </SectionCard>
             
             <SectionCard title="The Nitty Gritty" icon={<Lock className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <div className="space-y-6">
                     <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                            Desired Seniority Level
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(SeniorityLevel).map(level => (
                            <button
                                key={level}
                                onClick={() => setFormData(p => ({
                                ...p,
                                desiredSeniority: p.desiredSeniority?.includes(level)
                                    ? p.desiredSeniority.filter(s => s !== level)
                                    : [...(p.desiredSeniority || []), level]
                                }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                formData.desiredSeniority?.includes(level)
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200'
                                }`}
                            >
                                {level}
                            </button>
                            ))}
                        </div>
                     </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Min. Compensation</label>
                            <NegotiableToggle field="salary" />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={formData.salaryCurrency || 'USD'}
                                onChange={e => setFormData({...formData, salaryCurrency: e.target.value})}
                                className="w-20 p-3 bg-gray-50 rounded-xl border-none outline-none font-bold text-sm"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                            <div className="relative flex items-center bg-gray-50 rounded-xl px-3 flex-1">
                                <DollarSign className="w-4 h-4 text-gray-400 mr-2"/>
                                <input
                                    type="number"
                                    value={formData.salaryMin || ''}
                                    onChange={e => setFormData({...formData, salaryMin: parseInt(e.target.value) || 0})}
                                    className="w-full py-3 bg-transparent border-none outline-none font-bold text-gray-900"
                                    placeholder="80000"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Notice Period</label>
                            <NegotiableToggle field="notice_period" />
                        </div>
                        <div className="relative flex items-center bg-gray-50 rounded-xl px-3">
                            <Clock className="w-4 h-4 text-gray-400 mr-2"/>
                            <select
                                value={formData.noticePeriod}
                                onChange={e => setFormData({...formData, noticePeriod: e.target.value})}
                                className="w-full py-3 bg-transparent border-none outline-none font-medium text-gray-700 cursor-pointer"
                            >
                                <option value="Immediate">Immediate</option>
                                <option value="2 Weeks">2 Weeks</option>
                                <option value="1 Month">1 Month</option>
                                <option value="2 Months">2 Months</option>
                                <option value="3 Months">3 Months</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                         <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Contract Types</label>
                         <div className="flex flex-wrap gap-2">
                             {Object.values(JobType).map(type => (
                                 <button
                                    key={type}
                                    onClick={() => setFormData(p => ({
                                        ...p, 
                                        contractTypes: p.contractTypes.includes(type) 
                                            ? p.contractTypes.filter(t => t !== type) 
                                            : [...p.contractTypes, type]
                                    }))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                        formData.contractTypes.includes(type)
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200'
                                    }`}
                                >
                                    {type}
                                </button>
                             ))}
                         </div>
                    </div>
                </div>
             </SectionCard>

            <SectionCard title="Desired Perks" icon={<Award className="w-5 h-5"/>} themeColor={formData.themeColor}>
              <GroupedMultiSelect
                label="Perks & Incentives"
                options={PERKS_CATEGORIES}
                selected={formData.desiredPerks}
                onChange={(perks) => setFormData(prev => ({ ...prev, desiredPerks: perks }))}
                placeholder="What benefits matter most?"
                grouped={true}
                searchable={true}
              />
            </SectionCard>
        </div>
      </div>

      {/* Experience Modal */}
      {isExpModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">
                          {editingExp.id ? 'Edit Experience' : 'Add Experience'}
                      </h3>
                      <button onClick={() => setIsExpModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex border-b border-gray-100">
                      <button
                        className={`flex-1 py-3 text-sm font-medium ${expModalTab === 'manual' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setExpModalTab('manual')}
                      >
                          Manual Entry
                      </button>
                      <button
                        className={`flex-1 py-3 text-sm font-medium ${expModalTab === 'ai' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setExpModalTab('ai')}
                      >
                          AI Import (Coming Soon)
                      </button>
                  </div>
                  
                  {expModalTab === 'manual' ? (
                      <div className="p-6 space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Role Title</label>
                                  <input 
                                      className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                                      value={editingExp.role || ''}
                                      onChange={e => setEditingExp({...editingExp, role: e.target.value})}
                                      placeholder="e.g. Senior Developer"
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Company</label>
                                  <input 
                                      className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                                      value={editingExp.company || ''}
                                      onChange={e => setEditingExp({...editingExp, company: e.target.value})}
                                      placeholder="e.g. Tech Corp"
                                  />
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                                  <input 
                                    type="month" 
                                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                                    value={editingExp.startDate || ''}
                                    onChange={e => setEditingExp({...editingExp, startDate: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                                  <input 
                                    type="month" 
                                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 disabled:opacity-50"
                                    value={editingExp.endDate || ''}
                                    onChange={e => setEditingExp({...editingExp, endDate: e.target.value})}
                                    disabled={editingExp.isCurrentRole}
                                  />
                                  <label className="flex items-center mt-2 text-sm text-gray-600 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        className="mr-2"
                                        checked={editingExp.isCurrentRole || false}
                                        onChange={e => setEditingExp({...editingExp, isCurrentRole: e.target.checked, endDate: null})}
                                      />
                                      I currently work here
                                  </label>
                              </div>
                          </div>
                          
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Job Type</label>
                               <select 
                                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                                  value={editingExp.type || 'Full-time'}
                                  onChange={e => setEditingExp({...editingExp, type: e.target.value})}
                              >
                                  {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                              <textarea 
                                  className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 h-24"
                                  value={editingExp.description || ''}
                                  onChange={e => setEditingExp({...editingExp, description: e.target.value})}
                                  placeholder="Briefly describe your responsibilities..."
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Key Achievements</label>
                              <div className="space-y-2 mb-2">
                                  {editingExp.achievements?.map((ach, i) => (
                                      <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                          <span className="text-gray-500">•</span>
                                          <span className="flex-1 text-sm">{ach}</span>
                                          <button 
                                            onClick={() => setEditingExp({...editingExp, achievements: editingExp.achievements?.filter((_, idx) => idx !== i)})}
                                            className="text-gray-400 hover:text-red-500"
                                          >
                                              <X className="w-4 h-4"/>
                                          </button>
                                      </div>
                                  ))}
                              </div>
                              <div className="flex gap-2">
                                  <input 
                                      className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm"
                                      placeholder="e.g. Increased conversion by 20%"
                                      value={newAchievement}
                                      onChange={e => setNewAchievement(e.target.value)}
                                      onKeyDown={e => {
                                          if(e.key === 'Enter') {
                                              e.preventDefault();
                                              if (newAchievement) {
                                                  setEditingExp({...editingExp, achievements: [...(editingExp.achievements || []), newAchievement]});
                                                  setNewAchievement("");
                                              }
                                          }
                                      }}
                                  />
                                  <button 
                                    onClick={() => {
                                        if (newAchievement) {
                                            setEditingExp({...editingExp, achievements: [...(editingExp.achievements || []), newAchievement]});
                                            setNewAchievement("");
                                        }
                                    }}
                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold"
                                  >
                                      Add
                                  </button>
                              </div>
                          </div>
                          
                          {/* Skills Used in Role */}
                          <div className="border-t border-gray-100 pt-4">
                              <GroupedMultiSelect
                                label="Skills Used in this Role"
                                options={SKILLS_LIST}
                                selected={editingExp.skillsAcquired || []}
                                onChange={(skills) => setEditingExp({ ...editingExp, skillsAcquired: skills })}
                                placeholder="Select relevant technologies..."
                                grouped={true}
                                searchable={true}
                              />
                          </div>
                      </div>
                  ) : (
                      <div className="p-12 text-center text-gray-500">
                          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                          <h3 className="text-lg font-bold text-gray-900 mb-2">AI Extraction</h3>
                          <p>Paste your resume or job description here to automatically populate details.</p>
                          <div className="mt-4 px-3 py-1 bg-gray-100 rounded-full inline-block text-xs font-bold uppercase tracking-wider">Coming Soon</div>
                      </div>
                  )}

                  <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                      <button onClick={() => setIsExpModalOpen(false)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                      <button onClick={saveExperience} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Save Position</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CandidateProfileForm;
