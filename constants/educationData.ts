
export const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD/Doctorate',
  'Professional Certification',
  'Bootcamp Graduate',
  'Self-Taught',
  'Other'
] as const;

/* Added missing EDUCATION_FIELDS constant */
export const EDUCATION_FIELDS = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
  'Business Administration',
  'Design / Fine Arts',
  'Mathematics',
  'Physics',
  'Marketing',
  'Psychology',
  'Economics',
  'Political Science',
  'Linguistics',
  'Other'
] as const;

export const DISC_LABELS: Record<string, string> = {
  D: 'Dominance',
  I: 'Influence', 
  S: 'Steadiness',
  C: 'Compliance'
};

export const MYERS_BRIGGS_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const;

export const ENNEAGRAM_TYPES = [
  'Type 1', 'Type 2', 'Type 3', 'Type 4', 'Type 5',
  'Type 6', 'Type 7', 'Type 8', 'Type 9'
] as const;

// Validation functions
export const isValidMyersBriggs = (type: string): boolean => {
  return /^[IE][NS][TF][JP]$/.test(type);
};

export const isValidEnneagram = (type: string): boolean => {
  return /^Type [1-9]w?[0-9]?$/.test(type);
};
