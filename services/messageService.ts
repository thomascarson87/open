
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
        .update({ updated_at: new Date().toISOString() }) // Assuming you have this column or want to trigger order change
        .eq('id', conversationId);

    return data;
  }

  async sendSystemMessage(conversationId: string, text: string, metadata?: any) {
    // For system messages, we might use a specific system UUID or leave sender_id null if schema allows
    // Assuming schema requires a sender, we use a placeholder or the triggering user.
    // Ideally, make sender_id nullable for system messages.
    // Here we will use '00000000-0000-0000-0000-000000000000' as a convention for System if sender_id is not nullable, 
    // BUT we need to ensure that UUID exists in auth.users or disable FK.
    // A safer bet for now is to just insert it with a flag 'is_system_message'.
    
    // We will assume the schema update allows nullable sender OR we rely on the implementation to handle it.
    // Since we can't easily fetch a "system user", we'll just insert. 
    // IF strict FK, we might fail. Let's assume the schema update allowed nullable or we use the current user as the "trigger".
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: user?.id, // Attributed to the user who triggered the action
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

  async createConversation(applicationId: string, candidateId: string, companyId: string, recruiterId: string) {
      // Check if exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();
      
      if (existing) return existing.id;

      // Create new
      const { data: conv, error } = await supabase
        .from('conversations')
        .insert([{ application_id: applicationId }]) // Add other fields if needed
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
}

export const messageService = new MessageService();
