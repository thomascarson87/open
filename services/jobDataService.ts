
import { supabase } from './supabaseClient';
import { JobPosting, CompanyProfile, TeamMember, MatchBreakdown } from '../types';

export interface EnrichedJob {
  job: JobPosting;
  company: CompanyProfile;
  hiringManager: TeamMember | null;
  // Added matchResult and weightedScore to EnrichedJob interface to fix TypeScript errors in Discovery feed usage
  matchResult?: MatchBreakdown;
  weightedScore?: number;
}

/**
 * Fetches jobs along with their company profiles and hiring managers.
 */
export async function fetchEnrichedJobs(): Promise<EnrichedJob[]> {
  try {
    // 1. Fetch published jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'published')
      .order('posted_date', { ascending: false });

    if (jobsError) throw jobsError;
    if (!jobs) return [];

    // 2. Fetch company profiles for these jobs
    const companyIds = Array.from(new Set(jobs.map(j => j.company_id)));
    const { data: companies, error: companiesError } = await supabase
      .from('company_profiles')
      .select('*')
      .in('id', companyIds);

    if (companiesError) throw companiesError;

    // 3. Fetch hiring managers for these companies
    const { data: managers, error: managersError } = await supabase
      .from('team_members')
      .select('*')
      .in('company_id', companyIds)
      .eq('role', 'hiring_manager');

    if (managersError) throw managersError;

    // 4. Combine data
    return jobs.map(jobData => {
      const companyData = companies?.find(c => c.id === jobData.company_id);
      const hiringManager = managers?.find(m => m.company_id === jobData.company_id) || null;

      const job: JobPosting = mapJobFromDB(jobData);
      
      const company: CompanyProfile = {
        id: companyData?.id || jobData.company_id,
        companyName: companyData?.company_name || jobData.company_name || 'Unknown Company',
        logoUrl: companyData?.logo_url || jobData.company_logo,
        tagline: companyData?.tagline,
        about: companyData?.about,
        industry: companyData?.industry || [],
        values: companyData?.values || [],
        perks: companyData?.perks || [],
        teamSize: companyData?.team_size,
        fundingStage: companyData?.funding_stage,
        companySizeRange: companyData?.company_size_range,
        techStack: companyData?.tech_stack || [],
        missionStatement: companyData?.mission_statement,
        cultureDescription: companyData?.culture_description,
        workEnvironment: companyData?.work_environment,
        benefitsDescription: companyData?.benefits_description,
        teamStructure: companyData?.team_structure
      } as CompanyProfile;

      return { job, company, hiringManager };
    });
  } catch (error) {
    console.error('Error fetching enriched jobs:', error);
    return [];
  }
}

function mapJobFromDB(data: any): JobPosting {
    const skillsSource = data.required_skills_with_levels || data.required_skills || [];
    return { 
        ...data, 
        id: data.id,
        company_id: data.company_id,
        companyName: data.company_name,
        companyLogo: data.company_logo,
        title: data.title,
        description: data.description,
        location: data.location,
        salaryRange: data.salary_range,
        salaryMin: data.salary_min,
        salaryMax: data.salary_max,
        salaryCurrency: data.salary_currency || 'USD',
        seniority: data.seniority,
        contractTypes: data.contract_types || [],
        startDate: data.start_date,
        workMode: data.work_mode || 'Remote',
        postedDate: data.posted_date || data.created_at,
        status: data.status,
        requiredSkills: skillsSource.map((s: any) => ({
            name: s.name,
            required_level: s.required_level || (s.minimumYears >= 5 ? 4 : s.minimumYears >= 3 ? 3 : 2),
            minimumYears: s.minimumYears,
            weight: s.weight || 'preferred'
        })),
        values: data.values_list || [],
        perks: data.perks || [],
        desiredTraits: data.desired_traits || [],
        requiredTraits: data.required_traits || [],
        tech_stack: data.tech_stack || [],
        responsibilities: data.responsibilities || [],
        impact_statement: data.impact_statement,
        key_deliverables: data.key_deliverables || [],
        success_metrics: data.success_metrics || [],
        growth_opportunities: data.growth_opportunities,
        team_structure: data.team_structure,
        requiredCertifications: data.required_certifications || [],
        preferredCertifications: data.preferred_certifications || [],
        regulatoryDomains: data.regulatory_domains || []
    } as JobPosting;
}
