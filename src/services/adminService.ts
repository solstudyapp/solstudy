
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

/**
 * Reset a user's password using the Supabase Admin API
 * This requires admin privileges
 */
export async function resetUserPassword(userId: string, newPassword: string) {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: {
          message: error.message || 'Failed to reset password',
        },
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Unexpected error during password reset:', error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      },
    };
  }
}

/**
 * Reset password for specific user (one-off operation)
 * This is used for emergency password resets
 */
export async function resetSpecificUserPassword() {
  const userId = '9a393c0a-7671-4c68-913a-6cb644112cc3';
  const tempPassword = 'rugsSuckD!cK420';
  
  const result = await resetUserPassword(userId, tempPassword);
  
  if (result.success) {
    console.log('Password reset successful for user ID:', userId);
    toast({
      title: 'Password Reset Successful',
      description: 'The user password has been reset',
    });
    return true;
  } else {
    console.error('Password reset failed:', result.error);
    toast({
      title: 'Password Reset Failed',
      description: result.error?.message || 'An error occurred',
      variant: 'destructive',
    });
    return false;
  }
}
