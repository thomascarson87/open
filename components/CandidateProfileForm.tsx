
import React, { useState } from 'react';
import { CandidateProfile } from '../types';
import CandidateOnboarding from './CandidateOnboarding';
import CandidateProfileTabs from './CandidateProfileTabs';

interface Props {
  profile: CandidateProfile;
  onSave: (p: CandidateProfile) => void;
}

const CandidateProfileForm: React.FC<Props> = ({ profile, onSave }) => {
  // Determine if profile is "new" based on missing critical fields
  // In a real app, this might be a flag in the DB like 'onboarding_completed'
  const isNewProfile = !profile.name || !profile.headline || (profile.skills.length === 0);
  
  const [isOnboarding, setIsOnboarding] = useState(isNewProfile);
  const [formData, setFormData] = useState<CandidateProfile>(profile);

  const handleUpdate = (data: Partial<CandidateProfile>) => {
    const updated = { ...formData, ...data };
    setFormData(updated);
    // Optional: auto-save debounced here
  };

  const handleCompleteOnboarding = () => {
    onSave(formData);
    setIsOnboarding(false);
  };

  const handleSave = () => {
    onSave(formData);
  };

  if (isOnboarding) {
    return (
      <CandidateOnboarding 
        profile={formData} 
        onUpdate={handleUpdate} 
        onComplete={handleCompleteOnboarding} 
      />
    );
  }

  return (
    <CandidateProfileTabs 
      profile={formData} 
      onUpdate={handleUpdate} 
      onSave={handleSave} 
    />
  );
};

export default CandidateProfileForm;
