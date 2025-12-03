
import { supabase } from './supabaseClient';
import { Notification } from '../types';

class NotificationService {
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    description: string,
    link?: string,
    metadata: any = {}
  ) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        description,
        link,
        metadata,
        is_read: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Failed to create notification', error);
      throw error;
    }
    return data;
  }

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    
    if (error) throw error;
  }

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
  }
}

export const notificationService = new NotificationService();
