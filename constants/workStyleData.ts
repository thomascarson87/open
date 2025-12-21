// =============================================================================
// WORK STYLE & TEAM COLLABORATION CONSTANTS
// =============================================================================

// -----------------------------------------------------------------------------
// WORK STYLE PREFERENCES (10 attributes)
// -----------------------------------------------------------------------------

export const WORK_HOURS_OPTIONS = [
  { value: 'traditional_9_5', label: 'Traditional 9-5', description: 'Standard business hours' },
  { value: 'flexible', label: 'Flexible Hours', description: 'Core hours with flexibility' },
  { value: 'early_bird', label: 'Early Bird', description: 'Start and finish early' },
  { value: 'night_owl', label: 'Night Owl', description: 'Later starts, evening work' },
  { value: 'async_any', label: 'Fully Async', description: 'Work whenever, deliver on time' }
] as const;

export const WORK_INTENSITY_OPTIONS = [
  { value: 'relaxed', label: 'Relaxed Pace', description: 'Steady, sustainable workload' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced with occasional busy periods' },
  { value: 'fast_paced', label: 'Fast-Paced', description: 'High energy, frequent deadlines' },
  { value: 'startup_hustle', label: 'Startup Hustle', description: 'Intense periods, rapid growth' }
] as const;

export const PROJECT_DURATION_OPTIONS = [
  { value: 'short_sprints', label: 'Short Sprints', description: '1-2 week cycles' },
  { value: 'mixed', label: 'Mixed Duration', description: 'Variety of project lengths' },
  { value: 'long_term', label: 'Long-Term Deep Work', description: 'Multi-month initiatives' }
] as const;

export const CONTEXT_SWITCHING_OPTIONS = [
  { value: 'single_focus', label: 'Single Focus', description: 'One project at a time' },
  { value: 'limited_switching', label: 'Limited Switching', description: '2-3 parallel workstreams' },
  { value: 'comfortable_multitasking', label: 'Comfortable Multitasking', description: 'Handle multiple contexts easily' }
] as const;

export const AUTONOMY_LEVEL_OPTIONS = [
  { value: 'high_direction', label: 'High Direction Needed', description: 'Clear instructions, regular check-ins' },
  { value: 'balanced', label: 'Balanced', description: 'Some guidance with room for decisions' },
  { value: 'highly_autonomous', label: 'Highly Autonomous', description: 'Minimal oversight, self-directed' }
] as const;

export const DECISION_MAKING_OPTIONS = [
  { value: 'collaborative', label: 'Collaborative', description: 'Group decisions, consensus-driven' },
  { value: 'consult_decide', label: 'Consult Then Decide', description: 'Gather input, then decide' },
  { value: 'independent', label: 'Independent', description: 'Empowered to decide in your domain' }
] as const;

export const RISK_TOLERANCE_OPTIONS = [
  { value: 'risk_averse', label: 'Risk-Averse', description: 'Proven approaches, stability' },
  { value: 'calculated_risks', label: 'Calculated Risks', description: 'Data-supported risks' },
  { value: 'high_risk_comfortable', label: 'High Risk Comfortable', description: 'Embrace experimentation' }
] as const;

export const INNOVATION_STABILITY_OPTIONS = [
  { value: 'proven_methods', label: 'Proven Methods', description: 'Stick with what works' },
  { value: 'balanced', label: 'Balanced', description: 'Stable core with selective innovation' },
  { value: 'cutting_edge', label: 'Cutting-Edge', description: 'Early adopter, new technologies' }
] as const;

export const AMBIGUITY_TOLERANCE_OPTIONS = [
  { value: 'clear_structure', label: 'Clear Structure Needed', description: 'Well-defined requirements' },
  { value: 'comfortable_some', label: 'Comfortable With Some', description: 'Handle ambiguity when needed' },
  { value: 'thrives_ambiguity', label: 'Thrives in Ambiguity', description: 'Energized by undefined problems' }
] as const;

export const CHANGE_FREQUENCY_OPTIONS = [
  { value: 'stable', label: 'Stable Environment', description: 'Consistent processes' },
  { value: 'moderate_change', label: 'Moderate Change', description: 'Regular improvements' },
  { value: 'rapid_iteration', label: 'Rapid Iteration', description: 'Frequent pivots, constant evolution' }
] as const;

// -----------------------------------------------------------------------------
// TEAM & COLLABORATION PREFERENCES (8 attributes)
// -----------------------------------------------------------------------------

export const TEAM_SIZE_PREF_OPTIONS = [
  { value: 'solo', label: 'Solo', description: 'Work independently' },
  { value: 'small_2_5', label: 'Small (2-5)', description: 'Tight-knit team' },
  { value: 'medium_5_15', label: 'Medium (5-15)', description: 'Multiple sub-teams' },
  { value: 'large_15_plus', label: 'Large (15+)', description: 'Larger organization' }
] as const;

export const COLLABORATION_FREQ_OPTIONS = [
  { value: 'independent', label: 'Mostly Independent', description: 'Deep work, async updates' },
  { value: 'periodic_sync', label: 'Periodic Sync', description: 'Daily standup, weekly planning' },
  { value: 'constant_collaboration', label: 'Constant Collaboration', description: 'Frequent pairing/mobbing' }
] as const;

export const PAIR_PROGRAMMING_OPTIONS = [
  { value: 'never', label: 'Never', description: 'Prefer solo coding' },
  { value: 'occasionally', label: 'Occasionally', description: 'For complex problems' },
  { value: 'regularly', label: 'Regularly', description: 'Several times per week' },
  { value: 'primarily', label: 'Primarily', description: 'Default working mode' }
] as const;

export const CROSS_FUNCTIONAL_OPTIONS = [
  { value: 'prefer_siloed', label: 'Prefer Siloed', description: 'Clear boundaries' },
  { value: 'some_collaboration', label: 'Some Collaboration', description: 'Occasional cross-team' },
  { value: 'highly_cross_functional', label: 'Highly Cross-Functional', description: 'Embedded with other teams' }
] as const;

export const REPORTING_STRUCTURE_OPTIONS = [
  { value: 'flat', label: 'Flat', description: 'Minimal hierarchy' },
  { value: 'shallow_2_3', label: '2-3 Levels', description: 'Some structure' },
  { value: 'hierarchical', label: 'Hierarchical OK', description: 'Clear escalation paths' }
] as const;

export const ORG_SIZE_PREF_OPTIONS = [
  { value: 'tiny_under_10', label: 'Under 10', description: 'Startup stage' },
  { value: 'small_10_50', label: '10-50', description: 'Small company' },
  { value: 'medium_50_200', label: '50-200', description: 'Growing company' },
  { value: 'large_200_1000', label: '200-1000', description: 'Established company' },
  { value: 'enterprise_1000_plus', label: '1000+', description: 'Enterprise' }
] as const;

export const TEAM_DISTRIBUTION_OPTIONS = [
  { value: 'colocated', label: 'Co-located Only', description: 'Same office required' },
  { value: 'hybrid_ok', label: 'Hybrid OK', description: 'Mix of office and remote' },
  { value: 'fully_distributed', label: 'Fully Distributed', description: 'Remote-first preferred' }
] as const;

export const TIMEZONE_OVERLAP_OPTIONS = [
  { value: 'full_overlap', label: 'Full Overlap', description: 'Same timezone required' },
  { value: 'overlap_4_plus', label: '4+ Hours Overlap', description: 'Significant daily overlap' },
  { value: 'overlap_2_plus', label: '2+ Hours Overlap', description: 'Some overlap for syncs' },
  { value: 'async_first', label: 'Async-First', description: 'Minimal overlap OK' }
] as const;

// -----------------------------------------------------------------------------
// TIMEZONE OPTIONS (standard IANA timezones)
// -----------------------------------------------------------------------------

export const TIMEZONE_OPTIONS = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6' },
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5' },
  { value: 'America/Sao_Paulo', label: 'Brasília Time (BRT)', offset: 'UTC-3' },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0' },
  { value: 'Europe/Paris', label: 'Central European (CET)', offset: 'UTC+1' },
  { value: 'Europe/Helsinki', label: 'Eastern European (EET)', offset: 'UTC+2' },
  { value: 'Asia/Dubai', label: 'Gulf Time (GST)', offset: 'UTC+4' },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 'UTC+10' },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZST)', offset: 'UTC+12' }
] as const;

// -----------------------------------------------------------------------------
// LANGUAGE OPTIONS
// -----------------------------------------------------------------------------

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese (Mandarin)' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
  { value: 'pl', label: 'Polish' },
  { value: 'tr', label: 'Turkish' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'th', label: 'Thai' },
  { value: 'sv', label: 'Swedish' },
  { value: 'da', label: 'Danish' },
  { value: 'fi', label: 'Finnish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'he', label: 'Hebrew' },
  { value: 'id', label: 'Indonesian' },
  { value: 'ms', label: 'Malay' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'cs', label: 'Czech' },
  { value: 'el', label: 'Greek' },
  { value: 'ro', label: 'Romanian' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'other', label: 'Other' }
] as const;

export const LANGUAGE_PROFICIENCY_OPTIONS = [
  { value: 'native', label: 'Native', description: 'Mother tongue' },
  { value: 'fluent', label: 'Fluent', description: 'Full professional proficiency' },
  { value: 'professional', label: 'Professional', description: 'Business proficiency' },
  { value: 'conversational', label: 'Conversational', description: 'Can hold conversations' },
  { value: 'basic', label: 'Basic', description: 'Elementary level' }
] as const;

// -----------------------------------------------------------------------------
// MATCHING WEIGHTS
// -----------------------------------------------------------------------------

export const WORK_STYLE_MATCH_WEIGHTS = {
  workIntensity: 1.0,      // Critical - burnout risk
  autonomyLevel: 0.9,      // Critical - management fit
  ambiguityTolerance: 0.8, // Important for role fit
  changeFrequency: 0.7,
  decisionMaking: 0.7,
  workHours: 0.6,
  contextSwitching: 0.6,
  projectDuration: 0.5,
  riskTolerance: 0.5,
  innovationStability: 0.5
} as const;

export const TEAM_COLLAB_MATCH_WEIGHTS = {
  teamDistribution: 0.9,    // Critical for remote work
  timezoneOverlap: 0.9,     // Critical for collaboration
  teamSizePreference: 0.7,
  collaborationFrequency: 0.7,
  orgSizePreference: 0.6,
  pairProgramming: 0.5,
  crossFunctional: 0.5,
  reportingStructure: 0.4
} as const;
