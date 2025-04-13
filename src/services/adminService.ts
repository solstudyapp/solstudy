
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

/**
 * AdminService provides a collection of admin-level operations
 * for managing users and system configuration
 */

interface AdminResponse {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Reset a user's password by admin
 * @param userId The user ID to reset password for
 * @param newPassword The new password to set
 */
export async function resetUserPassword(userId: string, newPassword: string): Promise<AdminResponse> {
  try {
    // Check if password meets requirements
    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long'
      };
    }

    // Get the current session for the auth header
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return {
        success: false,
        error: 'You must be logged in to perform this action'
      };
    }

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('admin-reset-password', {
      body: { userId, newPassword }
    });
    
    // Handle network errors
    if (error) {
      console.error('Error calling admin-reset-password function:', error);
      return {
        success: false,
        error: 'Failed to connect to the password reset service'
      };
    }
    
    // The function might return { success: false, error: '...' }
    if (!data || data.success === false) {
      console.error('Edge function returned error:', data?.error);
      return {
        success: false,
        error: data?.error || 'Password reset failed'
      };
    }
    
    // If we got here, the reset was successful
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error resetting user password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Get a list of all users (admin only)
 */
export async function getAllUsers(): Promise<AdminResponse> {
  try {
    // Verify admin status before proceeding
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }
    
    // Check if user is an admin
    const { data: adminData, error: adminCheckError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (adminCheckError || !adminData) {
      return {
        success: false,
        error: 'You do not have admin privileges'
      };
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Grant admin privileges to a user
 * @param userId The user ID to grant admin privileges to
 */
export async function grantAdminPrivileges(userId: string): Promise<AdminResponse> {
  try {
    // Call the secure database function to grant admin privileges
    const { data, error } = await supabase.rpc(
      'grant_admin_privileges',
      { target_user_id: userId }
    );

    if (error) {
      console.error('Error granting admin privileges:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error granting admin privileges:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Revoke admin privileges from a user
 * @param userId The user ID to revoke admin privileges from
 */
export async function revokeAdminPrivileges(userId: string): Promise<AdminResponse> {
  try {
    // Call the secure database function to revoke admin privileges
    const { data, error } = await supabase.rpc(
      'revoke_admin_privileges',
      { target_user_id: userId }
    );

    if (error) {
      console.error('Error revoking admin privileges:', error);
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error revoking admin privileges:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
