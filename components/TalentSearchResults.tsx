import React, { useState, useEffect, useMemo } from 'react';
import { TalentSearchResult, CandidateProfile, TalentSearchCriteria } from '../types';
import EnrichedCandidateCard from './EnrichedCandidateCard';
import FluidGravityFilter, { MatchWeights } from './FluidGravityFilter';
import { Save, Filter, Download, ArrowLeft } from 'lucide-react';
import { talentMatcherService } from '../services/talentMatcherService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

// LocalStorage key for company match weights (shared across pages)
const COMPANY_WEIGHTS_KEY = 'company_match_weights';
const DEFAULT_WEIGHTS: MatchWeights = { skills: 40, compensation: 30, culture: 30 };

// Load weights from localStorage
function loadCompanyWeights(): MatchWeights {
  try {
    const saved = localStorage.getItem(COMPANY_WEIGHTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        typeof parsed.skills === 'number' &&
        typeof parsed.compensation === 'number' &&
        typeof parsed.culture === 'number' &&
        Math.abs(parsed.skills + parsed.compensation + parsed.culture - 100) < 2
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load company weights from localStorage');
  }
  return DEFAULT_WEIGHTS;
}

// Save weights to localStorage
function saveCompanyWeights(weights: MatchWeights): void {
  try {
    localStorage.setItem(COMPANY_WEIGHTS_KEY, JSON.stringify(weights));
  } catch (e) {
    console.warn('Failed to save company weights to localStorage');
  }
}

// Calculate weighted score for a candidate
function calculateWeightedScore(result: TalentSearchResult, weights: MatchWeights): number {
  const breakdown = result.matchBreakdown?.details;
  if (!breakdown) return result.matchScore;

  const skillsScore = breakdown.skills?.score ?? 0;
  const salaryScore = breakdown.salary?.score ?? 0;
  // Combine culture and traits for culture dimension
  const cultureScore = ((breakdown.culture?.score ?? 0) + (breakdown.traits?.score ?? 0)) / 2;

  return (
    (skillsScore * weights.skills / 100) +
    (salaryScore * weights.compensation / 100) +
    (cultureScore * weights.culture / 100)
  );
}

interface Props {
  results: TalentSearchResult[];
  criteria: TalentSearchCriteria;
  onBack: () => void;
  onUnlock: (id: string) => void | Promise<{ success: boolean; error?: { message: string; code: string } }>;
  onSchedule: (id: string) => void;
  onMessage: (id: string) => void;
  onViewProfile: (candidate: CandidateProfile) => void;
}

const TalentSearchResults: React.FC<Props> = ({ results, criteria, onBack, onUnlock, onSchedule, onMessage, onViewProfile }) => {
    const { user } = useAuth();
    const [sortBy, setSortBy] = useState<'match' | 'weighted' | 'salary_low' | 'salary_high'>('weighted');
    const [saveName, setSaveName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    // Match priority weights state
    const [matchWeights, setMatchWeights] = useState<MatchWeights>(loadCompanyWeights);

    // Save weights to localStorage when they change
    useEffect(() => {
      saveCompanyWeights(matchWeights);
    }, [matchWeights]);

    // Calculate weighted scores and sort
    const sortedResults = useMemo(() => {
        const resultsWithWeightedScore = results.map(res => ({
            ...res,
            weightedScore: calculateWeightedScore(res, matchWeights)
        }));

        return resultsWithWeightedScore.sort((a, b) => {
            if (sortBy === 'weighted') return b.weightedScore - a.weightedScore;
            if (sortBy === 'match') return b.matchScore - a.matchScore;
            if (sortBy === 'salary_low') {
                 return (a.candidate.salaryMin || 0) - (b.candidate.salaryMin || 0);
            }
            if (sortBy === 'salary_high') {
                 return (b.candidate.salaryMin || 0) - (a.candidate.salaryMin || 0);
            }
            return 0;
        });
    }, [results, matchWeights, sortBy]);

    const handleSaveSearch = async () => {
        if (!saveName) return;
        setIsSaving(true);
        
        // Get company ID
        const { data: teamMember } = await supabase.from('team_members').select('company_id').eq('user_id', user!.id).maybeSingle();
        const companyId = teamMember?.company_id || user!.id;
        
        await talentMatcherService.saveSearch({
            user_id: user!.id,
            company_id: companyId,
            name: saveName,
            criteria: criteria,
            alert_enabled: false
        });
        
        setIsSaving(false);
        setShowSaveDialog(false);
        alert('Search saved!');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 rounded-full transition-colors">
                         <ArrowLeft className="w-5 h-5 text-muted"/>
                     </button>
                     <div>
                         <h2 className="font-heading text-2xl text-primary">Matches Found</h2>
                         <p className="text-muted">{results.length} candidates fit your precision criteria</p>
                     </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    <select
                        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-accent-coral outline-none"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                    >
                        <option value="weighted">Priority Weighted</option>
                        <option value="match">Best Match</option>
                        <option value="salary_low">Lowest Salary</option>
                        <option value="salary_high">Highest Salary</option>
                    </select>

                    <button
                        onClick={() => setShowSaveDialog(true)}
                        className="bg-surface border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 flex items-center transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2 text-accent-coral"/> Save Search
                    </button>

                    <button className="bg-surface border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 flex items-center transition-colors">
                        <Download className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500"/> Export
                    </button>
                </div>
            </div>

            {/* Match Priority Filter */}
            <FluidGravityFilter
                weights={matchWeights}
                onChange={setMatchWeights}
                onReset={() => setMatchWeights(DEFAULT_WEIGHTS)}
            />

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedResults.map((res) => (
                    <div key={res.candidate.id} className="relative">
                         <EnrichedCandidateCard
                            candidate={{...res.candidate, matchScore: res.matchScore}}
                            matchResult={res.matchBreakdown}
                            onUnlock={onUnlock}
                            onSchedule={onSchedule}
                            onMessage={onMessage}
                            onViewProfile={onViewProfile}
                            showMatchBreakdown={true}
                         />

                         {res.matchBreakdown.dealBreakers.length > 0 && (
                             <div className="absolute top-2 right-2 bg-red-50 text-red-700 text-[10px] font-bold px-2 py-1 rounded-xl z-20 border border-red-100 shadow-sm animate-pulse">
                                Dealbreaker: {res.matchBreakdown.dealBreakers[0]}
                             </div>
                         )}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {results.length === 0 && (
                <div className="text-center py-20 bg-surface rounded-3xl border border-dashed border-border">
                    <Filter className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-primary">No perfect matches</h3>
                    <p className="text-muted mt-2 max-w-md mx-auto">Try loosening your strict requirements or broadening your skill search.</p>
                </div>
            )}

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-surface rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-200">
                        <h3 className="text-2xl font-black text-primary mb-2">Save Search</h3>
                        <p className="text-sm text-muted mb-6 leading-relaxed">Save these requirements to run them again with a single click or enable automatic match alerts.</p>
                        
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Search Title</label>
                            <input 
                                autoFocus
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-border rounded-xl font-bold focus:ring-2 focus:ring-accent-coral outline-none"
                                placeholder="e.g. Senior React Devs (London)"
                                value={saveName}
                                onChange={e => setSaveName(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-3">
                             <button onClick={() => setShowSaveDialog(false)} className="flex-1 px-4 py-3 text-muted font-bold hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 rounded-xl transition-colors">Cancel</button>
                             <button 
                                onClick={handleSaveSearch} 
                                disabled={!saveName || isSaving} 
                                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg disabled:opacity-50 transition-all transform active:scale-95"
                             >
                                 {isSaving ? 'Saving...' : 'Save Search'}
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TalentSearchResults;
