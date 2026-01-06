import React from 'react';
import { Calendar, Video, Clock, MapPin, ExternalLink, CheckCircle } from 'lucide-react';
import { ApplicationHubItem, CalendarEvent } from '../../../types';

interface ScheduleTabProps {
  application: ApplicationHubItem;
}

const formatEventDateTime = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const dateStr = start.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  const startTimeStr = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
  
  const endTimeStr = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
  
  return `${dateStr} · ${startTimeStr} - ${endTimeStr}`;
};

const getEventTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    screening: 'Phone Screen',
    technical_test: 'Technical Interview',
    final_round: 'Final Round',
    interview: 'Interview',
    sync: 'Sync Call',
    other: 'Meeting'
  };
  return labels[type] || type;
};

const getEventTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    screening: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    technical_test: 'bg-blue-100 text-blue-800 border-blue-200',
    final_round: 'bg-purple-100 text-purple-800 border-purple-200',
    interview: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    sync: 'bg-gray-100 text-gray-800 border-gray-200',
    other: 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[type] || colors.other;
};

const isEventUpcoming = (startTime: string): boolean => {
  return new Date(startTime) > new Date();
};

const isEventImminent = (startTime: string): boolean => {
  const diff = new Date(startTime).getTime() - Date.now();
  return diff > 0 && diff < 1000 * 60 * 60; // Within 1 hour
};

interface EventCardProps {
  event: CalendarEvent;
  variant: 'upcoming' | 'past';
}

const EventCard: React.FC<EventCardProps> = ({ event, variant }) => {
  const imminent = variant === 'upcoming' && isEventImminent(event.start_time);
  
  return (
    <div className={`
      p-5 rounded-2xl border-2 transition-all
      ${variant === 'upcoming'
        ? imminent
          ? 'bg-purple-50 border-purple-300 shadow-lg scale-[1.02]'
          : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
        : 'bg-gray-50 border-transparent opacity-75'
      }
    `}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mb-3
            ${getEventTypeColor(event.event_type)}
          `}>
            {getEventTypeLabel(event.event_type)}
          </span>
          
          <h4 className="font-bold text-gray-900 truncate text-base">{event.title}</h4>
          
          <div className="flex items-center text-sm font-medium text-gray-500 mt-2">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
            {formatEventDateTime(event.start_time, event.end_time)}
          </div>
          
          {event.description && (
            <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex-shrink-0">
          {variant === 'upcoming' && event.video_link ? (
            <a
              href={event.video_link}
              target="_blank"
              rel="noreferrer"
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-sm
                ${imminent
                  ? 'bg-purple-600 text-white hover:bg-purple-700 animate-pulse active:scale-95'
                  : 'bg-gray-900 text-white hover:bg-black active:scale-95'
                }
              `}
            >
              <Video className="w-4 h-4" />
              {imminent ? 'Join Now' : 'Join'}
            </a>
          ) : variant === 'past' ? (
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const ScheduleTab: React.FC<ScheduleTabProps> = ({ application }) => {
  const allEvents = application.upcomingEvents;
  const upcomingEvents = allEvents.filter(e => isEventUpcoming(e.start_time));
  const pastEvents: CalendarEvent[] = []; // In Phase 3, we focus on upcoming. Past would be a separate query if needed.

  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2 text-lg">No Scheduled Interviews</h3>
        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
          Interviews scheduled by {application.job.company_name} will appear here with calendar sync and video links.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50/30 h-full">
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 shadow-sm shadow-green-200" />
            Upcoming Rounds
          </h3>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} variant="upcoming" />
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
            Completed
          </h3>
          <div className="space-y-3">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} variant="past" />
            ))}
          </div>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
          <Calendar className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <h4 className="font-black text-lg mb-1">Google Calendar Sync</h4>
            <p className="text-blue-100 text-sm font-medium mb-0">Events are synced automatically if you've connected your account in the Schedule tab.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;
