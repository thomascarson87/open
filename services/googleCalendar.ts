
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
  // Using import.meta.env for Vite compatibility, casting to any to avoid TS errors if types are missing
  private clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  private clientSecret = (import.meta as any).env?.VITE_GOOGLE_CLIENT_SECRET || '';
  // Update to point to the new specific callback route
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
   * Step 2: Exchange code for tokens
   */
  async handleCallback(code: string): Promise<GoogleAuthResponse> {
    if (!this.clientSecret) {
      throw new Error('Google Client Secret not configured.');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    if (!response.ok) {
      const err = await response.json();
      console.error('Token exchange error:', err);
      throw new Error('Failed to exchange code for tokens');
    }
    
    return response.json();
  }
  
  /**
   * Step 3: Store tokens in Supabase
   */
  async storeTokens(userId: string, tokens: GoogleAuthResponse) {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    
    const { error } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
        scope: tokens.scope,
        token_type: tokens.token_type,
        last_sync_at: new Date().toISOString()
      });
    
    if (error) throw error;
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
    
    // Refresh token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: data.refresh_token,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token'
      })
    });
    
    if (!response.ok) {
      // If refresh fails, they might need to re-auth
      throw new Error('Failed to refresh token');
    }
    
    const newTokens = await response.json();
    const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);
    
    // Update stored token
    await supabase
      .from('google_calendar_tokens')
      .update({
        access_token: newTokens.access_token,
        expires_at: newExpiresAt.toISOString()
      })
      .eq('user_id', userId);
    
    return newTokens.access_token;
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
