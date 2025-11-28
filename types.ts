
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

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  type: string;
  description?: string; // Detailed responsibilities
  achievements?: string[]; // Key accomplishments
  skillsAcquired?: string[]; // specific skills used in this role
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
    platform: string; // e.g. GitHub, Figma, Behance
    url: string;
}

export interface Reference {
    id: string;
    authorName: string;
    authorRole: string;
    authorCompany: string;
    relationship: 'Manager' | 'Peer' | 'Direct Report' | 'Client' | 'Mentor';
    content: string; // The written text
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
  
  // Media
  avatarUrls: string[]; // Array for multiple profile pics
  videoIntroUrl?: string;
  
  // Theming
  themeColor: ThemeColor;
  themeFont: ThemeFont;

  // Bio & Status
  bio: string;
  status: 'actively_looking' | 'open_to_offers' | 'happy_but_listening' | 'not_looking';
  characterTraits: string[];
  
  // Logistics
  legalStatus: string; // Visa, Citizenship
  contractTypes: JobType[];
  currentBonuses: string; // Description of current bonus structure
  
  experience: Experience[];
  certificates?: Certificate[];
  portfolio: PortfolioItem[];
  references: Reference[];
  
  noticePeriod: string; 
  skills: Skill[];
  values: string[];
  ambitions: string;
  salaryExpectation: string;
  preferredWorkMode: WorkMode[];
  desiredPerks: string[];
  
  // Logic
  nonNegotiables: string[]; // Array of field keys that are non-negotiable
  resumeText?: string;
  isUnlocked?: boolean;
  matchScore?: number;
  connections?: string[];
}

export interface CompanyProfile {
  id?: string;
  companyName: string;
  industry: string;
  size: string;
  website: string;
  location: string;
  about: string;
  paymentMethod?: { last4: string; brand: string };
  logoUrl?: string;
}

export interface Connection {
  id: string;
  name: string;
  headline: string;
  company: string; // Current company
  sharedHistory: string; // Where you worked together
  isVerified: boolean;
  avatar?: string;
}

export interface ApprovalState {
    assignedTo: string; // user_id of the stakeholder
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
  salaryRange: string;
  seniority: SeniorityLevel;
  startDate?: string;
  workMode: WorkMode;
  requiredSkills: Skill[];
  values: string[];
  perks: string[];
  postedDate: string;
  status: 'draft' | 'pending_approval' | 'published' | 'closed';
  approvals?: JobApprovals;
}

export type ApplicationStatus = 
  | 'applied' 
  | 'screening' 
  | 'hr_interview' 
  | 'technical_test' 
  | 'manager_interview' 
  | 'exec_interview' 
  | 'offer' 
  | 'contracting' 
  | 'hired' 
  | 'rejected';

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  matchScore: number;
  aiAnalysis?: string;
  lastUpdated: string;
  // B2B Collaboration
  interviewers?: { [stage: string]: string[] }; // stage -> array of user_ids
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: { id: string, name: string, avatar?: string }[];
  lastMessage: Message;
  unreadCount: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string
  duration: number; // minutes
  attendees: string[];
  type: 'interview' | 'screening' | 'sync';
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'match' | 'message' | 'system' | 'application';
  isRead: boolean;
  timestamp: string;
}
