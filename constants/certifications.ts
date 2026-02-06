
export const COMPANY_FOCUS_TYPES = [
  { value: 'product_led', label: 'Product-Led', description: 'Build and ship our own products' },
  { value: 'consultancy', label: 'Consultancy', description: 'Serve clients with expertise' },
  { value: 'agency', label: 'Agency', description: 'Deliver projects for clients' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of internal products and client work' },
] as const;

export const MISSION_ORIENTATIONS = [
  { value: 'social_impact', label: 'Social Impact', description: 'Making the world better' },
  { value: 'environmental', label: 'Environmental', description: 'Sustainability & climate action' },
  { value: 'commercial', label: 'Commercial', description: 'Growth & profitability focused' },
  { value: 'tech_innovation', label: 'Tech Innovation', description: 'Pushing technical boundaries' },
] as const;

export const WORK_STYLES = [
  { value: 'internal_product', label: 'Internal Product', description: 'Work on our own products' },
  { value: 'client_projects', label: 'Client Projects', description: 'Build solutions for clients' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of internal and client work' },
] as const;

export const CERTIFICATION_CATEGORIES = [
  { value: 'cloud', label: 'Cloud & Infrastructure' },
  { value: 'agile_pm', label: 'Agile & Product Management' },
  { value: 'compliance', label: 'Compliance & Security' },
  { value: 'industry_specific', label: 'Industry-Specific' },
] as const;
