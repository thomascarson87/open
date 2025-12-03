
export type Role = 'candidate' | 'recruiter' | null;

export type MemberRole = 'admin' | 'hiring_manager' | 'finance' | 'interviewer';

export interface TeamMember {
  id: string; // This is the user_id
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
}

export interface CompanyProfile {
  id?: string;
  companyName: string;
  industry: string[];
  size: string;
  website: string;
  location: string;
  about: string;
  paymentMethod?: { last4: string; brand: string };
  logoUrl?: string;
  values?: string[];
  perks?: string[];
  desiredTraits?: string[];
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
  senderName?: string; // Hydrated on fetch
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
  applicationId?: string; // Linked application
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
