import { CandidateProfile, JobPosting, MatchBreakdown, JobType, WorkMode, JobSkill, TalentSearchCriteria, MatchDetails, Skill, VerifiedSkillStats, CompanyProfile } from '../types';
import { calculateWorkStyleMatch, calculateTeamCollabMatch } from './workStyleMatchingService';

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
  const stats = candidate.verification_stats;
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

export const calculateMatch = (job: JobPosting, candidate: CandidateProfile, company?: CompanyProfile): MatchBreakdown => {
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
  
  let salaryScore = 100;
  if (job.salaryMax && candidate.salaryMin && candidate.salaryMin > job.salaryMax) salaryScore = 0;
  
  let workModeScore = (candidate.preferredWorkMode || []).includes(job.workMode) ? 100 : 0;
  let seniorityScore = (candidate.desiredSeniority || []).includes(job.seniority) || (candidate.desiredSeniority||[]).length === 0 ? 100 : 50;
  
  const DIMENSION_WEIGHTS = {
    skills: 0.25,
    seniority: 0.10,
    salary: 0.12,
    industry: 0.08,
    companySize: 0.05,
    culture: 0.08,
    perks: 0.05,
    location: 0.05,
    workStyle: 0.10,
    teamFit: 0.07,
    performance: 0.05
  };

  const perfMatch = calculatePerformanceMatch(verificationBoost.performanceScores, job.desired_performance_scores);

  const weightedScore = (
      (skillsMatch.score * DIMENSION_WEIGHTS.skills) +
      (seniorityScore * DIMENSION_WEIGHTS.seniority) +
      (salaryScore * DIMENSION_WEIGHTS.salary) +
      (industryMatch.score * DIMENSION_WEIGHTS.industry) +
      (companySizeMatch.score * DIMENSION_WEIGHTS.companySize) +
      (workModeScore * DIMENSION_WEIGHTS.location) +
      (workStyleMatch.score * DIMENSION_WEIGHTS.workStyle) +
      (teamFitMatch.score * DIMENSION_WEIGHTS.teamFit) +
      (perfMatch.score * DIMENSION_WEIGHTS.performance) +
      (100 * 0.13) // Culture/Perks placeholder
  );

  const dealBreakers: string[] = [];
  if (salaryScore === 0) dealBreakers.push('Salary expectation too high');
  if (workStyleMatch.score === 0) dealBreakers.push('Incompatible work style');
  if (teamFitMatch.score === 0) dealBreakers.push('Team collaboration mismatch');

  return {
      overallScore: Math.round(weightedScore),
      details: {
          skills: skillsMatch,
          seniority: { score: seniorityScore, reason: '' },
          salary: { score: salaryScore, reason: '' },
          location: { score: workModeScore, reason: '' },
          workMode: { score: workModeScore, reason: '' },
          contract: { score: 100, reason: '' },
          culture: { score: 100, reason: '' },
          perks: { score: 100, reason: '' },
          industry: industryMatch,
          companySize: companySizeMatch,
          traits: { score: 100, reason: '' },
          workStyle: workStyleMatch,
          teamFit: teamFitMatch,
          performance: perfMatch
      },
      dealBreakers,
      recommendations: []
  };
};

export const calculateCandidateMatch = (criteria: TalentSearchCriteria, candidate: CandidateProfile): MatchBreakdown => {
    // Wrapper for search criteria matching
    return calculateMatch({ 
        requiredSkills: criteria.requiredSkills,
        workStyleRequirements: criteria.workStyleFilters,
        teamRequirements: criteria.teamFilters,
        seniority: criteria.seniority?.[0] || 'Senior',
        salaryMax: criteria.salaryMax,
        workMode: criteria.workMode?.[0] || 'Remote'
    } as any, candidate);
};
