
import React, { useState } from 'react';
import TalentSearchForm from './TalentSearchForm';
import TalentSearchResults from './TalentSearchResults';
import SavedSearches from './SavedSearches';
import { TalentSearchCriteria, TalentSearchResult, CandidateProfile, SavedSearch } from '../types';
import { talentMatcherService } from '../services/talentMatcherService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Loader2 } from 'lucide-react';

interface Props {
    onViewProfile: (candidate: CandidateProfile) => void;
    onUnlock: (id: string) => void | Promise<{ success: boolean; error?: { message: string; code: string } }>;
    onSchedule: (id: string) => void;
    onMessage: (id: string) => void;
}

const TalentMatcher: React.FC<Props> = ({ onViewProfile, onUnlock, onSchedule, onMessage }) => {
    const { user } = useAuth();
    const [view, setView] = useState<'form' | 'results' | 'saved'>('form');
    const [isLoading, setIsLoading] = useState(false);
    const [criteria, setCriteria] = useState<TalentSearchCriteria>({
        requiredSkills: []
    });
    const [results, setResults] = useState<TalentSearchResult[]>([]);

    const handleSearch = async (searchCriteria: TalentSearchCriteria) => {
        setIsLoading(true);
        setCriteria(searchCriteria);
        
        // Get company ID
        const { data: teamMember } = await supabase.from('team_members').select('company_id').eq('user_id', user!.id).maybeSingle();
        const companyId = teamMember?.company_id || user!.id;
        
        const matches = await talentMatcherService.searchTalents(searchCriteria, companyId);
        setResults(matches);
        setIsLoading(false);
        setView('results');
    };

    const handleLoadSavedSearch = (saved: SavedSearch) => {
        setCriteria(saved.criteria);
        handleSearch(saved.criteria);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Talent Match</h1>
                    <p className="text-gray-500 mt-2">Find candidates that perfectly align with your requirements.</p>
                </div>
                {view === 'form' && (
                    <button 
                        onClick={() => setView('saved')}
                        className="text-blue-600 font-bold text-sm hover:underline"
                    >
                        View Saved Searches
                    </button>
                )}
                {view === 'saved' && (
                    <button 
                        onClick={() => setView('form')}
                        className="text-blue-600 font-bold text-sm hover:underline"
                    >
                        Back to Search
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Finding best matches...</h3>
                    <p className="text-gray-500">Analyzing skills, values, and preferences.</p>
                </div>
            ) : (
                <>
                    {view === 'form' && (
                        <div className="max-w-4xl mx-auto">
                            <TalentSearchForm initialCriteria={criteria} onSearch={handleSearch} />
                        </div>
                    )}

                    {view === 'results' && (
                        <TalentSearchResults 
                            results={results} 
                            criteria={criteria} 
                            onBack={() => setView('form')}
                            onViewProfile={onViewProfile}
                            onUnlock={onUnlock}
                            onSchedule={onSchedule}
                            onMessage={onMessage}
                        />
                    )}

                    {view === 'saved' && (
                        <SavedSearches onRunSearch={handleLoadSavedSearch} />
                    )}
                </>
            )}
        </div>
    );
};

export default TalentMatcher;
