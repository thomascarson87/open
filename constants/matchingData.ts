
// constants/matchingData.ts

export const CULTURAL_VALUES = [
  // Work Style & Pace
  "Innovation & Creativity",
  "Data-Driven Decision Making",
  "Fast-Paced Environment",
  "Steady & Sustainable Pace",
  "Work-Life Balance",
  "Continuous Learning",
  "Ownership & Autonomy",
  "Structured Processes",
  "Entrepreneurial Spirit",
  "Execution Excellence",
  
  // Team Culture
  "Collaborative Team Environment",
  "Independent Work",
  "Remote-First Culture",
  "In-Person Collaboration",
  "Diversity & Inclusion",
  "Flat Hierarchy",
  "Clear Organizational Structure",
  "Transparent Communication",
  "Consensus-Driven Decisions",
  "Merit-Based Recognition",
  
  // Mission & Purpose
  "Social Impact Focus",
  "Environmental Sustainability",
  "Customer-Centric",
  "Product Excellence",
  "Technical Excellence",
  "Profit-Driven",
  "Mission-Driven",
  "Community Building",
  
  // Growth & Development
  "Mentorship Culture",
  "Internal Mobility",
  "Leadership Development",
  "Skill Specialization",
  "Cross-Functional Growth",
  "Learning from Failure",
  
  // Innovation & Change
  "Cutting-Edge Technology",
  "Proven Technologies",
  "Risk-Taking Encouraged",
  "Stability & Predictability",
  "Rapid Experimentation",
  "Thoughtful Planning",
  
  // Communication
  "Open & Honest Feedback",
  "Diplomatic Communication",
  "Written Documentation",
  "Verbal Communication",
  "Async-First",
  "Real-Time Collaboration"
];

export const INDUSTRIES = [
  "Technology & Software",
  "Financial Services & Fintech",
  "Healthcare & Biotech",
  "E-commerce & Retail",
  "Education & EdTech",
  "Media & Entertainment",
  "Manufacturing & Industrial",
  "Energy & Utilities",
  "Real Estate & PropTech",
  "Transportation & Logistics",
  "Food & Beverage",
  "Travel & Hospitality",
  "Telecommunications",
  "Consulting & Professional Services",
  "Non-Profit & Social Impact",
  "Government & Public Sector",
  "Aerospace & Defense",
  "Agriculture & AgTech",
  "Gaming & Esports",
  "Cryptocurrency & Blockchain",
  "Marketing & Advertising",
  "Fashion & Apparel",
  "Sports & Fitness",
  "Legal Services",
  "Insurance",
  "Automotive",
  "Pharmaceuticals",
  "Cybersecurity",
  "Cloud Infrastructure",
  "Artificial Intelligence & Machine Learning"
];

export const PERKS_CATEGORIES = {
  "Health & Wellness": [
    "Comprehensive Health Insurance",
    "Mental Health Support",
    "Gym Membership / Fitness Stipend",
    "Wellness Programs",
    "On-site Healthcare",
    "Ergonomic Home Office Setup",
    "Health Savings Account (HSA)",
    "Life Insurance",
    "Disability Insurance",
    "Vision & Hearing Care"
  ],
  "Financial Benefits": [
    "401(k) / Pension Plan",
    "Company Match",
    "Stock Options / Equity",
    "Performance Bonuses",
    "Profit Sharing",
    "Signing Bonus",
    "Relocation Assistance",
    "Student Loan Repayment",
    "Financial Planning Services",
    "Referral Bonuses"
  ],
  "Time Off & Leave": [
    "Unlimited PTO",
    "Generous PTO (20+ days)",
    "Paid Parental Leave",
    "Sabbatical Program",
    "Flexible Holidays",
    "Birthday Day Off",
    "Volunteer Time Off",
    "Bereavement Leave",
    "Personal Days"
  ],
  "Work Flexibility": [
    "Fully Remote Work",
    "Hybrid Work Model",
    "Flexible Work Hours",
    "4-Day Work Week",
    "Compressed Work Week",
    "Work From Anywhere Policy",
    "No Core Hours",
    "Part-Time Options"
  ],
  "Professional Development": [
    "L&D Budget",
    "Conference Attendance",
    "Certification Reimbursement",
    "Internal Training",
    "Mentorship Program",
    "Executive Coaching",
    "Tuition Reimbursement",
    "Book Stipend"
  ],
  "Lifestyle": [
    "Free Meals / Catered Lunch",
    "Snacks & Beverages",
    "Team Outings",
    "Annual Retreats",
    "Pet-Friendly Office",
    "Commuter Benefits",
    "Free Parking",
    "Phone/Internet Stipend",
    "Co-working Membership",
    "Game Room"
  ],
  "Family Support": [
    "Childcare Assistance",
    "Family Health Coverage",
    "Adoption Assistance",
    "Elder Care Support",
    "Fertility Benefits",
    "Back-up Childcare"
  ]
};

export const ALL_PERKS = Object.values(PERKS_CATEGORIES).flat();

export const CHARACTER_TRAITS_CATEGORIES = {
  "Leadership": ["Decisive", "Inspiring", "Strategic", "Accountable", "Empowering", "Visionary"],
  "Communication": ["Clear Communicator", "Active Listener", "Persuasive", "Diplomatic", "Transparent", "Articulate"],
  "Work Style": ["Self-Starter", "Detail-Oriented", "Big Picture", "Methodical", "Adaptable", "Organized", "Proactive"],
  "Problem Solving": ["Analytical", "Creative", "Resourceful", "Pragmatic", "Innovative", "Critical Thinker", "Data-Driven"],
  "Interpersonal": ["Collaborative", "Empathetic", "Team Player", "Mentoring", "Conflict Resolver", "Inclusive", "Supportive"],
  "Drive": ["Results-Oriented", "Goal-Driven", "Persistent", "Ambitious", "Competitive", "Passionate", "High Energy"],
  "Adaptability": ["Flexible", "Resilient", "Open-Minded", "Learning-Oriented", "Change Agent", "Agile"],
  "Technical": ["Technical Depth", "Quick Learner", "Systems Thinker", "Quality-Focused", "Documentation-Oriented"],
  "EQ": ["Self-Aware", "Patient", "Calm Under Pressure", "Emotionally Intelligent", "Positive", "Humble"]
};

export const ALL_CHARACTER_TRAITS = Object.values(CHARACTER_TRAITS_CATEGORIES).flat();

export const SKILLS_LIST = {
  "Frontend Development": [
    "React", "React Native", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", 
    "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "SASS/SCSS",
    "Material-UI", "Chakra UI", "Ant Design", "Redux", "Zustand", "MobX",
    "Webpack", "Vite", "Jest", "Cypress", "Playwright", "WebAssembly", "Three.js",
    "Bootstrap", "Styled Components", "Emotion", "Storybook", "Framer Motion",
    "D3.js", "Chart.js", "Recoil", "React Query", "SWR"
  ],
  "Backend Development": [
    "Node.js", "Express.js", "NestJS", "Python", "Django", "Flask", "FastAPI",
    "Java", "Spring Boot", "Go (Golang)", "Rust", "Ruby", "Ruby on Rails",
    "PHP", "Laravel", "Symfony", "C#", ".NET Core", "ASP.NET", "Scala", "Elixir", 
    "Phoenix", "Kotlin (Backend)", "Perl", "Lua", "Erlang"
  ],
  "Database & Storage": [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB",
    "Cassandra", "Neo4j", "SQLite", "Supabase", "Firebase", "Oracle", "Microsoft SQL Server",
    "MariaDB", "CockroachDB", "CouchDB", "InfluxDB", "TimescaleDB", "Snowflake", "BigQuery"
  ],
  "DevOps & Cloud": [
    "AWS", "Azure", "Google Cloud Platform", "Docker", "Kubernetes", "Terraform",
    "Ansible", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Linux",
    "Nginx", "Apache", "Serverless", "Prometheus", "Grafana", "ELK Stack",
    "CloudFormation", "Pulumi", "Heroku", "Vercel", "Netlify", "DigitalOcean",
    "ArgoCD", "Helm", "Istio"
  ],
  "Mobile Development": [
    "iOS (Swift)", "Android (Kotlin)", "Flutter", "React Native", "Expo", 
    "Xamarin", "Ionic", "Objective-C", "Java (Android)", "SwiftUI", "Jetpack Compose"
  ],
  "Data Science & AI": [
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-learn",
    "Pandas", "NumPy", "Data Visualization", "Tableau", "Power BI", "SQL",
    "Apache Spark", "Hadoop", "Airflow", "Databricks", "NLP", "Computer Vision",
    "OpenCV", "Keras", "Matplotlib", "Seaborn", "R Language", "Jupyter"
  ],
  "Design & Product": [
    "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "Prototyping",
    "Wireframing", "User Research", "Design Systems", "Jira", "Asana", "Notion",
    "Product Management", "Agile/Scrum", "Linear", "Miro", "InVision", "Zeplin"
  ],
  "Security & Network": [
    "Network Security", "Penetration Testing", "OAuth", "JWT", "Cryptography",
    "Web Application Security", "Ethical Hacking", "CISSP", "Firewalls", "VPN",
    "OWASP", "Identity Management", "SSO"
  ],
  "General & Soft Skills": [
    "Git", "REST APIs", "GraphQL", "gRPC", "WebSockets",
    "Microservices", "System Design", "Technical Writing", "Mentoring",
    "Public Speaking", "Code Review", "TDD", "DDD", "Clean Architecture",
    "Remote Collaboration", "Cross-Functional Leadership"
  ]
};

// Helper type exports
export type CulturalValue = typeof CULTURAL_VALUES[number];
export type Industry = typeof INDUSTRIES[number];
export type Perk = typeof ALL_PERKS[number];
export type CharacterTrait = typeof ALL_CHARACTER_TRAITS[number];

