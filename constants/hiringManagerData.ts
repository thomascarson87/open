// =============================================================================
// HIRING MANAGER PREFERENCES CONSTANTS
// =============================================================================
// Option arrays for HM team preferences that auto-populate during job creation.
// Follows the same pattern as workStyleData.ts with label/value/description objects.

// -----------------------------------------------------------------------------
// LEADERSHIP & MANAGEMENT PREFERENCES
// -----------------------------------------------------------------------------

export const LEADERSHIP_STYLE_OPTIONS = [
  { value: 'hands_off', label: 'Hands-Off', description: 'Trust and verify, minimal intervention' },
  { value: 'coaching', label: 'Coaching', description: 'Develop through guidance and feedback' },
  { value: 'collaborative', label: 'Collaborative', description: 'Team-based decisions, shared ownership' },
  { value: 'directive', label: 'Directive', description: 'Clear instructions and expectations' },
  { value: 'servant_leader', label: 'Servant Leader', description: 'Remove blockers, support team success' }
] as const;

export const FEEDBACK_FREQUENCY_OPTIONS = [
  { value: 'continuous', label: 'Continuous', description: 'Real-time feedback as work happens' },
  { value: 'daily', label: 'Daily', description: 'End-of-day check-ins' },
  { value: 'weekly', label: 'Weekly', description: 'Weekly 1:1s and reviews' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Every two weeks' },
  { value: 'milestone_based', label: 'Milestone-Based', description: 'At project checkpoints' }
] as const;

export const COMMUNICATION_PREFERENCE_OPTIONS = [
  { value: 'async_first', label: 'Async-First', description: 'Written communication, respect focus time' },
  { value: 'sync_heavy', label: 'Sync-Heavy', description: 'Prefer calls and meetings' },
  { value: 'balanced', label: 'Balanced', description: 'Mix of async and sync' },
  { value: 'documentation_driven', label: 'Documentation-Driven', description: 'Write it down, decisions in docs' }
] as const;

export const MEETING_CULTURE_OPTIONS = [
  { value: 'minimal', label: 'Minimal', description: 'Only essential meetings' },
  { value: 'daily_standup', label: 'Daily Standup', description: 'Quick daily sync' },
  { value: 'regular_syncs', label: 'Regular Syncs', description: 'Multiple weekly touchpoints' },
  { value: 'as_needed', label: 'As-Needed', description: 'Meetings when required' }
] as const;

export const CONFLICT_RESOLUTION_OPTIONS = [
  { value: 'direct_immediate', label: 'Direct & Immediate', description: 'Address issues head-on' },
  { value: 'mediated', label: 'Mediated', description: 'Involve neutral third party' },
  { value: 'consensus_building', label: 'Consensus Building', description: 'Work toward agreement' },
  { value: 'escalation_path', label: 'Escalation Path', description: 'Clear hierarchy for decisions' }
] as const;

// -----------------------------------------------------------------------------
// GROWTH & DEVELOPMENT PREFERENCES
// -----------------------------------------------------------------------------

export const GROWTH_EXPECTATION_OPTIONS = [
  { value: 'specialist_depth', label: 'Specialist Depth', description: 'Deep expertise in domain' },
  { value: 'generalist_breadth', label: 'Generalist Breadth', description: 'Broad skills across areas' },
  { value: 'leadership_track', label: 'Leadership Track', description: 'Path to management' },
  { value: 'flexible', label: 'Flexible', description: 'Adapt to individual goals' }
] as const;

export const MENTORSHIP_APPROACH_OPTIONS = [
  { value: 'structured_program', label: 'Structured Program', description: 'Formal mentorship curriculum' },
  { value: 'informal_adhoc', label: 'Informal/Ad-hoc', description: 'Organic mentorship moments' },
  { value: 'peer_based', label: 'Peer-Based', description: 'Learn from teammates' },
  { value: 'self_directed', label: 'Self-Directed', description: 'Own your development path' }
] as const;

// -----------------------------------------------------------------------------
// TEAM STRUCTURE OPTIONS (re-exported for convenience)
// -----------------------------------------------------------------------------

export const HM_TEAM_SIZE_OPTIONS = [
  { value: 'solo', label: 'Solo', description: 'Work independently' },
  { value: 'small_2_5', label: 'Small (2-5)', description: 'Tight-knit team' },
  { value: 'medium_5_15', label: 'Medium (5-15)', description: 'Multiple sub-teams' },
  { value: 'large_15_plus', label: 'Large (15+)', description: 'Larger organization' }
] as const;

export const HM_REPORTING_STRUCTURE_OPTIONS = [
  { value: 'flat', label: 'Flat', description: 'Minimal hierarchy' },
  { value: 'shallow_2_3', label: '2-3 Levels', description: 'Some structure' },
  { value: 'hierarchical', label: 'Hierarchical', description: 'Clear escalation paths' }
] as const;

// -----------------------------------------------------------------------------
// IMPACT SCOPE OPTIONS
// -----------------------------------------------------------------------------

export const IMPACT_SCOPE_OPTIONS = [
  { value: 1, label: 'Individual', description: 'Own tasks and deliverables' },
  { value: 2, label: 'Team', description: 'Influence team outcomes' },
  { value: 3, label: 'Department', description: 'Cross-team impact' },
  { value: 4, label: 'Organization', description: 'Company-wide influence' },
  { value: 5, label: 'Industry', description: 'Market/industry shaping' }
] as const;

// -----------------------------------------------------------------------------
// MATCHING WEIGHTS FOR HM PREFERENCES
// -----------------------------------------------------------------------------

export const HM_PREFERENCE_WEIGHTS = {
  // Leadership & Management (high impact on day-to-day)
  leadershipStyle: 0.8,
  feedbackFrequency: 0.6,
  communicationPreference: 0.7,
  meetingCulture: 0.5,
  conflictResolution: 0.4,

  // Growth & Development
  growthExpectation: 0.6,
  mentorshipApproach: 0.5,

  // Team Structure
  teamSize: 0.6,
  reportingStructure: 0.4,

  // Work Style (inherited from workStyleData weights)
  workIntensity: 1.0,
  autonomyLevel: 0.9,
  decisionMaking: 0.7,
  ambiguityTolerance: 0.8,
  changeFrequency: 0.7,
  riskTolerance: 0.5,

  // Team Collaboration (inherited from workStyleData weights)
  collaborationFrequency: 0.7,
  pairProgramming: 0.5,
  crossFunctional: 0.5
} as const;

// -----------------------------------------------------------------------------
// DEALBREAKER CATEGORIES
// -----------------------------------------------------------------------------

export const HM_WORK_STYLE_DEALBREAKERS = [
  { value: 'work_intensity_mismatch', label: 'Work Intensity Mismatch', description: 'Pace expectations differ significantly' },
  { value: 'autonomy_mismatch', label: 'Autonomy Mismatch', description: 'Independence level incompatible' },
  { value: 'ambiguity_intolerance', label: 'Cannot Handle Ambiguity', description: 'Needs more structure than role provides' },
  { value: 'change_resistance', label: 'Change Resistance', description: 'Uncomfortable with rapid iteration' },
  { value: 'decision_style_conflict', label: 'Decision Style Conflict', description: 'Collaborative vs independent mismatch' }
] as const;

export const HM_TEAM_DEALBREAKERS = [
  { value: 'collaboration_frequency_mismatch', label: 'Collaboration Frequency Mismatch', description: 'Sync expectations differ' },
  { value: 'pair_programming_aversion', label: 'Pair Programming Aversion', description: 'Refuses pairing when required' },
  { value: 'cross_functional_unwilling', label: 'Cross-Functional Unwilling', description: 'Prefers siloed work exclusively' },
  { value: 'team_size_incompatible', label: 'Team Size Incompatible', description: 'Strong preference for different team size' },
  { value: 'reporting_structure_mismatch', label: 'Reporting Structure Mismatch', description: 'Hierarchy expectations differ' }
] as const;

export const HM_TRAIT_DEALBREAKERS = [
  { value: 'communication_poor', label: 'Poor Communication', description: 'Cannot articulate ideas clearly' },
  { value: 'accountability_lacking', label: 'Lacking Accountability', description: 'Does not own outcomes' },
  { value: 'adaptability_low', label: 'Low Adaptability', description: 'Struggles with change' },
  { value: 'collaboration_resistant', label: 'Collaboration Resistant', description: 'Prefers solo work exclusively' },
  { value: 'feedback_unreceptive', label: 'Unreceptive to Feedback', description: 'Defensive when receiving input' }
] as const;

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

export type LeadershipStyleValue = typeof LEADERSHIP_STYLE_OPTIONS[number]['value'];
export type FeedbackFrequencyValue = typeof FEEDBACK_FREQUENCY_OPTIONS[number]['value'];
export type CommunicationPreferenceValue = typeof COMMUNICATION_PREFERENCE_OPTIONS[number]['value'];
export type MeetingCultureValue = typeof MEETING_CULTURE_OPTIONS[number]['value'];
export type ConflictResolutionValue = typeof CONFLICT_RESOLUTION_OPTIONS[number]['value'];
export type GrowthExpectationValue = typeof GROWTH_EXPECTATION_OPTIONS[number]['value'];
export type MentorshipApproachValue = typeof MENTORSHIP_APPROACH_OPTIONS[number]['value'];

export function getLeadershipStyleLabel(value: LeadershipStyleValue): string {
  return LEADERSHIP_STYLE_OPTIONS.find(o => o.value === value)?.label || value;
}

export function getFeedbackFrequencyLabel(value: FeedbackFrequencyValue): string {
  return FEEDBACK_FREQUENCY_OPTIONS.find(o => o.value === value)?.label || value;
}

export function getCommunicationPreferenceLabel(value: CommunicationPreferenceValue): string {
  return COMMUNICATION_PREFERENCE_OPTIONS.find(o => o.value === value)?.label || value;
}

export function getMeetingCultureLabel(value: MeetingCultureValue): string {
  return MEETING_CULTURE_OPTIONS.find(o => o.value === value)?.label || value;
}

export function getConflictResolutionLabel(value: ConflictResolutionValue): string {
  return CONFLICT_RESOLUTION_OPTIONS.find(o => o.value === value)?.label || value;
}

export function getGrowthExpectationLabel(value: GrowthExpectationValue): string {
  return GROWTH_EXPECTATION_OPTIONS.find(o => o.value === value)?.label || value;
}

export function getMentorshipApproachLabel(value: MentorshipApproachValue): string {
  return MENTORSHIP_APPROACH_OPTIONS.find(o => o.value === value)?.label || value;
}
