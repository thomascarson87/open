
import React, { useState } from 'react';
import { CompanyProfile as CompanyProfileType, TeamMember, MemberRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { Building2, Save, Users, CreditCard, Plus, Trash2, CheckCircle, Mail, Settings } from 'lucide-react';
import GroupedMultiSelect from './GroupedMultiSelect';
import { useAuth } from '../contexts/AuthContext';
import { 
  CULTURAL_VALUES, 
  INDUSTRIES, 
  ALL_PERKS, 
  ALL_CHARACTER_TRAITS,
  PERKS_CATEGORIES 
} from '../constants/matchingData';

import {
  COMPANY_SIZE_RANGES,
  FUNDING_STAGES,
  GROWTH_STAGES,
  REMOTE_POLICIES,
  COMMON_TECH_STACK,
  COMPANY_SIZE_DESCRIPTIONS,
  GROWTH_STAGE_DESCRIPTIONS,
  REMOTE_POLICY_DESCRIPTIONS
} from '../constants/companyData';

interface Props {
  profile: CompanyProfileType;
  onSave: (p: CompanyProfileType) => void;
  teamMembers: TeamMember[];
  onTeamUpdate: () => void;
}

const CompanyProfile: React.FC<Props> = ({ profile, onSave, teamMembers, onTeamUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'billing'>('profile');
  
  // Initialize state with defensive checks ensuring arrays are arrays
  const [formData, setFormData] = useState<CompanyProfileType>({
    ...profile,
    industry: profile.industry || [],
    values: profile.values || [],
    perks: profile.perks || [],
    desiredTraits: profile.desiredTraits || [],
    techStack: profile.techStack || [],
    companyPhotos: profile.companyPhotos || [],
    socialMedia: profile.socialMedia || {}
  });
  
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

  const validateForm = () => {
    const errors = [];
    
    // Required fields
    if (!formData.companyName) errors.push('Company name is required');
    if (!formData.tagline) errors.push('Tagline is required');
    if (!formData.about || formData.about.length < 100) {
      errors.push('About section must be at least 100 characters');
    }
    
    // Must use constants for matching
    if (!formData.industry || formData.industry.length === 0) {
      errors.push('Select at least one industry');
    }
    if (!formData.values || formData.values.length < 4) {
      errors.push('Select at least 4 core values');
    }
    if (!formData.perks || formData.perks.length === 0) {
      errors.push('Select at least one perk');
    }
    if (!formData.remotePolicy) errors.push('Remote policy is required');
    
    // Details
    if (!formData.teamSize || formData.teamSize < 1) {
      errors.push('Team size is required');
    }
    if (!formData.foundedYear) errors.push('Founded year is required');
    if (!formData.headquartersLocation) {
      errors.push('Headquarters location is required');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
        alert("Please fix errors:\n" + errors.join('\n'));
        return;
    }

    try {
      const { error } = await supabase
        .from('company_profiles')
        .update({
          // Basic
          company_name: formData.companyName,
          logo_url: formData.logoUrl,
          website: formData.website,
          tagline: formData.tagline,
          
          // About
          about: formData.about,
          mission_statement: formData.missionStatement,
          
          // Culture (MUST use constants)
          industry: formData.industry,
          values: formData.values,
          culture_description: formData.cultureDescription,
          work_environment: formData.workEnvironment,
          desired_traits: formData.desiredTraits,
          diversity_statement: formData.diversityStatement,
          
          // Perks (MUST use constants)
          perks: formData.perks,
          benefits_description: formData.benefitsDescription,
          remote_policy: formData.remotePolicy,
          
          // Details
          team_size: formData.teamSize,
          founded_year: formData.foundedYear,
          headquarters_location: formData.headquartersLocation,
          company_size_range: formData.companySizeRange,
          funding_stage: formData.fundingStage,
          growth_stage: formData.growthStage,
          
          // Tech & Social
          tech_stack: formData.techStack,
          social_media: formData.socialMedia,
          company_photos: formData.companyPhotos
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      alert('Company profile updated successfully!');
      onSave(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
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
                        
                        {/* Section 1: Basic Information */}
                        <div className="space-y-6">
                          <h2 className="text-2xl font-bold">Basic Information</h2>
                          
                          {/* Company Logo Upload */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Company Logo</label>
                            {formData.logoUrl && <img src={formData.logoUrl} className="w-20 h-20 rounded mb-2 object-cover" />}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLogoUpload}
                              className="mt-2"
                            />
                            <p className="text-sm text-gray-500 mt-1">Square logo, 400x400px minimum</p>
                          </div>
                          
                          {/* Company Name */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Company Name *</label>
                            <input 
                              type="text" 
                              value={formData.companyName || ''} 
                              onChange={e => setFormData({...formData, companyName: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              required
                            />
                          </div>
                          
                          {/* Website */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Website</label>
                            <input 
                              type="url" 
                              value={formData.website || ''}
                              onChange={e => setFormData({...formData, website: e.target.value})}
                              placeholder="https://yourcompany.com"
                              className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                          </div>
                          
                          {/* Tagline */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Tagline *</label>
                            <input 
                              type="text" 
                              value={formData.tagline || ''}
                              onChange={e => setFormData({...formData, tagline: e.target.value})}
                              placeholder="e.g., Building the future of AI-powered talent matching"
                              maxLength={100}
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              required
                            />
                            <p className="text-sm text-gray-500 mt-1">One-line description (max 100 characters)</p>
                          </div>
                        </div>

                        {/* Section 2: About & Mission */}
                        <div className="border-t border-gray-200 pt-8 mt-8">
                          <h2 className="text-2xl font-bold mb-6">About & Mission</h2>
                          
                          {/* About */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">About Your Company *</label>
                            <textarea 
                              value={formData.about || ''}
                              onChange={e => setFormData({...formData, about: e.target.value})}
                              rows={6}
                              placeholder="Tell candidates what you do, who you serve, and why you exist..."
                              className="w-full p-3 border border-gray-300 rounded-lg resize-vertical"
                              required
                            />
                            <p className="text-sm text-gray-500 mt-1">2-3 paragraphs - this appears first on your widget</p>
                          </div>
                          
                          {/* Mission Statement */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Mission Statement</label>
                            <textarea 
                              value={formData.missionStatement || ''}
                              onChange={e => setFormData({...formData, missionStatement: e.target.value})}
                              rows={3}
                              placeholder="What is your company's core mission?"
                              className="w-full p-3 border border-gray-300 rounded-lg resize-vertical"
                            />
                          </div>
                        </div>

                        {/* Section 3: Culture & Values */}
                        <div className="border-t border-gray-200 pt-8 mt-8">
                          <h2 className="text-2xl font-bold mb-6">Culture & Values</h2>
                          
                          {/* Industry - USE CONSTANT */}
                          <div className="mb-6">
                            <GroupedMultiSelect
                              label="Industry *"
                              options={INDUSTRIES}
                              selected={formData.industry || []}
                              onChange={vals => setFormData({...formData, industry: vals})}
                              placeholder="Select up to 3 industries..."
                              maxSelections={3}
                            />
                          </div>
                          
                          {/* Company Values - USE CONSTANT */}
                          <div className="mb-6">
                            <GroupedMultiSelect
                              label="Company Values *"
                              options={CULTURAL_VALUES}
                              selected={formData.values || []}
                              onChange={vals => setFormData({...formData, values: vals})}
                              placeholder="Select 4-6 core values..."
                              maxSelections={6}
                            />
                            <p className="text-sm text-gray-500 mt-1">Choose values that match candidate expectations for accurate matching</p>
                          </div>
                          
                          {/* Culture Description */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Culture Description</label>
                            <textarea 
                              value={formData.cultureDescription || ''}
                              onChange={e => setFormData({...formData, cultureDescription: e.target.value})}
                              rows={5}
                              placeholder="Describe your team dynamics, collaboration style, and cultural norms..."
                              className="w-full p-3 border border-gray-300 rounded-lg resize-vertical"
                            />
                            <p className="text-sm text-gray-500 mt-1">How do you work together? What's your team culture like?</p>
                          </div>
                          
                          {/* Work Environment */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Work Environment</label>
                            <textarea 
                              value={formData.workEnvironment || ''}
                              onChange={e => setFormData({...formData, workEnvironment: e.target.value})}
                              rows={4}
                              placeholder="Describe a typical day at your company..."
                              className="w-full p-3 border border-gray-300 rounded-lg resize-vertical"
                            />
                            <p className="text-sm text-gray-500 mt-1">Paint a picture of the day-to-day atmosphere</p>
                          </div>
                          
                          {/* Desired Traits - USE CONSTANT */}
                          <div className="mb-6">
                            <GroupedMultiSelect
                              label="Traits We Look For"
                              options={ALL_CHARACTER_TRAITS}
                              selected={formData.desiredTraits || []}
                              onChange={vals => setFormData({...formData, desiredTraits: vals})}
                              placeholder="Select up to 5 traits..."
                              maxSelections={5}
                            />
                            <p className="text-sm text-gray-500 mt-1">Character traits that align with your culture</p>
                          </div>
                          
                          {/* Diversity Statement */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Diversity & Inclusion Statement</label>
                            <textarea 
                              value={formData.diversityStatement || ''}
                              onChange={e => setFormData({...formData, diversityStatement: e.target.value})}
                              rows={3}
                              placeholder="Your commitment to building a diverse and inclusive workplace..."
                              className="w-full p-3 border border-gray-300 rounded-lg resize-vertical"
                            />
                          </div>
                        </div>

                        {/* Section 4: Perks & Benefits */}
                        <div className="border-t border-gray-200 pt-8 mt-8">
                          <h2 className="text-2xl font-bold mb-6">Perks & Benefits</h2>
                          
                          {/* Perks - USE CONSTANT */}
                          <div className="mb-6">
                            <GroupedMultiSelect
                              label="Perks & Benefits *"
                              options={PERKS_CATEGORIES}  // This shows grouped perks
                              selected={formData.perks || []}
                              onChange={vals => setFormData({...formData, perks: vals})}
                              placeholder="Select all that apply..."
                              grouped={true} // Fixed: Added grouped prop
                            />
                            <p className="text-sm text-gray-500 mt-1">Select from standard benefits to ensure matching works</p>
                          </div>
                          
                          {/* Benefits Description */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Benefits Package Details</label>
                            <textarea 
                              value={formData.benefitsDescription || ''}
                              onChange={e => setFormData({...formData, benefitsDescription: e.target.value})}
                              rows={5}
                              placeholder="Describe your health insurance, 401k match, parental leave, etc. in detail..."
                              className="w-full p-3 border border-gray-300 rounded-lg resize-vertical"
                            />
                            <p className="text-sm text-gray-500 mt-1">Give candidates the full picture of what you offer</p>
                          </div>
                          
                          {/* Remote Policy - USE CONSTANT */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Remote Work Policy *</label>
                            <select 
                              value={formData.remotePolicy || ''}
                              onChange={e => setFormData({...formData, remotePolicy: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                              required
                            >
                              <option value="">Select policy...</option>
                              {REMOTE_POLICIES.map(policy => (
                                <option key={policy} value={policy}>
                                  {policy} - {REMOTE_POLICY_DESCRIPTIONS[policy]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Section 5: Company Details */}
                        <div className="border-t border-gray-200 pt-8 mt-8">
                          <h2 className="text-2xl font-bold mb-6">Company Details</h2>
                          
                          <div className="grid grid-cols-2 gap-6">
                            {/* Team Size */}
                            <div>
                              <label className="block text-sm font-semibold mb-2">Team Size *</label>
                              <input 
                                type="number" 
                                value={formData.teamSize || ''}
                                onChange={e => setFormData({...formData, teamSize: parseInt(e.target.value) || 0})}
                                min={1}
                                placeholder="e.g., 25"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                required
                              />
                              <p className="text-sm text-gray-500 mt-1">Current number of employees</p>
                            </div>
                            
                            {/* Founded Year */}
                            <div>
                              <label className="block text-sm font-semibold mb-2">Founded Year *</label>
                              <input 
                                type="number" 
                                value={formData.foundedYear || ''}
                                onChange={e => setFormData({...formData, foundedYear: parseInt(e.target.value) || 0})}
                                min={1800}
                                max={new Date().getFullYear()}
                                placeholder="e.g., 2020"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                required
                              />
                            </div>
                          </div>
                          
                          {/* Headquarters */}
                          <div className="mt-6">
                            <label className="block text-sm font-semibold mb-2">Headquarters Location *</label>
                            <input 
                              type="text" 
                              value={formData.headquartersLocation || ''}
                              onChange={e => setFormData({...formData, headquartersLocation: e.target.value})}
                              placeholder="e.g., San Francisco, CA"
                              className="w-full p-3 border border-gray-300 rounded-lg"
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6 mt-6">
                            {/* Company Size Range - USE CONSTANT */}
                            <div>
                              <label className="block text-sm font-semibold mb-2">Company Size Range</label>
                              <select 
                                value={formData.companySizeRange || ''}
                                onChange={e => setFormData({...formData, companySizeRange: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                              >
                                <option value="">Select range...</option>
                                {COMPANY_SIZE_RANGES.map(range => (
                                  <option key={range} value={range}>
                                    {COMPANY_SIZE_DESCRIPTIONS[range]}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Funding Stage - USE CONSTANT */}
                            <div>
                              <label className="block text-sm font-semibold mb-2">Funding Stage</label>
                              <select 
                                value={formData.fundingStage || ''}
                                onChange={e => setFormData({...formData, fundingStage: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                              >
                                <option value="">Select stage...</option>
                                {FUNDING_STAGES.map(stage => (
                                  <option key={stage} value={stage}>{stage}</option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Growth Stage - USE CONSTANT */}
                            <div>
                              <label className="block text-sm font-semibold mb-2">Growth Stage</label>
                              <select 
                                value={formData.growthStage || ''}
                                onChange={e => setFormData({...formData, growthStage: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                              >
                                <option value="">Select stage...</option>
                                {GROWTH_STAGES.map(stage => (
                                  <option key={stage} value={stage}>
                                    {stage} - {GROWTH_STAGE_DESCRIPTIONS[stage]}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Section 6: Tech & Social */}
                        <div className="border-t border-gray-200 pt-8 mt-8">
                          <h2 className="text-2xl font-bold mb-6">Tech Stack & Social</h2>
                          
                          {/* Tech Stack - USE CONSTANT */}
                          <div className="mb-6">
                            <GroupedMultiSelect
                              label="Tech Stack"
                              options={COMMON_TECH_STACK}
                              selected={formData.techStack || []}
                              onChange={vals => setFormData({...formData, techStack: vals})}
                              placeholder="Select primary technologies..."
                            />
                            <p className="text-sm text-gray-500 mt-1">What technologies does your team use?</p>
                          </div>
                          
                          {/* Social Media Links */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Social Media</label>
                            <div className="space-y-3">
                              <input 
                                type="url" 
                                value={formData.socialMedia?.linkedin || ''}
                                onChange={e => setFormData({
                                  ...formData, 
                                  socialMedia: {...(formData.socialMedia || {}), linkedin: e.target.value}
                                })}
                                placeholder="LinkedIn URL"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                              
                              <input 
                                type="url" 
                                value={formData.socialMedia?.twitter || ''}
                                onChange={e => setFormData({
                                  ...formData, 
                                  socialMedia: {...(formData.socialMedia || {}), twitter: e.target.value}
                                })}
                                placeholder="Twitter/X URL"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                              
                              <input 
                                type="url" 
                                value={formData.socialMedia?.github || ''}
                                onChange={e => setFormData({
                                  ...formData, 
                                  socialMedia: {...(formData.socialMedia || {}), github: e.target.value}
                                })}
                                placeholder="GitHub URL"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                              />
                            </div>
                          </div>
                          
                          {/* Company Photos */}
                          <div>
                            <label className="block text-sm font-semibold mb-2">Company Photos</label>
                            <div className="space-y-2">
                              {(formData.companyPhotos || []).map((url, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                  <input 
                                    type="url" 
                                    value={url}
                                    onChange={e => {
                                      const newPhotos = [...(formData.companyPhotos || [])];
                                      newPhotos[i] = e.target.value;
                                      setFormData({...formData, companyPhotos: newPhotos});
                                    }}
                                    placeholder="Photo URL"
                                    className="flex-1 p-3 border border-gray-300 rounded-lg"
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newPhotos = formData.companyPhotos?.filter((_, idx) => idx !== i);
                                      setFormData({...formData, companyPhotos: newPhotos});
                                    }}
                                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              <button 
                                type="button"
                                onClick={() => setFormData({
                                  ...formData, 
                                  companyPhotos: [...(formData.companyPhotos || []), '']
                                })}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                              >
                                + Add Photo
                              </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Add URLs to photos of your office, team, or events</p>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button onClick={handleSubmit} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black flex items-center shadow-lg transition-transform hover:-translate-y-0.5">
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
