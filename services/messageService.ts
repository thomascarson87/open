import { supabase } from './supabaseClient';

class MessageService {
  
  async sendMessage(conversationId: string, senderId: string, text: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        text: text,
        is_read: false
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Update conversation timestamp
    await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() }) 
        .eq('id', conversationId);

    return data;
  }

  async sendSystemMessage(conversationId: string, text: string, metadata?: any) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: user?.id,
        text: text,
        is_read: false,
        is_system_message: true,
        metadata: metadata
      }])
      .select()
      .single();

    if (error) {
        console.error('Failed to send system message', error);
    }
    return data;
  }

  async createConversation(applicationId: string | null, candidateId: string, recruiterId: string) {
      // Create new conversation
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert([{ application_id: applicationId }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Add participants
      await supabase.from('conversation_participants').insert([
          { conversation_id: conv.id, user_id: candidateId },
          { conversation_id: conv.id, user_id: recruiterId }
      ]);
      
      return conv.id;
  }

  async getOrCreateConversation(
    recruiterId: string, 
    candidateId: string, 
    applicationId: string | null = null, 
    jobId: string | null = null
  ): Promise<string> {
    // 1. First, try to find existing conversation for this application
    if (applicationId) {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();
      
      if (existingConv) return existingConv.id;
    }

    // 2. Try to find existing conversation between these two users
    const { data: existingParticipation } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', candidateId);

    if (existingParticipation && existingParticipation.length > 0) {
      const convIds = existingParticipation.map(p => p.conversation_id);
      
      const { data: matchingConv } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', recruiterId)
        .in('conversation_id', convIds)
        .limit(1)
        .maybeSingle();

      if (matchingConv) {
        // If we found a general conversation but now have an application context, link it
        if (applicationId) {
          await supabase
            .from('conversations')
            .update({ application_id: applicationId })
            .eq('id', matchingConv.conversation_id)
            .is('application_id', null);
        }
        return matchingConv.conversation_id;
      }
    }

    // 3. Create new conversation
    return await this.createConversation(applicationId, candidateId, recruiterId);
  }
}

export const messageService = new MessageService();
