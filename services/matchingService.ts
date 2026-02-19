import { CandidateProfile, JobPosting, MatchBreakdown, JobType, WorkMode, JobSkill, TalentSearchCriteria, MatchDetails, Skill, VerifiedSkillStats, CompanyProfile } from '../types';
import { calculateWorkStyleMatch, calculateTeamCollabMatch, calculateManagementFitScore } from './workStyleMatchingService';

interface VerificationBoost {
  skillsMultiplier: number;
  traitsMultiplier: number;
  performanceScores: {
    communication: number;
    problemSolving: number;
    reliability: number;
    collaboration: number;
  };
  verifiedSkills: any[];
}

function calculateVerificationBoost(candidate: CandidateProfile): VerificationBoost {
  const stats = candidate.verificationStats;
  if (!stats || stats.total_verifications === 0) {
    return {
      skillsMultiplier: 1.0,
      traitsMultiplier: 1.0,
      performanceScores: { communication: 5, problemSolving: 5, reliability: 5, collaboration: 5 },
      verifiedSkills: []
    };
  }
  const verificationTier = Math.min(stats.total_verifications, 5);
  let skillsMultiplier = 1.0 + (verificationTier * 0.05);
  const traitsMultiplier = 1.0 + (verificationTier * 0.06);
  const verifiedSkillsWithHighAgreement = (stats.verified_skills || []).filter((skill: any) => skill.level_agreement_rate >= 0.8 && skill.verification_count >= 2);
  if (verifiedSkillsWithHighAgreement.length > 0) skillsMultiplier *= 1.05;
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
    if (skill.level !== undefined) return skill as Skill;
    const estimatedLevel = estimateLevelFromYears(skill.years || 0);
    return { name: skill.name, level: estimatedLevel, years: skill.years } as Skill;
  });
}

function calculateSkillMatch(candidateSkill: Skill, jobRequirement: JobSkill, verifiedSkillStats?: VerifiedSkillStats): number {
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

export function calculateSkillsMatch(candidateSkills: any[], jobSkills: JobSkill[], verificationBoost: VerificationBoost): MatchDetails {
  if (!jobSkills || jobSkills.length === 0) return { score: 100, reason: 'No specific skills required' };
  const safeCandidateSkills = normalizeSkillsForMatching(candidateSkills);
  const verifiedSkillsMap = new Map((verificationBoost.verifiedSkills || []).map((s: any) => [s.skill, s]));
  let totalScore = 0;
  jobSkills.forEach(jobSkill => {
      const candidateSkill = safeCandidateSkills.find(s => s.name.toLowerCase() === jobSkill.name.toLowerCase());
      if (candidateSkill) {
        const verifiedStats = verifiedSkillsMap.get(candidateSkill.name);
        let matchScore = calculateSkillMatch(candidateSkill, jobSkill, verifiedStats);
        if (verifiedStats && verifiedStats.level_agreement_rate >= 0.8) matchScore = Math.min(100, matchScore * 1.1); 
        totalScore += (jobSkill.weight === 'required' ? matchScore * 2 : matchScore);
      } 
  });
  const totalPossibleWeight = jobSkills.reduce((acc, s) => acc + (s.weight === 'required' ? 200 : 100), 0);
  const rawScore = totalPossibleWeight > 0 ? (totalScore / totalPossibleWeight) * 100 : 100;
  const finalScore = Math.min(100, rawScore * verificationBoost.skillsMultiplier);
  return { score: finalScore, reason: `${Math.round(finalScore)}% match` };
}

function calculateIndustryMatch(candidateInds: string[] = [], companyInds: string[] = []): MatchDetails {
  if (companyInds.length === 0) return { score: 100, reason: 'No industry restrictions' };
  const matches = candidateInds.filter(i => companyInds.includes(i));
  const score = matches.length > 0 ? 100 : 50;
  return { score, reason: matches.length > 0 ? `Matched ${matches[0]}` : 'Industry interest mismatch' };
}

function calculateCompanySizeMatch(preferred: string[] = [], actual?: string): MatchDetails {
  if (!actual || preferred.length === 0) return { score: 100, reason: 'No size preference' };
  const score = preferred.includes(actual) ? 100 : 60;
  return { score, reason: preferred.includes(actual) ? 'Perfect size match' : 'Size differs from preference' };
}

// Language matching: checks if candidate meets job language requirements
function calculateLanguageMatch(
  candidateLanguages: Array<{language: string; proficiency: string}> = [],
  jobLanguages: Array<{language: string; minimumLevel: string; required: boolean}> = []
): MatchDetails {
  if (!jobLanguages || jobLanguages.length === 0) return { score: 100, reason: 'No language requirements' };

  const proficiencyOrder = ['basic', 'conversational', 'professional', 'fluent', 'native'];

  let matchedRequired = 0, totalRequired = 0;
  let matchedPreferred = 0, totalPreferred = 0;

  jobLanguages.forEach(req => {
    const candidateLang = candidateLanguages.find(
      cl => cl.language.toLowerCase() === req.language.toLowerCase()
    );

    if (req.required) {
      totalRequired++;
      if (candidateLang) {
        const candLevel = proficiencyOrder.indexOf(candidateLang.proficiency);
        const reqLevel = proficiencyOrder.indexOf(req.minimumLevel);
        if (candLevel >= reqLevel) matchedRequired++;
      }
    } else {
      totalPreferred++;
      if (candidateLang) {
        const candLevel = proficiencyOrder.indexOf(candidateLang.proficiency);
        const reqLevel = proficiencyOrder.indexOf(req.minimumLevel);
        if (candLevel >= reqLevel) matchedPreferred++;
      }
    }
  });

  // Required languages are critical
  if (totalRequired > 0 && matchedRequired < totalRequired) {
    return { score: 0, reason: `Missing ${totalRequired - matchedRequired} required language(s)` };
  }

  // Preferred languages boost score
  const preferredScore = totalPreferred > 0 ? (matchedPreferred / totalPreferred) * 30 : 0;
  const score = 70 + preferredScore; // Base 70 for meeting requirements + up to 30 for preferred

  return { score, reason: `Meets language requirements` };
}

// Timezone matching: checks overlap compatibility
function calculateTimezoneMatch(
  candidateTimezone?: string,
  candidatePreferredTimezone?: string,
  jobTimezoneOverlap?: string,
  companyTimezone?: string
): MatchDetails {
  if (!jobTimezoneOverlap || jobTimezoneOverlap === 'async_first') {
    return { score: 100, reason: 'Async-first or no timezone requirements' };
  }

  // Simplified timezone offset mapping (real implementation would use a timezone library)
  const getOffset = (tz?: string): number => {
    if (!tz) return 0;
    const offsets: Record<string, number> = {
      'UTC': 0, 'America/New_York': -5, 'America/Chicago': -6, 'America/Denver': -7,
      'America/Los_Angeles': -8, 'Europe/London': 0, 'Europe/Paris': 1, 'Europe/Berlin': 1,
      'Asia/Dubai': 4, 'Asia/Kolkata': 5.5, 'Asia/Singapore': 8, 'Asia/Shanghai': 8,
      'Asia/Tokyo': 9, 'Australia/Sydney': 10, 'Pacific/Auckland': 12
    };
    return offsets[tz] || 0;
  };

  const candidateTz = candidatePreferredTimezone || candidateTimezone;
  const candidateOffset = getOffset(candidateTz);
  const companyOffset = getOffset(companyTimezone);
  const hoursDiff = Math.abs(candidateOffset - companyOffset);

  switch (jobTimezoneOverlap) {
    case 'full_overlap':
      return hoursDiff <= 1
        ? { score: 100, reason: 'Full timezone overlap' }
        : { score: Math.max(0, 100 - hoursDiff * 15), reason: `${hoursDiff}h timezone difference` };
    case 'overlap_4_plus':
      return hoursDiff <= 4
        ? { score: 100, reason: '4+ hours overlap' }
        : { score: Math.max(0, 100 - (hoursDiff - 4) * 20), reason: `Limited overlap (${hoursDiff}h diff)` };
    case 'overlap_2_plus':
      return hoursDiff <= 6
        ? { score: 100, reason: '2+ hours overlap' }
        : { score: 50, reason: `Minimal overlap possible` };
    default:
      return { score: 100, reason: 'Flexible timezone' };
  }
}

// Visa and relocation matching
function calculateVisaRelocationMatch(
  candidateNeedsVisa: boolean = false,
  candidateWillingToRelocate: boolean = false,
  jobOffersVisa: boolean = false,
  jobOffersRelocation: boolean = false
): MatchDetails {
  // If candidate needs visa but job doesn't offer, it's a potential issue
  if (candidateNeedsVisa && !jobOffersVisa) {
    return { score: 50, reason: 'Visa sponsorship may be needed' };
  }

  // If relocation is needed and job offers it, bonus
  if (candidateWillingToRelocate && jobOffersRelocation) {
    return { score: 100, reason: 'Relocation assistance available' };
  }

  return { score: 100, reason: 'No visa/relocation concerns' };
}

// Certification matching — binary for required, scored for preferred
export function calculateCertificationMatch(
  candidateCertIds: string[],
  jobRequiredCerts: string[],
  jobPreferredCerts: string[]
): MatchDetails {
  const hasRequired = jobRequiredCerts && jobRequiredCerts.length > 0;
  const hasPreferred = jobPreferredCerts && jobPreferredCerts.length > 0;

  if (!hasRequired && !hasPreferred) {
    return { score: 100, reason: 'No certification requirements' };
  }

  // HARD REQUIREMENT: Must have ALL required certifications
  if (hasRequired) {
    const missing = jobRequiredCerts.filter(id => !candidateCertIds.includes(id));
    if (missing.length > 0) {
      return { score: 0, reason: `Missing ${missing.length} required certification(s)` };
    }

    // All required met
    if (!hasPreferred) {
      return { score: 100, reason: 'All required certifications met' };
    }

    // Score preferred on top of required base (80-100 range)
    const metPreferred = jobPreferredCerts.filter(id => candidateCertIds.includes(id));
    const preferredRatio = metPreferred.length / jobPreferredCerts.length;
    const score = Math.round(80 + (preferredRatio * 20));
    return { score, reason: `All required met, ${metPreferred.length}/${jobPreferredCerts.length} preferred` };
  }

  // Only preferred certs (no required)
  const metPreferred = jobPreferredCerts.filter(id => candidateCertIds.includes(id));
  const score = Math.round((metPreferred.length / jobPreferredCerts.length) * 100);
  return { score, reason: `${metPreferred.length}/${jobPreferredCerts.length} preferred certifications` };
}

// Company culture alignment — candidate preferences vs company profile
export function calculateCompanyCultureAlignment(
  candidatePreferredFocus: string[],
  candidatePreferredMission: string[],
  candidatePreferredWorkStyle: string[],
  companyFocus: string | null | undefined,
  companyMission: string | null | undefined,
  companyWorkStyle: string | null | undefined
): MatchDetails {
  // If company hasn't specified any culture fields, neutral match
  if (!companyFocus && !companyMission && !companyWorkStyle) {
    return { score: 100, reason: 'Company culture not specified' };
  }

  // If candidate has no preferences, neutral match (open to anything)
  if (
    candidatePreferredFocus.length === 0 &&
    candidatePreferredMission.length === 0 &&
    candidatePreferredWorkStyle.length === 0
  ) {
    return { score: 100, reason: 'No company preferences set' };
  }

  let matches = 0;
  let total = 0;
  const reasons: string[] = [];

  if (companyFocus && candidatePreferredFocus.length > 0) {
    total++;
    if (candidatePreferredFocus.includes(companyFocus)) {
      matches++;
      reasons.push('Focus match');
    }
  }

  if (companyMission && candidatePreferredMission.length > 0) {
    total++;
    if (candidatePreferredMission.includes(companyMission)) {
      matches++;
      reasons.push('Mission match');
    }
  }

  if (companyWorkStyle && candidatePreferredWorkStyle.length > 0) {
    total++;
    if (candidatePreferredWorkStyle.includes(companyWorkStyle)) {
      matches++;
      reasons.push('Work style match');
    }
  }

  if (total === 0) return { score: 100, reason: 'No comparable attributes' };

  const score = Math.round((matches / total) * 100);
  return {
    score,
    reason: matches > 0 ? reasons.join(', ') : `${total - matches}/${total} culture mismatch(es)`
  };
}

// Regulatory experience matching — candidate domains vs job requirements
export function calculateRegulatoryMatch(
  candidateRegDomains: string[],
  jobRegDomains: string[]
): MatchDetails {
  if (!jobRegDomains || jobRegDomains.length === 0) {
    return { score: 100, reason: 'No regulatory requirements' };
  }

  if (!candidateRegDomains || candidateRegDomains.length === 0) {
    return { score: 30, reason: 'No regulatory experience (can potentially learn)' };
  }

  const overlap = jobRegDomains.filter(id => candidateRegDomains.includes(id)).length;
  // Scale to 30-100 range (some experience > none)
  const score = Math.round(30 + ((overlap / jobRegDomains.length) * 70));

  return {
    score,
    reason: overlap > 0
      ? `${overlap}/${jobRegDomains.length} regulatory domain(s) matched`
      : 'No regulatory domain overlap'
  };
}

export function calculatePerformanceMatch(candidatePerformance: any, jobRequirements?: any): MatchDetails {
  if (!jobRequirements || Object.keys(jobRequirements).length === 0) return { score: 100, reason: 'No performance requirements' };
  const dimensions = ['communication', 'problemSolving', 'reliability', 'collaboration'] as const;
  let totalScore = 0, checked = 0;
  dimensions.forEach(dim => {
    if (jobRequirements[dim]) {
      const diff = Math.max(0, jobRequirements[dim] - candidatePerformance[dim]);
      totalScore += Math.max(0, 100 - (diff * 15));
      checked++;
    }
  });
  return { score: checked > 0 ? totalScore / checked : 100, reason: 'Based on verified performance' };
}

export const calculateMatch = (job: JobPosting, candidate: CandidateProfile, company?: CompanyProfile, candidateCertIds?: string[]): MatchBreakdown => {
  if (!candidate || !job) return { overallScore: 0, details: {} as any, dealBreakers: ['Invalid data'], recommendations: [] };
  
  const verificationBoost = calculateVerificationBoost(candidate);
  
  // Work Style & Team Collaboration Matches
  const workStyleMatch = calculateWorkStyleMatch(
    candidate.workStylePreferences,
    job.workStyleRequirements,
    company?.workStyleCulture,
    job.workStyleDealbreakers
  );

  const teamFitMatch = calculateTeamCollabMatch(
    candidate.teamCollaborationPreferences,
    job.teamRequirements,
    company?.teamStructure ? {
      teamDistribution: company.teamStructure.teamDistribution,
      collaborationFrequency: company.teamStructure.defaultCollaboration,
      reportingStructure: company.teamStructure.reportingStructure
    } as any : undefined,
    job.teamDealbreakers
  );

  // Core dimensions
  const skillsMatch = calculateSkillsMatch(candidate.skills || [], job.requiredSkills || [], verificationBoost);
  const industryMatch = calculateIndustryMatch(candidate.interestedIndustries, company?.industry);
  const companySizeMatch = calculateCompanySizeMatch(candidate.preferredCompanySize, company?.companySizeRange);

  // New logistics dimensions
  const languageMatch = calculateLanguageMatch(
    candidate.languages,
    job.preferredLanguages
  );
  const timezoneMatch = calculateTimezoneMatch(
    candidate.timezone,
    candidate.preferredTimezone,
    job.requiredTimezoneOverlap,
    company?.defaultTimezone
  );
  const visaRelocationMatch = calculateVisaRelocationMatch(
    candidate.legalStatus === 'requires_sponsorship',
    candidate.willingToRelocate,
    job.visaSponsorshipAvailable,
    job.relocationAssistance
  );

  // Management Fit: match candidate preferences against HM preferences
  const hmPrefs = (job as any).hiring_manager_preferences || (job as any).hiringManagerPreferences;
  const managementFitMatch = calculateManagementFitScore(
    {
      preferredLeadershipStyle: candidate.preferredLeadershipStyle,
      preferredFeedbackFrequency: candidate.preferredFeedbackFrequency,
      preferredCommunicationStyle: candidate.preferredCommunicationStyle,
      preferredMeetingCulture: candidate.preferredMeetingCulture,
      preferredConflictResolution: candidate.preferredConflictResolution,
      preferredMentorshipStyle: candidate.preferredMentorshipStyle,
      growthGoals: candidate.growthGoals,
    },
    hmPrefs
  );

  // --- New sub-factor scoring ---

  // Certification match (binary for required)
  const hasCertData = candidateCertIds !== undefined;
  const certMatch = calculateCertificationMatch(
    hasCertData ? candidateCertIds! : [],
    job.requiredCertifications || [],
    job.preferredCertifications || []
  );

  // Company culture alignment (candidate prefs vs company profile)
  const cultureAlignmentMatch = calculateCompanyCultureAlignment(
    candidate.preferredCompanyFocus || [],
    candidate.preferredMissionOrientation || [],
    candidate.preferredWorkStyle || [],
    company?.focusType || null,
    company?.missionOrientation || null,
    company?.workStyle || null
  );

  // Regulatory experience match
  const regulatoryMatch = calculateRegulatoryMatch(
    candidate.regulatoryExperience || [],
    job.regulatoryDomains || []
  );

  // --- Hard disqualification check ---
  const hasRequiredCerts = (job.requiredCertifications?.length || 0) > 0;
  const isDisqualifiedByCerts = hasCertData && hasRequiredCerts && certMatch.score === 0;

  if (isDisqualifiedByCerts) {
    return {
      overallScore: 0,
      details: {
        skills: { score: 0, reason: 'Disqualified: missing required certifications' },
        seniority: { score: 0, reason: '' },
        salary: { score: 0, reason: '' },
        location: { score: 0, reason: '' },
        workMode: { score: 0, reason: '' },
        contract: { score: 0, reason: '' },
        culture: cultureAlignmentMatch,
        perks: { score: 0, reason: '' },
        industry: industryMatch,
        companySize: companySizeMatch,
        traits: { score: 0, reason: '' },
        workStyle: workStyleMatch,
        teamFit: teamFitMatch,
        performance: { score: 0, reason: '' },
        language: languageMatch,
        timezone: timezoneMatch,
        visa: visaRelocationMatch,
        relocation: visaRelocationMatch,
        managementFit: managementFitMatch,
        certifications: certMatch
      },
      dealBreakers: ['Missing required certifications'],
      recommendations: []
    };
  }

  // --- Dimension blending ---

  // Skills: blend cert sub-factor at 30% when cert requirements exist
  const hasCertRequirements = (job.requiredCertifications?.length || 0) + (job.preferredCertifications?.length || 0) > 0;
  const certSubWeight = (hasCertData && hasCertRequirements) ? 0.3 : 0;
  const blendedSkillsScore = (skillsMatch.score * (1 - certSubWeight)) + (certMatch.score * certSubWeight);

  // Culture: blend company culture alignment at 40% (replaces old placeholder)
  const blendedCultureScore = (100 * 0.6) + (cultureAlignmentMatch.score * 0.4);

  // Industry: blend regulatory sub-factor at 20% when regulatory domains specified
  const hasRegRequirements = (job.regulatoryDomains?.length || 0) > 0;
  const regSubWeight = hasRegRequirements ? 0.2 : 0;
  const blendedIndustryScore = (industryMatch.score * (1 - regSubWeight)) + (regulatoryMatch.score * regSubWeight);

  let salaryScore = 100;
  if (job.salaryMax && candidate.salaryMin && candidate.salaryMin > job.salaryMax) salaryScore = 0;

  let workModeScore = (candidate.preferredWorkMode || []).includes(job.workMode) ? 100 : 0;
  let seniorityScore = (candidate.desiredSeniority || []).includes(job.seniority) || (candidate.desiredSeniority||[]).length === 0 ? 100 : 50;

  // Weights: certifications dimension removed, redistributed to skills (+0.02) and culture (+0.02)
  const DIMENSION_WEIGHTS = {
    skills: 0.22,
    seniority: 0.07,
    salary: 0.09,
    industry: 0.05,
    companySize: 0.04,
    culture: 0.05,
    perks: 0.02,
    location: 0.04,
    workStyle: 0.07,
    teamFit: 0.06,
    performance: 0.04,
    language: 0.05,
    timezone: 0.05,
    visa: 0.03,
    relocation: 0.03,
    managementFit: 0.09
  };

  const perfMatch = calculatePerformanceMatch(verificationBoost.performanceScores, job.desiredPerformanceScores);

  const weightedScore = (
      (blendedSkillsScore * DIMENSION_WEIGHTS.skills) +
      (seniorityScore * DIMENSION_WEIGHTS.seniority) +
      (salaryScore * DIMENSION_WEIGHTS.salary) +
      (blendedIndustryScore * DIMENSION_WEIGHTS.industry) +
      (companySizeMatch.score * DIMENSION_WEIGHTS.companySize) +
      (blendedCultureScore * DIMENSION_WEIGHTS.culture) +
      (100 * DIMENSION_WEIGHTS.perks) + // Perks placeholder
      (workModeScore * DIMENSION_WEIGHTS.location) +
      (workStyleMatch.score * DIMENSION_WEIGHTS.workStyle) +
      (teamFitMatch.score * DIMENSION_WEIGHTS.teamFit) +
      (perfMatch.score * DIMENSION_WEIGHTS.performance) +
      (languageMatch.score * DIMENSION_WEIGHTS.language) +
      (timezoneMatch.score * DIMENSION_WEIGHTS.timezone) +
      (visaRelocationMatch.score * (DIMENSION_WEIGHTS.visa + DIMENSION_WEIGHTS.relocation)) +
      (managementFitMatch.score * DIMENSION_WEIGHTS.managementFit)
  );

  const dealBreakers: string[] = [];
  if (salaryScore === 0) dealBreakers.push('Salary expectation too high');
  if (workStyleMatch.score === 0) dealBreakers.push('Incompatible work style');
  if (teamFitMatch.score === 0) dealBreakers.push('Team collaboration mismatch');
  if (languageMatch.score === 0) dealBreakers.push('Missing required language skills');

  return {
      overallScore: Math.round(weightedScore),
      details: {
          skills: { score: Math.round(blendedSkillsScore), reason: skillsMatch.reason },
          seniority: { score: seniorityScore, reason: '' },
          salary: { score: salaryScore, reason: '' },
          location: { score: workModeScore, reason: '' },
          workMode: { score: workModeScore, reason: '' },
          contract: { score: 100, reason: '' },
          culture: { score: Math.round(blendedCultureScore), reason: cultureAlignmentMatch.reason },
          perks: { score: 100, reason: '' },
          industry: { score: Math.round(blendedIndustryScore), reason: industryMatch.reason },
          companySize: companySizeMatch,
          traits: { score: 100, reason: '' },
          workStyle: workStyleMatch,
          teamFit: teamFitMatch,
          performance: perfMatch,
          language: languageMatch,
          timezone: timezoneMatch,
          visa: visaRelocationMatch,
          relocation: visaRelocationMatch,
          managementFit: managementFitMatch,
          certifications: certMatch
      },
      dealBreakers,
      recommendations: []
  };
};

export const calculateCandidateMatch = (
  criteria: TalentSearchCriteria,
  candidate: CandidateProfile,
  company?: CompanyProfile,
  candidateCertIds?: string[],
  hmPrefs?: any
): MatchBreakdown => {
    // Wrapper for search criteria matching
    return calculateMatch({
        requiredSkills: criteria.requiredSkills,
        workStyleRequirements: criteria.workStyleFilters,
        teamRequirements: criteria.teamFilters,
        seniority: criteria.seniority?.[0] || 'Senior',
        salaryMax: criteria.salaryMax,
        workMode: criteria.workMode?.[0] || 'Remote',
        requiredCertifications: criteria.requiredCertifications || [],
        preferredCertifications: criteria.preferredCertifications || [],
        regulatoryDomains: criteria.regulatoryDomains || [],
        hiringManagerPreferences: hmPrefs || undefined,
    } as any, candidate, company, candidateCertIds);
};

/**
 * Calculate role alignment score between candidate roles and search criteria roles
 * @param candidateRoleIds - Array of canonical_role_ids the candidate has
 * @param searchRoleIds - Array of canonical_role_ids being searched for
 * @param includeRelated - Whether related roles (same family) count as partial match
 * @returns Object with score (0-100) and matchType
 */
export const calculateRoleAlignment = (
  candidateRoleIds: string[],
  searchRoleIds: string[],
  includeRelated: boolean = false
): { score: number; matchType: 'exact' | 'related' | 'none' } => {
  if (!searchRoleIds || searchRoleIds.length === 0) {
    return { score: 100, matchType: 'exact' }; // No role filter = full match
  }

  if (!candidateRoleIds || candidateRoleIds.length === 0) {
    return { score: 0, matchType: 'none' }; // Candidate has no roles
  }

  // Check for exact match on any candidate role
  const hasExactMatch = candidateRoleIds.some(cr => searchRoleIds.includes(cr));
  if (hasExactMatch) {
    return { score: 100, matchType: 'exact' };
  }

  // If includeRelated is true, related roles from same family get partial credit
  // Note: For now, we assume if includeRelated is true and they matched via expanded IDs,
  // the service already filtered to related roles. Here we just give partial credit.
  if (includeRelated) {
    // Since we can't easily check family here without async, we rely on the service
    // to have expanded the role IDs. If candidate has ANY role, give related credit
    // In practice, the service filters first, so reaching here means candidate exists
    return { score: 60, matchType: 'related' };
  }

  // No match
  return { score: 0, matchType: 'none' };
};
