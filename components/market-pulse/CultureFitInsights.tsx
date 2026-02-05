import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, Users, Building, ChevronRight, AlertCircle, Sparkles, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { CandidateProfile } from '../../types';
import {
  calculateValuesAlignment,
  getCultureMarketInsights,
  CultureMarketInsights,
} from '../../services/marketIntelligence';
import { supabase } from '../../services/supabaseClient';
import {
  WORK_HOURS_OPTIONS,
  WORK_INTENSITY_OPTIONS,
  AUTONOMY_LEVEL_OPTIONS,
  DECISION_MAKING_OPTIONS,
  PROJECT_DURATION_OPTIONS,
  CONTEXT_SWITCHING_OPTIONS,
  CHANGE_FREQUENCY_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  INNOVATION_STABILITY_OPTIONS,
  AMBIGUITY_TOLERANCE_OPTIONS
} from '../../constants/workStyleData';

interface CultureFitInsightsProps {
  candidateProfile: CandidateProfile | null;
  candidateId: string;
  isLoading?: boolean;
  onEditProfile?: (section?: string) => void;
}

interface CompanyMatch {
  id: string;
  name: string;
  logoUrl?: string;
  cultureScore: number;
  sharedValues: string[];
}

interface WorkStyleDimension {
  key: string;
  label: string;
  value: string | undefined;
  displayValue: string;
  options: readonly { value: string; label: string; description?: string }[];
  marketInsight?: {
    candidatePercent: number;
    companyPercent: number;
    marketLabel: string;
    insight: string;
  };
}

// Work style dimension configuration
const WORK_STYLE_DIMENSIONS: {
  key: string;
  label: string;
  options: readonly { value: string; label: string; description?: string }[];
}[] = [
  { key: 'workIntensity', label: 'Work Intensity', options: WORK_INTENSITY_OPTIONS },
  { key: 'autonomyLevel', label: 'Autonomy Level', options: AUTONOMY_LEVEL_OPTIONS },
  { key: 'decisionMaking', label: 'Decision Making', options: DECISION_MAKING_OPTIONS },
  { key: 'workHours', label: 'Work Hours', options: WORK_HOURS_OPTIONS },
  { key: 'projectDuration', label: 'Project Duration', options: PROJECT_DURATION_OPTIONS },
  { key: 'contextSwitching', label: 'Context Switching', options: CONTEXT_SWITCHING_OPTIONS },
  { key: 'changeFrequency', label: 'Change Frequency', options: CHANGE_FREQUENCY_OPTIONS },
  { key: 'riskTolerance', label: 'Risk Tolerance', options: RISK_TOLERANCE_OPTIONS },
  { key: 'innovationStability', label: 'Innovation vs Stability', options: INNOVATION_STABILITY_OPTIONS },
  { key: 'ambiguityTolerance', label: 'Ambiguity Tolerance', options: AMBIGUITY_TOLERANCE_OPTIONS },
];

// Market label styling helper
const getMarketLabelStyle = (label: string) => {
  switch (label) {
    case 'high_demand':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: TrendingUp, label: 'High Demand' };
    case 'oversupplied':
      return { bg: 'bg-orange-100', text: 'text-orange-700', icon: TrendingDown, label: 'Competitive' };
    case 'niche':
    case 'rare':
      return { bg: 'bg-purple-100', text: 'text-purple-700', icon: Zap, label: 'Unique' };
    case 'popular':
    case 'common':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Users, label: 'Popular' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', icon: Minus, label: 'Balanced' };
  }
};

const CultureFitInsights: React.FC<CultureFitInsightsProps> = ({
  candidateProfile,
  candidateId,
  isLoading = false,
  onEditProfile
}) => {
  const [companyMatches, setCompanyMatches] = useState<CompanyMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [marketInsights, setMarketInsights] = useState<CultureMarketInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  // Fetch market insights
  useEffect(() => {
    const fetchMarketInsights = async () => {
      if (!candidateProfile) {
        setIsLoadingInsights(false);
        return;
      }

      setIsLoadingInsights(true);
      try {
        const insights = await getCultureMarketInsights({
          workStylePreferences: candidateProfile.workStylePreferences as Record<string, string>,
          values: candidateProfile.values,
        });
        setMarketInsights(insights);
      } catch (error) {
        console.error('Error fetching market insights:', error);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    fetchMarketInsights();
  }, [candidateProfile]);

  // Derive work style dimensions from candidate profile
  const workStyleDimensions = useMemo(() => {
    const prefs = candidateProfile?.workStylePreferences;
    if (!prefs || typeof prefs !== 'object') return [];

    const dimensions: WorkStyleDimension[] = [];

    WORK_STYLE_DIMENSIONS.forEach(dim => {
      const value = (prefs as Record<string, string>)[dim.key];
      if (value) {
        // Look up display label from options
        const option = dim.options.find(opt => opt.value === value);
        // Get market insight for this dimension if available
        const insight = marketInsights?.workStyleInsights.find(w => w.dimension === dim.key);
        dimensions.push({
          key: dim.key,
          label: dim.label,
          value,
          displayValue: option?.label || value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          options: dim.options,
          marketInsight: insight,
        });
      }
    });

    return dimensions;
  }, [candidateProfile?.workStylePreferences, marketInsights]);

  // Fetch company culture matches
  useEffect(() => {
    const fetchCompanyMatches = async () => {
      if (!candidateId || !candidateProfile) {
        setIsLoadingMatches(false);
        return;
      }

      setIsLoadingMatches(true);
      try {
        // Get companies with active jobs and values set
        const { data: companies, error } = await supabase
          .from('company_profiles')
          .select('id, company_name, logo_url, values, desired_traits')
          .not('values', 'is', null)
          .limit(20);

        if (error || !companies) {
          console.error('Error fetching companies:', error);
          setIsLoadingMatches(false);
          return;
        }

        // Calculate culture fit for each company
        const matches: CompanyMatch[] = [];

        for (const company of companies) {
          if (!company.values || company.values.length === 0) continue;

          // Use the pure function for quick calculation
          const valuesAlignment = calculateValuesAlignment(
            candidateProfile.values,
            candidateProfile.characterTraits,
            company.values,
            company.desired_traits
          );

          if (valuesAlignment.score !== null && valuesAlignment.score >= 40) {
            matches.push({
              id: company.id,
              name: company.company_name || 'Unknown Company',
              logoUrl: company.logo_url,
              cultureScore: valuesAlignment.score,
              sharedValues: valuesAlignment.shared.slice(0, 3)
            });
          }
        }

        // Sort by score and take top 5
        matches.sort((a, b) => b.cultureScore - a.cultureScore);
        setCompanyMatches(matches.slice(0, 5));
      } catch (error) {
        console.error('Error calculating company matches:', error);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    fetchCompanyMatches();
  }, [candidateId, candidateProfile]);

  const handleNavigateToProfile = (section?: string) => {
    if (onEditProfile) {
      onEditProfile(section);
    } else {
      const url = section ? `?view=profile&tab=${section}` : '?view=profile';
      window.history.pushState({}, '', url);
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleViewCompany = (companyId: string) => {
    // Navigate to company profile or jobs
    window.history.pushState({}, '', `?view=dashboard&company=${companyId}`);
    window.dispatchEvent(new Event('popstate'));
  };

  const values = candidateProfile?.values || [];
  const traits = candidateProfile?.characterTraits || [];
  const hasValues = values.length > 0;
  const hasEnoughValues = values.length >= 3;
  const hasWorkStylePrefs = workStyleDimensions.length > 0;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-gray-100 rounded-full w-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section A: Your Values Profile */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-gray-900">Your Values Profile</h3>
            </div>
            {hasValues && (
              <button
                onClick={() => handleNavigateToProfile('values')}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
              >
                Edit
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {!hasValues ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Heart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">No values added yet</p>
              <p className="text-xs text-gray-500 mb-4">Add your values to find culture-matched companies</p>
              <button
                onClick={() => handleNavigateToProfile('values')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Values
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Values with market insights */}
              <div className="flex flex-wrap gap-2">
                {values.slice(0, 8).map((value, i) => {
                  // Find market insight for this value
                  const valueInsight = marketInsights?.valueInsights.find(
                    v => v.value.toLowerCase() === value.toLowerCase()
                  );
                  const labelStyle = valueInsight ? getMarketLabelStyle(valueInsight.marketLabel) : null;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative"
                    >
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${
                        valueInsight?.marketLabel === 'high_demand'
                          ? 'bg-green-600 text-white'
                          : valueInsight?.marketLabel === 'rare'
                          ? 'bg-purple-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}>
                        {value}
                        {valueInsight && valueInsight.marketLabel === 'high_demand' && (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {valueInsight && valueInsight.marketLabel === 'rare' && (
                          <Zap className="w-3 h-3" />
                        )}
                      </span>
                      {/* Tooltip on hover */}
                      {valueInsight && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {valueInsight.insight}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {values.length > 8 && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-500 text-sm font-medium rounded-full">
                    +{values.length - 8} more
                  </span>
                )}
              </div>

              {/* Values market summary */}
              {marketInsights && !isLoadingInsights && (
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {marketInsights.valueInsights.filter(v => v.marketLabel === 'high_demand').length > 0 && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      {marketInsights.valueInsights.filter(v => v.marketLabel === 'high_demand').length} values in high demand
                    </span>
                  )}
                  {marketInsights.valueInsights.filter(v => v.marketLabel === 'rare').length > 0 && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-purple-500" />
                      {marketInsights.valueInsights.filter(v => v.marketLabel === 'rare').length} distinctive values
                    </span>
                  )}
                </div>
              )}

              {/* Traits Chips (if any) */}
              {traits.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Character Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {traits.slice(0, 6).map((trait, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 border border-gray-200 text-gray-600 text-sm font-medium rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                    {traits.length > 6 && (
                      <span className="px-3 py-1 border border-gray-200 text-gray-400 text-sm font-medium rounded-full">
                        +{traits.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Prompt for more values */}
              {!hasEnoughValues && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Add more values ({values.length}/3 minimum) for better culture matching
                  </p>
                  <button
                    onClick={() => handleNavigateToProfile('values')}
                    className="ml-auto text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    Add More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section B: Work Style DNA */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-bold text-gray-900">Work Style DNA</h3>
            </div>
            {hasWorkStylePrefs && (
              <button
                onClick={() => handleNavigateToProfile('workstyle')}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
              >
                Edit
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-4">How your preferences compare to the market</p>

          {!hasWorkStylePrefs ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Work style preferences not set</p>
              <p className="text-xs text-gray-500 mb-4">Complete your work style preferences to see market fit</p>
              <button
                onClick={() => handleNavigateToProfile('workstyle')}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Set Preferences
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall demand score */}
              {marketInsights && !isLoadingInsights && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-600">Market Position Score</span>
                      <span className={`text-2xl font-black ${
                        marketInsights.overallDemandScore >= 60 ? 'text-green-600' :
                        marketInsights.overallDemandScore >= 40 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {marketInsights.overallDemandScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {marketInsights.summary.highDemandCount > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          {marketInsights.summary.highDemandCount} in high demand
                        </span>
                      )}
                      {marketInsights.summary.nicheCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-purple-500" />
                          {marketInsights.summary.nicheCount} unique
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Mini bar chart */}
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        marketInsights.overallDemandScore >= 60 ? 'bg-green-500' :
                        marketInsights.overallDemandScore >= 40 ? 'bg-blue-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${marketInsights.overallDemandScore}%` }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Work style preferences with market data */}
              <div className="space-y-2">
                {workStyleDimensions.map((dim, i) => {
                  const labelStyle = dim.marketInsight
                    ? getMarketLabelStyle(dim.marketInsight.marketLabel)
                    : null;
                  const LabelIcon = labelStyle?.icon || Minus;

                  return (
                    <motion.div
                      key={dim.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      {/* Dimension name */}
                      <div className="w-32 flex-shrink-0">
                        <span className="text-sm text-gray-500">{dim.label}</span>
                      </div>

                      {/* Value */}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-gray-900 truncate block">{dim.displayValue}</span>
                      </div>

                      {/* Market insight */}
                      {dim.marketInsight && !isLoadingInsights ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Market label badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${labelStyle?.bg} ${labelStyle?.text}`}>
                            <LabelIcon className="w-3 h-3" />
                            {labelStyle?.label}
                          </span>
                          {/* Percentage tooltip */}
                          <div className="text-xs text-gray-400 hidden sm:block" title={`${dim.marketInsight.candidatePercent}% of candidates, ${dim.marketInsight.companyPercent}% of companies`}>
                            {dim.marketInsight.companyPercent}% seek
                          </div>
                        </div>
                      ) : isLoadingInsights ? (
                        <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
                      ) : null}
                    </motion.div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>High Demand</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Unique</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Popular</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>Competitive</span>
                </div>
              </div>

              {/* Prompt for more preferences if incomplete */}
              {workStyleDimensions.length < 5 && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <p className="text-xs text-purple-700">
                    Complete more work style preferences ({workStyleDimensions.length}/10) for better matching
                  </p>
                  <button
                    onClick={() => handleNavigateToProfile('workstyle')}
                    className="ml-auto text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    Add More
                  </button>
                </div>
              )}

              {/* Competitive advantages */}
              {marketInsights?.summary.competitiveAdvantages && marketInsights.summary.competitiveAdvantages.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs font-medium text-green-700 mb-1">Your Competitive Advantages</p>
                  <ul className="text-xs text-green-600 space-y-0.5">
                    {marketInsights.summary.competitiveAdvantages.slice(0, 2).map((adv, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500">•</span>
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section C: Culture Match Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-gray-900">Companies That Match Your Culture</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Based on shared values and work style preferences</p>

          {isLoadingMatches ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-shrink-0 w-64 bg-gray-50 rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                      <div className="h-3 bg-gray-100 rounded w-16" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-5 bg-gray-100 rounded-full w-16" />
                    <div className="h-5 bg-gray-100 rounded-full w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasValues ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Add your values first</p>
              <p className="text-xs text-gray-500">We'll find companies that share your values</p>
            </div>
          ) : companyMatches.length === 0 ? (
            <div className="bg-emerald-50 rounded-xl p-6 text-center">
              <Sparkles className="w-8 h-8 text-emerald-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-emerald-800 mb-1">We're still finding your culture matches</p>
              <p className="text-xs text-emerald-600">Check back soon as more companies join the platform!</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {companyMatches.map((company, i) => (
                <motion.button
                  key={company.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleViewCompany(company.id)}
                  className="flex-shrink-0 w-64 bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {company.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`text-sm font-bold ${
                          company.cultureScore >= 70 ? 'text-green-600' :
                          company.cultureScore >= 50 ? 'text-blue-600' : 'text-yellow-600'
                        }`}>
                          {company.cultureScore}% match
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>

                  {company.sharedValues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {company.sharedValues.map((value, j) => (
                        <span
                          key={j}
                          className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CultureFitInsights;
