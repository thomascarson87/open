// =============================================================================
// HIRING MANAGER PREFERENCES UTILITIES
// =============================================================================
// Utility functions for converting between DB format (snake_case) and
// frontend form format (camelCase) for HiringManagerPreferences.

import {
  HiringManagerPreferences,
  HiringManagerPreferencesForm,
  LeadershipStyle,
  FeedbackFrequency,
  CommunicationPreference,
  MeetingCulture,
  ConflictResolution,
  GrowthExpectation,
  MentorshipApproach
} from '../types';

// -----------------------------------------------------------------------------
// DB TO FORM CONVERSION (snake_case -> camelCase)
// -----------------------------------------------------------------------------

/**
 * Converts a database HiringManagerPreferences record to the frontend form format.
 * Use this when loading preferences from Supabase for editing.
 */
export function dbToFormHMPreferences(db: HiringManagerPreferences): HiringManagerPreferencesForm {
  return {
    id: db.id,
    name: db.name,
    isDefault: db.is_default,

    // Team Structure
    teamSize: db.team_size,
    reportingStructure: db.reporting_structure,

    // Leadership & Management
    leadershipStyle: db.leadership_style,
    feedbackFrequency: db.feedback_frequency,
    communicationPreference: db.communication_preference,
    meetingCulture: db.meeting_culture,
    conflictResolution: db.conflict_resolution,

    // Work Style
    workIntensity: db.work_intensity,
    autonomyLevel: db.autonomy_level,
    decisionMaking: db.decision_making,
    ambiguityTolerance: db.ambiguity_tolerance,
    changeFrequency: db.change_frequency,
    riskTolerance: db.risk_tolerance,

    // Team Collaboration
    collaborationFrequency: db.collaboration_frequency,
    pairProgramming: db.pair_programming,
    crossFunctional: db.cross_functional,

    // Candidate Attributes
    requiredTraits: db.required_traits || [],
    preferredTraits: db.preferred_traits || [],
    impactScopeMin: db.impact_scope_min,
    impactScopeMax: db.impact_scope_max,

    // Dealbreakers
    workStyleDealbreakers: db.work_style_dealbreakers || [],
    teamDealbreakers: db.team_dealbreakers || [],
    traitDealbreakers: db.trait_dealbreakers || [],

    // Growth
    growthExpectation: db.growth_expectation,
    mentorshipApproach: db.mentorship_approach
  };
}

// -----------------------------------------------------------------------------
// FORM TO DB CONVERSION (camelCase -> snake_case)
// -----------------------------------------------------------------------------

/**
 * Converts a frontend form to database format for upserting to Supabase.
 * Requires userId and companyId to be passed separately.
 */
export function formToDbHMPreferences(
  form: HiringManagerPreferencesForm,
  userId: string,
  companyId: string
): Partial<HiringManagerPreferences> {
  const dbRecord: Partial<HiringManagerPreferences> = {
    user_id: userId,
    company_id: companyId,
    name: form.name,
    is_default: form.isDefault,

    // Team Structure
    team_size: form.teamSize,
    reporting_structure: form.reportingStructure,

    // Leadership & Management
    leadership_style: form.leadershipStyle,
    feedback_frequency: form.feedbackFrequency,
    communication_preference: form.communicationPreference,
    meeting_culture: form.meetingCulture,
    conflict_resolution: form.conflictResolution,

    // Work Style
    work_intensity: form.workIntensity,
    autonomy_level: form.autonomyLevel,
    decision_making: form.decisionMaking,
    ambiguity_tolerance: form.ambiguityTolerance,
    change_frequency: form.changeFrequency,
    risk_tolerance: form.riskTolerance,

    // Team Collaboration
    collaboration_frequency: form.collaborationFrequency,
    pair_programming: form.pairProgramming,
    cross_functional: form.crossFunctional,

    // Candidate Attributes
    required_traits: form.requiredTraits,
    preferred_traits: form.preferredTraits,
    impact_scope_min: form.impactScopeMin,
    impact_scope_max: form.impactScopeMax,

    // Dealbreakers
    work_style_dealbreakers: form.workStyleDealbreakers,
    team_dealbreakers: form.teamDealbreakers,
    trait_dealbreakers: form.traitDealbreakers,

    // Growth
    growth_expectation: form.growthExpectation,
    mentorship_approach: form.mentorshipApproach
  };

  // Include ID if editing existing record
  if (form.id) {
    dbRecord.id = form.id;
  }

  return dbRecord;
}

// -----------------------------------------------------------------------------
// DEFAULT FORM VALUES
// -----------------------------------------------------------------------------

/**
 * Returns an empty/default HiringManagerPreferencesForm for creating new preferences.
 */
export function getDefaultHMPreferencesForm(): HiringManagerPreferencesForm {
  return {
    name: '',
    isDefault: false,

    teamSize: undefined,
    reportingStructure: undefined,

    leadershipStyle: undefined,
    feedbackFrequency: undefined,
    communicationPreference: undefined,
    meetingCulture: undefined,
    conflictResolution: undefined,

    workIntensity: undefined,
    autonomyLevel: undefined,
    decisionMaking: undefined,
    ambiguityTolerance: undefined,
    changeFrequency: undefined,
    riskTolerance: undefined,

    collaborationFrequency: undefined,
    pairProgramming: undefined,
    crossFunctional: undefined,

    requiredTraits: [],
    preferredTraits: [],
    impactScopeMin: undefined,
    impactScopeMax: undefined,

    workStyleDealbreakers: [],
    teamDealbreakers: [],
    traitDealbreakers: [],

    growthExpectation: undefined,
    mentorshipApproach: undefined
  };
}

// -----------------------------------------------------------------------------
// VALIDATION HELPERS
// -----------------------------------------------------------------------------

/**
 * Validates that a HiringManagerPreferencesForm has required fields.
 * Returns an array of error messages, empty if valid.
 */
export function validateHMPreferencesForm(form: HiringManagerPreferencesForm): string[] {
  const errors: string[] = [];

  if (!form.name || form.name.trim().length === 0) {
    errors.push('Preference set name is required');
  }

  if (form.impactScopeMin !== undefined && form.impactScopeMax !== undefined) {
    if (form.impactScopeMin > form.impactScopeMax) {
      errors.push('Minimum impact scope cannot be greater than maximum');
    }
  }

  return errors;
}

/**
 * Checks if a form has any meaningful preferences set (beyond just the name).
 */
export function hasPreferencesSet(form: HiringManagerPreferencesForm): boolean {
  return !!(
    form.teamSize ||
    form.reportingStructure ||
    form.leadershipStyle ||
    form.feedbackFrequency ||
    form.communicationPreference ||
    form.meetingCulture ||
    form.conflictResolution ||
    form.workIntensity ||
    form.autonomyLevel ||
    form.decisionMaking ||
    form.ambiguityTolerance ||
    form.changeFrequency ||
    form.riskTolerance ||
    form.collaborationFrequency ||
    form.pairProgramming ||
    form.crossFunctional ||
    form.requiredTraits.length > 0 ||
    form.preferredTraits.length > 0 ||
    form.impactScopeMin !== undefined ||
    form.impactScopeMax !== undefined ||
    form.workStyleDealbreakers.length > 0 ||
    form.teamDealbreakers.length > 0 ||
    form.traitDealbreakers.length > 0 ||
    form.growthExpectation ||
    form.mentorshipApproach
  );
}

// -----------------------------------------------------------------------------
// MERGE UTILITIES (for job creation auto-population)
// -----------------------------------------------------------------------------

/**
 * Merges HM preferences into job requirements format.
 * Used when auto-populating job creation from saved HM preferences.
 */
export function hmPreferencesToJobRequirements(prefs: HiringManagerPreferencesForm): {
  workStyleRequirements: Record<string, string | undefined>;
  teamRequirements: Record<string, string | undefined>;
  workStyleDealbreakers: string[];
  teamDealbreakers: string[];
  desiredTraits: string[];
  requiredTraits: string[];
} {
  return {
    workStyleRequirements: {
      workIntensity: prefs.workIntensity,
      autonomyLevel: prefs.autonomyLevel,
      decisionMaking: prefs.decisionMaking,
      ambiguityTolerance: prefs.ambiguityTolerance,
      changeFrequency: prefs.changeFrequency,
      riskTolerance: prefs.riskTolerance
    },
    teamRequirements: {
      teamSizePreference: prefs.teamSize,
      reportingStructure: prefs.reportingStructure,
      collaborationFrequency: prefs.collaborationFrequency,
      pairProgramming: prefs.pairProgramming,
      crossFunctional: prefs.crossFunctional
    },
    workStyleDealbreakers: prefs.workStyleDealbreakers,
    teamDealbreakers: prefs.teamDealbreakers,
    desiredTraits: prefs.preferredTraits,
    requiredTraits: prefs.requiredTraits
  };
}

/**
 * Counts how many preferences are set in a form (for UI completeness indicators).
 */
export function countPreferencesSet(form: HiringManagerPreferencesForm): {
  total: number;
  leadership: number;
  workStyle: number;
  teamCollab: number;
  growth: number;
} {
  const leadership = [
    form.leadershipStyle,
    form.feedbackFrequency,
    form.communicationPreference,
    form.meetingCulture,
    form.conflictResolution
  ].filter(Boolean).length;

  const workStyle = [
    form.workIntensity,
    form.autonomyLevel,
    form.decisionMaking,
    form.ambiguityTolerance,
    form.changeFrequency,
    form.riskTolerance
  ].filter(Boolean).length;

  const teamCollab = [
    form.teamSize,
    form.reportingStructure,
    form.collaborationFrequency,
    form.pairProgramming,
    form.crossFunctional
  ].filter(Boolean).length;

  const growth = [
    form.growthExpectation,
    form.mentorshipApproach
  ].filter(Boolean).length;

  return {
    total: leadership + workStyle + teamCollab + growth,
    leadership,
    workStyle,
    teamCollab,
    growth
  };
}
