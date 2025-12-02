import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, MessageSquare, Loader2, Calendar, Phone, Paperclip } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationStatus, Conversation, Message } from '../types';
import StatusBadge from './StatusBadge';
import ScheduleCallModal from './ScheduleCallModal';
import { messageService } from '../services/messageService';
import { atsService } from '../services/atsService';
import { googleCalendar } from '../services/googleCalendar';

const Messages: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    
    // For auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (user) {
            fetchConversations();
            
            // Real-time subscription for new messages
            const subscription = supabase
                .channel('public:messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                    // Payload is raw DB data (snake_case)
                    const newRecord = payload.new as any;
                    
                    if (newRecord.conversation_id === activeId) {
                        const newMsg: Message = {
                            id: newRecord.id,
                            conversationId: newRecord.conversation_id,
                            senderId: newRecord.sender_id,
                            text: newRecord.text,
                            timestamp: newRecord.created_at,
                            isRead: newRecord.is_read,
                            isSystemMessage: newRecord.is_system_message,
                            metadata: newRecord.metadata
                        };
                        setMessages(prev => [...prev, newMsg]);
                        scrollToBottom();
                    }
                    // Refresh conversations list to update last message
                    fetchConversations();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [user, activeId]);

    useEffect(() => {
        if (activeId) {
            fetchMessages(activeId);
        }
    }, [activeId]);

    const fetchConversations = async () => {
        setLoading(true);
        // We need to fetch conversations and join with applications/jobs/profiles to get names
        // Since Supabase doesn't do deep nested joins easily on 'conversations' without Views,
        // we will fetch basic conversation info and then hydrate names.
        // A proper solution would use a Postgres View.
        
        // MVP: Fetch conversation_participants to find conversations for this user
        const { data: participations, error } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user?.id);

        if (!participations || participations.length === 0) {
            setConversations([]);
            setLoading(false);
            return;
        }

        const convIds = participations.map(p => p.conversation_id);
        
        // Fetch conversations details
        const { data: convData } = await supabase
            .from('conversations')
            .select('*')
            .in('id', convIds)
            .order('updated_at', { ascending: false }); // Assuming updated_at exists or use created_at

        if (!convData) {
            setLoading(false);
            return;
        }

        // Hydrate with other participant info & application details
        const hydrated: Conversation[] = await Promise.all(convData.map(async (c: any) => {
            // Get other participant
            const { data: parts } = await supabase
                .from('conversation_participants')
                .select('user_id')
                .eq('conversation_id', c.id)
                .neq('user_id', user?.id)
                .single();
            
            // Try to get name from profiles
            let name = 'Unknown User';
            let avatar = undefined;
            
            if (parts) {
                // Try candidate
                const { data: cand } = await supabase.from('candidate_profiles').select('name, avatar_urls').eq('id', parts.user_id).maybeSingle();
                if (cand) {
                    name = cand.name;
                    avatar = cand.avatar_urls?.[0];
                } else {
                    // Try company team member (if we had a users table link, but simplified here)
                    // For now, if no candidate profile, maybe a recruiter?
                    // Fetch from team_members isn't direct by user_id easily without knowing company.
                    // Fallback to auth metadata if possible, but RLS blocks auth.users select usually.
                    name = 'Recruiter / User';
                }
            }

            // Get last message
            const { data: lastMsgData } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', c.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
                
            const lastMsg: Message = lastMsgData ? {
                id: lastMsgData.id,
                conversationId: lastMsgData.conversation_id,
                senderId: lastMsgData.sender_id,
                text: lastMsgData.text,
                timestamp: lastMsgData.created_at,
                isRead: lastMsgData.is_read,
                isSystemMessage: lastMsgData.is_system_message,
                metadata: lastMsgData.metadata
            } : { id: '0', conversationId: c.id, senderId: '', text: 'No messages yet', timestamp: c.created_at, isRead: true, isSystemMessage: false };

            // Get Application info if linked
            let jobTitle = '';
            let appStatus: ApplicationStatus = 'applied';
            if (c.application_id) {
                const { data: app } = await supabase
                    .from('applications')
                    .select('status, jobs(title)')
                    .eq('id', c.application_id)
                    .single();
                
                if (app) {
                    appStatus = app.status;
                    jobTitle = (app.jobs as any)?.title;
                }
            }

            return {
                id: c.id,
                participants: [{ id: parts?.user_id, name, avatar }],
                lastMessage: lastMsg,
                unreadCount: 0, // Todo: implement read receipts logic
                applicationId: c.application_id,
                jobTitle,
                // store status in a way we can use
                ...c,
                status: appStatus
            };
        }));

        setConversations(hydrated);
        setLoading(false);
    };

    const fetchMessages = async (convId: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });
            
        if (data) {
            // Map DB snake_case to Model camelCase
            const mappedMessages: Message[] = data.map((m: any) => ({
                id: m.id,
                conversationId: m.conversation_id,
                senderId: m.sender_id,
                text: m.text,
                timestamp: m.created_at,
                isRead: m.is_read,
                isSystemMessage: m.is_system_message,
                metadata: m.metadata
            }));
            setMessages(mappedMessages);
            scrollToBottom();
            
            // Mark as read (simplified)
            // supabase.from('messages').update({ is_read: true }).eq('conversation_id', convId).neq('sender_id', user?.id)
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeId) return;
        
        try {
            // Optimistic update
            const tempMsg: Message = {
                id: Date.now().toString(),
                conversationId: activeId,
                senderId: user!.id,
                text: inputText,
                timestamp: new Date().toISOString(),
                isRead: false,
                isSystemMessage: false
            };
            setMessages(prev => [...prev, tempMsg]);
            setInputText("");
            scrollToBottom();

            await messageService.sendMessage(activeId, user!.id, tempMsg.text);
            
            // ATS Detection
            const activeConv = conversations.find(c => c.id === activeId);
            if (activeConv?.applicationId) {
                // Determine user type (rough check)
                const userType = activeConv.participants[0].name === 'Recruiter / User' ? 'candidate' : 'recruiter'; // Inverted logic: if partner is recruiter, I am candidate
                // Actually easier: Check my own role
                // For now, let's assume if I am in 'candidate_profiles', I am candidate.
                const { data: meCand } = await supabase.from('candidate_profiles').select('id').eq('id', user?.id).maybeSingle();
                const myRole = meCand ? 'candidate' : 'recruiter';

                await atsService.detectStatusFromMessage(
                    activeConv.applicationId,
                    tempMsg.text,
                    user!.id,
                    myRole
                );
            }

        } catch (error) {
            console.error(error);
        }
    };

    const handleSchedule = async (data: any) => {
        if (!activeId || !user) return;
        
        const activeConv = conversations.find(c => c.id === activeId);
        if (!activeConv?.applicationId) {
            alert("This conversation is not linked to an application.");
            return;
        }

        // 1. Create Calendar Event
        const startDateTime = new Date(`${data.date}T${data.time}`);
        const endDateTime = new Date(startDateTime.getTime() + data.duration * 60000);

        try {
            // Create in DB
            const { data: eventData, error } = await supabase
                .from('calendar_events')
                .insert([{
                    user_id: user.id,
                    title: data.title,
                    description: data.notes,
                    event_type: data.type,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                    application_id: activeConv.applicationId,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) throw error;

            // Sync Google if connected (Simple fire and forget here or await)
            try {
                // Check if connected first to avoid error spam
                const { data: token } = await supabase.from('google_calendar_tokens').select('user_id').eq('user_id', user.id).single();
                if (token) {
                    const googleId = await googleCalendar.createEvent(user.id, {
                        title: data.title,
                        description: data.notes,
                        start: startDateTime,
                        end: endDateTime
                    });
                    
                    const meetLink = await googleCalendar.getMeetLink(user.id, googleId);
                    
                    // Update event with link
                    await supabase.from('calendar_events').update({
                        google_event_id: googleId,
                        video_link: meetLink || undefined,
                        is_synced: true
                    }).eq('id', eventData.id);
                }
            } catch (gError) {
                console.warn("Google Sync Failed", gError);
            }

            // 2. Trigger ATS Update
            await atsService.handleCalendarEventCreated(
                activeConv.applicationId,
                data.type,
                eventData.id,
                user.id
            );

            // 3. Send System Message
            await messageService.sendSystemMessage(
                activeId,
                `📅 Interview Scheduled: ${data.title} on ${new Date(startDateTime).toLocaleDateString()} at ${data.time}`,
                { eventId: eventData.id }
            );

            setShowScheduleModal(false);

        } catch (err) {
            console.error(err);
            alert("Failed to schedule.");
        }
    };

    const activeConversation = activeId ? conversations.find(c => c.id === activeId) : null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex overflow-hidden">
            
            {/* Sidebar (List View) */}
            <div className={`flex flex-col border-r border-gray-200 w-full md:w-80 h-full ${activeId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20"/>
                            No conversations yet. Apply to jobs or start reaching out!
                        </div>
                    ) : (
                        conversations.map(c => (
                            <div 
                                key={c.id} 
                                onClick={() => setActiveId(c.id)}
                                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${activeId === c.id ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-semibold text-sm truncate ${activeId === c.id ? 'text-blue-900' : 'text-gray-900'}`}>{c.participants[0]?.name || 'User'}</span>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                        {new Date((c.lastMessage as any).timestamp || (c.lastMessage as any).created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                    </span>
                                </div>
                                <div className="text-xs text-blue-600 font-medium mb-1 truncate">{c.jobTitle}</div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 truncate w-40">{c.lastMessage.text}</p>
                                    {(c as any).status && <StatusBadge status={(c as any).status} size="sm" />}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex-col bg-white h-full ${activeId ? 'flex' : 'hidden md:flex'}`}>
                {activeConversation || activeId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center space-x-3">
                                 <button 
                                    onClick={() => setActiveId(null)} 
                                    className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                                 >
                                     <ArrowLeft className="w-5 h-5" />
                                 </button>

                                 <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                     {activeConversation?.participants[0]?.avatar ? (
                                         <img src={activeConversation.participants[0].avatar} className="w-full h-full object-cover" />
                                     ) : (
                                         <span className="font-bold text-gray-500">{activeConversation?.participants[0]?.name?.charAt(0)}</span>
                                     )}
                                 </div>
                                 <div className="min-w-0">
                                     <h3 className="font-bold text-gray-900 truncate">{activeConversation?.participants[0]?.name}</h3>
                                     <div className="flex items-center text-xs text-gray-500">
                                         <span className="truncate max-w-[150px]">{activeConversation?.jobTitle}</span>
                                         {(activeConversation as any).status && (
                                            <>
                                                <span className="mx-2">•</span>
                                                <StatusBadge status={(activeConversation as any).status} size="sm"/>
                                            </>
                                         )}
                                     </div>
                                 </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setShowScheduleModal(true)}
                                    className="hidden sm:flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors"
                                >
                                    <Calendar className="w-4 h-4 mr-2" /> Schedule Call
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                    <Phone className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Messages List */}
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
                             {messages.map((msg) => {
                                 if (msg.isSystemMessage) {
                                     return (
                                         <div key={msg.id} className="flex justify-center my-4">
                                             <div className="bg-gray-200/50 text-gray-600 text-xs px-3 py-1 rounded-full font-medium flex items-center">
                                                 {msg.text}
                                             </div>
                                         </div>
                                     );
                                 }
                                 
                                 const isMe = msg.senderId === user?.id;
                                 return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-2xl shadow-sm text-sm max-w-[85%] sm:max-w-md ${
                                            isMe
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                        }`}>
                                            {msg.text}
                                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                 );
                             })}
                             <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder="Type a message..." 
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button 
                                    onClick={handleSendMessage} 
                                    disabled={!inputText.trim()}
                                    className="p-3 bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white rounded-xl transition-colors flex-shrink-0 shadow-sm"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">Your Inbox</h3>
                        <p className="font-medium text-sm">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <ScheduleCallModal 
                    onClose={() => setShowScheduleModal(false)} 
                    onSchedule={handleSchedule}
                />
            )}
        </div>
    );
}

export default Messages;
