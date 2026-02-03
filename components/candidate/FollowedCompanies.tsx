import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Bell, BellOff, Building2, MapPin, Users, Loader2, HeartOff, Bookmark, Briefcase, DollarSign, Clock, Trash2 } from 'lucide-react';
import { companyFollowService } from '../../services/companyFollowService';
import { savedJobService } from '../../services/savedJobService';
import { useAuth } from '../../contexts/AuthContext';
import { JobPosting } from '../../types';

interface FollowedCompany {
  id: string;
  company_id: string;
  created_at: string;
  notification_enabled: boolean;
  company_profiles: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    industry: string | null;
    fundingStage: string | null;
    teamSize: string | null;
    location: string | null;
    follower_count: number;
  };
}

interface SavedJob {
  id: string;
  job_id: string;
  created_at: string;
  notes: string | null;
  jobs: JobPosting;
}

type TabType = 'saved-jobs' | 'companies';

interface FollowedCompaniesProps {
  initialTab?: TabType;
  onViewJob?: (job: JobPosting) => void;
}

const FollowedCompanies: React.FC<FollowedCompaniesProps> = ({ initialTab = 'saved-jobs', onViewJob }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [followedCompanies, setFollowedCompanies] = useState<FollowedCompany[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [companies, jobs] = await Promise.all([
        companyFollowService.getFollowedCompanies(user.id),
        savedJobService.getSavedJobs(user.id)
      ]);
      setFollowedCompanies(companies as FollowedCompany[]);
      setSavedJobs(jobs as SavedJob[]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUnfollowCompany = async (companyId: string) => {
    if (!user?.id || actionLoading) return;

    setActionLoading(companyId);
    try {
      await companyFollowService.unfollow(user.id, companyId);
      setFollowedCompanies(prev => prev.filter(c => c.company_id !== companyId));
    } catch (error) {
      console.error('Failed to unfollow:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsaveJob = async (jobId: string) => {
    if (!user?.id || actionLoading) return;

    setActionLoading(`job-${jobId}`);
    try {
      await savedJobService.unsave(user.id, jobId);
      setSavedJobs(prev => prev.filter(j => j.job_id !== jobId));
    } catch (error) {
      console.error('Failed to unsave:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleNotification = async (companyId: string, currentEnabled: boolean) => {
    if (!user?.id || actionLoading) return;

    setActionLoading(`notify-${companyId}`);
    try {
      await companyFollowService.updateNotificationPreference(user.id, companyId, !currentEnabled);
      setFollowedCompanies(prev =>
        prev.map(c =>
          c.company_id === companyId
            ? { ...c, notification_enabled: !currentEnabled }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to toggle notification:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive';
    const kMin = min ? `$${Math.round(min/1000)}K` : '';
    const kMax = max ? `$${Math.round(max/1000)}K` : '';
    if (min && max) return `${kMin} - ${kMax}`;
    return min ? `${kMin}+` : kMax;
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'recently';
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-pink-100 p-2.5 rounded-xl">
            <Heart className="w-6 h-6 text-pink-600 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Saved & Following</h1>
        </div>
        <p className="text-gray-500">
          Jobs you've saved and companies you're following
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
        <button
          onClick={() => setActiveTab('saved-jobs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'saved-jobs'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Jobs
          {savedJobs.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'saved-jobs' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {savedJobs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'companies'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Following
          {followedCompanies.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'companies' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {followedCompanies.length}
            </span>
          )}
        </button>
      </div>

      {/* Saved Jobs Tab */}
      {activeTab === 'saved-jobs' && (
        <>
          {savedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No saved jobs yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When you find jobs you're interested in, click the heart icon to save them here for later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedJobs.map((saved) => {
                const job = saved.jobs;
                return (
                  <div
                    key={saved.id}
                    className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group cursor-pointer"
                    onClick={() => onViewJob?.(job)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-black flex-shrink-0">
                        {job.companyName?.charAt(0) || 'C'}
                      </div>

                      {/* Job Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{job.companyName}</p>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          {(job.salaryMin || job.salaryMax) && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              {formatSalary(job.salaryMin, job.salaryMax)}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.location}
                            </span>
                          )}
                          {job.workMode && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                              {job.workMode}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">
                          Saved {getRelativeTime(saved.created_at)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveJob(saved.job_id);
                          }}
                          disabled={actionLoading === `job-${saved.job_id}`}
                          className="p-2 rounded-lg text-gray-400 hover:text-pink-600 hover:bg-pink-50 transition-all"
                          title="Remove from saved"
                        >
                          {actionLoading === `job-${saved.job_id}` ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <>
          {followedCompanies.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No companies followed yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Follow companies you're interested in to get notified about new job opportunities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedCompanies.map((follow) => {
                const company = follow.company_profiles;
                return (
                  <div
                    key={follow.id}
                    className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all group"
                  >
                    {/* Company Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.companyName}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-black">
                          {company.companyName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{company.companyName}</h3>
                        {company.industry && (
                          <p className="text-sm text-gray-500 truncate">{company.industry}</p>
                        )}
                      </div>
                    </div>

                    {/* Company Details */}
                    <div className="space-y-2 mb-4">
                      {company.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{company.location}</span>
                        </div>
                      )}
                      {(company.teamSize || company.fundingStage) && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>
                            {company.teamSize && `${company.teamSize} employees`}
                            {company.teamSize && company.fundingStage && ' · '}
                            {company.fundingStage}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Heart className="w-3 h-3" />
                        <span>{company.follower_count || 0} followers</span>
                      </div>
                    </div>

                    {/* Following Since */}
                    <p className="text-xs text-gray-400 mb-4">
                      Following since {formatDate(follow.created_at)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleNotification(follow.company_id, follow.notification_enabled)}
                        disabled={actionLoading === `notify-${follow.company_id}`}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          follow.notification_enabled
                            ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                        } ${actionLoading === `notify-${follow.company_id}` ? 'opacity-50' : ''}`}
                        title={follow.notification_enabled ? 'Disable job alerts' : 'Enable job alerts'}
                      >
                        {actionLoading === `notify-${follow.company_id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : follow.notification_enabled ? (
                          <>
                            <Bell className="w-4 h-4" />
                            Alerts On
                          </>
                        ) : (
                          <>
                            <BellOff className="w-4 h-4" />
                            Alerts Off
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleUnfollowCompany(follow.company_id)}
                        disabled={actionLoading === follow.company_id}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-50 text-gray-500 border border-gray-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all flex items-center justify-center gap-2 ${
                          actionLoading === follow.company_id ? 'opacity-50' : ''
                        }`}
                        title="Unfollow company"
                      >
                        {actionLoading === follow.company_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <HeartOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FollowedCompanies;
