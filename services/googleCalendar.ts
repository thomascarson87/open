
import { supabase } from './supabaseClient';

interface GoogleAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: string[]; // email addresses
}

class GoogleCalendarService {
  // Client ID is safe to expose in frontend (it's public). Secret is now server-side only.
  private clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  private redirectUri = `${window.location.origin}/auth/google/callback`;
  
  /**
   * Step 1: Initiate OAuth flow
   */
  initiateAuth() {
    if (!this.clientId) {
      console.error('Google Client ID not found. Please set VITE_GOOGLE_CLIENT_ID.');
      alert('Google Client ID is missing configuration.');
      return;
    }

    const scope = encodeURIComponent(
      'https://www.googleapis.com/auth/calendar ' +
      'https://www.googleapis.com/auth/calendar.events'
    );
    
    const authUrl = 
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `include_granted_scopes=true&` +
      `prompt=consent`;
    
    window.location.href = authUrl;
  }
  
  /**
   * Step 2: Exchange code for tokens via server-side edge function
   * The client secret is kept server-side only for security.
   */
  async handleCallback(code: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('google-calendar-token-exchange', {
      body: { code, redirect_uri: this.redirectUri }
    });

    if (error) {
      console.error('Token exchange error:', error);
      throw new Error('Failed to exchange code for tokens');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Token exchange failed');
    }
  }

  /**
   * Step 3: Store tokens - now handled server-side by the edge function.
   * This method is kept for API compatibility but is a no-op.
   */
  async storeTokens(_userId: string, _tokens: any) {
    // Tokens are now stored by the edge function during handleCallback
  }
  
  /**
   * Get valid access token (refresh if expired)
   */
  async getAccessToken(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      throw new Error('Not connected to Google Calendar');
    }
    
    // Check if token is expired (buffer of 5 minutes)
    const expiresAt = new Date(data.expires_at);
    if (expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
      return data.access_token; // Still valid
    }
    
    // Refresh token via server-side edge function (keeps client_secret secure)
    const { data: refreshData, error: refreshError } = await supabase.functions.invoke('google-calendar-refresh-token', {
      body: {}
    });

    if (refreshError || !refreshData?.access_token) {
      throw new Error('Failed to refresh token');
    }

    return refreshData.access_token;
  }
  
  /**
   * Create event in Google Calendar
   */
  async createEvent(userId: string, event: CalendarEventInput): Promise<string> {
    const accessToken = await this.getAccessToken(userId);
    
    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: event.attendees?.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };
    
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create Google Calendar event');
    }
    
    const created = await response.json();
    return created.id;
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteEvent(userId: string, googleEventId: string): Promise<void> {
    try {
        const accessToken = await this.getAccessToken(userId);
        await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${googleEventId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );
    } catch (e) {
        console.warn('Failed to delete Google Calendar event', e);
    }
  }
  
  /**
   * Get Google Meet link from event
   */
  async getMeetLink(userId: string, eventId: string): Promise<string | null> {
    const accessToken = await this.getAccessToken(userId);
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    if (!response.ok) return null;
    
    const event = await response.json();
    return event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null;
  }
  
  /**
   * Disconnect Google Calendar
   */
  async disconnect(userId: string) {
    const { error } = await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  }
}

export const googleCalendar = new GoogleCalendarService();
