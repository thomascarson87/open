
import React from 'react';
import { Building2, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { ApplicationHubItem } from '../../types';
import StatusBadge from '../StatusBadge';

interface ApplicationCardProps {
  application: ApplicationHubItem;
  onClick: () => void;
}

const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    // Past date
    const pastDays = Math.abs(diffDays);
    if (pastDays === 0) return 'Today';
    if (pastDays === 1) return 'Yesterday';
    return `${pastDays} days ago`;
  }

  // Future date
  if (diffHours < 1) return 'In < 1 hour';
  if (diffHours < 24) return `In ${diffHours}h`;
  if (diffDays === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onClick }) => {
  const { job, status, match_score, unreadCount, upcomingEvents } = application;
  const nextEvent = upcomingEvents[0];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 
                 hover:shadow-md hover:border-gray-300 
                 transition-all cursor-pointer
                 active:scale-[0.99] active:bg-gray-50"
    >
      <div className="flex items-start gap-4">
        {/* Company Logo */}
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {job.company_logo ? (
            <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{job.title}</h3>
              <p className="text-sm text-gray-500 truncate">{job.company_name}</p>
            </div>
            <StatusBadge status={status} size="sm" />
          </div>

          {/* Indicators Row */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
            {match_score > 0 && (
              <span className={`font-bold ${
                match_score >= 80 ? 'text-green-600' :
                match_score >= 60 ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {match_score}% match
              </span>
            )}

            {unreadCount > 0 && (
              <span className="flex items-center text-blue-600 font-semibold">
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                {unreadCount} new
              </span>
            )}

            {nextEvent && (
              <span className="flex items-center text-purple-600 font-semibold">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {formatRelativeDate(nextEvent.start_time)}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
      </div>
    </div>
  );
};

export default ApplicationCard;
