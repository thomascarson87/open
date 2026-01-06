import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationHubItem, ApplicationFilter, CalendarEvent, ApplicationStatusHistory } from '../types';

interface UseApplicationHubReturn {
  applications: ApplicationHubItem[];
  isLoading: boolean;
  error: string | null;
  filter: ApplicationFilter;
  setFilter: (filter: ApplicationFilter) => void;
  refetch: () => Promise<void>;
  counts: Record<ApplicationFilter, number>;
  allUpcomingEvents: CalendarEvent[];
}

export function useApplicationHub(): UseApplicationHubReturn {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationHubItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApplicationFilter>('all');

  const fetchApplications = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Fetch applications with joined job data
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs!inner (
            id,
            title,
            company_id,
            company_name,
            company_logo,
            location,
            salary_range,
            salary_min,
            salary_max,
            salary_currency,
            work_mode,
            seniority,
            description,
            impact_statement,
            responsibilities,
            tech_stack,
            values_list,
            perks
          )
        `)
        .eq('candidate_id', user.id)
        .order('updated_at', { ascending: false });

      if (appsError) throw appsError;
      if (!apps || apps.length === 0) {
        setApplications([]);
        setIsLoading(false);
        return;
      }

      // Step 2: Get conversation IDs for all applications
      const appIds = apps.map(a => a.id);
      let conversationMap = new Map<string, string>();
      
      try {
        const { data: conversations, error: convsError } = await supabase
          .from('conversations')
          .select('id, application_id')
          .in('application_id', appIds);

        if (!convsError && conversations) {
          conversationMap = new Map(
            conversations.map(c => [c.application_id, c.id])
          );
        }
      } catch (e) {
        console.warn('Step 2 (Conversations join) failed, likely missing column:', e);
      }

      // Step 3: Enrich each application with additional data
      const enrichedApps = await Promise.all(
        apps.map(async (app) => {
          const conversationId = conversationMap.get(app.id) || null;

          try {
            // Parallel fetch for performance, wrapped in individual try-catches to be resilient
            const [unreadResult, eventsResult, historyResult] = await Promise.all([
              // Unread message count
              conversationId
                ? supabase
                    .from('messages')
                    .select('id', { count: 'exact', head: true })
                    .eq('conversation_id', conversationId)
                    .eq('is_read', false)
                    .neq('sender_id', user.id)
                : Promise.resolve({ count: 0 }),

              // Upcoming events for this application
              supabase
                .from('calendar_events')
                .select('*')
                .eq('application_id', app.id)
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true })
                .limit(3),

              // Recent status history
              supabase
                .from('application_status_history')
                .select('*')
                .eq('application_id', app.id)
                .order('created_at', { ascending: false })
                .limit(5)
            ]);

            return {
              ...app,
              job: {
                ...app.job,
                // Only provide fallbacks for fields that might still be null
                company_logo: app.job.company_logo || null,
                salary_min: app.job.salary_min ?? null,
                salary_max: app.job.salary_max ?? null,
                salary_currency: app.job.salary_currency || 'USD',
                impact_statement: app.job.impact_statement || null,
                responsibilities: app.job.responsibilities || [],
                tech_stack: app.job.tech_stack || []
              },
              conversationId,
              unreadCount: (unreadResult as any).count || 0,
              upcomingEvents: (eventsResult as any).data || [] as CalendarEvent[],
              recentHistory: (historyResult as any).data || [] as ApplicationStatusHistory[]
            } as ApplicationHubItem;
          } catch (enrichError) {
            console.error(`Failed to enrich app ${app.id}:`, enrichError);
            return {
              ...app,
              job: app.job,
              conversationId: null,
              unreadCount: 0,
              upcomingEvents: [],
              recentHistory: []
            } as unknown as ApplicationHubItem;
          }
        })
      );

      setApplications(enrichedApps);
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error('Failed to fetch applications:', err);
      setError(`Failed to load applications: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const statusSubscription = supabase
      .channel('application-status-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'applications',
        filter: `candidate_id=eq.${user.id}`
      }, (payload) => {
        setApplications(prev =>
          prev.map(app =>
            app.id === payload.new.id
              ? { 
                  ...app, 
                  status: payload.new.status,
                  updated_at: payload.new.updated_at,
                  match_score: payload.new.match_score
                }
              : app
          )
        );
      })
      .subscribe();

    return () => {
      statusSubscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const messageSubscription = supabase
      .channel('new-messages-for-counts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMessage = payload.new as any;
        if (newMessage.sender_id === user.id) return;
        
        try {
          const { data: conversation } = await supabase
            .from('conversations')
            .select('application_id')
            .eq('id', newMessage.conversation_id)
            .single();
          
          if (conversation?.application_id) {
            setApplications(prev =>
              prev.map(app =>
                app.id === conversation.application_id
                  ? { ...app, unreadCount: app.unreadCount + 1 }
                  : app
              )
            );
          }
        } catch (e) {
          // Fail silently for unread count increment
        }
      })
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const eventSubscription = supabase
      .channel('calendar-event-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_events',
        filter: `candidate_id=eq.${user.id}`
      }, async () => {
        fetchApplications();
      })
      .subscribe();

    return () => {
      eventSubscription.unsubscribe();
    };
  }, [user, fetchApplications]);

  const getFilteredApplications = useCallback(() => {
    if (filter === 'all') return applications;

    return applications.filter(app => {
      const status = app.status;
      switch (filter) {
        case 'active':
          return ['applied', 'reviewing', 'phone_screen_scheduled', 'phone_screen_completed', 
                  'technical_scheduled', 'technical_completed', 'final_round_scheduled', 
                  'final_round_completed'].includes(status);
        case 'interviewing':
          return status.includes('_scheduled') || status.includes('_completed');
        case 'offers':
          return ['offer_extended', 'offer_accepted'].includes(status);
        case 'closed':
          return ['rejected', 'withdrawn', 'hired'].includes(status);
        default:
          return true;
      }
    });
  }, [applications, filter]);

  const counts: Record<ApplicationFilter, number> = {
    all: applications.length,
    active: applications.filter(a => 
      ['applied', 'reviewing', 'phone_screen_scheduled', 'phone_screen_completed',
       'technical_scheduled', 'technical_completed', 'final_round_scheduled',
       'final_round_completed'].includes(a.status)
    ).length,
    interviewing: applications.filter(a => 
      a.status.includes('_scheduled') || a.status.includes('_completed')
    ).length,
    offers: applications.filter(a => 
      ['offer_extended', 'offer_accepted'].includes(a.status)
    ).length,
    closed: applications.filter(a => 
      ['rejected', 'withdrawn', 'hired'].includes(a.status)
    ).length
  };

  const allUpcomingEvents = applications
    .flatMap(app => app.upcomingEvents)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return {
    applications: getFilteredApplications(),
    isLoading,
    error,
    filter,
    setFilter,
    refetch: fetchApplications,
    counts,
    allUpcomingEvents
  };
}
