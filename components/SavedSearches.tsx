
import React, { useEffect, useState } from 'react';
import { SavedSearch } from '../types';
import { talentMatcherService } from '../services/talentMatcherService';
import { useAuth } from '../contexts/AuthContext';
import { Search, Trash2, Bell, BellOff, ArrowRight, Clock } from 'lucide-react';

interface Props {
    onRunSearch: (search: SavedSearch) => void;
}

const SavedSearches: React.FC<Props> = ({ onRunSearch }) => {
    const { user } = useAuth();
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) loadSearches();
    }, [user]);

    const loadSearches = async () => {
        setLoading(true);
        const data = await talentMatcherService.getSavedSearches(user!.id);
        setSearches(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this search?')) {
            await talentMatcherService.deleteSavedSearch(id);
            loadSearches();
        }
    };

    const toggleAlert = async (s: SavedSearch) => {
        await talentMatcherService.updateSearchAlerts(s.id, !s.alert_enabled);
        setSearches(prev => prev.map(search => search.id === s.id ? { ...search, alert_enabled: !search.alert_enabled } : search));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading saved searches...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Searches</h1>
            
            {searches.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-2xl border border-gray-200">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No saved searches</h3>
                    <p className="text-gray-500">Run a Talent Match search and save it to see it here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {searches.map(search => (
                        <div key={search.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{search.name}</h3>
                                <div className="text-sm text-gray-500 flex items-center gap-4">
                                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Ran {new Date(search.last_run || search.created_at).toLocaleDateString()}</span>
                                    <span>{search.criteria.title || 'General Search'}</span>
                                    <span>{search.criteria.location}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => toggleAlert(search)}
                                    className={`p-2 rounded-full transition-colors ${search.alert_enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                                    title={search.alert_enabled ? "Alerts On" : "Alerts Off"}
                                >
                                    {search.alert_enabled ? <Bell className="w-4 h-4"/> : <BellOff className="w-4 h-4"/>}
                                </button>
                                
                                <button 
                                    onClick={() => handleDelete(search.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <button 
                                    onClick={() => onRunSearch(search)}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center hover:bg-black"
                                >
                                    Run <ArrowRight className="w-3 h-3 ml-2"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedSearches;
