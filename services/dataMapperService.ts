/**
 * Centralised data mapper service — SINGLE SOURCE OF TRUTH
 * for all snake_case DB → camelCase frontend conversions.
 *
 * All components and services should import mappers from here.
 * Do NOT create local/inline mappers in component files.
 */

import { JobPosting, CandidateProfile, CompanyProfile } from '../types';

// ---------------------------------------------------------------------------
// DB Row Types — snake_case interfaces matching Supabase table schemas.
// These type the raw data from `supabase.from('table').select('*')`.
// ---------------------------------------------------------------------------

export interface JobRow {
  id: string;
  company_id: string;
  canonical_role_id?: string | null;
  company_name?: string;
  company_logo?: string | null;
  title: string;
  description?: string;
  location?: string;
  salary_range?: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  seniority?: string;
  contract_types?: string[];
  start_date?: string | null;
  work_mode?: string;
  posted_date?: string;
  created_at?: string;
  status: string;
  approvals?: any;
  required_skills?: any[];
  required_skills_with_levels?: any[];
  values_list?: string[];
  perks?: string[];
  desired_traits?: string[];
  required_traits?: string[];
  company_industry?: string[];
  required_education_level?: string | null;
  preferred_education_level?: string | null;
  education_required?: boolean;
  responsibilities?: string[];
  impact_statement?: string | null;
  key_deliverables?: string[];
  success_metrics?: string[];
  team_structure?: string | null;
  growth_opportunities?: string | null;
  tech_stack?: string[];
  required_impact_scope?: number | null;
  desired_performance_scores?: Record<string, number> | null;
  work_style_requirements?: any;
  work_style_dealbreakers?: string[];
  team_requirements?: any;
  team_dealbreakers?: string[];
  required_languages?: any[];
  preferred_languages?: any[];
  timezone_requirements?: string | null;
  required_timezone_overlap?: any;
  visa_sponsorship_available?: boolean;
  equity_offered?: boolean;
  relocation_assistance?: boolean;
  desired_myers_briggs?: string[];
  desired_disc_profile?: Record<string, number> | null;
  desired_enneagram_types?: string[];
  required_certifications?: string[];
  preferred_certifications?: string[];
  regulatory_domains?: string[];
}

export interface CandidateProfileRow {
  id: string;
  user_id: string;
  name: string;
  headline?: string;
  email?: string;
  location?: string;
  avatar_url?: string | null;
  avatar_urls?: string[];
  video_intro_url?: string | null;
  theme_color?: string | null;
  theme_font?: string | null;
  bio?: string;
  status?: string;
  skills?: any[];
  skills_with_levels?: any[];
  contract_types?: string[];
  preferred_work_mode?: string[];
  desired_perks?: string[];
  interested_industries?: string[];
  character_traits?: string[];
  values_list?: string[];
  non_negotiables?: string[];
  portfolio?: any[];
  references_list?: any[];
  experience?: any[];
  desired_seniority?: string[];
  salary_expectation?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  legal_status?: string | null;
  current_bonuses?: string | null;
  notice_period?: string | null;
  ambitions?: string | null;
  is_unlocked?: boolean;
  education_level?: string | null;
  education_field?: string | null;
  education_institution?: string | null;
  education_graduation_year?: number | null;
  myers_briggs?: string | null;
  disc_profile?: any;
  enneagram_type?: string | null;
  assessment_completed_at?: string | null;
  call_ready?: boolean;
  call_link?: string | null;
  is_mock_data?: boolean;
  verification_stats?: any;
  current_impact_scope?: number | null;
  desired_impact_scope?: number[];
  total_years_experience?: number | null;
  work_style_preferences?: any;
  team_collaboration_preferences?: any;
  timezone?: string | null;
  languages?: string[];
  preferred_timezone?: string | null;
  preferred_company_size?: string[];
  willing_to_relocate?: boolean;
  open_to_equity?: boolean;
  preferred_leadership_style?: string | null;
  preferred_feedback_frequency?: string | null;
  preferred_communication_style?: string | null;
  preferred_meeting_culture?: string | null;
  preferred_conflict_resolution?: string | null;
  preferred_mentorship_style?: string | null;
  growth_goals?: string | null;
  primary_role_id?: string | null;
  primary_role_name?: string | null;
  secondary_roles?: any[];
  preferred_company_focus?: string[];
  preferred_mission_orientation?: string[];
  preferred_work_style?: string[];
  regulatory_experience?: string[];
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
  current_seniority?: string | null;
  interested_roles?: any[];
}

export interface CompanyProfileRow {
  id: string;
  company_name?: string;
  logo_url?: string | null;
  website?: string;
  tagline?: string;
  about?: string;
  mission_statement?: string | null;
  industry?: string[];
  values?: string[];
  culture_description?: string | null;
  work_environment?: string | null;
  desired_traits?: string[];
  diversity_statement?: string | null;
  perks?: string[];
  benefits_description?: string | null;
  remote_policy?: string;
  team_size?: number;
  founded_year?: number;
  headquarters_location?: string;
  company_size_range?: string | null;
  funding_stage?: string | null;
  growth_stage?: string | null;
  tech_stack?: string[];
  social_media?: Record<string, string>;
  company_photos?: string[];
  billing_plan?: string;
  credits?: number;
  is_mock_data?: boolean;
  mock_data_seed?: string | null;
  work_style_culture?: any;
  team_structure?: any;
  company_languages?: string[];
  default_timezone?: string | null;
  visa_sponsorship_policy?: string | null;
  follower_count?: number;
  focus_type?: string | null;
  mission_orientation?: string | null;
  work_style?: string | null;
  required_certifications?: string[];
  preferred_certifications?: string[];
  regulatory_domains?: string[];
}

export interface HiringManagerPreferencesRow {
  id: string;
  user_id: string;
  company_id: string;
  is_default: boolean;
  team_size?: string | null;
  reporting_structure?: string | null;
  leadership_style?: string | null;
  feedback_frequency?: string | null;
  communication_preference?: string | null;
  meeting_culture?: string | null;
  conflict_resolution?: string | null;
  work_intensity?: string | null;
  autonomy_level?: string | null;
  decision_making?: string | null;
  ambiguity_tolerance?: string | null;
  change_frequency?: string | null;
  risk_tolerance?: string | null;
  collaboration_frequency?: string | null;
  pair_programming?: string | null;
  cross_functional?: string | null;
  required_traits?: string[];
  preferred_traits?: string[];
  impact_scope_min?: number | null;
  impact_scope_max?: number | null;
  work_style_dealbreakers?: string[];
  team_dealbreakers?: string[];
  trait_dealbreakers?: string[];
  growth_expectation?: string | null;
  mentorship_approach?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Map a raw jobs DB row to a camelCase JobPosting.
 *
 * DB columns mapped:
 *   id, company_id, canonical_role_id, company_name, company_logo,
 *   title, description, location, salary_range, salary_min, salary_max,
 *   salary_currency, seniority, contract_types, start_date, work_mode,
 *   posted_date, status, approvals, required_skills, required_skills_with_levels,
 *   values_list, perks, desired_traits, required_traits, company_industry,
 *   required_education_level, preferred_education_level, education_required,
 *   responsibilities, impact_statement, key_deliverables, success_metrics,
 *   team_structure, growth_opportunities, tech_stack, required_impact_scope,
 *   desired_performance_scores, work_style_requirements, work_style_dealbreakers,
 *   team_requirements, team_dealbreakers, required_languages, preferred_languages,
 *   timezone_requirements, required_timezone_overlap, visa_sponsorship_available,
 *   equity_offered, relocation_assistance, desired_myers_briggs, desired_disc_profile,
 *   desired_enneagram_types, required_certifications, preferred_certifications,
 *   regulatory_domains
 */
export function mapJobFromDB(data: JobRow, hmPrefs?: HiringManagerPreferencesRow | null): JobPosting {
  if (!data) return {} as JobPosting;
  const skillsSource = data.required_skills_with_levels || data.required_skills || [];
  return {
    id: data.id,
    companyId: data.company_id,
    canonicalRoleId: data.canonical_role_id,
    companyName: data.company_name,
    companyLogo: data.company_logo,
    title: data.title,
    description: data.description,
    location: data.location,
    salaryRange: data.salary_range,
    salaryMin: data.salary_min,
    salaryMax: data.salary_max,
    salaryCurrency: data.salary_currency || 'USD',
    seniority: data.seniority,
    contractTypes: data.contract_types || [],
    startDate: data.start_date,
    workMode: data.work_mode || 'Remote',
    postedDate: data.posted_date || data.created_at,
    status: data.status,
    approvals: data.approvals,
    requiredSkills: skillsSource.map((s: any) => {
      if (typeof s === 'string') {
        return { name: s, required_level: 3 as const, minimumYears: 0, weight: 'preferred' as const };
      }
      return {
        name: s.name || s.skill || s.skill_name || '',
        required_level: s.required_level || (s.minimumYears >= 5 ? 4 : s.minimumYears >= 3 ? 3 : 2),
        minimumYears: s.minimumYears,
        weight: s.weight || 'preferred'
      };
    }),
    values: data.values_list || [],
    perks: data.perks || [],
    desiredTraits: data.desired_traits || [],
    requiredTraits: data.required_traits || [],
    companyIndustry: data.company_industry || [],
    requiredEducationLevel: data.required_education_level,
    preferredEducationLevel: data.preferred_education_level,
    educationRequired: data.education_required || false,
    responsibilities: data.responsibilities || [],
    impactStatement: data.impact_statement,
    keyDeliverables: data.key_deliverables || [],
    successMetrics: data.success_metrics || [],
    teamStructure: data.team_structure,
    growthOpportunities: data.growth_opportunities,
    techStack: data.tech_stack || [],
    requiredImpactScope: data.required_impact_scope,
    desiredPerformanceScores: data.desired_performance_scores,
    workStyleRequirements: data.work_style_requirements || {},
    workStyleDealbreakers: data.work_style_dealbreakers || [],
    teamRequirements: data.team_requirements || {},
    teamDealbreakers: data.team_dealbreakers || [],
    requiredLanguages: data.required_languages || [],
    preferredLanguages: data.preferred_languages || [],
    timezoneRequirements: data.timezone_requirements,
    requiredTimezoneOverlap: data.required_timezone_overlap,
    visaSponsorshipAvailable: data.visa_sponsorship_available || false,
    equityOffered: data.equity_offered || false,
    relocationAssistance: data.relocation_assistance || false,
    desiredMyersBriggs: data.desired_myers_briggs || [],
    desiredDiscProfile: data.desired_disc_profile || null,
    desiredEnneagramTypes: data.desired_enneagram_types || [],
    requiredCertifications: data.required_certifications || [],
    preferredCertifications: data.preferred_certifications || [],
    regulatoryDomains: data.regulatory_domains || [],
    hiringManagerPreferences: hmPrefs || undefined,
  } as JobPosting;
}

/**
 * Map a raw candidate_profiles DB row to a camelCase CandidateProfile.
 *
 * DB columns mapped:
 *   id, name, headline, email, location, avatar_urls, video_intro_url,
 *   theme_color, theme_font, bio, status, skills, skills_with_levels,
 *   contract_types, preferred_work_mode, desired_perks, interested_industries,
 *   character_traits, values_list, non_negotiables, portfolio, references_list,
 *   experience, desired_seniority, salary_expectation, salary_min, salary_max,
 *   salary_currency, legal_status, current_bonuses, notice_period, ambitions,
 *   is_unlocked, education_level, education_field, education_institution,
 *   education_graduation_year, myers_briggs, disc_profile, enneagram_type,
 *   assessment_completed_at, call_ready, call_link, is_mock_data,
 *   verification_stats, current_impact_scope, desired_impact_scope,
 *   total_years_experience, work_style_preferences, team_collaboration_preferences,
 *   timezone, languages, preferred_timezone, preferred_company_size,
 *   willing_to_relocate, open_to_equity, preferred_leadership_style,
 *   preferred_feedback_frequency, preferred_communication_style,
 *   preferred_meeting_culture, preferred_conflict_resolution,
 *   preferred_mentorship_style, growth_goals, primary_role_id,
 *   primary_role_name, secondary_roles, preferred_company_focus,
 *   preferred_mission_orientation, preferred_work_style, regulatory_experience
 */
export function mapCandidateFromDB(data: CandidateProfileRow): CandidateProfile {
  if (!data) return {} as CandidateProfile;
  const skillsSource = data.skills_with_levels || data.skills || [];
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    headline: data.headline,
    email: data.email,
    location: data.location,
    avatarUrl: data.avatar_url,
    avatarUrls: data.avatar_urls || [],
    videoIntroUrl: data.video_intro_url,
    themeColor: data.theme_color,
    themeFont: data.theme_font,
    bio: data.bio,
    status: data.status,
    skills: skillsSource.map((s: any) => {
      if (typeof s === 'string') {
        return { name: s, level: 3 as const, years: 0 };
      }
      const years = s.years !== undefined ? s.years : (s.minimumYears || 0);
      return {
        name: s.name || s.skill || s.skill_name || '',
        years,
        level: (s.level || (years >= 8 ? 5 : years >= 5 ? 4 : years >= 3 ? 3 : years >= 1 ? 2 : 1)) as 1 | 2 | 3 | 4 | 5,
        description: s.description
      };
    }),
    contractTypes: data.contract_types || [],
    preferredWorkMode: data.preferred_work_mode || [],
    desiredPerks: data.desired_perks || [],
    interestedIndustries: data.interested_industries || [],
    characterTraits: data.character_traits || [],
    values: data.values_list || [],
    nonNegotiables: data.non_negotiables || [],
    portfolio: data.portfolio || [],
    references: data.references_list || [],
    experience: data.experience || [],
    desiredSeniority: data.desired_seniority || [],
    salaryExpectation: data.salary_expectation,
    salaryMin: data.salary_min,
    salaryMax: data.salary_max,
    salaryCurrency: data.salary_currency || 'USD',
    legalStatus: data.legal_status,
    currentBonuses: data.current_bonuses,
    noticePeriod: data.notice_period,
    ambitions: data.ambitions,
    isUnlocked: data.is_unlocked,
    educationLevel: data.education_level,
    educationField: data.education_field,
    educationInstitution: data.education_institution,
    educationGraduationYear: data.education_graduation_year,
    myersBriggs: data.myers_briggs,
    discProfile: data.disc_profile || { D: 0, I: 0, S: 0, C: 0 },
    enneagramType: data.enneagram_type,
    assessmentCompletedAt: data.assessment_completed_at,
    callReady: data.call_ready,
    callLink: data.call_link,
    isMockData: data.is_mock_data || false,
    verificationStats: data.verification_stats,
    currentImpactScope: data.current_impact_scope,
    desiredImpactScopes: data.desired_impact_scope || [],
    totalYearsExperience: data.total_years_experience,
    workStylePreferences: data.work_style_preferences || {},
    teamCollaborationPreferences: data.team_collaboration_preferences || {},
    timezone: data.timezone,
    languages: data.languages || [],
    preferredTimezone: data.preferred_timezone,
    preferredCompanySize: data.preferred_company_size || [],
    willingToRelocate: data.willing_to_relocate,
    openToEquity: data.open_to_equity,
    // Management preferences
    preferredLeadershipStyle: data.preferred_leadership_style,
    preferredFeedbackFrequency: data.preferred_feedback_frequency,
    preferredCommunicationStyle: data.preferred_communication_style,
    preferredMeetingCulture: data.preferred_meeting_culture,
    preferredConflictResolution: data.preferred_conflict_resolution,
    preferredMentorshipStyle: data.preferred_mentorship_style,
    growthGoals: data.growth_goals,
    // Role data
    primaryRoleId: data.primary_role_id,
    primaryRoleName: data.primary_role_name,
    secondaryRoles: data.secondary_roles || [],
    // Enrichment fields
    preferredCompanyFocus: data.preferred_company_focus || [],
    preferredMissionOrientation: data.preferred_mission_orientation || [],
    preferredWorkStyle: data.preferred_work_style || [],
    regulatoryExperience: data.regulatory_experience || [],
    onboardingCompleted: data.onboarding_completed || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as unknown as CandidateProfile;
}

/**
 * Map a raw company_profiles DB row to a camelCase CompanyProfile.
 *
 * DB columns mapped:
 *   id, company_name, logo_url, website, tagline, about, mission_statement,
 *   industry, values, culture_description, work_environment, desired_traits,
 *   diversity_statement, perks, benefits_description, remote_policy,
 *   team_size, founded_year, headquarters_location, company_size_range,
 *   funding_stage, growth_stage, tech_stack, social_media, company_photos,
 *   billing_plan, credits, is_mock_data, mock_data_seed, work_style_culture,
 *   team_structure, company_languages, default_timezone, visa_sponsorship_policy,
 *   follower_count, focus_type, mission_orientation, work_style,
 *   required_certifications, preferred_certifications, regulatory_domains
 */
export function mapCompanyFromDB(data: CompanyProfileRow): CompanyProfile {
  if (!data) return {} as CompanyProfile;
  return {
    id: data.id,
    companyName: data.company_name || '',
    logoUrl: data.logo_url,
    website: data.website || '',
    tagline: data.tagline || '',
    about: data.about || '',
    missionStatement: data.mission_statement,
    industry: data.industry || [],
    values: data.values || [],
    cultureDescription: data.culture_description,
    workEnvironment: data.work_environment,
    desiredTraits: data.desired_traits || [],
    diversityStatement: data.diversity_statement,
    perks: data.perks || [],
    benefitsDescription: data.benefits_description,
    remotePolicy: data.remote_policy || '',
    teamSize: data.team_size || 0,
    foundedYear: data.founded_year || new Date().getFullYear(),
    headquartersLocation: data.headquarters_location || '',
    companySizeRange: data.company_size_range,
    fundingStage: data.funding_stage,
    growthStage: data.growth_stage,
    techStack: data.tech_stack || [],
    socialMedia: data.social_media || {},
    companyPhotos: data.company_photos || [],
    billingPlan: data.billing_plan || 'pay_per_hire',
    credits: data.credits || 0,
    isMockData: data.is_mock_data || false,
    mockDataSeed: data.mock_data_seed,
    workStyleCulture: data.work_style_culture || {},
    teamStructure: data.team_structure || {},
    companyLanguages: data.company_languages || [],
    defaultTimezone: data.default_timezone,
    visaSponsorshipPolicy: data.visa_sponsorship_policy,
    followerCount: data.follower_count || 0,
    focusType: data.focus_type || null,
    missionOrientation: data.mission_orientation || null,
    workStyle: data.work_style || null,
    requiredCertifications: data.required_certifications || [],
    preferredCertifications: data.preferred_certifications || [],
    regulatoryDomains: data.regulatory_domains || [],
  } as CompanyProfile;
}
