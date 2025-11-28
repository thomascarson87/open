
import React, { useState, useRef } from 'react';
import { CandidateProfile, ThemeColor, ThemeFont, JobType, WorkMode, Experience, Reference } from '../types';
import { parseResume } from '../services/geminiService';
import CandidateDetails from './CandidateDetails';
import { Upload, Sparkles, Plus, X, Check, Award, Heart, Lock, Unlock, Image as ImageIcon, Globe, Briefcase, GripVertical, Palette, Type, MapPin, DollarSign, Clock, Monitor, Minus, Quote, Mail, Edit2, Trophy, Zap } from 'lucide-react';

interface Props {
  profile: CandidateProfile;
  onSave: (p: CandidateProfile) => void;
}

const COMMON_SKILLS = ["React", "TypeScript", "Node.js", "Python", "AWS", "Kubernetes", "Docker", "GraphQL", "Go", "Rust"];
const AVAILABLE_PERKS = ["Health Insurance", "Remote Work", "Gym Pass", "Equity", "Flexible Hours", "Learning Budget", "Free Lunch", "Pet Friendly"];
const TRAITS = ["Ambitious", "Collaborative", "Detail-oriented", "Creative", "Reliable", "Leader", "Mentor", "Independent"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({length: 50}, (_, i) => (new Date().getFullYear() - i).toString());

const THEME_COLORS: { id: ThemeColor, hex: string, name: string }[] = [
    { id: 'blue', hex: '#3b82f6', name: 'Ocean' },
    { id: 'purple', hex: '#8b5cf6', name: 'Royal' },
    { id: 'green', hex: '#10b981', name: 'Emerald' },
    { id: 'orange', hex: '#f97316', name: 'Sunset' },
    { id: 'pink', hex: '#ec4899', name: 'Berry' },
    { id: 'slate', hex: '#475569', name: 'Classic' },
];

const THEME_FONTS: { id: ThemeFont, name: string, class: string }[] = [
    { id: 'sans', name: 'Modern Sans', class: 'font-sans' },
    { id: 'serif', name: 'Elegant Serif', class: 'font-serif' },
    { id: 'mono', name: 'Tech Mono', class: 'font-mono' },
];

const REFERENCE_RELATIONSHIPS = ['Manager', 'Peer', 'Direct Report', 'Client', 'Mentor'];
const REFERENCE_ASSESSMENTS = ['Top 1% Talent', 'Exceptional', 'Highly Recommended', 'Strong Performer'];

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
  const [isParsing, setIsParsing] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  
  // Reference State
  const [isAddingReference, setIsAddingReference] = useState<'manual' | 'request' | null>(null);
  const [newReference, setNewReference] = useState<Partial<Reference>>({
      relationship: 'Manager',
      assessment: 'Exceptional'
  });
  const [requestEmail, setRequestEmail] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
      onSave(formData);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      // Mock parsing logic as AI is disabled
      const file = e.target.files?.[0];
      if (!file) return;
      setIsParsing(true);
      setTimeout(async () => {
          const extracted = await parseResume("Mock Resume Content");
          setFormData(prev => ({
              ...prev,
              ...extracted,
              skills: extracted.skills || prev.skills,
              experience: extracted.experience || prev.experience
          }));
          setIsParsing(false);
      }, 1000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
           // In a real app with Storage, we would upload here. 
           // For now using object URL for preview only or user would need to implement storage bucket.
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

  const addSkill = (name: string) => {
    if (formData.skills.find(s => s.name === name)) return;
    setFormData(prev => ({ ...prev, skills: [...prev.skills, { name, years: 1 }] }));
  };

  const updateSkillYears = (index: number, delta: number) => {
      setFormData(prev => {
          const newSkills = [...prev.skills];
          const skill = newSkills[index];
          const newYears = Math.max(0, skill.years + delta);
          skill.years = newYears === 0 ? 0 : newYears;
          return { ...prev, skills: newSkills };
      });
  };

  const togglePerk = (perk: string) => {
      setFormData(prev => {
          const perks = prev.desiredPerks.includes(perk) 
            ? prev.desiredPerks.filter(p => p !== perk)
            : [...prev.desiredPerks, perk];
          return { ...prev, desiredPerks: perks };
      });
  };

  const updateExperienceDate = (id: string, type: 'startMonth' | 'startYear' | 'endMonth' | 'endYear' | 'current', value: string | boolean) => {
      setFormData(prev => ({
          ...prev,
          experience: prev.experience.map(exp => {
              if (exp.id !== id) return exp;
              
              let [start, end] = exp.duration.split(' - ');
              if (!start) start = "";
              if (!end) end = "";

              let [startM, startY] = start.split(' ');
              let [endM, endY] = end === 'Present' ? ['Present', ''] : end.split(' ');

              if (type === 'startMonth') startM = value as string;
              if (type === 'startYear') startY = value as string;
              if (type === 'endMonth') endM = value as string;
              if (type === 'endYear') endY = value as string;
              if (type === 'current') {
                  if (value === true) {
                      endM = 'Present';
                      endY = '';
                  } else {
                      endM = MONTHS[0];
                      endY = YEARS[0];
                  }
              }

              const newStart = (startM && startY) ? `${startM} ${startY}` : start;
              const newEnd = (endM === 'Present') ? 'Present' : ((endM && endY) ? `${endM} ${endY}` : end);
              
              return { ...exp, duration: `${newStart} - ${newEnd}` };
          })
      }));
  };

  const updateExperienceDetail = (id: string, field: 'description' | 'achievements' | 'skillsAcquired', value: any) => {
      setFormData(prev => ({
          ...prev,
          experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
      }));
  };

  const saveReference = () => {
      if (!newReference.authorName || !newReference.content) return;
      const ref: Reference = {
          id: Date.now().toString(),
          authorName: newReference.authorName,
          authorRole: newReference.authorRole || 'Colleague',
          authorCompany: newReference.authorCompany || 'Previous Company',
          relationship: newReference.relationship as any || 'Peer',
          content: newReference.content,
          assessment: newReference.assessment as any || 'Highly Recommended',
          status: 'verified',
          date: new Date().toISOString()
      };
      setFormData(p => ({ ...p, references: [...(p.references || []), ref] }));
      setIsAddingReference(null);
      setNewReference({ relationship: 'Manager', assessment: 'Exceptional' });
  };

  const handleRequestReference = () => {
      if(!requestEmail) return;
      alert(`Request sent to ${requestEmail}`);
      setIsAddingReference(null);
      setRequestEmail("");
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
      
      {/* Header & Actions */}
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

      {/* Theme Picker */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-full"><Palette className="w-5 h-5 text-gray-900"/></div>
              <div>
                  <h3 className="font-bold text-gray-900">Theme Color</h3>
                  <div className="flex gap-2 mt-2">
                      {THEME_COLORS.map(c => (
                          <button 
                            key={c.id} 
                            onClick={() => setFormData({...formData, themeColor: c.id})}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${formData.themeColor === c.id ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: c.hex }}
                          />
                      ))}
                  </div>
              </div>
          </div>
          <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
          <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-full"><Type className="w-5 h-5 text-gray-900"/></div>
              <div>
                  <h3 className="font-bold text-gray-900">Typography</h3>
                  <div className="flex gap-2 mt-2">
                      {THEME_FONTS.map(f => (
                          <button 
                            key={f.id} 
                            onClick={() => setFormData({...formData, themeFont: f.id})}
                            className={`px-3 py-1 rounded-lg border text-sm transition-all ${f.class} ${formData.themeFont === f.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
                          >
                              {f.name}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Identity Card */}
            <SectionCard title="Identity & Bio" icon={<Sparkles className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Avatar Carousel */}
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
                        {formData.avatarUrls.length > 1 && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
                                {formData.avatarUrls.map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === activePhotoIndex ? 'bg-gray-800' : 'bg-gray-300'}`}/>
                                ))}
                            </div>
                        )}
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
                        
                        <div className="flex flex-wrap gap-2">
                             {formData.characterTraits.map((t, i) => (
                                 <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 flex items-center">
                                     {t} <button onClick={() => setFormData(p => ({...p, characterTraits: p.characterTraits.filter(x => x !== t)}))} className="ml-2 hover:text-red-500"><X className="w-3 h-3"/></button>
                                 </span>
                             ))}
                             <select 
                                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium outline-none cursor-pointer hover:bg-gray-50"
                                onChange={(e) => {
                                    if(e.target.value && !formData.characterTraits.includes(e.target.value)) {
                                        setFormData(p => ({...p, characterTraits: [...p.characterTraits, e.target.value]}));
                                        e.target.value = "";
                                    }
                                }}
                             >
                                 <option value="">+ Add Trait</option>
                                 {TRAITS.map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
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

            {/* Work Experience */}
            <SectionCard title="Work Experience" icon={<Briefcase className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <div className="flex justify-end mb-4">
                     <button onClick={() => fileInputRef.current?.click()} disabled={isParsing} className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center">
                        {isParsing ? "Parsing..." : <><Upload className="w-4 h-4 mr-2"/> Import from CV</>}
                     </button>
                     <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc" onChange={handleFileUpload} />
                </div>
                <div className="space-y-4">
                    {formData.experience.map((exp) => {
                        const [startStr, endStr] = exp.duration.split(' - ');
                        let [startMonth, startYear] = startStr ? startStr.split(' ') : ['', ''];
                        if (!startMonth) startMonth = '';
                        if (!startYear) startYear = '';

                        let endMonth = '', endYear = '';
                        if (endStr === 'Present') {
                            endMonth = 'Present';
                        } else if (endStr) {
                            [endMonth, endYear] = endStr.split(' ');
                        }
                        const isCurrent = endMonth === 'Present';
                        const hasDetails = exp.description || (exp.achievements && exp.achievements.length > 0) || (exp.skillsAcquired && exp.skillsAcquired.length > 0);

                        return (
                            <div key={exp.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 relative group">
                                 <button 
                                    onClick={() => setEditingExperienceId(exp.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 p-2 hover:bg-white rounded-lg transition-all"
                                    title="Edit Details"
                                 >
                                    <Edit2 className="w-4 h-4" />
                                 </button>

                                 <div className="flex flex-col md:flex-row gap-4 pr-12">
                                     <input 
                                        value={exp.role} 
                                        onChange={e => setFormData(p => ({...p, experience: p.experience.map(x => x.id === exp.id ? {...x, role: e.target.value} : x)}))}
                                        className="font-bold bg-transparent border-b border-transparent focus:border-gray-300 w-full outline-none" 
                                        placeholder="Role"
                                    />
                                     <input 
                                        value={exp.company} 
                                        onChange={e => setFormData(p => ({...p, experience: p.experience.map(x => x.id === exp.id ? {...x, company: e.target.value} : x)}))}
                                        className="text-gray-600 bg-transparent w-full outline-none border-b border-transparent focus:border-gray-300" 
                                        placeholder="Company"
                                    />
                                 </div>
                                 
                                 <div className="flex flex-wrap items-center gap-2 text-sm">
                                     <select value={startMonth} onChange={e => updateExperienceDate(exp.id, 'startMonth', e.target.value)} className="bg-white border border-gray-200 rounded p-1.5 outline-none cursor-pointer">
                                         <option value="" disabled>Month</option>
                                         {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                     </select>
                                     <select value={startYear} onChange={e => updateExperienceDate(exp.id, 'startYear', e.target.value)} className="bg-white border border-gray-200 rounded p-1.5 outline-none cursor-pointer">
                                         <option value="" disabled>Year</option>
                                         {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                     </select>
                                     <span className="text-gray-400 px-2">to</span>
                                     
                                     {!isCurrent ? (
                                         <>
                                            <select value={endMonth} onChange={e => updateExperienceDate(exp.id, 'endMonth', e.target.value)} className="bg-white border border-gray-200 rounded p-1.5 outline-none cursor-pointer">
                                                <option value="" disabled>Month</option>
                                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                            <select value={endYear} onChange={e => updateExperienceDate(exp.id, 'endYear', e.target.value)} className="bg-white border border-gray-200 rounded p-1.5 outline-none cursor-pointer">
                                                <option value="" disabled>Year</option>
                                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                         </>
                                     ) : (
                                         <span className="font-bold text-green-600 px-2 bg-green-50 rounded border border-green-100">Present</span>
                                     )}

                                     <label className="flex items-center ml-4 cursor-pointer select-none">
                                         <input 
                                            type="checkbox" 
                                            checked={isCurrent} 
                                            onChange={e => updateExperienceDate(exp.id, 'current', e.target.checked)} 
                                            className="mr-2 w-4 h-4 accent-black rounded"
                                        />
                                         <span className="text-gray-500 font-medium">Currently working here</span>
                                     </label>
                                 </div>
                                 
                                 <div 
                                    className={`mt-2 text-xs flex items-center cursor-pointer ${hasDetails ? 'text-blue-600 font-medium' : 'text-gray-400 hover:text-gray-600'}`}
                                    onClick={() => setEditingExperienceId(exp.id)}
                                 >
                                    {hasDetails ? <Check className="w-3 h-3 mr-1"/> : <Plus className="w-3 h-3 mr-1"/>}
                                    {hasDetails ? 'Edit details, achievements & skills' : 'Add details, achievements & skills'}
                                 </div>
                            </div>
                        );
                    })}
                    <button 
                        onClick={() => setFormData(p => ({...p, experience: [...p.experience, { id: Date.now().toString(), role: '', company: '', duration: '', type: 'Full-time' }]}))}
                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                        + Add Position
                    </button>
                </div>
            </SectionCard>

            {/* References */}
            <SectionCard title="Professional References" icon={<Quote className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <div className="space-y-4">
                    {(formData.references || []).map(ref => (
                        <div key={ref.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                <button onClick={() => setFormData(p => ({...p, references: p.references?.filter(r => r.id !== ref.id)}))} className="p-1.5 bg-white text-gray-400 hover:text-red-500 rounded-lg shadow-sm border border-gray-200">
                                    <X className="w-4 h-4" />
                                </button>
                             </div>
                             <p className="italic text-gray-600 mb-3 text-sm">"{ref.content}"</p>
                             <div className="flex items-center justify-between text-xs">
                                 <div>
                                     <span className="font-bold text-gray-900 block">{ref.authorName}</span>
                                     <span className="text-gray-500">{ref.authorRole} • {ref.authorCompany}</span>
                                 </div>
                                 <span className="bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 font-medium">{ref.assessment}</span>
                             </div>
                        </div>
                    ))}
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsAddingReference('request')}
                            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                            <Mail className="w-4 h-4 mr-2" /> Request Reference
                        </button>
                        <button 
                            onClick={() => setIsAddingReference('manual')}
                            className="flex-1 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Manually
                        </button>
                    </div>
                </div>
            </SectionCard>

            {/* Values & Ambitions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <SectionCard title="Core Values" icon={<Heart className="w-5 h-5"/>} themeColor={formData.themeColor}>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.values.map((val, i) => (
                            <span key={i} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium flex items-center">
                                {val} <button onClick={() => setFormData(p => ({...p, values: p.values.filter(v => v !== val)}))} className="ml-2 hover:text-pink-900"><X className="w-3 h-3"/></button>
                            </span>
                        ))}
                    </div>
                    <input 
                        placeholder="Add a value..."
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                const val = e.currentTarget.value;
                                if(val && !formData.values.includes(val)) {
                                    setFormData(p => ({...p, values: [...p.values, val]}));
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                        className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none"
                    />
                 </SectionCard>

                 <SectionCard title="Ambitions" icon={<Award className="w-5 h-5"/>} themeColor={formData.themeColor}>
                    <textarea 
                        value={formData.ambitions}
                        onChange={e => setFormData({...formData, ambitions: e.target.value})}
                        className="w-full h-32 p-3 bg-gray-50 rounded-xl text-sm outline-none resize-none"
                        placeholder="Where do you want to be in 5 years?"
                    />
                 </SectionCard>
            </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
             
             {/* The Nitty Gritty (Logistics) */}
             <SectionCard title="The Nitty Gritty" icon={<Lock className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <div className="space-y-6">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Min. Compensation</label>
                            <NegotiableToggle field="salary" />
                        </div>
                        <div className="relative flex items-center bg-gray-50 rounded-xl px-3">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-2"/>
                            <input
                                type="number"
                                value={formData.salaryExpectation}
                                onChange={e => setFormData({...formData, salaryExpectation: e.target.value})}
                                className="w-full py-3 bg-transparent border-none outline-none font-bold text-gray-900"
                            />
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
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Work Mode</label>
                            <NegotiableToggle field="work_mode" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                             {[WorkMode.REMOTE, WorkMode.HYBRID, WorkMode.OFFICE].map(mode => (
                                 <button
                                    key={mode}
                                    onClick={() => setFormData(p => ({
                                        ...p, 
                                        preferredWorkMode: p.preferredWorkMode.includes(mode) 
                                            ? p.preferredWorkMode.filter(m => m !== mode) 
                                            : [...p.preferredWorkMode, mode]
                                    }))}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center ${
                                        formData.preferredWorkMode.includes(mode)
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-600 border-gray-200'
                                    }`}
                                >
                                    {mode === WorkMode.REMOTE && <Monitor className="w-3 h-3 mr-1"/>}
                                    {mode === WorkMode.HYBRID && <Globe className="w-3 h-3 mr-1"/>}
                                    {mode === WorkMode.OFFICE && <Briefcase className="w-3 h-3 mr-1"/>}
                                    {mode}
                                </button>
                             ))}
                        </div>
                    </div>
                    
                    <div>
                         <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Contract Types</label>
                         <div className="flex flex-wrap gap-2">
                             {[JobType.FULL_TIME, JobType.CONTRACT, JobType.FREELANCE].map(type => (
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

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Legal Status</label>
                        <input 
                            value={formData.legalStatus}
                            onChange={e => setFormData({...formData, legalStatus: e.target.value})}
                            className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none"
                            placeholder="e.g. US Citizen, H1B Visa..."
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Current Bonuses / Variable</label>
                        <textarea 
                            value={formData.currentBonuses}
                            onChange={e => setFormData({...formData, currentBonuses: e.target.value})}
                            className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-20 resize-none"
                            placeholder="e.g. 15% annual bonus, stock options..."
                        />
                    </div>
                </div>
             </SectionCard>

             {/* Portfolio */}
             <SectionCard title="Portfolio" icon={<Globe className="w-5 h-5"/>} themeColor={formData.themeColor}>
                 <div className="space-y-3">
                     {formData.portfolio.map((item, idx) => (
                         <div key={item.id} className="flex items-center gap-2">
                             <div className="p-2 bg-gray-50 rounded-lg"><Globe className="w-4 h-4 text-gray-400"/></div>
                             <input value={item.platform} className="w-1/3 text-sm font-bold bg-transparent border-b border-transparent focus:border-gray-200" placeholder="Platform"/>
                             <input value={item.url} className="flex-1 text-sm text-blue-600 bg-transparent border-b border-transparent focus:border-gray-200" placeholder="URL"/>
                             <button onClick={() => setFormData(p => ({...p, portfolio: p.portfolio.filter(x => x.id !== item.id)}))}><X className="w-4 h-4 text-gray-300 hover:text-red-500"/></button>
                         </div>
                     ))}
                     <button 
                        onClick={() => setFormData(p => ({...p, portfolio: [...p.portfolio, {id: Date.now().toString(), platform: '', url: ''}]}))}
                        className="text-sm font-bold text-gray-400 hover:text-gray-900 flex items-center mt-2"
                    >
                         <Plus className="w-4 h-4 mr-1"/> Add Link
                     </button>
                 </div>
             </SectionCard>

             {/* Skills */}
             <SectionCard title="Skills" icon={<Award className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.skills.map((skill, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                            <span className="text-sm font-medium">{skill.name}</span>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => updateSkillYears(idx, -1)} 
                                    className="p-1 rounded-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-500"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold w-6 text-center">{skill.years}y</span>
                                <button 
                                    onClick={() => updateSkillYears(idx, 1)}
                                    className="p-1 rounded-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-500"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                                <button onClick={() => setFormData(p => ({...p, skills: p.skills.filter((_, i) => i !== idx)}))} className="ml-1 text-gray-400 hover:text-red-500">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    {COMMON_SKILLS.filter(s => !formData.skills.find(sk => sk.name === s)).slice(0, 5).map(skill => (
                        <button key={skill} onClick={() => addSkill(skill)} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">+ {skill}</button>
                    ))}
                    <input 
                        className="text-xs px-2 py-1 border rounded outline-none" 
                        placeholder="Add custom..."
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                addSkill(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                </div>
             </SectionCard>

             {/* Perks */}
             <SectionCard title="Perks" icon={<Sparkles className="w-5 h-5"/>} themeColor={formData.themeColor}>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_PERKS.map(perk => (
                        <button
                            key={perk}
                            onClick={() => togglePerk(perk)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                formData.desiredPerks.includes(perk)
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            {perk}
                        </button>
                    ))}
                </div>
             </SectionCard>
        </div>
      </div>

      {/* Experience Details Modal */}
      {editingExperienceId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                  {/* Modal Header */}
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                      <div>
                          <h3 className="text-xl font-bold text-gray-900">Experience Details</h3>
                          <p className="text-sm text-gray-500">
                              {formData.experience.find(e => e.id === editingExperienceId)?.role} at {formData.experience.find(e => e.id === editingExperienceId)?.company}
                          </p>
                      </div>
                      <button onClick={() => setEditingExperienceId(null)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                          <X className="w-5 h-5 text-gray-600" />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 space-y-8">
                       <div>
                           <label className="flex items-center text-sm font-bold text-gray-900 mb-3">
                               <Briefcase className="w-4 h-4 mr-2 text-blue-500"/> Responsibilities & Impact
                           </label>
                           <textarea 
                                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none min-h-[120px]"
                                placeholder="Describe what you did, the scale of your work, and your core responsibilities..."
                                value={formData.experience.find(e => e.id === editingExperienceId)?.description || ''}
                                onChange={e => updateExperienceDetail(editingExperienceId, 'description', e.target.value)}
                           />
                       </div>

                       <div>
                           <label className="flex items-center text-sm font-bold text-gray-900 mb-3">
                               <Trophy className="w-4 h-4 mr-2 text-yellow-500"/> Key Achievements
                           </label>
                           <div className="space-y-2">
                               {(formData.experience.find(e => e.id === editingExperienceId)?.achievements || []).map((ach, idx) => (
                                   <div key={idx} className="flex gap-2">
                                       <span className="text-gray-400 mt-2">•</span>
                                       <input 
                                           className="flex-1 p-2 bg-white border-b border-gray-200 focus:border-gray-900 outline-none"
                                           value={ach}
                                           onChange={e => {
                                               const newAch = [...(formData.experience.find(exp => exp.id === editingExperienceId)?.achievements || [])];
                                               newAch[idx] = e.target.value;
                                               updateExperienceDetail(editingExperienceId, 'achievements', newAch);
                                           }}
                                       />
                                       <button 
                                            onClick={() => {
                                                const newAch = (formData.experience.find(exp => exp.id === editingExperienceId)?.achievements || []).filter((_, i) => i !== idx);
                                                updateExperienceDetail(editingExperienceId, 'achievements', newAch);
                                            }}
                                            className="text-gray-300 hover:text-red-500"
                                        >
                                           <X className="w-4 h-4"/>
                                        </button>
                                   </div>
                               ))}
                               <button 
                                    onClick={() => {
                                        const current = formData.experience.find(exp => exp.id === editingExperienceId)?.achievements || [];
                                        updateExperienceDetail(editingExperienceId, 'achievements', [...current, '']);
                                    }}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center mt-2"
                                >
                                   <Plus className="w-3 h-3 mr-1"/> Add Achievement
                               </button>
                           </div>
                       </div>

                       <div>
                           <label className="flex items-center text-sm font-bold text-gray-900 mb-3">
                               <Zap className="w-4 h-4 mr-2 text-purple-500"/> Skills Acquired / Used
                           </label>
                           <div className="flex flex-wrap gap-2 mb-2">
                               {(formData.experience.find(e => e.id === editingExperienceId)?.skillsAcquired || []).map((skill, idx) => (
                                   <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium flex items-center border border-purple-100">
                                       {skill}
                                       <button 
                                            onClick={() => {
                                                const newSkills = (formData.experience.find(exp => exp.id === editingExperienceId)?.skillsAcquired || []).filter((_, i) => i !== idx);
                                                updateExperienceDetail(editingExperienceId, 'skillsAcquired', newSkills);
                                            }}
                                            className="ml-2 hover:text-purple-900"
                                        >
                                           <X className="w-3 h-3"/>
                                       </button>
                                   </span>
                               ))}
                           </div>
                           <input 
                                className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none"
                                placeholder="Type a skill and press Enter..."
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value;
                                        if (val) {
                                            const current = formData.experience.find(exp => exp.id === editingExperienceId)?.skillsAcquired || [];
                                            if (!current.includes(val)) {
                                                updateExperienceDetail(editingExperienceId, 'skillsAcquired', [...current, val]);
                                            }
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                           />
                       </div>
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end">
                      <button 
                        onClick={() => setEditingExperienceId(null)}
                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black shadow-lg transition-transform hover:-translate-y-0.5"
                      >
                          Done
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Reference Modal */}
      {isAddingReference && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="text-xl font-bold text-gray-900">
                          {isAddingReference === 'manual' ? 'Add Reference Manually' : 'Request Reference'}
                      </h3>
                      <button onClick={() => setIsAddingReference(null)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
                          <X className="w-5 h-5 text-gray-600" />
                      </button>
                  </div>
                  
                  <div className="p-6">
                      {isAddingReference === 'request' ? (
                          <div className="space-y-4">
                              <p className="text-sm text-gray-600">Enter the email address of your former colleague or manager. We'll send them a secure link to fill out a structured assessment.</p>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                                  <input 
                                      value={requestEmail}
                                      onChange={e => setRequestEmail(e.target.value)}
                                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                                      placeholder="colleague@example.com"
                                  />
                              </div>
                              <button 
                                  onClick={handleRequestReference}
                                  disabled={!requestEmail}
                                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  Send Request
                              </button>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Author Name</label>
                                      <input 
                                          value={newReference.authorName || ''}
                                          onChange={e => setNewReference({...newReference, authorName: e.target.value})}
                                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role</label>
                                      <input 
                                          value={newReference.authorRole || ''}
                                          onChange={e => setNewReference({...newReference, authorRole: e.target.value})}
                                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                                      />
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Relationship</label>
                                      <select 
                                          value={newReference.relationship}
                                          onChange={e => setNewReference({...newReference, relationship: e.target.value as any})}
                                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none cursor-pointer"
                                      >
                                          {REFERENCE_RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Company</label>
                                      <input 
                                          value={newReference.authorCompany || ''}
                                          onChange={e => setNewReference({...newReference, authorCompany: e.target.value})}
                                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Assessment Rating</label>
                                  <select 
                                      value={newReference.assessment}
                                      onChange={e => setNewReference({...newReference, assessment: e.target.value as any})}
                                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none cursor-pointer"
                                  >
                                      {REFERENCE_ASSESSMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Endorsement Text</label>
                                  <textarea 
                                      value={newReference.content || ''}
                                      onChange={e => setNewReference({...newReference, content: e.target.value})}
                                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-24 resize-none focus:ring-2 focus:ring-black outline-none"
                                      placeholder="Paste the recommendation text here..."
                                  />
                              </div>
                              <button 
                                  onClick={saveReference}
                                  disabled={!newReference.authorName || !newReference.content}
                                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  Add Reference
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default CandidateProfileForm;
