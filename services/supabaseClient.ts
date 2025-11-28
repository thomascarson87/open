
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psjjcdxtjbdpopfbppkh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzampjZHh0amJkcG9wZmJwcGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDI4NTEsImV4cCI6MjA3OTgxODg1MX0.IVlKtwSffiCtZhhABD_ev8RemlQ45WBWED_axj9Wcs4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
