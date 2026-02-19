
import { supabase } from './supabaseClient';
import { JobPosting, CompanyProfile, TeamMember, MatchBreakdown } from '../types';
import { mapJobFromDB, mapCompanyFromDB } from './dataMapperService';

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

    // 4. Fetch HM preferences for jobs that have an assigned hiring manager
    const hmUserIds = Array.from(new Set(
      jobs
        .map(j => j.approvals?.hiringManager?.assignedTo)
        .filter(Boolean)
    )) as string[];

    let hmPrefsMap = new Map<string, any>();
    if (hmUserIds.length > 0) {
      const { data: hmPrefs } = await supabase
        .from('hiring_manager_preferences')
        .select('*')
        .in('user_id', hmUserIds)
        .eq('is_default', true);

      if (hmPrefs) {
        hmPrefs.forEach(hp => hmPrefsMap.set(hp.user_id, hp));
      }
    }

    // 5. Combine data
    return jobs.map(jobData => {
      const companyData = companies?.find(c => c.id === jobData.company_id);
      const hiringManager = managers?.find(m => m.company_id === jobData.company_id) || null;
      const hmUserId = jobData.approvals?.hiringManager?.assignedTo;
      const hmPrefs = hmUserId ? hmPrefsMap.get(hmUserId) || null : null;

      const job: JobPosting = mapJobFromDB(jobData, hmPrefs);
      
      const company: CompanyProfile = companyData
        ? mapCompanyFromDB(companyData)
        : {
            id: jobData.company_id,
            companyName: jobData.company_name || 'Unknown Company',
            logoUrl: jobData.company_logo,
          } as CompanyProfile;

      return { job, company, hiringManager };
    });
  } catch (error) {
    console.error('Error fetching enriched jobs:', error);
    return [];
  }
}

// mapJobFromDB imported from dataMapperService.ts (single source of truth)
