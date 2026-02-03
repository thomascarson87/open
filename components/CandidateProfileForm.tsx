import React, { useState, useCallback, useRef } from 'react';
import { CandidateProfile } from '../types';
import CandidateOnboarding from './CandidateOnboarding';
import CandidateProfileTabs from './CandidateProfileTabs';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

/**
 * Maps frontend CandidateProfile fields to database column names.
 * Only includes fields that are defined (not undefined) to avoid overwriting with nulls.
 */
function mapCandidateToDatabase(profile: Partial<CandidateProfile>): Record<string, any> {
  const mapping: Record<string, any> = {};
  
  // Basic Info
  if (profile.name !== undefined) mapping.name = profile.name;
  if (profile.headline !== undefined) mapping.headline = profile.headline;
  if (profile.email !== undefined) mapping.email = profile.email;
  if (profile.location !== undefined) mapping.location = profile.location;
  if (profile.bio !== undefined) mapping.bio = profile.bio;
  if (profile.status !== undefined) mapping.status = profile.status;
  if (profile.ambitions !== undefined) mapping.ambitions = profile.ambitions;
  
  // Media
  if (profile.avatar_url !== undefined) mapping.avatar_url = profile.avatar_url;
  if (profile.avatarUrls !== undefined) mapping.avatar_urls = profile.avatarUrls;
  if (profile.videoIntroUrl !== undefined) mapping.video_intro_url = profile.videoIntroUrl;
  
  // Skills - store in both fields for compatibility
  if (profile.skills !== undefined) {
    mapping.skills = profile.skills;
    mapping.skills_with_levels = profile.skills;
  }
  
  // CRITICAL Array Fields (camelCase → snake_case)
  if (profile.characterTraits !== undefined) mapping.character_traits = profile.characterTraits;
  if (profile.values !== undefined) mapping.values_list = profile.values;
  if (profile.preferredWorkMode !== undefined) mapping.preferred_work_mode = profile.preferredWorkMode;
  if (profile.desiredPerks !== undefined) mapping.desired_perks = profile.desiredPerks;
  if (profile.nonNegotiables !== undefined) mapping.non_negotiables = profile.nonNegotiables;
  if (profile.contractTypes !== undefined) mapping.contract_types = profile.contractTypes;
  if (profile.interestedIndustries !== undefined) mapping.interested_industries = profile.interestedIndustries;
  if (profile.desiredSeniority !== undefined) mapping.desired_seniority = profile.desiredSeniority;
  
  // JSONB Objects
  if (profile.workStylePreferences !== undefined) mapping.work_style_preferences = profile.workStylePreferences;
  if (profile.teamCollaborationPreferences !== undefined) mapping.team_collaboration_preferences = profile.teamCollaborationPreferences;
  if (profile.experience !== undefined) mapping.experience = profile.experience;
  if (profile.portfolio !== undefined) mapping.portfolio = profile.portfolio;
  if (profile.references !== undefined) mapping.references_list = profile.references;
  if (profile.languages !== undefined) mapping.languages = profile.languages;
  
  // Impact Scope
  if (profile.currentImpactScope !== undefined) mapping.current_impact_scope = profile.currentImpactScope;
  if (profile.desiredImpactScopes !== undefined) mapping.desired_impact_scope = profile.desiredImpactScopes;
  
  // Compensation
  if (profile.salaryMin !== undefined) mapping.salary_min = profile.salaryMin;
  if (profile.salaryMax !== undefined) mapping.salary_max = profile.salaryMax;
  if (profile.salaryCurrency !== undefined) mapping.salary_currency = profile.salaryCurrency;
  if (profile.salaryExpectation !== undefined) mapping.salary_expectation = profile.salaryExpectation;
  if (profile.openToEquity !== undefined) mapping.open_to_equity = profile.openToEquity;
  if (profile.currentBonuses !== undefined) mapping.current_bonuses = profile.currentBonuses;
  
  // Work Preferences
  if (profile.noticePeriod !== undefined) mapping.notice_period = profile.noticePeriod;
  if (profile.timezone !== undefined) mapping.timezone = profile.timezone;
  if (profile.preferredTimezone !== undefined) mapping.preferred_timezone = profile.preferredTimezone;
  if (profile.preferredCompanySize !== undefined) mapping.preferred_company_size = profile.preferredCompanySize;
  if (profile.willingToRelocate !== undefined) mapping.willing_to_relocate = profile.willingToRelocate;
  if (profile.legalStatus !== undefined) mapping.legal_status = profile.legalStatus;
  
  // Education
  if (profile.education_level !== undefined) mapping.education_level = profile.education_level;
  if (profile.education_field !== undefined) mapping.education_field = profile.education_field;
  if (profile.education_institution !== undefined) mapping.education_institution = profile.education_institution;
  if (profile.education_graduation_year !== undefined) mapping.education_graduation_year = profile.education_graduation_year;
  
  // Personality
  if (profile.myers_briggs !== undefined) mapping.myers_briggs = profile.myers_briggs;
  if (profile.disc_profile !== undefined) mapping.disc_profile = profile.disc_profile;
  if (profile.enneagram_type !== undefined) mapping.enneagram_type = profile.enneagram_type;
  
  // Theme
  if (profile.themeColor !== undefined) mapping.theme_color = profile.themeColor;
  if (profile.themeFont !== undefined) mapping.theme_font = profile.themeFont;
  
  // Experience
  if (profile.totalYearsExperience !== undefined) mapping.total_years_experience = profile.totalYearsExperience;

  // Role taxonomy fields
  if (profile.currentSeniority !== undefined) mapping.current_seniority = profile.currentSeniority;
  if (profile.primaryRoleId !== undefined) mapping.primary_role_id = profile.primaryRoleId;
  if (profile.primaryRoleName !== undefined) mapping.primary_role_name = profile.primaryRoleName;
  if (profile.secondaryRoles !== undefined) mapping.secondary_roles = profile.secondaryRoles;
  if (profile.interestedRoles !== undefined) mapping.interested_roles = profile.interestedRoles;

  // Onboarding
  if (profile.onboarding_completed !== undefined) mapping.onboarding_completed = profile.onboarding_completed;

  // Availability
  if (profile.callReady !== undefined) mapping.call_ready = profile.callReady;
  if (profile.callLink !== undefined) mapping.call_link = profile.callLink;

  // Management Preferences
  if (profile.preferredLeadershipStyle !== undefined) mapping.preferred_leadership_style = profile.preferredLeadershipStyle;
  if (profile.preferredFeedbackFrequency !== undefined) mapping.preferred_feedback_frequency = profile.preferredFeedbackFrequency;
  if (profile.preferredCommunicationStyle !== undefined) mapping.preferred_communication_style = profile.preferredCommunicationStyle;
  if (profile.preferredMeetingCulture !== undefined) mapping.preferred_meeting_culture = profile.preferredMeetingCulture;
  if (profile.preferredConflictResolution !== undefined) mapping.preferred_conflict_resolution = profile.preferredConflictResolution;
  if (profile.preferredMentorshipStyle !== undefined) mapping.preferred_mentorship_style = profile.preferredMentorshipStyle;
  if (profile.growthGoals !== undefined) mapping.growth_goals = profile.growthGoals;

  // Always update timestamp
  mapping.updated_at = new Date().toISOString();
  
  return mapping;
}

interface Props {
  profile: CandidateProfile;
  onSave: (p: CandidateProfile) => void;
}

const CandidateProfileForm: React.FC<Props> = ({ profile, onSave }) => {
  const { user } = useAuth();
  
  // Determine if profile is "new" based on missing critical fields
  const isNewProfile = !profile.onboarding_completed && (!profile.name || !profile.headline || (profile.skills?.length === 0));
  
  const [isOnboarding, setIsOnboarding] = useState(isNewProfile);
  const [formData, setFormData] = useState<CandidateProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save refs
  // Use ReturnType<typeof setTimeout> to avoid NodeJS.Timeout missing member issues in browser environments
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdatesRef = useRef<Partial<CandidateProfile>>({});

  const handleUpdate = useCallback((data: Partial<CandidateProfile>) => {
    const updated = { ...formData, ...data };
    setFormData(updated);
    
    // Queue auto-save with debounce
    pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...data };
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (!user?.id || Object.keys(pendingUpdatesRef.current).length === 0) return;
      
      setSaveStatus('saving');
      const dbUpdates = mapCandidateToDatabase(pendingUpdatesRef.current);
      
      const { error } = await supabase
        .from('candidate_profiles')
        .update(dbUpdates)
        .eq('id', user.id);
      
      if (!error) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        pendingUpdatesRef.current = {};
      } else {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');
      }
    }, 2000);
  }, [formData, user?.id]);

  const handleCompleteOnboarding = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    const dbUpdates = mapCandidateToDatabase(formData);
    dbUpdates.onboarding_completed = true;
    
    const { error } = await supabase
      .from('candidate_profiles')
      .update(dbUpdates)
      .eq('id', user.id);
    
    setIsSaving(false);
    
    if (error) {
      console.error(' Onboarding save failed:', error);
      setSaveStatus('error');
      alert(`Failed to complete setup: ${error.message}`);
      return;
    }
    
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
    onSave({ ...formData, onboarding_completed: true });
  };

  // Save progress and exit onboarding (does NOT mark as complete)
  const handleSaveAndExit = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    setSaveStatus('saving');

    const dbUpdates = mapCandidateToDatabase(formData);
    // Don't set onboarding_completed - user wants to save progress but exit

    const { error } = await supabase
      .from('candidate_profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      console.error('Save & exit failed:', error);
      setSaveStatus('error');
      alert(`Failed to save progress: ${error.message}`);
      return;
    }

    setSaveStatus('saved');
    // Exit onboarding but keep onboarding_completed: false so they can continue later
    setIsOnboarding(false);
    onSave(formData);
    setIsOnboarding(false);
  };

  const handleSave = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    const dbUpdates = mapCandidateToDatabase(formData);
    
    const { error } = await supabase
      .from('candidate_profiles')
      .update(dbUpdates)
      .eq('id', user.id);
    
    setIsSaving(false);
    
    if (error) {
      console.error(' Save failed:', error);
      setSaveStatus('error');
      alert(`Failed to save: ${error.message}`);
      return;
    }
    
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
    onSave(formData);
  };

  return (
    <>
      {saveStatus !== 'idle' && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
          saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
          saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
          saveStatus === 'error' ? 'bg-red-100 text-red-700' : ''
        }`}>
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Save failed'}
        </div>
      )}

      {isOnboarding ? (
        <CandidateOnboarding
          profile={formData}
          onUpdate={handleUpdate}
          onComplete={handleCompleteOnboarding}
          onSaveExit={handleSaveAndExit}
          isSaving={isSaving}
        />
      ) : (
        <CandidateProfileTabs 
          profile={formData} 
          onUpdate={handleUpdate} 
          onSave={handleSave} 
          isSaving={isSaving}
        />
      )}
    </>
  );
};

export default CandidateProfileForm;
