
import React, { useState, useEffect } from 'react';
import { X, Calendar as CalIcon, Clock, AlignLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { googleCalendar } from '../services/googleCalendar';
import { atsService } from '../services/atsService';
import { messageService } from '../services/messageService';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    onClose: () => void;
    onSchedule: (data: any) => Promise<void>;
    candidateId?: string; // Optional if pre-selected
    applicationId?: string;
}

const DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' }
];

const ScheduleCallModal: React.FC<Props> = ({ onClose, onSchedule, candidateId, applicationId }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [candidateEmail, setCandidateEmail] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [resolvedAppId, setResolvedAppId] = useState(applicationId);

    const [formData, setFormData] = useState({
        title: 'Interview',
        type: 'screening',
        date: '',
        time: '10:00',
        duration: 30,
        notes: ''
    });

    useEffect(() => {
        const fetchCandidateInfo = async () => {
            if (candidateId) {
                const { data } = await supabase.from('candidate_profiles').select('name, email').eq('id', candidateId).single();
                if (data) {
                    setCandidateEmail(data.email);
                    setCandidateName(data.name);
                    setFormData(prev => ({ ...prev, title: `Interview with ${data.name}` }));
                }

                if (!resolvedAppId) {
                    // Try to find application between recruiter's company jobs and this candidate
                    // Simplified: just find latest application for this candidate
                    const { data: app } = await supabase
                        .from('applications')
                        .select('id')
                        .eq('candidate_id', candidateId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();
                    
                    if (app) setResolvedAppId(app.id);
                }
            }
        };
        fetchCandidateInfo();
    }, [candidateId, resolvedAppId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60000);

        try {
            // 1. Create Event for Recruiter (Current User)
            const { data: recruiterEvent, error: err1 } = await supabase
                .from('calendar_events')
                .insert([{
                    user_id: user!.id,
                    title: formData.title,
                    description: formData.notes,
                    event_type: formData.type,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    attendees: candidateEmail ? [{ email: candidateEmail, name: candidateName }] : [],
                    application_id: resolvedAppId,
                    candidate_id: candidateId,
                    status: 'confirmed'
                }])
                .select()
                .single();

            if (err1) throw err1;

            // 2. Create Event for Candidate (if known)
            if (candidateId) {
                await supabase
                    .from('calendar_events')
                    .insert([{
                        user_id: candidateId, // The candidate sees this
                        title: formData.title,
                        description: formData.notes,
                        event_type: formData.type,
                        start_time: startDateTime.toISOString(),
                        end_time: endDateTime.toISOString(),
                        organizer_id: user!.id,
                        attendees: [{ email: user!.email }],
                        application_id: resolvedAppId,
                        status: 'pending'
                    }]);
            }

            // 3. Sync to Google Calendar (For Recruiter)
            let googleEventId = null;
            let meetLink = null;
            const { data: token } = await supabase.from('google_calendar_tokens').select('user_id').eq('user_id', user!.id).maybeSingle();
            
            if (token) {
                try {
                    googleEventId = await googleCalendar.createEvent(user!.id, {
                        title: formData.title,
                        description: formData.notes,
                        start: startDateTime,
                        end: endDateTime,
                        attendees: candidateEmail ? [candidateEmail] : [] // This sends Google Invite to candidate
                    });
                    
                    meetLink = await googleCalendar.getMeetLink(user!.id, googleEventId);
                    
                    // Update Recruiter Event with Google data
                    await supabase.from('calendar_events').update({
                        google_event_id: googleEventId,
                        video_link: meetLink || undefined,
                        is_synced: true
                    }).eq('id', recruiterEvent.id);

                } catch (gError) {
                    console.warn("Google Sync Failed", gError);
                }
            }

            // 4. Update ATS Status
            if (resolvedAppId) {
                await atsService.handleCalendarEventCreated(
                    resolvedAppId,
                    formData.type as any,
                    recruiterEvent.id,
                    user!.id
                );
            }

            // 5. Send Notification to Candidate
            if (candidateId) {
                await notificationService.createNotification(
                    candidateId,
                    'interview_scheduled',
                    'Interview Scheduled',
                    `${formData.title} scheduled for ${startDateTime.toLocaleDateString()} at ${startDateTime.toLocaleTimeString()}`,
                    '/schedule'
                );
            }

            // 6. Send System Message in Chat
            if (candidateId) {
                const convId = await messageService.getOrCreateConversation(user!.id, candidateId, resolvedAppId);
                await messageService.sendSystemMessage(
                    convId,
                    `📅 Interview Scheduled: ${formData.title} on ${startDateTime.toLocaleDateString()} at ${startDateTime.toLocaleTimeString()}`,
                    { eventId: recruiterEvent.id, meetLink }
                );
            }

            // Refresh parent or close
            await onSchedule(recruiterEvent); // Pass data back to parent for state update if needed
            onClose();

        } catch (e) {
            console.error(e);
            alert('Failed to schedule event. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
                    <h3 className="text-lg font-bold">Schedule Interview</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-white"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {candidateName && (
                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 font-medium mb-2">
                            Scheduling with: <span className="font-bold">{candidateName}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Interview Type</label>
                        <select 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                            value={formData.type}
                            onChange={e => {
                                const type = e.target.value;
                                let title = candidateName ? `Interview with ${candidateName}` : 'Interview';
                                if (type === 'screening') title = candidateName ? `Phone Screen: ${candidateName}` : 'Phone Screen';
                                if (type === 'technical_test') title = candidateName ? `Tech Interview: ${candidateName}` : 'Technical Interview';
                                setFormData({...formData, type, title});
                            }}
                        >
                            <option value="screening">Phone Screen</option>
                            <option value="technical_test">Technical Interview</option>
                            <option value="final_round">Final Round</option>
                            <option value="sync">Sync / Catch-up</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Title</label>
                        <input 
                            required 
                            className="w-full p-3 border border-gray-200 rounded-xl" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                             <input 
                                type="date" 
                                required 
                                className="w-full p-3 border border-gray-200 rounded-xl" 
                                value={formData.date} 
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                             <input 
                                type="time" 
                                required 
                                className="w-full p-3 border border-gray-200 rounded-xl" 
                                value={formData.time} 
                                onChange={e => setFormData({...formData, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration</label>
                         <select
                            className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                            value={formData.duration}
                            onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                         >
                             {DURATIONS.map(d => (
                                 <option key={d.value} value={d.value}>{d.label}</option>
                             ))}
                         </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes / Agenda</label>
                        <textarea 
                            className="w-full p-3 border border-gray-200 rounded-xl h-20 text-sm" 
                            value={formData.notes} 
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                            placeholder="Agenda notes..."
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center disabled:opacity-50"
                        >
                            {loading ? 'Scheduling...' : <><CheckCircle className="w-4 h-4 mr-2"/> Confirm & Send Invites</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleCallModal;
