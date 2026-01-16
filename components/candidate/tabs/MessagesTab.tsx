import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '../../../services/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { messageService } from '../../../services/messageService';
import { ApplicationHubItem, Message } from '../../../types';

interface MessagesTabProps {
  application: ApplicationHubItem;
  onConversationCreated?: (conversationId: string) => void;
}

const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const MessagesTab: React.FC<MessagesTabProps> = ({ application, onConversationCreated }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(application.conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load messages
  useEffect(() => {
    if (conversationId) {
      loadMessages().catch(console.error);
      markMessagesAsRead().catch(console.error);
    } else {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new as any;
        setMessages(prev => [...prev, {
          id: newMessage.id,
          conversationId: newMessage.conversation_id,
          senderId: newMessage.sender_id,
          text: newMessage.text,
          timestamp: newMessage.created_at,
          isRead: newMessage.is_read,
          isSystemMessage: newMessage.is_system_message,
          metadata: newMessage.metadata
        }]);
        
        // Mark as read if not from current user
        if (newMessage.sender_id !== user?.id) {
          markMessagesAsRead().catch(console.error);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, user?.id]);

  // Scroll to bottom when messages load or update
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const loadMessages = async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          text: m.text,
          timestamp: m.created_at,
          isRead: m.is_read,
          isSystemMessage: m.is_system_message,
          metadata: m.metadata
        })));
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!conversationId || !user) return;
    
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (err) {
      console.warn('Failed to mark messages as read:', err);
    }
  };

  const startConversation = async () => {
    if (!user) return;
    
    try {
      // Get or create conversation with the company
      const newConvId = await messageService.getOrCreateConversation(
        application.job.company_id,
        user.id,
        application.id,
        application.job_id
      );
      
      setConversationId(newConvId);
      onConversationCreated?.(newConvId);
      return newConvId;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start conversation. Please try again.');
      return null;
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    let currentConvId = conversationId;
    
    try {
      // If no conversation, create one first
      if (!currentConvId) {
        currentConvId = await startConversation();
      }

      if (!currentConvId) return;

      setIsSending(true);
      const messageText = inputText.trim();
      setInputText('');

      await messageService.sendMessage(currentConvId, user.id, messageText);
      // Message will appear via real-time subscription
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage().catch(console.error);
    }
  };

  // No conversation yet - show start prompt
  if (!conversationId && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Start a Conversation</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">
          Send a message to the hiring team at {application.job.company_name}
        </p>
        <div className="w-full max-w-sm">
          <input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your first message..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
          />
          <button
            onClick={() => sendMessage().catch(console.error)}
            disabled={!inputText.trim() || isSending}
            className="w-full mt-3 px-4 py-3 bg-gray-900 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-black transition-colors"
          >
            {isSending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isOwn = msg.senderId === user?.id;
              const msgDate = new Date(msg.timestamp);
              const prevMsgDate = index > 0 ? new Date(messages[index - 1].timestamp) : null;
              const showTimestamp = !prevMsgDate || (msgDate.getTime() - prevMsgDate.getTime()) > 300000; // 5 min gap

              return (
                <React.Fragment key={msg.id}>
                  {showTimestamp && (
                    <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-4">
                      {formatMessageTime(msg.timestamp)}
                    </div>
                  )}
                  
                  {msg.isSystemMessage ? (
                    <div className="flex justify-center my-2">
                      <div className="px-4 py-1.5 bg-gray-200/50 backdrop-blur-sm rounded-full text-[11px] font-bold text-gray-600 border border-gray-200">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`
                          max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm
                          ${isOwn
                            ? 'bg-gray-900 text-white rounded-br-md'
                            : 'bg-white border border-gray-100 text-gray-900 rounded-bl-md'
                          }
                        `}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} className="h-4" />
          </>
        )}
      </div>

      {/* Input - Sticky at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 px-5 py-3 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-50 text-sm font-medium"
          />
          <button
            onClick={() => sendMessage().catch(console.error)}
            disabled={!inputText.trim() || isSending}
            className="p-3 bg-blue-600 text-white rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors flex-shrink-0 shadow-md active:scale-95"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesTab;
