
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

export function calculateSkillsMatch(
  candidateSkills: Skill[],
  jobSkills: JobSkill[],
  verificationBoost: VerificationBoost
): MatchDetails {
  if (!jobSkills || jobSkills.length === 0) {
      return { score: 100, reason: 'No specific skills required' };
  }

  const verifiedSkillsSet = new Set(verificationBoost.verifiedSkills || []);
  let skillsMatchedWeight = 0;
  
  jobSkills.forEach(jobSkill => {
      const candidateSkill = candidateSkills.find(
        s => s.name.toLowerCase() === jobSkill.name.toLowerCase()
      );
      
      const isRequired = jobSkill.weight === 'required';

      if (candidateSkill) {
        let skillPoints = 100;
        
        const candidateYears = candidateSkill.years !== undefined ? candidateSkill.years : (candidateSkill as any).minimumYears || 0;

        if (candidateYears < jobSkill.minimumYears) {
          skillPoints -= (jobSkill.minimumYears - candidateYears) * 20;
        }
        
        // Verification Boost for individual skills
        if (verifiedSkillsSet.has(candidateSkill.name)) {
            skillPoints = Math.min(100, skillPoints * 1.2); 
        }
        
        skillPoints = Math.max(0, skillPoints);
        
        if (isRequired) {
            skillsMatchedWeight += skillPoints * 2; 
        } else {
            skillsMatchedWeight += skillPoints;
        }
      }
  });
    
  const totalPossibleWeight = jobSkills.reduce((acc, s) => acc + (s.weight === 'required' ? 200 : 100), 0);
  const rawScore = totalPossibleWeight > 0 ? (skillsMatchedWeight / totalPossibleWeight) * 100 : 100;
  
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

  const weights = {
    skills: 0.25,
    salary: 0.15,
    contract: 0.05,
    locWork: 0.10,
    seniority: 0.10,
    culture: 0.10,
    perks: 0.05,
    industry: 0.05,
    traits: 0.05,
    performance: 0.10
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
      (performanceMatch.score * weights.performance)
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
          performance: performanceMatch
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
    };
    return calculateMatch(jobLikeObject, candidate);
};
