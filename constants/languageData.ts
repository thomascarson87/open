// constants/languageData.ts

export const COMMON_LANGUAGES = [
  'English',
  'Spanish',
  'Mandarin Chinese',
  'Hindi',
  'Arabic',
  'Portuguese',
  'French',
  'German',
  'Japanese',
  'Korean',
  'Italian',
  'Dutch',
  'Russian',
  'Polish',
  'Turkish',
  'Vietnamese',
  'Thai',
  'Indonesian',
  'Hebrew',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Greek',
  'Czech',
  'Romanian',
  'Hungarian',
  'Ukrainian',
  'Tagalog',
  'Swahili'
] as const;

export const LANGUAGE_PROFICIENCY_LEVELS = [
  { value: 'native', label: 'Native', description: 'Mother tongue or equivalent' },
  { value: 'fluent', label: 'Fluent', description: 'Near-native proficiency' },
  { value: 'professional', label: 'Professional', description: 'Business proficiency' },
  { value: 'conversational', label: 'Conversational', description: 'Everyday conversations' },
  { value: 'basic', label: 'Basic', description: 'Simple phrases' }
] as const;

export const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC', offset: 0 },
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: -5 },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: -6 },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: -8 },
  { value: 'America/Sao_Paulo', label: 'Brasília Time (BRT)', offset: -3 },
  { value: 'Europe/London', label: 'GMT/BST', offset: 0 },
  { value: 'Europe/Paris', label: 'Central European (CET)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 1 },
  { value: 'Asia/Dubai', label: 'Gulf (GST)', offset: 4 },
  { value: 'Asia/Kolkata', label: 'India (IST)', offset: 5.5 },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
  { value: 'Asia/Shanghai', label: 'China (CST)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 10 },
  { value: 'Pacific/Auckland', label: 'New Zealand (NZDT)', offset: 12 }
] as const;

export const TIMEZONE_OVERLAP_OPTIONS = [
  { value: 'full_overlap', label: 'Full Overlap', description: 'Same timezone ±1 hour' },
  { value: 'overlap_4_plus', label: '4+ Hours', description: 'At least 4 hours overlap' },
  { value: 'overlap_2_plus', label: '2+ Hours', description: 'At least 2 hours for syncs' },
  { value: 'async_first', label: 'Async-First', description: 'No overlap required' }
] as const;

export const COMPANY_SIZE_OPTIONS = [
  { value: 'SEED', label: 'Seed Stage', description: '1-10 employees' },
  { value: 'EARLY', label: 'Early Stage', description: '10-50 employees' },
  { value: 'MID', label: 'Mid-Size', description: '50-200 employees' },
  { value: 'LARGE', label: 'Large', description: '200-1000 employees' },
  { value: 'ENTERPRISE', label: 'Enterprise', description: '1000+ employees' }
] as const;

export const VISA_SPONSORSHIP_OPTIONS = [
  { value: 'sponsors_all', label: 'Sponsors All Visas' },
  { value: 'sponsors_some', label: 'Sponsors Some Visas' },
  { value: 'case_by_case', label: 'Case by Case' },
  { value: 'no_sponsorship', label: 'No Sponsorship' }
] as const;
