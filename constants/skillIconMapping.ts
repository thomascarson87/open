
/**
 * Maps skill names from SKILLS_LIST to skill-icons.dev icon identifiers
 * Skill Icons URL pattern: https://skillicons.dev/icons?i=react,typescript,nodejs
 */
export const SKILL_ICON_MAP: Record<string, string> = {
  // Frontend Development
  "React": "react",
  "React Native": "react",
  "Vue.js": "vue",
  "Angular": "angular",
  "Svelte": "svelte",
  "Next.js": "nextjs",
  "Nuxt.js": "nuxtjs",
  "TypeScript": "ts",
  "JavaScript": "js",
  "HTML5": "html",
  "CSS3": "css",
  "Tailwind CSS": "tailwind",
  "SASS/SCSS": "sass",
  "Material-UI": "materialui",
  "Redux": "redux",
  "Webpack": "webpack",
  "Vite": "vite",
  "Jest": "jest",
  "Cypress": "cypress",
  "Bootstrap": "bootstrap",
  "D3.js": "d3",
  
  // Backend Development
  "Node.js": "nodejs",
  "Express.js": "express",
  "NestJS": "nestjs",
  "Python": "python",
  "Django": "django",
  "Flask": "flask",
  "FastAPI": "fastapi",
  "Java": "java",
  "Spring Boot": "spring",
  "Go (Golang)": "go",
  "Rust": "rust",
  "Ruby": "ruby",
  "Ruby on Rails": "rails",
  "PHP": "php",
  "Laravel": "laravel",
  "C#": "cs",
  ".NET Core": "dotnet",
  "Kotlin (Backend)": "kotlin",
  "Elixir": "elixir",
  
  // Database & Storage
  "PostgreSQL": "postgres",
  "MySQL": "mysql",
  "MongoDB": "mongodb",
  "Redis": "redis",
  "Elasticsearch": "elasticsearch",
  "DynamoDB": "dynamodb",
  
  // Cloud & DevOps
  "AWS": "aws",
  "Google Cloud Platform": "gcp",
  "Azure": "azure",
  "Docker": "docker",
  "Kubernetes": "kubernetes",
  "Terraform": "terraform",
  "Jenkins": "jenkins",
  "GitHub Actions": "githubactions",
  "GitLab CI": "gitlab",
  
  // Mobile
  "iOS (Swift)": "swift",
  "Android (Kotlin)": "kotlin",
  "Flutter": "flutter",
  
  // AI/ML
  "TensorFlow": "tensorflow",
  "PyTorch": "pytorch",
  
  // Tools
  "Git": "git",
  "GitHub": "github",
  "Figma": "figma",
  "VS Code": "vscode",
  "Nginx": "nginx",
  "GraphQL": "graphql",
  "Firebase": "firebase",
  "Supabase": "supabase",
  "Vercel": "vercel",
  "Linux": "linux"
};

/**
 * Get skill icon URL for a given skill name
 */
export function getSkillIconUrl(skillName: string): string | null {
  const iconSlug = SKILL_ICON_MAP[skillName];
  if (!iconSlug) return null;
  return `https://skillicons.dev/icons?i=${iconSlug}&theme=light`;
}

/**
 * Check if a skill has an icon available
 */
export function hasSkillIcon(skillName: string): boolean {
  return skillName in SKILL_ICON_MAP;
}
