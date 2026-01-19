// Seniority-based mappings for skill levels and impact scope

/**
 * Maps seniority level to expected skill proficiency level (1-5)
 * 1 = Learning, 2 = Developing, 3 = Applying, 4 = Leading, 5 = Expert
 */
export const SENIORITY_SKILL_LEVEL_MAP: Record<string, number> = {
  // Entry level
  'Intern': 1,
  'Entry Level': 2,
  'Junior': 2,

  // Mid level
  'Mid Level': 3,
  'Mid': 3,

  // Senior level
  'Senior': 4,
  'Staff': 4,
  'Lead': 4,

  // Executive level
  'Principal': 5,
  'Director': 5,
  'VP': 5,
  'Head': 5,
  'Executive': 5,
};

/**
 * Maps seniority level to expected impact scope (1-5)
 * 1 = Individual tasks, 2 = Project scope, 3 = Team scope, 4 = Department/Org scope, 5 = Company-wide
 */
export const SENIORITY_IMPACT_SCOPE_MAP: Record<string, number> = {
  // Entry level - individual contributor focus
  'Intern': 1,
  'Entry Level': 1,
  'Junior': 1,

  // Mid level - project scope
  'Mid Level': 2,
  'Mid': 2,

  // Senior level - team scope
  'Senior': 3,
  'Staff': 4,
  'Lead': 4,

  // Executive level - org-wide scope
  'Principal': 5,
  'Director': 5,
  'VP': 5,
  'Head': 5,
  'Executive': 5,
};

/**
 * Get skill level for a seniority value with fuzzy matching
 * @param seniority - The seniority string (e.g., "Senior", "senior", "Mid Level")
 * @returns Skill level 1-5, defaults to 3 if not found
 */
export function getSkillLevelForSeniority(seniority: string | undefined): 1 | 2 | 3 | 4 | 5 {
  if (!seniority) return 3;

  // Try exact match first
  if (SENIORITY_SKILL_LEVEL_MAP[seniority]) {
    return SENIORITY_SKILL_LEVEL_MAP[seniority] as 1 | 2 | 3 | 4 | 5;
  }

  // Try case-insensitive match
  const normalizedSeniority = seniority.toLowerCase().trim();
  for (const [key, value] of Object.entries(SENIORITY_SKILL_LEVEL_MAP)) {
    if (key.toLowerCase() === normalizedSeniority) {
      return value as 1 | 2 | 3 | 4 | 5;
    }
  }

  // Try partial match (e.g., "senior" matches "Senior")
  for (const [key, value] of Object.entries(SENIORITY_SKILL_LEVEL_MAP)) {
    if (normalizedSeniority.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedSeniority)) {
      return value as 1 | 2 | 3 | 4 | 5;
    }
  }

  // Default to mid-level
  return 3;
}

/**
 * Get impact scope for a seniority value with fuzzy matching
 * @param seniority - The seniority string (e.g., "Senior", "senior", "Mid Level")
 * @returns Impact scope 1-5, defaults to 3 if not found
 */
export function getImpactScopeForSeniority(seniority: string | undefined): number {
  if (!seniority) return 3;

  // Try exact match first
  if (SENIORITY_IMPACT_SCOPE_MAP[seniority]) {
    return SENIORITY_IMPACT_SCOPE_MAP[seniority];
  }

  // Try case-insensitive match
  const normalizedSeniority = seniority.toLowerCase().trim();
  for (const [key, value] of Object.entries(SENIORITY_IMPACT_SCOPE_MAP)) {
    if (key.toLowerCase() === normalizedSeniority) {
      return value;
    }
  }

  // Try partial match
  for (const [key, value] of Object.entries(SENIORITY_IMPACT_SCOPE_MAP)) {
    if (normalizedSeniority.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedSeniority)) {
      return value;
    }
  }

  // Default to mid-level scope
  return 3;
}
