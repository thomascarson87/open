
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, MessageSquare, Calendar, Send, 
  UserCheck, FileText, XCircle, Gift, ArrowRight 
} from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { ApplicationHubItem, ApplicationStatusHistory, Message } from '../../../types';
import { atsService } from '../../../services/atsService';

interface TimelineTabProps {
  application: ApplicationHubItem;
}

interface TimelineEntry {
  id: string;
  type: 'status_change' | 'message' | 'event' | 'application';
  timestamp: string;
  title: string;
  description?: string;
  metadata?: any;
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getEntryIcon = (type: string, status?: string) => {
  switch (type) {
    case 'application':
      return <Send className="w-4 h-4" />;
    case 'status_change':
      if (status?.includes('rejected')) return <XCircle className="w-4 h-4" />;
      if (status?.includes('offer')) return <Gift className="w-4 h-4" />;
      if (status?.includes('hired')) return <UserCheck className="w-4 h-4" />;
      return <ArrowRight className="w-4 h-4" />;
    case 'message':
      return <MessageSquare className="w-4 h-4" />;
    case 'event':
      return <Calendar className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getEntryColor = (type: string, status?: string) => {
  switch (type) {
    case 'application':
      return 'bg-accent-coral-bg text-accent-coral';
    case 'status_change':
      if (status?.includes('rejected')) return 'bg-red-100 text-red-600';
      if (status?.includes('offer') || status?.includes('hired')) return 'bg-green-100 text-green-600';
      return 'bg-accent-green-bg text-accent-green';
    case 'message':
      return 'bg-gray-100 dark:bg-gray-800 text-muted';
    case 'event':
      return 'bg-yellow-100 text-yellow-600';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-muted';
  }
};

const TimelineTab: React.FC<TimelineTabProps> = ({ application }) => {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    buildTimeline();
  }, [application.id]);

  const buildTimeline = async () => {
    setIsLoading(true);
    const entries: TimelineEntry[] = [];

    entries.push({
      id: `app-${application.id}`,
      type: 'application',
      timestamp: application.created_at,
      title: 'Application submitted',
      description: `Applied to ${application.job.title} at ${application.job.company_name}`
    });

    application.recentHistory.forEach(history => {
      const statusInfo = atsService.getStatusDisplayInfo(history.new_status as any);
      entries.push({
        id: `status-${history.id}`,
        type: 'status_change',
        timestamp: history.created_at,
        title: `Status updated to ${statusInfo.label}`,
        description: history.notes || undefined,
        metadata: { status: history.new_status }
      });
    });

    application.upcomingEvents.forEach(event => {
      entries.push({
        id: `event-${event.id}`,
        type: 'event',
        timestamp: event.start_time,
        title: event.title,
        description: `${event.event_type.replace('_', ' ')} - ${new Date(event.start_time).toLocaleString()}`,
        metadata: { event }
      });
    });

    if (application.conversationId) {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', application.conversationId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messages) {
        messages.forEach(msg => {
          if (!msg.is_system_message) {
            entries.push({
              id: `msg-${msg.id}`,
              type: 'message',
              timestamp: msg.created_at,
              title: 'Message received',
              description: msg.text.length > 100 ? msg.text.substring(0, 100) + '...' : msg.text
            });
          }
        });
      }
    }

    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setTimeline(entries);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-border" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-border rounded w-3/4" />
              <div className="h-3 bg-border rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="p-8 text-center">
        <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-muted">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-1">
        {timeline.map((entry, index) => (
          <div key={entry.id} className="flex gap-3 relative">
            {index < timeline.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />
            )}

            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
              ${getEntryColor(entry.type, entry.metadata?.status)}
            `}>
              {getEntryIcon(entry.type, entry.metadata?.status)}
            </div>

            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-primary text-sm">{entry.title}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                  {formatRelativeTime(entry.timestamp)}
                </span>
              </div>
              {entry.description && (
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  {entry.description}
                </p>
              )}
              
              {entry.type === 'event' && entry.metadata?.event?.video_link && (
                <a
                  href={entry.metadata.event.video_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-accent-green-bg text-accent-green rounded-lg text-xs font-bold hover:bg-accent-green-bg transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Join Meeting
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineTab;
