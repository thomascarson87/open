import React, { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  SkillsMarketData,
  SkillUnlockOpportunity,
  ClassifiedSkill,
  SkillQuadrant
} from '../../services/marketIntelligence';

interface SkillsLandscapeProps {
  marketData: SkillsMarketData | null;
  unlockOpportunities: SkillUnlockOpportunity[];
  isLoading: boolean;
  onAddSkill?: (skill: string) => void;
}

// Quadrant colors
const QUADRANT_COLORS: Record<SkillQuadrant, string> = {
  opportunity: '#10b981', // green
  competitive: 'var(--accent-coral)', // blue
  saturated: '#f59e0b',   // amber
  niche: '#6b7280'        // gray
};

// Custom tooltip for the scatter chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ClassifiedSkill;
    return (
      <div className="bg-surface border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-bold text-primary capitalize">{data.skill}</p>
        <div className="mt-1 space-y-0.5 text-muted">
          <p>Candidates: {data.supply}</p>
          <p>Jobs: {data.demand}</p>
          <p className="capitalize text-xs mt-1">
            <span
              className="inline-block w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: QUADRANT_COLORS[data.quadrant] }}
            />
            {data.quadrant === 'opportunity' && 'Opportunity Zone'}
            {data.quadrant === 'competitive' && 'Competitive'}
            {data.quadrant === 'saturated' && 'Saturated'}
            {data.quadrant === 'niche' && 'Niche'}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Skeleton loader for chart
const ChartSkeleton = () => (
  <div className="h-[350px] bg-gray-50 dark:bg-gray-900 rounded-xl animate-pulse flex items-center justify-center">
    <div className="text-gray-300 dark:text-gray-600 text-sm">Loading market data...</div>
  </div>
);

// Skeleton loader for unlock cards
const UnlockSkeleton = () => (
  <div className="flex gap-3 overflow-x-auto pb-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex-shrink-0 w-48 h-24 bg-gray-50 dark:bg-gray-900 rounded-xl animate-pulse" />
    ))}
  </div>
);

const SkillsLandscape: React.FC<SkillsLandscapeProps> = ({
  marketData,
  unlockOpportunities,
  isLoading,
  onAddSkill
}) => {
  // Prepare chart data - use log scale approximation for better visualization
  const chartData = useMemo(() => {
    if (!marketData?.skills) return { market: [], candidate: [] };

    // Apply log transform for better distribution visualization
    const transformValue = (val: number) => Math.log10(Math.max(val, 1) + 1) * 50;

    const market = marketData.skills
      .filter(s => !s.isCandidate)
      .map(s => ({
        ...s,
        x: transformValue(s.supply),
        y: transformValue(s.demand)
      }));

    const candidate = marketData.candidateSkills.map(s => ({
      ...s,
      x: transformValue(s.supply),
      y: transformValue(s.demand)
    }));

    return { market, candidate };
  }, [marketData]);

  // Calculate median lines position
  const medianLines = useMemo(() => {
    if (!marketData) return { x: 50, y: 50 };
    const transformValue = (val: number) => Math.log10(Math.max(val, 1) + 1) * 50;
    return {
      x: transformValue(marketData.medianSupply),
      y: transformValue(marketData.medianDemand)
    };
  }, [marketData]);

  // Count skills by quadrant for candidate
  const quadrantCounts = useMemo(() => {
    if (!marketData?.candidateSkills) return null;
    const counts = { opportunity: 0, competitive: 0, saturated: 0, niche: 0 };
    marketData.candidateSkills.forEach(s => {
      counts[s.quadrant]++;
    });
    return counts;
  }, [marketData]);

  return (
    <div className="space-y-6">
      {/* Quadrant Chart Section */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-primary">Skills Landscape</h3>
            <p className="text-sm text-muted mt-0.5">
              Where your skills sit in the market
            </p>
          </div>
          {quadrantCounts && (
            <div className="flex gap-3 text-xs">
              <span className="text-green-600 font-medium">
                {quadrantCounts.opportunity} opportunity
              </span>
              <span className="text-accent-coral font-medium">
                {quadrantCounts.competitive} competitive
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <ChartSkeleton />
        ) : marketData && marketData.skills.length > 0 ? (
          <div className="relative">
            {/* Quadrant labels */}
            <div className="absolute top-2 left-2 text-[10px] font-semibold text-green-600 opacity-60 z-10">
              Opportunity
            </div>
            <div className="absolute top-2 right-2 text-[10px] font-semibold text-accent-coral opacity-60 z-10">
              Competitive
            </div>
            <div className="absolute bottom-8 left-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 opacity-60 z-10">
              Niche
            </div>
            <div className="absolute bottom-8 right-2 text-[10px] font-semibold text-amber-600 opacity-60 z-10">
              Saturated
            </div>

            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Supply"
                  domain={[0, 'auto']}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  label={{
                    value: 'Supply (candidates)',
                    position: 'bottom',
                    offset: 0,
                    style: { fontSize: 10, fill: 'var(--text-muted)' }
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Demand"
                  domain={[0, 'auto']}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  label={{
                    value: 'Demand (jobs)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 10, fill: 'var(--text-muted)' }
                  }}
                />

                {/* Median reference lines (quadrant dividers) */}
                <ReferenceLine
                  x={medianLines.x}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                />
                <ReferenceLine
                  y={medianLines.y}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                />

                <Tooltip content={<CustomTooltip />} />

                {/* All market skills (background) */}
                <Scatter
                  name="Market"
                  data={chartData.market}
                  fill="var(--border)"
                >
                  {chartData.market.map((entry, index) => (
                    <Cell
                      key={`market-${index}`}
                      fill="var(--border)"
                      fillOpacity={0.4}
                      r={3}
                    />
                  ))}
                </Scatter>

                {/* Candidate's skills (highlighted) */}
                <Scatter
                  name="Your Skills"
                  data={chartData.candidate}
                  fill="var(--accent-coral)"
                >
                  {chartData.candidate.map((entry, index) => (
                    <Cell
                      key={`candidate-${index}`}
                      fill={QUADRANT_COLORS[entry.quadrant]}
                      fillOpacity={0.9}
                      r={8}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-gray-300" />
                Market skills
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-accent-coral border-2 border-white shadow" />
                Your skills
              </span>
            </div>
          </div>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            No market data available
          </div>
        )}
      </div>

      {/* Skill Unlock Opportunities */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold text-primary">Skills That Would Unlock More</h3>
          <p className="text-sm text-muted mt-0.5">
            Based on jobs matching 80%+ of your skills
          </p>
        </div>

        {isLoading ? (
          <UnlockSkeleton />
        ) : unlockOpportunities.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible">
            {unlockOpportunities.map((opp, index) => (
              <div
                key={opp.skill}
                className="flex-shrink-0 w-48 md:w-auto bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-border hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-bold text-primary capitalize text-sm">
                    {opp.skill}
                  </span>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    +{opp.jobsUnlocked} jobs
                  </span>
                </div>
                {opp.exampleJobTitles.length > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
                    e.g. {opp.exampleJobTitles.slice(0, 2).join(', ')}
                  </p>
                )}
                {onAddSkill && (
                  <button
                    onClick={() => onAddSkill(opp.skill)}
                    className="mt-3 text-xs text-accent-coral hover:text-accent-coral font-medium"
                  >
                    Add to profile →
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            {marketData?.candidateSkills?.length === 0
              ? 'Add skills to your profile to see opportunities'
              : 'No skill gaps found - you match well with available jobs!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsLandscape;
