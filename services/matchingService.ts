
import { CandidateProfile, JobPosting, MatchBreakdown, JobType, WorkMode, JobSkill, TalentSearchCriteria, MatchDetails, Skill } from '../types';

interface VerificationBoost {
  skillsMultiplier: number;
  traitsMultiplier: number;
  performanceScores: {
    communication: number;
    problemSolving: number;
    reliability: number;
    collaboration: number;
  };
  verifiedSkills: string[];
}

function calculateVerificationBoost(candidate: CandidateProfile): VerificationBoost {
  const stats = candidate.verification_stats;
  
  if (!stats || stats.total_verifications === 0) {
    return {
      skillsMultiplier: 1.0,
      traitsMultiplier: 1.0,
      performanceScores: {
        communication: 5,
        problemSolving: 5,
        reliability: 5,
        collaboration: 5
      },
      verifiedSkills: []
    };
  }
  
  // Boost multipliers based on verification count
  const verificationTier = Math.min(stats.total_verifications, 5);
  const skillsMultiplier = 1.0 + (verificationTier * 0.05); // Up to 1.25x
  const traitsMultiplier = 1.0 + (verificationTier * 0.06); // Up to 1.30x
  
  return {
    skillsMultiplier,
    traitsMultiplier,
    performanceScores: {
      communication: stats.avg_communication || 5,
      problemSolving: stats.avg_problem_solving || 5,
      reliability: stats.avg_reliability || 5,
      collaboration: stats.avg_collaboration || 5
    },
    verifiedSkills: stats.verified_skills || []
  };
}

/**
 * Estimate level from years for backward compatibility
 */
function estimateLevelFromYears(years: number): 1 | 2 | 3 | 4 | 5 {
  if (years < 1) return 1;
  if (years < 2) return 2;
  if (years < 5) return 3;
  if (years < 8) return 4;
  return 5;
}

/**
 * Helper: Get skills in new format, with fallback for old format
 */
function normalizeSkillsForMatching(skills: any[]): Skill[] {
  if (!skills || skills.length === 0) return [];
  
  return skills.map(skill => {
    // Already in new format
    if (skill.level !== undefined) {
      return skill as Skill;
    }
    
    // Old format - estimate level from years
    const estimatedLevel = estimateLevelFromYears(skill.years || 0);
    return {
      name: skill.name,
      level: estimatedLevel,
      years: skill.years,
      description: undefined
    } as Skill;
  });
}

/**
 * Calculate skill match between candidate and job
 * Primary: Level alignment (proficiency)
 * Secondary: Years (context only, not weighted heavily)
 */
function calculateSkillMatch(
  candidateSkill: Skill,
  jobRequirement: JobSkill
): number {
  const levelDiff = candidateSkill.level - jobRequirement.required_level;
  
  // Perfect level match
  if (levelDiff === 0) return 100;
  
  // Over-qualified (slight penalty to avoid boredom/overqualification risk)
  if (levelDiff === 1) return 95;
  if (levelDiff === 2) return 90;
  if (levelDiff >= 3) return 85;
  
  // Under-qualified (steeper penalty)
  if (levelDiff === -1) return 70; // One level below
  if (levelDiff === -2) return 40; // Two levels below
  if (levelDiff <= -3) return 10; // Major skill gap
  
  return 0;
}

export function calculateSkillsMatch(
  candidateSkills: any[], // Accept raw array
  jobSkills: JobSkill[],
  verificationBoost: VerificationBoost
): MatchDetails {
  if (!jobSkills || jobSkills.length === 0) {
      return { score: 100, reason: 'No specific skills required' };
  }

  // Normalize candidate skills to ensure 'level' property exists
  const safeCandidateSkills = normalizeSkillsForMatching(candidateSkills);

  const verifiedSkillsSet = new Set(verificationBoost.verifiedSkills || []);
  let totalScore = 0;
  let requiredSkillsMet = 0;
  let preferredSkillsMet = 0;
  
  jobSkills.forEach(jobSkill => {
      const candidateSkill = safeCandidateSkills.find(
        s => s.name.toLowerCase() === jobSkill.name.toLowerCase()
      );
      
      const isRequired = jobSkill.weight === 'required';

      if (candidateSkill) {
        let matchScore = calculateSkillMatch(candidateSkill, jobSkill);
        
        // Verification Boost for individual skills
        if (verifiedSkillsSet.has(candidateSkill.name)) {
            matchScore = Math.min(100, matchScore * 1.2); 
        }
        
        // Weighting: Required skills count double in score impact
        if (isRequired) {
            totalScore += matchScore * 2; 
        } else {
            totalScore += matchScore;
        }

        if (isRequired && matchScore >= 70) requiredSkillsMet++;
        if (!isRequired && matchScore >= 70) preferredSkillsMet++;

      } else {
        // Missing skill penalty handled by adding 0 to score
      }
  });
    
  const totalPossibleWeight = jobSkills.reduce((acc, s) => acc + (s.weight === 'required' ? 200 : 100), 0);
  const rawScore = totalPossibleWeight > 0 ? (totalScore / totalPossibleWeight) * 100 : 100;
  
  const finalScore = Math.min(100, rawScore * verificationBoost.skillsMultiplier);

  return {
      score: finalScore,
      reason: `${Math.round(finalScore)}% match${verificationBoost.skillsMultiplier > 1 ? ' (Verified Boost)' : ''}`
  };
}

export function calculatePerformanceMatch(
  candidatePerformance: { communication: number; problemSolving: number; reliability: number; collaboration: number },
  jobRequirements?: { communication?: number; problemSolving?: number; reliability?: number; collaboration?: number } | null
): MatchDetails {
  if (!jobRequirements || Object.keys(jobRequirements).length === 0) {
    return { score: 100, reason: 'No performance requirements' };
  }
  
  const dimensions = ['communication', 'problemSolving', 'reliability', 'collaboration'] as const;
  let totalScore = 0;
  let dimensionsChecked = 0;
  
  dimensions.forEach(dim => {
    if (jobRequirements[dim]) {
      const required = jobRequirements[dim]!;
      const actual = candidatePerformance[dim];
      
      const difference = Math.max(0, required - actual); 
      const dimensionScore = Math.max(0, 100 - (difference * 15));
      
      totalScore += dimensionScore;
      dimensionsChecked++;
    }
  });
  
  const finalScore = dimensionsChecked > 0 ? totalScore / dimensionsChecked : 100;
  
  return {
    score: finalScore,
    reason: dimensionsChecked > 0 ? 'Based on verified performance' : 'No requirements set'
  };
}

/**
 * Calculate impact scope alignment
 */
function calculateImpactScopeMatch(
  candidateDesiredScopes: number[] | undefined | null,
  jobRequiredScope: number | undefined | null
): MatchDetails {
  if (!jobRequiredScope) return { score: 100, reason: 'No impact scope specified' };
  if (!candidateDesiredScopes || candidateDesiredScopes.length === 0) {
    return { score: 100, reason: 'Flexible impact scope' }; 
  }
  
  if (candidateDesiredScopes.includes(jobRequiredScope)) {
    return { score: 100, reason: 'Impact scope aligned' }; 
  }
  
  // Calculate closest scope
  const minDistance = Math.min(
    ...candidateDesiredScopes.map(scope => Math.abs(scope - jobRequiredScope))
  );
  
  let score = 0;
  // Penalize based on distance
  if (minDistance === 1) score = 80;
  else if (minDistance === 2) score = 60;
  else if (minDistance === 3) score = 40;
  else score = 20; // 4+ levels away

  return { score, reason: 'Impact scope mismatch' };
}

export const calculateMatch = (job: JobPosting, candidate: CandidateProfile): MatchBreakdown => {
  if (!candidate || !job) {
    return {
      overallScore: 0,
      details: {
          skills: { score: 0, reason: 'N/A' },
          salary: { score: 0, reason: 'N/A' },
          contract: { score: 0, reason: 'N/A' },
          location: { score: 0, reason: 'N/A' },
          workMode: { score: 0, reason: 'N/A' },
          seniority: { score: 0, reason: 'N/A' },
          culture: { score: 0, reason: 'N/A' },
          perks: { score: 0, reason: 'N/A' },
          industry: { score: 0, reason: 'N/A' },
          traits: { score: 0, reason: 'N/A' }
      },
      dealBreakers: ['Invalid data'],
      recommendations: []
    };
  }

  const safeCandidate = {
    ...candidate,
    skills: candidate.skills || [],
    contractTypes: candidate.contractTypes || [],
    preferredWorkMode: candidate.preferredWorkMode || [],
    values: candidate.values || [],
    characterTraits: candidate.characterTraits || [],
    desiredPerks: candidate.desiredPerks || [],
    interestedIndustries: candidate.interestedIndustries || [],
    desiredSeniority: candidate.desiredSeniority || [],
    nonNegotiables: candidate.nonNegotiables || [],
    location: candidate.location || ''
  };

  const verificationBoost = calculateVerificationBoost(candidate);
  const dealBreakers: string[] = [];
  const recommendations: string[] = [];

  const skillsMatch = calculateSkillsMatch(safeCandidate.skills, job.requiredSkills, verificationBoost);

  let salaryScore = 100;
  if (job.salaryMax && safeCandidate.salaryMin) {
      if (safeCandidate.salaryMin > job.salaryMax) {
          const diff = safeCandidate.salaryMin - job.salaryMax;
          const percentDiff = (diff / job.salaryMax);
          salaryScore = Math.max(0, 100 - (percentDiff * 200)); 
          if (safeCandidate.nonNegotiables.includes('salary')) {
              dealBreakers.push('Salary expectation exceeds budget');
              salaryScore = 0;
          }
      }
  }

  let contractScore = 0;
  const sharedContracts = job.contractTypes.filter(t => safeCandidate.contractTypes.includes(t));
  if (sharedContracts.length > 0) contractScore = 100;
  else dealBreakers.push(`Job requires ${job.contractTypes.join('/')}`);

  let locationScore = 0;
  let workModeScore = 0;
  if (safeCandidate.preferredWorkMode.includes(job.workMode)) workModeScore = 100;
  else if (safeCandidate.nonNegotiables.includes('work_mode')) dealBreakers.push(`Work mode mismatch`);
  else workModeScore = 50;

  if (job.workMode === WorkMode.REMOTE) locationScore = 100;
  else {
      if (safeCandidate.location.toLowerCase().includes(job.location.toLowerCase())) locationScore = 100;
      else if (safeCandidate.nonNegotiables.includes('location')) dealBreakers.push(`Location mismatch`);
      else locationScore = 20; 
  }
  const locWorkScore = (locationScore + workModeScore) / 2;

  let seniorityScore = 0;
  if (safeCandidate.desiredSeniority.includes(job.seniority)) seniorityScore = 100;
  else seniorityScore = 50;

  let cultureScore = 0;
  if (job.values.length > 0 && safeCandidate.values.length > 0) {
      const shared = job.values.filter(v => safeCandidate.values.includes(v));
      cultureScore = (shared.length / Math.max(job.values.length, safeCandidate.values.length)) * 100;
  } else cultureScore = 100;

  let perkScore = 100;
  if (safeCandidate.desiredPerks.length > 0) {
    const shared = job.perks.filter(p => safeCandidate.desiredPerks.includes(p));
    perkScore = (shared.length / safeCandidate.desiredPerks.length) * 100;
  }

  let industryScore = 100;
  if (safeCandidate.interestedIndustries.length > 0 && job.companyIndustry) {
      if (job.companyIndustry.some(ind => safeCandidate.interestedIndustries.includes(ind))) industryScore = 100;
      else industryScore = 20;
  }

  let traitsScore = 100;
  if (job.requiredTraits && job.requiredTraits.length > 0) {
    const hasRequired = job.requiredTraits.filter(t => safeCandidate.characterTraits.includes(t));
    if (hasRequired.length < job.requiredTraits.length) {
       traitsScore = 50;
    }
  }
  traitsScore = Math.min(100, traitsScore * verificationBoost.traitsMultiplier);

  const performanceMatch = calculatePerformanceMatch(
      verificationBoost.performanceScores,
      job.desired_performance_scores
  );

  // New Impact Match
  const impactMatch = calculateImpactScopeMatch(safeCandidate.desired_impact_scope, job.required_impact_scope);

  const weights = {
    skills: 0.25,
    salary: 0.15,
    contract: 0.05,
    locWork: 0.10,
    seniority: 0.05,
    culture: 0.10,
    perks: 0.05,
    industry: 0.05,
    traits: 0.05,
    performance: 0.10,
    impact: 0.05 // New Weight
  };

  let overallScore = Math.round(
      (skillsMatch.score * weights.skills) + 
      (salaryScore * weights.salary) + 
      (contractScore * weights.contract) + 
      (locWorkScore * weights.locWork) + 
      (seniorityScore * weights.seniority) + 
      (cultureScore * weights.culture) + 
      (perkScore * weights.perks) +
      (industryScore * weights.industry) +
      (traitsScore * weights.traits) + 
      (performanceMatch.score * weights.performance) +
      (impactMatch.score * weights.impact)
  );

  if (dealBreakers.length > 0) {
      overallScore = Math.min(overallScore, 45);
  }

  return {
      overallScore,
      details: {
          skills: skillsMatch,
          salary: { score: Math.round(salaryScore), reason: salaryScore === 100 ? 'Within budget' : 'Outside range' },
          contract: { score: Math.round(contractScore), reason: contractScore === 100 ? 'Type match' : 'Type mismatch' },
          location: { score: Math.round(locationScore), reason: 'Location score' },
          workMode: { score: Math.round(workModeScore), reason: 'Work mode score' },
          seniority: { score: Math.round(seniorityScore), reason: 'Seniority score' },
          culture: { score: Math.round(cultureScore), reason: 'Culture score' },
          perks: { score: Math.round(perkScore), reason: 'Perks score' },
          industry: { score: Math.round(industryScore), reason: 'Industry score' },
          traits: { score: Math.round(traitsScore), reason: 'Traits score' },
          performance: performanceMatch,
          impact: impactMatch
      },
      dealBreakers,
      recommendations
  };
};

export const calculateCandidateMatch = (criteria: TalentSearchCriteria, candidate: CandidateProfile): MatchBreakdown => {
    const jobLikeObject: any = {
        requiredSkills: criteria.requiredSkills || [],
        salaryMin: criteria.salaryMin, 
        salaryMax: criteria.salaryMax,
        contractTypes: criteria.contractTypes || [],
        workMode: criteria.workMode?.[0] || 'Remote',
        location: criteria.location || '',
        seniority: criteria.seniority?.[0] || 'Senior',
        values: criteria.values || [],
        perks: criteria.desiredPerks || [],
        companyIndustry: criteria.interestedIndustries || [],
        requiredTraits: criteria.requiredTraits || [],
        // Fallback for impact scope if not in search criteria
        required_impact_scope: 3 
    };
    return calculateMatch(jobLikeObject, candidate);
};
