import React, { useState } from 'react';
import { CompanyProfile as CompanyProfileType, TeamMember, MemberRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { Building2, Save, Users, CreditCard, Plus, Trash2, CheckCircle, Mail, Clock, Globe } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import { useAuth } from '../contexts/AuthContext';
import { CULTURAL_VALUES, INDUSTRIES, PERKS_CATEGORIES, ALL_CHARACTER_TRAITS } from '../constants/matchingData';
import { 
  TEAM_DISTRIBUTION_OPTIONS, 
  COLLABORATION_FREQ_OPTIONS, 
  WORK_INTENSITY_OPTIONS, 
  AUTONOMY_LEVEL_OPTIONS,
  INNOVATION_STABILITY_OPTIONS,
  CHANGE_FREQUENCY_OPTIONS,
  REPORTING_STRUCTURE_OPTIONS
} from '../constants/workStyleData';
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
  const [formData, setFormData] = useState<CompanyProfileType>({ 
    ...profile, 
    industry: profile.industry || [], 
    values: profile.values || [], 
    perks: profile.perks || [], 
    desiredTraits: profile.desiredTraits || [], 
    techStack: profile.techStack || [], 
    companyPhotos: profile.companyPhotos || [],
    workStyleCulture: profile.workStyleCulture || {},
    teamStructure: profile.teamStructure || {},
    companyLanguages: profile.companyLanguages || []
  });
  
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
          team_structure: formData.teamStructure,
          company_languages: formData.companyLanguages,
          company_size_range: formData.companySizeRange
      }).eq('id', user?.id);
      if (error) throw error;
      onSave(formData);
      alert('Company profile updated successfully!');
    } catch (e) { alert('Failed to update company profile'); }
  };

  return (
    <div className="max-w-5xl mx-auto my-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row min-h-[600px]">
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
                <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold ${activeTab === 'profile' ? 'bg-white shadow-sm' : ''}`}><Building2 className="w-4 h-4 mr-3" /> Brand & Info</button>
                <button onClick={() => setActiveTab('culture')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold ${activeTab === 'culture' ? 'bg-white shadow-sm' : ''}`}><Globe className="w-4 h-4 mr-3" /> Cultural Defaults</button>
                <button onClick={() => setActiveTab('team')} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold ${activeTab === 'team' ? 'bg-white shadow-sm' : ''}`}><Users className="w-4 h-4 mr-3" /> Team Access</button>
            </div>

            <div className="flex-1 p-8">
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black">Company Brand</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Name</label><input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-3 border rounded-xl font-bold" /></div>
                            <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Company Size</label>
                                <select value={formData.companySizeRange || ''} onChange={e => setFormData({...formData, companySizeRange: e.target.value})} className="w-full p-3 border rounded-xl bg-white font-bold">
                                    <option value="">Select range...</option>
                                    {COMPANY_SIZE_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                                </select>
                            </div>
                        </div>
                        <textarea value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} rows={4} className="w-full p-3 border rounded-xl" placeholder="Describe your company's mission and journey..." />
                        <GroupedMultiSelect label="Industries" options={INDUSTRIES} selected={formData.industry} onChange={v => setFormData({...formData, industry: v})} />
                    </div>
                )}

                {activeTab === 'culture' && (
                    <div className="space-y-10 animate-in fade-in">
                        <div>
                            <h2 className="text-2xl font-black mb-2">Work Style Culture</h2>
                            <p className="text-gray-500 text-sm mb-6">Default working style for the organization. Individual roles can override these.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Work Intensity</label>
                                    <select value={formData.workStyleCulture?.workIntensity || ''} onChange={e => setFormData({...formData, workStyleCulture: { ...formData.workStyleCulture, workIntensity: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-white">
                                        <option value="">Not Specified</option>
                                        {WORK_INTENSITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Autonomy Level</label>
                                    <select value={formData.workStyleCulture?.autonomyLevel || ''} onChange={e => setFormData({...formData, workStyleCulture: { ...formData.workStyleCulture, autonomyLevel: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-white">
                                        <option value="">Not Specified</option>
                                        {AUTONOMY_LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Innovation vs Stability</label>
                                    <select value={formData.workStyleCulture?.innovationStability || ''} onChange={e => setFormData({...formData, workStyleCulture: { ...formData.workStyleCulture, innovationStability: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-white">
                                        <option value="">Not Specified</option>
                                        {INNOVATION_STABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Change Frequency</label>
                                    <select value={formData.workStyleCulture?.changeFrequency || ''} onChange={e => setFormData({...formData, workStyleCulture: { ...formData.workStyleCulture, changeFrequency: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-white">
                                        <option value="">Not Specified</option>
                                        {CHANGE_FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-8 border-t">
                            <h2 className="text-2xl font-black mb-2">Team & Collaboration</h2>
                            <p className="text-gray-500 text-sm mb-6">Default team structures and collaboration models.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Distribution Model</label>
                                    <select value={formData.teamStructure?.teamDistribution || ''} onChange={e => setFormData({...formData, teamStructure: { ...formData.teamStructure, teamDistribution: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-white">
                                        <option value="">Not Specified</option>
                                        {TEAM_DISTRIBUTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Collab Frequency</label>
                                    <select value={formData.teamStructure?.defaultCollaboration || ''} onChange={e => setFormData({...formData, teamStructure: { ...formData.teamStructure, defaultCollaboration: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-white">
                                        <option value="">Not Specified</option>
                                        {COLLABORATION_FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Reporting Structure</label>
                                    <select value={formData.teamStructure?.reportingStructure || ''} onChange={e => setFormData({...formData, teamStructure: { ...formData.teamStructure, reportingStructure: e.target.value as any }})} className="w-full p-3 border rounded-xl bg-white">
                                        <option value="">Not Specified</option>
                                        {REPORTING_STRUCTURE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black">Team Management</h2>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 text-center">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Invite hiring managers and finance controllers to collaborate.</p>
                            <button className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-xl font-bold flex items-center mx-auto hover:bg-black transition-all"><Plus className="w-4 h-4 mr-2" /> Invite Member</button>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t flex justify-end">
                    <button onClick={handleSave} className="bg-black text-white px-8 py-3 rounded-xl font-black shadow-lg hover:scale-105 transition-transform">Save All Changes</button>
                </div>
            </div>
        </div>
    </div>
  );
};
export default CompanyProfile;
