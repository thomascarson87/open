
import React, { useState } from 'react';
import { TalentSearchResult, CandidateProfile, TalentSearchCriteria } from '../types';
import CandidateCard from './CandidateCard';
import { Save, Filter, Download, ArrowLeft } from 'lucide-react';
import { talentMatcherService } from '../services/talentMatcherService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface Props {
  results: TalentSearchResult[];
  criteria: TalentSearchCriteria;
  onBack: () => void;
  onUnlock: (id: string) => void;
  onSchedule: (id: string) => void;
  onMessage: (id: string) => void;
  onViewProfile: (candidate: CandidateProfile) => void;
}

const TalentSearchResults: React.FC<Props> = ({ results, criteria, onBack, onUnlock, onSchedule, onMessage, onViewProfile }) => {
    const { user } = useAuth();
    const [sortBy, setSortBy] = useState<'match' | 'salary_low' | 'salary_high'>('match');
    const [saveName, setSaveName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const sortedResults = [...results].sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore;
        if (sortBy === 'salary_low') {
             return (parseInt(a.candidate.salaryExpectation) || 0) - (parseInt(b.candidate.salaryExpectation) || 0);
        }
        if (sortBy === 'salary_high') {
             return (parseInt(b.candidate.salaryExpectation) || 0) - (parseInt(a.candidate.salaryExpectation) || 0);
        }
        return 0;
    });

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
                         <ArrowLeft className="w-5 h-5 text-gray-600"/>
                     </button>
                     <div>
                         <h2 className="text-2xl font-bold text-gray-900">Matches Found</h2>
                         <p className="text-gray-500">{results.length} candidates fit your criteria</p>
                     </div>
                </div>
                
                <div className="flex gap-2">
                    <select 
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                    >
                        <option value="match">Best Match</option>
                        <option value="salary_low">Lowest Salary</option>
                        <option value="salary_high">Highest Salary</option>
                    </select>
                    
                    <button 
                        onClick={() => setShowSaveDialog(true)}
                        className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center"
                    >
                        <Save className="w-4 h-4 mr-2"/> Save Search
                    </button>
                    
                    <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
                        <Download className="w-4 h-4 mr-2"/> Export
                    </button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedResults.map((res, i) => (
                    <div key={res.candidate.id} className="relative group">
                         {/* Pass the calculated match score to override candidate's internal score */}
                         <CandidateCard 
                            candidate={{...res.candidate, matchScore: res.matchScore}} 
                            onUnlock={onUnlock} 
                            onSchedule={onSchedule} 
                            onMessage={onMessage} 
                            onViewProfile={onViewProfile}
                         />
                         {/* Debug overlay for match details - optional */}
                         {res.matchBreakdown.dealBreakers.length > 0 && (
                             <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded z-20">
                                Dealbreaker: {res.matchBreakdown.dealBreakers[0]}
                             </div>
                         )}
                    </div>
                ))}
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6">
                        <h3 className="font-bold text-lg mb-2">Save this search</h3>
                        <p className="text-sm text-gray-500 mb-4">Save criteria to run again later or enable alerts.</p>
                        
                        <input 
                            autoFocus
                            className="w-full p-3 border border-gray-200 rounded-xl mb-4"
                            placeholder="e.g. Senior React Devs London"
                            value={saveName}
                            onChange={e => setSaveName(e.target.value)}
                        />
                        
                        <div className="flex justify-end gap-2">
                             <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2 text-gray-600 font-bold">Cancel</button>
                             <button onClick={handleSaveSearch} disabled={!saveName || isSaving} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold">
                                 {isSaving ? 'Saving...' : 'Save'}
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TalentSearchResults;
