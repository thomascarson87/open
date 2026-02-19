import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { JobPosting } from '../../types';
import { mapJobFromDB } from '../../services/dataMapperService';
import { TalentPoolAnalysis, CompensationBenchmarks, JobPerformance, CultureAlignment } from '../../components/talent-market';

const TalentMarket: React.FC = () => {
  const { user, companyId } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [companyPerks, setCompanyPerks] = useState<string[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch company's jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user?.id) {
        setIsLoadingJobs(false);
        return;
      }

      setIsLoadingJobs(true);
      setError(null);

      try {
        // Get company_id from team_members or use user.id (same pattern as RecruiterMyJobs)
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();

        const effectiveCompanyId = teamMember?.company_id || companyId || user.id;
        console.log('[TalentMarket] Fetching jobs for company:', effectiveCompanyId, '(teamMember:', teamMember?.company_id, 'contextCompanyId:', companyId, 'userId:', user.id, ')');

        // First try with company_id filter
        let { data, error: fetchError } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', effectiveCompanyId)
          .order('posted_date', { ascending: false });

        console.log('[TalentMarket] Jobs query result:', { count: data?.length, error: fetchError?.message, errorCode: fetchError?.code, statuses: data?.map((j: any) => j.status) });

        // If no jobs found, try with user.id directly (fallback for cases where company_id might differ)
        if ((!data || data.length === 0) && effectiveCompanyId !== user.id) {
          console.log('[TalentMarket] No jobs found with effectiveCompanyId, trying with user.id directly');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('jobs')
            .select('*')
            .eq('company_id', user.id)
            .order('posted_date', { ascending: false });

          if (fallbackData && fallbackData.length > 0) {
            data = fallbackData;
            fetchError = fallbackError;
            console.log('[TalentMarket] Fallback found jobs:', fallbackData.length);
          }
        }

        // Debug: Check if there are ANY jobs at all (to distinguish between "no jobs for this company" vs "no jobs at all")
        if (!data || data.length === 0) {
          const { count } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
          console.log('[TalentMarket] Total jobs in system:', count);
        }

        if (fetchError) {
          console.error('Error fetching jobs:', fetchError);
          setError('Unable to load jobs');
          return;
        }

        if (data) {
          // Include all jobs that aren't closed/archived - be more permissive
          const activeJobs = data.filter((j: any) =>
            j.status !== 'closed' && j.status !== 'archived'
          );
          console.log('[TalentMarket] Active jobs after filter:', activeJobs.length, 'of', data.length);
          setJobs(activeJobs.map(j => mapJobFromDB(j)));
        }

        // Fetch company profile for perks
        const { data: companyProfile } = await supabase
          .from('company_profiles')
          .select('perks')
          .eq('id', effectiveCompanyId)
          .maybeSingle();

        if (companyProfile?.perks) {
          setCompanyPerks(companyProfile.perks);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Something went wrong');
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [user?.id, companyId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-primary">Talent Market</h1>
        <p className="text-muted mt-1">Precision starts with understanding the market.</p>
      </div>

      {/* Error State */}
      {error && !isLoadingJobs && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Talent Pool Analysis */}
      <section className="mb-8">
        <h2 className="font-heading text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
          Talent Pool
        </h2>
        <TalentPoolAnalysis
          jobs={jobs}
          companyId={companyId || user?.id || ''}
          isLoadingJobs={isLoadingJobs}
        />
      </section>

      {/* Compensation Benchmarks */}
      <section className="mb-8">
        <h2 className="font-heading text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
          Compensation Benchmarks
        </h2>
        <CompensationBenchmarks
          jobs={jobs}
          companyPerks={companyPerks}
          isLoading={isLoadingJobs}
        />
      </section>

      {/* Job Performance */}
      <section className="mb-8">
        <h2 className="font-heading text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
          Job Performance
        </h2>
        <JobPerformance
          jobs={jobs}
          isLoading={isLoadingJobs}
        />
      </section>

      {/* Culture Alignment */}
      <section className="mb-8">
        <h2 className="font-heading text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-4">
          Culture Alignment
        </h2>
        <CultureAlignment
          companyId={companyId || user?.id || ''}
          isLoading={isLoadingJobs}
        />
      </section>

      {/* Coming Soon Sections */}
      <div className="bg-white dark:bg-surface rounded-[2.5rem] border border-border shadow-sm p-12 flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-center max-w-md">
          <p className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-4">More insights coming soon</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
            <span className="text-sm font-bold text-muted">Competitor Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentMarket;
