
import { supabase } from './supabaseClient';
import { messageService } from './messageService';
import { ApplicationStatus } from '../types';

interface StatusChangeParams {
  applicationId: string;
  newStatus: ApplicationStatus;
  changedBy: string;
  changeType: 'manual' | 'automatic' | 'system';
  triggerSource?: string;
  triggerId?: string;
  notes?: string;
  sendChatNotification?: boolean;
}

class ATSService {
  /**
   * Update application status and create history record
   */
  async updateApplicationStatus(params: StatusChangeParams): Promise<void> {
    const { applicationId, newStatus, changedBy, changeType, triggerSource, triggerId, notes, sendChatNotification = true } = params;

    // Get current status
    const { data: application } = await supabase
      .from('applications')
      .select('status, conversation_id, candidate_id')
      .eq('id', applicationId)
      .single();

    if (!application) {
      console.error('Application not found', applicationId);
      return;
    }

    const oldStatus = application.status;

    if (oldStatus === newStatus) return; // No change

    // Update application status
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: newStatus,
        status_updated_at: new Date().toISOString(),
        status_updated_by: changedBy
      })
      .eq('id', applicationId);

    if (updateError) {
      throw new Error('Failed to update application status');
    }

    // Create history record
    await supabase
      .from('application_status_history')
      .insert([{
        application_id: applicationId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy,
        change_type: changeType,
        trigger_source: triggerSource,
        trigger_id: triggerId,
        notes
      }]);

    // Send system message in chat if conversation exists
    if (sendChatNotification) {
      // Find conversation if not provided in app record (backwards compatibility)
      let conversationId = application.conversation_id;
      
      if (!conversationId) {
          const { data: conv } = await supabase
            .from('conversations')
            .select('id')
            .eq('application_id', applicationId) // Assuming you have this link, or logic to find it
            .maybeSingle();
            
          // If we can't find a direct link, we might skip the message or try to find by participants
          // For now, assume conversation_id is linked or we skip.
      }

      if (conversationId) {
        const statusInfo = this.getStatusDisplayInfo(newStatus);
        const message = `Application status updated: ${statusInfo.label}`;
        
        await messageService.sendSystemMessage(
          conversationId,
          message
        );
      }
    }
  }

  /**
   * Handle calendar event creation → status update
   */
  async handleCalendarEventCreated(
    applicationId: string,
    eventType: 'screening' | 'technical_test' | 'interview' | 'final_round',
    eventId: string,
    recruiterId: string
  ): Promise<void> {
    const statusMap: Record<string, ApplicationStatus> = {
      screening: 'phone_screen_scheduled',
      technical_test: 'technical_scheduled',
      interview: 'final_round_scheduled', // Default interview to final round or adjust logic
      final_round: 'final_round_scheduled'
    };

    const newStatus = statusMap[eventType] || 'reviewing';

    await this.updateApplicationStatus({
      applicationId,
      newStatus,
      changedBy: recruiterId,
      changeType: 'automatic',
      triggerSource: 'calendar_event',
      triggerId: eventId,
      notes: `${eventType.replace('_', ' ')} scheduled`
    });
  }

  /**
   * Detect status change from chat message content
   */
  async detectStatusFromMessage(
    applicationId: string,
    messageContent: string,
    senderId: string,
    senderType: 'recruiter' | 'candidate'
  ): Promise<void> {
    const lowerContent = messageContent.toLowerCase();

    // Offer keywords
    if (senderType === 'recruiter' && (
      lowerContent.includes('offer you') ||
      lowerContent.includes('pleased to offer') ||
      lowerContent.includes('we would like to offer') ||
      lowerContent.includes('extend an offer')
    )) {
      await this.updateApplicationStatus({
        applicationId,
        newStatus: 'offer_extended',
        changedBy: senderId,
        changeType: 'automatic',
        triggerSource: 'chat_message',
        notes: 'Offer detected in message',
        sendChatNotification: false 
      });
    }

    // Rejection keywords
    if (senderType === 'recruiter' && (
      lowerContent.includes('unfortunately') ||
      lowerContent.includes('not moving forward') ||
      lowerContent.includes('decided not to') ||
      lowerContent.includes('other candidates')
    )) {
      await this.updateApplicationStatus({
        applicationId,
        newStatus: 'rejected',
        changedBy: senderId,
        changeType: 'automatic',
        triggerSource: 'chat_message',
        notes: 'Rejection detected in message',
        sendChatNotification: false
      });
    }

    // Offer acceptance
    if (senderType === 'candidate' && (
      lowerContent.includes('accept the offer') ||
      lowerContent.includes('i accept') ||
      lowerContent.includes("i'd like to accept")
    )) {
      await this.updateApplicationStatus({
        applicationId,
        newStatus: 'offer_accepted',
        changedBy: senderId,
        changeType: 'automatic',
        triggerSource: 'chat_message',
        notes: 'Acceptance detected in message',
        sendChatNotification: true
      });
    }
  }

  /**
   * Get status history for application
   */
  async getStatusHistory(applicationId: string) {
    const { data, error } = await supabase
      .from('application_status_history')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    return data || [];
  }

  /**
   * Get display info for status
   */
  getStatusDisplayInfo(status: ApplicationStatus) {
    const displayMap: Record<ApplicationStatus, { label: string, color: string, icon: string, bgColor: string, textColor: string }> = {
      applied: { label: 'Applied', color: 'gray', icon: '📝', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
      reviewing: { label: 'Under Review', color: 'blue', icon: '👀', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      phone_screen_scheduled: { label: 'Screen Scheduled', color: 'purple', icon: '📅', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      phone_screen_completed: { label: 'Screen Done', color: 'green', icon: '✅', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      technical_scheduled: { label: 'Tech Scheduled', color: 'purple', icon: '💻', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      technical_completed: { label: 'Tech Done', color: 'green', icon: '✅', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      final_round_scheduled: { label: 'Final Scheduled', color: 'purple', icon: '🤝', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
      final_round_completed: { label: 'Final Done', color: 'green', icon: '✅', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      offer_extended: { label: 'Offer Extended', color: 'yellow', icon: '🎉', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      offer_accepted: { label: 'Offer Accepted', color: 'green', icon: '🎊', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      hired: { label: 'Hired', color: 'green', icon: '🚀', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800' },
      rejected: { label: 'Not Selected', color: 'red', icon: '❌', bgColor: 'bg-red-50', textColor: 'text-red-700' },
      withdrawn: { label: 'Withdrawn', color: 'gray', icon: '↩️', bgColor: 'bg-gray-100', textColor: 'text-gray-600' }
    };

    return displayMap[status] || displayMap.applied;
  }
}

export const atsService = new ATSService();
