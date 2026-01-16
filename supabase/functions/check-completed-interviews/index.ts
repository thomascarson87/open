declare const Deno: any;

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Find events that ended in the last hour and haven't been marked complete
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { data: completedEvents } = await supabase
    .from('calendar_events')
    .select('*, application:applications(id, status)')
    .gte('end_time', oneHourAgo)
    .lte('end_time', now)
    .eq('status', 'pending');

  for (const event of completedEvents || []) {
    if (!event.application_id || !event.application) continue;

    const app = event.application;
    
    // Determine new status based on current status
    let newStatus = '';
    if (app.status === 'phone_screen_scheduled') {
      newStatus = 'phone_screen_completed';
    } else if (app.status === 'technical_scheduled') {
      newStatus = 'technical_completed';
    } else if (app.status === 'final_round_scheduled') {
      newStatus = 'final_round_completed';
    }

    if (newStatus) {
      // Update application status
      await supabase
        .from('applications')
        .update({ status: newStatus, status_updated_at: new Date().toISOString() })
        .eq('id', event.application_id);

      // Create history record
      await supabase
        .from('application_status_history')
        .insert({
          application_id: event.application_id,
          old_status: app.status,
          new_status: newStatus,
          change_type: 'automatic',
          trigger_source: 'event_time_passed',
          trigger_id: event.id,
          notes: 'Interview completed (Auto-detected)'
        });

      // Mark event as completed
      await supabase
        .from('calendar_events')
        .update({ status: 'completed' })
        .eq('id', event.id);
        
       // System message logic would go here if Edge Function had access to MessageService logic or inserted directly
    }
  }

  return new Response(JSON.stringify({ success: true, processed: completedEvents?.length || 0 }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
