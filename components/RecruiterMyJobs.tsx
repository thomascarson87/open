import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { JobPosting } from '../types';
import { ApprovalBadge } from './JobApprovalPanel';
import { canUserApproveJob } from '../services/approvalService';
import {
  Briefcase,
  Users,
  TrendingUp,
  MoreVertical,
  Edit,
  Archive,
  Eye,
  BarChart3,
  Plus,
  Search,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Extended type for internal use
interface JobWithStats extends JobPosting {
  applicationsCount: number;
  avgMatchScore: number;
  recentApplications: number; // Last 7 days
}

type JobStatusFilter = 'all' | 'published' | 'pending_approval' | 'pending_my_approval' | 'draft' | 'closed';

const RecruiterMyJobs: React.FC = () => {
  const { user, teamRole } = useAuth();
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'applications' | 'match'>('date');

  // Statistics
  const [stats, setStats] = useState({
    totalActive: 0,
    totalApplications: 0,
    avgMatchScore: 0,
    positionsToFill: 0
  });

  useEffect(() => {
    if (user) loadJobs();
  }, [user, statusFilter]);

  const loadJobs = async () => {
    setLoading(true);
    
    try {
      // Fetch jobs created by this company
      let query = supabase
        .from('jobs')
        .select('*')
        .order('posted_date', { ascending: false });

      // We need to filter by company_id, which we assume is the user_id for the recruiter/company profile
      // In a more complex B2B setup, we'd fetch the company_id from team_members, but per App.tsx logic:
      const { data: teamMember } = await supabase.from('team_members').select('company_id').eq('user_id', user!.id).maybeSingle();
      const companyId = teamMember?.company_id || user!.id;
      
      query = query.eq('company_id', companyId);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: jobsData, error: jobsError } = await query;

      if (jobsError) throw jobsError;

      // For each job, fetch application statistics
      const jobsWithStats = await Promise.all(
        (jobsData || []).map(async (job: any) => {
          // Count applications
          const { count: totalApps } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);

          // Get recent applications (last 7 days)
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const { count: recentApps } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id)
            .gte('created_at', sevenDaysAgo.toISOString());

          // Calculate average match score
          const { data: matchData } = await supabase
            .from('applications')
            .select('match_score')
            .eq('job_id', job.id);

          const avgMatch = matchData && matchData.length > 0
            ? matchData.reduce((sum, app) => sum + (app.match_score || 0), 0) / matchData.length
            : 0;

          // Map DB snake_case to CamelCase types if needed, or use as is if types match partially
          // Note: App.tsx uses a mapper, we'll do a basic map here for used fields
          return {
            ...job,
            postedDate: job.posted_date, // Map for sorting
            companyName: job.company_name,
            workMode: job.work_mode,
            applicationsCount: totalApps || 0,
            avgMatchScore: Math.round(avgMatch),
            recentApplications: recentApps || 0
          } as JobWithStats;
        })
      );

      setJobs(jobsWithStats);

      // Calculate overall statistics
      const active = jobsWithStats.filter(j => j.status === 'published').length;
      const totalApps = jobsWithStats.reduce((sum, j) => sum + j.applicationsCount, 0);
      const avgScore = jobsWithStats.length > 0
        ? jobsWithStats.reduce((sum, j) => sum + j.avgMatchScore, 0) / jobsWithStats.length
        : 0;

      setStats({
        totalActive: active,
        totalApplications: totalApps,
        avgMatchScore: Math.round(avgScore),
        positionsToFill: active
      });

    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveJob = async (jobId: string) => {
    if (!confirm('Archive this job? It will no longer be visible to candidates.')) return;
    
    await supabase
      .from('jobs')
      .update({ status: 'closed' })
      .eq('id', jobId);
    
    loadJobs();
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Permanently delete this job? This cannot be undone.')) return;
    
    await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    loadJobs();
  };

  // Check if job is pending current user's approval
  const isPendingMyApproval = (job: JobWithStats): boolean => {
    if (!user?.id || !teamRole) return false;
    const { canApprove } = canUserApproveJob(job, user.id, teamRole);
    return canApprove;
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => {
      // Search filter
      if (searchQuery !== '' && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Status filter - special handling for pending_my_approval
      if (statusFilter === 'pending_my_approval') {
        return isPendingMyApproval(job);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
      if (sortBy === 'applications') {
        return b.applicationsCount - a.applicationsCount;
      }
      if (sortBy === 'match') {
        return b.avgMatchScore - a.avgMatchScore;
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      published: 'bg-green-100 text-green-700 border-green-200',
      pending_approval: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      draft: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:text-gray-600 border-border',
      closed: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      published: 'Live',
      pending_approval: 'Pending',
      draft: 'Draft',
      closed: 'Closed'
    };
    return labels[status] || status;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-heading text-3xl text-primary">My Job Postings</h1>
          <p className="text-muted mt-1">Manage your open positions and track applications</p>
        </div>
        <button 
          onClick={() => window.location.href = '/?view=create-job'} // Simple navigation via URL param logic in App.tsx
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black flex items-center shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 mr-2" /> Post New Job
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Active Jobs</span>
            <Briefcase className="w-5 h-5 text-accent-coral" />
          </div>
          <div className="text-3xl font-bold text-primary">{stats.totalActive}</div>
        </div>

        <div className="bg-white dark:bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Total Applications</span>
            <Users className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-primary">{stats.totalApplications}</div>
        </div>

        <div className="bg-white dark:bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Avg Match Score</span>
            <TrendingUp className="w-5 h-5 text-accent-green" />
          </div>
          <div className="text-3xl font-bold text-primary">{stats.avgMatchScore}%</div>
        </div>

        <div className="bg-white dark:bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted">Positions to Fill</span>
            <BarChart3 className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-primary">{stats.positionsToFill}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'published', 'pending_my_approval', 'pending_approval', 'draft', 'closed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as JobStatusFilter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                statusFilter === status
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-surface border border-border text-muted hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900'
              }`}
            >
              {status === 'pending_my_approval' && <Clock className="w-3.5 h-3.5" />}
              {status === 'all' ? 'All' : status === 'pending_my_approval' ? 'My Approvals' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent-coral outline-none bg-white dark:bg-surface"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-border rounded-lg font-medium bg-white dark:bg-surface cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900"
        >
          <option value="date">Sort by Date</option>
          <option value="applications">Sort by Applications</option>
          <option value="match">Sort by Match Score</option>
        </select>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-muted mt-4">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">No jobs found</h3>
          <p className="text-muted mb-6">
            {searchQuery ? 'Try a different search term' : 'Start by posting your first job'}
          </p>
          <button 
            onClick={() => window.location.href = '/?view=create-job'}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Post a Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div 
              key={job.id}
              className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-all p-6 group relative"
            >
              {/* Status & Approval Badges */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {job.status === 'pending_approval' && (
                  <ApprovalBadge job={job} />
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(job.status)}`}>
                  {getStatusLabel(job.status)}
                </span>
              </div>

              {/* Job Info */}
              <div className="mb-4 pr-20">
                <h3 className="text-lg font-bold text-primary mb-1">{job.title}</h3>
                <p className="text-sm text-muted">{job.location} · {job.workMode}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Posted {new Date(job.postedDate).toLocaleDateString()}
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{job.applicationsCount}</div>
                  <div className="text-xs text-muted">Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{job.avgMatchScore}%</div>
                  <div className="text-xs text-muted">Avg Match</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-coral">{job.recentApplications}</div>
                  <div className="text-xs text-muted">Last 7d</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <button 
                  onClick={() => {/* View job details - simplified for demo */}}
                  className="flex-1 py-2 px-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:text-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </button>
                <button 
                  onClick={() => {/* Edit job - simplified */}}
                  className="flex-1 py-2 px-3 bg-accent-coral-bg hover:bg-accent-coral-bg text-accent-coral rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </button>
                <div className="relative group/menu">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-lg transition-colors h-full flex items-center">
                    <MoreVertical className="w-4 h-4 text-muted" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-xl shadow-xl border border-border hidden group-hover/menu:block z-10 p-1">
                    {isPendingMyApproval(job) && (
                      <button
                        onClick={() => window.location.href = '/?view=pending-approvals'}
                        className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 rounded-lg flex items-center"
                      >
                        <Clock className="w-4 h-4 mr-2" /> Review & Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleArchiveJob(job.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 rounded-lg flex items-center"
                    >
                      <Archive className="w-4 h-4 mr-2" /> Archive
                    </button>
                    <button
                      onClick={() => {}}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 rounded-lg flex items-center"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                    </button>
                    {teamRole === 'admin' && (
                      <>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterMyJobs;
