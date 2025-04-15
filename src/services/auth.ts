
import { supabase, supabaseConfig } from '@/lib/supabase';
import { completeReferral } from '@/services/referralService';
import { logSecurityEvent, validateEmail, validateSafeString } from '@/services/securityService';

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
  // Validate inputs before proceeding
  if (!validateEmail(email)) {
    return {
      success: false,
      error: {
        message: 'Invalid email format',
      },
    };
  }

  if (!password || password.length < 8) {
    return {
      success: false,
      error: {
        message: 'Password must be at least 8 characters long',
      },
    };
  }

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
    // Add rate limiting for signup attempts from the same IP
    const signupAttemptKey = `signup_attempt_${email}`;
    const signupAttempts = localStorage.getItem(signupAttemptKey);
    const MAX_SIGNUP_ATTEMPTS = 5;
    
    if (signupAttempts) {
      const attempts = JSON.parse(signupAttempts);
      if (attempts.count >= MAX_SIGNUP_ATTEMPTS && attempts.timestamp > Date.now() - (15 * 60 * 1000)) {
        // Too many attempts within 15 minutes
        return {
          success: false,
          error: {
            message: 'Too many signup attempts. Please try again later.',
          },
        };
      }

      // Update attempt count
      localStorage.setItem(signupAttemptKey, JSON.stringify({
        count: attempts.count + 1,
        timestamp: Date.now(),
      }));
    } else {
      // First attempt
      localStorage.setItem(signupAttemptKey, JSON.stringify({
        count: 1,
        timestamp: Date.now(),
      }));
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      await logSecurityEvent('signup_failed', { 
        reason: error.message,
        email_domain: email.split('@')[1] // Only log the email domain for privacy
      });
      
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
          await logSecurityEvent('user_profile_creation_failed', { 
            user_id: data.user.id,
            reason: profileError.message
          });
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
            await logSecurityEvent('referral_processing_failed', { 
              user_id: data.user.id,
              referrer_id: referrerInfo.id,
              reason: referralError instanceof Error ? referralError.message : 'Unknown error'
            });
            // We don't want to fail the signup if referral processing fails
          }
        }
      } catch (profileError) {
        console.error('Error setting up user profile:', profileError);
        await logSecurityEvent('user_profile_setup_failed', { 
          user_id: data.user.id,
          reason: profileError instanceof Error ? profileError.message : 'Unknown error'
        });
      }
    }

    // Log successful signup
    await logSecurityEvent('signup_success', { 
      user_id: data.user?.id,
      email_domain: email.split('@')[1] // Only log the email domain for privacy
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    await logSecurityEvent('signup_error', { 
      reason: error instanceof Error ? error.message : 'Unknown error',
      email_domain: email.split('@')[1] // Only log the email domain for privacy
    });
    
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
  // Validate inputs before proceeding
  if (!validateEmail(email)) {
    return {
      success: false,
      error: {
        message: 'Invalid email format',
      },
    };
  }

  if (!password || password.length < 1) {
    return {
      success: false,
      error: {
        message: 'Password cannot be empty',
      },
    };
  }

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
    // Add rate limiting for login attempts
    const loginAttemptKey = `login_attempt_${email}`;
    const loginAttempts = localStorage.getItem(loginAttemptKey);
    const MAX_LOGIN_ATTEMPTS = 5;
    
    if (loginAttempts) {
      const attempts = JSON.parse(loginAttempts);
      if (attempts.count >= MAX_LOGIN_ATTEMPTS && attempts.timestamp > Date.now() - (15 * 60 * 1000)) {
        // Too many attempts within 15 minutes
        return {
          success: false,
          error: {
            message: 'Too many login attempts. Please try again later.',
          },
        };
      }

      // Update attempt count
      localStorage.setItem(loginAttemptKey, JSON.stringify({
        count: attempts.count + 1,
        timestamp: Date.now(),
      }));
    } else {
      // First attempt
      localStorage.setItem(loginAttemptKey, JSON.stringify({
        count: 1,
        timestamp: Date.now(),
      }));
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      await logSecurityEvent('signin_failed', { 
        reason: error.message,
        email_domain: email.split('@')[1] // Only log the email domain for privacy
      });
      
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }

    // Reset login attempts on successful login
    localStorage.removeItem(loginAttemptKey);

    // Log successful login
    await logSecurityEvent('signin_success', { 
      user_id: data.user?.id,
      email_domain: email.split('@')[1] // Only log the email domain for privacy
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    await logSecurityEvent('signin_error', { 
      reason: error instanceof Error ? error.message : 'Unknown error',
      email_domain: email.split('@')[1] // Only log the email domain for privacy
    });
    
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
    // Get user before signing out to log the event
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    const { error } = await supabase.auth.signOut();

    if (error) {
      await logSecurityEvent('signout_failed', { 
        user_id: userId,
        reason: error.message
      });
      
      return {
        success: false,
        error: {
          message: error.message,
        },
      };
    }

    // Clear any sensitive data from local storage
    localStorage.removeItem('supabase.auth.token');
    
    // Log successful signout
    if (userId) {
      await logSecurityEvent('signout_success', { user_id: userId });
    }

    return {
      success: true,
    };
  } catch (error) {
    // Try to get user ID if possible
    let userId: string | undefined;
    try {
      const { data } = await supabase.auth.getUser();
      userId = data.user?.id;
    } catch {
      // Ignore errors when trying to get user ID
    }
    
    await logSecurityEvent('signout_error', { 
      user_id: userId,
      reason: error instanceof Error ? error.message : 'Unknown error'
    });
    
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
