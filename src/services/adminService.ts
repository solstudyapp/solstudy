
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

    // Instead of using Supabase's admin API directly, we'll call our Edge Function
    // which will verify admin status and then use service role key to reset the password
    const { data, error } = await supabase.functions.invoke('admin-reset-password', {
      body: { userId, newPassword }
    });

    if (error) {
      console.error('Error calling admin-reset-password function:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Edge function returns a standardized response
    if (data.error) {
      return {
        success: false,
        error: data.error
      };
    }

    return {
      success: true,
      data: data
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
    // Verify that the current user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }
    
    // Check if current user is an admin
    const { data: adminData, error: adminCheckError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (adminCheckError || !adminData) {
      return {
        success: false,
        error: 'You do not have admin privileges to perform this action'
      };
    }
    
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
    // Verify that the current user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }
    
    // Check if current user is an admin
    const { data: adminData, error: adminCheckError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    if (adminCheckError || !adminData) {
      return {
        success: false,
        error: 'You do not have admin privileges to perform this action'
      };
    }
    
    // Prevent users from removing their own admin privileges
    if (userId === user.id) {
      return {
        success: false,
        error: 'You cannot remove your own admin privileges'
      };
    }

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
