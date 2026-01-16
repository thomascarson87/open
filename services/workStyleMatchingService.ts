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
