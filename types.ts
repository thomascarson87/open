
export type Role = 'candidate' | 'recruiter' | null;

export type MemberRole = 'admin' | 'hiring_manager' | 'finance' | 'interviewer';

// Language & Timezone Types
export type LanguageProficiency = 'native' | 'fluent' | 'professional' | 'conversational' | 'basic';

export interface LanguageRequirement {
  language: string;
  minProficiency: LanguageProficiency;
}

export type TimezoneOverlap = 'full_overlap' | 'overlap_4_plus' | 'overlap_2_plus' | 'async_first';

export type CompanySizePreference = 'SEED' | 'EARLY' | 'MID' | 'LARGE' | 'ENTERPRISE';

export type VisaSponsorshipPolicy = 'sponsors_all' | 'sponsors_some' | 'no_sponsorship' | 'case_by_case';

// Role Taxonomy Types
export interface JobFamily {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface CanonicalRole {
  id: string;
  family_id: string;
  name: string;
  slug: string;
  description?: string;
  is_emerging: boolean;
  display_order: number;
  family_name?: string; // Joined from job_families
}

export interface RoleSkillTemplate {
  id: string;
  role_id: string;
  skill_name: string;
  is_core: boolean;
  display_order: number;
}

export interface TeamMember {
  id: string;
  user_id?: string;
  company_id: string;
  email: string;
  name: string;
  role: MemberRole;
  avatar_url?: string;
}

export enum JobType {
  FullTime = 'Full-Time',
  PartTime = 'Part-Time',
  Contract = 'Contract',
  Freelance = 'Freelance',
  Internship = 'Internship'
}

export enum WorkMode {
  Remote = 'Remote',
  Hybrid = 'Hybrid',
  OnSite = 'On-Site',
}

export enum SeniorityLevel {
  Entry = 'Entry Level',
  Mid = 'Mid Level',
  Senior = 'Senior',
  Lead = 'Lead',
  Principal = 'Principal',
  Executive = 'Executive',
}

export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'slate';
export type ThemeFont = 'sans' | 'serif' | 'mono' | 'display';

export interface WorkStylePreferences {
  workHours?: 'traditional_9_5' | 'flexible' | 'early_bird' | 'night_owl' | 'async_any';
  workIntensity?: 'relaxed' | 'moderate' | 'fast_paced' | 'startup_hustle';
  projectDuration?: 'short_sprints' | 'mixed' | 'long_term';
  contextSwitching?: 'single_focus' | 'limited_switching' | 'comfortable_multitasking';
  autonomyLevel?: 'high_direction' | 'balanced' | 'highly_autonomous';
  decisionMaking?: 'collaborative' | 'consult_decide' | 'independent';
  riskTolerance?: 'risk_averse' | 'calculated_risks' | 'high_risk_comfortable';
  innovationStability?: 'proven_methods' | 'balanced' | 'cutting_edge';
  ambiguityTolerance?: 'clear_structure' | 'comfortable_some' | 'thrives_ambiguity';
  changeFrequency?: 'stable' | 'moderate_change' | 'rapid_iteration';
}

export interface TeamCollaborationPreferences {
  teamSizePreference?: 'solo' | 'small_2_5' | 'medium_5_15' | 'large_15_plus';
  orgSizePreference?: 'tiny_under_10' | 'small_10_50' | 'medium_50_200' | 'large_200_1000' | 'enterprise_1000_plus';
  reportingStructure?: 'flat' | 'shallow_2_3' | 'hierarchical';
  collaborationFrequency?: 'independent' | 'periodic_sync' | 'constant_collaboration';
  pairProgramming?: 'never' | 'occasionally' | 'regularly' | 'primarily';
  crossFunctional?: 'prefer_siloed' | 'some_collaboration' | 'highly_cross_functional';
  teamDistribution?: 'colocated' | 'hybrid_ok' | 'fully_distributed';
  timezoneOverlap?: 'full_overlap' | 'overlap_4_plus' | 'overlap_2_plus' | 'async_first';
}

export interface LanguageEntry {
  language: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'conversational' | 'basic';
}

export interface Skill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
  years?: number;
  description?: string;
}

export interface JobSkill {
  name: string;
  required_level: 1 | 2 | 3 | 4 | 5; 
  minimumYears?: number; 
  weight: 'required' | 'preferred';
}

export interface SkillLevelMetadata {
  level: 1 | 2 | 3 | 4 | 5;
  label: 'Learning' | 'Practicing' | 'Applying' | 'Mastering' | 'Innovating';
  icon: string;
  descriptor: string;
  behaviors: string[];
  example: string;
}

export interface ImpactScopeMetadata {
  scope: 1 | 2 | 3 | 4 | 5;
  label: string;
  descriptor: string;
  characteristics: string[];
  typicalRoles: string[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  startDate: string;
  endDate: string | null;
  isCurrentRole: boolean;
  type: string;
  description?: string;
  achievements?: string[];
  skillsAcquired?: string[];
}

export interface PersonalityAssessments {
  myersBriggs?: string;
  disc?: string;
  enneagram?: string;
}

export interface VerifiedSkill {
  skill: string;
  confirmed: boolean;
  candidate_claimed_level: 1 | 2 | 3 | 4 | 5;
  referee_assessed_level: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface ProfessionalVerification {
  id: string;
  candidate_id: string;
  referee_email: string;
  referee_name?: string;
  referee_company?: string;
  relationship_type: 'manager' | 'peer' | 'direct_report' | 'client';
  years_worked_together: '<1 year' | '1-2 years' | '2-5 years' | '5+ years';
  verified_skills: VerifiedSkill[];
  communication_written: number;
  communication_verbal: number;
  problem_solving_independence: number;
  problem_solving_creativity: number;
  reliability_deadlines: number;
  reliability_quality: number;
  collaboration_quality: number;
  leadership_mentorship?: number;
  leadership_decisions?: number;
  verified_traits: Array<{ trait: string; agreement: number; }>;
  verification_token?: string;
  status: 'pending' | 'completed' | 'expired';
  is_visible_publicly: boolean;
  completed_at?: string;
  created_at: string;
  expires_at: string;
}

export interface VerifiedSkillStats {
  skill: string;
  verification_count: number;
  avg_claimed_level: number;
  avg_assessed_level: number;
  level_agreement_rate: number;
  last_verified: string;
}

export interface VerificationStats {
  total_verifications: number;
  avg_communication: number;
  avg_problem_solving: number;
  avg_reliability: number;
  avg_collaboration: number;
  verified_skills: VerifiedSkillStats[];
  verified_traits: string[];
}

export type ApplicationStatus = 'applied' | 'reviewing' | 'phone_screen_scheduled' | 'phone_screen_completed' | 'technical_scheduled' | 'technical_completed' | 'final_round_scheduled' | 'final_round_completed' | 'offer_extended' | 'offer_accepted' | 'hired' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  matchScore: number;
  created_at: string;
  last_updated: string;
  rejection_reason?: string;
  conversation_id?: string;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  logoUrl?: string;
  website?: string;
  tagline?: string;
  about?: string;
  missionStatement?: string;
  industry: string[];
  values: string[];
  cultureDescription?: string;
  workEnvironment?: string;
  desiredTraits: string[];
  diversityStatement?: string;
  perks: string[];
  benefitsDescription?: string;
  remotePolicy?: string;
  teamSize?: number;
  foundedYear?: number;
  headquartersLocation?: string;
  companySizeRange?: string;
  fundingStage?: string;
  growthStage?: string;
  techStack: string[];
  socialMedia?: Record<string, string>;
  companyPhotos: string[];
  billing_plan?: string;
  credits?: number;
  is_mock_data?: boolean;
  mock_data_seed?: string;
  workStyleCulture?: Partial<WorkStylePreferences>;
  teamStructure?: {
    teamDistribution?: string;
    defaultCollaboration?: string;
    reportingStructure?: string;
  };
  companyLanguages?: string[];
  defaultTimezone?: string;
  visaSponsorshipPolicy?: VisaSponsorshipPolicy;
}

export interface Connection {
  id: string;
  name: string;
  headline: string;
  avatar?: string;
  company: string;
  sharedHistory: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  isSystemMessage?: boolean;
  metadata?: any;
}

export interface Conversation {
  id: string;
  participants: Array<{ id: string; name: string; avatar?: string }>;
  lastMessage: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
  applicationId?: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_type: 'interview' | 'screening' | 'technical_test' | 'sync' | 'other' | 'final_round';
  start_time: string;
  end_time: string;
  is_synced?: boolean;
  google_event_id?: string;
  video_link?: string;
  application_id?: string;
  candidate_id?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  organizer_id?: string;
  attendees?: Array<{ email: string; name?: string }>;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  name: string;
  headline: string;
  email: string;
  location: string;
  avatar_url?: string;
  avatarUrls?: string[];
  videoIntroUrl?: string;
  bio: string;
  status: 'actively_looking' | 'open_to_offers' | 'happy_but_listening' | 'not_looking';
  skills: Skill[];
  totalYearsExperience?: number;
  education_level?: string;
  education_field?: string;
  education_institution?: string;
  education_graduation_year?: number;
  values: string[];
  characterTraits: string[];
  personalityAssessments?: PersonalityAssessments;
  myers_briggs?: string;
  disc_profile?: any;
  enneagram_type?: string;
  salaryMin: number;
  salaryMax?: number;
  salaryExpectation?: string;
  salaryCurrency: string;
  openToEquity?: boolean;
  currentBonuses?: string;
  legalStatus?: string;
  preferredWorkMode: WorkMode[];
  willingToRelocate?: boolean;
  preferredTimezone?: string;
  desiredPerks: string[];
  interestedIndustries: string[];
  preferredCompanySize?: string[];
  currentImpactScope?: number;
  desiredImpactScopes: number[];
  contractTypes: JobType[];
  noticePeriod: string;
  nonNegotiables: string[];
  ambitions?: string;
  desiredSeniority?: SeniorityLevel[];
  // Role taxonomy fields
  currentSeniority?: SeniorityLevel;
  primaryRoleId?: string;
  primaryRoleName?: string;
  secondaryRoles?: { id: string; name: string }[];
  interestedRoles?: { id: string; name: string; interestLevel: 'exploring' | 'actively_seeking' }[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  experience?: Experience[];
  portfolio?: any[];
  references?: any[];
  themeColor?: ThemeColor;
  themeFont?: ThemeFont;
  assessment_completed_at?: string;
  is_mock_data?: boolean;
  verification_stats?: VerificationStats;
  isUnlocked?: boolean;
  matchScore?: number;
  workStylePreferences?: WorkStylePreferences;
  teamCollaborationPreferences?: TeamCollaborationPreferences;
  timezone?: string;
  languages?: LanguageEntry[];
  callReady?: boolean;
  callLink?: string;
}

export interface JobPosting {
  id: string;
  company_id: string;
  canonical_role_id?: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  location: string;
  salaryRange: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  seniority: SeniorityLevel;
  contractTypes: JobType[];
  startDate?: string;
  workMode: WorkMode;
  requiredSkills: JobSkill[];
  values: string[];
  perks: string[];
  desiredTraits: string[];
  requiredTraits: string[];
  postedDate: string;
  status: 'draft' | 'pending_approval' | 'published' | 'closed';
  companyIndustry?: string[];
  required_education_level?: string;
  preferred_education_level?: string;
  education_required?: boolean;
  responsibilities?: string[];
  impact_statement?: string;
  key_deliverables?: string[];
  success_metrics?: string[];
  team_structure?: string;
  growth_opportunities?: string;
  tech_stack?: string[];
  desired_performance_scores?: { 
    communication?: number; 
    problemSolving?: number; 
    reliability?: number; 
    collaboration?: number 
  };
  required_impact_scope?: number;
  approvals?: any;
  is_mock_data?: boolean;
  mock_data_seed?: string;
  workStyleRequirements?: Partial<WorkStylePreferences>;
  workStyleDealbreakers?: string[];
  teamRequirements?: Partial<TeamCollaborationPreferences>;
  teamDealbreakers?: string[];
  requiredLanguages?: LanguageRequirement[];
  preferredLanguages?: LanguageRequirement[];
  timezoneRequirements?: string;
  requiredTimezoneOverlap?: TimezoneOverlap;
  desiredEnneagramTypes?: string[];
  visaSponsorshipAvailable?: boolean;
  equityOffered?: boolean;
  relocationAssistance?: boolean;
}

export interface MatchDetails {
  score: number;
  reason: string;
}

export interface MatchBreakdown {
  overallScore: number;
  details: {
    skills: MatchDetails;
    seniority: MatchDetails;
    salary: MatchDetails;
    location: MatchDetails;
    workMode: MatchDetails;
    contract: MatchDetails;
    culture: MatchDetails;
    perks: MatchDetails;
    industry: MatchDetails;
    traits: MatchDetails;
    performance?: MatchDetails;
    impact?: MatchDetails;
    workStyle?: MatchDetails;
    teamFit?: MatchDetails;
    companySize?: MatchDetails;
    language?: MatchDetails;
    timezone?: MatchDetails;
    visa?: MatchDetails;
    relocation?: MatchDetails;
  };
  dealBreakers: string[];
  recommendations: string[];
}

export interface TalentSearchCriteria {
  title?: string;
  seniority?: SeniorityLevel[];
  location?: string;
  workMode?: WorkMode[];
  requiredSkills: JobSkill[];
  values?: string[];
  desiredTraits?: string[];
  interestedIndustries?: string[];
  salaryMax?: number;
  salaryCurrency?: string;
  contractTypes?: JobType[];
  desiredPerks?: string[];
  required_education_level?: string;
  education_required?: boolean;
  dealBreakers?: string[];
  workStyleFilters?: Partial<WorkStylePreferences>;
  teamFilters?: Partial<TeamCollaborationPreferences>;
  // Role-based filtering
  roleIds?: string[];  // canonical_role_ids to filter by
  includeRelatedRoles?: boolean;  // Include roles from same family
}

export interface TalentSearchResult {
  candidate: CandidateProfile;
  matchBreakdown: MatchBreakdown;
  matchScore: number;
  dealBreakersFailed: string[];
}

export interface SavedSearch {
  id: string;
  user_id: string;
  company_id: string;
  name: string;
  criteria: TalentSearchCriteria;
  alert_enabled: boolean;
  created_at: string;
  last_run: string | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'match' | 'message' | 'system' | 'application' | 'profile_viewed' | 'interview_scheduled';
  isRead: boolean;
  timestamp: string;
  link?: string;
  metadata?: any;
}

// APPLICATION HUB FOUNDATION ADDITIONS

export type ApplicationFilter = 'all' | 'active' | 'interviewing' | 'offers' | 'closed';

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string;
  change_type: 'manual' | 'automatic' | 'system';
  trigger_source: string | null;
  trigger_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface ApplicationHubItem {
  // Core application data (from applications table)
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  match_score: number;
  match_breakdown: any;
  created_at: string;
  updated_at: string;
  
  // Joined job data (from jobs table)
  job: {
    id: string;
    title: string;
    company_id: string;
    company_name: string;
    company_logo: string | null;
    location: string;
    salary_range: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    work_mode: string;
    seniority: string;
    description: string;
    impact_statement: string | null;
    responsibilities: string[];
    tech_stack: string[];
    values_list: string[];
    perks: string[];
  };
  
  // Enriched data (computed from related tables)
  conversationId: string | null;
  unreadCount: number;
  upcomingEvents: CalendarEvent[];
  recentHistory: ApplicationStatusHistory[];
}
