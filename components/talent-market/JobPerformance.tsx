import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Bookmark, FileText, TrendingUp, TrendingDown, Minus,
  ChevronDown, Target, Lightbulb, ArrowRight, Clock, AlertCircle,
  Sparkles, ChevronRight
} from 'lucide-react';
import { JobPosting } from '../../types';
import {
  getJobPerformanceMetrics,
  getPlatformBenchmarks,
  calculateAttractiveness,
  JobPerformanceData,
  PlatformBenchmarks,
  AttractivenessScore,
  DateRange
} from '../../services/marketIntelligence';

interface JobPerformanceProps {
  jobs: JobPosting[];
  isLoading?: boolean;
  onEditJob?: (jobId: string, section?: string) => void;
}

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'all', label: 'All time' }
];

const JobPerformance: React.FC<JobPerformanceProps> = ({
  jobs,
  isLoading = false,
  onEditJob
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [performance, setPerformance] = useState<JobPerformanceData | null>(null);
  const [benchmarks, setBenchmarks] = useState<PlatformBenchmarks | null>(null);
  const [attractiveness, setAttractiveness] = useState<AttractivenessScore | null>(null);
  const [isLoadingPerf, setIsLoadingPerf] = useState(false);
  const [isLoadingAttr, setIsLoadingAttr] = useState(false);

  // Filter to active jobs (published or draft with data)
  // Use all jobs passed in since parent already filters appropriately
  const activeJobs = useMemo(() => {
    // Accept published, draft, or active status jobs
    const filtered = jobs.filter(j =>
      j.status === 'published' || j.status === 'draft' || j.status === 'active' || !j.status
    );
    console.log('[JobPerformance] Jobs received:', jobs.length, 'Active jobs:', filtered.length, 'Statuses:', jobs.map(j => j.status));
    return filtered;
  }, [jobs]);

  // Auto-select first published job
  useEffect(() => {
    if (!selectedJobId && activeJobs.length > 0) {
      setSelectedJobId(activeJobs[0].id);
    }
  }, [activeJobs, selectedJobId]);

  // Fetch benchmarks once
  useEffect(() => {
    const fetchBenchmarks = async () => {
      const data = await getPlatformBenchmarks();
      setBenchmarks(data);
    };
    fetchBenchmarks();
  }, []);

  // Fetch performance when job or date range changes
  useEffect(() => {
    if (!selectedJobId) {
      setPerformance(null);
      return;
    }

    const fetchPerformance = async () => {
      setIsLoadingPerf(true);
      try {
        const data = await getJobPerformanceMetrics(selectedJobId, dateRange);
        setPerformance(data);
      } catch (error) {
        console.error('Error fetching performance:', error);
        setPerformance(null);
      } finally {
        setIsLoadingPerf(false);
      }
    };

    fetchPerformance();
  }, [selectedJobId, dateRange]);

  // Fetch attractiveness when job changes
  useEffect(() => {
    if (!selectedJobId) {
      setAttractiveness(null);
      return;
    }

    const fetchAttractiveness = async () => {
      setIsLoadingAttr(true);
      try {
        const data = await calculateAttractiveness(selectedJobId);
        setAttractiveness(data);
      } catch (error) {
        console.error('Error fetching attractiveness:', error);
        setAttractiveness(null);
      } finally {
        setIsLoadingAttr(false);
      }
    };

    fetchAttractiveness();
  }, [selectedJobId]);

  const selectedJob = activeJobs.find(j => j.id === selectedJobId);

  const formatNumber = (n: number): string => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-3.5 h-3.5 text-green-500" />;
    if (change < -5) return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
    return <Minus className="w-3.5 h-3.5 text-gray-400" />;
  };

  const getConversionColor = (value: number, benchmark: number) => {
    if (value >= benchmark * 1.2) return 'text-green-600';
    if (value >= benchmark * 0.8) return 'text-gray-700';
    return 'text-orange-600';
  };

  const getConversionBg = (value: number, benchmark: number) => {
    if (value >= benchmark * 1.2) return 'bg-green-500';
    if (value >= benchmark * 0.8) return 'bg-blue-500';
    return 'bg-orange-500';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good': return { bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-500' };
      case 'warning': return { bg: 'bg-yellow-50', text: 'text-yellow-600', bar: 'bg-yellow-500' };
      case 'poor': return { bg: 'bg-red-50', text: 'text-red-600', bar: 'bg-red-500' };
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  // No jobs state
  if (activeJobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Jobs Found</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          {jobs.length === 0
            ? 'Create a job posting to start tracking performance.'
            : `Found ${jobs.length} jobs but none with trackable status. Jobs statuses: ${jobs.map(j => j.status || 'none').join(', ')}`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Job & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Job Selector */}
        <div className="relative">
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer min-w-[240px]"
          >
            {activeJobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {DATE_RANGE_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                dateRange === option.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section A: Funnel Visualization */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Performance Funnel</h3>
              <p className="text-sm text-gray-500">Track how candidates move through your hiring process</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoadingPerf ? (
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="h-24 bg-gray-100 rounded-xl flex-1" />
                <div className="h-24 bg-gray-100 rounded-xl flex-1" />
                <div className="h-24 bg-gray-100 rounded-xl flex-1" />
              </div>
            </div>
          ) : !performance ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Unable to load performance data</p>
            </div>
          ) : performance.views === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-blue-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Check back soon!</p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Your job was recently published. Performance data will appear once candidates start viewing it.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Funnel Stages */}
              <div className="grid grid-cols-3 gap-4">
                {/* Views */}
                <div className="relative">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-400 uppercase">Views</span>
                    </div>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-black text-gray-900"
                    >
                      {formatNumber(performance.views)}
                    </motion.div>
                    {dateRange !== 'all' && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {getTrendIcon(performance.trend.viewsChange)}
                        <span className={`text-xs font-medium ${performance.trend.viewsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {performance.trend.viewsChange >= 0 ? '+' : ''}{performance.trend.viewsChange}%
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Arrow */}
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>

                {/* Saves */}
                <div className="relative">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Bookmark className="w-5 h-5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-400 uppercase">Saves</span>
                    </div>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl font-black text-gray-900"
                    >
                      {formatNumber(performance.saves)}
                    </motion.div>
                    {dateRange !== 'all' && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {getTrendIcon(performance.trend.savesChange)}
                        <span className={`text-xs font-medium ${performance.trend.savesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {performance.trend.savesChange >= 0 ? '+' : ''}{performance.trend.savesChange}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>

                {/* Applications */}
                <div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-bold text-blue-500 uppercase">Applications</span>
                    </div>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-black text-blue-600"
                    >
                      {formatNumber(performance.applications)}
                    </motion.div>
                    {dateRange !== 'all' && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {getTrendIcon(performance.trend.appsChange)}
                        <span className={`text-xs font-medium ${performance.trend.appsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {performance.trend.appsChange >= 0 ? '+' : ''}{performance.trend.appsChange}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversion Rates */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                  Conversion Rates
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* View to Save */}
                  <div className="text-center">
                    <div className={`text-lg font-black ${benchmarks ? getConversionColor(performance.conversions.viewToSave, benchmarks.avgViewToSave) : 'text-gray-900'}`}>
                      {performance.conversions.viewToSave}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">View → Save</div>
                    {benchmarks && (
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Avg: {benchmarks.avgViewToSave}%
                      </div>
                    )}
                  </div>

                  {/* Save to Apply */}
                  <div className="text-center">
                    <div className={`text-lg font-black ${benchmarks ? getConversionColor(performance.conversions.saveToApply, benchmarks.avgSaveToApply) : 'text-gray-900'}`}>
                      {performance.conversions.saveToApply}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Save → Apply</div>
                    {benchmarks && (
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Avg: {benchmarks.avgSaveToApply}%
                      </div>
                    )}
                  </div>

                  {/* View to Apply (Overall) */}
                  <div className="text-center">
                    <div className={`text-lg font-black ${benchmarks ? getConversionColor(performance.conversions.viewToApply, benchmarks.avgViewToApply) : 'text-gray-900'}`}>
                      {performance.conversions.viewToApply}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">View → Apply</div>
                    {benchmarks && (
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Avg: {benchmarks.avgViewToApply}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual comparison bar */}
                {benchmarks && performance.views >= 10 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Your conversion</span>
                          <span className="font-bold text-gray-700">{performance.conversions.viewToApply}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (performance.conversions.viewToApply / Math.max(benchmarks.avgViewToApply * 2, performance.conversions.viewToApply)) * 100)}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full rounded-full ${getConversionBg(performance.conversions.viewToApply, benchmarks.avgViewToApply)}`}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Platform avg: {benchmarks.avgViewToApply}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section B: Attractiveness Score */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Attractiveness Score</h3>
              <p className="text-sm text-gray-500">How appealing is this job to candidates?</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoadingAttr ? (
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
              </div>
            </div>
          ) : !attractiveness ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Unable to calculate attractiveness score</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Display */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="w-28 h-28 -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="10"
                    />
                    <motion.circle
                      cx="56"
                      cy="56"
                      r="48"
                      fill="none"
                      stroke={attractiveness.score >= 70 ? '#22c55e' : attractiveness.score >= 40 ? '#3b82f6' : '#f97316'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 301.6' }}
                      animate={{ strokeDasharray: `${(attractiveness.score / 100) * 301.6} 301.6` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-gray-900">{attractiveness.score}</span>
                    <span className="text-xs text-gray-500">/ 100</span>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {attractiveness.score >= 80 ? 'Excellent' :
                     attractiveness.score >= 60 ? 'Good' :
                     attractiveness.score >= 40 ? 'Needs Improvement' : 'Low Attractiveness'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {attractiveness.score >= 60
                      ? 'This job is well-positioned to attract quality candidates'
                      : 'There are opportunities to make this job more appealing'}
                  </div>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-3">
                {attractiveness.breakdown.map((factor, i) => {
                  const colors = getStatusColor(factor.status);
                  return (
                    <div key={i} className={`rounded-xl p-4 ${colors.bg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{factor.factor}</span>
                          <span className="text-xs text-gray-400">{factor.weight}% weight</span>
                        </div>
                        <span className={`text-sm font-black ${colors.text}`}>
                          {factor.score}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/50 rounded-full overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.score}%` }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className={`h-full rounded-full ${colors.bar}`}
                        />
                      </div>
                      <p className="text-xs text-gray-600">{factor.insight}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section C: Recommendations */}
      {attractiveness && attractiveness.topRecommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top Recommendations</h3>
                <p className="text-sm text-gray-500">Actions to improve your job's attractiveness</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {attractiveness.topRecommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                  onClick={() => onEditJob?.(selectedJobId!, rec.editSection)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    rec.impact === 'high' ? 'bg-red-100 text-red-600' :
                    rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{rec.action}</div>
                    <div className="text-xs text-gray-500 capitalize">{rec.impact} impact</div>
                  </div>
                  {onEditJob && (
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPerformance;
