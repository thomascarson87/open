import React from 'react';
import { CandidateProfile, CompanyProfile } from '../../types';
import HeroActionCards from './HeroActionCards';
import TalentFeed from './TalentFeed';

interface CompanyHomepageProps {
  companyProfile: CompanyProfile;
  companyId: string;
  onViewProfile: (candidate: CandidateProfile) => void;
  onUnlock: (id: string) => void | Promise<{ success: boolean; error?: { message: string; code: string } }>;
  onSchedule: (id: string) => void;
  onMessage: (id: string) => void;
  onNavigateToCreateJob: () => void;
  onNavigateToTalentMatcher: () => void;
}

const CompanyHomepage: React.FC<CompanyHomepageProps> = ({
  companyProfile,
  companyId,
  onViewProfile,
  onUnlock,
  onSchedule,
  onMessage,
  onNavigateToCreateJob,
  onNavigateToTalentMatcher,
}) => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Hero Action Cards */}
      <HeroActionCards
        onPostJob={onNavigateToCreateJob}
        onFindTalent={onNavigateToTalentMatcher}
      />

      {/* Unified Talent Feed with Toggle */}
      <TalentFeed
        companyId={companyId}
        companyProfile={companyProfile}
        onViewProfile={onViewProfile}
        onUnlock={onUnlock}
        onSchedule={onSchedule}
        onMessage={onMessage}
      />
    </div>
  );
};

export default CompanyHomepage;
