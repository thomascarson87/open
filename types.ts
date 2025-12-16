
export type Role = 'candidate' | 'recruiter' | null;

export type MemberRole = 'admin' | 'hiring_manager' | 'finance' | 'interviewer';

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
  FULL_TIME = 'Full-time',
  CONTRACT = 'Contract',
  FREELANCE = 'Freelance',
  PART_TIME = 'Part-time',
  INTERNSHIP = 'Internship'
}

export enum WorkMode {
  REMOTE = 'Remote',
  HYBRID = 'Hybrid',
  OFFICE = 'Office',
}

export enum SeniorityLevel {
  INTERN = 'Intern',
  JUNIOR = 'Junior',
  MID = 'Mid-Level',
  SENIOR = 'Senior',
  MANAGER = 'Manager',
  DIRECTOR = 'Director',
  EXECUTIVE = 'Executive',
}

export type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'slate';
export type ThemeFont = 'sans' | 'serif' | 'mono' | 'display';

export interface Skill {
  name: string;
  years: number;
}

export interface JobSkill {
  name: string;
  minimumYears: number;
  weight: 'required' | 'preferred';
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

export interface Certificate {
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialUrl?: string;
}

export interface PortfolioItem {
    id: string;
    platform: string;
    url: string;
}

export interface Reference {
    id: string;
    authorName: string;
    authorRole: string;
    authorCompany: string;
    relationship: 'Manager' | 'Peer' | 'Direct Report' | 'Client' | 'Mentor';
    content: string;
    assessment: 'Top 1% Talent' | 'Exceptional' | 'Highly Recommended' | 'Strong Performer';
    status: 'pending' | 'verified';
    date: string;
    characterTrait?: string;
}

// Professional Verification Types
export interface ProfessionalVerification {
  id: string;
  candidate_id: string;
  
  // Referee Info
  referee_email: string;
  referee_name?: string;
  referee_company?: string;
  relationship_type: 'manager' | 'peer' | 'direct_report' | 'client';
  years_worked_together: '<1 year' | '1-2 years' | '2-5 years' | '5+ years';
  
  // Skills
  verified_skills: Array<{
    skill: string;
    confirmed: boolean;
    proficiency: number; // 1-10
  }>;
  
  // Performance Ratings
  communication_written: number;
  communication_verbal: number;
  problem_solving_independence: number;
  problem_solving_creativity: number;
  reliability_deadlines: number;
  reliability_quality: number;
  collaboration_quality: number;
  
  // Optional Leadership
  leadership_mentorship?: number;
  leadership_decisions?: number;
  
  // Traits
  verified_traits: Array<{
    trait: string;
    agreement: number; // 1-5 scale
  }>;
  
  // Meta
  verification_token?: string;
  status: 'pending' | 'completed' | 'expired';
  is_visible_publicly: boolean;
  completed_at?: string;
  created_at: string;
  expires_at: string;
}

export interface VerificationStats {
  total_verifications: number;
  avg_communication: number;
  avg_problem_solving: number;
  avg_reliability: number;
  avg_collaboration: number;
  verified_skills: string[];
  verified_traits: string[];
}

export interface CandidateProfile {
  id: string;
  name: string;
  headline: string;
  email: string;
  location: string;
  avatarUrls: string[];
  videoIntroUrl?: string;
  themeColor: ThemeColor;
  themeFont: ThemeFont;
  bio: string;
  status: 'actively_looking' | 'open_to_offers' | 'happy_but_listening' | 'not_looking';
  characterTraits: string[];
  legalStatus: string;
  contractTypes: JobType[];
  currentBonuses: string;
  experience: Experience[];
  certificates?: Certificate[];
  portfolio: PortfolioItem[];
  references: Reference[];
  noticePeriod: string; 
  skills: Skill[];
  values: string[];
  ambitions: string;
  salaryExpectation: string;
  salaryMin?: number;
  salaryCurrency?: string;
  desiredSeniority: string[];
  preferredWorkMode: WorkMode[];
  desiredPerks: string[];
  interestedIndustries: string[];
  industryExperience?: Record<string, string>;
  nonNegotiables: string[];
  resumeText?: string;
  isUnlocked?: boolean;
  matchScore?: number;
  connections?: string[];
  
  // Education & Assessments
  education_level?: 'High School' | 'Associate Degree' | "Bachelor's Degree" | "Master's Degree" | 'PhD/Doctorate' | 'Professional Certification' | 'Bootcamp Graduate' | 'Self-Taught' | 'Other';
  education_field?: string; 
  education_institution?: string;
  myers_briggs?: string; 
  disc_profile?: { D: number; I: number; S: number; C: number }; 
  enneagram_type?: string; 
  assessment_completed_at?: string; 
  is_mock_data?: boolean;

  // Verifications
  verification_stats?: VerificationStats;
  verifications?: ProfessionalVerification[];
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  logoUrl?: string;
  website: string;
  tagline: string;
  about: string;
  missionStatement?: string;
  industry: string[];
  values: string[];
  cultureDescription?: string;
  workEnvironment?: string;
  desiredTraits: string[];
  diversityStatement?: string;
  perks: string[];
  benefitsDescription?: string;
  remotePolicy: string;
  teamSize: number;
  foundedYear: number;
  headquartersLocation: string;
  companySizeRange?: string;
  fundingStage?: string;
  growthStage?: string;
  techStack: string[];
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  companyPhotos: string[];
  billing_plan?: string;
  credits?: number;
  is_mock_data?: boolean;
  mock_data_seed?: any;
}

export interface Connection {
  id: string;
  name: string;
  headline: string;
  company: string;
  sharedHistory: string;
  isVerified: boolean;
  avatar?: string;
}

export interface ApprovalState {
    assignedTo: string;
    status: 'pending' | 'approved' | 'rejected';
    feedback?: string;
    date?: string;
}

export interface JobApprovals {
    hiringManager?: ApprovalState;
    finance?: ApprovalState;
}

export interface JobPosting {
  id: string;
  company_id: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  location: string;
  companyIndustry?: string[];
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
  approvals?: JobApprovals;
  company_industry?: string[];
  company_logo?: string;
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
  desired_myers_briggs?: string[];
  desired_disc_profile?: any;
  desired_performance_scores?: { 
    communication?: number; 
    problemSolving?: number; 
    reliability?: number; 
    collaboration?: number 
  };
  is_mock_data?: boolean;
  mock_data_seed?: any;
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
  };
  dealBreakers: string[];
  recommendations: string[];
}

export type ApplicationStatus =
  | 'applied'
  | 'reviewing'
  | 'phone_screen_scheduled'
  | 'phone_screen_completed'
  | 'technical_scheduled'
  | 'technical_completed'
  | 'final_round_scheduled'
  | 'final_round_completed'
  | 'offer_extended'
  | 'offer_accepted'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  matchScore: number;
  matchBreakdown?: MatchBreakdown;
  aiAnalysis?: string;
  lastUpdated: string;
  interviewers?: { [stage: string]: string[] };
  conversationId?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
  source?: string;
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  oldStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  changedBy: string;
  changeType: 'manual' | 'automatic' | 'system';
  notes?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  isSystemMessage: boolean;
  metadata?: any;
}

export interface Conversation {
  id: string;
  participants: { id: string, name: string, avatar?: string }[];
  lastMessage: Message;
  unreadCount: number;
  applicationId?: string;
  jobTitle?: string;
  companyName?: string;
  candidateName?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'interview' | 'screening' | 'technical_test' | 'sync' | 'other';
  start_time: string;
  end_time: string;
  video_link?: string;
  attendees: any[];
  status: string;
  is_synced: boolean;
  google_event_id?: string;
  candidate_id?: string;
  user_id: string;
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

export interface ProfileView {
  id: string;
  candidate_id: string;
  company_id: string;
  viewed_at: string;
  unlocked: boolean;
}

export interface TalentSearchCriteria {
  title?: string;
  seniority?: SeniorityLevel[];
  location?: string;
  workMode?: WorkMode[];
  requiredSkills: JobSkill[];  
  values?: string[];
  desiredTraits?: string[];
  requiredTraits?: string[];
  interestedIndustries?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  contractTypes?: JobType[];
  maxNoticePeriod?: number;
  desiredPerks?: string[];
  required_education_level?: string;
  preferred_education_level?: string;
  education_required?: boolean;
  dealBreakers?: string[];
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
  results_count?: number;
}

export interface TalentSearchResult {
  candidate: CandidateProfile;
  matchBreakdown: MatchBreakdown;
  matchScore: number;
  dealBreakersFailed: string[];
}
