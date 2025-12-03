
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Send, ArrowLeft, MessageSquare, Loader2, Calendar, Phone, Paperclip, Plus, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationStatus, Conversation, Message } from '../types';
import StatusBadge from './StatusBadge';
import ScheduleCallModal from './ScheduleCallModal';
import { messageService } from '../services/messageService';
import { atsService } from '../services/atsService';

const Messages: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    
    // New Message Modal
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [unlockedCandidates, setUnlockedCandidates] = useState<any[]>([]);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-select conversation from URL
    useEffect(() => {
        const urlConvId = searchParams.get('conversationId');
        if (urlConvId && !loading && conversations.some(c => c.id === urlConvId)) {
            setActiveId(urlConvId);
        }
    }, [searchParams, loading, conversations]);

    useEffect(() => {
        if (user) {
            fetchConversations();
            
            const subscription = supabase
                .channel('public:messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
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
        // ... (Logic to fetch conversations - same as before, simplified for this snippet)
        // Fetches conversation_participants -> conversations -> hydration
        const { data: participations } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user?.id);
        if (!participations || participations.length === 0) {
            setConversations([]);
            setLoading(false);
            return;
        }
        const convIds = participations.map(p => p.conversation_id);
        const { data: convData } = await supabase.from('conversations').select('*').in('id', convIds).order('updated_at', { ascending: false });

        if (!convData) { setLoading(false); return; }

        const hydrated = await Promise.all(convData.map(async (c: any) => {
             const { data: parts } = await supabase.from('conversation_participants').select('user_id').eq('conversation_id', c.id).neq('user_id', user?.id).single();
             let name = 'User';
             let avatar = undefined;
             if (parts) {
                 const { data: cand } = await supabase.from('candidate_profiles').select('name, avatar_urls').eq('id', parts.user_id).maybeSingle();
                 if (cand) { name = cand.name; avatar = cand.avatar_urls?.[0]; }
                 else {
                     // Try company profile if current user is candidate
                     const { data: comp } = await supabase.from('company_profiles').select('company_name, logo_url').eq('id', parts.user_id).maybeSingle();
                     if (comp) { name = comp.company_name; avatar = comp.logo_url; }
                 }
             }
             
             // Fetch last message
             const { data: lastMsg } = await supabase.from('messages').select('*').eq('conversation_id', c.id).order('created_at', { ascending: false }).limit(1).single();

             return {
                 id: c.id,
                 participants: [{ id: parts?.user_id, name, avatar }],
                 lastMessage: lastMsg ? { ...lastMsg, timestamp: lastMsg.created_at } : { text: 'No messages', timestamp: c.created_at },
                 unreadCount: 0,
                 applicationId: c.application_id
             };
        }));
        setConversations(hydrated as any);
        setLoading(false);
    };

    const fetchMessages = async (convId: string) => {
        const { data } = await supabase.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
        if (data) {
            setMessages(data.map((m: any) => ({
                id: m.id, conversationId: m.conversation_id, senderId: m.sender_id, text: m.text,
                timestamp: m.created_at, isRead: m.is_read, isSystemMessage: m.is_system_message, metadata: m.metadata
            })));
            scrollToBottom();
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeId) return;
        const tempMsg = {
            id: Date.now().toString(), conversationId: activeId, senderId: user!.id, text: inputText,
            timestamp: new Date().toISOString(), isRead: false, isSystemMessage: false
        };
        setMessages(prev => [...prev, tempMsg]);
        setInputText("");
        scrollToBottom();
        await messageService.sendMessage(activeId, user!.id, tempMsg.text);
    };

    const loadUnlockedCandidates = async () => {
        // Fetch candidates that are unlocked
        const { data } = await supabase.from('candidate_profiles').select('id, name, headline, avatar_urls').eq('is_unlocked', true);
        if (data) setUnlockedCandidates(data);
    };

    const startNewConversation = async (candidateId: string) => {
        const convId = await messageService.getOrCreateConversation(user!.id, candidateId);
        setShowNewMessageModal(false);
        setActiveId(convId);
        fetchConversations();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] flex overflow-hidden">
            {/* Sidebar */}
            <div className={`flex flex-col border-r border-gray-200 w-full md:w-80 h-full ${activeId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                    <button 
                        onClick={() => { loadUnlockedCandidates(); setShowNewMessageModal(true); }}
                        className="p-2 bg-gray-900 text-white rounded-full hover:bg-black transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto"/></div> : 
                     conversations.map(c => (
                        <div key={c.id} onClick={() => setActiveId(c.id)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${activeId === c.id ? 'bg-blue-50' : ''}`}>
                            <div className="font-bold text-sm text-gray-900">{c.participants[0]?.name}</div>
                            <div className="text-xs text-gray-500 truncate">{c.lastMessage.text}</div>
                        </div>
                     ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex-col h-full ${activeId ? 'flex' : 'hidden md:flex'}`}>
                {activeId ? (
                    <>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <button onClick={() => setActiveId(null)} className="md:hidden"><ArrowLeft className="w-5 h-5"/></button>
                            <span className="font-bold">{conversations.find(c => c.id === activeId)?.participants[0]?.name}</span>
                            <button onClick={() => setShowScheduleModal(true)} className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200"><Calendar className="w-4 h-4"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-lg max-w-xs text-sm ${msg.isSystemMessage ? 'bg-gray-200 text-center text-xs w-full max-w-none' : (msg.senderId === user?.id ? 'bg-blue-600 text-white' : 'bg-white border')}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t flex gap-2">
                            <input value={inputText} onChange={e => setInputText(e.target.value)} className="flex-1 p-2 border rounded-lg" placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSendMessage()}/>
                            <button onClick={handleSendMessage} className="bg-blue-600 text-white p-2 rounded-lg"><Send className="w-4 h-4"/></button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation</div>
                )}
            </div>

            {/* New Message Modal */}
            {showNewMessageModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">New Message</h3>
                            <button onClick={() => setShowNewMessageModal(false)}><X className="w-5 h-5"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {unlockedCandidates.map(c => (
                                <button key={c.id} onClick={() => startNewConversation(c.id)} className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                                        {c.avatar_urls?.[0] ? <img src={c.avatar_urls[0]} className="w-full h-full rounded-full object-cover"/> : c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{c.name}</div>
                                        <div className="text-xs text-gray-500">{c.headline}</div>
                                    </div>
                                </button>
                            ))}
                            {unlockedCandidates.length === 0 && <div className="text-center text-gray-500 mt-4">No unlocked candidates found.</div>}
                        </div>
                    </div>
                </div>
            )}
            
            {showScheduleModal && <ScheduleCallModal onClose={() => setShowScheduleModal(false)} onSchedule={async () => {}} />}
        </div>
    );
};

export default Messages;
