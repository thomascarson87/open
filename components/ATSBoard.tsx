
import React from 'react';
import { Application, JobPosting, CandidateProfile, ApplicationStatus } from '../types';
import { MoreHorizontal } from 'lucide-react';

interface Props {
  applications: Application[];
  jobs: JobPosting[];
  candidates: CandidateProfile[];
}

const ATSBoard: React.FC<Props> = ({ applications, jobs, candidates }) => {
  // Mapping database statuses to board columns for recruiters
  const columns: { id: string, title: string, statuses: ApplicationStatus[] }[] = [
    { id: 'applied', title: 'New Applicants', statuses: ['applied'] },
    { id: 'reviewing', title: 'In Review', statuses: ['reviewing'] },
    { id: 'screening', title: 'Phone Screen', statuses: ['phone_screen_scheduled', 'phone_screen_completed'] },
    { id: 'interview', title: 'Interviewing', statuses: ['technical_scheduled', 'technical_completed', 'final_round_scheduled', 'final_round_completed'] },
    { id: 'offer', title: 'Offer Stage', statuses: ['offer_extended', 'offer_accepted', 'hired'] },
    { id: 'closed', title: 'Closed', statuses: ['rejected', 'withdrawn'] },
  ];

  const getJobTitle = (id: string) => jobs.find(j => j.id === id)?.title || 'Unknown Job';
  const getCandidate = (id: string) => candidates.find(c => c.id === id);

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex space-x-6 min-w-max pb-4">
        {columns.map(col => (
          <div key={col.id} className="w-80 flex-shrink-0 flex flex-col h-[calc(100vh-14rem)]">
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-semibold text-primary">{col.title}</h3>
                <span className="bg-border text-gray-700 dark:text-gray-300 dark:text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    {applications.filter(a => col.statuses.includes(a.status)).length}
                </span>
            </div>
            
            <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-border p-3 space-y-3 overflow-y-auto">
              {applications.filter(a => col.statuses.includes(a.status)).map(app => {
                const candidate = getCandidate(app.candidateId);
                if (!candidate) return null;
                
                return (
                    <div key={app.id} className="bg-white dark:bg-surface p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-all cursor-move group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-primary">{candidate.name}</span>
                            <button className="text-gray-300 dark:text-gray-600 hover:text-muted"><MoreHorizontal className="w-4 h-4"/></button>
                        </div>
                        <div className="text-xs text-accent-coral font-medium mb-3 bg-accent-coral-bg inline-block px-1.5 py-0.5 rounded">
                            {getJobTitle(app.jobId)}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                {app.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {app.matchScore > 0 && (
                                <span className={`text-xs font-bold ${app.matchScore > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {app.matchScore}% Match
                                </span>
                            )}
                        </div>
                    </div>
                );
              })}
              
              {applications.filter(a => col.statuses.includes(a.status)).length === 0 && (
                  <div className="h-full flex items-center justify-center text-gray-300 dark:text-gray-600 text-sm border-2 border-dashed border-border rounded-lg">
                      Empty
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ATSBoard;
