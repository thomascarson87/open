
import React, { useState, useEffect } from 'react';
import { CompanyProfile as CompanyProfileType, TeamMember, MemberRole } from '../types';
import { Building2, Globe, MapPin, CreditCard, Save, Users, UserPlus, Trash2, Mail } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import GroupedMultiSelect from './GroupedMultiSelect';
import { INDUSTRIES, CULTURAL_VALUES, PERKS_CATEGORIES, CHARACTER_TRAITS_CATEGORIES } from '../constants/matchingData';

interface Props {
  profile: CompanyProfileType;
  onSave: (p: CompanyProfileType) => void;
}

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

const ROLES: { id: MemberRole, label: string }[] = [
    { id: 'admin', label: 'Admin (Full Access)' },
    { id: 'hiring_manager', label: 'Hiring Manager' },
    { id: 'finance', label: 'Finance (Budget Approval)' },
    { id: 'interviewer', label: 'Interviewer' },
];

const CompanyProfile: React.FC<Props> = ({ profile, onSave }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'team' | 'billing'>('details');
  const [formData, setFormData] = useState<CompanyProfileType>(profile);
  
  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<MemberRole>('interviewer');
  const [newMemberName, setNewMemberName] = useState('');

  useEffect(() => {
      if (profile.id) {
          fetchTeam();
      }
  }, [profile.id]);

  const fetchTeam = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('company_id', profile.id);
      
      if (data) setTeamMembers(data as TeamMember[]);
  };

  const handleInvite = async () => {
      if (!newMemberEmail || !newMemberName) return;
      
      const newMember = {
          company_id: profile.id,
          email: newMemberEmail,
          name: newMemberName,
          role: newMemberRole
      };

      const { data, error } = await supabase.from('team_members').insert([newMember]).select();
      
      if (data) {
          setTeamMembers([...teamMembers, data[0] as TeamMember]);
          setNewMemberEmail('');
          setNewMemberName('');
          alert('Invitation sent (Simulated)! Member added to list.');
      } else if (error) {
          console.error(error);
          alert('Error adding member: ' + error.message);
      }
  };

  const removeMember = async (id: string) => {
      await supabase.from('team_members').delete().eq('id', id);
      setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company Settings</h1>
            <p className="text-gray-500 mt-2">Manage your employer brand, team access, and billing.</p>
        </div>
        <button
            onClick={() => onSave(formData)}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-black transition-all shadow-md flex items-center"
        >
            <Save className="w-4 h-4 mr-2" /> Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('details')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Profile Details</button>
          <button onClick={() => setActiveTab('team')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'team' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Team & Roles</button>
          <button onClick={() => setActiveTab('billing')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'billing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Billing</button>
      </div>

      <div className="min-h-[400px]">
        
        {/* DETAILS TAB */}
        {activeTab === 'details' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                <h3 className="text-xl font-bold text-gray-900 flex items-center"><Building2 className="w-5 h-5 mr-2 text-gray-400"/> Company Details</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Name</label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={e => setFormData({...formData, companyName: e.target.value})}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             {/* Industry Selection */}
                             <section>
                              <GroupedMultiSelect
                                label="Company Industry"
                                options={INDUSTRIES}
                                selected={formData.industry || []}
                                onChange={(industry) => setFormData(prev => ({ ...prev, industry }))}
                                placeholder="Select your primary industry(ies)"
                                helpText="Select 1-3 industries that best describe your company"
                                maxSelections={3}
                                searchable={true}
                              />
                             </section>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Company Size</label>
                             <select 
                                value={formData.size}
                                onChange={e => setFormData({...formData, size: e.target.value})}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                            >
                                {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} Employees</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">About Us</label>
                        <textarea
                            value={formData.about}
                            onChange={e => setFormData({...formData, about: e.target.value})}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg h-32 resize-none focus:ring-2 focus:ring-gray-900 outline-none"
                            placeholder="Tell candidates about your mission and culture..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={formData.website}
                                    onChange={e => setFormData({...formData, website: e.target.value})}
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">HQ Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                    className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 space-y-8">
                    <section>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Company Culture</h3>
                      <GroupedMultiSelect
                        label="Core Values"
                        options={CULTURAL_VALUES}
                        selected={formData.values || []}
                        onChange={(values) => setFormData(prev => ({ ...prev, values }))}
                        placeholder="What values define your company culture?"
                        helpText="Select 5-8 core values that candidates should align with"
                        maxSelections={10}
                        searchable={true}
                      />
                    </section>

                    <section>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Standard Benefits</h3>
                      <GroupedMultiSelect
                        label="Perks & Benefits Offered"
                        options={PERKS_CATEGORIES}
                        selected={formData.perks || []}
                        onChange={(perks) => setFormData(prev => ({ ...prev, perks }))}
                        placeholder="What perks do you offer all employees?"
                        helpText="Select the benefits package you provide"
                        grouped={true}
                        searchable={true}
                      />
                    </section>

                    <section>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Ideal Candidate Traits</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        These are company-wide trait preferences. You can override these per job posting.
                      </p>
                      <GroupedMultiSelect
                        label="Desired Character Traits"
                        options={CHARACTER_TRAITS_CATEGORIES}
                        selected={formData.desiredTraits || []}
                        onChange={(traits) => setFormData(prev => ({ ...prev, desiredTraits: traits }))}
                        placeholder="What personality traits fit your culture?"
                        grouped={true}
                        searchable={true}
                      />
                    </section>
                </div>
            </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center"><Users className="w-5 h-5 mr-2 text-gray-400"/> Team Members</h3>
                        <p className="text-gray-500 text-sm mt-1">Invite stakeholders to collaborate on job postings and interviews.</p>
                    </div>
                 </div>

                 {/* Invite Form */}
                 <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                     <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center"><UserPlus className="w-4 h-4 mr-2"/> Invite New Member</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <input 
                            placeholder="Full Name" 
                            className="p-2.5 rounded-lg border border-gray-200"
                            value={newMemberName}
                            onChange={e => setNewMemberName(e.target.value)}
                        />
                         <input 
                            placeholder="Email Address" 
                            className="p-2.5 rounded-lg border border-gray-200"
                            value={newMemberEmail}
                            onChange={e => setNewMemberEmail(e.target.value)}
                        />
                         <div className="flex gap-2">
                             <select 
                                className="flex-1 p-2.5 rounded-lg border border-gray-200 bg-white"
                                value={newMemberRole}
                                onChange={e => setNewMemberRole(e.target.value as MemberRole)}
                             >
                                 {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                             </select>
                             <button onClick={handleInvite} className="bg-gray-900 text-white px-4 rounded-lg font-bold hover:bg-black">Add</button>
                         </div>
                     </div>
                 </div>

                 {/* List */}
                 <div className="space-y-4">
                     {teamMembers.map(member => (
                         <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 transition-all shadow-sm">
                             <div className="flex items-center space-x-4">
                                 <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                     {member.name.charAt(0)}
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-gray-900">{member.name}</h4>
                                     <div className="flex items-center text-sm text-gray-500">
                                         <Mail className="w-3 h-3 mr-1"/> {member.email}
                                         <span className="mx-2">•</span>
                                         <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium uppercase">{ROLES.find(r => r.id === member.role)?.label}</span>
                                     </div>
                                 </div>
                             </div>
                             <button onClick={() => removeMember(member.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                 <Trash2 className="w-4 h-4" />
                             </button>
                         </div>
                     ))}
                     {teamMembers.length === 0 && (
                         <div className="text-center py-8 text-gray-400">No team members yet. Invite someone above.</div>
                     )}
                 </div>
             </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center"><CreditCard className="w-5 h-5 mr-2 text-gray-400"/> Billing</h3>
                    
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Payment Method</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Active</span>
                        </div>
                        {formData.paymentMethod ? (
                            <div className="flex items-center text-sm text-gray-600">
                                <div className="w-8 h-5 bg-gray-800 rounded mr-2"></div>
                                •••• {formData.paymentMethod.last4}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">No card added.</div>
                        )}
                    </div>

                    <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 py-2 rounded-lg text-sm font-medium transition-colors">
                        Manage in Stripe
                    </button>
                    <p className="text-xs text-gray-400 mt-4 text-center">Secure payments powered by Stripe.</p>
                </div>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-900 mb-2">Recruitment Plan</h3>
                    <p className="text-xs text-blue-700 mb-4">You are on the <span className="font-bold">Pay-As-You-Go</span> plan. You only pay when you unlock a candidate's full profile.</p>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800">View Rates &rarr;</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default CompanyProfile;
