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
    "Comprehensive Health Insurance (Medical, Dental, Vision)",
    "Mental Health Support & Therapy Coverage",
    "Gym Membership or Fitness Stipend",
    "Wellness Programs & Challenges",
    "On-site Healthcare Services",
    "Ergonomic Home Office Setup",
    "Health Savings Account (HSA)",
    "Life Insurance",
    "Disability Insurance",
    "Vision & Hearing Care"
  ],
  
  "Financial Benefits": [
    "401(k) or Pension Plan",
    "Company Match on 401(k)",
    "Stock Options / Equity Grants",
    "Performance Bonuses",
    "Profit Sharing",
    "Signing Bonus",
    "Relocation Assistance",
    "Student Loan Repayment Assistance",
    "Financial Planning Services",
    "Referral Bonuses",
    "Retention Bonuses"
  ],
  
  "Time Off & Leave": [
    "Unlimited PTO",
    "Generous PTO (20+ days)",
    "Paid Parental Leave (Maternity/Paternity)",
    "Sabbatical Program",
    "Flexible Holidays",
    "Birthday Day Off",
    "Volunteer Time Off",
    "Bereavement Leave",
    "Jury Duty Paid Leave",
    "Personal Days"
  ],
  
  "Work Flexibility": [
    "Fully Remote Work",
    "Hybrid Work Model",
    "Flexible Work Hours",
    "4-Day Work Week",
    "Compressed Work Week",
    "Work From Anywhere Policy",
    "No Core Hours Required",
    "Flexible Start/End Times",
    "Part-Time Options Available"
  ],
  
  "Professional Development": [
    "Learning & Development Budget",
    "Conference & Event Attendance",
    "Certification Reimbursement",
    "Internal Training Programs",
    "Mentorship Program",
    "Executive Coaching",
    "Tuition Reimbursement",
    "Book Stipend",
    "Online Course Subscriptions",
    "Career Pathing Programs",
    "Lunch & Learn Sessions"
  ],
  
  "Lifestyle & Workplace": [
    "Free Meals & Catered Lunch",
    "Snacks & Beverages Provided",
    "Team Outings & Events",
    "Annual Company Retreats",
    "Pet-Friendly Office",
    "Commuter Benefits",
    "Free Parking",
    "Transit Pass Subsidy",
    "Phone & Internet Stipend",
    "Co-working Space Membership",
    "Modern Office Space",
    "Game Room & Recreational Areas",
    "Standing Desks Available"
  ],
  
  "Family Support": [
    "Childcare Assistance",
    "Family Health Insurance Coverage",
    "Adoption Assistance",
    "Elder Care Support",
    "Fertility Benefits & IVF Coverage",
    "Back-up Childcare Services",
    "Lactation Rooms & Support",
    "Family Leave (Beyond Parental)"
  ],
  
  "Unique & Special Perks": [
    "Paid Sabbatical After X Years",
    "Charitable Donation Matching",
    "Employee Discounts on Products",
    "Company Car or Vehicle Allowance",
    "Housing or Rent Stipend",
    "Legal Assistance & Services",
    "Identity Theft Protection",
    "Travel Stipend",
    "Pet Insurance",
    "Dry Cleaning Services",
    "Concierge Services",
    "Unlimited Coffee & Snacks",
    "Company-Sponsored Social Clubs"
  ]
};

// Flatten perks for easier use
export const ALL_PERKS = Object.values(PERKS_CATEGORIES).flat();

export const CHARACTER_TRAITS_CATEGORIES = {
  "Leadership": [
    "Decisive",
    "Inspiring & Motivating",
    "Strategic Thinker",
    "Accountable",
    "Empowering Others",
    "Visionary",
    "Leads by Example",
    "Delegation Skills"
  ],
  
  "Communication": [
    "Clear Communicator",
    "Active Listener",
    "Persuasive",
    "Diplomatic",
    "Transparent",
    "Articulate",
    "Concise",
    "Multilingual"
  ],
  
  "Work Style": [
    "Self-Starter",
    "Detail-Oriented",
    "Big Picture Thinker",
    "Methodical",
    "Adaptable",
    "Organized",
    "Proactive",
    "Hands-On",
    "Process-Oriented",
    "Results-Focused"
  ],
  
  "Problem Solving": [
    "Analytical",
    "Creative Problem Solver",
    "Resourceful",
    "Pragmatic",
    "Innovative",
    "Critical Thinker",
    "Data-Driven",
    "First Principles Thinker"
  ],
  
  "Interpersonal": [
    "Collaborative",
    "Empathetic",
    "Team Player",
    "Mentoring",
    "Conflict Resolver",
    "Inclusive",
    "Supportive",
    "Networking",
    "Cross-Functional Collaborator"
  ],
  
  "Drive & Motivation": [
    "Results-Oriented",
    "Goal-Driven",
    "Persistent",
    "Ambitious",
    "Competitive",
    "Passionate",
    "Self-Motivated",
    "High Energy",
    "Ownership Mindset"
  ],
  
  "Adaptability": [
    "Flexible",
    "Resilient",
    "Open-Minded",
    "Learning-Oriented",
    "Change Agent",
    "Comfortable with Ambiguity",
    "Growth Mindset",
    "Agile"
  ],
  
  "Technical Aptitude": [
    "Technical Depth",
    "Quick Learner",
    "Systems Thinker",
    "Quality-Focused",
    "Debugging Expert",
    "Documentation-Oriented",
    "Best Practices Advocate"
  ],
  
  "Emotional Intelligence": [
    "Self-Aware",
    "Patient",
    "Calm Under Pressure",
    "Emotionally Intelligent",
    "Positive Attitude",
    "Humble",
    "Confident",
    "Mature",
    "Stress Management"
  ]
};

// Flatten traits for easier use
export const ALL_CHARACTER_TRAITS = Object.values(CHARACTER_TRAITS_CATEGORIES).flat();

// Helper type exports
export type CulturalValue = typeof CULTURAL_VALUES[number];
export type Industry = typeof INDUSTRIES[number];
export type Perk = typeof ALL_PERKS[number];
export type CharacterTrait = typeof ALL_CHARACTER_TRAITS[number];
