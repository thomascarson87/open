
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from './StatusBadge';
import { atsService } from '../services/atsService';
import { Application, JobPosting, ApplicationStatus } from '../types';
import { Building2, Calendar, ChevronRight, MessageSquare, Clock } from 'lucide-react';

interface Props {
  jobs: JobPosting[];
  onViewMessage: (appId: string) => void;
}

const CandidateApplications: React.FC<Props> = ({ onViewMessage }) => {
  const { user } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadApps();
  }, [user]);

  const loadApps = async () => {
    setLoading(true);
    // Profile ID is the User ID in this schema
    const { data: profile } = await supabase.from('candidate_profiles').select('id').eq('id', user!.id).maybeSingle();
    
    if (profile) {
        const { data } = await supabase
            .from('applications')
            .select(`
                *,
                job:jobs(id, title, company_name, location, company_logo),
                conversation:conversations!application_id(id)
            `)
            .eq('candidate_id', profile.id)
            .order('created_at', { ascending: false });
        setApps(data || []);
    }
    setLoading(false);
  };

  const openTimeline = async (app: any) => {
      setSelectedApp(app);
      const hist = await atsService.getStatusHistory(app.id);
      setHistory(hist);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <h1 className="font-heading text-3xl text-primary mb-2">My Applications</h1>
      <p className="text-muted mb-8">Track your hiring journey and interview schedules.</p>

      {loading ? (
           <div className="text-center py-12">Loading...</div>
      ) : apps.length === 0 ? (
           <div className="bg-surface rounded-2xl border border-border p-12 text-center">
               <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600" />
               </div>
               <h3 className="text-lg font-bold text-primary">No applications yet</h3>
               <p className="text-muted mt-2">Start exploring jobs to see your pipeline here.</p>
           </div>
      ) : (
           <div className="grid gap-4">
               {apps.map(app => (
                   <div key={app.id} className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all">
                       <div className="flex flex-col md:flex-row justify-between gap-6">
                           <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {app.job.company_logo ? <img src={app.job.company_logo} className="w-full h-full object-cover"/> : <Building2 className="w-8 h-8 text-gray-400 dark:text-gray-500"/>}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-primary">{app.job.title}</h3>
                                    <p className="text-muted font-medium">{app.job.company_name}</p>
                                    <div className="text-sm text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                                        <Calendar className="w-3 h-3 mr-1"/> Applied {new Date(app.created_at || app.last_updated).toLocaleDateString()}
                                    </div>
                                </div>
                           </div>
                           
                           <div className="flex flex-col items-end gap-3">
                               <StatusBadge status={app.status} size="lg"/>
                               <div className="flex gap-2 mt-2">
                                   <button 
                                      onClick={() => openTimeline(app)}
                                      className="text-sm font-bold text-muted hover:text-primary bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg transition-colors"
                                   >
                                       View Timeline
                                   </button>
                                   {app.conversation?.[0]?.id && (
                                       <button 
                                          onClick={() => onViewMessage(app.id)} 
                                          className="text-sm font-bold text-white bg-accent-coral hover:bg-accent-coral px-4 py-2 rounded-lg transition-colors flex items-center"
                                       >
                                           <MessageSquare className="w-4 h-4 mr-2"/> Message
                                       </button>
                                   )}
                               </div>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
      )}

      {/* Timeline Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Application Timeline</h3>
                    <button onClick={() => setSelectedApp(null)} className="text-gray-400 dark:text-gray-500 hover:text-primary">✕</button>
                </div>
                
                <div className="space-y-6 pl-2">
                    {history.map((entry, i) => (
                        <div key={entry.id} className="relative pl-6 border-l-2 border-border pb-1">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent-coral-bg border-2 border-accent-coral"></div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <StatusBadge status={entry.new_status} size="sm" />
                                    {entry.notes && <p className="text-sm text-muted mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">{entry.notes}</p>}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-4">
                                    {new Date(entry.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                    {history.length === 0 && <div className="text-muted italic">No history available.</div>}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CandidateApplications;
