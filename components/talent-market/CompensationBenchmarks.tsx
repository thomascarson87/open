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
        return { label: 'Premium', color: 'text-purple-600', bg: 'bg-purple-50', icon: Sparkles };
      case 'above_market':
        return { label: 'Above Market', color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp };
      case 'competitive':
        return { label: 'Competitive', color: 'text-blue-600', bg: 'bg-blue-50', icon: Minus };
      case 'below_market':
        return { label: 'Below Market', color: 'text-orange-600', bg: 'bg-orange-50', icon: TrendingDown };
      default:
        return { label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50', icon: Minus };
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-32 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Salary Position Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Salary Position</h3>
                <p className="text-sm text-gray-500">How your compensation compares to market</p>
              </div>
            </div>

            {/* Job Selector */}
            {jobsWithSalary.length > 0 && (
              <div className="relative">
                <select
                  value={selectedJobId || ''}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {jobsWithSalary.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {isLoadingSalary ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-32" />
              <div className="h-24 bg-gray-100 rounded-xl" />
            </div>
          ) : !salaryPosition ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {jobsWithSalary.length === 0
                  ? 'No jobs with salary data available'
                  : 'Unable to calculate market position'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
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
                    <div className="text-2xl font-black text-gray-900">
                      {salaryPosition.percentile}th percentile
                    </div>
                    <div className="text-sm text-gray-500">
                      {salaryPosition.gap >= 0 ? '+' : ''}{salaryPosition.gap}% vs median
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Your range</div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatSalary(salaryPosition.companySalary.min)} - {formatSalary(salaryPosition.companySalary.max)}
                  </div>
                </div>
              </div>

              {/* Distribution Visualization */}
              <div className="bg-gray-50 rounded-xl p-4">
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
                            isCompanyNear ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                        <div className="mt-2 text-center">
                          <div className="text-xs font-medium text-gray-500">{point.label}</div>
                          <div className={`text-xs font-bold ${isCompanyNear ? 'text-blue-600' : 'text-gray-700'}`}>
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
                      <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                      <div className="text-[10px] font-bold text-blue-600 mt-1">YOU</div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>Based on {salaryPosition.marketBenchmark.sampleSize} similar roles</span>
                  <span>{salaryPosition.companySalary.currency}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Perk Alignment Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Perk Alignment</h3>
              <p className="text-sm text-gray-500">How your benefits match candidate expectations</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoadingPerks ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-32" />
              <div className="h-24 bg-gray-100 rounded-xl" />
            </div>
          ) : !perkAlignment ? (
            <div className="text-center py-8">
              <Gift className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {companyPerks.length === 0
                  ? 'No company perks configured'
                  : 'Unable to calculate perk alignment'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
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
                      stroke="#f3f4f6"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={perkAlignment.alignmentScore >= 70 ? '#22c55e' : perkAlignment.alignmentScore >= 40 ? '#3b82f6' : '#f97316'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 251.2' }}
                      animate={{ strokeDasharray: `${(perkAlignment.alignmentScore / 100) * 251.2} 251.2` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-gray-900">{perkAlignment.alignmentScore}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {perkAlignment.alignmentScore >= 70 ? 'Strong Alignment' :
                     perkAlignment.alignmentScore >= 40 ? 'Moderate Alignment' : 'Low Alignment'}
                  </div>
                  <div className="text-sm text-gray-500">
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
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-bold text-purple-800">Your Differentiators</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {perkAlignment.uniquePerks.map((perk, i) => (
                      <span key={i} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-purple-700 border border-purple-200 capitalize">
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Candidate Perks */}
              <div className="pt-4 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                  Most Requested Perks by Candidates
                </div>
                <div className="space-y-2">
                  {perkAlignment.topCandidatePerks.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">{item.perk}</span>
                          <span className="text-xs text-gray-500">{item.demandPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
