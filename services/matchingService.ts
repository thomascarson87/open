
import { CandidateProfile, JobPosting, MatchBreakdown, JobType, WorkMode, JobSkill, TalentSearchCriteria, MatchDetails, Skill, VerifiedSkillStats } from '../types';

interface VerificationBoost {
  skillsMultiplier: number;
  traitsMultiplier: number;
  performanceScores: {
    communication: number;
    problemSolving: number;
    reliability: number;
    collaboration: number;
  };
  verifiedSkills: any[]; // Changed from string[] to allow access to stats
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
  
  // Base boost from verification count
  const verificationTier = Math.min(stats.total_verifications, 5);
  let skillsMultiplier = 1.0 + (verificationTier * 0.05); // Up to 1.25x
  const traitsMultiplier = 1.0 + (verificationTier * 0.06); // Up to 1.30x
  
  // NEW: Additional boost for skills with high level agreement
  const verifiedSkillsWithHighAgreement = (stats.verified_skills || []).filter(
    (skill: any) => skill.level_agreement_rate >= 0.8 && skill.verification_count >= 2
  );
  
  if (verifiedSkillsWithHighAgreement.length > 0) {
    // Extra 5% boost for having highly-agreed verified skills
    skillsMultiplier *= 1.05;
  }
  
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

function estimateLevelFromYears(years: number): 1 | 2 | 3 | 4 | 5 {
  if (years < 1) return 1;
  if (years < 2) return 2;
  if (years < 5) return 3;
  if (years < 8) return 4;
  return 5;
}

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

function calculateSkillMatch(
  candidateSkill: Skill,
  jobRequirement: JobSkill,
  verifiedSkillStats?: VerifiedSkillStats
): number {
  let effectiveLevel = candidateSkill.level;
  
  if (verifiedSkillStats && verifiedSkillStats.level_agreement_rate >= 0.7) {
    effectiveLevel = Math.round(verifiedSkillStats.avg_assessed_level) as 1|2|3|4|5;
  }

  const levelDiff = effectiveLevel - jobRequirement.required_level;
  
  if (levelDiff === 0) return 100;
  if (levelDiff === 1) return 95;
  if (levelDiff === 2) return 90;
  if (levelDiff >= 3) return 85;
  if (levelDiff === -1) return 70; 
  if (levelDiff === -2) return 40; 
  if (levelDiff <= -3) return 10; 
  
  return 0;
}

export function calculateSkillsMatch(
  candidateSkills: any[], 
  jobSkills: JobSkill[],
  verificationBoost: VerificationBoost
): MatchDetails {
  if (!jobSkills || jobSkills.length === 0) {
      return { score: 100, reason: 'No specific skills required' };
  }

  const safeCandidateSkills = normalizeSkillsForMatching(candidateSkills);

  const verifiedSkillsMap = new Map(
    (verificationBoost.verifiedSkills || []).map((s: any) => [s.skill, s])
  );

  let totalScore = 0;
  
  jobSkills.forEach(jobSkill => {
      const candidateSkill = safeCandidateSkills.find(
        s => s.name.toLowerCase() === jobSkill.name.toLowerCase()
      );
      
      const isRequired = jobSkill.weight === 'required';

      if (candidateSkill) {
        const verifiedStats = verifiedSkillsMap.get(candidateSkill.name);
        let matchScore = calculateSkillMatch(candidateSkill, jobSkill, verifiedStats);
        
        if (verifiedStats && verifiedStats.level_agreement_rate >= 0.8) {
            matchScore = Math.min(100, matchScore * 1.1); 
        }
        
        if (isRequired) {
            totalScore += matchScore * 2; 
        } else {
            totalScore += matchScore;
        }
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
  
  const minDistance = Math.min(
    ...candidateDesiredScopes.map(scope => Math.abs(scope - jobRequiredScope))
  );
  
  let score = 0;
  if (minDistance === 1) score = 80;
  else if (minDistance === 2) score = 60;
  else if (minDistance === 3) score = 40;
  else score = 20; 

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
          traits: { score: 0, reason: 'N/A' },
          performance: { score: 0, reason: 'N/A' },
          impact: { score: 0, reason: 'N/A' }
      },
      dealBreakers: ['Invalid data'],
      recommendations: []
    };
  }

  // Verification Boost
  const verificationBoost = calculateVerificationBoost(candidate);

  // 1. Skills
  const skillsMatch = calculateSkillsMatch(candidate.skills || [], job.requiredSkills || [], verificationBoost);

  // 2. Salary (Dealbreaker potential)
  let salaryScore = 100;
  if (job.salaryMax && candidate.salaryMin) {
      if (candidate.salaryMin > job.salaryMax) {
          salaryScore = 0;
      }
  }
  const salaryMatch = { score: salaryScore, reason: salaryScore === 0 ? 'Salary expectation exceeds budget' : 'Within budget' };

  // 3. Location
  let locationScore = 100;
  if (job.workMode !== WorkMode.REMOTE && candidate.location) {
      if (!candidate.location.toLowerCase().includes(job.location.toLowerCase().split(',')[0].trim().toLowerCase())) {
          locationScore = 50;
      }
  }
  const locationMatch = { score: locationScore, reason: locationScore === 100 ? 'Location aligned' : 'Location mismatch' };

  // 4. Work Mode
  let workModeScore = 0;
  const preferredModes = candidate.preferredWorkMode || [];
  if (preferredModes.includes(job.workMode)) workModeScore = 100;
  else if (preferredModes.length === 0) workModeScore = 100;
  const workModeMatch = { score: workModeScore, reason: workModeScore === 100 ? 'Work mode aligned' : 'Work mode mismatch' };

  // 5. Seniority
  let seniorityScore = 0;
  const desiredSeniority = candidate.desiredSeniority || [];
  if (desiredSeniority.length === 0 || desiredSeniority.includes(job.seniority)) {
      seniorityScore = 100;
  } else {
      seniorityScore = 50; 
  }
  const seniorityMatch = { score: seniorityScore, reason: seniorityScore === 100 ? 'Seniority aligned' : 'Seniority mismatch' };

  // 6. Contract Type
  let contractScore = 0;
  const candidateContracts = candidate.contractTypes || [];
  const jobContracts = job.contractTypes || [];
  const hasContractOverlap = jobContracts.some(t => candidateContracts.includes(t));
  if (hasContractOverlap || candidateContracts.length === 0) contractScore = 100;
  const contractMatch = { score: contractScore, reason: contractScore === 100 ? 'Contract type aligned' : 'Contract type mismatch' };

  // 7. Culture & Values
  const jobValues = job.values || [];
  const candValues = candidate.values || [];
  let cultureScore = 100;
  if (jobValues.length > 0 && candValues.length > 0) {
      const overlap = jobValues.filter(v => candValues.includes(v)).length;
      cultureScore = (overlap / jobValues.length) * 100;
  }
  const cultureMatch = { score: Math.min(100, cultureScore), reason: 'Based on shared values' };

  // 8. Perks
  const jobPerks = job.perks || [];
  const candPerks = candidate.desiredPerks || [];
  let perksScore = 100;
  if (candPerks.length > 0) {
      const overlap = candPerks.filter(p => jobPerks.includes(p)).length;
      perksScore = (overlap / candPerks.length) * 100;
  }
  const perksMatch = { score: Math.min(100, perksScore), reason: 'Based on desired perks' };

  // 9. Traits
  const jobTraits = job.desiredTraits || [];
  const candTraits = candidate.characterTraits || [];
  let traitsScore = 100;
  if (jobTraits.length > 0) {
      const overlap = jobTraits.filter(t => candTraits.includes(t)).length;
      traitsScore = (overlap / jobTraits.length) * 100;
  }
  traitsScore = Math.min(100, traitsScore * verificationBoost.traitsMultiplier);
  const traitsMatch = { score: traitsScore, reason: 'Based on personality traits' };

  // 10. Performance
  const performanceMatch = calculatePerformanceMatch(verificationBoost.performanceScores, job.desired_performance_scores);

  // 11. Impact
  const impactMatch = calculateImpactScopeMatch(candidate.desired_impact_scope, job.required_impact_scope);

  // Dealbreakers
  const dealBreakers: string[] = [];
  if (salaryScore === 0) dealBreakers.push('Salary expectation too high');
  if (workModeScore === 0 && candidate.nonNegotiables?.includes('work_mode')) dealBreakers.push('Work mode mismatch (Non-negotiable)');
  if (contractScore === 0 && candidate.contractTypes?.length > 0 && candidate.nonNegotiables?.includes('contract_type')) dealBreakers.push('Contract type mismatch (Non-negotiable)');
  
  // Calculate Overall
  const weightedScore = (
      (skillsMatch.score * 0.30) +
      (seniorityMatch.score * 0.10) +
      (cultureMatch.score * 0.10) +
      (traitsMatch.score * 0.10) +
      (performanceMatch.score * 0.10) +
      (impactMatch.score * 0.10) +
      (salaryScore * 0.05) +
      (locationScore * 0.05) + 
      (workModeScore * 0.05) +
      (contractScore * 0.05)
  );

  return {
      overallScore: Math.round(weightedScore),
      details: {
          skills: skillsMatch,
          seniority: seniorityMatch,
          salary: salaryMatch,
          location: locationMatch,
          workMode: workModeMatch,
          contract: contractMatch,
          culture: cultureMatch,
          perks: perksMatch,
          industry: { score: 100, reason: 'Industry match not fully implemented' },
          traits: traitsMatch,
          performance: performanceMatch,
          impact: impactMatch
      },
      dealBreakers,
      recommendations: []
  };
};

export const calculateCandidateMatch = (criteria: TalentSearchCriteria, candidate: CandidateProfile): MatchBreakdown => {
    const verificationBoost = calculateVerificationBoost(candidate);

    // 1. Skills
    const skillsMatch = calculateSkillsMatch(candidate.skills || [], criteria.requiredSkills || [], verificationBoost);

    // 2. Salary
    let salaryScore = 100;
    if (criteria.salaryMax && candidate.salaryMin) {
        if (candidate.salaryMin > criteria.salaryMax) salaryScore = 0;
    }
    const salaryMatch = { score: salaryScore, reason: salaryScore === 0 ? 'Over budget' : 'Within budget' };

    // 3. Location
    let locationScore = 100;
    if (criteria.location && candidate.location) {
        if (!candidate.location.toLowerCase().includes(criteria.location.toLowerCase())) locationScore = 50; 
    }
    const locationMatch = { score: locationScore, reason: '' };

    // 4. Seniority
    let seniorityScore = 100;
    if (criteria.seniority && criteria.seniority.length > 0) {
        const overlap = (candidate.desiredSeniority || []).filter(s => criteria.seniority?.includes(s as any));
        if (overlap.length === 0 && (candidate.desiredSeniority||[]).length > 0) seniorityScore = 0;
    }
    const seniorityMatch = { score: seniorityScore, reason: '' };

    // 5. Work Mode
    let workModeScore = 100;
    if (criteria.workMode && criteria.workMode.length > 0) {
        const overlap = (candidate.preferredWorkMode || []).filter(m => criteria.workMode?.includes(m));
        if (overlap.length === 0 && (candidate.preferredWorkMode||[]).length > 0) workModeScore = 0;
    }
    const workModeMatch = { score: workModeScore, reason: '' };

    // 6. Contract
    let contractScore = 100;
    if (criteria.contractTypes && criteria.contractTypes.length > 0) {
        const overlap = (candidate.contractTypes || []).filter(t => criteria.contractTypes?.includes(t));
        if (overlap.length === 0 && (candidate.contractTypes||[]).length > 0) contractScore = 0;
    }
    const contractMatch = { score: contractScore, reason: '' };

    // 7. Values
    let cultureScore = 100;
    if (criteria.values && criteria.values.length > 0 && candidate.values) {
        const overlap = candidate.values.filter(v => criteria.values?.includes(v)).length;
        cultureScore = (overlap / criteria.values.length) * 100;
    }
    const cultureMatch = { score: cultureScore, reason: '' };

    // 8. Traits
    let traitsScore = 100;
    if (criteria.desiredTraits && criteria.desiredTraits.length > 0 && candidate.characterTraits) {
        const overlap = candidate.characterTraits.filter(t => criteria.desiredTraits?.includes(t)).length;
        traitsScore = (overlap / criteria.desiredTraits.length) * 100;
    }
    traitsScore = Math.min(100, traitsScore * verificationBoost.traitsMultiplier);
    const traitsMatch = { score: traitsScore, reason: '' };

    // 9. Industry
    let industryScore = 100;
    if (criteria.interestedIndustries && criteria.interestedIndustries.length > 0 && candidate.interestedIndustries) {
        const overlap = candidate.interestedIndustries.filter(i => criteria.interestedIndustries?.includes(i)).length;
        industryScore = (overlap / criteria.interestedIndustries.length) * 100;
    }
    const industryMatch = { score: industryScore, reason: '' };

    // 10. Education
    let educationScore = 100;
    if (criteria.required_education_level && candidate.education_level) {
        if (criteria.education_required && candidate.education_level !== criteria.required_education_level) {
             educationScore = 50; 
        }
    }

    const dealBreakers: string[] = [];
    if (salaryScore === 0) dealBreakers.push('Over Budget');
    if (criteria.dealBreakers?.includes('location') && locationScore < 100) dealBreakers.push('Location Mismatch');
    if (criteria.dealBreakers?.includes('work_mode') && workModeScore === 0) dealBreakers.push('Work Mode Mismatch');
    if (criteria.dealBreakers?.includes('seniority') && seniorityScore === 0) dealBreakers.push('Seniority Mismatch');
    if (criteria.dealBreakers?.includes('contract_type') && contractScore === 0) dealBreakers.push('Contract Type Mismatch');
    if (criteria.dealBreakers?.includes('education') && educationScore < 100) dealBreakers.push('Education Mismatch');

    const weightedScore = (
        (skillsMatch.score * 0.40) +
        (seniorityScore * 0.10) +
        (cultureMatch.score * 0.10) +
        (traitsMatch.score * 0.10) +
        (locationScore * 0.10) +
        (salaryScore * 0.10) + 
        (industryScore * 0.10)
    );

    return {
        overallScore: Math.round(weightedScore),
        details: {
            skills: skillsMatch,
            seniority: { score: seniorityScore, reason: '' },
            salary: salaryMatch,
            location: locationMatch,
            workMode: workModeMatch,
            contract: contractMatch,
            culture: cultureMatch,
            perks: { score: 100, reason: '' },
            industry: industryMatch,
            traits: traitsMatch
        },
        dealBreakers,
        recommendations: []
    };
};
