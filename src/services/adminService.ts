
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
    // This operation requires admin privileges through RLS policies
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

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
    // First check if the user is already an admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingAdmin) {
      return {
        success: false,
        error: 'User already has admin privileges'
      };
    }

    // Add the user to the admins table
    const { data, error } = await supabase
      .from('admins')
      .insert([{ user_id: userId }]);

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
    const { data, error } = await supabase
      .from('admins')
      .delete()
      .eq('user_id', userId);

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
    console.error('Error revoking admin privileges:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
