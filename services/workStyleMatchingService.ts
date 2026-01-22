import { 
  WorkStylePreferences, 
  TeamCollaborationPreferences,
  CandidateProfile,
  JobPosting,
  CompanyProfile,
  MatchDetails
} from '../types';
import { 
  WORK_STYLE_MATCH_WEIGHTS, 
  TEAM_COLLAB_MATCH_WEIGHTS 
} from '../constants/workStyleData';

export function calculateWorkStyleMatch(
  candidatePrefs: WorkStylePreferences | undefined,
  jobRequirements: Partial<WorkStylePreferences> | undefined,
  companyDefaults: Partial<WorkStylePreferences> | undefined,
  dealBreakers: string[] = []
): MatchDetails {
  if (!candidatePrefs) {
    return { score: 50, reason: 'No work style preferences specified' };
  }

  const requirements = { ...companyDefaults, ...jobRequirements };
  
  if (Object.keys(requirements).length === 0) {
    return { score: 50, reason: 'No work style requirements specified' };
  }

  let totalWeight = 0;
  let weightedScore = 0;
  const matches: string[] = [];
  const mismatches: string[] = [];
  const dealBreakersFailed: string[] = [];

  Object.entries(requirements).forEach(([key, reqValue]) => {
    if (!reqValue) return;
    
    const candValue = candidatePrefs[key as keyof WorkStylePreferences];
    const weight = WORK_STYLE_MATCH_WEIGHTS[key as keyof typeof WORK_STYLE_MATCH_WEIGHTS] || 0.5;
    
    totalWeight += weight;
    
    if (candValue === reqValue) {
      weightedScore += weight * 100;
      matches.push(key);
    } else if (!candValue) {
      weightedScore += weight * 50;
    } else {
      weightedScore += weight * 0;
      mismatches.push(key);
      
      if (dealBreakers.includes(key)) {
        dealBreakersFailed.push(key);
      }
    }
  });

  const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;
  
  let reason = '';
  if (matches.length > 0) reason += `Matches: ${matches.length}. `;
  if (mismatches.length > 0) reason += `Mismatches: ${mismatches.length}.`;
  if (dealBreakersFailed.length > 0) reason = `⚠️ Dealbreaker mismatch: ${dealBreakersFailed[0]}`;
  
  return {
    score: dealBreakersFailed.length > 0 ? 0 : score,
    reason: reason || 'Partial data'
  };
}

export function calculateTeamCollabMatch(
  candidatePrefs: TeamCollaborationPreferences | undefined,
  jobRequirements: Partial<TeamCollaborationPreferences> | undefined,
  companyDefaults: Partial<TeamCollaborationPreferences> | undefined,
  dealBreakers: string[] = []
): MatchDetails {
  if (!candidatePrefs) {
    return { score: 50, reason: 'No team preferences specified' };
  }

  const requirements = { ...companyDefaults, ...jobRequirements };
  
  if (Object.keys(requirements).length === 0) {
    return { score: 50, reason: 'No team requirements specified' };
  }

  let totalWeight = 0;
  let weightedScore = 0;
  const dealBreakersFailed: string[] = [];

  Object.entries(requirements).forEach(([key, reqValue]) => {
    if (!reqValue) return;
    
    const candValue = (candidatePrefs as any)[key === 'teamSizePreference' ? 'teamSizePreference' : (key === 'orgSizePreference' ? 'orgSizePreference' : key)];
    const weight = (TEAM_COLLAB_MATCH_WEIGHTS as any)[key] || 0.5;
    
    totalWeight += weight;
    
    if (candValue === reqValue) {
      weightedScore += weight * 100;
    } else if (!candValue) {
      weightedScore += weight * 50;
    } else {
      if (dealBreakers.includes(key)) {
        dealBreakersFailed.push(key);
      }
    }
  });

  const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;
  
  return {
    score: dealBreakersFailed.length > 0 ? 0 : score,
    reason: dealBreakersFailed.length > 0 ? `⚠️ Dealbreaker: ${dealBreakersFailed[0]}` : 'Based on collaboration style'
  };
}

export function calculateWorkEnvironmentMatch(
  candidate: CandidateProfile,
  job: JobPosting,
  company: CompanyProfile | null
): { workStyle: MatchDetails; teamFit: MatchDetails } {
  const workStyle = calculateWorkStyleMatch(
    candidate.workStylePreferences,
    job.workStyleRequirements,
    company?.workStyleCulture,
    // Fixed: Property name corrected from workStyleDealBreakers to workStyleDealbreakers
    job.workStyleDealbreakers
  );

  const teamFit = calculateTeamCollabMatch(
    candidate.teamCollaborationPreferences,
    job.teamRequirements,
    company?.teamStructure ? {
      teamDistribution: company.teamStructure.teamDistribution,
      // Fixed: Type casting for collaborationFrequency mapping
      collaborationFrequency: company.teamStructure.defaultCollaboration as any
    } : undefined,
    // Fixed: Property name corrected from teamDealBreakers to teamDealbreakers
    job.teamDealbreakers
  );

  return { workStyle, teamFit };
}

// =============================================================================
// MANAGEMENT FIT MATCHING
// =============================================================================

interface ManagementMatchInput {
  preferredLeadershipStyle?: string;
  preferredFeedbackFrequency?: string;
  preferredCommunicationStyle?: string;
  preferredMeetingCulture?: string;
  preferredConflictResolution?: string;
  preferredMentorshipStyle?: string;
  growthGoals?: string;
}

interface HMManagementPrefs {
  leadership_style?: string;
  feedback_frequency?: string;
  communication_preference?: string;
  meeting_culture?: string;
  conflict_resolution?: string;
  mentorship_approach?: string;
  growth_expectation?: string;
}

export function calculateManagementFitScore(
  candidatePrefs: ManagementMatchInput,
  hmPrefs: HMManagementPrefs | null | undefined
): MatchDetails {
  // No HM prefs = neutral score
  if (!hmPrefs) {
    return { score: 70, reason: 'Manager preferences not specified' };
  }

  // Define field pairs (candidate field -> HM field)
  const fieldPairs = [
    ['preferredLeadershipStyle', 'leadership_style'],
    ['preferredFeedbackFrequency', 'feedback_frequency'],
    ['preferredCommunicationStyle', 'communication_preference'],
    ['preferredMeetingCulture', 'meeting_culture'],
    ['preferredConflictResolution', 'conflict_resolution'],
    ['preferredMentorshipStyle', 'mentorship_approach'],
    ['growthGoals', 'growth_expectation'],
  ] as const;

  let matchCount = 0;
  let totalCompared = 0;
  const mismatches: string[] = [];

  for (const [candField, hmField] of fieldPairs) {
    const candValue = candidatePrefs[candField as keyof ManagementMatchInput];
    const hmValue = hmPrefs[hmField as keyof HMManagementPrefs];

    // Only compare if both have values
    if (candValue && hmValue) {
      totalCompared++;
      if (candValue === hmValue) {
        matchCount++;
      } else {
        // Add human-readable mismatch
        const labels: Record<string, string> = {
          preferredLeadershipStyle: 'leadership',
          preferredFeedbackFrequency: 'feedback',
          preferredCommunicationStyle: 'communication',
          preferredMeetingCulture: 'meetings',
          preferredConflictResolution: 'conflict handling',
          preferredMentorshipStyle: 'mentorship',
          growthGoals: 'growth path',
        };
        mismatches.push(labels[candField] || candField);
      }
    }
  }

  // Calculate score
  // Base 40, up to 60 bonus points based on match rate
  let score: number;
  if (totalCompared === 0) {
    score = 70; // No data to compare
  } else {
    score = Math.round(40 + (60 * matchCount / totalCompared));
  }

  // Generate reason
  let reason: string;
  if (totalCompared === 0) {
    reason = 'Insufficient preference data';
  } else if (matchCount === totalCompared) {
    reason = 'Excellent management style alignment';
  } else if (mismatches.length <= 2) {
    reason = `Different preferences: ${mismatches.join(', ')}`;
  } else {
    reason = `${mismatches.length} preference differences`;
  }

  return { score, reason };
}
