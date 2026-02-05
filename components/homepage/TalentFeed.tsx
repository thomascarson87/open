import React, { useState, useEffect } from 'react';
import { CandidateProfile, CompanyProfile } from '../../types';
import {
  getRecommendedCandidates,
  getRecentCandidates,
  CompanyMatchCandidate
} from '../../services/companyMatchingService';
import EnrichedCandidateCard from '../EnrichedCandidateCard';
import { Loader2, Users, Sparkles, Clock } from 'lucide-react';

type FeedMode = 'latest' | 'recommended';

interface TalentFeedProps {
  companyId: string;
  companyProfile: CompanyProfile;
  onViewProfile: (candidate: CandidateProfile) => void;
  onUnlock: (id: string) => void | Promise<{ success: boolean; error?: { message: string; code: string } }>;
  onSchedule: (id: string) => void;
  onMessage: (id: string) => void;
}

const TalentFeed: React.FC<TalentFeedProps> = ({
  companyId,
  companyProfile,
  onViewProfile,
  onUnlock,
  onSchedule,
  onMessage,
}) => {
  const [feedMode, setFeedMode] = useState<FeedMode>('latest');

  // Latest candidates state
  const [latestCandidates, setLatestCandidates] = useState<CandidateProfile[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestPage, setLatestPage] = useState(0);
  const [hasMoreLatest, setHasMoreLatest] = useState(true);
  const [loadingMoreLatest, setLoadingMoreLatest] = useState(false);

  // Recommended candidates state
  const [recommendedCandidates, setRecommendedCandidates] = useState<CompanyMatchCandidate[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedLoaded, setRecommendedLoaded] = useState(false);

  // Load latest candidates on mount
  useEffect(() => {
    loadLatestCandidates(0);
  }, []);

  // Load recommended when tab is switched to it (lazy load)
  useEffect(() => {
    if (feedMode === 'recommended' && !recommendedLoaded) {
      loadRecommendedCandidates();
    }
  }, [feedMode, recommendedLoaded]);

  const loadLatestCandidates = async (page: number, append: boolean = false) => {
    if (page === 0) {
      setLatestLoading(true);
    } else {
      setLoadingMoreLatest(true);
    }

    try {
      const { candidates, hasMore } = await getRecentCandidates(page, 9);

      if (append) {
        setLatestCandidates(prev => [...prev, ...candidates]);
      } else {
        setLatestCandidates(candidates);
      }

      setHasMoreLatest(hasMore);
      setLatestPage(page);
    } catch (error) {
      console.error('Failed to load latest candidates:', error);
      if (!append) {
        setLatestCandidates([]);
      }
    } finally {
      setLatestLoading(false);
      setLoadingMoreLatest(false);
    }
  };

  const loadRecommendedCandidates = async () => {
    setRecommendedLoading(true);
    try {
      // Fetch more candidates for the full feed view
      const candidates = await getRecommendedCandidates(companyId, 20);
      setRecommendedCandidates(candidates);
      setRecommendedLoaded(true);
    } catch (error) {
      console.error('Failed to load recommended candidates:', error);
      setRecommendedCandidates([]);
    } finally {
      setRecommendedLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (feedMode === 'latest') {
      loadLatestCandidates(latestPage + 1, true);
    }
  };

  const isLoading = feedMode === 'latest' ? latestLoading : recommendedLoading;
  const candidates = feedMode === 'latest' ? latestCandidates : recommendedCandidates;
  const hasMore = feedMode === 'latest' ? hasMoreLatest : false; // Recommended doesn't paginate
  const loadingMore = feedMode === 'latest' ? loadingMoreLatest : false;

  return (
    <section className="mt-10">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">Talent Feed</h2>

        {/* Pill Toggle */}
        <div className="flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setFeedMode('latest')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              feedMode === 'latest'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Latest</span>
          </button>
          <button
            onClick={() => setFeedMode('recommended')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
              feedMode === 'recommended'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Recommended</span>
          </button>
        </div>
      </div>

      {/* Subtitle based on mode */}
      <p className="text-sm text-gray-500 mb-6">
        {feedMode === 'latest'
          ? 'Recently added candidates on the platform'
          : `Candidates matched to ${companyProfile.companyName || 'your company'}'s culture, industry, and values`
        }
      </p>

      {/* Loading State */}
      {isLoading && candidates.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white rounded-[2rem] border border-gray-100 h-[320px] animate-pulse"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="flex gap-2 pt-4">
                  <div className="h-8 bg-gray-100 rounded-lg flex-1" />
                  <div className="h-8 bg-gray-100 rounded-lg flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && candidates.length === 0 && (
        <div className="bg-gray-50 rounded-[1.5rem] p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            {feedMode === 'latest' ? 'No Candidates Yet' : 'No Matches Found'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {feedMode === 'latest'
              ? 'New candidates will appear here as they join the platform.'
              : 'Complete your company profile to improve matching accuracy.'
            }
          </p>
        </div>
      )}

      {/* Candidate Grid */}
      {candidates.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {candidates.map(candidate => {
            // For recommended mode, pass match result
            const matchResult = feedMode === 'recommended' && 'companyMatchBreakdown' in candidate
              ? {
                  overallScore: (candidate as CompanyMatchCandidate).companyMatchScore,
                  details: {
                    skills: (candidate as CompanyMatchCandidate).companyMatchBreakdown.details.skills,
                    culture: (candidate as CompanyMatchCandidate).companyMatchBreakdown.details.culture,
                    salary: (candidate as CompanyMatchCandidate).companyMatchBreakdown.details.compensation,
                    // Map other fields as needed
                    seniority: { score: 100, reason: '' },
                    location: (candidate as CompanyMatchCandidate).companyMatchBreakdown.details.location,
                    workMode: { score: 100, reason: '' },
                    contract: { score: 100, reason: '' },
                    perks: { score: 100, reason: '' },
                    industry: (candidate as CompanyMatchCandidate).companyMatchBreakdown.details.industry,
                    traits: { score: 100, reason: '' },
                    performance: { score: 100, reason: '' },
                    impact: { score: 100, reason: '' },
                    workStyle: { score: 100, reason: '' },
                    teamFit: { score: 100, reason: '' },
                    companySize: (candidate as CompanyMatchCandidate).companyMatchBreakdown.details.stageFit,
                    language: { score: 100, reason: '' },
                    timezone: { score: 100, reason: '' },
                    visa: { score: 100, reason: '' },
                    relocation: { score: 100, reason: '' },
                  },
                  dealBreakers: [],
                  recommendations: [],
                }
              : undefined;

            return (
              <EnrichedCandidateCard
                key={candidate.id}
                candidate={{
                  ...candidate,
                  matchScore: feedMode === 'recommended' && 'companyMatchScore' in candidate
                    ? (candidate as CompanyMatchCandidate).companyMatchScore
                    : undefined
                }}
                matchResult={matchResult}
                onViewProfile={onViewProfile}
                onUnlock={onUnlock}
                onSchedule={onSchedule}
                onMessage={onMessage}
                showMatchBreakdown={feedMode === 'recommended'}
              />
            );
          })}
        </div>
      )}

      {/* Load More Button (only for Latest mode) */}
      {hasMore && candidates.length > 0 && (
        <div className="mt-10 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More Candidates</span>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default TalentFeed;
