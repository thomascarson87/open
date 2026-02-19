import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Minus, Gift, Check, X, AlertCircle, ChevronDown, Sparkles } from 'lucide-react';
import { JobPosting } from '../../types';
import {
  getCompanySalaryPosition,
  getPerkAlignment,
  CompanySalaryPosition,
  PerkAlignment
} from '../../services/marketIntelligence';

interface CompensationBenchmarksProps {
  jobs: JobPosting[];
  companyPerks?: string[];
  isLoading?: boolean;
}

const CompensationBenchmarks: React.FC<CompensationBenchmarksProps> = ({
  jobs,
  companyPerks = [],
  isLoading = false
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [salaryPosition, setSalaryPosition] = useState<CompanySalaryPosition | null>(null);
  const [perkAlignment, setPerkAlignment] = useState<PerkAlignment | null>(null);
  const [isLoadingSalary, setIsLoadingSalary] = useState(false);
  const [isLoadingPerks, setIsLoadingPerks] = useState(false);

  // Filter jobs that have salary data
  const jobsWithSalary = useMemo(() =>
    jobs.filter(j => j.salaryMin || j.salaryMax),
    [jobs]
  );

  // Auto-select first job with salary data
  useEffect(() => {
    if (!selectedJobId && jobsWithSalary.length > 0) {
      setSelectedJobId(jobsWithSalary[0].id);
    }
  }, [jobsWithSalary, selectedJobId]);

  // Fetch salary position when job changes
  useEffect(() => {
    if (!selectedJobId) {
      setSalaryPosition(null);
      return;
    }

    const fetchSalaryPosition = async () => {
      setIsLoadingSalary(true);
      try {
        const data = await getCompanySalaryPosition(selectedJobId);
        setSalaryPosition(data);
      } catch (error) {
        console.error('Error fetching salary position:', error);
        setSalaryPosition(null);
      } finally {
        setIsLoadingSalary(false);
      }
    };

    fetchSalaryPosition();
  }, [selectedJobId]);

  // Fetch perk alignment on mount
  useEffect(() => {
    if (!companyPerks || companyPerks.length === 0) {
      setPerkAlignment(null);
      return;
    }

    const fetchPerkAlignment = async () => {
      setIsLoadingPerks(true);
      try {
        const data = await getPerkAlignment(companyPerks);
        setPerkAlignment(data);
      } catch (error) {
        console.error('Error fetching perk alignment:', error);
        setPerkAlignment(null);
      } finally {
        setIsLoadingPerks(false);
      }
    };

    fetchPerkAlignment();
  }, [companyPerks]);

  const formatSalary = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRatingConfig = (rating: CompanySalaryPosition['competitiveRating']) => {
    switch (rating) {
      case 'premium':
        return { label: 'Premium', color: 'text-accent-green', bg: 'bg-accent-green-bg', icon: Sparkles };
      case 'above_market':
        return { label: 'Above Market', color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp };
      case 'competitive':
        return { label: 'Competitive', color: 'text-accent-coral', bg: 'bg-accent-coral-bg', icon: Minus };
      case 'below_market':
        return { label: 'Below Market', color: 'text-orange-600', bg: 'bg-orange-50', icon: TrendingDown };
      default:
        return { label: 'Unknown', color: 'text-muted', bg: 'bg-gray-50 dark:bg-gray-900', icon: Minus };
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface rounded-2xl border border-border p-6 animate-pulse">
          <div className="h-6 bg-border rounded w-48 mb-4" />
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 animate-pulse">
          <div className="h-6 bg-border rounded w-48 mb-4" />
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Salary Position Card */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">Salary Position</h3>
                <p className="text-sm text-muted">How your compensation compares to market</p>
              </div>
            </div>

            {/* Job Selector */}
            {jobsWithSalary.length > 0 && (
              <div className="relative">
                <select
                  value={selectedJobId || ''}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="appearance-none bg-gray-50 dark:bg-gray-900 border border-border rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-transparent cursor-pointer"
                >
                  {jobsWithSalary.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {isLoadingSalary ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-border rounded w-32" />
              <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          ) : !salaryPosition ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-muted">
                {jobsWithSalary.length === 0
                  ? 'No jobs with salary data available'
                  : 'Unable to calculate market position'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Add salary ranges to your job postings to see benchmarks
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Rating Badge & Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    const config = getRatingConfig(salaryPosition.competitiveRating);
                    const Icon = config.icon;
                    return (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${config.bg}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
                      </div>
                    );
                  })()}
                  <div>
                    <div className="text-2xl font-black text-primary">
                      {salaryPosition.percentile}th percentile
                    </div>
                    <div className="text-sm text-muted">
                      {salaryPosition.gap >= 0 ? '+' : ''}{salaryPosition.gap}% vs median
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted">Your range</div>
                  <div className="text-lg font-bold text-primary">
                    {formatSalary(salaryPosition.companySalary.min)} - {formatSalary(salaryPosition.companySalary.max)}
                  </div>
                </div>
              </div>

              {/* Distribution Visualization */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <div className="flex items-end justify-between h-24 relative">
                  {/* Distribution bars */}
                  {[
                    { label: '10th', value: salaryPosition.marketBenchmark.p10, height: 30 },
                    { label: '25th', value: salaryPosition.marketBenchmark.p25, height: 50 },
                    { label: '50th', value: salaryPosition.marketBenchmark.p50, height: 80 },
                    { label: '75th', value: salaryPosition.marketBenchmark.p75, height: 50 },
                    { label: '90th', value: salaryPosition.marketBenchmark.p90, height: 30 },
                  ].map((point, i) => {
                    const isCompanyNear = Math.abs(
                      ((salaryPosition.companySalary.min + salaryPosition.companySalary.max) / 2) - point.value
                    ) < (salaryPosition.marketBenchmark.p90 - salaryPosition.marketBenchmark.p10) * 0.15;

                    return (
                      <div key={point.label} className="flex flex-col items-center flex-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: point.height }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className={`w-8 rounded-t-lg ${
                            isCompanyNear ? 'bg-accent-coral' : 'bg-gray-300'
                          }`}
                        />
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium text-muted">{point.label}</div>
                          <div className={`text-xs font-bold ${isCompanyNear ? 'text-accent-coral' : 'text-gray-700 dark:text-gray-300 dark:text-gray-600'}`}>
                            {formatSalary(point.value).replace('$', '')}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Company marker */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="absolute -top-2"
                    style={{
                      left: `${Math.min(Math.max(salaryPosition.percentile, 5), 95)}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-accent-coral rounded-full border-2 border-white shadow-lg" />
                      <div className="text-[10px] font-bold text-accent-coral mt-1">YOU</div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                  <span>Based on {salaryPosition.marketBenchmark.sampleSize} similar roles</span>
                  <span>{salaryPosition.companySalary.currency}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Perk Alignment Card */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-green-bg rounded-xl">
              <Gift className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">Perk Alignment</h3>
              <p className="text-sm text-muted">How your benefits match candidate expectations</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoadingPerks ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-border rounded w-32" />
              <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          ) : !perkAlignment ? (
            <div className="text-center py-8">
              <Gift className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-muted">
                {companyPerks.length === 0
                  ? 'No company perks configured'
                  : 'Unable to calculate perk alignment'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Add perks to your company profile to see alignment
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alignment Score */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={perkAlignment.alignmentScore >= 70 ? '#22c55e' : perkAlignment.alignmentScore >= 40 ? 'var(--accent-coral)' : '#f97316'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 251.2' }}
                      animate={{ strokeDasharray: `${(perkAlignment.alignmentScore / 100) * 251.2} 251.2` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-primary">{perkAlignment.alignmentScore}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">
                    {perkAlignment.alignmentScore >= 70 ? 'Strong Alignment' :
                     perkAlignment.alignmentScore >= 40 ? 'Moderate Alignment' : 'Low Alignment'}
                  </div>
                  <div className="text-sm text-muted">
                    {perkAlignment.alignedPerks.length} of top {perkAlignment.topCandidatePerks.length} desired perks offered
                  </div>
                </div>
              </div>

              {/* Perk Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aligned Perks */}
                {perkAlignment.alignedPerks.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-green-800">Aligned with Demand</span>
                    </div>
                    <div className="space-y-2">
                      {perkAlignment.alignedPerks.slice(0, 5).map((perk, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <span className="capitalize">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Perks */}
                {perkAlignment.missingPerks.length > 0 && (
                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <X className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-bold text-orange-800">Candidates Want</span>
                    </div>
                    <div className="space-y-2">
                      {perkAlignment.missingPerks.slice(0, 5).map((perk, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-orange-700">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          <span className="capitalize">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Unique Perks */}
              {perkAlignment.uniquePerks.length > 0 && (
                <div className="bg-accent-green-bg rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-accent-green" />
                    <span className="text-sm font-bold text-accent-green">Your Differentiators</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {perkAlignment.uniquePerks.map((perk, i) => (
                      <span key={i} className="px-3 py-1 bg-white dark:bg-surface rounded-full text-sm font-medium text-accent-green border border-accent-green-bg capitalize">
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Candidate Perks */}
              <div className="pt-4 border-t border-border">
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
                  Most Requested Perks by Candidates
                </div>
                <div className="space-y-2">
                  {perkAlignment.topCandidatePerks.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600 capitalize">{item.perk}</span>
                          <span className="text-xs text-muted">{item.demandPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.demandPercent}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`h-full rounded-full ${
                              perkAlignment.alignedPerks.includes(item.perk)
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                      {perkAlignment.alignedPerks.includes(item.perk) && (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompensationBenchmarks;
