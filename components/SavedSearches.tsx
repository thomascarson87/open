
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

    if (loading) return <div className="p-8 text-center text-muted">Loading saved searches...</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="font-heading text-2xl text-primary mb-6">Saved Searches</h1>
            
            {searches.length === 0 ? (
                <div className="text-center p-12 bg-surface rounded-2xl border border-border">
                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-primary">No saved searches</h3>
                    <p className="text-muted">Run a Talent Match search and save it to see it here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {searches.map(search => (
                        <div key={search.id} className="bg-white dark:bg-surface p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                            <div>
                                <h3 className="font-bold text-lg text-primary mb-1">{search.name}</h3>
                                <div className="text-sm text-muted flex items-center gap-4">
                                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Ran {new Date(search.last_run || search.created_at).toLocaleDateString()}</span>
                                    <span>{search.criteria.title || 'General Search'}</span>
                                    <span>{search.criteria.location}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => toggleAlert(search)}
                                    className={`p-2 rounded-full transition-colors ${search.alert_enabled ? 'bg-accent-coral-bg text-accent-coral' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-muted'}`}
                                    title={search.alert_enabled ? "Alerts On" : "Alerts Off"}
                                >
                                    {search.alert_enabled ? <Bell className="w-4 h-4"/> : <BellOff className="w-4 h-4"/>}
                                </button>
                                
                                <button 
                                    onClick={() => handleDelete(search.id)}
                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
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
