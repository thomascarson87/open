
import React from 'react';
import { Video, Calendar } from 'lucide-react';
import { CalendarEvent } from '../../types';

interface UpcomingEventsBannerProps {
  events: CalendarEvent[];
}

const formatCountdown = (startTime: string): string => {
  const now = new Date();
  const start = new Date(startTime);
  const diffMs = start.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours < 1) {
    return `Starting in ${diffMins} minutes`;
  } else if (diffHours < 24) {
    return `In ${diffHours}h ${diffMins}m`;
  } else {
    return start.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
};

const UpcomingEventsBanner: React.FC<UpcomingEventsBannerProps> = ({ events }) => {
  // Only show if event is within next 24 hours
  const nextEvent = events.find(e => {
    const hours = (new Date(e.start_time).getTime() - Date.now()) / (1000 * 60 * 60);
    return hours > 0 && hours < 24;
  });

  if (!nextEvent) return null;

  const isImminent = (new Date(nextEvent.start_time).getTime() - Date.now()) < (1000 * 60 * 60); // < 1 hour

  return (
    <div className={`sticky top-0 z-30 px-4 py-3 ${isImminent ? 'bg-accent-coral' : 'bg-gray-900'} text-white`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 ${isImminent ? 'bg-white dark:bg-surface/20' : 'bg-white dark:bg-surface/10'} rounded-full flex items-center justify-center flex-shrink-0`}>
            {isImminent ? <Video className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <div className="font-bold truncate">{nextEvent.title}</div>
            <div className={`text-sm ${isImminent ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
              {formatCountdown(nextEvent.start_time)}
            </div>
          </div>
        </div>
        {nextEvent.video_link && (
          <a
            href={nextEvent.video_link}
            target="_blank"
            rel="noreferrer"
            className={`px-4 py-2 ${isImminent ? 'bg-white dark:bg-surface text-accent-green' : 'bg-white dark:bg-surface text-primary'} font-bold rounded-lg text-sm flex-shrink-0 hover:opacity-90 transition-opacity`}
          >
            {isImminent ? 'Join Now' : 'Join'}
          </a>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsBanner;
