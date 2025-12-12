
export const COMPANY_SIZE_RANGES = [
  'SEED',
  'EARLY',
  'MID',
  'LARGE',
  'ENTERPRISE'
] as const;

export const COMPANY_SIZE_DESCRIPTIONS = {
  SEED: '1-10 Employees',
  EARLY: '11-50 Employees',
  MID: '51-200 Employees',
  LARGE: '201-1000 Employees',
  ENTERPRISE: '1000+ Employees'
};

export const FUNDING_STAGES = [
  'Bootstrapped',
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Public'
] as const;

export const GROWTH_STAGES = [
  'Validation',
  'Product-Market Fit',
  'Hypergrowth',
  'Scaling',
  'Established'
] as const;

export const GROWTH_STAGE_DESCRIPTIONS = {
  Validation: 'Finding our first customers',
  'Product-Market Fit': 'We have customers who love us',
  Hypergrowth: 'Doubling team/revenue year over year',
  Scaling: 'Optimizing processes and expanding',
  Established: 'Steady growth and profitability'
};

export const REMOTE_POLICIES = [
  'Remote-First',
  'Remote-Friendly',
  'Hybrid',
  'Office-First',
  'Office-Only'
] as const;

export const REMOTE_POLICY_DESCRIPTIONS = {
  'Remote-First': 'Default to remote, office optional',
  'Remote-Friendly': 'Office exists, but remote is equal citizen',
  'Hybrid': 'Specific days in office required',
  'Office-First': 'Remote allowed only in exceptional cases',
  'Office-Only': '100% in-office requirement'
};

export const COMMON_TECH_STACK = [
  'React', 'Vue', 'Angular', 'Svelte',
  'Node.js', 'Python', 'Go', 'Java', 'Rust', 'Ruby', 'PHP',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
  'AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker',
  'TypeScript', 'GraphQL', 'Next.js', 'Tailwind',
  'Swift', 'Kotlin', 'Flutter', 'React Native'
];
