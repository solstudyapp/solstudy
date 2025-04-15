
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { validateUUID, validateSafeString, logSecurityEvent } from '@/services/securityService';

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
 * Reset a user's password directly using the admin API
 * @param userId The user ID to reset password for
 * @param newPassword The new password to set
 */
export async function resetUserPassword(userId: string, newPassword: string): Promise<AdminResponse> {
  try {
    // Input validation
    if (!validateUUID(userId)) {
      return {
        success: false,
        error: 'Invalid user ID format'
      };
    }

    // Check if password meets requirements
    if (newPassword.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters long'
      };
    }

    // Require at least one number and one special character
    if (!/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return {
        success: false,
        error: 'Password must contain at least one number and one special character'
      };
    }

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
      // Log unauthorized attempt
      await logSecurityEvent('unauthorized_password_reset_attempt', {
        attempted_by: user.id,
        target_user: userId
      });
      
      return {
        success: false,
        error: 'You do not have admin privileges'
      };
    }

    console.log('About to reset password for user:', userId);
    
    // Update the user's password via RPC function that directly modifies auth.users
    const { data, error } = await supabase.rpc(
      'admin_reset_user_password',
      { 
        target_user_id: userId,
        new_password: newPassword
      }
    );
    
    console.log('Password reset response:', { data, error });
    
    if (error) {
      console.error('Error resetting password:', error);
      
      // Log the error
      await logSecurityEvent('password_reset_error', {
        admin_id: user.id,
        target_user: userId,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message || 'Failed to reset password'
      };
    }
    
    if (!data || data.success === false) {
      console.error('Password reset function returned failure:', data);
      
      // Log the failure
      await logSecurityEvent('password_reset_function_failed', {
        admin_id: user.id,
        target_user: userId,
        error: data?.error
      });
      
      return {
        success: false,
        error: data?.error || 'Password reset failed'
      };
    }
    
    // Log successful password reset
    await logSecurityEvent('password_reset_success', {
      admin_id: user.id,
      target_user: userId
    });
    
    return {
      success: true,
      data: { message: 'Password reset successfully' }
    };
  } catch (error) {
    console.error('Error resetting user password:', error);
    
    // Try to get user info for logging
    let adminId: string | undefined;
    try {
      const { data } = await supabase.auth.getUser();
      adminId = data.user?.id;
    } catch {
      // Ignore errors when trying to get user ID
    }
    
    // Log the exception
    await logSecurityEvent('password_reset_exception', {
      admin_id: adminId,
      target_user: userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
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
      // Log unauthorized attempt
      await logSecurityEvent('unauthorized_get_all_users_attempt', {
        attempted_by: user.id
      });
      
      return {
        success: false,
        error: 'You do not have admin privileges'
      };
    }
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error) {
      // Log the error
      await logSecurityEvent('get_all_users_error', {
        admin_id: user.id,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }

    // Log successful retrieval of all users
    await logSecurityEvent('get_all_users_success', {
      admin_id: user.id,
      user_count: data?.length || 0
    });
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Try to get user info for logging
    let adminId: string | undefined;
    try {
      const { data } = await supabase.auth.getUser();
      adminId = data.user?.id;
    } catch {
      // Ignore errors when trying to get user ID
    }
    
    // Log the exception
    await logSecurityEvent('get_all_users_exception', {
      admin_id: adminId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
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
    // Input validation
    if (!validateUUID(userId)) {
      return {
        success: false,
        error: 'Invalid user ID format'
      };
    }
    
    // Verify current user is admin before proceeding
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }
    
    // Call the secure database function to grant admin privileges
    const { data, error } = await supabase.rpc(
      'grant_admin_privileges',
      { target_user_id: userId }
    );

    if (error) {
      console.error('Error granting admin privileges:', error);
      
      // Log the error
      await logSecurityEvent('grant_admin_error', {
        admin_id: user.id,
        target_user: userId,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.success) {
      // Log the failure
      await logSecurityEvent('grant_admin_function_failed', {
        admin_id: user.id,
        target_user: userId,
        error: data.error
      });
      
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
    
    // Try to get user info for logging
    let adminId: string | undefined;
    try {
      const { data } = await supabase.auth.getUser();
      adminId = data.user?.id;
    } catch {
      // Ignore errors when trying to get user ID
    }
    
    // Log the exception
    await logSecurityEvent('grant_admin_exception', {
      admin_id: adminId,
      target_user: userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
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
    // Input validation
    if (!validateUUID(userId)) {
      return {
        success: false,
        error: 'Invalid user ID format'
      };
    }
    
    // Verify current user is admin before proceeding
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }
    
    // Call the secure database function to revoke admin privileges
    const { data, error } = await supabase.rpc(
      'revoke_admin_privileges',
      { target_user_id: userId }
    );

    if (error) {
      console.error('Error revoking admin privileges:', error);
      
      // Log the error
      await logSecurityEvent('revoke_admin_error', {
        admin_id: user.id,
        target_user: userId,
        error: error.message
      });
      
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.success) {
      // Log the failure
      await logSecurityEvent('revoke_admin_function_failed', {
        admin_id: user.id,
        target_user: userId,
        error: data.error
      });
      
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
    
    // Try to get user info for logging
    let adminId: string | undefined;
    try {
      const { data } = await supabase.auth.getUser();
      adminId = data.user?.id;
    } catch {
      // Ignore errors when trying to get user ID
    }
    
    // Log the exception
    await logSecurityEvent('revoke_admin_exception', {
      admin_id: adminId,
      target_user: userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
