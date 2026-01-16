import React, { useState } from 'react';
import { Clock, Briefcase } from 'lucide-react';
import { useApplicationHub } from '../../hooks/useApplicationHub';
import { ApplicationHubItem } from '../../types';
import ApplicationCard from './ApplicationCard';
import QuickFilters from './QuickFilters';
import UpcomingEventsBanner from './UpcomingEventsBanner';
import ApplicationDetailPanel from './ApplicationDetailPanel';

const ApplicationHub: React.FC = () => {
  const {
    applications,
    isLoading,
    error,
    filter,
    setFilter,
    counts,
    allUpcomingEvents,
    refetch
  } = useApplicationHub();

  const [selectedApp, setSelectedApp] = useState<ApplicationHubItem | null>(null);

  const handleCardClick = (app: ApplicationHubItem) => {
    setSelectedApp(app);
  };

  const interviewCount = applications.filter(a => 
    a.status.includes('_scheduled')
  ).length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <UpcomingEventsBanner events={allUpcomingEvents} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {counts.all} total · {interviewCount} interview{interviewCount !== 1 ? 's' : ''} scheduled
          </p>
        </div>

        <QuickFilters
          current={filter}
          onChange={setFilter}
          counts={counts}
        />

        <div className="space-y-3 mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4 mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-red-700 underline"
              >
                Try again
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {filter === 'all' ? (
                  <Clock className="w-8 h-8 text-gray-300" />
                ) : (
                  <Briefcase className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
              </h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                {filter === 'all' 
                  ? 'Start exploring jobs to see your pipeline here.'
                  : 'Try a different filter to see your applications.'
                }
              </p>
            </div>
          ) : (
            applications.map(app => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={() => handleCardClick(app)}
              />
            ))
          )}
        </div>
      </div>

      <ApplicationDetailPanel
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        onApplicationUpdate={refetch}
      />
    </div>
  );
};

export default ApplicationHub;
