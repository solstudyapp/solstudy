import { supabase, supabaseConfig } from '@/lib/supabase';
import { completeReferral } from '@/services/referralService';

export type AuthError = {
  message: string;
};

export type AuthResponse = {
  success: boolean;
  error?: AuthError;
  data?: any;
};

// Mock user for offline mode
const OFFLINE_USER = {
  id: 'offline-user-id',
  email: 'offline@example.com',
  user_metadata: {
    name: 'Offline User'
  }
};

/**
 * Sign up a new user with email and password
 * @param email User's email
 * @param password User's password
 * @param referrerInfo Optional referrer information for referral tracking
 */
export async function signUp(
  email: string, 
  password: string, 
  referrerInfo?: { id: string; code: string } | null
): Promise<AuthResponse> {
  // If in offline mode, return a mock successful response
  if (supabaseConfig.isOfflineMode) {
    console.info("Running in offline mode. Sign-up operation simulated.");
    return {
      success: true,
      data: {
        user: { ...OFFLINE_USER, email },
        session: { user: { ...OFFLINE_USER, email } }
      }
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }

    // If the user was created successfully, add initial points
    if (data.user) {
      try {
        // Add initial points to the user's profile (100 points for signing up)
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            points: 100,
            is_active: true,
            last_activity: new Date().toISOString(),
          })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        // If we have referrer info, process the referral
        if (referrerInfo) {
          try {
            // Process the referral
            await completeReferral(
              referrerInfo.code,
              data.user.id,
              100 // Default points earned
            );
          } catch (referralError) {
            console.error('Error processing referral:', referralError);
            // We don't want to fail the signup if referral processing fails
          }
        }
      } catch (profileError) {
        console.error('Error setting up user profile:', profileError);
      }
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  // If in offline mode, return a mock successful response
  if (supabaseConfig.isOfflineMode) {
    console.info("Running in offline mode. Sign-in operation simulated.");
    return {
      success: true,
      data: {
        user: { ...OFFLINE_USER, email },
        session: { user: { ...OFFLINE_USER, email } }
      }
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  // If in offline mode, return a mock successful response
  if (supabaseConfig.isOfflineMode) {
    console.info("Running in offline mode. Sign-out operation simulated.");
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentSession() {
  if (supabaseConfig.isOfflineMode) {
    return { session: { user: OFFLINE_USER } };
  }
  
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  if (supabaseConfig.isOfflineMode) {
    return OFFLINE_USER;
  }
  
  const { data } = await supabase.auth.getUser();
  return data.user;
}
