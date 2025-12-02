import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Video, Users, Clock, Trash2, ExternalLink, X, MapPin } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { googleCalendar } from '../services/googleCalendar';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'interview' | 'screening' | 'technical_test' | 'sync' | 'other';
  start_time: string;
  end_time: string;
  video_link?: string;
  attendees: any[];
  status: string;
  is_synced: boolean;
  google_event_id?: string;
}

type ViewMode = 'day' | 'week' | 'month';

const EVENT_COLORS: Record<string, string> = {
    interview: 'bg-purple-100 text-purple-800 border-purple-200',
    screening: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    technical_test: 'bg-blue-100 text-blue-800 border-blue-200',
    sync: 'bg-gray-100 text-gray-800 border-gray-200',
    other: 'bg-green-100 text-green-800 border-green-200'
};

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initial Data Fetch
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

    const { data, error } = await supabase
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
      .single();

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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const createEvent = async (eventData: Partial<CalendarEvent>) => {
    setLoading(true);
    // Create in Supabase
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{
        user_id: user?.id,
        ...eventData
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create event:', error);
      setLoading(false);
      return;
    }

    // If Google is connected, sync to Google Calendar
    if (isGoogleConnected) {
      try {
        const googleEventId = await googleCalendar.createEvent(user!.id, {
          title: eventData.title!,
          description: eventData.description,
          start: new Date(eventData.start_time!),
          end: new Date(eventData.end_time!),
          attendees: eventData.attendees?.map(a => a.email)
        });

        // Get Meet link
        const meetLink = await googleCalendar.getMeetLink(user!.id, googleEventId);

        // Update event with Google data
        await supabase
          .from('calendar_events')
          .update({
            google_event_id: googleEventId,
            video_link: meetLink || undefined,
            is_synced: true
          })
          .eq('id', data.id);
      } catch (err) {
        console.error('Failed to sync with Google:', err);
        alert('Event created locally, but failed to sync with Google Calendar. Please check your connection.');
      }
    }

    await fetchEvents();
    setShowCreateModal(false);
    setLoading(false);
  };

  const deleteEvent = async (eventId: string) => {
    if(!window.confirm('Delete this event?')) return;
    
    setLoading(true);
    const eventToDelete = events.find(e => e.id === eventId);
    
    if (eventToDelete?.is_synced && eventToDelete.google_event_id && isGoogleConnected) {
        await googleCalendar.deleteEvent(user!.id, eventToDelete.google_event_id);
    }

    await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    await fetchEvents();
    setSelectedEvent(null);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
             Schedule
             {loading && <div className="ml-3 w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin"></div>}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {formatDateRange(currentDate, viewMode)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isGoogleConnected ? (
            <button
              onClick={disconnectGoogleCalendar}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center text-green-700"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Synced
            </button>
          ) : (
            <button
              onClick={connectGoogleCalendar}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center shadow-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect Google
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </button>
        </div>
      </div>

      {/* Navigation & Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 border-b border-gray-200 gap-4">
        <div className="flex gap-2">
          <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={goToToday} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
            Today
          </button>
          <button onClick={() => navigateDate('next')} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-gray-200/50 p-1 rounded-lg">
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
             <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${viewMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
                {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {viewMode === 'week' && <WeekView events={events} onEventClick={setSelectedEvent} currentDate={currentDate} />}
        {viewMode === 'day' && <DayView events={events} onEventClick={setSelectedEvent} currentDate={currentDate} />}
        {viewMode === 'month' && <MonthView events={events} onEventClick={setSelectedEvent} currentDate={currentDate} />}
      </div>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={deleteEvent}
        />
      )}

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createEvent}
          initialDate={currentDate}
        />
      )}
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const WeekView = ({ events, onEventClick, currentDate }: { events: CalendarEvent[], onEventClick: (e: CalendarEvent) => void, currentDate: Date }) => {
    const days = getDaysInWeek(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="min-w-[800px] bg-white">
            <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="p-4 border-r border-gray-100"></div>
                {days.map((d, i) => (
                    <div key={i} className={`p-4 text-center border-r border-gray-100 ${isSameDate(d, new Date()) ? 'bg-blue-50' : ''}`}>
                        <div className="text-xs font-bold text-gray-500 uppercase mb-1">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={`text-xl font-bold ${isSameDate(d, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>{d.getDate()}</div>
                    </div>
                ))}
            </div>
            <div className="relative grid grid-cols-8">
                <div className="border-r border-gray-100">
                    {hours.map(h => (
                        <div key={h} className="h-14 border-b border-gray-50 text-xs text-gray-400 text-right pr-2 py-1 relative">
                            {formatHour(h)}
                        </div>
                    ))}
                </div>
                {days.map((d, dayIdx) => {
                     // Filter events for this day
                     const dayEvents = events.filter(e => isSameDate(new Date(e.start_time), d));
                     
                     return (
                        <div key={dayIdx} className="border-r border-gray-100 relative h-[1344px]">
                            {/* Grid lines */}
                            {hours.map(h => (
                                <div key={h} className="h-14 border-b border-gray-50"></div>
                            ))}
                            
                            {/* Events */}
                            {dayEvents.map(event => {
                                const start = new Date(event.start_time);
                                const end = new Date(event.end_time);
                                const startHour = start.getHours() + start.getMinutes() / 60;
                                const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                const top = startHour * 56; // 56px height per hour (14 * 4)
                                const height = duration * 56;
                                
                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => onEventClick(event)}
                                        className={`absolute left-1 right-1 p-2 rounded-lg text-xs border cursor-pointer hover:shadow-md transition-all overflow-hidden ${EVENT_COLORS[event.event_type] || 'bg-gray-100 border-gray-200'}`}
                                        style={{ top: `${top}px`, height: `${height}px` }}
                                    >
                                        <div className="font-bold truncate">{event.title}</div>
                                        <div className="truncate opacity-75">{start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                );
                            })}
                        </div>
                     );
                })}
            </div>
        </div>
    );
};

const DayView = ({ events, onEventClick, currentDate }: { events: CalendarEvent[], onEventClick: (e: CalendarEvent) => void, currentDate: Date }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents = events.filter(e => isSameDate(new Date(e.start_time), currentDate));

    return (
        <div className="bg-white min-h-full">
            <div className="p-4 border-b border-gray-200 text-center">
                <div className="text-sm font-bold text-gray-500 uppercase">{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div className="text-3xl font-bold text-gray-900">{currentDate.getDate()}</div>
            </div>
            <div className="relative">
                {hours.map(h => (
                    <div key={h} className="flex h-20 border-b border-gray-100 group">
                        <div className="w-20 text-right pr-4 py-2 text-sm text-gray-400 border-r border-gray-100 group-hover:bg-gray-50">
                            {formatHour(h)}
                        </div>
                        <div className="flex-1 relative group-hover:bg-gray-50/30"></div>
                    </div>
                ))}
                
                {dayEvents.map(event => {
                    const start = new Date(event.start_time);
                    const end = new Date(event.end_time);
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    const top = startHour * 80; // 80px per hour
                    const height = duration * 80;

                    return (
                        <div
                            key={event.id}
                            onClick={() => onEventClick(event)}
                            className={`absolute left-24 right-4 p-3 rounded-lg border cursor-pointer shadow-sm hover:shadow-md transition-all ${EVENT_COLORS[event.event_type] || 'bg-blue-100 border-blue-200'}`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-base">{event.title}</div>
                                    <div className="text-sm opacity-80 flex items-center mt-1">
                                        <Clock className="w-3 h-3 mr-1"/>
                                        {start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                                {event.video_link && <Video className="w-4 h-4" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MonthView = ({ events, onEventClick, currentDate }: { events: CalendarEvent[], onEventClick: (e: CalendarEvent) => void, currentDate: Date }) => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); // 0 = Sunday
    const totalDays = endOfMonth.getDate();
    
    // Create grid array including padding days
    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    return (
        <div className="bg-white min-h-full flex flex-col">
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{day}</div>
                ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                {days.map((date, i) => {
                    if (!date) return <div key={i} className="bg-gray-50/30 border-b border-r border-gray-100 min-h-[120px]"></div>;
                    
                    const dayEvents = events.filter(e => isSameDate(new Date(e.start_time), date));
                    const isToday = isSameDate(date, new Date());

                    return (
                        <div key={i} className={`border-b border-r border-gray-100 p-2 min-h-[120px] transition-colors hover:bg-gray-50 ${isToday ? 'bg-blue-50/30' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                                    {date.getDate()}
                                </span>
                                {dayEvents.length > 0 && <span className="text-xs text-gray-400 font-medium">{dayEvents.length} events</span>}
                            </div>
                            
                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map(event => (
                                    <div 
                                        key={event.id}
                                        onClick={() => onEventClick(event)}
                                        className={`px-2 py-1 rounded text-xs truncate cursor-pointer hover:opacity-80 border-l-2 ${EVENT_COLORS[event.event_type] || 'bg-gray-100 border-gray-300'}`}
                                        style={{ borderLeftWidth: '3px' }}
                                    >
                                        {new Date(event.start_time).toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})} {event.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-xs text-gray-400 pl-2">+ {dayEvents.length - 3} more</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CreateEventModal = ({ onClose, onCreate, initialDate }: { onClose: () => void, onCreate: (data: Partial<CalendarEvent>) => void, initialDate: Date }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('interview');
    const [date, setDate] = useState(initialDate.toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [description, setDescription] = useState('');
    const [attendees, setAttendees] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);
        
        onCreate({
            title,
            description,
            event_type: type as any,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            attendees: attendees.split(',').map(email => ({ email: email.trim() })),
            status: 'confirmed'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Create New Event</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-900"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Title</label>
                        <input required className="w-full p-3 border border-gray-200 rounded-xl" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Interview with John" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                             <input type="date" required className="w-full p-3 border border-gray-200 rounded-xl" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                             <select className="w-full p-3 border border-gray-200 rounded-xl bg-white" value={type} onChange={e => setType(e.target.value)}>
                                 <option value="interview">Interview</option>
                                 <option value="screening">Screening</option>
                                 <option value="technical_test">Technical Test</option>
                                 <option value="sync">Sync</option>
                             </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                             <input type="time" required className="w-full p-3 border border-gray-200 rounded-xl" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                             <input type="time" required className="w-full p-3 border border-gray-200 rounded-xl" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                        <textarea className="w-full p-3 border border-gray-200 rounded-xl h-24" value={description} onChange={e => setDescription(e.target.value)} placeholder="Agenda, notes..." />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Attendees (comma separated emails)</label>
                        <input className="w-full p-3 border border-gray-200 rounded-xl" value={attendees} onChange={e => setAttendees(e.target.value)} placeholder="jane@example.com, bob@example.com" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black shadow-lg">Create Event</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EventDetailModal = ({ event, onClose, onDelete }: { event: CalendarEvent, onClose: () => void, onDelete: (id: string) => void }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className={`p-6 border-b border-gray-100 flex justify-between items-start ${EVENT_COLORS[event.event_type].split(' ')[0]}`}>
                    <div>
                         <span className="inline-block px-2 py-0.5 rounded bg-white/50 text-xs font-bold uppercase mb-2 backdrop-blur-sm border border-black/5">
                             {event.event_type.replace('_', ' ')}
                         </span>
                         <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    </div>
                    <button onClick={onClose} className="bg-white/50 hover:bg-white rounded-full p-1 transition-colors"><X className="w-5 h-5 text-gray-600"/></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-3 text-gray-400"/>
                        <div>
                            <div className="font-bold text-gray-900">
                                {new Date(event.start_time).toLocaleDateString(undefined, {weekday: 'long', month: 'long', day: 'numeric'})}
                            </div>
                            <div className="text-sm">
                                {new Date(event.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(event.end_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>

                    {event.video_link && (
                        <div className="flex items-center">
                            <Video className="w-5 h-5 mr-3 text-blue-500"/>
                            <a 
                                href={event.video_link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm text-center transition-colors shadow-sm flex items-center justify-center"
                            >
                                Join Google Meet <ExternalLink className="w-3 h-3 ml-2 opacity-70"/>
                            </a>
                        </div>
                    )}

                    {event.description && (
                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-100">
                            {event.description}
                        </div>
                    )}

                    {event.attendees && event.attendees.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center"><Users className="w-3 h-3 mr-1"/> Attendees</h4>
                            <div className="space-y-2">
                                {event.attendees.map((a: any, i: number) => (
                                    <div key={i} className="flex items-center text-sm">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 mr-2">
                                            {(a.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-gray-700">{a.email}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                        {event.is_synced ? 'Synced with Google Calendar' : 'Local Event'}
                    </span>
                    <button 
                        onClick={() => onDelete(event.id)} 
                        className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center transition-colors"
                    >
                        <Trash2 className="w-4 h-4 mr-2"/> Delete Event
                    </button>
                </div>
             </div>
        </div>
    );
};

// Utils
function getStartOfPeriod(date: Date, mode: ViewMode): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (mode === 'week') {
        const day = d.getDay();
        const diff = d.getDate() - day; // Adjust for week start
        d.setDate(diff);
    } else if (mode === 'month') {
        d.setDate(1);
    }
    return d;
}

function getEndOfPeriod(date: Date, mode: ViewMode): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    if (mode === 'week') {
        const day = d.getDay();
        const diff = d.getDate() + (6 - day);
        d.setDate(diff);
    } else if (mode === 'month') {
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
    }
    return d;
}

function formatDateRange(date: Date, mode: ViewMode): string {
    if (mode === 'day') return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    if (mode === 'month') return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    
    const start = getStartOfPeriod(date, 'week');
    const end = getEndOfPeriod(date, 'week');
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function getDaysInWeek(date: Date): Date[] {
    const start = getStartOfPeriod(date, 'week');
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
    });
}

function isSameDate(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function formatHour(h: number) {
    return h === 0 ? '12 AM' : h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
}

export default Schedule;
