/**
 * Company-specific constants for profile creation and matching
 * 
 * IMPORTANT: This file IMPORTS shared constants from matchingData.ts
 * Never duplicate CULTURAL_VALUES, PERKS, TRAITS, INDUSTRIES, or SKILLS
 * Those MUST come from matchingData.ts to ensure matching works!
 */

// ============================================================================
// IMPORT SHARED MATCHING CONSTANTS (DO NOT DUPLICATE!)
// ============================================================================

import {
  CULTURAL_VALUES,
  INDUSTRIES,
  ALL_PERKS,
  PERKS_CATEGORIES,
  ALL_CHARACTER_TRAITS,
  CHARACTER_TRAITS_CATEGORIES,
  SKILLS_LIST
} from './matchingData';

import {
  EDUCATION_LEVELS,
  MYERS_BRIGGS_TYPES,
  ENNEAGRAM_TYPES,
  DISC_LABELS
} from './educationData';

// Re-export for convenience (companies use same constants as candidates!)
export {
  CULTURAL_VALUES,
  INDUSTRIES,
  ALL_PERKS,
  PERKS_CATEGORIES,
  ALL_CHARACTER_TRAITS,
  CHARACTER_TRAITS_CATEGORIES,
  SKILLS_LIST,
  EDUCATION_LEVELS,
  MYERS_BRIGGS_TYPES,
  ENNEAGRAM_TYPES,
  DISC_LABELS
};

// ============================================================================
// COMPANY-ONLY CONSTANTS (Not used in candidate profiles)
// ============================================================================

export const COMPANY_SIZE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
] as const;

export const FUNDING_STAGES = [
  'Bootstrapped',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'Public',
  'Acquired'
] as const;

export const GROWTH_STAGES = [
  'Startup',          // 0-1 years, finding product-market fit
  'Early Stage',      // 1-3 years, scaling initial traction
  'Growth',           // 3-7 years, rapid scaling
  'Mature',           // 7+ years, established market position
  'Enterprise'        // Large-scale, stable operations
] as const;

export const REMOTE_POLICIES = [
  'Fully Remote',         // 100% remote, no office
  'Remote-First',         // Remote by default, office available
  'Remote-Friendly',      // Some remote days allowed
  'Hybrid',               // Specific in-office days required
  'In-Office'             // No remote work
] as const;

// ============================================================================
// HELPER DESCRIPTIONS FOR UI
// ============================================================================

export const COMPANY_SIZE_DESCRIPTIONS: Record<string, string> = {
  '1-10': 'Small team (1-10 employees)',
  '11-50': 'Growing startup (11-50 employees)',
  '51-200': 'Mid-size company (51-200 employees)',
  '201-500': 'Large company (201-500 employees)',
  '501-1000': 'Enterprise (501-1,000 employees)',
  '1000+': 'Large enterprise (1,000+ employees)'
};

export const GROWTH_STAGE_DESCRIPTIONS: Record<string, string> = {
  'Startup': 'Finding product-market fit (0-1 years)',
  'Early Stage': 'Scaling initial traction (1-3 years)',
  'Growth': 'Rapid scaling phase (3-7 years)',
  'Mature': 'Established market position (7+ years)',
  'Enterprise': 'Large-scale, stable operations'
};

export const REMOTE_POLICY_DESCRIPTIONS: Record<string, string> = {
  'Fully Remote': 'No physical office, 100% distributed team',
  'Remote-First': 'Remote by default, optional office space',
  'Remote-Friendly': 'Flexible remote days, primarily in-office',
  'Hybrid': 'Required in-office days (e.g., 3 days/week)',
  'In-Office': 'Full-time office presence required'
};

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type CompanySizeRange = typeof COMPANY_SIZE_RANGES[number];
export type FundingStage = typeof FUNDING_STAGES[number];
export type GrowthStage = typeof GROWTH_STAGES[number];
export type RemotePolicy = typeof REMOTE_POLICIES[number];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export const isValidCompanySize = (size: string): boolean => {
  return COMPANY_SIZE_RANGES.includes(size as any);
};

export const isValidFundingStage = (stage: string): boolean => {
  return FUNDING_STAGES.includes(stage as any);
};

export const isValidGrowthStage = (stage: string): boolean => {
  return GROWTH_STAGES.includes(stage as any);
};

export const isValidRemotePolicy = (policy: string): boolean => {
  return REMOTE_POLICIES.includes(policy as any);
};
