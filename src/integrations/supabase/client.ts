
// Import the Supabase client from the SDK
import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your deployment environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
