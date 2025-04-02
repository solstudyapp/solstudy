
// Import the Supabase client from the SDK
import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your deployment environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we have valid Supabase credentials
const hasValidCredentials = 
  supabaseUrl !== 'https://example.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key';

// Export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a utility function to check if we can connect to Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!hasValidCredentials) {
    console.warn('Missing Supabase credentials. Using offline mode.');
    return false;
  }

  try {
    // Simple health check - ping auth to see if we get a response
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

// Export connection state
export const supabaseConfig = {
  hasValidCredentials,
  isOfflineMode: !hasValidCredentials
};
