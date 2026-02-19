
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
      .select('status, candidate_id')
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
      .update({ status: newStatus })
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
      // Fetch conversation separately (conversations.application_id references applications)
      const { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (conv?.id) {
        const statusInfo = this.getStatusDisplayInfo(newStatus);
        const message = `Application status updated: ${statusInfo.label}`;

        await messageService.sendSystemMessage(
          conv.id,
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

    // Guard: fetch current status to prevent invalid transitions
    const { data: app } = await supabase
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    if (!app) return;
    const currentStatus = app.status as ApplicationStatus;

    // Offer keywords — only trigger from interview/final round stages
    const offerEligibleStatuses: ApplicationStatus[] = [
      'technical_completed', 'final_round_scheduled', 'final_round_completed'
    ];
    if (senderType === 'recruiter' && offerEligibleStatuses.includes(currentStatus) && (
      lowerContent.includes('pleased to offer') ||
      lowerContent.includes('we would like to offer') ||
      lowerContent.includes('extend an offer') ||
      lowerContent.includes('formal offer')
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
      return; // Only one transition per message
    }

    // Rejection keywords — require specific multi-word phrases to avoid false positives
    // "unfortunately" alone is too broad; require it paired with rejection context
    const rejectionEligibleStatuses: ApplicationStatus[] = [
      'applied', 'reviewing', 'phone_screen_scheduled', 'phone_screen_completed',
      'technical_scheduled', 'technical_completed', 'final_round_scheduled', 'final_round_completed'
    ];
    if (senderType === 'recruiter' && rejectionEligibleStatuses.includes(currentStatus) && (
      lowerContent.includes('not moving forward') ||
      lowerContent.includes('decided not to proceed') ||
      lowerContent.includes('will not be moving forward') ||
      (lowerContent.includes('unfortunately') && (
        lowerContent.includes('not be moving') ||
        lowerContent.includes('not selected') ||
        lowerContent.includes('another candidate') ||
        lowerContent.includes('position has been filled')
      ))
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
      return;
    }

    // Offer acceptance — only when an offer is actually extended
    if (senderType === 'candidate' && currentStatus === 'offer_extended' && (
      lowerContent.includes('accept the offer') ||
      lowerContent.includes("i'd like to accept") ||
      lowerContent.includes('happy to accept')
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
      reviewing: { label: 'Under Review', color: 'blue', icon: '👀', bgColor: 'bg-accent-coral-bg', textColor: 'text-accent-coral' },
      phone_screen_scheduled: { label: 'Screen Scheduled', color: 'purple', icon: '📅', bgColor: 'bg-accent-green-bg', textColor: 'text-accent-green' },
      phone_screen_completed: { label: 'Screen Done', color: 'green', icon: '✅', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      technical_scheduled: { label: 'Tech Scheduled', color: 'purple', icon: '💻', bgColor: 'bg-accent-green-bg', textColor: 'text-accent-green' },
      technical_completed: { label: 'Tech Done', color: 'green', icon: '✅', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      final_round_scheduled: { label: 'Final Scheduled', color: 'purple', icon: '🤝', bgColor: 'bg-accent-green-bg', textColor: 'text-accent-green' },
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
