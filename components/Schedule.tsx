import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Video, Users, Clock, Trash2, ExternalLink, X, MapPin } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { googleCalendar } from '../services/googleCalendar';
import ScheduleCallModal from './ScheduleCallModal';
import { CalendarEvent } from '../types';
import { useSearchParams } from '../hooks/useSearchParams';

type ViewMode = 'day' | 'week' | 'month';

const EVENT_COLORS: Record<string, string> = {
    interview: 'bg-accent-green-bg text-accent-green border-accent-green-bg',
    screening: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    technical_test: 'bg-accent-coral-bg text-accent-coral border-accent-coral-light',
    sync: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-border',
    other: 'bg-green-100 text-green-800 border-green-200'
};

const Schedule: React.FC = () => {
  const { user } = useAuth();
  
  const [searchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Pre-fill state
  const [preSelectedCandidateId, setPreSelectedCandidateId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const cid = searchParams.get('candidateId');
    if (cid) {
        setPreSelectedCandidateId(cid);
        setShowCreateModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchEvents();
      checkGoogleConnection();
    }
  }, [user, currentDate, viewMode]);

  const fetchEvents = async () => {
    setLoading(true);
    const startOfPeriod = getStartOfPeriod(currentDate, viewMode);
    const endOfPeriod = getEndOfPeriod(currentDate, viewMode);

    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user?.id)
      .gte('start_time', startOfPeriod.toISOString())
      .lte('start_time', endOfPeriod.toISOString())
      .order('start_time', { ascending: true });

    if (data) setEvents(data as CalendarEvent[]);
    setLoading(false);
  };

  const checkGoogleConnection = async () => {
    const { data } = await supabase
      .from('google_calendar_tokens')
      .select('user_id')
      .eq('user_id', user?.id)
      .maybeSingle();

    setIsGoogleConnected(!!data);
  };

  const connectGoogleCalendar = () => {
    googleCalendar.initiateAuth();
  };

  const disconnectGoogleCalendar = async () => {
    if(!window.confirm('Are you sure you want to disconnect Google Calendar?')) return;
    await googleCalendar.disconnect(user!.id);
    setIsGoogleConnected(false);
  };

  const deleteEvent = async (eventId: string) => {
    if(!window.confirm('Delete this event?')) return;
    setLoading(true);
    const eventToDelete = events.find(e => e.id === eventId);
    
    if (eventToDelete?.is_synced && eventToDelete.google_event_id && isGoogleConnected) {
        await googleCalendar.deleteEvent(user!.id, eventToDelete.google_event_id);
    }

    await supabase.from('calendar_events').delete().eq('id', eventId);
    await fetchEvents();
    setSelectedEvent(null);
    setLoading(false);
  };

  // Callback from modal
  const handleEventScheduled = async () => {
      await fetchEvents();
      setShowCreateModal(false);
  };

  // Navigate methods
  const goToToday = () => setCurrentDate(new Date());
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    else newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="h-full flex flex-col bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-border gap-4">
        <div>
          <h2 className="font-heading text-2xl text-primary flex items-center">
             Schedule
             {loading && <div className="ml-3 w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 animate-spin"></div>}
          </h2>
          <p className="text-muted text-sm mt-1">
            {formatDateRange(currentDate, viewMode)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isGoogleConnected ? (
            <button onClick={disconnectGoogleCalendar} className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 flex items-center text-green-700">
              <ExternalLink className="w-4 h-4 mr-2" /> Google Synced
            </button>
          ) : (
            <button onClick={connectGoogleCalendar} className="px-4 py-2 bg-accent-coral text-white rounded-lg text-sm font-medium hover:bg-accent-coral flex items-center shadow-sm">
              <ExternalLink className="w-4 h-4 mr-2" /> Connect Google
            </button>
          )}

          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black flex items-center shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> New Event
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 border-b border-border gap-4">
        <div className="flex gap-2">
          <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-white dark:bg-surface rounded-lg border border-transparent hover:border-border text-muted"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={goToToday} className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900">Today</button>
          <button onClick={() => navigateDate('next')} className="p-2 hover:bg-white dark:bg-surface rounded-lg border border-transparent hover:border-border text-muted"><ChevronRight className="w-5 h-5" /></button>
        </div>
        <div className="flex bg-border/50 p-1 rounded-lg">
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
             <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${viewMode === mode ? 'bg-white dark:bg-surface shadow-sm text-primary' : 'text-muted hover:text-gray-700 dark:text-gray-300 dark:text-gray-600'}`}>{mode}</button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {viewMode === 'week' && <WeekView events={events} onEventClick={setSelectedEvent} currentDate={currentDate} onSlotClick={() => setShowCreateModal(true)} />}
        {viewMode === 'day' && <DayView events={events} onEventClick={setSelectedEvent} currentDate={currentDate} />}
        {viewMode === 'month' && <MonthView events={events} onEventClick={setSelectedEvent} currentDate={currentDate} />}
      </div>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onDelete={deleteEvent} />
      )}

      {showCreateModal && (
        <ScheduleCallModal 
            onClose={() => setShowCreateModal(false)} 
            onSchedule={handleEventScheduled}
            candidateId={preSelectedCandidateId}
            showCandidateSelector={!preSelectedCandidateId}
        />
      )}
    </div>
  );
};

/* Sub-Components (Simplified for update) */
const WeekView = ({ events, onEventClick, currentDate, onSlotClick }: { events: CalendarEvent[], onEventClick: (e: CalendarEvent) => void, currentDate: Date, onSlotClick: () => void }) => {
    const days = getDaysInWeek(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="min-w-[800px] bg-white dark:bg-surface">
            <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-white dark:bg-surface z-10">
                <div className="p-4 border-r border-border"></div>
                {days.map((d, i) => (
                    <div key={i} className={`p-4 text-center border-r border-border ${isSameDate(d, new Date()) ? 'bg-accent-coral-bg' : ''}`}>
                        <div className="text-xs font-bold text-muted uppercase mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={`text-xl font-bold ${isSameDate(d, new Date()) ? 'text-accent-coral' : 'text-primary'}`}>{d.getDate()}</div>
                    </div>
                ))}
            </div>
            <div className="relative grid grid-cols-8">
                <div className="border-r border-border">
                    {hours.map(h => <div key={h} className="h-14 border-b border-gray-50 text-xs text-gray-400 dark:text-gray-500 text-right pr-2 py-1 relative">{formatHour(h)}</div>)}
                </div>
                {days.map((d, dayIdx) => (
                    <div key={dayIdx} className="border-r border-border relative h-[1344px]" onClick={onSlotClick}>
                         {hours.map(h => <div key={h} className="h-14 border-b border-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:bg-gray-900 cursor-pointer"></div>)}
                         {events.filter(e => isSameDate(new Date(e.start_time), d)).map(event => {
                             const start = new Date(event.start_time);
                             const end = new Date(event.end_time);
                             const top = (start.getHours() + start.getMinutes() / 60) * 56;
                             const height = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 56;
                             return (
                                <div key={event.id} onClick={(e) => { e.stopPropagation(); onEventClick(event); }} className={`absolute left-1 right-1 p-2 rounded-lg text-xs border cursor-pointer hover:shadow-md transition-all overflow-hidden ${EVENT_COLORS[event.event_type] || 'bg-gray-100 dark:bg-gray-800 border-border'}`} style={{ top: `${top}px`, height: `${height}px` }}>
                                    <div className="font-bold truncate">{event.title}</div>
                                </div>
                             );
                         })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const DayView = ({ events, onEventClick, currentDate }: any) => {
    return <div className="p-8 text-center text-gray-400 dark:text-gray-500">Day View (Implementation omitted for brevity)</div>;
};

const MonthView = ({ events, onEventClick, currentDate }: any) => {
    return <div className="p-8 text-center text-gray-400 dark:text-gray-500">Month View (Implementation omitted for brevity)</div>;
};

const EventDetailModal = ({ event, onClose, onDelete }: { event: CalendarEvent, onClose: () => void, onDelete: (id: string) => void }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{event.title}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-muted"/></button>
                </div>
                <div className="space-y-4">
                    <p className="text-muted text-sm">{event.description}</p>
                    <div className="flex gap-2">
                        {event.video_link && <a href={event.video_link} target="_blank" rel="noreferrer" className="px-4 py-2 bg-accent-coral text-white rounded-lg text-sm font-bold">Join Meet</a>}
                        <button onClick={() => onDelete(event.id)} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold border border-red-200">Delete</button>
                    </div>
                </div>
             </div>
        </div>
    );
};

/* Utils */
function getStartOfPeriod(date: Date, mode: ViewMode): Date {
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    if (mode === 'week') d.setDate(d.getDate() - d.getDay());
    else if (mode === 'month') d.setDate(1);
    return d;
}
function getEndOfPeriod(date: Date, mode: ViewMode): Date {
    const d = new Date(date); d.setHours(23, 59, 59, 999);
    if (mode === 'week') d.setDate(d.getDate() + (6 - d.getDay()));
    else if (mode === 'month') { d.setMonth(d.getMonth() + 1); d.setDate(0); }
    return d;
}
function formatDateRange(date: Date, mode: ViewMode): string { return date.toLocaleDateString(); }
function getDaysInWeek(date: Date): Date[] {
    const start = getStartOfPeriod(date, 'week');
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
}
function isSameDate(d1: Date, d2: Date) { return d1.toDateString() === d2.toDateString(); }
function formatHour(h: number) { return h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`; }

export default Schedule;
