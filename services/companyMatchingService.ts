import { supabase } from './supabaseClient';
import { CandidateProfile, CompanyProfile, JobSkill, Skill, WorkMode } from '../types';
import { mapCandidateFromDB, mapCompanyFromDB } from './dataMapperService';

// Types for company-level matching
export interface CompanyMatchDetails {
  score: number;
  reason: string;
}

export interface CompanyMatchBreakdown {
  overallScore: number;
  details: {
    skills: CompanyMatchDetails;
    industry: CompanyMatchDetails;
    culture: CompanyMatchDetails;
    compensation: CompanyMatchDetails;
    location: CompanyMatchDetails;
    stageFit: CompanyMatchDetails;
  };
}

export interface CompanyMatchCandidate extends CandidateProfile {
  companyMatchScore: number;
  companyMatchBreakdown: CompanyMatchBreakdown;
}

// Weights for each dimension
const WEIGHTS = {
  skills: 0.25,
  industry: 0.15,
  culture: 0.30,
  compensation: 0.15,
  location: 0.10,
  stageFit: 0.05,
};

// Estimate salary ranges based on funding stage
const FUNDING_STAGE_SALARY_RANGES: Record<string, { min: number; max: number }> = {
  'Pre-seed': { min: 50000, max: 100000 },
  'Seed': { min: 60000, max: 120000 },
  'Series A': { min: 80000, max: 150000 },
  'Series B': { min: 100000, max: 180000 },
  'Series C': { min: 120000, max: 220000 },
  'Series D+': { min: 130000, max: 250000 },
  'Public': { min: 130000, max: 280000 },
  'Bootstrapped': { min: 60000, max: 130000 },
};

// Map company size to org size preference categories
const COMPANY_SIZE_TO_ORG_PREF: Record<string, string[]> = {
  '1-10': ['tiny_under_10', 'small_10_50'],
  '11-50': ['small_10_50', 'tiny_under_10'],
  '51-200': ['medium_50_200', 'small_10_50'],
  '201-500': ['medium_50_200', 'large_200_1000'],
  '501-1000': ['large_200_1000', 'medium_50_200'],
  '1000+': ['enterprise_1000_plus', 'large_200_1000'],
};

/**
 * Calculate Jaccard similarity between two arrays
 */
function jaccardSimilarity(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1;
  if (arr1.length === 0 || arr2.length === 0) return 0;

  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const set2 = new Set(arr2.map(s => s.toLowerCase()));

  const intersection = [...set1].filter(x => set2.has(x)).length;
  const union = new Set([...set1, ...set2]).size;

  return union > 0 ? intersection / union : 0;
}

/**
 * Calculate skills match based on company's aggregated job requirements
 */
function calculateSkillsMatch(
  candidate: CandidateProfile,
  aggregatedSkills: JobSkill[]
): CompanyMatchDetails {
  if (!aggregatedSkills || aggregatedSkills.length === 0) {
    return { score: 50, reason: 'No job requirements to match against' };
  }

  const candidateSkillNames = new Set(
    (candidate.skills || []).map(s => s.name.toLowerCase())
  );

  let matchedWeight = 0;
  let totalWeight = 0;
  const matchedSkills: string[] = [];

  aggregatedSkills.forEach(jobSkill => {
    const weight = jobSkill.weight === 'required' ? 2 : 1;
    totalWeight += weight;

    if (candidateSkillNames.has(jobSkill.name.toLowerCase())) {
      matchedWeight += weight;
      matchedSkills.push(jobSkill.name);
    }
  });

  const score = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 50;
  const reason = matchedSkills.length > 0
    ? `${matchedSkills.length}/${aggregatedSkills.length} skills match`
    : 'Few skill overlaps';

  return { score, reason };
}

/**
 * Calculate industry match
 */
function calculateIndustryMatch(
  candidate: CandidateProfile,
  company: CompanyProfile
): CompanyMatchDetails {
  const candidateIndustries = candidate.interestedIndustries || [];
  const companyIndustries = company.industry || [];

  if (companyIndustries.length === 0) {
    return { score: 100, reason: 'No industry restrictions' };
  }

  const overlap = candidateIndustries.filter(i =>
    companyIndustries.some(ci => ci.toLowerCase() === i.toLowerCase())
  );

  if (overlap.length > 0) {
    return { score: 100, reason: `Interested in ${overlap[0]}` };
  }

  // Partial match if candidate has related industries or no preferences
  if (candidateIndustries.length === 0) {
    return { score: 70, reason: 'Open to industries' };
  }

  return { score: 40, reason: 'Different industry interests' };
}

/**
 * Calculate culture/values match
 */
function calculateCultureMatch(
  candidate: CandidateProfile,
  company: CompanyProfile
): CompanyMatchDetails {
  const candidateValues = candidate.values || [];
  const candidateTraits = candidate.characterTraits || [];
  const companyValues = company.values || [];
  const companyTraits = company.desiredTraits || [];

  // Calculate values similarity
  const valuesSimilarity = jaccardSimilarity(candidateValues, companyValues);

  // Calculate traits similarity
  const traitsSimilarity = jaccardSimilarity(candidateTraits, companyTraits);

  // Combined score (values weighted slightly more)
  const score = Math.round((valuesSimilarity * 0.6 + traitsSimilarity * 0.4) * 100);

  const matchedValues = candidateValues.filter(v =>
    companyValues.some(cv => cv.toLowerCase() === v.toLowerCase())
  );

  const reason = matchedValues.length > 0
    ? `Values: ${matchedValues.slice(0, 2).join(', ')}`
    : score > 50 ? 'Compatible culture' : 'Different values focus';

  return { score: Math.max(score, 30), reason };
}

/**
 * Calculate compensation match
 */
function calculateCompensationMatch(
  candidate: CandidateProfile,
  company: CompanyProfile
): CompanyMatchDetails {
  const fundingStage = company.fundingStage || 'Seed';
  const salaryRange = FUNDING_STAGE_SALARY_RANGES[fundingStage] || FUNDING_STAGE_SALARY_RANGES['Seed'];

  const candidateMin = candidate.salaryMin || 0;
  const candidateMax = candidate.salaryMax || candidateMin * 1.3;

  // Check if ranges overlap
  const rangesOverlap = candidateMin <= salaryRange.max && candidateMax >= salaryRange.min;

  if (rangesOverlap) {
    // Calculate overlap percentage
    const overlapStart = Math.max(candidateMin, salaryRange.min);
    const overlapEnd = Math.min(candidateMax, salaryRange.max);
    const overlapRange = overlapEnd - overlapStart;
    const candidateRange = candidateMax - candidateMin || 1;
    const overlapPct = Math.min(1, overlapRange / candidateRange);

    const score = Math.round(70 + overlapPct * 30);
    return { score, reason: 'Salary expectations align' };
  }

  // No overlap - check how far off
  if (candidateMin > salaryRange.max) {
    const diff = ((candidateMin - salaryRange.max) / salaryRange.max) * 100;
    const score = Math.max(20, 60 - diff);
    return { score, reason: 'Expects higher compensation' };
  }

  return { score: 80, reason: 'Within budget range' };
}

/**
 * Calculate location/remote match
 */
function calculateLocationMatch(
  candidate: CandidateProfile,
  company: CompanyProfile
): CompanyMatchDetails {
  const candidateWorkModes = candidate.preferredWorkMode || [];
  const companyRemotePolicy = (company.remotePolicy || '').toLowerCase();
  const companyLocation = company.headquartersLocation || '';

  // Check remote policy compatibility
  const isRemoteFirst = companyRemotePolicy.includes('remote') || companyRemotePolicy.includes('distributed');
  const isHybrid = companyRemotePolicy.includes('hybrid');
  const candidateWantsRemote = candidateWorkModes.includes(WorkMode.Remote);
  const candidateWantsHybrid = candidateWorkModes.includes(WorkMode.Hybrid);
  const candidateWantsOnsite = candidateWorkModes.includes(WorkMode.OnSite);

  if (isRemoteFirst && candidateWantsRemote) {
    return { score: 100, reason: 'Remote-friendly match' };
  }

  if (isHybrid && (candidateWantsHybrid || candidateWantsRemote)) {
    return { score: 90, reason: 'Hybrid arrangement works' };
  }

  // Check location match for on-site/hybrid
  if (companyLocation && candidate.location) {
    const sameCity = candidate.location.toLowerCase().includes(companyLocation.toLowerCase().split(',')[0]);
    if (sameCity && candidateWantsOnsite) {
      return { score: 100, reason: 'Same location' };
    }
    if (sameCity) {
      return { score: 85, reason: 'Near office location' };
    }
  }

  // Candidate willing to relocate
  if (candidate.willingToRelocate) {
    return { score: 70, reason: 'Open to relocation' };
  }

  // Fallback
  if (candidateWantsRemote && !isRemoteFirst) {
    return { score: 50, reason: 'Remote preference, on-site role' };
  }

  return { score: 60, reason: 'Location may need discussion' };
}

/**
 * Calculate stage/company size fit
 */
function calculateStageFitMatch(
  candidate: CandidateProfile,
  company: CompanyProfile
): CompanyMatchDetails {
  const companySize = company.companySizeRange || company.teamSize?.toString() || '11-50';
  const candidateOrgPref = candidate.teamCollaborationPreferences?.orgSizePreference;
  const candidateSizePrefs = candidate.preferredCompanySize || [];

  // Get compatible org preferences for this company size
  const compatiblePrefs = COMPANY_SIZE_TO_ORG_PREF[companySize] || ['small_10_50'];

  // Check teamCollaborationPreferences.orgSizePreference
  if (candidateOrgPref && compatiblePrefs.includes(candidateOrgPref)) {
    return { score: 100, reason: 'Ideal company size' };
  }

  // Check preferredCompanySize array
  if (candidateSizePrefs.length > 0) {
    const hasMatch = candidateSizePrefs.some(pref =>
      companySize.toLowerCase().includes(pref.toLowerCase()) ||
      pref.toLowerCase().includes(companySize.split('-')[0])
    );
    if (hasMatch) {
      return { score: 95, reason: 'Preferred company size' };
    }
  }

  // No explicit preference - neutral
  if (!candidateOrgPref && candidateSizePrefs.length === 0) {
    return { score: 75, reason: 'Flexible on company size' };
  }

  return { score: 50, reason: 'Different size preference' };
}

/**
 * Calculate overall company match for a candidate
 */
export function calculateCompanyMatch(
  candidate: CandidateProfile,
  company: CompanyProfile,
  aggregatedSkills: JobSkill[]
): CompanyMatchBreakdown {
  const skillsMatch = calculateSkillsMatch(candidate, aggregatedSkills);
  const industryMatch = calculateIndustryMatch(candidate, company);
  const cultureMatch = calculateCultureMatch(candidate, company);
  const compensationMatch = calculateCompensationMatch(candidate, company);
  const locationMatch = calculateLocationMatch(candidate, company);
  const stageFitMatch = calculateStageFitMatch(candidate, company);

  const overallScore = Math.round(
    skillsMatch.score * WEIGHTS.skills +
    industryMatch.score * WEIGHTS.industry +
    cultureMatch.score * WEIGHTS.culture +
    compensationMatch.score * WEIGHTS.compensation +
    locationMatch.score * WEIGHTS.location +
    stageFitMatch.score * WEIGHTS.stageFit
  );

  return {
    overallScore,
    details: {
      skills: skillsMatch,
      industry: industryMatch,
      culture: cultureMatch,
      compensation: compensationMatch,
      location: locationMatch,
      stageFit: stageFitMatch,
    },
  };
}

/**
 * Aggregate required skills from company's active jobs
 */
async function getCompanySkillProfile(companyId: string): Promise<JobSkill[]> {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('required_skills, required_skills_with_levels')
    .eq('company_id', companyId)
    .eq('status', 'published');

  if (!jobs || jobs.length === 0) {
    return [];
  }

  // Aggregate skills across all jobs with frequency weighting
  const skillMap = new Map<string, { skill: JobSkill; count: number }>();

  jobs.forEach(job => {
    const skills = job.required_skills_with_levels || job.required_skills || [];
    skills.forEach((skill: JobSkill) => {
      const key = skill.name.toLowerCase();
      const existing = skillMap.get(key);
      if (existing) {
        existing.count++;
        // Upgrade to required if any job requires it
        if (skill.weight === 'required') {
          existing.skill.weight = 'required';
        }
      } else {
        skillMap.set(key, { skill: { ...skill }, count: 1 });
      }
    });
  });

  // Sort by frequency and return top skills
  return Array.from(skillMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
    .map(entry => entry.skill);
}

/**
 * Get recommended candidates for a company
 */
export async function getRecommendedCandidates(
  companyId: string,
  limit: number = 4
): Promise<CompanyMatchCandidate[]> {
  // Fetch company profile
  const { data: company } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('id', companyId)
    .single();

  if (!company) {
    return [];
  }

  const mappedCompany = mapCompanyFromDB(company);

  // Get aggregated skill requirements from company's jobs
  const aggregatedSkills = await getCompanySkillProfile(companyId);

  // Fetch active candidates
  const { data: candidates } = await supabase
    .from('candidate_profiles')
    .select('*')
    .in('status', ['actively_looking', 'open_to_offers', 'happy_but_listening'])
    .order('created_at', { ascending: false })
    .limit(100); // Fetch more to filter down

  if (!candidates || candidates.length === 0) {
    return [];
  }

  // Map raw DB rows to CandidateProfile with camelCase fields
  const mappedCandidates = candidates.map(mapCandidateFromDB);

  // Calculate match scores for each candidate
  const scoredCandidates: CompanyMatchCandidate[] = mappedCandidates.map(candidate => {
    const matchBreakdown = calculateCompanyMatch(candidate, mappedCompany, aggregatedSkills);
    return {
      ...candidate,
      companyMatchScore: matchBreakdown.overallScore,
      companyMatchBreakdown: matchBreakdown,
    };
  });

  // Filter and sort
  return scoredCandidates
    .filter(c => c.companyMatchScore >= 65) // Lower threshold to ensure results
    .sort((a, b) => b.companyMatchScore - a.companyMatchScore)
    .slice(0, limit);
}

/**
 * Get recent candidates (for the de-emphasized feed)
 */
export async function getRecentCandidates(
  page: number = 0,
  pageSize: number = 9
): Promise<{ candidates: CandidateProfile[]; hasMore: boolean }> {
  const start = page * pageSize;
  const end = start + pageSize;

  const { data: candidates, count } = await supabase
    .from('candidate_profiles')
    .select('*', { count: 'exact' })
    .in('status', ['actively_looking', 'open_to_offers', 'happy_but_listening'])
    .order('created_at', { ascending: false })
    .range(start, end);

  return {
    candidates: (candidates || []).map(mapCandidateFromDB),
    hasMore: count ? start + pageSize < count : false,
  };
}
