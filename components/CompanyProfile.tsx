
import React, { useState } from 'react';
import { CompanyProfile as CompanyProfileType, TeamMember, MemberRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { Building2, Save, Users, CreditCard, Plus, Trash2, CheckCircle, Mail, Settings } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import { CULTURAL_VALUES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES, INDUSTRIES } from '../constants/matchingData';

interface Props {
  profile: CompanyProfileType;
  onSave: (p: CompanyProfileType) => void;
  teamMembers: TeamMember[];
  onTeamUpdate: () => void;
}

const CompanyProfile: React.FC<Props> = ({ profile, onSave, teamMembers, onTeamUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'billing'>('profile');
  const [formData, setFormData] = useState<CompanyProfileType>(profile);
  const [uploading, setUploading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<MemberRole>('interviewer');
  const [inviteName, setInviteName] = useState('');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('company-logos').upload(filePath, file);

      if (uploadError) {
          console.error(uploadError);
          setUploading(false);
          return;
      }

      const { data } = supabase.storage.from('company-logos').getPublicUrl(filePath);
      setFormData({ ...formData, logoUrl: data.publicUrl });
      setUploading(false);
  };

  const handleInvite = async () => {
      if (!inviteEmail) return;
      
      const { error } = await supabase.from('team_members').insert({
          company_id: profile.id, // Profile ID is used as company ID in this simplified schema
          email: inviteEmail,
          name: inviteName || inviteEmail.split('@')[0],
          role: inviteRole
      });

      if (!error) {
          setInviteEmail('');
          setInviteName('');
          onTeamUpdate();
          alert('Team member invited!');
      } else {
          console.error(error);
          alert('Failed to invite member.');
      }
  };

  const handleRemoveMember = async (id: string) => {
      if (!window.confirm('Are you sure?')) return;
      await supabase.from('team_members').delete().eq('id', id);
      onTeamUpdate();
  };

  return (
    <div className="max-w-5xl mx-auto my-8">
        <div className="flex items-center justify-between mb-8 px-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
                <p className="text-gray-500 mt-1">Manage your brand, team, and billing.</p>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <Building2 className="w-4 h-4 mr-3" /> Profile & Brand
                </button>
                <button 
                    onClick={() => setActiveTab('team')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'team' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <Users className="w-4 h-4 mr-3" /> Team Members
                </button>
                <button 
                    onClick={() => setActiveTab('billing')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-colors ${activeTab === 'billing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <CreditCard className="w-4 h-4 mr-3" /> Plan & Billing
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto max-h-[800px]">
                {activeTab === 'profile' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Company Information</h2>
                            <div className="flex items-start gap-6 mb-8">
                                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                                    {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-cover"/> : <Building2 className="w-8 h-8 text-gray-400"/>}
                                </div>
                                <div className="flex-1">
                                    <input type="file" id="logo" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    <label htmlFor="logo" className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-50">
                                        {uploading ? 'Uploading...' : 'Upload New Logo'}
                                    </label>
                                    <p className="text-xs text-gray-400 mt-2">Recommended: 400x400px. JPG or PNG.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                                    <input value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Website</label>
                                    <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">About Us</label>
                                    <textarea value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all h-32" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-8">
                             <h2 className="text-xl font-bold text-gray-900 mb-6">Culture & Values</h2>
                             <div className="space-y-6">
                                <GroupedMultiSelect
                                    label="Industry"
                                    options={INDUSTRIES}
                                    selected={formData.industry || []}
                                    onChange={vals => setFormData({...formData, industry: vals})}
                                    placeholder="Select industries..."
                                    maxSelections={3}
                                />
                                <GroupedMultiSelect
                                    label="Company Values"
                                    options={CULTURAL_VALUES}
                                    selected={formData.values || []}
                                    onChange={vals => setFormData({...formData, values: vals})}
                                    placeholder="Select core values..."
                                    maxSelections={6}
                                />
                                <GroupedMultiSelect
                                    label="Perks & Benefits"
                                    options={PERKS_CATEGORIES}
                                    selected={formData.perks || []}
                                    onChange={vals => setFormData({...formData, perks: vals})}
                                    placeholder="What do you offer?"
                                    grouped={true}
                                />
                                <GroupedMultiSelect
                                    label="Traits we look for"
                                    options={CHARACTER_TRAITS_CATEGORIES}
                                    selected={formData.desiredTraits || []}
                                    onChange={vals => setFormData({...formData, desiredTraits: vals})}
                                    placeholder="Ideal candidate traits..."
                                    grouped={true}
                                    maxSelections={5}
                                />
                             </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button onClick={() => onSave(formData)} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black flex items-center shadow-lg transition-transform hover:-translate-y-0.5">
                                <Save className="w-4 h-4 mr-2"/> Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'team' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Team Management</h2>
                            <p className="text-gray-500 text-sm mb-6">Invite colleagues to help manage jobs and interviews.</p>
                            
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
                                <h3 className="text-sm font-bold text-blue-800 mb-4 flex items-center"><Mail className="w-4 h-4 mr-2"/> Invite New Member</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input 
                                        placeholder="Colleague's Email" 
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        className="p-3 rounded-xl border border-blue-200 text-sm"
                                    />
                                    <input 
                                        placeholder="Name (Optional)" 
                                        value={inviteName}
                                        onChange={e => setInviteName(e.target.value)}
                                        className="p-3 rounded-xl border border-blue-200 text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            value={inviteRole} 
                                            onChange={e => setInviteRole(e.target.value as MemberRole)}
                                            className="flex-1 p-3 rounded-xl border border-blue-200 text-sm bg-white"
                                        >
                                            <option value="interviewer">Interviewer</option>
                                            <option value="hiring_manager">Hiring Manager</option>
                                            <option value="finance">Finance Controller</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button onClick={handleInvite} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700">
                                            <Plus className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-xs font-bold text-gray-500 uppercase">Name</th>
                                            <th className="text-left py-3 px-6 text-xs font-bold text-gray-500 uppercase">Role</th>
                                            <th className="text-right py-3 px-6 text-xs font-bold text-gray-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {teamMembers.map(member => (
                                            <tr key={member.id}>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">{member.name}</div>
                                                    <div className="text-xs text-gray-500">{member.email}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                        {member.role.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button onClick={() => handleRemoveMember(member.id)} className="text-gray-400 hover:text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {teamMembers.length === 0 && <div className="p-8 text-center text-gray-400">No team members yet.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                         <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Plan & Usage</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="text-sm text-gray-400 font-bold uppercase mb-1">Current Plan</div>
                                        <div className="text-3xl font-black mb-4">Pay Per Hire</div>
                                        <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100">Upgrade Plan</button>
                                    </div>
                                    <div className="absolute top-0 right-0 p-16 bg-gray-800 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                </div>
                                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                                    <div className="text-sm text-gray-400 font-bold uppercase mb-1">Unlock Credits</div>
                                    <div className="text-3xl font-black text-gray-900 mb-4">{profile.credits || 0}</div>
                                    <button className="text-blue-600 font-bold text-sm hover:underline">Buy more credits</button>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-900 mb-4">Billing History</h3>
                            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                                No invoices found.
                            </div>
                         </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default CompanyProfile;
