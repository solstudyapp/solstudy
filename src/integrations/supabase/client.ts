
// Import the Supabase client from the SDK
import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your deployment environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tjttolxfragmxliybdid.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqdHRvbHhmcmFnbXhsaXliZGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NDIxNjIsImV4cCI6MjA1NzIxODE2Mn0.aELFFzpcpCOfnvZIKBbeMc3MBw7osGAeEBc757q46Go';

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
