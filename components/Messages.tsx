import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, ArrowLeft, MessageSquare, Loader2, Calendar, Phone, Paperclip, Plus, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationStatus, Conversation, Message } from '../types';
import StatusBadge from './StatusBadge';
import ScheduleCallModal from './ScheduleCallModal';
import { messageService } from '../services/messageService';
import { useSearchParams } from '../hooks/useSearchParams';

const Messages: React.FC = () => {
    const { user } = useAuth();
    
    const [searchParams] = useSearchParams();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
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
        if (urlConvId && !loading) {
            // Check if it exists in loaded conversations, if not, we might need to wait or it will select when loaded
            if (conversations.some(c => c.id === urlConvId)) {
                selectConversation(urlConvId);
            }
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
                    // Update only the affected conversation's snippet in-place (avoids N+1 refetch)
                    setConversations(prev => prev.map(c =>
                        c.id === newRecord.conversation_id
                            ? {
                                ...c,
                                lastMessage: { text: newRecord.text, timestamp: newRecord.created_at },
                                unreadCount: newRecord.conversation_id === activeId
                                    ? c.unreadCount
                                    : (newRecord.sender_id !== user?.id ? c.unreadCount + 1 : c.unreadCount)
                              }
                            : c
                    ));
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
        // Fetch conversation participations for current user
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
             // Get the OTHER participant
             const { data: parts } = await supabase.from('conversation_participants').select('user_id').eq('conversation_id', c.id).neq('user_id', user?.id).single();
             
             let name = 'User';
             let avatar = undefined;
             
             if (parts) {
                 // Try fetching from candidate_profiles first
                 const { data: cand } = await supabase.from('candidate_profiles').select('name, avatar_urls').eq('id', parts.user_id).maybeSingle();
                 if (cand) { 
                     name = cand.name; 
                     avatar = cand.avatar_urls?.[0]; 
                 } else {
                     // Try company profile
                     const { data: comp } = await supabase.from('company_profiles').select('company_name, logo_url').eq('id', parts.user_id).maybeSingle();
                     if (comp) { 
                         name = comp.company_name; 
                         avatar = comp.logo_url; 
                     }
                 }
             }
             
             // Fetch last message and unread count in parallel
             const [lastMsgResult, unreadResult] = await Promise.all([
                 supabase.from('messages').select('*').eq('conversation_id', c.id).order('created_at', { ascending: false }).limit(1).single(),
                 supabase.from('messages').select('id', { count: 'exact', head: true }).eq('conversation_id', c.id).eq('is_read', false).neq('sender_id', user?.id)
             ]);
             const lastMsg = lastMsgResult.data;

             return {
                 id: c.id,
                 participants: [{ id: parts?.user_id, name, avatar }],
                 lastMessage: lastMsg ? { ...lastMsg, timestamp: lastMsg.created_at } : { text: 'No messages', timestamp: c.created_at },
                 unreadCount: unreadResult.count || 0,
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
            setTimeout(scrollToBottom, 100);
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
        if (!user) return;

        // Resolve the company ID for the current recruiter
        const { data: teamMember } = await supabase
            .from('team_members')
            .select('company_id')
            .eq('user_id', user.id)
            .maybeSingle();
        const companyId = teamMember?.company_id || user.id;

        const unique = new Map<string, any>();

        // 1. Candidates unlocked by this company
        const { data: unlocks } = await supabase
            .from('candidate_unlocks')
            .select('candidate_id')
            .eq('company_id', companyId);

        if (unlocks && unlocks.length > 0) {
            const candidateIds = unlocks.map(u => u.candidate_id);
            const { data: candidates } = await supabase
                .from('candidate_profiles')
                .select('id, name, headline, avatar_urls')
                .in('id', candidateIds);
            if (candidates) {
                for (const c of candidates) unique.set(c.id, c);
            }
        }

        // 2. Candidates who have applied to this company's jobs
        const { data: applicants } = await supabase
            .from('applications')
            .select('candidate:candidate_profiles!inner(id, name, headline, avatar_urls), job:jobs!inner(company_id)')
            .eq('jobs.company_id', companyId);
        if (applicants) {
            for (const a of applicants) {
                if (a.candidate && !unique.has(a.candidate.id)) {
                    unique.set(a.candidate.id, a.candidate);
                }
            }
        }

        setUnlockedCandidates(Array.from(unique.values()));
    };

    const startNewConversation = async (candidateId: string) => {
        const convId = await messageService.getOrCreateConversation(user!.id, candidateId);
        setShowNewMessageModal(false);
        selectConversation(convId);
        fetchConversations();
    };

    const selectConversation = (conversationId: string) => {
        setActiveId(conversationId);
        const conv = conversations.find(c => c.id === conversationId);
        if (conv?.participants?.[0]?.id) {
            setActiveCandidateId(conv.participants[0].id);
        }
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
                        title="New Message"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto text-gray-400"/></div> : 
                     conversations.length === 0 ? <div className="p-4 text-center text-gray-500 text-sm">No conversations yet.</div> :
                     conversations.map(c => (
                        <div key={c.id} onClick={() => selectConversation(c.id)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${activeId === c.id ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600 overflow-hidden">
                                    {c.participants[0]?.avatar ? <img src={c.participants[0].avatar} className="w-full h-full object-cover"/> : c.participants[0]?.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-gray-900 truncate">{c.participants[0]?.name}</div>
                                    <div className="text-xs text-gray-500 truncate">{c.lastMessage.text}</div>
                                </div>
                            </div>
                        </div>
                     ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex-col h-full ${activeId ? 'flex' : 'hidden md:flex'}`}>
                {activeId ? (
                    <>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <button onClick={() => { setActiveId(null); setActiveCandidateId(null); }} className="md:hidden"><ArrowLeft className="w-5 h-5"/></button>
                                <span className="font-bold">{conversations.find(c => c.id === activeId)?.participants[0]?.name}</span>
                            </div>
                            <button onClick={() => setShowScheduleModal(true)} className="bg-gray-100 p-2 rounded-lg hover:bg-gray-200" title="Schedule Interview"><Calendar className="w-4 h-4"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.isSystemMessage ? 'justify-center' : (msg.senderId === user?.id ? 'justify-end' : 'justify-start')}`}>
                                    <div className={`p-3 rounded-xl max-w-xs text-sm ${
                                        msg.isSystemMessage 
                                            ? 'bg-gray-200 text-center text-xs text-gray-600 w-full max-w-sm rounded-full' 
                                            : (msg.senderId === user?.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none')
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t flex gap-2 bg-white">
                            <input value={inputText} onChange={e => setInputText(e.target.value)} className="flex-1 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none" placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && handleSendMessage()}/>
                            <button onClick={handleSendMessage} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors"><Send className="w-4 h-4"/></button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="w-12 h-12 mb-2 opacity-20"/>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>

            {/* New Message Modal */}
            {showNewMessageModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 h-[60vh] flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">New Message</h3>
                            <button onClick={() => setShowNewMessageModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-900"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {unlockedCandidates.length > 0 ? (
                                unlockedCandidates.map(c => (
                                    <button key={c.id} onClick={() => startNewConversation(c.id)} className="w-full text-left p-3 hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors border border-transparent hover:border-gray-100">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 overflow-hidden">
                                            {c.avatar_urls?.[0] ? <img src={c.avatar_urls[0]} className="w-full h-full object-cover"/> : c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900">{c.name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{c.headline}</div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 mt-8">
                                    <p className="mb-2">No unlocked candidates.</p>
                                    <p className="text-xs">Unlock a candidate from the dashboard first.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {showScheduleModal && activeCandidateId && (
                <ScheduleCallModal 
                    onClose={() => setShowScheduleModal(false)} 
                    onSchedule={async () => { setShowScheduleModal(false); }} 
                    candidateId={activeCandidateId}
                />
            )}
        </div>
    );
};

export default Messages;
