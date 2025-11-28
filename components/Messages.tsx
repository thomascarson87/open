
import React, { useState, useEffect } from 'react';
import { Search, Send, MoreVertical, Phone, Video, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationStatus } from '../types';

interface Conversation {
    id: string;
    participant_name: string;
    last_message: string;
    updated_at: string;
    unread_count: number;
    status?: ApplicationStatus; // Optional, derived from application state if joined
}

const STATUS_LABELS: Record<string, string> = {
    'screening': 'Screening',
    'hr_interview': 'HR Interview',
    'technical_test': 'Tech Test',
    'manager_interview': 'Manager Int.',
    'exec_interview': 'Exec Stage',
    'offer': 'Offer',
    'contracting': 'Contracting',
    'hired': 'Hired'
};

const STATUS_COLORS: Record<string, string> = {
    'screening': 'bg-blue-100 text-blue-700',
    'hr_interview': 'bg-indigo-100 text-indigo-700',
    'technical_test': 'bg-purple-100 text-purple-700',
    'manager_interview': 'bg-orange-100 text-orange-700',
    'exec_interview': 'bg-violet-100 text-violet-700',
    'offer': 'bg-green-100 text-green-700',
    'contracting': 'bg-teal-100 text-teal-700',
    'hired': 'bg-emerald-100 text-emerald-700'
};

const Messages: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    useEffect(() => {
        if (activeId) {
            fetchMessages(activeId);
        }
    }, [activeId]);

    const fetchConversations = async () => {
        setLoading(true);
        // For the MVP, we assume a 'conversations' table exists or we simulate fetch.
        // In a real app with the schema provided, you'd join conversation_participants.
        
        // Simulating fetch for now as the SQL creates empty tables.
        // In production, this would query supabase.from('conversations')...
        const mockConvos: Conversation[] = [
            { id: '1', participant_name: "Sarah Design", last_message: "Thanks for the update!", updated_at: "10:30 AM", unread_count: 2, status: 'manager_interview' },
            { id: '2', participant_name: "TechFlow Recruiter", last_message: "When are you available?", updated_at: "Yesterday", unread_count: 0, status: 'screening' }
        ];
        
        // Try real fetch
        const { data, error } = await supabase.from('conversations').select('*');
        if (data && data.length > 0) {
             // Logic to process real data would go here
             // setConversations(data)
             setConversations(mockConvos); // Keeping mock for immediate UI feedback if DB is empty
        } else {
             setConversations(mockConvos);
        }
        setLoading(false);
    };

    const fetchMessages = async (convId: string) => {
        // Fetch messages for conversation
        // const { data } = await supabase.from('messages').select('*').eq('conversation_id', convId);
        setMessages([
            { id: 1, text: "Hi! I saw the job posting for the Senior Frontend role. Is it still open?", sender: 'other', time: '10:00 AM' },
            { id: 2, text: "Yes, it is! We'd love to see your portfolio.", sender: 'me', time: '10:05 AM' }
        ]);
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;
        // await supabase.from('messages').insert([{ conversation_id: activeId, text: inputText, sender_id: user?.id }]);
        setMessages([...messages, { id: Date.now(), text: inputText, sender: 'me', time: 'Now' }]);
        setInputText("");
    };

    const activeConversation = activeId ? conversations.find(c => c.id === activeId) : null;

    // Mobile Navigation Logic:
    // If activeId is set, show Chat (hide list on mobile).
    // If activeId is null, show List (hide chat on mobile).
    // On Desktop (md+), show both.

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
                    ) : (
                        conversations.map(c => (
                            <div 
                                key={c.id} 
                                onClick={() => setActiveId(c.id)}
                                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${activeId === c.id ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-semibold text-sm ${activeId === c.id ? 'text-blue-900' : 'text-gray-900'}`}>{c.participant_name}</span>
                                    <span className="text-xs text-gray-400">{c.updated_at}</span>
                                </div>
                                
                                {c.status && STATUS_LABELS[c.status] && (
                                    <div className="mb-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[c.status]}`}>
                                            {STATUS_LABELS[c.status]}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 truncate w-40">{c.last_message}</p>
                                    {c.unread_count > 0 && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{c.unread_count}</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex-col bg-white h-full ${activeId ? 'flex' : 'hidden md:flex'}`}>
                {activeConversation ? (
                    <>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center space-x-3">
                                 {/* Back Button for Mobile */}
                                 <button 
                                    onClick={() => setActiveId(null)} 
                                    className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                                 >
                                     <ArrowLeft className="w-5 h-5" />
                                 </button>

                                 <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                     {activeConversation.participant_name.charAt(0)}
                                 </div>
                                 <div className="min-w-0">
                                     <h3 className="font-bold text-gray-900 truncate">{activeConversation.participant_name}</h3>
                                     <div className="flex items-center gap-2">
                                        <p className="text-xs text-green-600 flex items-center flex-shrink-0"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Online</p>
                                     </div>
                                 </div>
                            </div>
                            <div className="flex space-x-1 sm:space-x-2 text-gray-400">
                                <button className="p-2 hover:bg-gray-100 rounded-full"><Phone className="w-5 h-5"/></button>
                                <button className="p-2 hover:bg-gray-100 rounded-full"><Video className="w-5 h-5"/></button>
                                <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5"/></button>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
                             {messages.map((msg) => (
                                 <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`p-3 rounded-2xl shadow-sm text-sm max-w-[85%] sm:max-w-sm ${
                                         msg.sender === 'me' 
                                         ? 'bg-gray-900 text-white rounded-tr-none' 
                                         : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                                     }`}>
                                         {msg.text}
                                     </div>
                                 </div>
                             ))}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder="Type a message..." 
                                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                />
                                <button onClick={sendMessage} className="p-3 bg-gray-900 hover:bg-black text-white rounded-lg transition-colors flex-shrink-0">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-medium">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages;
