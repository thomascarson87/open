// Market Intelligence Service
// Provides market data and analytics for candidates and companies
// Implements multi-tier caching to minimize API calls

import { supabase } from './supabaseClient';
import { CandidateProfile, Skill } from '../types';

// ============================================
// Caching Infrastructure
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Cache duration configurations (in milliseconds)
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000,        // 5 minutes - for user-specific data that changes often
  MEDIUM: 30 * 60 * 1000,      // 30 minutes - for semi-dynamic data
  LONG: 2 * 60 * 60 * 1000,    // 2 hours - for aggregate data
  DAILY: 24 * 60 * 60 * 1000,  // 24 hours - for market-wide statistics
};

// In-memory cache store
const memoryCache = new Map<string, CacheEntry<any>>();

// LocalStorage cache prefix
const CACHE_PREFIX = 'mi_cache_';

/**
 * Generate a cache key from function name and parameters
 */
function generateCacheKey(fnName: string, params: Record<string, any> = {}): string {
  const paramStr = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
    .join('|');
  return `${fnName}${paramStr ? `_${paramStr}` : ''}`;
}

/**
 * Get data from cache (memory first, then localStorage)
 */
function getFromCache<T>(key: string): T | null {
  const now = Date.now();

  // Try memory cache first
  const memEntry = memoryCache.get(key);
  if (memEntry && memEntry.expiresAt > now) {
    return memEntry.data as T;
  }

  // Try localStorage
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (stored) {
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (entry.expiresAt > now) {
        // Restore to memory cache
        memoryCache.set(key, entry);
        return entry.data;
      } else {
        // Clean up expired entry
        localStorage.removeItem(CACHE_PREFIX + key);
      }
    }
  } catch (e) {
    // localStorage might not be available
  }

  // Clean up expired memory cache entry
  if (memEntry) {
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Store data in cache (both memory and localStorage)
 */
function setInCache<T>(key: string, data: T, duration: number): void {
  const now = Date.now();
  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    expiresAt: now + duration,
  };

  // Store in memory
  memoryCache.set(key, entry);

  // Store in localStorage for persistence across page reloads
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (e) {
    // localStorage might be full or unavailable
    console.warn('Failed to persist cache to localStorage:', e);
  }
}

/**
 * Invalidate cache entries matching a pattern
 */
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    // Clear all cache
    memoryCache.clear();
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
    return;
  }

  // Clear matching entries
  memoryCache.forEach((_, key) => {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  });

  try {
    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith(CACHE_PREFIX) && k.includes(pattern)
    );
    keys.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
}

/**
 * Cached async function wrapper
 * Automatically handles caching with configurable duration
 */
async function withCache<T>(
  cacheKey: string,
  duration: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = getFromCache<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Only cache non-null results
  if (data !== null) {
    setInCache(cacheKey, data, duration);
  }

  return data;
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): { memoryEntries: number; localStorageEntries: number } {
  let localStorageEntries = 0;
  try {
    localStorageEntries = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).length;
  } catch (e) {}

  return {
    memoryEntries: memoryCache.size,
    localStorageEntries,
  };
}

// ============================================
// Type Definitions
// ============================================

export interface MarketPosition {
  candidateId: string;
  percentile: number;
  demandScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
  salaryBenchmark: {
    min: number;
    median: number;
    max: number;
    currency: string;
  };
}

export interface SalaryDistribution {
  role: string;
  location: string;
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  currency: string;
  sampleSize: number;
}

// Updated interface for skill supply/demand
export interface SkillSupplyDemand {
  skill: string;
  supply: number;      // Number of candidates with this skill
  demand: number;      // Number of jobs requiring this skill
  ratio: number;       // demand / supply (higher = more opportunity)
  supplyIndex: number; // Normalized 0-100
  demandIndex: number; // Normalized 0-100
  trend: 'rising' | 'stable' | 'declining';
  avgSalaryPremium: number;
}

export type SkillQuadrant = 'opportunity' | 'competitive' | 'saturated' | 'niche';

export interface ClassifiedSkill extends SkillSupplyDemand {
  quadrant: SkillQuadrant;
  isCandidate?: boolean; // True if this is one of the candidate's skills
}

export interface SkillUnlockOpportunity {
  skill: string;
  jobsUnlocked: number;
  exampleJobTitles: string[];
}

export interface SkillsMarketData {
  skills: ClassifiedSkill[];
  medianSupply: number;
  medianDemand: number;
  candidateSkills: ClassifiedSkill[];
  lastUpdated: string;
}

// Talent Pool Analysis Types
export interface TalentPoolCriteria {
  requiredSkills?: string[];
  preferredSkills?: string[];
  location?: string;
  salaryMax?: number;
  seniority?: string;
  workMode?: string;
  canonicalRoleId?: string;
  isRemoteFriendly?: boolean;
}

export interface TalentPoolResult {
  exactMatch: number;      // meets ALL required criteria
  strongMatch: number;     // meets 80%+ of required criteria
  partialMatch: number;    // meets 50-79% of required criteria
  potentialMatch: number;  // meets <50% but has relevant skills
  total: number;
  criteria: TalentPoolCriteria;
  lastUpdated: string;
}

export interface AnonymizedCandidate {
  id: string;
  headline: string;
  topSkills: string[];
  yearsExperience: number;
  location: string;
  seniority: string;
  status: string;
}

export interface TalentPoolSize {
  total: number;
  activelyLooking: number;
  openToOpportunities: number;
  matchQuality: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface JobPerformanceMetrics {
  jobId: string;
  views: number;
  applications: number;
  qualifiedApplications: number;
  avgTimeToApply: number;
  competitionScore: number;
}

export interface ProfileStrength {
  score: number;
  breakdown: {
    category: string;
    points: number;
    maxPoints: number;
    completed: boolean;
  }[];
}

export interface CandidateVisibility {
  totalViews: number;
  last7Days: number;
  last30Days: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

// Legacy cache variables (kept for backwards compatibility, now using unified cache)
const CACHE_DURATION = CACHE_DURATIONS.DAILY;

/**
 * Calculate profile strength score based on field completion
 * Returns 0-100 score with breakdown by category
 */
export function calculateProfileStrength(profile: CandidateProfile | null): ProfileStrength {
  if (!profile) {
    return {
      score: 0,
      breakdown: []
    };
  }

  const breakdown: ProfileStrength['breakdown'] = [];
  let totalPoints = 0;

  // Name (5 points)
  const hasName = !!(profile.name && profile.name.trim().length > 0);
  breakdown.push({ category: 'Name', points: hasName ? 5 : 0, maxPoints: 5, completed: hasName });
  if (hasName) totalPoints += 5;

  // Email (5 points)
  const hasEmail = !!(profile.email && profile.email.trim().length > 0);
  breakdown.push({ category: 'Email', points: hasEmail ? 5 : 0, maxPoints: 5, completed: hasEmail });
  if (hasEmail) totalPoints += 5;

  // Headline (5 points)
  const hasHeadline = !!(profile.headline && profile.headline.trim().length > 0);
  breakdown.push({ category: 'Headline', points: hasHeadline ? 5 : 0, maxPoints: 5, completed: hasHeadline });
  if (hasHeadline) totalPoints += 5;

  // Skills - at least 3 (15 points)
  const hasSkills = profile.skills && profile.skills.length >= 3;
  breakdown.push({ category: 'Skills (3+)', points: hasSkills ? 15 : 0, maxPoints: 15, completed: !!hasSkills });
  if (hasSkills) totalPoints += 15;

  // Experience - at least 1 (15 points)
  const hasExperience = profile.experience && profile.experience.length >= 1;
  breakdown.push({ category: 'Experience', points: hasExperience ? 15 : 0, maxPoints: 15, completed: !!hasExperience });
  if (hasExperience) totalPoints += 15;

  // Bio - at least 100 chars (10 points)
  const hasBio = profile.bio && profile.bio.trim().length >= 100;
  breakdown.push({ category: 'Bio (100+ chars)', points: hasBio ? 10 : 0, maxPoints: 10, completed: !!hasBio });
  if (hasBio) totalPoints += 10;

  // Salary expectations (10 points)
  const hasSalary = !!(profile.salaryMin && profile.salaryMin > 0) || !!(profile.salaryExpectation && profile.salaryExpectation.trim().length > 0);
  breakdown.push({ category: 'Salary expectations', points: hasSalary ? 10 : 0, maxPoints: 10, completed: hasSalary });
  if (hasSalary) totalPoints += 10;

  // Values - at least 2 (10 points)
  const hasValues = profile.values && profile.values.length >= 2;
  breakdown.push({ category: 'Values (2+)', points: hasValues ? 10 : 0, maxPoints: 10, completed: !!hasValues });
  if (hasValues) totalPoints += 10;

  // Character traits - at least 2 (10 points)
  const hasTraits = profile.characterTraits && profile.characterTraits.length >= 2;
  breakdown.push({ category: 'Character traits (2+)', points: hasTraits ? 10 : 0, maxPoints: 10, completed: !!hasTraits });
  if (hasTraits) totalPoints += 10;

  // Avatar (5 points)
  const hasAvatar = (profile.avatarUrls && profile.avatarUrls.length > 0) || !!profile.avatarUrl;
  breakdown.push({ category: 'Profile photo', points: hasAvatar ? 5 : 0, maxPoints: 5, completed: hasAvatar });
  if (hasAvatar) totalPoints += 5;

  // Education fields (5 points)
  const hasEducation = !!(profile.educationLevel || profile.educationField || profile.educationInstitution);
  breakdown.push({ category: 'Education', points: hasEducation ? 5 : 0, maxPoints: 5, completed: hasEducation });
  if (hasEducation) totalPoints += 5;

  // Work style preferences (5 points)
  const hasWorkStyle = profile.workStylePreferences && Object.keys(profile.workStylePreferences).length > 0;
  breakdown.push({ category: 'Work style preferences', points: hasWorkStyle ? 5 : 0, maxPoints: 5, completed: !!hasWorkStyle });
  if (hasWorkStyle) totalPoints += 5;

  // Total max is 100 points so far. Portfolio is bonus (can exceed 100 but we cap at 100)
  // Portfolio/certificates (5 points bonus - doesn't affect max)
  const hasPortfolio = profile.portfolio && profile.portfolio.length > 0;
  if (hasPortfolio) {
    breakdown.push({ category: 'Portfolio (bonus)', points: 5, maxPoints: 5, completed: true });
    totalPoints += 5;
  }

  // Cap at 100
  const finalScore = Math.min(totalPoints, 100);

  return {
    score: finalScore,
    breakdown
  };
}

/**
 * Get visibility metrics for a candidate
 * Queries profile_views table for view counts and trends
 */
export async function getCandidateVisibility(
  candidateId: string
): Promise<CandidateVisibility | null> {
  if (!candidateId) return null;

  const cacheKey = generateCacheKey('getCandidateVisibility', { candidateId });
  const cached = getFromCache<CandidateVisibility>(cacheKey);
  if (cached) return cached;

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { data: allViews, error: allError } = await supabase
      .from('profile_views')
      .select('viewed_at')
      .eq('candidate_id', candidateId);

    if (allError) {
      // Log full error for debugging - likely RLS policy issue
      console.error('profile_views query error:', {
        message: allError.message,
        code: allError.code,
        details: allError.details,
        hint: allError.hint
      });
      return {
        totalViews: 0,
        last7Days: 0,
        last30Days: 0,
        trend: 'stable',
        trendPercentage: 0
      };
    }

    if (!allViews || allViews.length === 0) {
      return {
        totalViews: 0,
        last7Days: 0,
        last30Days: 0,
        trend: 'stable',
        trendPercentage: 0
      };
    }

    const totalViews = allViews.length;
    const last7Days = allViews.filter(v => new Date(v.viewed_at) >= sevenDaysAgo).length;
    const last30Days = allViews.filter(v => new Date(v.viewed_at) >= thirtyDaysAgo).length;
    const previous7Days = allViews.filter(v => {
      const viewDate = new Date(v.viewed_at);
      return viewDate >= fourteenDaysAgo && viewDate < sevenDaysAgo;
    }).length;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendPercentage = 0;

    if (previous7Days > 0) {
      const change = ((last7Days - previous7Days) / previous7Days) * 100;
      trendPercentage = Math.round(Math.abs(change));
      if (change > 10) trend = 'up';
      else if (change < -10) trend = 'down';
    } else if (last7Days > 0) {
      trend = 'up';
      trendPercentage = 100;
    }

    const result = { totalViews, last7Days, last30Days, trend, trendPercentage };
    setInCache(cacheKey, result, CACHE_DURATIONS.SHORT); // 5 min cache for visibility
    return result;
  } catch (error) {
    console.error('Error fetching candidate visibility:', error);
    return { totalViews: 0, last7Days: 0, last30Days: 0, trend: 'stable', trendPercentage: 0 };
  }
}

/**
 * Normalize skill name for consistent comparison
 */
function normalizeSkillName(name: string): string {
  return name.toLowerCase().trim();
}

/**
 * Get supply and demand metrics for all skills in the market
 * Queries candidate_profiles.skills and jobs.required_skills
 * Results are cached for 24 hours
 */
export async function getSkillSupplyDemand(forceRefresh = false): Promise<SkillSupplyDemand[]> {
  const cacheKey = generateCacheKey('getSkillSupplyDemand');

  // Check cache unless force refresh
  if (!forceRefresh) {
    const cached = getFromCache<SkillSupplyDemand[]>(cacheKey);
    if (cached) return cached;
  }

  try {
    // Fetch all candidate skills
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidate_profiles')
      .select('skills, skills_with_levels');

    if (candidatesError) {
      console.error('Error fetching candidate skills:', candidatesError);
      return [];
    }

    // Fetch all active job requirements
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('required_skills, required_skills_with_levels, title')
      .eq('status', 'published');

    if (jobsError) {
      console.error('Error fetching job skills:', jobsError);
      return [];
    }

    // Count supply (candidates with each skill)
    const supplyMap = new Map<string, number>();
    candidates?.forEach(candidate => {
      const skills = candidate.skills_with_levels || candidate.skills || [];
      skills.forEach((skill: any) => {
        const name = normalizeSkillName(skill.name || skill);
        supplyMap.set(name, (supplyMap.get(name) || 0) + 1);
      });
    });

    // Count demand (jobs requiring each skill)
    const demandMap = new Map<string, number>();
    jobs?.forEach(job => {
      const skills = job.required_skills_with_levels || job.required_skills || [];
      skills.forEach((skill: any) => {
        const name = normalizeSkillName(skill.name || skill);
        demandMap.set(name, (demandMap.get(name) || 0) + 1);
      });
    });

    // Combine into unified skill list
    const allSkillNames = new Set([...supplyMap.keys(), ...demandMap.keys()]);
    const skillsData: SkillSupplyDemand[] = [];

    // Find max values for normalization
    let maxSupply = 1;
    let maxDemand = 1;
    allSkillNames.forEach(name => {
      maxSupply = Math.max(maxSupply, supplyMap.get(name) || 0);
      maxDemand = Math.max(maxDemand, demandMap.get(name) || 0);
    });

    allSkillNames.forEach(name => {
      const supply = supplyMap.get(name) || 0;
      const demand = demandMap.get(name) || 0;
      const ratio = supply > 0 ? demand / supply : demand > 0 ? Infinity : 0;

      skillsData.push({
        skill: name,
        supply,
        demand,
        ratio: isFinite(ratio) ? ratio : 999,
        supplyIndex: Math.round((supply / maxSupply) * 100),
        demandIndex: Math.round((demand / maxDemand) * 100),
        trend: 'stable', // Would need historical data to calculate
        avgSalaryPremium: 0 // Would need salary data to calculate
      });
    });

    // Sort by activity (supply + demand) and limit to top 200 for performance
    skillsData.sort((a, b) => (b.supply + b.demand) - (a.supply + a.demand));
    const limitedData = skillsData.slice(0, 200);

    // Update cache
    setInCache(cacheKey, limitedData, CACHE_DURATIONS.DAILY);

    return limitedData;
  } catch (error) {
    console.error('Error in getSkillSupplyDemand:', error);
    return [];
  }
}

/**
 * Classify skills into quadrants based on median supply/demand
 */
export function classifySkills(skillsData: SkillSupplyDemand[]): {
  classifiedSkills: ClassifiedSkill[];
  medianSupply: number;
  medianDemand: number;
} {
  if (!skillsData || skillsData.length === 0) {
    return { classifiedSkills: [], medianSupply: 0, medianDemand: 0 };
  }

  // Calculate medians
  const supplies = skillsData.map(s => s.supply).sort((a, b) => a - b);
  const demands = skillsData.map(s => s.demand).sort((a, b) => a - b);

  const medianSupply = supplies[Math.floor(supplies.length / 2)] || 0;
  const medianDemand = demands[Math.floor(demands.length / 2)] || 0;

  // Classify each skill
  const classifiedSkills: ClassifiedSkill[] = skillsData.map(skill => {
    let quadrant: SkillQuadrant;

    if (skill.demand > medianDemand && skill.supply < medianSupply) {
      quadrant = 'opportunity'; // High demand, low supply
    } else if (skill.demand > medianDemand && skill.supply >= medianSupply) {
      quadrant = 'competitive'; // High demand, high supply
    } else if (skill.demand <= medianDemand && skill.supply >= medianSupply) {
      quadrant = 'saturated'; // Low demand, high supply
    } else {
      quadrant = 'niche'; // Low demand, low supply
    }

    return { ...skill, quadrant };
  });

  return { classifiedSkills, medianSupply, medianDemand };
}

/**
 * Get a candidate's skills with their market position
 */
export async function getCandidateSkillPositions(
  candidateId: string,
  marketData?: SkillSupplyDemand[]
): Promise<SkillsMarketData | null> {
  if (!candidateId) return null;

  const cacheKey = generateCacheKey('getCandidateSkillPositions', { candidateId });
  const cached = getFromCache<SkillsMarketData>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch candidate's skills
    const { data: candidate, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('skills, skills_with_levels')
      .eq('id', candidateId)
      .maybeSingle();

    if (candidateError || !candidate) {
      console.error('Error fetching candidate:', candidateError);
      return null;
    }

    // Get market data if not provided
    const allSkillsData = marketData || await getSkillSupplyDemand();
    const { classifiedSkills, medianSupply, medianDemand } = classifySkills(allSkillsData);

    // Map candidate skills to market positions
    const candidateSkillNames = (candidate.skills_with_levels || candidate.skills || [])
      .map((s: any) => normalizeSkillName(s.name || s));

    // Create a map for quick lookup
    const skillsMap = new Map(classifiedSkills.map(s => [normalizeSkillName(s.skill), s]));

    // Mark candidate's skills
    const allSkillsWithFlags = classifiedSkills.map(skill => ({
      ...skill,
      isCandidate: candidateSkillNames.includes(normalizeSkillName(skill.skill))
    }));

    // Get just the candidate's skills
    const candidateSkills = candidateSkillNames
      .map((name: string) => {
        const marketSkill = skillsMap.get(name);
        if (marketSkill) {
          return { ...marketSkill, isCandidate: true };
        }
        // Skill exists for candidate but not in market data (very rare/new skill)
        return {
          skill: name,
          supply: 1,
          demand: 0,
          ratio: 0,
          supplyIndex: 0,
          demandIndex: 0,
          trend: 'stable' as const,
          avgSalaryPremium: 0,
          quadrant: 'niche' as SkillQuadrant,
          isCandidate: true
        };
      })
      .filter(Boolean) as ClassifiedSkill[];

    const result = {
      skills: allSkillsWithFlags,
      medianSupply,
      medianDemand,
      candidateSkills,
      lastUpdated: new Date().toISOString()
    };
    setInCache(cacheKey, result, CACHE_DURATIONS.MEDIUM); // 30 min cache
    return result;
  } catch (error) {
    console.error('Error in getCandidateSkillPositions:', error);
    return null;
  }
}

/**
 * Find skills that would unlock the most job opportunities for a candidate
 */
export async function getSkillUnlockOpportunities(
  candidateId: string
): Promise<SkillUnlockOpportunity[]> {
  if (!candidateId) return [];

  try {
    // Fetch candidate's skills
    const { data: candidate, error: candidateError } = await supabase
      .from('candidate_profiles')
      .select('skills, skills_with_levels')
      .eq('id', candidateId)
      .maybeSingle();

    if (candidateError || !candidate) {
      console.error('Error fetching candidate:', candidateError);
      return [];
    }

    const candidateSkillNames = new Set(
      (candidate.skills_with_levels || candidate.skills || [])
        .map((s: any) => normalizeSkillName(s.name || s))
    );

    // Fetch all active jobs with their required skills
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, required_skills, required_skills_with_levels')
      .eq('status', 'published');

    if (jobsError || !jobs) {
      console.error('Error fetching jobs:', jobsError);
      return [];
    }

    // For each job, check how many skills the candidate has
    // Track which single missing skill would complete the match
    const unlockMap = new Map<string, { count: number; jobTitles: string[] }>();

    jobs.forEach(job => {
      const requiredSkills = (job.required_skills_with_levels || job.required_skills || [])
        .map((s: any) => normalizeSkillName(s.name || s));

      if (requiredSkills.length === 0) return;

      // Count how many required skills the candidate has
      const matchedCount = requiredSkills.filter((skill: string) =>
        candidateSkillNames.has(skill)
      ).length;

      const matchPercentage = matchedCount / requiredSkills.length;

      // Only consider jobs where candidate matches 80%+ of skills
      // and is missing exactly 1-2 skills
      const missingSkills = requiredSkills.filter((skill: string) =>
        !candidateSkillNames.has(skill)
      );

      if (matchPercentage >= 0.8 && missingSkills.length >= 1 && missingSkills.length <= 2) {
        // This job would be unlocked by acquiring the missing skill(s)
        missingSkills.forEach((skill: string) => {
          const existing = unlockMap.get(skill) || { count: 0, jobTitles: [] };
          existing.count += 1;
          if (existing.jobTitles.length < 3) {
            existing.jobTitles.push(job.title);
          }
          unlockMap.set(skill, existing);
        });
      }
    });

    // Convert to array and sort by jobs unlocked
    const opportunities: SkillUnlockOpportunity[] = Array.from(unlockMap.entries())
      .map(([skill, data]) => ({
        skill,
        jobsUnlocked: data.count,
        exampleJobTitles: data.jobTitles
      }))
      .sort((a, b) => b.jobsUnlocked - a.jobsUnlocked)
      .slice(0, 5); // Top 5

    return opportunities;
  } catch (error) {
    console.error('Error in getSkillUnlockOpportunities:', error);
    return [];
  }
}

/**
 * Get market position data for a candidate
 * Shows how a candidate ranks in the market for their skills and experience
 */
export async function getCandidateMarketPosition(
  candidateId: string
): Promise<MarketPosition | null> {
  // Placeholder - will be implemented in later phases
  return null;
}

/**
 * Get salary distribution data for a role in a location
 * Provides salary percentiles based on market data
 */
export async function getSalaryDistribution(
  role: string,
  location: string
): Promise<SalaryDistribution | null> {
  // Placeholder - will be implemented in later phases
  return null;
}

/**
 * Map seniority level to years of experience range
 */
function getSeniorityYearsRange(seniority: string): { min: number; max: number } {
  const seniorityMap: Record<string, { min: number; max: number }> = {
    'Entry Level': { min: 0, max: 2 },
    'Mid Level': { min: 2, max: 5 },
    'Senior': { min: 5, max: 10 },
    'Lead': { min: 7, max: 15 },
    'Principal': { min: 10, max: 20 },
    'Executive': { min: 12, max: 30 }
  };
  return seniorityMap[seniority] || { min: 0, max: 100 };
}

/**
 * Check if candidate location matches job location
 * Remote candidates always match if job is remote-friendly
 */
function locationMatches(
  candidateLocation: string | undefined,
  jobLocation: string | undefined,
  candidateWorkModes: string[] | undefined,
  isRemoteFriendly: boolean
): boolean {
  if (!jobLocation) return true;

  // Remote candidates match remote-friendly jobs
  if (isRemoteFriendly && candidateWorkModes?.includes('Remote')) {
    return true;
  }

  if (!candidateLocation) return false;

  // Fuzzy location match (same city, state, or country)
  const normalizedCandidate = candidateLocation.toLowerCase();
  const normalizedJob = jobLocation.toLowerCase();

  // Direct match
  if (normalizedCandidate.includes(normalizedJob) || normalizedJob.includes(normalizedCandidate)) {
    return true;
  }

  // Check if same general area (e.g., "San Francisco" matches "SF Bay Area")
  const locationAliases: Record<string, string[]> = {
    'san francisco': ['sf', 'bay area', 'san francisco bay'],
    'new york': ['nyc', 'manhattan', 'brooklyn'],
    'los angeles': ['la', 'socal'],
    'london': ['uk', 'united kingdom'],
    'remote': ['anywhere', 'worldwide']
  };

  for (const [key, aliases] of Object.entries(locationAliases)) {
    if (normalizedJob.includes(key) || aliases.some(a => normalizedJob.includes(a))) {
      if (normalizedCandidate.includes(key) || aliases.some(a => normalizedCandidate.includes(a))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate match percentage for a candidate against criteria
 */
function calculateMatchPercentage(
  candidate: any,
  criteria: TalentPoolCriteria
): number {
  const checks: boolean[] = [];

  // Skills match
  if (criteria.requiredSkills && criteria.requiredSkills.length > 0) {
    const candidateSkills = (candidate.skills_with_levels || candidate.skills || [])
      .map((s: any) => (s.name || s).toLowerCase().trim());

    const requiredNormalized = criteria.requiredSkills.map(s => s.toLowerCase().trim());
    const matchedSkills = requiredNormalized.filter(skill =>
      candidateSkills.some((cs: string) => cs.includes(skill) || skill.includes(cs))
    );

    // Add a check for each required skill
    requiredNormalized.forEach(skill => {
      checks.push(candidateSkills.some((cs: string) => cs.includes(skill) || skill.includes(cs)));
    });
  }

  // Location match
  if (criteria.location) {
    checks.push(locationMatches(
      candidate.location,
      criteria.location,
      candidate.preferred_work_mode,
      criteria.isRemoteFriendly || criteria.workMode === 'Remote'
    ));
  }

  // Salary match
  if (criteria.salaryMax && criteria.salaryMax > 0) {
    const candidateSalaryMin = candidate.salary_min || 0;
    checks.push(candidateSalaryMin === 0 || candidateSalaryMin <= criteria.salaryMax);
  }

  // Seniority/Experience match
  if (criteria.seniority) {
    const range = getSeniorityYearsRange(criteria.seniority);
    const candidateYears = candidate.total_years_experience || 0;
    checks.push(candidateYears >= range.min && candidateYears <= range.max + 3); // +3 for flexibility
  }

  // Work mode match
  if (criteria.workMode) {
    const candidateWorkModes = candidate.preferred_work_mode || [];
    checks.push(
      candidateWorkModes.length === 0 || // No preference = flexible
      candidateWorkModes.includes(criteria.workMode) ||
      (criteria.workMode === 'Hybrid' && (candidateWorkModes.includes('Remote') || candidateWorkModes.includes('On-Site')))
    );
  }

  if (checks.length === 0) return 100;

  const passedChecks = checks.filter(Boolean).length;
  return Math.round((passedChecks / checks.length) * 100);
}

/**
 * Get talent pool size for given job criteria
 * Helps companies understand the available talent market
 */
export async function getTalentPoolSize(
  criteria: TalentPoolCriteria
): Promise<TalentPoolResult | null> {
  const cacheKey = generateCacheKey('getTalentPoolSize', criteria);
  const cached = getFromCache<TalentPoolResult>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch all candidates (we filter in JS for complex matching)
    const { data: candidates, error } = await supabase
      .from('candidate_profiles')
      .select('id, headline, skills, skills_with_levels, location, salary_min, total_years_experience, preferred_work_mode, status, experience');

    if (error) {
      console.error('Error fetching candidates for talent pool:', error);
      return null;
    }

    if (!candidates || candidates.length === 0) {
      return {
        exactMatch: 0,
        strongMatch: 0,
        partialMatch: 0,
        potentialMatch: 0,
        total: 0,
        criteria,
        lastUpdated: new Date().toISOString()
      };
    }

    let exactMatch = 0;
    let strongMatch = 0;
    let partialMatch = 0;
    let potentialMatch = 0;

    candidates.forEach(candidate => {
      const matchPercent = calculateMatchPercentage(candidate, criteria);

      if (matchPercent === 100) {
        exactMatch++;
      } else if (matchPercent >= 80) {
        strongMatch++;
      } else if (matchPercent >= 50) {
        partialMatch++;
      } else if (matchPercent > 0) {
        // Only count as potential if they have at least one relevant skill
        if (criteria.requiredSkills && criteria.requiredSkills.length > 0) {
          const candidateSkills = (candidate.skills_with_levels || candidate.skills || [])
            .map((s: any) => (s.name || s).toLowerCase().trim());
          const hasRelevantSkill = criteria.requiredSkills.some(skill =>
            candidateSkills.some((cs: string) => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
          );
          if (hasRelevantSkill) {
            potentialMatch++;
          }
        } else {
          potentialMatch++;
        }
      }
    });

    const result = {
      exactMatch,
      strongMatch,
      partialMatch,
      potentialMatch,
      total: exactMatch + strongMatch + partialMatch + potentialMatch,
      criteria,
      lastUpdated: new Date().toISOString()
    };
    setInCache(cacheKey, result, CACHE_DURATIONS.LONG); // 2 hour cache
    return result;
  } catch (error) {
    console.error('Error in getTalentPoolSize:', error);
    return null;
  }
}

/**
 * Get sample anonymized candidates matching criteria
 */
export async function getSampleCandidates(
  criteria: TalentPoolCriteria,
  limit: number = 5
): Promise<AnonymizedCandidate[]> {
  try {
    const { data: candidates, error } = await supabase
      .from('candidate_profiles')
      .select('id, headline, skills, skills_with_levels, location, total_years_experience, preferred_work_mode, status, experience')
      .limit(50); // Fetch more to filter

    if (error || !candidates) {
      console.error('Error fetching sample candidates:', error);
      return [];
    }

    // Filter and score candidates
    const scoredCandidates = candidates
      .map(candidate => ({
        candidate,
        matchPercent: calculateMatchPercentage(candidate, criteria)
      }))
      .filter(({ matchPercent }) => matchPercent >= 50)
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, limit);

    // Map to anonymized format
    return scoredCandidates.map(({ candidate }) => {
      const skills = (candidate.skills_with_levels || candidate.skills || [])
        .slice(0, 4)
        .map((s: any) => s.name || s);

      // Estimate seniority from experience
      const years = candidate.total_years_experience || 0;
      let seniority = 'Entry Level';
      if (years >= 10) seniority = 'Principal/Lead';
      else if (years >= 5) seniority = 'Senior';
      else if (years >= 2) seniority = 'Mid Level';

      // Anonymize location to region only
      let anonLocation = 'Undisclosed';
      if (candidate.location) {
        const loc = candidate.location.toLowerCase();
        if (loc.includes('remote') || loc.includes('anywhere')) anonLocation = 'Remote';
        else if (loc.includes('us') || loc.includes('united states') || loc.includes('california') || loc.includes('new york') || loc.includes('texas')) anonLocation = 'United States';
        else if (loc.includes('uk') || loc.includes('london') || loc.includes('united kingdom')) anonLocation = 'United Kingdom';
        else if (loc.includes('europe') || loc.includes('germany') || loc.includes('france')) anonLocation = 'Europe';
        else anonLocation = 'Other';
      }

      return {
        id: candidate.id,
        headline: candidate.headline || 'Technical Professional',
        topSkills: skills,
        yearsExperience: years,
        location: anonLocation,
        seniority,
        status: candidate.status || 'open_to_offers'
      };
    });
  } catch (error) {
    console.error('Error in getSampleCandidates:', error);
    return [];
  }
}

// ============================================
// Compensation Benchmarks Types & Functions
// ============================================

export interface CompanySalaryPosition {
  jobId: string;
  jobTitle: string;
  companySalary: {
    min: number;
    max: number;
    currency: string;
  };
  marketBenchmark: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    sampleSize: number;
  };
  percentile: number; // Where company's midpoint falls (0-100)
  gap: number; // % difference from market median (positive = above, negative = below)
  competitiveRating: 'below_market' | 'competitive' | 'above_market' | 'premium';
}

export interface PerkAlignment {
  alignedPerks: string[]; // Company perks that candidates want
  missingPerks: string[]; // Top candidate-desired perks company doesn't offer
  uniquePerks: string[]; // Company perks that are unique/differentiating
  alignmentScore: number; // 0-100 how well company perks match candidate desires
  topCandidatePerks: { perk: string; demandPercent: number }[]; // Most requested perks with %
}

/**
 * Get salary position for a job compared to market rates
 * Compares job salary to other jobs with similar role/seniority
 */
export async function getCompanySalaryPosition(
  jobId: string
): Promise<CompanySalaryPosition | null> {
  if (!jobId) return null;

  const cacheKey = generateCacheKey('getCompanySalaryPosition', { jobId });
  const cached = getFromCache<CompanySalaryPosition>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch the job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, salary_min, salary_max, salary_currency, seniority, canonical_role_id, location')
      .eq('id', jobId)
      .maybeSingle();

    if (jobError || !job) {
      console.error('Error fetching job for salary position:', jobError);
      return null;
    }

    // Need salary data to compare
    if (!job.salary_min && !job.salary_max) {
      return null;
    }

    // Fetch comparable jobs (same role/seniority, published)
    let query = supabase
      .from('jobs')
      .select('salary_min, salary_max, salary_currency')
      .eq('status', 'published')
      .not('salary_min', 'is', null)
      .neq('id', jobId);

    // Filter by canonical role if available
    if (job.canonical_role_id) {
      query = query.eq('canonical_role_id', job.canonical_role_id);
    }

    // Filter by seniority if available
    if (job.seniority) {
      query = query.eq('seniority', job.seniority);
    }

    const { data: comparableJobs, error: compareError } = await query.limit(100);

    if (compareError) {
      console.error('Error fetching comparable jobs:', compareError);
      return null;
    }

    // If no comparable jobs, use all jobs with salary data as fallback
    let salaryData = comparableJobs || [];
    if (salaryData.length < 5) {
      const { data: allJobs } = await supabase
        .from('jobs')
        .select('salary_min, salary_max, salary_currency')
        .eq('status', 'published')
        .not('salary_min', 'is', null)
        .neq('id', jobId)
        .limit(100);

      salaryData = allJobs || [];
    }

    if (salaryData.length === 0) {
      return null;
    }

    // Calculate midpoints and convert to same currency (assume USD for simplicity)
    const midpoints = salaryData
      .map(j => {
        const min = j.salary_min || 0;
        const max = j.salary_max || min;
        return (min + max) / 2;
      })
      .filter(m => m > 0)
      .sort((a, b) => a - b);

    if (midpoints.length === 0) return null;

    // Calculate percentiles
    const getPercentile = (arr: number[], p: number): number => {
      const index = (p / 100) * (arr.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      if (lower === upper) return arr[lower];
      return arr[lower] + (arr[upper] - arr[lower]) * (index - lower);
    };

    const marketBenchmark = {
      p10: Math.round(getPercentile(midpoints, 10)),
      p25: Math.round(getPercentile(midpoints, 25)),
      p50: Math.round(getPercentile(midpoints, 50)),
      p75: Math.round(getPercentile(midpoints, 75)),
      p90: Math.round(getPercentile(midpoints, 90)),
      sampleSize: midpoints.length
    };

    // Calculate company's position
    const companyMidpoint = ((job.salary_min || 0) + (job.salary_max || job.salary_min || 0)) / 2;

    // Find percentile rank
    const belowCount = midpoints.filter(m => m < companyMidpoint).length;
    const percentile = Math.round((belowCount / midpoints.length) * 100);

    // Calculate gap from median
    const gap = marketBenchmark.p50 > 0
      ? Math.round(((companyMidpoint - marketBenchmark.p50) / marketBenchmark.p50) * 100)
      : 0;

    // Determine competitive rating
    let competitiveRating: CompanySalaryPosition['competitiveRating'];
    if (percentile >= 75) {
      competitiveRating = 'premium';
    } else if (percentile >= 50) {
      competitiveRating = 'above_market';
    } else if (percentile >= 25) {
      competitiveRating = 'competitive';
    } else {
      competitiveRating = 'below_market';
    }

    const result = {
      jobId,
      jobTitle: job.title,
      companySalary: {
        min: job.salary_min || 0,
        max: job.salary_max || job.salary_min || 0,
        currency: job.salary_currency || 'USD'
      },
      marketBenchmark,
      percentile,
      gap,
      competitiveRating
    };
    setInCache(cacheKey, result, CACHE_DURATIONS.LONG); // 2 hour cache
    return result;
  } catch (error) {
    console.error('Error in getCompanySalaryPosition:', error);
    return null;
  }
}

/**
 * Compare company perks to top candidate-desired perks
 * Returns alignment score and gap analysis
 */
export async function getPerkAlignment(
  companyPerks: string[]
): Promise<PerkAlignment | null> {
  if (!companyPerks) return null;

  // Create a stable cache key from sorted perks
  const cacheKey = generateCacheKey('getPerkAlignment', { perks: [...companyPerks].sort().join(',') });
  const cached = getFromCache<PerkAlignment>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch all candidates to count perk preferences
    const { data: candidates, error } = await supabase
      .from('candidate_profiles')
      .select('desired_perks, must_have_perks');

    if (error) {
      console.error('Error fetching candidate perks:', error);
      return null;
    }

    // Count perk demand
    const perkDemand = new Map<string, number>();
    const totalCandidates = candidates?.length || 0;

    candidates?.forEach(candidate => {
      const allPerks = [
        ...(candidate.desired_perks || []),
        ...(candidate.must_have_perks || [])
      ];

      const uniquePerks = new Set(allPerks.map((p: string) => p.toLowerCase().trim()));
      uniquePerks.forEach(perk => {
        perkDemand.set(perk, (perkDemand.get(perk) || 0) + 1);
      });
    });

    // Sort perks by demand
    const sortedPerks = Array.from(perkDemand.entries())
      .sort((a, b) => b[1] - a[1]);

    // Get top 10 most desired perks
    const topCandidatePerks = sortedPerks.slice(0, 10).map(([perk, count]) => ({
      perk,
      demandPercent: totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0
    }));

    // Normalize company perks for comparison
    const normalizedCompanyPerks = companyPerks.map(p => p.toLowerCase().trim());
    const companyPerksSet = new Set(normalizedCompanyPerks);

    // Find aligned perks (company offers what candidates want)
    const alignedPerks: string[] = [];
    const missingPerks: string[] = [];

    topCandidatePerks.forEach(({ perk }) => {
      // Check for fuzzy match (partial string match)
      const isAligned = normalizedCompanyPerks.some(cp =>
        cp.includes(perk) || perk.includes(cp) ||
        // Common aliases
        (perk.includes('remote') && cp.includes('work from home')) ||
        (perk.includes('health') && cp.includes('medical')) ||
        (perk.includes('401k') && cp.includes('retirement')) ||
        (perk.includes('pto') && (cp.includes('vacation') || cp.includes('time off')))
      );

      if (isAligned) {
        alignedPerks.push(perk);
      } else {
        missingPerks.push(perk);
      }
    });

    // Find unique/differentiating perks (company offers but not commonly requested)
    const uniquePerks = normalizedCompanyPerks.filter(cp => {
      const demandCount = perkDemand.get(cp) || 0;
      // Unique if less than 10% of candidates ask for it
      return demandCount < totalCandidates * 0.1;
    });

    // Calculate alignment score
    // Weighted: top perks matter more
    let alignmentScore = 0;
    if (topCandidatePerks.length > 0) {
      const weights = topCandidatePerks.map((p, i) => ({
        ...p,
        weight: (topCandidatePerks.length - i) / topCandidatePerks.length // Higher weight for more demanded
      }));

      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
      const alignedWeight = weights
        .filter(w => alignedPerks.includes(w.perk))
        .reduce((sum, w) => sum + w.weight, 0);

      alignmentScore = Math.round((alignedWeight / totalWeight) * 100);
    }

    const result = {
      alignedPerks,
      missingPerks: missingPerks.slice(0, 5), // Top 5 missing
      uniquePerks: uniquePerks.slice(0, 5), // Top 5 unique
      alignmentScore,
      topCandidatePerks
    };
    setInCache(cacheKey, result, CACHE_DURATIONS.LONG); // 2 hour cache
    return result;
  } catch (error) {
    console.error('Error in getPerkAlignment:', error);
    return null;
  }
}

// ============================================
// Job Performance Types & Functions
// ============================================

export type DateRange = '7d' | '30d' | '90d' | 'all';

export interface JobPerformanceData {
  jobId: string;
  views: number;
  saves: number;
  applications: number;
  conversions: {
    viewToSave: number;
    saveToApply: number;
    viewToApply: number;
  };
  trend: {
    viewsChange: number;
    savesChange: number;
    appsChange: number;
  };
  dateRange: DateRange;
}

export interface PlatformBenchmarks {
  avgViewToSave: number;
  avgSaveToApply: number;
  avgViewToApply: number;
  sampleSize: number;
  lastUpdated: string;
}

export interface AttractivenessBreakdown {
  factor: string;
  score: number;
  maxScore: number;
  weight: number;
  insight: string;
  status: 'good' | 'warning' | 'poor';
}

export interface AttractivenessScore {
  score: number;
  breakdown: AttractivenessBreakdown[];
  topRecommendations: {
    action: string;
    impact: 'high' | 'medium' | 'low';
    editSection?: string;
  }[];
}

// Benchmarks use the unified cache system

/**
 * Get date range boundaries
 */
function getDateRangeBoundaries(range: DateRange): { start: Date; previousStart: Date; previousEnd: Date } {
  const now = new Date();
  let start: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (range) {
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      previousEnd = new Date(start.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousEnd = new Date(start.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      previousEnd = new Date(start.getTime() - 1);
      previousStart = new Date(previousEnd.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
    default:
      start = new Date(0); // Beginning of time
      previousStart = new Date(0);
      previousEnd = new Date(0);
      break;
  }

  return { start, previousStart, previousEnd };
}

/**
 * Get performance metrics for a job posting
 * Includes views, saves, applications, and conversion rates
 */
export async function getJobPerformanceMetrics(
  jobId: string,
  dateRange: DateRange = '30d'
): Promise<JobPerformanceData | null> {
  if (!jobId) return null;

  const cacheKey = generateCacheKey('getJobPerformanceMetrics', { jobId, dateRange });
  const cached = getFromCache<JobPerformanceData>(cacheKey);
  if (cached) return cached;

  try {
    const { start, previousStart, previousEnd } = getDateRangeBoundaries(dateRange);

    // Query views from widget_analytics
    let viewsQuery = supabase
      .from('widget_analytics')
      .select('id, created_at')
      .eq('job_id', jobId)
      .eq('event_type', 'job_view');

    if (dateRange !== 'all') {
      viewsQuery = viewsQuery.gte('created_at', start.toISOString());
    }

    const { data: viewsData, error: viewsError } = await viewsQuery;

    if (viewsError) {
      console.error('Error fetching job views:', viewsError);
    }

    // Query saves from candidate_saved_jobs
    let savesQuery = supabase
      .from('candidate_saved_jobs')
      .select('id, created_at')
      .eq('job_id', jobId);

    if (dateRange !== 'all') {
      savesQuery = savesQuery.gte('created_at', start.toISOString());
    }

    const { data: savesData, error: savesError } = await savesQuery;

    if (savesError) {
      console.error('Error fetching job saves:', savesError);
    }

    // Query applications
    let appsQuery = supabase
      .from('applications')
      .select('id, created_at')
      .eq('job_id', jobId);

    if (dateRange !== 'all') {
      appsQuery = appsQuery.gte('created_at', start.toISOString());
    }

    const { data: appsData, error: appsError } = await appsQuery;

    if (appsError) {
      console.error('Error fetching applications:', appsError);
    }

    const views = viewsData?.length || 0;
    const saves = savesData?.length || 0;
    const applications = appsData?.length || 0;

    // Calculate conversion rates
    const conversions = {
      viewToSave: views > 0 ? Math.round((saves / views) * 1000) / 10 : 0,
      saveToApply: saves > 0 ? Math.round((applications / saves) * 1000) / 10 : 0,
      viewToApply: views > 0 ? Math.round((applications / views) * 1000) / 10 : 0
    };

    // Calculate trends (compare to previous period)
    let trend = { viewsChange: 0, savesChange: 0, appsChange: 0 };

    if (dateRange !== 'all') {
      // Get previous period data
      const { data: prevViews } = await supabase
        .from('widget_analytics')
        .select('id')
        .eq('job_id', jobId)
        .eq('event_type', 'job_view')
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString());

      const { data: prevSaves } = await supabase
        .from('candidate_saved_jobs')
        .select('id')
        .eq('job_id', jobId)
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString());

      const { data: prevApps } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .gte('created_at', previousStart.toISOString())
        .lte('created_at', previousEnd.toISOString());

      const prevViewsCount = prevViews?.length || 0;
      const prevSavesCount = prevSaves?.length || 0;
      const prevAppsCount = prevApps?.length || 0;

      trend = {
        viewsChange: prevViewsCount > 0 ? Math.round(((views - prevViewsCount) / prevViewsCount) * 100) : views > 0 ? 100 : 0,
        savesChange: prevSavesCount > 0 ? Math.round(((saves - prevSavesCount) / prevSavesCount) * 100) : saves > 0 ? 100 : 0,
        appsChange: prevAppsCount > 0 ? Math.round(((applications - prevAppsCount) / prevAppsCount) * 100) : applications > 0 ? 100 : 0
      };
    }

    const result = {
      jobId,
      views,
      saves,
      applications,
      conversions,
      trend,
      dateRange
    };
    setInCache(cacheKey, result, CACHE_DURATIONS.SHORT); // 5 min cache for performance data
    return result;
  } catch (error) {
    console.error('Error in getJobPerformanceMetrics:', error);
    return null;
  }
}

/**
 * Get platform-wide benchmark conversion rates
 * Cached for 24 hours
 */
export async function getPlatformBenchmarks(forceRefresh = false): Promise<PlatformBenchmarks | null> {
  const cacheKey = generateCacheKey('getPlatformBenchmarks');

  // Check cache unless force refresh
  if (!forceRefresh) {
    const cached = getFromCache<PlatformBenchmarks>(cacheKey);
    if (cached) return cached;
  }

  try {
    // Get all active jobs
    const { data: activeJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('status', 'published')
      .limit(200);

    if (jobsError || !activeJobs || activeJobs.length === 0) {
      console.error('Error fetching active jobs:', jobsError);
      return null;
    }

    const jobIds = activeJobs.map(j => j.id);

    // Get total views across all jobs
    const { count: totalViews } = await supabase
      .from('widget_analytics')
      .select('*', { count: 'exact', head: true })
      .in('job_id', jobIds)
      .eq('event_type', 'job_view');

    // Get total saves
    const { count: totalSaves } = await supabase
      .from('candidate_saved_jobs')
      .select('*', { count: 'exact', head: true })
      .in('job_id', jobIds);

    // Get total applications
    const { count: totalApps } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .in('job_id', jobIds);

    const views = totalViews || 0;
    const saves = totalSaves || 0;
    const apps = totalApps || 0;

    const benchmarks: PlatformBenchmarks = {
      avgViewToSave: views > 0 ? Math.round((saves / views) * 1000) / 10 : 5, // Default 5% if no data
      avgSaveToApply: saves > 0 ? Math.round((apps / saves) * 1000) / 10 : 20, // Default 20%
      avgViewToApply: views > 0 ? Math.round((apps / views) * 1000) / 10 : 1, // Default 1%
      sampleSize: jobIds.length,
      lastUpdated: new Date().toISOString()
    };

    // Update cache
    setInCache(cacheKey, benchmarks, CACHE_DURATIONS.DAILY);

    return benchmarks;
  } catch (error) {
    console.error('Error in getPlatformBenchmarks:', error);
    return null;
  }
}

/**
 * Calculate attractiveness score for a job
 * Combines salary competitiveness, perk alignment, skill requirements, and conversion rates
 */
export async function calculateAttractiveness(
  jobId: string
): Promise<AttractivenessScore | null> {
  if (!jobId) return null;

  try {
    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, company_profiles(perks)')
      .eq('id', jobId)
      .maybeSingle();

    if (jobError || !job) {
      console.error('Error fetching job for attractiveness:', jobError);
      return null;
    }

    const breakdown: AttractivenessBreakdown[] = [];
    const recommendations: AttractivenessScore['topRecommendations'] = [];

    // Factor 1: Salary Competitiveness (25%)
    let salaryScore = 50; // Default middle score
    let salaryInsight = 'No salary data available';

    if (job.salary_min || job.salary_max) {
      const salaryPosition = await getCompanySalaryPosition(jobId);
      if (salaryPosition) {
        // Map percentile to score (0-100 percentile -> 0-100 score)
        salaryScore = salaryPosition.percentile;
        if (salaryPosition.competitiveRating === 'premium') {
          salaryInsight = 'Excellent! Your salary is in the top 25% of similar roles';
        } else if (salaryPosition.competitiveRating === 'above_market') {
          salaryInsight = 'Good positioning above market median';
        } else if (salaryPosition.competitiveRating === 'competitive') {
          salaryInsight = 'Within competitive range but room to improve';
          recommendations.push({
            action: 'Consider increasing salary range by 10-15% to attract more candidates',
            impact: 'high',
            editSection: 'salary'
          });
        } else {
          salaryInsight = `Below market median by ${Math.abs(salaryPosition.gap)}%`;
          recommendations.push({
            action: `Increase salary range to match market median (${salaryPosition.gap}% gap)`,
            impact: 'high',
            editSection: 'salary'
          });
        }
      }
    } else {
      salaryInsight = 'Add salary range to improve visibility';
      recommendations.push({
        action: 'Add a salary range to your job posting',
        impact: 'high',
        editSection: 'salary'
      });
    }

    breakdown.push({
      factor: 'Salary Competitiveness',
      score: salaryScore,
      maxScore: 100,
      weight: 25,
      insight: salaryInsight,
      status: salaryScore >= 70 ? 'good' : salaryScore >= 40 ? 'warning' : 'poor'
    });

    // Factor 2: Perk Alignment (20%)
    let perkScore = 50;
    let perkInsight = 'No perks configured';

    const companyPerks = job.company_profiles?.perks || job.perks || [];
    if (companyPerks.length > 0) {
      const perkAlignment = await getPerkAlignment(companyPerks);
      if (perkAlignment) {
        perkScore = perkAlignment.alignmentScore;
        const alignedCount = perkAlignment.alignedPerks.length;
        const topCount = perkAlignment.topCandidatePerks.length;
        perkInsight = `${alignedCount} of top ${topCount} desired perks offered`;

        if (perkScore < 50 && perkAlignment.missingPerks.length > 0) {
          recommendations.push({
            action: `Add popular perks: ${perkAlignment.missingPerks.slice(0, 2).join(', ')}`,
            impact: 'medium',
            editSection: 'perks'
          });
        }
      }
    } else {
      recommendations.push({
        action: 'Add company perks to attract more candidates',
        impact: 'medium',
        editSection: 'perks'
      });
    }

    breakdown.push({
      factor: 'Perk Alignment',
      score: perkScore,
      maxScore: 100,
      weight: 20,
      insight: perkInsight,
      status: perkScore >= 70 ? 'good' : perkScore >= 40 ? 'warning' : 'poor'
    });

    // Factor 3: Skill Requirements Realism (15%)
    const requiredSkills = job.required_skills_with_levels || job.required_skills || [];
    const skillCount = requiredSkills.length;

    // Get average skill count from similar jobs
    const { data: similarJobs } = await supabase
      .from('jobs')
      .select('required_skills, required_skills_with_levels')
      .eq('status', 'published')
      .neq('id', jobId)
      .limit(50);

    let avgSkillCount = 5; // Default
    if (similarJobs && similarJobs.length > 0) {
      const counts = similarJobs.map(j =>
        (j.required_skills_with_levels || j.required_skills || []).length
      );
      avgSkillCount = Math.round(counts.reduce((a, b) => a + b, 0) / counts.length);
    }

    let skillScore = 100;
    let skillInsight = 'Reasonable skill requirements';

    if (skillCount > avgSkillCount * 1.5) {
      const overagePercent = Math.round(((skillCount - avgSkillCount) / avgSkillCount) * 100);
      skillScore = Math.max(0, 100 - overagePercent);
      skillInsight = `${overagePercent}% more skills required than similar roles (${skillCount} vs ${avgSkillCount} avg)`;
      recommendations.push({
        action: `Reduce required skills from ${skillCount} to ${avgSkillCount}`,
        impact: 'medium',
        editSection: 'skills'
      });
    } else if (skillCount > avgSkillCount) {
      skillScore = 80;
      skillInsight = `Slightly above average skill requirements (${skillCount} vs ${avgSkillCount} avg)`;
    } else if (skillCount === 0) {
      skillScore = 50;
      skillInsight = 'No skills specified - consider adding key requirements';
    }

    breakdown.push({
      factor: 'Skill Requirements',
      score: skillScore,
      maxScore: 100,
      weight: 15,
      insight: skillInsight,
      status: skillScore >= 70 ? 'good' : skillScore >= 40 ? 'warning' : 'poor'
    });

    // Factor 4: Conversion Performance (25%)
    const performance = await getJobPerformanceMetrics(jobId, '30d');
    const benchmarks = await getPlatformBenchmarks();

    let conversionScore = 50;
    let conversionInsight = 'Not enough data to assess';

    if (performance && benchmarks && performance.views >= 10) {
      // Compare to benchmarks
      const viewToSaveRatio = benchmarks.avgViewToSave > 0
        ? performance.conversions.viewToSave / benchmarks.avgViewToSave
        : 1;
      const viewToApplyRatio = benchmarks.avgViewToApply > 0
        ? performance.conversions.viewToApply / benchmarks.avgViewToApply
        : 1;

      // Score based on how well job converts compared to average
      const avgRatio = (viewToSaveRatio + viewToApplyRatio) / 2;
      conversionScore = Math.min(100, Math.round(avgRatio * 50 + 25)); // Scale: 0.5x = 50, 1x = 75, 1.5x = 100

      if (avgRatio >= 1.2) {
        conversionInsight = 'Excellent conversion rates - outperforming platform average';
      } else if (avgRatio >= 0.8) {
        conversionInsight = 'Conversion rates in line with platform average';
      } else {
        conversionInsight = `Conversions ${Math.round((1 - avgRatio) * 100)}% below platform average`;

        if (performance.conversions.viewToSave < benchmarks.avgViewToSave * 0.7) {
          recommendations.push({
            action: 'Improve job title and description to increase save rate',
            impact: 'high',
            editSection: 'description'
          });
        }
      }
    } else if (performance && performance.views < 10) {
      conversionInsight = 'Need more views to assess conversion performance';
    }

    breakdown.push({
      factor: 'Conversion Performance',
      score: conversionScore,
      maxScore: 100,
      weight: 25,
      insight: conversionInsight,
      status: conversionScore >= 70 ? 'good' : conversionScore >= 40 ? 'warning' : 'poor'
    });

    // Factor 5: Description Completeness (15%)
    let descriptionScore = 0;
    const descChecks = [
      { check: !!job.description && job.description.length >= 200, points: 25, label: 'description' },
      { check: !!job.location, points: 15, label: 'location' },
      { check: !!job.work_mode, points: 10, label: 'work mode' },
      { check: !!job.seniority, points: 10, label: 'seniority' },
      { check: requiredSkills.length >= 3, points: 15, label: 'skills (3+)' },
      { check: !!(job.salary_min || job.salary_max), points: 15, label: 'salary' },
      { check: (job.perks || []).length >= 2, points: 10, label: 'perks' }
    ];

    const missing: string[] = [];
    descChecks.forEach(({ check, points, label }) => {
      if (check) {
        descriptionScore += points;
      } else {
        missing.push(label);
      }
    });

    let descInsight = descriptionScore >= 80 ? 'Well-detailed job posting' : `Missing: ${missing.slice(0, 3).join(', ')}`;

    breakdown.push({
      factor: 'Description Completeness',
      score: descriptionScore,
      maxScore: 100,
      weight: 15,
      insight: descInsight,
      status: descriptionScore >= 70 ? 'good' : descriptionScore >= 40 ? 'warning' : 'poor'
    });

    if (descriptionScore < 70 && missing.length > 0) {
      recommendations.push({
        action: `Complete job posting: add ${missing[0]}`,
        impact: 'medium',
        editSection: 'details'
      });
    }

    // Calculate weighted total score
    const totalScore = Math.round(
      breakdown.reduce((sum, item) => sum + (item.score * item.weight / 100), 0)
    );

    // Sort recommendations by impact
    const impactOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

    return {
      score: totalScore,
      breakdown,
      topRecommendations: recommendations.slice(0, 3)
    };
  } catch (error) {
    console.error('Error in calculateAttractiveness:', error);
    return null;
  }
}

// ============================================
// Culture Matching Types & Functions
// ============================================

export type ValuesRating = 'strong' | 'good' | 'moderate' | 'low';

export interface ValuesAlignmentResult {
  score: number | null;
  rating: ValuesRating | null;
  shared: string[];
  candidateUnique: string[];
  targetUnique: string[];
}

export type WorkStyleStatus = 'aligned' | 'flexible' | 'misaligned';

export interface WorkStyleDimension {
  name: string;
  candidatePreference: string | null;
  companyExpectation: string | null;
  compatibility: number;
  status: WorkStyleStatus;
}

export interface WorkStyleCompatibilityResult {
  overallScore: number;
  dimensions: WorkStyleDimension[];
  alignedCount: number;
  totalDimensions: number;
}

export interface CultureFitResult {
  overallScore: number;
  valuesAlignment: ValuesAlignmentResult;
  workStyleCompatibility: WorkStyleCompatibilityResult;
  summary: {
    strengths: string[];
    watchOuts: string[];
  };
}

export interface WorkStyleMarketFitDimension {
  name: string;
  candidatePreference: string;
  marketFitPercent: number;
  marketCount: number;
}

export interface WorkStyleMarketFitResult {
  dimensions: WorkStyleMarketFitDimension[];
}

export interface WorkStylePreferences {
  leadership_style?: string;
  feedback_frequency?: string;
  communication_style?: string;
  meeting_culture?: string;
  conflict_resolution?: string;
}

// Style adjacency maps for compatibility scoring
const STYLE_ADJACENCY: Record<string, Record<string, Record<string, number>>> = {
  leadership_style: {
    hands_off: { coaching: 70, collaborative: 50, directive: 20, servant_leader: 50 },
    coaching: { hands_off: 70, collaborative: 90, directive: 40, servant_leader: 80 },
    collaborative: { hands_off: 50, coaching: 90, directive: 50, servant_leader: 90 },
    directive: { hands_off: 20, coaching: 40, collaborative: 50, servant_leader: 40 },
    servant_leader: { hands_off: 50, coaching: 80, collaborative: 90, directive: 40 }
  },
  feedback_frequency: {
    continuous: { daily: 80, weekly: 50, biweekly: 30, milestone_based: 40 },
    daily: { continuous: 80, weekly: 70, biweekly: 40, milestone_based: 30 },
    weekly: { continuous: 50, daily: 70, biweekly: 80, milestone_based: 60 },
    biweekly: { continuous: 30, daily: 40, weekly: 80, milestone_based: 70 },
    milestone_based: { continuous: 40, daily: 30, weekly: 60, biweekly: 70 }
  },
  communication_style: {
    async_first: { sync_heavy: 30, balanced: 70, documentation_driven: 90 },
    sync_heavy: { async_first: 30, balanced: 70, documentation_driven: 40 },
    balanced: { async_first: 70, sync_heavy: 70, documentation_driven: 70 },
    documentation_driven: { async_first: 90, sync_heavy: 40, balanced: 70 }
  },
  meeting_culture: {
    minimal: { daily_standup: 40, regular_syncs: 50, as_needed: 90 },
    daily_standup: { minimal: 40, regular_syncs: 80, as_needed: 50 },
    regular_syncs: { minimal: 50, daily_standup: 80, as_needed: 60 },
    as_needed: { minimal: 90, daily_standup: 50, regular_syncs: 60 }
  },
  conflict_resolution: {
    direct: { mediated: 60, avoid_escalate: 30, collaborative_resolution: 70 },
    mediated: { direct: 60, avoid_escalate: 50, collaborative_resolution: 80 },
    avoid_escalate: { direct: 30, mediated: 50, collaborative_resolution: 40 },
    collaborative_resolution: { direct: 70, mediated: 80, avoid_escalate: 40 }
  }
};

// Dimension display names
const DIMENSION_DISPLAY_NAMES: Record<string, string> = {
  leadership_style: 'Leadership Style',
  feedback_frequency: 'Feedback Frequency',
  communication_style: 'Communication Style',
  meeting_culture: 'Meeting Culture',
  conflict_resolution: 'Conflict Resolution'
};

/**
 * Calculate values alignment between candidate and target (company/job)
 * Uses Jaccard similarity on combined values + traits
 */
export function calculateValuesAlignment(
  candidateValues: string[] | null | undefined,
  candidateTraits: string[] | null | undefined,
  targetValues: string[] | null | undefined,
  targetTraits: string[] | null | undefined
): ValuesAlignmentResult {
  // Normalize and combine arrays
  const normalize = (arr: string[] | null | undefined): string[] =>
    (arr || []).map(s => s.toLowerCase().trim()).filter(Boolean);

  const candidateCombined = [...new Set([...normalize(candidateValues), ...normalize(candidateTraits)])];
  const targetCombined = [...new Set([...normalize(targetValues), ...normalize(targetTraits)])];

  // If either side has no data, return null score
  if (candidateCombined.length === 0 || targetCombined.length === 0) {
    return {
      score: null,
      rating: null,
      shared: [],
      candidateUnique: candidateCombined,
      targetUnique: targetCombined
    };
  }

  // Calculate intersection and union
  const candidateSet = new Set(candidateCombined);
  const targetSet = new Set(targetCombined);

  const shared = candidateCombined.filter(v => targetSet.has(v));
  const candidateUnique = candidateCombined.filter(v => !targetSet.has(v));
  const targetUnique = targetCombined.filter(v => !candidateSet.has(v));

  // Union = all unique values
  const union = new Set([...candidateCombined, ...targetCombined]);

  // Jaccard similarity
  const score = Math.round((shared.length / union.size) * 100);

  // Determine rating
  let rating: ValuesRating;
  if (score >= 70) rating = 'strong';
  else if (score >= 50) rating = 'good';
  else if (score >= 30) rating = 'moderate';
  else rating = 'low';

  return {
    score,
    rating,
    shared,
    candidateUnique,
    targetUnique
  };
}

/**
 * Calculate work style compatibility between candidate and company preferences
 */
export function calculateWorkStyleCompatibility(
  candidatePrefs: WorkStylePreferences | null | undefined,
  companyPrefs: WorkStylePreferences | null | undefined
): WorkStyleCompatibilityResult {
  const dimensions: WorkStyleDimension[] = [];
  const dimensionKeys: (keyof WorkStylePreferences)[] = [
    'leadership_style',
    'feedback_frequency',
    'communication_style',
    'meeting_culture',
    'conflict_resolution'
  ];

  const candPrefs = candidatePrefs || {};
  const compPrefs = companyPrefs || {};

  dimensionKeys.forEach(key => {
    const candidateValue = candPrefs[key]?.toLowerCase().trim() || null;
    const companyValue = compPrefs[key]?.toLowerCase().trim() || null;

    // Skip if either is missing
    if (!candidateValue || !companyValue) {
      return;
    }

    let compatibility: number;

    // Exact match
    if (candidateValue === companyValue) {
      compatibility = 100;
    } else {
      // Check adjacency map
      const adjacencyMap = STYLE_ADJACENCY[key];
      if (adjacencyMap && adjacencyMap[candidateValue] && adjacencyMap[candidateValue][companyValue] !== undefined) {
        compatibility = adjacencyMap[candidateValue][companyValue];
      } else if (adjacencyMap && adjacencyMap[companyValue] && adjacencyMap[companyValue][candidateValue] !== undefined) {
        // Try reverse lookup
        compatibility = adjacencyMap[companyValue][candidateValue];
      } else {
        // Unknown combination - default to moderate
        compatibility = 50;
      }
    }

    // Determine status
    let status: WorkStyleStatus;
    if (compatibility >= 70) status = 'aligned';
    else if (compatibility >= 40) status = 'flexible';
    else status = 'misaligned';

    dimensions.push({
      name: DIMENSION_DISPLAY_NAMES[key] || key,
      candidatePreference: candidateValue,
      companyExpectation: companyValue,
      compatibility,
      status
    });
  });

  // Calculate overall score (average of scored dimensions)
  const overallScore = dimensions.length > 0
    ? Math.round(dimensions.reduce((sum, d) => sum + d.compatibility, 0) / dimensions.length)
    : 0;

  const alignedCount = dimensions.filter(d => d.status === 'aligned').length;

  return {
    overallScore,
    dimensions,
    alignedCount,
    totalDimensions: dimensions.length
  };
}

/**
 * Calculate comprehensive culture fit between candidate and company/job
 */
export async function calculateCultureFit(
  candidateId: string,
  companyId: string,
  jobId?: string
): Promise<CultureFitResult | null> {
  if (!candidateId || !companyId) return null;

  const cacheKey = generateCacheKey('calculateCultureFit', { candidateId, companyId, jobId });
  const cached = getFromCache<CultureFitResult>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch candidate data
    const { data: candidate, error: candError } = await supabase
      .from('candidate_profiles')
      .select(`
        values_list,
        character_traits,
        preferred_leadership_style,
        preferred_feedback_frequency,
        preferred_communication_style,
        preferred_meeting_culture,
        preferred_conflict_resolution,
        work_style_preferences
      `)
      .eq('id', candidateId)
      .maybeSingle();

    if (candError || !candidate) {
      console.error('Error fetching candidate for culture fit:', candError);
      return null;
    }

    // Fetch company data
    const { data: company, error: compError } = await supabase
      .from('company_profiles')
      .select('values, desired_traits')
      .eq('id', companyId)
      .maybeSingle();

    if (compError) {
      console.error('Error fetching company for culture fit:', compError);
    }

    // Fetch hiring manager preferences if available
    const { data: hmPrefs } = await supabase
      .from('hiring_manager_preferences')
      .select(`
        leadership_style,
        feedback_frequency,
        communication_preference,
        meeting_culture,
        conflict_resolution
      `)
      .eq('company_id', companyId)
      .maybeSingle();

    // Fetch job data if jobId provided
    let jobData: any = null;
    if (jobId) {
      const { data: job } = await supabase
        .from('jobs')
        .select('values_list, desired_traits, required_traits')
        .eq('id', jobId)
        .maybeSingle();
      jobData = job;
    }

    // Determine target values/traits (job overrides company if available)
    const targetValues = jobData?.values_list || company?.values || [];
    const targetTraits = [
      ...(jobData?.desired_traits || company?.desired_traits || []),
      ...(jobData?.required_traits || [])
    ];

    // Calculate values alignment
    const valuesAlignment = calculateValuesAlignment(
      candidate.values_list,
      candidate.character_traits,
      targetValues,
      targetTraits
    );

    // Build candidate work style preferences
    const candidateWorkPrefs: WorkStylePreferences = {
      leadership_style: candidate.preferred_leadership_style ||
        (candidate.work_style_preferences as any)?.leadership_style,
      feedback_frequency: candidate.preferred_feedback_frequency ||
        (candidate.work_style_preferences as any)?.feedback_frequency,
      communication_style: candidate.preferred_communication_style ||
        (candidate.work_style_preferences as any)?.communication_style,
      meeting_culture: candidate.preferred_meeting_culture ||
        (candidate.work_style_preferences as any)?.meeting_culture,
      conflict_resolution: candidate.preferred_conflict_resolution ||
        (candidate.work_style_preferences as any)?.conflict_resolution
    };

    // Build company work style expectations
    const companyWorkPrefs: WorkStylePreferences = {
      leadership_style: hmPrefs?.leadership_style,
      feedback_frequency: hmPrefs?.feedback_frequency,
      communication_style: hmPrefs?.communication_preference,
      meeting_culture: hmPrefs?.meeting_culture,
      conflict_resolution: hmPrefs?.conflict_resolution
    };

    // Calculate work style compatibility
    const workStyleCompatibility = calculateWorkStyleCompatibility(
      candidateWorkPrefs,
      companyWorkPrefs
    );

    // Calculate overall score (50% values, 50% work style)
    // If one side has no data, weight the other at 100%
    let overallScore: number;
    if (valuesAlignment.score === null && workStyleCompatibility.totalDimensions === 0) {
      overallScore = 0;
    } else if (valuesAlignment.score === null) {
      overallScore = workStyleCompatibility.overallScore;
    } else if (workStyleCompatibility.totalDimensions === 0) {
      overallScore = valuesAlignment.score;
    } else {
      overallScore = Math.round((valuesAlignment.score * 0.5) + (workStyleCompatibility.overallScore * 0.5));
    }

    // Generate summary
    const strengths: string[] = [];
    const watchOuts: string[] = [];

    // Values-based insights
    if (valuesAlignment.rating === 'strong' || valuesAlignment.rating === 'good') {
      if (valuesAlignment.shared.length > 0) {
        strengths.push(`Shared values: ${valuesAlignment.shared.slice(0, 3).join(', ')}`);
      }
    } else if (valuesAlignment.rating === 'low') {
      watchOuts.push('Limited overlap in core values and traits');
    }

    // Work style insights
    workStyleCompatibility.dimensions.forEach(dim => {
      if (dim.status === 'aligned') {
        strengths.push(`${dim.name}: Both prefer ${dim.candidatePreference}`);
      } else if (dim.status === 'misaligned') {
        watchOuts.push(`${dim.name}: ${dim.candidatePreference} vs ${dim.companyExpectation}`);
      }
    });

    const result = {
      overallScore,
      valuesAlignment,
      workStyleCompatibility,
      summary: {
        strengths: strengths.slice(0, 5),
        watchOuts: watchOuts.slice(0, 3)
      }
    };
    setInCache(cacheKey, result, CACHE_DURATIONS.MEDIUM); // 30 min cache
    return result;
  } catch (error) {
    console.error('Error in calculateCultureFit:', error);
    return null;
  }
}

/**
 * Get market-wide work style fit for a candidate
 * Shows what percentage of companies match each of their preferences
 */
export async function getCandidateWorkStyleMarketFit(
  candidateId: string
): Promise<WorkStyleMarketFitResult | null> {
  if (!candidateId) return null;

  const cacheKey = generateCacheKey('getCandidateWorkStyleMarketFit', { candidateId });
  const cached = getFromCache<WorkStyleMarketFitResult>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch candidate preferences
    const { data: candidate, error: candError } = await supabase
      .from('candidate_profiles')
      .select(`
        preferred_leadership_style,
        preferred_feedback_frequency,
        preferred_communication_style,
        preferred_meeting_culture,
        preferred_conflict_resolution,
        work_style_preferences
      `)
      .eq('id', candidateId)
      .maybeSingle();

    if (candError || !candidate) {
      console.error('Error fetching candidate for market fit:', candError);
      return null;
    }

    // Fetch all hiring manager preferences
    const { data: allHmPrefs, error: hmError } = await supabase
      .from('hiring_manager_preferences')
      .select(`
        leadership_style,
        feedback_frequency,
        communication_preference,
        meeting_culture,
        conflict_resolution
      `);

    if (hmError) {
      console.error('Error fetching HM preferences:', hmError);
      return null;
    }

    const totalCompanies = allHmPrefs?.length || 0;
    if (totalCompanies === 0) {
      return { dimensions: [] };
    }

    const dimensions: WorkStyleMarketFitDimension[] = [];

    // Map candidate field names to HM preference field names
    const fieldMapping: Record<string, { candidateField: string; hmField: string; displayName: string }> = {
      leadership_style: {
        candidateField: 'preferred_leadership_style',
        hmField: 'leadership_style',
        displayName: 'Leadership Style'
      },
      feedback_frequency: {
        candidateField: 'preferred_feedback_frequency',
        hmField: 'feedback_frequency',
        displayName: 'Feedback Frequency'
      },
      communication_style: {
        candidateField: 'preferred_communication_style',
        hmField: 'communication_preference',
        displayName: 'Communication Style'
      },
      meeting_culture: {
        candidateField: 'preferred_meeting_culture',
        hmField: 'meeting_culture',
        displayName: 'Meeting Culture'
      },
      conflict_resolution: {
        candidateField: 'preferred_conflict_resolution',
        hmField: 'conflict_resolution',
        displayName: 'Conflict Resolution'
      }
    };

    Object.entries(fieldMapping).forEach(([key, mapping]) => {
      // Get candidate preference (check dedicated field first, then work_style_preferences jsonb)
      const candidateValue = (candidate as any)[mapping.candidateField]?.toLowerCase().trim() ||
        (candidate.work_style_preferences as any)?.[key]?.toLowerCase().trim();

      if (!candidateValue) return;

      // Count companies that match or are adjacent
      let matchCount = 0;
      allHmPrefs?.forEach(hm => {
        const hmValue = (hm as any)[mapping.hmField]?.toLowerCase().trim();
        if (!hmValue) return;

        // Exact match
        if (candidateValue === hmValue) {
          matchCount++;
          return;
        }

        // Adjacent match (compatibility >= 70)
        const adjacencyMap = STYLE_ADJACENCY[key];
        if (adjacencyMap) {
          const compatibility = adjacencyMap[candidateValue]?.[hmValue] ||
            adjacencyMap[hmValue]?.[candidateValue] ||
            0;
          if (compatibility >= 70) {
            matchCount++;
          }
        }
      });

      const marketFitPercent = Math.round((matchCount / totalCompanies) * 100);

      dimensions.push({
        name: mapping.displayName,
        candidatePreference: candidateValue,
        marketFitPercent,
        marketCount: matchCount
      });
    });

    const result = { dimensions };
    setInCache(cacheKey, result, CACHE_DURATIONS.LONG); // 2 hour cache for market-wide data
    return result;
  } catch (error) {
    console.error('Error in getCandidateWorkStyleMarketFit:', error);
    return null;
  }
}

// ============================================
// Market Distribution & Comparative Analytics
// ============================================

export interface MarketDistributionItem {
  value: string;
  label: string;
  candidateCount: number;
  candidatePercent: number;
  companyCount: number;
  companyPercent: number;
  demandRatio: number; // company% / candidate% - >1 means high demand
  marketLabel: 'high_demand' | 'balanced' | 'oversupplied' | 'niche' | 'popular';
}

export interface WorkStyleMarketInsight {
  dimension: string;
  dimensionLabel: string;
  candidateValue: string;
  candidateValueLabel: string;
  candidatePercent: number;  // % of candidates with this preference
  companyPercent: number;    // % of companies wanting this preference
  demandRatio: number;
  marketLabel: 'high_demand' | 'balanced' | 'oversupplied' | 'niche' | 'popular';
  insight: string;
}

export interface ValueMarketInsight {
  value: string;
  candidatePercent: number;
  companyPercent: number;
  demandRatio: number;
  marketLabel: 'high_demand' | 'balanced' | 'oversupplied' | 'rare' | 'common';
  insight: string;
}

export interface CultureMarketInsights {
  workStyleInsights: WorkStyleMarketInsight[];
  valueInsights: ValueMarketInsight[];
  overallDemandScore: number; // 0-100, how "in demand" this profile is
  summary: {
    highDemandCount: number;
    nicheCount: number;
    competitiveAdvantages: string[];
    marketingTips: string[];
  };
}

// Work style dimension configuration with labels
const WORK_STYLE_DIMENSIONS_CONFIG: {
  key: string;
  dbKey: string; // key in hiring_manager_preferences
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: 'workIntensity',
    dbKey: 'work_intensity',
    label: 'Work Intensity',
    options: [
      { value: 'relaxed', label: 'Relaxed Pace' },
      { value: 'moderate', label: 'Moderate Pace' },
      { value: 'fast_paced', label: 'Fast-Paced' },
      { value: 'startup_hustle', label: 'Startup Hustle' },
    ]
  },
  {
    key: 'autonomyLevel',
    dbKey: 'autonomy_level',
    label: 'Autonomy Level',
    options: [
      { value: 'high_direction', label: 'High Direction' },
      { value: 'balanced', label: 'Balanced' },
      { value: 'highly_autonomous', label: 'Highly Autonomous' },
    ]
  },
  {
    key: 'decisionMaking',
    dbKey: 'decision_making',
    label: 'Decision Making',
    options: [
      { value: 'collaborative', label: 'Collaborative' },
      { value: 'consult_decide', label: 'Consult & Decide' },
      { value: 'independent', label: 'Independent' },
    ]
  },
  {
    key: 'workHours',
    dbKey: 'work_hours',
    label: 'Work Hours',
    options: [
      { value: 'traditional_9_5', label: 'Traditional 9-5' },
      { value: 'flexible', label: 'Flexible' },
      { value: 'early_bird', label: 'Early Bird' },
      { value: 'night_owl', label: 'Night Owl' },
      { value: 'async_any', label: 'Async/Any Hours' },
    ]
  },
  {
    key: 'riskTolerance',
    dbKey: 'risk_tolerance',
    label: 'Risk Tolerance',
    options: [
      { value: 'risk_averse', label: 'Risk-Averse' },
      { value: 'calculated_risks', label: 'Calculated Risks' },
      { value: 'high_risk_comfortable', label: 'High Risk Comfortable' },
    ]
  },
  {
    key: 'changeFrequency',
    dbKey: 'change_frequency',
    label: 'Change Frequency',
    options: [
      { value: 'stable', label: 'Stable' },
      { value: 'moderate_change', label: 'Moderate Change' },
      { value: 'rapid_iteration', label: 'Rapid Iteration' },
    ]
  },
  {
    key: 'ambiguityTolerance',
    dbKey: 'ambiguity_tolerance',
    label: 'Ambiguity Tolerance',
    options: [
      { value: 'clear_structure', label: 'Clear Structure' },
      { value: 'comfortable_some', label: 'Comfortable With Some' },
      { value: 'thrives_ambiguity', label: 'Thrives in Ambiguity' },
    ]
  },
  {
    key: 'innovationStability',
    dbKey: 'innovation_stability',
    label: 'Innovation vs Stability',
    options: [
      { value: 'proven_methods', label: 'Proven Methods' },
      { value: 'balanced', label: 'Balanced' },
      { value: 'cutting_edge', label: 'Cutting-Edge' },
    ]
  },
  {
    key: 'projectDuration',
    dbKey: 'project_duration',
    label: 'Project Duration',
    options: [
      { value: 'short_sprints', label: 'Short Sprints' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'long_term', label: 'Long-Term Deep Work' },
    ]
  },
  {
    key: 'contextSwitching',
    dbKey: 'context_switching',
    label: 'Context Switching',
    options: [
      { value: 'single_focus', label: 'Single Focus' },
      { value: 'limited_switching', label: 'Limited Switching' },
      { value: 'comfortable_multitasking', label: 'Comfortable Multitasking' },
    ]
  },
];

/**
 * Get market-wide distribution of work style preferences
 * Returns candidate supply and company demand for each option
 */
export async function getWorkStyleMarketDistribution(): Promise<Record<string, MarketDistributionItem[]> | null> {
  const cacheKey = generateCacheKey('getWorkStyleMarketDistribution', {});
  const cached = getFromCache<Record<string, MarketDistributionItem[]>>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch all candidate work style preferences
    const { data: candidates, error: candError } = await supabase
      .from('candidate_profiles')
      .select('work_style_preferences')
      .not('work_style_preferences', 'is', null);

    if (candError) {
      console.error('Error fetching candidates:', candError);
      return null;
    }

    // Fetch all company/HM preferences
    const { data: companies, error: compError } = await supabase
      .from('hiring_manager_preferences')
      .select('work_intensity, autonomy_level, decision_making, risk_tolerance, change_frequency, ambiguity_tolerance');

    if (compError) {
      console.error('Error fetching company preferences:', compError);
      return null;
    }

    const totalCandidates = candidates?.length || 1;
    const totalCompanies = companies?.length || 1;

    const result: Record<string, MarketDistributionItem[]> = {};

    for (const dim of WORK_STYLE_DIMENSIONS_CONFIG) {
      const distribution: MarketDistributionItem[] = [];

      for (const option of dim.options) {
        // Count candidates with this preference
        const candidateCount = candidates?.filter(c => {
          const prefs = c.work_style_preferences as Record<string, string> | null;
          return prefs?.[dim.key] === option.value;
        }).length || 0;

        // Count companies wanting this preference
        const companyCount = companies?.filter(c => {
          return (c as any)[dim.dbKey] === option.value;
        }).length || 0;

        const candidatePercent = Math.round((candidateCount / totalCandidates) * 100);
        const companyPercent = Math.round((companyCount / totalCompanies) * 100);
        const demandRatio = candidatePercent > 0 ? companyPercent / candidatePercent : companyPercent > 0 ? 5 : 1;

        // Determine market label
        let marketLabel: MarketDistributionItem['marketLabel'];
        if (demandRatio >= 1.5 && companyPercent >= 15) {
          marketLabel = 'high_demand';
        } else if (demandRatio <= 0.5 && candidatePercent >= 20) {
          marketLabel = 'oversupplied';
        } else if (candidatePercent <= 15 && companyPercent <= 15) {
          marketLabel = 'niche';
        } else if (candidatePercent >= 30) {
          marketLabel = 'popular';
        } else {
          marketLabel = 'balanced';
        }

        distribution.push({
          value: option.value,
          label: option.label,
          candidateCount,
          candidatePercent,
          companyCount,
          companyPercent,
          demandRatio,
          marketLabel,
        });
      }

      result[dim.key] = distribution;
    }

    setInCache(cacheKey, result, CACHE_DURATIONS.DAILY);
    return result;
  } catch (error) {
    console.error('Error in getWorkStyleMarketDistribution:', error);
    return null;
  }
}

/**
 * Get market-wide distribution of values
 */
export async function getValuesMarketDistribution(): Promise<ValueMarketInsight[] | null> {
  const cacheKey = generateCacheKey('getValuesMarketDistribution', {});
  const cached = getFromCache<ValueMarketInsight[]>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch all candidate values
    const { data: candidates, error: candError } = await supabase
      .from('candidate_profiles')
      .select('values_list');

    // Fetch all company values
    const { data: companies, error: compError } = await supabase
      .from('company_profiles')
      .select('values');

    if (candError || compError) {
      console.error('Error fetching values:', candError || compError);
      return null;
    }

    const totalCandidates = candidates?.length || 1;
    const totalCompanies = companies?.length || 1;

    // Count occurrences of each value
    const candidateValueCounts = new Map<string, number>();
    const companyValueCounts = new Map<string, number>();

    candidates?.forEach(c => {
      const values = c.values_list as string[] | null;
      values?.forEach(v => {
        const normalized = v.toLowerCase().trim();
        candidateValueCounts.set(normalized, (candidateValueCounts.get(normalized) || 0) + 1);
      });
    });

    companies?.forEach(c => {
      const values = c.values as string[] | null;
      values?.forEach(v => {
        const normalized = v.toLowerCase().trim();
        companyValueCounts.set(normalized, (companyValueCounts.get(normalized) || 0) + 1);
      });
    });

    // Combine all unique values
    const allValues = new Set([...candidateValueCounts.keys(), ...companyValueCounts.keys()]);
    const result: ValueMarketInsight[] = [];

    allValues.forEach(value => {
      const candidateCount = candidateValueCounts.get(value) || 0;
      const companyCount = companyValueCounts.get(value) || 0;
      const candidatePercent = Math.round((candidateCount / totalCandidates) * 100);
      const companyPercent = Math.round((companyCount / totalCompanies) * 100);
      const demandRatio = candidatePercent > 0 ? companyPercent / candidatePercent : companyPercent > 0 ? 5 : 1;

      let marketLabel: ValueMarketInsight['marketLabel'];
      let insight: string;

      if (demandRatio >= 1.5 && companyPercent >= 10) {
        marketLabel = 'high_demand';
        insight = `High demand - ${companyPercent}% of companies want this`;
      } else if (demandRatio <= 0.5 && candidatePercent >= 15) {
        marketLabel = 'oversupplied';
        insight = `Competitive - ${candidatePercent}% of candidates share this`;
      } else if (candidatePercent <= 10 && companyPercent <= 10) {
        marketLabel = 'rare';
        insight = `Distinctive - only ${candidatePercent}% of candidates have this`;
      } else if (candidatePercent >= 25) {
        marketLabel = 'common';
        insight = `Popular - shared by ${candidatePercent}% of candidates`;
      } else {
        marketLabel = 'balanced';
        insight = `Balanced supply and demand`;
      }

      result.push({
        value: value.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        candidatePercent,
        companyPercent,
        demandRatio,
        marketLabel,
        insight,
      });
    });

    // Sort by company demand
    result.sort((a, b) => b.companyPercent - a.companyPercent);

    setInCache(cacheKey, result, CACHE_DURATIONS.DAILY);
    return result;
  } catch (error) {
    console.error('Error in getValuesMarketDistribution:', error);
    return null;
  }
}

/**
 * Get comprehensive culture market insights for a specific candidate
 */
export async function getCultureMarketInsights(
  candidateProfile: {
    workStylePreferences?: Record<string, string>;
    values?: string[];
  }
): Promise<CultureMarketInsights | null> {
  if (!candidateProfile) return null;

  const cacheKey = generateCacheKey('getCultureMarketInsights', {
    ws: JSON.stringify(candidateProfile.workStylePreferences || {}),
    vals: (candidateProfile.values || []).slice(0, 5).join(','),
  });
  const cached = getFromCache<CultureMarketInsights>(cacheKey);
  if (cached) return cached;

  try {
    // Get market distributions
    const [workStyleDist, valuesDist] = await Promise.all([
      getWorkStyleMarketDistribution(),
      getValuesMarketDistribution(),
    ]);

    if (!workStyleDist || !valuesDist) {
      return null;
    }

    // Build work style insights for this candidate
    const workStyleInsights: WorkStyleMarketInsight[] = [];
    const prefs = candidateProfile.workStylePreferences || {};

    for (const dim of WORK_STYLE_DIMENSIONS_CONFIG) {
      const candidateValue = prefs[dim.key];
      if (!candidateValue) continue;

      const distribution = workStyleDist[dim.key] || [];
      const match = distribution.find(d => d.value === candidateValue);

      if (match) {
        let insight: string;
        switch (match.marketLabel) {
          case 'high_demand':
            insight = `In demand! ${match.companyPercent}% of companies seek this`;
            break;
          case 'oversupplied':
            insight = `Competitive - ${match.candidatePercent}% share this preference`;
            break;
          case 'niche':
            insight = `Unique - helps you stand out`;
            break;
          case 'popular':
            insight = `Common choice - ${match.candidatePercent}% of candidates`;
            break;
          default:
            insight = `Balanced market fit`;
        }

        workStyleInsights.push({
          dimension: dim.key,
          dimensionLabel: dim.label,
          candidateValue,
          candidateValueLabel: match.label,
          candidatePercent: match.candidatePercent,
          companyPercent: match.companyPercent,
          demandRatio: match.demandRatio,
          marketLabel: match.marketLabel,
          insight,
        });
      }
    }

    // Build value insights for this candidate
    const valueInsights: ValueMarketInsight[] = [];
    const candidateValues = candidateProfile.values || [];

    for (const value of candidateValues) {
      const normalized = value.toLowerCase().trim();
      const match = valuesDist.find(v => v.value.toLowerCase() === normalized);

      if (match) {
        valueInsights.push(match);
      } else {
        // Value not in market data - treat as rare
        valueInsights.push({
          value,
          candidatePercent: 1,
          companyPercent: 0,
          demandRatio: 0,
          marketLabel: 'rare',
          insight: 'Distinctive value - not commonly listed',
        });
      }
    }

    // Calculate summary
    const highDemandCount = workStyleInsights.filter(w => w.marketLabel === 'high_demand').length +
      valueInsights.filter(v => v.marketLabel === 'high_demand').length;
    const nicheCount = workStyleInsights.filter(w => w.marketLabel === 'niche').length +
      valueInsights.filter(v => v.marketLabel === 'rare').length;

    // Calculate overall demand score
    const avgDemandRatio = workStyleInsights.length > 0
      ? workStyleInsights.reduce((sum, w) => sum + Math.min(w.demandRatio, 3), 0) / workStyleInsights.length
      : 1;
    const overallDemandScore = Math.min(100, Math.round(avgDemandRatio * 40 + highDemandCount * 10));

    // Generate tips
    const competitiveAdvantages: string[] = [];
    const marketingTips: string[] = [];

    workStyleInsights
      .filter(w => w.marketLabel === 'high_demand')
      .slice(0, 2)
      .forEach(w => competitiveAdvantages.push(`Your ${w.dimensionLabel.toLowerCase()} preference is in high demand`));

    valueInsights
      .filter(v => v.marketLabel === 'high_demand')
      .slice(0, 2)
      .forEach(v => competitiveAdvantages.push(`"${v.value}" is sought after by ${v.companyPercent}% of companies`));

    if (nicheCount > 2) {
      marketingTips.push('Your unique preferences help differentiate you');
    }
    if (overallDemandScore < 40) {
      marketingTips.push('Consider highlighting transferable aspects of your work style');
    }

    const result: CultureMarketInsights = {
      workStyleInsights,
      valueInsights,
      overallDemandScore,
      summary: {
        highDemandCount,
        nicheCount,
        competitiveAdvantages,
        marketingTips,
      },
    };

    setInCache(cacheKey, result, CACHE_DURATIONS.LONG);
    return result;
  } catch (error) {
    console.error('Error in getCultureMarketInsights:', error);
    return null;
  }
}
