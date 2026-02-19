import React, { useState, useEffect } from 'react';
import { CompanyProfile as CompanyProfileType, TeamMember, MemberRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { Building2, Save, Users, CreditCard, Plus, Trash2, CheckCircle, Mail, Clock, Globe, ExternalLink, Camera, Star, Code, ArrowUpRight } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import { useAuth } from '../contexts/AuthContext';
import { CULTURAL_VALUES, INDUSTRIES, PERKS_CATEGORIES, ALL_CHARACTER_TRAITS, ALL_PERKS } from '../constants/matchingData';
import { WORK_INTENSITY_OPTIONS, AUTONOMY_LEVEL_OPTIONS } from '../constants/workStyleData';
import { COMPANY_FOCUS_TYPES, MISSION_ORIENTATIONS, WORK_STYLES } from '../constants/certifications';
import WidgetSetup from './WidgetSetup';
import CompanyFollowerStats from './CompanyFollowerStats';

interface Props {
  profile: CompanyProfileType;
  onSave: (p: CompanyProfileType) => void;
  teamMembers: TeamMember[];
  onTeamUpdate: () => void;
  initialTab?: string;
}

const CompanyProfile: React.FC<Props> = ({ profile, onSave, teamMembers, onTeamUpdate, initialTab }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'culture' | 'team' | 'billing' | 'widget'>((initialTab as any) || 'profile');
  const [formData, setFormData] = useState<CompanyProfileType>({ 
    ...profile, industry: profile.industry || [], values: profile.values || [], perks: profile.perks || [], 
    desiredTraits: profile.desiredTraits || [], techStack: profile.techStack || [], companyPhotos: profile.companyPhotos || [],
    workStyleCulture: profile.workStyleCulture || {}, teamStructure: profile.teamStructure || {}, companyLanguages: profile.companyLanguages || []
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [initialTab]);
  
  const handleSave = async () => {
    try {
      const { error } = await supabase.from('company_profiles').update({
          company_name: formData.companyName, logo_url: formData.logoUrl, website: formData.website, tagline: formData.tagline,
          about: formData.about, mission_statement: formData.missionStatement, industry: formData.industry,
          values: formData.values, perks: formData.perks, remote_policy: formData.remotePolicy,
          work_style_culture: formData.workStyleCulture, team_structure: formData.teamStructure,
          company_languages: formData.companyLanguages, company_size_range: formData.companySizeRange,
          founded_year: formData.foundedYear, headquarters_location: formData.headquartersLocation,
          funding_stage: formData.fundingStage, growth_stage: formData.growthStage, tech_stack: formData.techStack,
          social_media: formData.socialMedia, company_photos: formData.companyPhotos,
          culture_description: formData.cultureDescription, work_environment: formData.workEnvironment,
          benefits_description: formData.benefitsDescription,
          desired_traits: formData.desiredTraits || [], diversity_statement: formData.diversityStatement || null,
          default_timezone: formData.defaultTimezone || null, visa_sponsorship_policy: formData.visaSponsorshipPolicy || null,
          focus_type: formData.focusType || null, mission_orientation: formData.missionOrientation || null,
          work_style: formData.workStyle || null
      }).eq('id', user?.id);
      if (error) throw error;
      onSave(formData);
      alert('Company profile updated!');
    } catch (e) { alert('Failed to update company profile'); }
  };

  const TabButton = ({ id, label, icon: Icon, badge }: any) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === id ? 'bg-white dark:bg-surface shadow-sm text-accent-coral' : 'text-muted hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800'}`}
    >
      <span className="flex items-center"><Icon className="w-4 h-4 mr-3" /> {label}</span>
      {badge && <span className="text-[10px] bg-accent-green-bg text-accent-green px-1.5 py-0.5 rounded-full font-black">{badge}</span>}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
        <div className="bg-white dark:bg-surface rounded-[2.5rem] border border-border shadow-sm flex flex-col md:flex-row min-h-[700px] overflow-hidden">
            <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 border-r border-border p-6 space-y-2">
                <div className="mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black">O</div>
                  <span className="font-black text-lg">Manage</span>
                </div>
                <TabButton id="profile" label="Brand & Info" icon={Building2} />
                <TabButton id="culture" label="Culture Defaults" icon={Globe} />
                <TabButton id="team" label="Team Access" icon={Users} />
                <TabButton id="widget" label="Career Widget" icon={Code} badge="New" />
                <TabButton id="billing" label="Billing" icon={CreditCard} />
            </div>
            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                {activeTab === 'profile' && (
                    <div className="space-y-10 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Company Name</label><input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-transparent rounded-xl font-bold focus:bg-white dark:bg-surface focus:ring-2 focus:ring-accent-coral outline-none" /></div>
                                <div><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Tagline</label><input value={formData.tagline || ''} onChange={e => setFormData({...formData, tagline: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-transparent rounded-xl focus:bg-white dark:bg-surface focus:ring-2 focus:ring-accent-coral outline-none" /></div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-border"><div className="w-24 h-24 bg-surface rounded-2xl flex items-center justify-center shadow-sm mb-4">{formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-cover rounded-2xl" /> : <Camera className="w-8 h-8 text-gray-300 dark:text-gray-600" />}</div><button className="text-xs font-black text-accent-coral uppercase tracking-widest hover:underline">Change Logo</button></div>
                        </div>
                        <div><label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase mb-2">About Us</label><textarea value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} rows={5} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-transparent rounded-xl focus:bg-white dark:bg-surface focus:ring-2 focus:ring-accent-coral outline-none resize-none" /></div>
                        <GroupedMultiSelect label="Industries" options={INDUSTRIES} selected={formData.industry} onChange={v => setFormData({...formData, industry: v})} />
                    </div>
                )}
                {activeTab === 'culture' && (
                    <div className="space-y-10 animate-in fade-in duration-300">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Focus Type</label>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">How candidates will spend their time</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {COMPANY_FOCUS_TYPES.map(o => (
                                        <button key={o.value} onClick={() => setFormData({...formData, focusType: o.value})} className={`p-4 rounded-xl border-2 text-left transition-all ${formData.focusType === o.value ? 'bg-accent-coral-bg border-accent-coral' : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-border'}`}>
                                            <div className={`text-sm font-black ${formData.focusType === o.value ? 'text-accent-coral' : 'text-gray-700 dark:text-gray-300 dark:text-gray-600'}`}>{o.label}</div>
                                            <div className={`text-xs mt-0.5 ${formData.focusType === o.value ? 'text-accent-coral' : 'text-gray-400 dark:text-gray-500'}`}>{o.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Mission Orientation</label>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">What drives your company's decisions</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {MISSION_ORIENTATIONS.map(o => (
                                        <button key={o.value} onClick={() => setFormData({...formData, missionOrientation: o.value})} className={`p-4 rounded-xl border-2 text-left transition-all ${formData.missionOrientation === o.value ? 'bg-accent-coral-bg border-accent-coral' : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-border'}`}>
                                            <div className={`text-sm font-black ${formData.missionOrientation === o.value ? 'text-accent-coral' : 'text-gray-700 dark:text-gray-300 dark:text-gray-600'}`}>{o.label}</div>
                                            <div className={`text-xs mt-0.5 ${formData.missionOrientation === o.value ? 'text-accent-coral' : 'text-gray-400 dark:text-gray-500'}`}>{o.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Work Style</label>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Day-to-day team structure</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {WORK_STYLES.map(o => (
                                        <button key={o.value} onClick={() => setFormData({...formData, workStyle: o.value})} className={`p-4 rounded-xl border-2 text-left transition-all ${formData.workStyle === o.value ? 'bg-accent-coral-bg border-accent-coral' : 'bg-gray-50 dark:bg-gray-900 border-transparent hover:border-border'}`}>
                                            <div className={`text-sm font-black ${formData.workStyle === o.value ? 'text-accent-coral' : 'text-gray-700 dark:text-gray-300 dark:text-gray-600'}`}>{o.label}</div>
                                            <div className={`text-xs mt-0.5 ${formData.workStyle === o.value ? 'text-accent-coral' : 'text-gray-400 dark:text-gray-500'}`}>{o.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-accent-coral-bg p-8 rounded-3xl border border-accent-coral-bg">
                            <div><label className="block text-xs font-black text-accent-coral uppercase mb-4">Typical Intensity</label><div className="grid grid-cols-2 gap-2">{WORK_INTENSITY_OPTIONS.map(o => <button key={o.value} onClick={() => setFormData({...formData, workStyleCulture: {...formData.workStyleCulture, workIntensity: o.value}})} className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${formData.workStyleCulture?.workIntensity === o.value ? 'bg-white dark:bg-surface border-accent-coral text-accent-coral' : 'bg-white dark:bg-surface/50 border-transparent text-muted'}`}>{o.label}</button>)}</div></div>
                            <div><label className="block text-xs font-black text-accent-coral uppercase mb-4">Management Style</label><div className="grid grid-cols-2 gap-2">{AUTONOMY_LEVEL_OPTIONS.map(o => <button key={o.value} onClick={() => setFormData({...formData, workStyleCulture: {...formData.workStyleCulture, autonomyLevel: o.value}})} className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${formData.workStyleCulture?.autonomyLevel === o.value ? 'bg-white dark:bg-surface border-accent-coral text-accent-coral' : 'bg-white dark:bg-surface/50 border-transparent text-muted'}`}>{o.label}</button>)}</div></div>
                        </div>
                        <GroupedMultiSelect label="Org Values" options={CULTURAL_VALUES} selected={formData.values} onChange={v => setFormData({...formData, values: v})} />
                        <GroupedMultiSelect label="Standard Perks" options={ALL_PERKS} selected={formData.perks} onChange={v => setFormData({...formData, perks: v})} />
                    </div>
                )}
                {activeTab === 'team' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="bg-gray-50 dark:bg-gray-900 p-12 rounded-[2rem] border-2 border-dashed border-border text-center"><Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><h3 className="font-black text-xl text-primary mb-2">Invite your team</h3><button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black flex items-center mx-auto hover:scale-105 transition-transform shadow-lg"><Plus className="w-5 h-5 mr-2" /> Invite Member</button></div>
                    </div>
                )}
                {activeTab === 'widget' && (
                    <div className="animate-in fade-in duration-300">
                      <WidgetSetup onBack={() => setActiveTab('profile')} isEmbedded={true} />
                    </div>
                )}
                {activeTab === 'billing' && (
                    <div className="space-y-10 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-900 p-8 rounded-3xl text-white">
                                <h4 className="text-xs font-black text-accent-coral-light uppercase tracking-widest mb-4">Available Credits</h4>
                                <div className="text-5xl font-black mb-2">{formData.credits || 0}</div>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">Used to unlock full candidate profiles.</p>
                                <button className="w-full bg-accent-coral hover:bg-accent-coral text-white py-3 rounded-xl font-bold transition-colors">Add Credits</button>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-3xl border border-border flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Current Plan</h4>
                                    <div className="text-2xl font-black text-primary capitalize mb-1">{formData.billingPlan?.replace(/_/g, ' ') || 'Pay Per Hire'}</div>
                                    <p className="text-muted text-sm">Perfect for targeted precision hiring.</p>
                                </div>
                                <button className="text-sm font-bold text-accent-coral flex items-center hover:underline mt-6">View all plans <ArrowUpRight className="ml-1 w-4 h-4"/></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CompanyFollowerStats
                              companyId={profile.id}
                              initialCount={profile.followerCount}
                            />
                        </div>
                    </div>
                )}
                {activeTab !== 'widget' && (
                  <div className="mt-12 pt-8 border-t border-border flex justify-end">
                    <button onClick={handleSave} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all active:scale-95">Save All Changes</button>
                  </div>
                )}
            </div>
        </div>
    </div>
  );
};
export default CompanyProfile;
