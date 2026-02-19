import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { CandidateProfile } from '../../types';
import {
  calculateProfileStrength,
  getCandidateVisibility,
  getCandidateSkillPositions,
  getSkillUnlockOpportunities,
  ProfileStrength,
  CandidateVisibility,
  SkillsMarketData,
  SkillUnlockOpportunity
} from '../../services/marketIntelligence';
import { mapCandidateFromDB } from '../../services/dataMapperService';
import { PositionMetrics, SkillsLandscape, CultureFitInsights } from '../../components/market-pulse';

const MarketPulse: React.FC = () => {
  const { user } = useAuth();

  // Position metrics state
  const [isLoadingPosition, setIsLoadingPosition] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [profileStrength, setProfileStrength] = useState<ProfileStrength | null>(null);
  const [visibility, setVisibility] = useState<CandidateVisibility | null>(null);

  // Skills landscape state
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);
  const [skillsMarketData, setSkillsMarketData] = useState<SkillsMarketData | null>(null);
  const [unlockOpportunities, setUnlockOpportunities] = useState<SkillUnlockOpportunity[]>([]);

  const [error, setError] = useState<string | null>(null);

  // Fetch position metrics (profile, strength, visibility)
  useEffect(() => {
    const fetchPositionData = async () => {
      if (!user?.id) {
        setIsLoadingPosition(false);
        return;
      }

      setIsLoadingPosition(true);
      setError(null);

      try {
        // Fetch candidate profile
        const { data: profileData, error: profileError } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Unable to load profile data');
          setIsLoadingPosition(false);
          return;
        }

        if (profileData) {
          const mappedProfile = mapCandidateFromDB(profileData);
          setCandidateProfile(mappedProfile);

          // Calculate profile strength
          const strength = calculateProfileStrength(mappedProfile);
          setProfileStrength(strength);
        }

        // Fetch visibility metrics
        const visibilityData = await getCandidateVisibility(user.id);
        setVisibility(visibilityData);

      } catch (err) {
        console.error('Error fetching position data:', err);
        setError('Something went wrong');
      } finally {
        setIsLoadingPosition(false);
      }
    };

    fetchPositionData();
  }, [user?.id]);

  // Fetch skills landscape data (separate effect for potentially slower query)
  useEffect(() => {
    const fetchSkillsData = async () => {
      if (!user?.id) {
        setIsLoadingSkills(false);
        return;
      }

      setIsLoadingSkills(true);

      try {
        // Fetch skills market data and unlock opportunities in parallel
        const [marketData, opportunities] = await Promise.all([
          getCandidateSkillPositions(user.id),
          getSkillUnlockOpportunities(user.id)
        ]);

        setSkillsMarketData(marketData);
        setUnlockOpportunities(opportunities);

      } catch (err) {
        console.error('Error fetching skills data:', err);
        // Don't set error - skills section can fail independently
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkillsData();
  }, [user?.id]);

  // Navigate to profile edit with skill pre-filled
  const handleAddSkill = (skill: string) => {
    // Navigate to profile page - the skill can be added there
    // Using URL params to potentially pre-fill (would need profile page support)
    window.history.pushState({}, '', '?view=profile&tab=skills');
    window.dispatchEvent(new Event('popstate'));
  };

  // Navigate to profile edit section
  const handleEditProfile = (section?: string) => {
    const tab = section || 'profile';
    window.history.pushState({}, '', `?view=profile&tab=${tab}`);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-primary">Market Pulse</h1>
        <p className="text-muted mt-1">Know your signal strength.</p>
      </div>

      {/* Error State */}
      {error && !isLoadingPosition && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Your Position Section */}
      <section className="mb-8">
        <h2 className="font-heading text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
          Your Position
        </h2>
        <PositionMetrics
          profileStrength={profileStrength}
          visibility={visibility}
          isLoading={isLoadingPosition}
        />
      </section>

      {/* Skills Landscape Section */}
      <section className="mb-8">
        <h2 className="font-heading text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
          Skills Landscape
        </h2>
        <SkillsLandscape
          marketData={skillsMarketData}
          unlockOpportunities={unlockOpportunities}
          isLoading={isLoadingSkills}
          onAddSkill={handleAddSkill}
        />
      </section>

      {/* Culture Fit Insights Section */}
      <section className="mb-8 pt-8 border-t border-border">
        <h2 className="font-heading text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
          Culture Fit
        </h2>
        <CultureFitInsights
          candidateProfile={candidateProfile}
          candidateId={user?.id || ''}
          isLoading={isLoadingPosition}
          onEditProfile={handleEditProfile}
        />
      </section>

      {/* Coming Soon Sections */}
      <div className="bg-white dark:bg-surface rounded-[2.5rem] border border-border shadow-sm p-12 flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-center max-w-md">
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-4">More insights coming soon</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-muted">Salary Benchmarks, Role Trends</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPulse;
