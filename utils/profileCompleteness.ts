import { CandidateProfile } from '../types';

export interface CompletenessResult {
  percentage: number;
  completedSections: string[];
  missingSections: string[];
  tips: string[];
  strengthLabel: string;
  strengthColor: string;
}

interface FieldWeight {
  field: string;
  label: string;
  weight: number;
  check: (profile: CandidateProfile) => boolean;
}

const PROFILE_FIELDS: FieldWeight[] = [
  // Essential (high weight)
  { field: 'name', label: 'Name', weight: 10, check: p => !!p.name?.trim() },
  { field: 'headline', label: 'Professional Headline', weight: 8, check: p => !!p.headline?.trim() },
  { field: 'bio', label: 'Bio/Summary', weight: 8, check: p => !!p.bio?.trim() && p.bio.length > 50 },
  { field: 'location', label: 'Location', weight: 8, check: p => !!p.location?.trim() },
  { field: 'skills', label: 'Skills', weight: 10, check: p => (p.skills?.length || 0) >= 3 },
  { field: 'experience', label: 'Work Experience', weight: 10, check: p => (p.experience?.length || 0) >= 1 },

  // Important (medium weight)
  { field: 'salary', label: 'Salary Expectations', weight: 7, check: p => !!p.salaryMin },
  { field: 'workMode', label: 'Work Mode Preference', weight: 6, check: p => (p.preferredWorkMode?.length || 0) > 0 },
  { field: 'education', label: 'Education', weight: 5, check: p => !!p.education_level },
  { field: 'status', label: 'Job Search Status', weight: 5, check: p => !!p.status },
  { field: 'contractTypes', label: 'Contract Preferences', weight: 4, check: p => (p.contractTypes?.length || 0) > 0 },

  // Enrichment (lower weight but improves matching)
  { field: 'workStyle', label: 'Work Style Preferences', weight: 5, check: p => Object.keys(p.workStylePreferences || {}).length >= 3 },
  { field: 'teamCollab', label: 'Team Collaboration Style', weight: 5, check: p => Object.keys(p.teamCollaborationPreferences || {}).length >= 3 },
  { field: 'traits', label: 'Character Traits', weight: 4, check: p => (p.characterTraits?.length || 0) >= 3 },
  { field: 'values', label: 'Values', weight: 4, check: p => (p.values?.length || 0) >= 2 },
  { field: 'timezone', label: 'Timezone', weight: 3, check: p => !!p.timezone },
  { field: 'languages', label: 'Languages', weight: 3, check: p => (p.languages?.length || 0) >= 1 },

  // Bonus (optional but valuable)
  { field: 'portfolio', label: 'Portfolio Links', weight: 2, check: p => (p.portfolio?.length || 0) >= 1 },
  { field: 'avatar', label: 'Profile Photo', weight: 2, check: p => (p.avatarUrls?.length || 0) >= 1 },
];

function getTipForField(field: string): string {
  const tips: Record<string, string> = {
    name: 'Add your full name',
    headline: 'Write a professional headline to stand out',
    bio: 'Add a summary (at least 50 characters) to introduce yourself',
    location: 'Add your location for better job matches',
    skills: 'Add at least 3 skills with proficiency levels',
    experience: 'Add your work experience',
    salary: 'Set salary expectations to match with relevant jobs',
    workMode: 'Select your preferred work mode (remote/hybrid/onsite)',
    status: 'Set your job search status',
  };
  return tips[field] || `Complete your ${field}`;
}

function getStrengthLabel(percentage: number): { label: string; color: string } {
  if (percentage >= 90) return { label: 'Excellent', color: 'text-green-500' };
  if (percentage >= 75) return { label: 'Strong', color: 'text-blue-500' };
  if (percentage >= 50) return { label: 'Good Start', color: 'text-yellow-500' };
  if (percentage >= 25) return { label: 'Getting There', color: 'text-orange-500' };
  return { label: 'Just Started', color: 'text-gray-500' };
}

export function calculateProfileCompleteness(profile: CandidateProfile): CompletenessResult {
  const totalWeight = PROFILE_FIELDS.reduce((sum, f) => sum + f.weight, 0);
  let completedWeight = 0;
  const completedSections: string[] = [];
  const missingSections: string[] = [];
  const tips: string[] = [];

  for (const field of PROFILE_FIELDS) {
    if (field.check(profile)) {
      completedWeight += field.weight;
      completedSections.push(field.label);
    } else {
      missingSections.push(field.label);
      // Add tips for high-weight missing fields
      if (field.weight >= 5) {
        tips.push(getTipForField(field.field));
      }
    }
  }

  const percentage = Math.round((completedWeight / totalWeight) * 100);
  const { label: strengthLabel, color: strengthColor } = getStrengthLabel(percentage);

  return {
    percentage,
    completedSections,
    missingSections,
    tips: tips.slice(0, 3), // Max 3 tips
    strengthLabel,
    strengthColor,
  };
}
