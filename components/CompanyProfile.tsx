import React, { useState } from 'react';
import { CompanyProfile as CompanyProfileType, TeamMember, MemberRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { Building2, Save, Users, CreditCard, Plus, Trash2, CheckCircle, Mail, Clock, Globe } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import { useAuth } from '../contexts/AuthContext';
import { CULTURAL_VALUES, INDUSTRIES, PERKS_CATEGORIES, ALL_CHARACTER_TRAITS } from '../constants/matchingData';
import { TEAM_DISTRIBUTION_OPTIONS, COLLABORATION_FREQUENCY_OPTIONS } from '../constants/workStyleData';
import { COMPANY_SIZE_RANGES, FUNDING_STAGES, GROWTH_STAGES, REMOTE_POLICIES, COMPANY_SIZE_DESCRIPTIONS, GROWTH_STAGE_DESCRIPTIONS, REMOTE_POLICY_DESCRIPTIONS, COMMON_TECH_STACK } from '../constants/companyData';

interface Props {
  profile: CompanyProfileType;
  onSave: (p: CompanyProfileType) => void;
  teamMembers: TeamMember[];
  onTeamUpdate: () => void;
}

const CompanyProfile: React.FC<Props> = ({ profile, onSave, teamMembers, onTeamUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'culture' | 'team' | 'billing'>('profile');
  const [formData, setFormData] = useState<CompanyProfileType>({ ...profile, industry: profile.industry || [], values: profile.values || [], perks: profile.perks || [], desiredTraits: profile.desiredTraits || [], techStack: profile.techStack || [], companyPhotos: profile.companyPhotos || [] });
  
  const handleSave = async () => {
    try {
      const { error } = await supabase.from('company_profiles').update({
          company_name: formData.companyName,
          logo_url: formData.logoUrl,
          website: formData.website,
          tagline: formData.tagline,
          about: formData.about,
          industry: formData.industry,
          values: formData.values,
          perks: formData.perks,
          remote_policy: formData.remotePolicy,
          work_style_culture: formData.workStyleCulture,
          team_structure: formData.teamStructure
      }).eq('id', user?.id);
      if (error) throw error;
      onSave(formData);
      alert('Updated!');
    } catch (e) { alert('Failed'); }
  };

  return (
    <div className="max-w-5xl mx-auto my-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row min-h-[600px]">
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold ${activeTab === 'profile' ? 'bg-white shadow-sm' : ''}`}><Building2 className="w-4 h-4 mr-3" /> Profile</button>
                <button onClick={() => setActiveTab('culture')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold ${activeTab === 'culture' ? 'bg-white shadow-sm' : ''}`}><Globe className="w-4 h-4 mr-3" /> Work Style</button>
                <button onClick={() => setActiveTab('team')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold ${activeTab === 'team' ? 'bg-white shadow-sm' : ''}`}><Users className="w-4 h-4 mr-3" /> Team</button>
            </div>

            <div className="flex-1 p-8">
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Company Brand</h2>
                        <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Name" />
                        <textarea value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} rows={4} className="w-full p-3 border rounded-lg" placeholder="About" />
                        <GroupedMultiSelect label="Industry" options={INDUSTRIES} selected={formData.industry} onChange={v => setFormData({...formData, industry: v})} />
                    </div>
                )}

                {activeTab === 'culture' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Work Style Defaults</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Work Intensity</label>
                                    <select value={formData.workStyleCulture?.workIntensity || ''} onChange={e => setFormData({...formData, workStyleCulture: { ...formData.workStyleCulture, workIntensity: e.target.value as any }})} className="w-full p-3 border rounded-lg bg-white">
                                        <option value="">Not Specified</option>
                                        <option value="relaxed">Relaxed</option><option value="moderate">Moderate</option><option value="fast_paced">Fast-Paced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Autonomy Level</label>
                                    <select value={formData.workStyleCulture?.autonomyLevel || ''} onChange={e => setFormData({...formData, workStyleCulture: { ...formData.workStyleCulture, autonomyLevel: e.target.value as any }})} className="w-full p-3 border rounded-lg bg-white">
                                        <option value="">Not Specified</option>
                                        <option value="balanced">Balanced</option><option value="highly_autonomous">Highly Autonomous</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t">
                            <h2 className="text-2xl font-bold mb-4">Team Defaults</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Distribution Model</label>
                                    <select value={formData.teamStructure?.teamDistribution || ''} onChange={e => setFormData({...formData, teamStructure: { ...formData.teamStructure, teamDistribution: e.target.value as any }})} className="w-full p-3 border rounded-lg bg-white">
                                        {TEAM_DISTRIBUTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Collab Frequency</label>
                                    <select value={formData.teamStructure?.defaultCollaboration || ''} onChange={e => setFormData({...formData, teamStructure: { ...formData.teamStructure, defaultCollaboration: e.target.value as any }})} className="w-full p-3 border rounded-lg bg-white">
                                        {COLLABORATION_FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && <div>Team Management...</div>}

                <div className="mt-8 pt-6 border-t flex justify-end">
                    <button onClick={handleSave} className="bg-black text-white px-8 py-3 rounded-xl font-bold">Save Changes</button>
                </div>
            </div>
        </div>
    </div>
  );
};
export default CompanyProfile;
