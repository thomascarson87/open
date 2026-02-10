
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psjjcdxtjbdpopfbppkh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzampjZHh0amJkcG9wZmJwcGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDI4NTEsImV4cCI6MjA3OTgxODg1MX0.IVlKtwSffiCtZhhABD_ev8RemlQ45WBWED_axj9Wcs4';

// In dev mode, use service role key to bypass RLS (mock tokens can't authenticate)
const isDevMode = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const devServiceRoleKey = (typeof process !== 'undefined' && (process.env as any).VITE_SUPABASE_SERVICE_ROLE_KEY) || '';

const effectiveKey = (isDevMode && devServiceRoleKey) ? devServiceRoleKey : supabaseAnonKey;

export const supabase = createClient(supabaseUrl, effectiveKey, {
  auth: {
    // When using service role key in dev, disable session persistence
    // since we manage sessions manually via AuthContext
    ...(isDevMode && devServiceRoleKey ? {
      autoRefreshToken: false,
      persistSession: false,
    } : {}),
  },
});
