// constants/workStyleData.ts

export const WORK_HOURS_OPTIONS = [
  { value: 'traditional_9_5', label: 'Traditional 9-5', description: 'Standard business hours, predictable schedule' },
  { value: 'flexible', label: 'Flexible Hours', description: 'Core hours with flexibility around them' },
  { value: 'early_bird', label: 'Early Bird', description: 'Prefer starting and finishing early' },
  { value: 'night_owl', label: 'Night Owl', description: 'Prefer later starts and working into evening' },
  { value: 'async_any', label: 'Fully Async', description: 'Work whenever, deliver on deadlines' }
] as const;

export const WORK_INTENSITY_OPTIONS = [
  { value: 'relaxed', label: 'Relaxed Pace', description: 'Steady, sustainable workload with minimal overtime', icon: '🌿' },
  { value: 'moderate', label: 'Moderate', description: 'Generally balanced with occasional busy periods', icon: '⚖️' },
  { value: 'fast_paced', label: 'Fast-Paced', description: 'High energy environment, frequent deadlines', icon: '🏃' },
  { value: 'startup_hustle', label: 'Startup Hustle', description: 'Intense periods, wearing many hats, rapid growth', icon: '🚀' }
] as const;

export const PROJECT_DURATION_OPTIONS = [
  { value: 'short_sprints', label: 'Short Sprints', description: '1-2 week cycles, quick deliverables' },
  { value: 'mixed', label: 'Mixed Duration', description: 'Variety of short and long-term projects' },
  { value: 'long_term', label: 'Long-Term Deep Work', description: 'Multi-month initiatives, deep focus' }
] as const;

export const CONTEXT_SWITCHING_OPTIONS = [
  { value: 'single_focus', label: 'Single Focus', description: 'One project at a time, minimal interruptions' },
  { value: 'limited_switching', label: 'Limited Switching', description: '2-3 parallel workstreams maximum' },
  { value: 'comfortable_multitasking', label: 'Comfortable Multitasking', description: 'Handle multiple projects and contexts easily' }
] as const;

export const AUTONOMY_LEVEL_OPTIONS = [
  { value: 'high_direction', label: 'High Direction Needed', description: 'Prefer clear instructions and regular check-ins' },
  { value: 'balanced', label: 'Balanced', description: 'Some guidance with room for independent decisions' },
  { value: 'highly_autonomous', label: 'Highly Autonomous', description: 'Minimal oversight, self-directed work' }
] as const;

export const DECISION_MAKING_OPTIONS = [
  { value: 'collaborative', label: 'Collaborative', description: 'Decisions made as a group, consensus-driven' },
  { value: 'consult_decide', label: 'Consult Then Decide', description: 'Gather input, then make the call' },
  { value: 'independent', label: 'Independent', description: 'Empowered to decide within your domain' }
] as const;

export const RISK_TOLERANCE_OPTIONS = [
  { value: 'risk_averse', label: 'Risk-Averse', description: 'Prefer proven approaches and stability' },
  { value: 'calculated_risks', label: 'Calculated Risks', description: 'Take risks when data supports it' },
  { value: 'high_risk_comfortable', label: 'High Risk Comfortable', description: 'Embrace uncertainty and experimentation' }
] as const;

export const INNOVATION_STABILITY_OPTIONS = [
  { value: 'proven_methods', label: 'Proven Methods', description: 'Stick with what works, stable tech stack' },
  { value: 'balanced', label: 'Balanced', description: 'Mix of stable core with selective innovation' },
  { value: 'cutting_edge', label: 'Cutting-Edge Preferred', description: 'Early adopter, loves new technologies' }
] as const;

export const AMBIGUITY_TOLERANCE_OPTIONS = [
  { value: 'clear_structure', label: 'Clear Structure Needed', description: 'Prefer well-defined requirements and processes' },
  { value: 'comfortable_some', label: 'Comfortable With Some', description: 'Can handle ambiguity but appreciate clarity' },
  { value: 'thrives_ambiguity', label: 'Thrives in Ambiguity', description: 'Energized by undefined problems, creates structure' }
] as const;

export const CHANGE_FREQUENCY_OPTIONS = [
  { value: 'stable', label: 'Stable Environment', description: 'Consistent processes, predictable changes' },
  { value: 'moderate_change', label: 'Moderate Change', description: 'Regular improvements without constant upheaval' },
  { value: 'rapid_iteration', label: 'Rapid Iteration', description: 'Frequent pivots, constant evolution' }
] as const;

export const TEAM_SIZE_OPTIONS = [
  { value: 'solo', label: 'Solo', description: 'Work independently, minimal team interaction', icon: '👤' },
  { value: 'small_2_5', label: 'Small (2-5)', description: 'Tight-knit team, close collaboration', icon: '👥' },
  { value: 'medium_5_15', label: 'Medium (5-15)', description: 'Multiple sub-teams, cross-team coordination', icon: '👥👥' },
  { value: 'large_15_plus', label: 'Large (15+)', description: 'Larger organization, specialized roles', icon: '🏢' }
] as const;

export const COLLABORATION_FREQUENCY_OPTIONS = [
  { value: 'independent', label: 'Mostly Independent', description: 'Deep work, async updates, rare meetings' },
  { value: 'periodic_sync', label: 'Periodic Sync', description: 'Daily standup, weekly planning, otherwise async' },
  { value: 'constant_collaboration', label: 'Constant Collaboration', description: 'Open communication, frequent pairing/mobbing' }
] as const;

export const PAIR_PROGRAMMING_OPTIONS = [
  { value: 'never', label: 'Never', description: 'Prefer solo coding' },
  { value: 'occasionally', label: 'Occasionally', description: 'For complex problems or onboarding' },
  { value: 'regularly', label: 'Regularly', description: 'Several times per week' },
  { value: 'primarily', label: 'Primarily', description: 'Default working mode' }
] as const;

export const CROSS_FUNCTIONAL_OPTIONS = [
  { value: 'prefer_siloed', label: 'Prefer Siloed', description: 'Focus on your specialty, clear boundaries' },
  { value: 'some_collaboration', label: 'Some Collaboration', description: 'Occasional cross-team projects' },
  { value: 'highly_cross_functional', label: 'Highly Cross-Functional', description: 'Embedded with design, product, stakeholders' }
] as const;

export const REPORTING_STRUCTURE_OPTIONS = [
  { value: 'flat', label: 'Flat', description: 'Minimal hierarchy, direct access to leadership' },
  { value: 'shallow_2_3', label: '2-3 Levels', description: 'Some structure with clear escalation paths' },
  { value: 'hierarchical', label: 'Hierarchical OK', description: 'Comfortable in traditional org structures' }
] as const;

export const ORG_SIZE_OPTIONS = [
  { value: 'micro_lt_10', label: '< 10 people', description: 'Early stage startup, everyone does everything' },
  { value: 'small_10_50', label: '10-50 people', description: 'Growing startup, forming teams' },
  { value: 'medium_50_200', label: '50-200 people', description: 'Scaling company, defined departments' },
  { value: 'large_200_1000', label: '200-1000 people', description: 'Established company, multiple product lines' },
  { value: 'enterprise_1000_plus', label: '1000+ people', description: 'Enterprise scale, complex organization' }
] as const;

export const TEAM_DISTRIBUTION_OPTIONS = [
  { value: 'colocated_only', label: 'Co-located Only', description: 'Same office, in-person collaboration' },
  { value: 'hybrid_ok', label: 'Hybrid OK', description: 'Mix of remote and office' },
  { value: 'fully_distributed', label: 'Fully Distributed Preferred', description: 'Remote-first, async communication' }
] as const;

export const TIMEZONE_OVERLAP_OPTIONS = [
  { value: 'full_overlap', label: 'Full Overlap Required', description: 'Same working hours as team' },
  { value: 'four_plus_hours', label: '4+ Hours Overlap', description: 'Significant sync time daily' },
  { value: 'two_plus_hours', label: '2+ Hours Overlap', description: 'Minimal sync for standups/meetings' },
  { value: 'async_first', label: 'Async-First', description: 'Timezone independent, documentation-driven' }
] as const;

export const WORK_STYLE_MATCH_WEIGHTS = {
  workHours: 0.8,
  workIntensity: 1.0,
  projectDuration: 0.6,
  contextSwitching: 0.7,
  autonomyLevel: 0.9,
  decisionMaking: 0.6,
  riskTolerance: 0.5,
  innovationStability: 0.5,
  ambiguityTolerance: 0.8,
  changeFrequency: 0.6
} as const;

export const TEAM_COLLAB_MATCH_WEIGHTS = {
  teamSize: 0.7,
  collaborationFrequency: 0.8,
  pairProgramming: 0.4,
  crossFunctional: 0.6,
  reportingStructure: 0.5,
  orgSize: 0.6,
  teamDistribution: 0.9,
  timezoneOverlap: 0.8
} as const;